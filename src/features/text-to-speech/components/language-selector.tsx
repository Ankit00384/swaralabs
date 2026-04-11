"use client";

import { useStore } from "@tanstack/react-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { ttsFormOptions } from "./text-to-speech-form";
import { TTS_LANGUAGE_OPTIONS } from "../data/language-options";

export function LanguageSelector() {
  const form = useTypedAppFormContext(ttsFormOptions);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <form.Field name="languageId">
      {(field) => (
        <Field>
          <FieldLabel>Language override</FieldLabel>
          <Select
            value={field.state.value}
            onValueChange={(val) => field.handleChange(val as typeof field.state.value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full rounded-lg bg-white">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {TTS_LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Force language per prompt, or keep auto to use voice metadata plus
            script detection.
          </FieldDescription>
        </Field>
      )}
    </form.Field>
  );
}
