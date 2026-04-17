"use client";

import { useStore } from "@tanstack/react-form";

import { 
  VOICE_CATEGORY_LABELS
} from "@/features/voices/data/voice-categories";

import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";

import { useTTSVoices } from "../contexts/tts-voices-context";
import { ttsFormOptions } from "./text-to-speech-form";

export function VoiceSelector() {
  const { 
    systemVoices, 
    allVoices: voices
  } = useTTSVoices();

  const form = useTypedAppFormContext(ttsFormOptions);
  const voiceId = useStore(form.store, (s) => s.values.voiceId);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  const selectedVoice = voices.find((v) => v.id === voiceId);
  const hasMissingSelectedVoice = Boolean(voiceId) && !selectedVoice;
  const currentVoice = selectedVoice
    ? selectedVoice
    : hasMissingSelectedVoice
      ? {
        id: voiceId,
        name: "Unavailable voice",
        category: null as null,
      }
      : voices[0];

  return (
    <Field>
      <Select
        value={voiceId}
        onValueChange={(v) => form.setFieldValue("voiceId", v)}
        disabled={isSubmitting}
      >
        <SelectTrigger className="h-10 w-full rounded-full border-input/50 bg-background/50 hover:bg-accent/50 py-2.5 px-4 shadow-sm transition-colors text-sm font-medium gap-2">
          <SelectValue>
            {currentVoice && (
              <div className="flex items-center justify-center gap-2">
                <VoiceAvatar 
                  seed={currentVoice.id}
                  name={currentVoice.name}
                  className="size-5 shadow-sm"
                />
                <span className="truncate text-sm font-medium tracking-tight">
                  {currentVoice.name}
                  {currentVoice.category &&
                    ` - ${VOICE_CATEGORY_LABELS[currentVoice.category]}`
                  }
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-2xl max-h-75">
          {hasMissingSelectedVoice && currentVoice?.id && (
            <>
              <SelectGroup>
                <SelectLabel>Selected Voice</SelectLabel>
                <SelectItem value={currentVoice.id} className="rounded-xl">
                  <VoiceAvatar
                    seed={currentVoice.id}
                    name={currentVoice.name}
                  />
                  <span className="truncate text-sm font-medium">
                    {currentVoice.name}
                    {currentVoice.category &&
                      ` - ${VOICE_CATEGORY_LABELS[currentVoice.category]}`}
                  </span>
                </SelectItem>
              </SelectGroup>
              {(systemVoices.length > 0) && (
                <SelectSeparator />
              )}
            </>
          )}
          {systemVoices.length > 0 && (
            <SelectGroup>
              <SelectLabel>Built-in Voices</SelectLabel>
              {systemVoices.map((v) => {
                if (!v.id) return null;
                return (
                  <SelectItem key={v.id} value={v.id} className="rounded-xl">
                    <VoiceAvatar seed={v.id} name={v.name} />
                    <span className="truncate text-sm font-medium">
                      {v.name} - {VOICE_CATEGORY_LABELS[v.category]}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </Field>
  );
};