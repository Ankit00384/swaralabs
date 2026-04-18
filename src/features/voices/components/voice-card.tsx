
"use client";

import Link from "next/link";
import { Loader2, Mic, MoreHorizontal, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";

export type VoiceItem =
  inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number];

interface VoiceCardProps {
  voice: VoiceItem;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function parseLanguage(locale: string) {
  const [, country] = locale.split("-");
  if (!country) return { flag: "", region: locale };

  const flag = [...country.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");

  const region = regionNames.of(country) ?? country;

  return { flag, region };
};

export function VoiceCard({ voice }: VoiceCardProps) {
  const { flag, region } = parseLanguage(voice.language);
  const previewSrc = voice.name
    ? `/api/voice-previews/${encodeURIComponent(voice.name)}`
    : null;
  const { isPlaying, isLoading, togglePlay } = useAudioPlayback(previewSrc);

  return (
    <div className="flex items-center gap-1 overflow-hidden rounded-xl border pr-3 lg:pr-6">
      <div className="relative h-24 w-20 shrink-0 lg:h-30 lg:w-24 flex items-center justify-center">
        <VoiceAvatar
          seed={voice.id}
          name={voice.name}
          className="size-14 border-[1.5px] border-white shadow-xs lg:size-18"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={togglePlay}
          disabled={!previewSrc}
          aria-label={isPlaying ? `Pause ${voice.name} sample` : `Play ${voice.name} sample`}
          className="absolute inset-0 m-auto rounded-full border border-white/90 bg-white/85 text-[#e11d48] shadow-sm backdrop-blur hover:bg-white"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="ml-0.5 size-4 fill-current" />
          )}
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:gap-3">
        <div className="flex items-center gap-1.5 line-clamp-1 text-sm font-medium tracking-tight">
          {voice.name}
          <span className="size-1 shrink-0 rounded-full bg-muted-foreground/50" />
          <span className="text-[#327c88]">
            {VOICE_CATEGORY_LABELS[voice.category]}
          </span>
        </div>

        <p className="line-clamp-1 text-xs text-muted-foreground">
          {voice.description}
        </p>

        <p className="flex items-center gap-1 text-xs">
          <span className="shrink-0">{flag}</span>
          <span className="truncate font-medium">{region}</span>
        </p>
      </div>

      <div className="ml-1 flex shrink-0 items-center gap-1 lg:ml-3 lg:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon-sm" 
              className="rounded-full"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/text-to-speech?voiceId=${voice.id}`}>
                <Mic className="size-4 text-foreground" />
                <span className="font-medium">Use this voice</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
