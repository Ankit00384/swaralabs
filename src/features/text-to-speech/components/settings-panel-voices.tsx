"use client";

import { useMemo, useState } from "react";
import { useStore } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { useTTSVoices } from "../contexts/tts-voices-context";
import { ttsFormOptions } from "./text-to-speech-form";

export function SettingsPanelVoices() {
  const { systemVoices } = useTTSVoices();
  const form = useTypedAppFormContext(ttsFormOptions);
  const voiceId = useStore(form.store, (s) => s.values.voiceId);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    systemVoices.forEach((v) => {
      if (v.category) cats.add(v.category);
    });
    return ["all", ...Array.from(cats)];
  }, [systemVoices]);

  const filteredVoices = useMemo(() => {
    if (activeCategory === "all") return systemVoices;
    return systemVoices.filter((v) => v.category === activeCategory);
  }, [activeCategory, systemVoices]);

  return (
    <div className="flex flex-1 flex-col p-4 w-full h-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <Button
            key={cat}
            type="button"
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className="rounded-full text-xs h-7 px-3"
          >
            {cat === "all" ? "All" : VOICE_CATEGORY_LABELS[cat] || cat}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-8">
          {filteredVoices.map((v) => {
            const isSelected = v.id === voiceId;
            return (
              <button
                key={v.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => form.setFieldValue("voiceId", v.id)}
                className={[
                  "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:bg-accent/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                    : "border-input/50 bg-white dark:bg-zinc-900 shadow-sm",
                ].join(" ")}
              >
                <VoiceAvatar seed={v.id} name={v.name} className="size-10 rounded-full" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-semibold text-sm">{v.name}</span>
                  {v.category && (
                    <span className="truncate text-xs text-muted-foreground">   
                      {VOICE_CATEGORY_LABELS[v.category]}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
