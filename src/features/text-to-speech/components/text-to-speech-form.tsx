"use client";

import { useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
import { useTTSChunkPlayback } from "../contexts/tts-chunk-playback-context";
import { useTTSVoices } from "../contexts/tts-voices-context";
import {
  TTS_CHUNK_SIZE_CHARS,
  TTS_LONG_PROMPT_THRESHOLD_CHARS,
  TTS_PREVIEW_MAX_CHUNKS,
} from "../data/constants";
import { splitPromptIntoCharChunks } from "../lib/split-prompt-into-char-chunks";

const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );

  const { startChunkPreview } = useTTSChunkPlayback();
  const { allVoices } = useTTSVoices();
  const isSubmittingRef = useRef(false);

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (isSubmittingRef.current) {
        return;
      }

      isSubmittingRef.current = true;

      try {
        const trimmedText = value.text.trim();
        const voice = allVoices.find((v) => v.id === value.voiceId);
        const voice_key = voice?.r2ObjectKey ?? null;
        const clientRequestId = crypto.randomUUID();

        let previewFinishedPromise: Promise<void> = Promise.resolve();

        // Kick off preview playback if the prompt is long.
        if (
          trimmedText.length > TTS_LONG_PROMPT_THRESHOLD_CHARS &&
          voice_key
        ) {
          const chunks = splitPromptIntoCharChunks(
            trimmedText,
            TTS_CHUNK_SIZE_CHARS,
          );
          const previewChunks = chunks.slice(0, TTS_PREVIEW_MAX_CHUNKS);

          if (previewChunks.length > 1) {
            // Fire-and-forget: start playing chunks while the final WAV is generated.
            previewFinishedPromise = startChunkPreview({
              chunks: previewChunks,
              voice_key,
              temperature: value.temperature,
              top_p: value.topP,
              top_k: value.topK,
              repetition_penalty: value.repetitionPenalty,
            });
          }
        }

        const finalDataPromise = createMutation.mutateAsync({
          text: trimmedText,
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repetitionPenalty: value.repetitionPenalty,
          clientRequestId,
        });

        // Keep preview running in background, but don't block final result navigation on it.
        void previewFinishedPromise.catch(() => {});
        const data = await finalDataPromise;

        toast.success("Audio generated successfully!");
        router.push(`/text-to-speech/${data.id}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";

        toast.error(message);
      } finally {
        isSubmittingRef.current = false;
      }
    },
  });

  return <form.AppForm>{children}</form.AppForm>;
};