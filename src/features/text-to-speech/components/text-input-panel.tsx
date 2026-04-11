"use client";

import { Coins } from "lucide-react";
import { useStore } from "@tanstack/react-form";

import { HistoryDrawer } from "./history-drawer";
import { SettingsDrawer } from "./settings-drawer";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import {
  COST_PER_UNIT,
  TEXT_MAX_LENGTH,
} from "@/features/text-to-speech/data/constants";
import { ttsFormOptions } from "./text-to-speech-form";
import { GenerateButton } from "./generate-button";
import { PromptSuggestions } from "./prompt-suggestions";

import { TTS_LANGUAGE_OPTIONS } from "../data/language-options";
import { VoiceSelector } from "./voice-selector";

export function TextInputPanel() {
  const form = useTypedAppFormContext(ttsFormOptions);

  const text = useStore(form.store, (s) => s.values.text);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isValid = useStore(form.store, (s) => s.isValid);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-muted/10 p-4 lg:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 lg:gap-5">
        <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs">
          <div className="relative flex min-h-[160px] lg:min-h-[220px]">
            <form.Field name="text">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Start typing or paste your text here..."
                  className="flex-1 resize-none border-0 bg-transparent p-4 text-base leading-relaxed tracking-tight shadow-none wrap-break-word focus-visible:ring-0 lg:p-6"
                  maxLength={TEXT_MAX_LENGTH}
                  disabled={isSubmitting}
                />
              )}
            </form.Field>
          </div>

          {text.length === 0 && (
            <div className="hidden px-4 pb-4 lg:block lg:px-6">
              <PromptSuggestions
                onSelect={(prompt) => form.setFieldValue("text", prompt)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/40 px-4 py-3">
            <div className="w-[210px]">
              <form.Field name="languageId">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as typeof field.state.value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9 border-input bg-background shadow-none">
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
                )}
              </form.Field>
            </div>

            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <Badge
                  variant="outline"
                  className="hidden gap-1.5 border-dashed bg-background sm:inline-flex"
                >
                  <Coins className="size-3 text-chart-5" />
                  <span className="text-xs">
                    <span className="tabular-nums">
                      ${(text.length * COST_PER_UNIT).toFixed(4)}
                    </span>{" "}
                    estimated
                  </span>
                </Badge>
              )}
              <span className="text-xs tracking-tight text-muted-foreground">
                {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()} chars
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 lg:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <span className="text-sm font-medium">Voice style</span>
              <VoiceSelector />
            </div>

            <div className="space-y-2 lg:space-y-0">
              <div className="flex items-center gap-2 lg:hidden">
                <SettingsDrawer />
                <HistoryDrawer />
              </div>
              <div className="w-full lg:w-auto">
                <GenerateButton
                  className="w-full shadow-sm lg:w-48"
                  disabled={isSubmitting || !isValid}
                  isSubmitting={isSubmitting}
                  onSubmit={() => form.handleSubmit()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
