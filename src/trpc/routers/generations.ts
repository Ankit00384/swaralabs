import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { chatterbox } from "@/lib/chatterbox-client";
import { prisma } from "@/lib/db";
import { generateChunkedAudioBuffer } from "@/lib/generate-chunked-audio";
import { uploadAudio } from "@/lib/r2";
import {
  TEXT_MAX_LENGTH,
  TTS_LONG_PROMPT_THRESHOLD_CHARS,
} from "@/features/text-to-speech/data/constants";
import { createTRPCRouter, orgProcedure } from "../init";

const inFlightCreateByRequestKey = new Map<string, Promise<{ id: string }>>();

export const generationsRouter = createTRPCRouter({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const generation = await prisma.generation.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        omit: {
          orgId: true,
          r2ObjectKey: true,
        },
      });

      if (!generation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...generation,
        audioUrl: `/api/audio/${generation.id}`,
      };
    }),
  
  getAll: orgProcedure.query(async ({ ctx }) => {
    const generations = await prisma.generation.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      omit: {
        orgId: true,
        r2ObjectKey: true,
      },
    });

    return generations;
  }),

  create: orgProcedure
    .input(
      z.object({
        text: z.string().min(1).max(TEXT_MAX_LENGTH),
        voiceId: z.string().min(1),
        temperature: z.number().min(0).max(2).default(0.8),
        topP: z.number().min(0).max(1).default(0.95),
        topK: z.number().min(1).max(10000).default(1000),
        repetitionPenalty: z.number().min(1).max(2).default(1.2),
        clientRequestId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const requestKey = input.clientRequestId
        ? `${ctx.orgId}:${input.clientRequestId}`
        : null;

      if (requestKey) {
        const inFlight = inFlightCreateByRequestKey.get(requestKey);
        if (inFlight) {
          return inFlight;
        }
      }

      const runCreate = async () => {
      const voice = await prisma.voice.findUnique({
        where: {
          id: input.voiceId,
          OR: [
            { variant: "SYSTEM" },
            { variant: "CUSTOM", orgId: ctx.orgId, }
          ],
        },
        select: {
          id: true,
          name: true,
          r2ObjectKey: true,
        },
      });

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (!voice.r2ObjectKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

      Sentry.logger.info("Generation started", {
        orgId: ctx.orgId,
        voiceId: input.voiceId,
        textLength: input.text.length,
      });

      let buffer: Buffer;
      try {
        if (input.text.length > TTS_LONG_PROMPT_THRESHOLD_CHARS) {
          try {
            const chunked = await generateChunkedAudioBuffer({
              prompt: input.text,
              voiceKey: voice.r2ObjectKey,
              temperature: input.temperature,
              topP: input.topP,
              topK: input.topK,
              repetitionPenalty: input.repetitionPenalty,
            });
            buffer = chunked.buffer;
          } catch (chunkError) {
            // Safety fallback: if chunked generation fails (timeout, stitching mismatch, etc),
            // try a single full-prompt generation so user still gets output.
            Sentry.logger.warn("Chunked generation failed, falling back to single-pass", {
              orgId: ctx.orgId,
              voiceId: input.voiceId,
              textLength: input.text.length,
              error:
                chunkError instanceof Error
                  ? chunkError.message
                  : "Unknown chunk generation error",
            });

            const { data, error } = await chatterbox.POST("/generate", {
              body: {
                prompt: input.text,
                voice_key: voice.r2ObjectKey,
                temperature: input.temperature,
                top_p: input.topP,
                top_k: input.topK,
                repetition_penalty: input.repetitionPenalty,
                norm_loudness: true,
              },
              parseAs: "arrayBuffer",
            });

            if (error || !(data instanceof ArrayBuffer)) {
              throw new Error("Fallback single-pass generation failed");
            }

            buffer = Buffer.from(data);
          }
        } else {
          const { data, error } = await chatterbox.POST("/generate", {
            body: {
              prompt: input.text,
              voice_key: voice.r2ObjectKey,
              temperature: input.temperature,
              top_p: input.topP,
              top_k: input.topK,
              repetition_penalty: input.repetitionPenalty,
              norm_loudness: true,
            },
            parseAs: "arrayBuffer",
          });

          if (error || !(data instanceof ArrayBuffer)) {
            throw new Error("Failed to generate audio");
          }

          buffer = Buffer.from(data);
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Failed to generate audio: ${error.message}`
              : "Failed to generate audio",
        });
      }

      let generationId: string | null = null;
      let r2ObjectKey: string | null = null;

      try {
        const generation = await prisma.generation.create({
          data: {
            orgId: ctx.orgId,
            text: input.text,
            voiceName: voice.name,
            voiceId: voice.id,
            temperature: input.temperature,
            topP: input.topP,
            topK: input.topK,
            repetitionPenalty: input.repetitionPenalty,
          },
          select: {
            id: true,
          },
        });

        generationId = generation.id;
        r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}`;

        await uploadAudio({ buffer, key: r2ObjectKey });

        await prisma.generation.update({
          where: {
            id: generation.id,
          },
          data: {
            r2ObjectKey,
          },
        });

        Sentry.logger.info("Audio generated", {
          orgId: ctx.orgId,
          generationId: generation.id,
          r2ObjectKey,
        });
      } catch (error) {
        if (generationId) {
          await prisma.generation
            .delete({
              where: {
                id: generationId,
              },
            })
            .catch(() => {});
        }

        Sentry.logger.error("Generation failed", {
          orgId: ctx.orgId,
          voiceId: input.voiceId,
          error:
            error instanceof Error
              ? error.message
              : "Unknown upload/storage error",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      if (!generationId || !r2ObjectKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      return {
        id: generationId,
      };
      };

      if (!requestKey) {
        return runCreate();
      }

      const promise = runCreate().finally(() => {
        inFlightCreateByRequestKey.delete(requestKey);
      });
      inFlightCreateByRequestKey.set(requestKey, promise);
      return promise;
    }),
});