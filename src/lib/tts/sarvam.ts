import { env } from "@/lib/env";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";

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
    console.error("TTS library misconfigured: missing API key");
    throw new Error(PROJECT_ISSUE_MESSAGE);
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
    const errText = await response.text().catch(() => "");
    console.error("TTS provider error:", response.status, errText);
    throw new Error(PROJECT_ISSUE_MESSAGE);
  }

  const data = await response.json();
  
  if (!data?.audios?.[0]) {
    console.error("TTS provider returned no audio payload");
    throw new Error(PROJECT_ISSUE_MESSAGE);
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
