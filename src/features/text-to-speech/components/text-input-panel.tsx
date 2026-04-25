"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@tanstack/react-form";
import { toast } from "sonner";

import { HistoryDrawer } from "./history-drawer";
import { SettingsDrawer } from "./settings-drawer";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";
import { Settings, History, Loader2 } from "lucide-react";

import {
  TEXT_MAX_LENGTH,
} from "@/features/text-to-speech/data/constants";
import { ttsFormOptions } from "./text-to-speech-form";
import { useTTSAudio } from "../contexts/tts-audio-context";
import { GenerateButton } from "./generate-button";
import { PromptSuggestions } from "./prompt-suggestions";

import {
  AUTO_TTS_LANGUAGE_VALUE,
  TTS_LANGUAGE_OPTIONS,
  type TTSLanguageValue,
} from "../data/language-options";
import { VoiceSelector } from "./voice-selector";
import { SettingsRow } from "./settings-row";
import { SettingsPanelHistory } from "./settings-panel-history";

type TranslateResponse = {
  translated_text?: string;
  source_language_code?: string | null;
  error?: string;
};

export function TextInputPanel() {
  const form = useTypedAppFormContext(ttsFormOptions);

  const text = useStore(form.store, (s) => s.values.text);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isValid = useStore(form.store, (s) => s.isValid);
  const { audioUrl, isGeneratingAudio } = useTTSAudio();
  const [isTranslatingLanguage, setIsTranslatingLanguage] = useState(false);
  const languageTranslateInFlightRef = useRef(false);

  const isLoading = isSubmitting || isGeneratingAudio || isTranslatingLanguage;

  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    try {
      const ext = window.sessionStorage.getItem("extracted_text");
      if (ext) {
        form.setFieldValue("text", ext);
        window.sessionStorage.removeItem("extracted_text");
      }
    } catch(e) {}
  }, [form]);

  async function handleLanguageSelect(nextLanguage: TTSLanguageValue) {
    if (languageTranslateInFlightRef.current) {
      return;
    }

    form.setFieldValue("languageId", nextLanguage);

    if (nextLanguage === AUTO_TTS_LANGUAGE_VALUE) {
      return;
    }

    const inputText = text.trim();
    if (!inputText) {
      return;
    }

    try {
      languageTranslateInFlightRef.current = true;
      setIsTranslatingLanguage(true);

      const response = await fetch("/api/text-translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: inputText,
          sourceLanguageCode: "auto",
          targetLanguageCode: nextLanguage,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as TranslateResponse;

      if (!response.ok) {
        throw new Error(payload.error || PROJECT_ISSUE_MESSAGE);
      }

      const detectedSourceLanguage = payload.source_language_code;
      const translatedText = payload.translated_text?.trim() ?? "";

      if (
        typeof detectedSourceLanguage === "string" &&
        detectedSourceLanguage !== nextLanguage &&
        translatedText
      ) {
        form.setFieldValue("text", translatedText);
      }
    } catch {
      toast.error(PROJECT_ISSUE_MESSAGE);
    } finally {
      languageTranslateInFlightRef.current = false;
      setIsTranslatingLanguage(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50/50 dark:bg-zinc-950/20 p-4 lg:p-10">
      <div className="mx-auto flex w-full max-w-250 flex-col gap-6 lg:gap-8 pb-12">

        {/* Main Composer Box */}
        <div className="relative flex flex-col pt-2 pb-6 px-1 lg:px-4 overflow-hidden rounded-[32px] border-none bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="relative flex min-h-55 lg:min-h-70">        
            <form.Field name="text">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Start typing or paste your text here..."
                  className="flex-1 resize-none border-0 bg-transparent px-6 py-6 text-lg lg:text-[22px] font-medium leading-relaxed tracking-tight text-foreground/90 placeholder:text-muted-foreground/50 shadow-none wrap-break-word focus-visible:ring-0 focus-visible:outline-none"
                  maxLength={TEXT_MAX_LENGTH}
                  disabled={isLoading}
                />
              )}
            </form.Field>
          </div>

          <div className="px-6 pb-2">
            {text.length === 0 && (
              <div className="hidden pb-6 lg:block">
                <PromptSuggestions
                  onSelect={(prompt) => form.setFieldValue("text", prompt)}     
                />
              </div>
            )}

            <div className="mt-auto flex flex-col gap-3 lg:gap-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:gap-3">
                <div className="min-w-0">
                  <div className="w-full max-w-40 sm:max-w-48 lg:w-45 lg:max-w-none">
                  <form.Field name="languageId">
                    {(field) => (
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => {
                          void handleLanguageSelect(val as TTSLanguageValue);
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-9 rounded-full border-input/50 bg-background/50 px-3 text-[11px] font-medium shadow-sm transition-colors hover:bg-accent/50 **:data-[slot=select-value]:hidden sm:h-10 sm:text-sm sm:**:data-[slot=select-value]:flex">
                          <span className="sm:hidden">Language</span>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {TTS_LANGUAGE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-xl">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </form.Field>
                </div>
              </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] font-medium tracking-tight text-muted-foreground/60 sm:text-xs lg:text-sm">
                  {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()}
                  </span>
                  <GenerateButton
                    className="h-9 w-[7.2rem] whitespace-nowrap rounded-full bg-zinc-900 px-3 py-2 text-[11px] font-bold text-zinc-50 shadow-md hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white sm:h-10 sm:w-auto sm:min-w-36 sm:px-4 sm:text-sm lg:min-w-40 lg:px-8 lg:py-6 lg:text-base"
                    disabled={isLoading || !isValid}
                    isSubmitting={isLoading}
                    onSubmit={() => form.handleSubmit()}
                  />
                </div>
              </div>

              {isTranslatingLanguage ? (
                <span className="inline-flex w-full items-center gap-1.5 text-xs font-medium text-muted-foreground lg:w-auto">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Translating...
                </span>
              ) : null}

              {/* Mobile Voice selector and controls */}
              <div className="w-full space-y-4 pt-1 lg:hidden">
                <div className="w-full">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">Voice</span>
                  <VoiceSelector />
                </div>
                <div className="flex items-center justify-start gap-2 border-t pt-4">
                  <SettingsDrawer />
                  <HistoryDrawer />
                </div>
              </div>
            </div>
          </div>
        </div>

        {audioUrl && (
          <div className="rounded-[24px] border-none bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="mb-4 block text-base font-semibold tracking-tight text-foreground/90">Preview Generated Audio</span>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              key={audioUrl}
              src={audioUrl}
              controls
              autoPlay
              className="w-full"
            />
          </div>
        )}

        {/* Down Section */}
        <div className="hidden lg:block w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-border/40 rounded-none w-full justify-start h-12 p-0 space-x-6">
              <TabsTrigger 
                value="settings"
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary shadow-none data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary shadow-none data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="pt-4 outline-none">
              <div className="rounded-[24px] border-none bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                <SettingsRow />
              </div>
            </TabsContent>
            <TabsContent value="history" className="pt-4 outline-none">
              <div className="rounded-[24px] border-none bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 overflow-hidden">
                <div className="max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                  <SettingsPanelHistory />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
