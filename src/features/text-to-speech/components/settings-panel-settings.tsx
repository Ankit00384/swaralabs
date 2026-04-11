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

export function SettingsPanelSettings() {
  const trpc = useTRPC();
  const form = useTypedAppFormContext(ttsFormOptions);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const dictionaryListQuery = useQuery({
    ...trpc.sarvam.listPronunciationDictionaries.queryOptions(),
    staleTime: 30_000,
  });

  const dictionaryOptions = dictionaryListQuery.data?.dictionaries ?? [];

  return (
    <div className="flex flex-1 flex-col p-4">
      <FieldGroup className="gap-6">
        <form.Field name="speechSampleRate">
          {(field) => (
            <Field className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FieldLabel className="text-sm font-medium">Audio Quality</FieldLabel>
                <HelpCircle className="size-3.5 text-muted-foreground" />
              </div>
              <Select
                value={field.state.value.toString()}
                onValueChange={(value) => field.handleChange(Number(value))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-10 w-full shadow-none">
                  <SelectValue placeholder="Select audio quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16000">Draft (16.0 kHz)</SelectItem>
                  <SelectItem value="22050">Standard (22.05 kHz)</SelectItem>
                  <SelectItem value="44100">High (44.1 kHz)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="pace">
          {(field) => (
            <Field className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-sm font-medium">Speed</FieldLabel>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {field.state.value.toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">0.5x</span>
                <Slider
                  value={[field.state.value]}
                  onValueChange={(value) => field.handleChange(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">2.0x</span>
              </div>
            </Field>
          )}
        </form.Field>

        <form.Field name="dictId">
          {(field) => (
            <Field className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FieldLabel className="text-sm font-medium">Pronunciation Dictionary</FieldLabel>
                <HelpCircle className="size-3.5 text-muted-foreground" />
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
                  <SelectTrigger className="h-10 flex-1 shadow-none">
                    <SelectValue
                      placeholder={
                        dictionaryListQuery.isLoading
                          ? "Loading dictionaries..."
                          : "Select dictionary"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DICTIONARY_VALUE}>None</SelectItem>
                    {dictionaryOptions.map((dictId) => (
                      <SelectItem key={dictId} value={dictId}>
                        {dictId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 px-4"
                  disabled
                >
                  Manage
                </Button>
              </div>

              {dictionaryListQuery.isError && (
                <p className="text-xs text-muted-foreground">
                  Could not load dictionaries from Sarvam. You can still generate audio without one.
                </p>
              )}
            </Field>
          )}
        </form.Field>
      </FieldGroup>
    </div>
  );
}