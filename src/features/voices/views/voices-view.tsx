"use client";

import { useTRPC } from "@/trpc/client";
import { useQueryState } from "nuqs";
import { useSuspenseQuery } from "@tanstack/react-query";

import { VoicesList } from "../components/voice-list";
import { voicesSearchParams } from "../lib/params";
import { VoicesToolbar } from "../components/voices-toolbar";
import { VOICE_CATEGORY_LABELS } from "../data/voice-categories";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type VoiceItem = inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number];

type VoiceCategory = VoiceItem["category"];

// Order of categories to display
const CATEGORY_ORDER: Record<VoiceCategory, number> = {
  CONVERSATIONAL: 1,
  ENTERTAINMENT: 2,
  AUDIOBOOK: 3,
  SALES: 4,
  GENERAL: 5,
  CUSTOMER_SERVICE: 6,
  CHARACTERS: 7,
  MEDITATION: 8,
  MOTIVATIONAL: 9,
  PODCAST: 10,
  ADVERTISING: 11,
  VOICEOVER: 12,
  CORPORATE: 13,
};

function VoicesContent() {
  const trpc = useTRPC();
  const [query] = useQueryState(
    "query",
    voicesSearchParams.query
  );
  const { data } = useSuspenseQuery(
    trpc.voices.getAll.queryOptions({ query })
  );

  // Use all system voices
  const filteredSystemVoices = data.system;

  // Group voices by category
  const voicesByCategory = filteredSystemVoices.reduce((acc, voice) => {
    if (!acc[voice.category]) {
      acc[voice.category] = [];
    }
    acc[voice.category].push(voice);
    return acc;
  }, {} as Record<VoiceCategory, VoiceItem[]>);

  // Sort categories by order
  const sortedCategories = Object.entries(voicesByCategory)
    .sort(([catA], [catB]) => {
      const orderA = CATEGORY_ORDER[catA as VoiceCategory] ?? 999;
      const orderB = CATEGORY_ORDER[catB as VoiceCategory] ?? 999;
      return orderA - orderB;
    });

  return (
    <>
      {/* Category Sections */}
      {sortedCategories.map(([category, voices]) => (
        <VoicesList 
          key={category}
          title={getCategoryLabel(category as VoiceCategory)} 
          voices={voices}
        />
      ))}
    </>
  );
};

function getCategoryLabel(category: VoiceCategory): string {
  return VOICE_CATEGORY_LABELS[category] || category;
}

export function VoicesView() {
  return (
    <div className="flex-1 space-y-10 overflow-y-auto p-3 lg:p-6">
      <VoicesToolbar />
      <VoicesContent />
    </div>
  );
};
