import { env } from "@/lib/env";

export type GenerateSarvamAudioParams = {
  text: string;
  speaker: string; // e.g., "meera" or "arvind"
  languageCode?: string;
  pace?: number;
  speechSampleRate?: number;
  dictId?: string;
};

export async function generateSarvamAudioBuffer({
  text,
  speaker,
  languageCode = "hi-IN",
  pace = 1.0,
  speechSampleRate = 22050,
  dictId,
}: GenerateSarvamAudioParams): Promise<Buffer> {
  const apiKey = env.SARVAM_API_KEY ?? process.env.SARVAM_API_KEY;
  
  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not configured.");
  }

  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      text,
      target_language_code: languageCode,
      speaker: speaker,
      pace: pace,
      speech_sample_rate: speechSampleRate,
      dict_id: dictId,
      model: "bulbul:v3",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sarvam API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  
  if (!data?.audios?.[0]) {
    throw new Error("No audio returned from Sarvam API");
  }

  // Returns base64 encoded wav
  return Buffer.from(data.audios[0], "base64");
}

type SarvamDictionaryListResponse = {
  dictionary_count?: number;
  dictionaries?: string[];
};

export async function listSarvamPronunciationDictionaries(): Promise<{
  dictionaryCount: number;
  dictionaries: string[];
}> {
  const apiKey = env.SARVAM_API_KEY ?? process.env.SARVAM_API_KEY;

  if (!apiKey) {
    return {
      dictionaryCount: 0,
      dictionaries: [],
    };
  }

  const response = await fetch(
    "https://api.sarvam.ai/text-to-speech/pronunciation-dictionary",
    {
      method: "GET",
      headers: {
        "api-subscription-key": apiKey,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      dictionaryCount: 0,
      dictionaries: [],
    };
  }

  const data = (await response.json()) as SarvamDictionaryListResponse;
  const dictionaries = Array.isArray(data.dictionaries) ? data.dictionaries : [];

  return {
    dictionaryCount: data.dictionary_count ?? dictionaries.length,
    dictionaries,
  };
}
