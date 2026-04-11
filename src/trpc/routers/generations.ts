import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { generateChunkedAudioBuffer } from "@/lib/generate-chunked-audio";
import { uploadAudio } from "@/lib/r2";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { createTRPCRouter, orgProcedure } from "../init";

const inFlightCreateByRequestKey = new Map<string, Promise<{ id: string }>>();

export const generationsRouter = createTRPCRouter({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const generation = await prisma.generation.findFirst({
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
        languageId: z.string().min(2).max(35).optional(),
        dictId: z.string().min(1).optional(),
        pace: z.number().min(0.5).max(2).default(1.0),
        speechSampleRate: z.number().default(22050),
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
          language: true,
          r2ObjectKey: true,
        },
      });

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      Sentry.logger.info("Generation started", {
        orgId: ctx.orgId,
        voiceId: input.voiceId,
        textLength: input.text.length,
      });

      let buffer: Buffer;
      try {
        const result = await generateChunkedAudioBuffer({
          prompt: input.text,
          voiceKey: voice.r2ObjectKey ?? undefined,
          voiceName: voice.name,
          voiceLanguage: voice.language,
          languageId: input.languageId,
          dictId: input.dictId,
          pace: input.pace,
          speechSampleRate: input.speechSampleRate,
          maxRetries: 2,
        });
        buffer = result.buffer;
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
            pace: input.pace,
            speechSampleRate: input.speechSampleRate,
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

        const storageErrorMessage =
          error instanceof Error
            ? error.message
            : "Unknown upload/storage error";

        const isR2ConfigError = storageErrorMessage.startsWith(
          "R2 storage is not configured",
        );

        Sentry.logger.error("Generation failed", {
          orgId: ctx.orgId,
          voiceId: input.voiceId,
          error: storageErrorMessage,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: isR2ConfigError
            ? storageErrorMessage
            : "Failed to store generated audio",
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