import {
  TTS_CHUNK_BACKEND_MAX_RETRIES,
  TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS,
  TTS_CHUNK_SIZE_CHARS,
  TTS_CHUNK_BACKEND_CONCURRENCY,
} from "@/features/text-to-speech/data/constants";
import { generateSarvamAudioBuffer } from "@/lib/tts/sarvam";
import { stitchAudioBuffers } from "@/lib/audio-stitching";
import { splitPromptIntoCharChunks } from "@/features/text-to-speech/lib/split-prompt-into-char-chunks";

// Sarvam API limits to 500 chars limit per request
const SARVAM_CHUNK_SIZE_CHARS = 450;

type GenerateChunkedAudioParams = {
  prompt: string;
  voiceKey?: string;
  voiceName?: string;
  voiceLanguage?: string;
  languageId?: string;
  dictId?: string;
  pace?: number;
  speechSampleRate?: number;
  maxRetries?: number;
};

function mapToSarvamLanguage(languageId?: string): string {
  // Sarvam supported languages mapping
  const input = languageId?.toLowerCase().trim();
  switch (input) {
    case "hi":
    case "hi-in": return "hi-IN";
    case "bn":
    case "bn-in": return "bn-IN";
    case "kn":
    case "kn-in": return "kn-IN";
    case "ml":
    case "ml-in": return "ml-IN";
    case "mr":
    case "mr-in": return "mr-IN";
    case "or":
    case "or-in": return "or-IN";
    case "pa":
    case "pa-in": return "pa-IN";
    case "ta":
    case "ta-in": return "ta-IN";
    case "te":
    case "te-in": return "te-IN";
    case "gu":
    case "gu-in": return "gu-IN";
    case "en":
    case "en-in":
    case "en-us":
    case "en-gb": return "en-IN";
    default:
      return "hi-IN"; // Defaulting to hindi if unsupported chosen
  }
}

async function generateChunkWithTimeoutAndRetry({
  prompt,
  voiceKey,
  voiceName,
  voiceLanguage,
  languageId,
  dictId,
  pace,
  speechSampleRate,
  maxRetries,
}: GenerateChunkedAudioParams) {
  const retries = Math.max(0, maxRetries ?? TTS_CHUNK_BACKEND_MAX_RETRIES);
  const maxAttempts = retries + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    try {
      let speaker = "aditya"; // fallback
      if (voiceKey) {
         speaker = voiceKey.toLowerCase();
      } else if (voiceName) {
         speaker = voiceName.toLowerCase();
      }

      const generationPromise = generateSarvamAudioBuffer({
        text: prompt,
        speaker,
        languageCode: mapToSarvamLanguage(languageId || voiceLanguage),
        dictId,
        pace,
        speechSampleRate,
      });

      if (TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS > 0) {
        const timeoutPromise = new Promise<Buffer>((_, reject) => {
          timeout = setTimeout(() => {
            reject(
              new Error(
                `Chunk generation timed out after ${TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS}ms`
              )
            );
          }, TTS_CHUNK_BACKEND_REQUEST_TIMEOUT_MS);
        });

        return await Promise.race([generationPromise, timeoutPromise]);
      }

      return await generationPromise;
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  throw new Error("Chunk generation failed");
}

export async function generateChunkedAudioBuffer({
  prompt,
  voiceKey,
  voiceName,
  voiceLanguage,
  languageId,
  dictId,
  pace,
  speechSampleRate,
  maxRetries,
}: GenerateChunkedAudioParams) {
  const normalizedPrompt = prompt.replace(/\s+/g, " ").trim();
  if (!normalizedPrompt) {
    throw new Error("Prompt is empty");
  }

  const chunkSize = SARVAM_CHUNK_SIZE_CHARS;

  // Split prompt into chunks
  const promptChunks = splitPromptIntoCharChunks(normalizedPrompt, chunkSize);
  
  console.log(
    `[TTS] Input text: ${normalizedPrompt.length} chars, Provider: Sarvam, Chunk size: ${chunkSize}, Chunks: ${promptChunks.length}`
  );
  promptChunks.forEach((chunk, i) => {
    console.log(
      `[TTS] Chunk ${i + 1}: ${chunk.length} chars`
    );
  });

  
  // If only one chunk, generate directly without stitching overhead
  if (promptChunks.length === 1) {
    const buffer = await generateChunkWithTimeoutAndRetry({
      prompt: promptChunks[0],
      voiceKey,
      voiceName,
      voiceLanguage,
      languageId,
      dictId,
      pace,
      speechSampleRate,
      maxRetries,
    });

    return {
      chunksCount: 1,
      buffer,
    };
  }

  // Generate audio for all chunks with concurrency control
  const audioBuffers: Buffer[] = [];
  for (let i = 0; i < promptChunks.length; i += TTS_CHUNK_BACKEND_CONCURRENCY) {
    const batch = promptChunks.slice(i, i + TTS_CHUNK_BACKEND_CONCURRENCY);
    const batchPromises = batch.map((chunk, batchIdx) => {
      console.log(
        `[TTS] Generating chunk ${i + batchIdx + 1}/${promptChunks.length} (${chunk.length} chars)`
      );
      return generateChunkWithTimeoutAndRetry({
        prompt: chunk,
        voiceKey,
        voiceName,
        voiceLanguage,
        languageId,
        dictId,
        pace,
        speechSampleRate,
        maxRetries,
      });
    });

    const batchResults = await Promise.all(batchPromises);
    audioBuffers.push(...batchResults);
    console.log(
      `[TTS] Batch ${Math.ceil((i + TTS_CHUNK_BACKEND_CONCURRENCY) / TTS_CHUNK_BACKEND_CONCURRENCY)} complete. Total buffers: ${audioBuffers.length}`
    );
  }

  console.log(`[TTS] All chunks generated. Stitching ${audioBuffers.length} buffers...`);
  // Stitch all audio chunks together
  const stitchedBuffer = stitchAudioBuffers(audioBuffers);
  console.log(
    `[TTS] Stitching complete. Final audio: ${stitchedBuffer.length} bytes`
  );

  return {
    chunksCount: promptChunks.length,
    buffer: stitchedBuffer,
  };
}
