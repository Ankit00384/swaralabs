"use client";

import { useEffect, useState } from "react";
import { useStore } from "@tanstack/react-form";

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
import { Settings, History } from "lucide-react";

import {
  TEXT_MAX_LENGTH,
} from "@/features/text-to-speech/data/constants";
import { ttsFormOptions } from "./text-to-speech-form";
import { useTTSAudio } from "../contexts/tts-audio-context";
import { GenerateButton } from "./generate-button";
import { PromptSuggestions } from "./prompt-suggestions";

import { TTS_LANGUAGE_OPTIONS } from "../data/language-options";
import { VoiceSelector } from "./voice-selector";
import { SettingsRow } from "./settings-row";
import { SettingsPanelHistory } from "./settings-panel-history";

export function TextInputPanel() {
  const form = useTypedAppFormContext(ttsFormOptions);

  const text = useStore(form.store, (s) => s.values.text);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isValid = useStore(form.store, (s) => s.isValid);
  const { audioUrl, isGeneratingAudio } = useTTSAudio();

  const isLoading = isSubmitting || isGeneratingAudio;

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

            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-45">
                  <form.Field name="languageId">
                    {(field) => (
                      <Select
                        value={field.state.value}
                        onValueChange={(val) =>
                          field.handleChange(val as typeof field.state.value)   
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-10 rounded-full border-input/50 bg-background/50 hover:bg-accent/50 shadow-sm transition-colors text-sm font-medium">
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

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium tracking-tight text-muted-foreground/60 hidden sm:inline-block">
                  {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()}
                </span>
                <GenerateButton
                  className="w-full shadow-md lg:w-auto min-w-40 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-zinc-50 dark:text-zinc-950 font-bold"
                  disabled={isLoading || !isValid}
                  isSubmitting={isLoading}
                  onSubmit={() => form.handleSubmit()}
                />
              </div>

              {/* Mobile Voice selector and controls */}
              <div className="w-full space-y-4 lg:hidden">
                <div className="w-full">
                  <span className="text-sm font-medium text-muted-foreground mb-2 block">Voice</span>
                  <VoiceSelector />
                </div>
                <div className="flex items-center justify-between gap-2 border-t pt-4">
                  <div className="flex gap-2">
                    <SettingsDrawer />
                    <HistoryDrawer />
                  </div>
                  <span className="text-xs tracking-tight text-muted-foreground">
                    {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()}
                  </span>
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
