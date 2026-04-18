"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Download,
  Pause,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type StoredTranscriptResult = {
  transcript: string;
  languageCode: string;
  languageProbability: number | null;
  requestId: string | null;
  timestamps: unknown;
  diarizedTranscript: unknown;
  audioDataUrl: string;
  audioName: string;
  audioType: string;
  model: string;
  mode: string;
  withTimestamps: boolean;
  withDiarization: boolean;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export function SpeechToTextResultView() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<StoredTranscriptResult | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("speech_to_text_result");
      if (!raw) {
        router.replace("/speech-to-text");
        return;
      }

      queueMicrotask(() => {
        setResult(JSON.parse(raw) as StoredTranscriptResult);
      });
    } catch {
      router.replace("/speech-to-text");
    }
  }, [router]);

  async function handleCopyTranscript() {
    if (!result?.transcript) return;
    await navigator.clipboard.writeText(result.transcript);
    toast.success("Transcript copied");
  }

  async function handleDownloadAudio() {
    if (!result?.audioDataUrl) return;

    const link = document.createElement("a");
    link.href = result.audioDataUrl;
    link.download = result.audioName || "speech-recording.wav";
    link.click();
  }

  async function handleShare() {
    if (!result?.transcript) return;

    if (navigator.share) {
      await navigator.share({
        title: "Speech to Text transcript",
        text: result.transcript,
      });
      return;
    }

    await navigator.clipboard.writeText(result.transcript);
    toast.success("Transcript copied for sharing");
  }

  if (!result) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
      <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <div className="max-w-2xl text-center text-[17px] leading-8 tracking-tight text-foreground md:text-[20px] md:leading-9">
            <p className="whitespace-pre-wrap">{result.transcript}</p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border/70 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-14 rounded-full border-0 bg-slate-50 shadow-sm"
            onClick={() => router.push("/speech-to-text")}
          >
            <ArrowLeft className="size-5" />
          </Button>

          <div className="flex min-w-0 flex-1 items-center gap-4 rounded-full bg-slate-50 px-4 py-3 shadow-sm md:px-5">
            <button
              type="button"
              onClick={() => {
                const audio = audioRef.current;
                if (!audio) return;

                if (audio.paused) {
                  void audio.play();
                } else {
                  audio.pause();
                }
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime-500 text-white shadow-sm transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4 fill-current" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{result.audioName}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-2 w-1 rounded-full bg-slate-300" />
                    <span className="h-3 w-1 rounded-full bg-slate-300" />
                    <span className="h-5 w-1 rounded-full bg-slate-400" />
                    <span className="h-3 w-1 rounded-full bg-slate-300" />
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-2 w-1 rounded-full bg-slate-300" />
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-3 w-1 rounded-full bg-slate-300" />
                    <span className="h-5 w-1 rounded-full bg-slate-400" />
                    <span className="h-3 w-1 rounded-full bg-slate-300" />
                    <span className="h-2 w-1 rounded-full bg-slate-300" />
                  </div>
                </div>

                <div className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(event) => {
                  const nextTime = Number(event.target.value);
                  const audio = audioRef.current;
                  if (!audio) return;

                  audio.currentTime = nextTime;
                  setCurrentTime(nextTime);
                }}
                className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm">
              <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full" onClick={handleCopyTranscript}>
                <Copy className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full" onClick={handleDownloadAudio}>
                <Download className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full" onClick={handleShare}>
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="size-14 rounded-full border-0 bg-slate-50 shadow-sm"
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;

              audio.muted = !audio.muted;
              setIsMuted(audio.muted);
            }}
          >
            {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </Button>
        </div>

        <audio
          ref={audioRef}
          src={result.audioDataUrl}
          className="hidden"
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onVolumeChange={(event) => setIsMuted(event.currentTarget.muted || event.currentTarget.volume === 0)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
}
