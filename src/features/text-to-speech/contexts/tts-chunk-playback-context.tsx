"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  TTS_CHUNK_PREVIEW_MAX_RETRIES,
  TTS_CHUNK_PREVIEW_CONCURRENCY,
  TTS_CHUNK_PREVIEW_REQUEST_TIMEOUT_MS,
} from "../data/constants";

type ChunkPreviewParams = {
  chunks: string[];
  voice_key: string;
  language: string;
  temperature: number;
  top_p: number;
  top_k: number;
  repetition_penalty: number;
};

type TTSChunkPlaybackContextValue = {
  runId: number;
  chunksCount: number;
  chunkUrls: Array<string | null>;
  isGeneratingChunks: boolean;
  playbackFinishedPromise: Promise<void>;
  // Resolves when the last chunk finishes playing.
  startChunkPreview: (params: ChunkPreviewParams) => Promise<void>;
  markPlaybackFinished: () => void;
};

const TTSChunkPlaybackContext = createContext<TTSChunkPlaybackContextValue | null>(null);

async function fetchPreviewChunkWithRetry(payload: Record<string, unknown>) {
  const maxAttempts = TTS_CHUNK_PREVIEW_MAX_RETRIES + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TTS_CHUNK_PREVIEW_REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/tts-preview-chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Chunk preview request failed: ${res.status}`);
      }

      return res;
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Chunk preview failed");
}

export function TTSChunkPlaybackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [runId, setRunId] = useState(0);
  const [chunksCount, setChunksCount] = useState(0);
  const [chunkUrls, setChunkUrls] = useState<Array<string | null>>([]);
  const [isGeneratingChunks, setIsGeneratingChunks] = useState(false);

  const playbackFinishedResolveRef = useRef<(() => void) | null>(null);
  const playbackFinishedPromiseRef = useRef<Promise<void> | null>(null);
  const [playbackFinishedPromise, setPlaybackFinishedPromise] = useState<Promise<void>>(
    Promise.resolve(),
  );

  const objectUrlsToRevokeRef = useRef<string[]>([]);

  const reset = useCallback(() => {
    for (const url of objectUrlsToRevokeRef.current) URL.revokeObjectURL(url);
    objectUrlsToRevokeRef.current = [];
    playbackFinishedResolveRef.current = null;
  }, []);

  const startChunkPreview = useCallback(
    (params: ChunkPreviewParams) => {
      reset();

      const nextRunId = runId + 1;
      setRunId(nextRunId);

      setIsGeneratingChunks(true);
      setChunksCount(params.chunks.length);
      setChunkUrls(new Array(params.chunks.length).fill(null));

      const finished = new Promise<void>((resolve) => {
        playbackFinishedResolveRef.current = resolve;
      });
      playbackFinishedPromiseRef.current = finished;
      setPlaybackFinishedPromise(finished);

      const concurrency = TTS_CHUNK_PREVIEW_CONCURRENCY;
      const chunks = params.chunks;
      let nextIndex = 0;

      const worker = async () => {
        while (true) {
          const i = nextIndex;
          nextIndex += 1;
          if (i >= chunks.length) return;

          let res: Response;
          try {
            res = await fetchPreviewChunkWithRetry({
              prompt: chunks[i],
              voice_key: params.voice_key,
              language: params.language,
              temperature: params.temperature,
              top_p: params.top_p,
              top_k: params.top_k,
              repetition_penalty: params.repetition_penalty,
              norm_loudness: true,
            });
          } catch {
            // If a chunk fails, avoid hanging playback by marking it as "skip".
            setChunkUrls((prev) => {
              const next = prev.slice();
              next[i] = "__SKIP__";
              return next;
            });
            continue;
          }

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          objectUrlsToRevokeRef.current.push(url);

          setChunkUrls((prev) => {
            const next = prev.slice();
            next[i] = url;
            return next;
          });
        }
      };

      const workers = Array.from({ length: concurrency }, () => worker());
      Promise.all(workers)
        .then(() => {
          setIsGeneratingChunks(false);
        })
        .catch(() => {
          setIsGeneratingChunks(false);
        });

      return finished;
    },
    [reset, runId],
  );

  const value = useMemo<TTSChunkPlaybackContextValue>(
    () => ({
      runId,
      chunksCount,
      chunkUrls,
      isGeneratingChunks,
      playbackFinishedPromise,
      startChunkPreview,
      markPlaybackFinished: () => playbackFinishedResolveRef.current?.(),
    }),
    [
      runId,
      chunksCount,
      chunkUrls,
      isGeneratingChunks,
      playbackFinishedPromise,
      startChunkPreview,
    ],
  );

  return <TTSChunkPlaybackContext.Provider value={value}>{children}</TTSChunkPlaybackContext.Provider>;
}

export function useTTSChunkPlayback() {
  const ctx = useContext(TTSChunkPlaybackContext);
  if (!ctx) {
    return {
      runId: 0,
      chunksCount: 0,
      chunkUrls: [],
      isGeneratingChunks: false,
      playbackFinishedPromise: Promise.resolve(),
      startChunkPreview: async () => {},
      markPlaybackFinished: () => {},
    } satisfies TTSChunkPlaybackContextValue;
  }
  return ctx;
}

