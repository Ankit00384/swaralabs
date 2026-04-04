import {
  TTS_CHUNK_BACKEND_MAX_RETRIES,
  TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS,
  TTS_CHUNK_BACKEND_CONCURRENCY,
  TTS_CHUNK_SIZE_CHARS,
} from "@/features/text-to-speech/data/constants";
import { splitPromptIntoCharChunks } from "@/features/text-to-speech/lib/split-prompt-into-char-chunks";
import { stitchAudioBuffers } from "@/lib/audio-stitching";
import { chatterbox } from "@/lib/chatterbox-client";

type GenerateChunkedAudioParams = {
  prompt: string;
  voiceKey: string;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
};

async function generateChunkWithTimeoutAndRetry({
  chunk,
  voiceKey,
  temperature,
  topP,
  topK,
  repetitionPenalty,
}: {
  chunk: string;
  voiceKey: string;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
}) {
  const maxAttempts = TTS_CHUNK_BACKEND_MAX_RETRIES + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout =
      TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS > 0
        ? setTimeout(() => controller.abort(), TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS)
        : null;

    try {
      const { data, error } = await chatterbox.POST("/generate", {
        body: {
          prompt: chunk,
          voice_key: voiceKey,
          temperature,
          top_p: topP,
          top_k: topK,
          repetition_penalty: repetitionPenalty,
          norm_loudness: true,
        },
        parseAs: "arrayBuffer",
        signal: controller.signal,
      });

      if (error || !(data instanceof ArrayBuffer)) {
        throw new Error("Invalid chunk audio response");
      }

      return Buffer.from(data);
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  throw new Error("Chunk generation failed");
}

export async function generateChunkedAudioBuffer({
  prompt,
  voiceKey,
  temperature,
  topP,
  topK,
  repetitionPenalty,
}: GenerateChunkedAudioParams) {
  const chunks = splitPromptIntoCharChunks(prompt, TTS_CHUNK_SIZE_CHARS);

  if (chunks.length === 0) {
    throw new Error("Prompt is empty");
  }

  const results = new Array<Buffer>(chunks.length);
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= chunks.length) {
        return;
      }

      results[currentIndex] = await generateChunkWithTimeoutAndRetry({
        chunk: chunks[currentIndex],
        voiceKey,
        temperature,
        topP,
        topK,
        repetitionPenalty,
      });
    }
  };

  const workers = Array.from(
    { length: Math.min(TTS_CHUNK_BACKEND_CONCURRENCY, chunks.length) },
    () => worker(),
  );

  await Promise.all(workers);

  return {
    chunksCount: chunks.length,
    buffer: chunks.length === 1 ? results[0] : stitchAudioBuffers(results),
  };
}
