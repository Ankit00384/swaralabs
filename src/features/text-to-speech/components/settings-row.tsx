"use client";

import { HelpCircle } from "lucide-react";
import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { useTRPC } from "@/trpc/client";

import { ttsFormOptions } from "@/features/text-to-speech/components/text-to-speech-form";

const NO_DICTIONARY_VALUE = "__none__";

export function SettingsRow() {
  const trpc = useTRPC();
  const form = useTypedAppFormContext(ttsFormOptions);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const dictionaryListQuery = useQuery({
    ...trpc.sarvam.listPronunciationDictionaries.queryOptions(),
    staleTime: 30_000,
  });

  const dictionaryOptions = dictionaryListQuery.data?.dictionaries ?? [];

  return (
    <div className="flex flex-1 flex-col py-4 w-full">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <form.Field name="speechSampleRate">
          {(field) => (
            <Field className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FieldLabel className="text-sm font-medium text-muted-foreground/80">Audio Quality</FieldLabel>
                </div>
              </div>
              <Select
                value={field.state.value.toString()}
                onValueChange={(value) => field.handleChange(Number(value))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-input/50 bg-white dark:bg-zinc-900 shadow-sm transition-colors text-sm font-medium px-4">
                  <SelectValue placeholder="Select audio quality" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="16000" className="rounded-xl">Draft (16.0 kHz)</SelectItem>
                  <SelectItem value="22050" className="rounded-xl">Standard (22.05 kHz)</SelectItem>
                  <SelectItem value="44100" className="rounded-xl">High (44.1 kHz)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="pace">
          {(field) => (
            <Field className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-sm font-medium text-muted-foreground/80">Speed</FieldLabel>
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {field.state.value.toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center gap-4 px-1">
                <Slider
                  value={[field.state.value]}
                  onValueChange={(value) => field.handleChange(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  disabled={isSubmitting}
                  className="flex-1 **:[[role=slider]]:h-5 **:[[role=slider]]:w-5 **:[[role=slider]]:border-zinc-200 **:[[role=slider]]:bg-white **:[[role=slider]]:shadow-md"
                />
              </div>
            </Field>
          )}
        </form.Field>

        <form.Field name="dictId">
          {(field) => (
            <Field className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FieldLabel className="text-sm font-medium text-muted-foreground/80">Pronunciation</FieldLabel>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={field.state.value ?? NO_DICTIONARY_VALUE}
                  onValueChange={(value) =>
                    field.handleChange(
                      value === NO_DICTIONARY_VALUE ? undefined : value,
                    )
                  }
                  disabled={isSubmitting || dictionaryListQuery.isLoading}
                >
                  <SelectTrigger className="h-12 flex-1 rounded-2xl border-input/50 bg-white dark:bg-zinc-900 shadow-sm transition-colors text-sm font-medium px-4">
                    <SelectValue
                      placeholder={
                        dictionaryListQuery.isLoading
                          ? "Loading..."
                          : "Select dictionary"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value={NO_DICTIONARY_VALUE} className="rounded-xl">None</SelectItem>
                    {dictionaryOptions.map((dictId) => (
                      <SelectItem key={dictId} value={dictId} className="rounded-xl">
                        {dictId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </Field>
          )}
        </form.Field>
      </FieldGroup>
    </div>
  );
}
