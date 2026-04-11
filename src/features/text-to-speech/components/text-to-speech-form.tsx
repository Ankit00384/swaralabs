"use client";

import { useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
import {
  AUTO_TTS_LANGUAGE_VALUE,
  TTS_LANGUAGE_VALUES,
} from "../data/language-options";
import { TEXT_MAX_LENGTH } from "../data/constants";

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
  const router = useRouter();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );

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
        const language_id =
          value.languageId === AUTO_TTS_LANGUAGE_VALUE
            ? undefined
            : value.languageId;
        const clientRequestId = crypto.randomUUID();

        const data = await createMutation.mutateAsync({
          text: trimmedText,
          voiceId: value.voiceId,
          languageId: language_id,
          dictId: value.dictId,
          pace: value.pace,
          speechSampleRate: value.speechSampleRate,
          clientRequestId,
        });

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