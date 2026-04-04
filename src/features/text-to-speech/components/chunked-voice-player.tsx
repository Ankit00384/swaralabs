"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@tanstack/react-form";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useTTSChunkPlayback } from "../contexts/tts-chunk-playback-context";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { ttsFormOptions } from "./text-to-speech-form";

export function ChunkedVoicePlayer() {
  const form = useTypedAppFormContext(ttsFormOptions);
  const text = useStore(form.store, (s) => s.values.text);

  const {
    runId,
    chunksCount,
    chunkUrls,
    isGeneratingChunks,
    markPlaybackFinished,
  } = useTTSChunkPlayback();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousRunIdRef = useRef(runId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeUrl = chunkUrls[currentIndex] ?? null;
  const isSkip = activeUrl === "__SKIP__";
  const hasAnyChunkResult = chunkUrls.some((url) => Boolean(url));
  const isActivePreview = isGeneratingChunks || hasAnyChunkResult;

  // Reset current index when runId changes
  useEffect(() => {
    if (previousRunIdRef.current !== runId) {
      previousRunIdRef.current = runId;
      queueMicrotask(() => {
        setCurrentIndex(0);
      });
    }
  }, [runId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!activeUrl) return;
    if (isSkip) return;

    audio.src = activeUrl;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Autoplay may be blocked; user can press play in controls.
    });
  }, [activeUrl, currentIndex, runId, isSkip]);

  const canShowPlayer = Boolean(activeUrl) && activeUrl !== "" && !isSkip;
  const shouldAutoAdvance = isSkip;

  useEffect(() => {
    if (!shouldAutoAdvance) return;
    const next = currentIndex + 1;
    
    const timer = setTimeout(() => {
      if (next < chunksCount) {
        setCurrentIndex(next);
      } else {
        markPlaybackFinished();
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [shouldAutoAdvance, currentIndex, chunksCount, markPlaybackFinished]);

  if (!isActivePreview) return null;

  return (
    <div className="flex h-56 shrink-0 flex-col border-t">
      <div className="p-6 pb-0">
        <h3 className="font-semibold text-foreground">Voice preview</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isGeneratingChunks ? "Generating chunks..." : "Chunks ready"} ·{" "}
          Chunk {Math.min(currentIndex + 1, Math.max(chunksCount, 1))}/{Math.max(chunksCount, 1)}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        {canShowPlayer ? (
          <audio
            ref={audioRef}
            controls
            onEnded={() => {
              const next = currentIndex + 1;
              if (next < chunksCount) {
                setCurrentIndex(next);
                return;
              }
              markPlaybackFinished();
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Badge variant="outline" className="gap-2 border-dashed bg-background/90 px-3 py-1.5">
              <Spinner className="size-4" />
              <span>{activeUrl ? "Loading..." : "Generating first chunk..."}</span>
            </Badge>
            <p className="text-xs text-muted-foreground mt-2 max-w-xl text-center">
              Audio playback starts as soon as the first chunk is ready.
            </p>
          </div>
        )}
      </div>

      <div className="p-6 pt-4">
        <p className="truncate text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

