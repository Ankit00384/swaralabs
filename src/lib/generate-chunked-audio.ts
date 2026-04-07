import { chatterbox } from "@/lib/chatterbox-client";

type GenerateChunkedAudioParams = {
  prompt: string;
  voiceKey: string;
  language?: string;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
};

export async function generateChunkedAudioBuffer({
  prompt,
  voiceKey,
  language,
  temperature,
  topP,
  topK,
  repetitionPenalty,
}: GenerateChunkedAudioParams) {
  if (!prompt.trim()) {
    throw new Error("Prompt is empty");
  }

  const { data, error } = await chatterbox.POST("/generate", {
    body: {
      prompt,
      voice_key: voiceKey,
      ...(language && { language }),
      temperature,
      top_p: topP,
      top_k: topK,
      repetition_penalty: repetitionPenalty,
      norm_loudness: true,
    },
    parseAs: "arrayBuffer",
  });

  if (error || !(data instanceof ArrayBuffer)) {
    throw new Error("Backend generation failed");
  }

  return {
    chunksCount: 1,
    buffer: Buffer.from(data),
  };
}
