"use client";

import { z } from "zod";
import { toast } from "sonner";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";
import {
  AUTO_TTS_LANGUAGE_VALUE,
  TTS_LANGUAGE_VALUES,
} from "../data/language-options";
import { TEXT_MAX_LENGTH } from "../data/constants";
import { useTTSVoices } from "../contexts/tts-voices-context";
import { useTTSAudio } from "../contexts/tts-audio-context";

const ttsFormSchema = z.object({
  text: z
    .string()
    .min(1, "Please enter some text")
    .max(TEXT_MAX_LENGTH, `Text must be ${TEXT_MAX_LENGTH} characters or less`),
  voiceId: z.string().min(1, "Please select a voice"),
  languageId: z.enum(TTS_LANGUAGE_VALUES),
  dictId: z.string().optional(),
  pace: z.number(),
  speechSampleRate: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  languageId: AUTO_TTS_LANGUAGE_VALUE,
  dictId: undefined,
  pace: 1.0,
  speechSampleRate: 22050,
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
  const { allVoices } = useTTSVoices();
  const { setAudioUrl, setIsGeneratingAudio } = useTTSAudio();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      const trimmedText = value.text.trim();
      const voice = allVoices.find((v) => v.id === value.voiceId);
      const speaker = voice?.r2ObjectKey ?? voice?.name?.toLowerCase() ?? "aditya";
      const languageCode =
        value.languageId === AUTO_TTS_LANGUAGE_VALUE
          ? (voice?.language ?? "hi-IN")
          : value.languageId;

      setIsGeneratingAudio(true);
      setAudioUrl(null);

      try {
        // Fast path: fetch audio directly and play immediately
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: trimmedText,
            speaker,
            languageCode,
            pace: value.pace,
            speechSampleRate: value.speechSampleRate,
            dictId: value.dictId,
          }),
        });

        if (!response.ok) {
          throw new Error(PROJECT_ISSUE_MESSAGE);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Background save for history — fire and forget
        const clientRequestId = crypto.randomUUID();
        createMutation
          .mutateAsync({
            text: trimmedText,
            voiceId: value.voiceId,
            languageId: value.languageId === AUTO_TTS_LANGUAGE_VALUE ? undefined : value.languageId,
            dictId: value.dictId,
            pace: value.pace,
            speechSampleRate: value.speechSampleRate,
            clientRequestId,
          })
          .then(() => {
            toast.success("Saved to history");
          })
          .catch(() => {
            // History save failed silently — audio already played
          });
      } catch {
        toast.error(PROJECT_ISSUE_MESSAGE);
      } finally {
        setIsGeneratingAudio(false);
      }
    },
  });

  return <form.AppForm>{children}</form.AppForm>;
}
