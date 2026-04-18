import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

type VoiceItem = {
  name: string;
  r2ObjectKey: string;
};

type SarvamTtsResponse = {
  audios?: string[];
};

const FALLBACK_VOICE_NAME_TO_SPEAKER: Record<string, string> = {
  Aditya: "aditya",
  Advait: "advait",
  Amit: "amit",
  Ankit: "ankit",
  Anshika: "ishita",
  Aryan: "aayan",
  Ashutosh: "ashutosh",
  Dev: "dev",
  Gokul: "gokul",
  Kabir: "kabir",
  Kavita: "kavita",
  Kavitha: "kavitha",
  Kavya: "kavya",
  Mani: "mani",
  Manan: "manan",
  Mohit: "mohit",
  Neha: "neha",
  Pooja: "pooja",
  Priya: "priya",
  Rahul: "rahul",
  Ratan: "ratan",
  Ritu: "ritu",
  Rohan: "rohan",
  Roopa: "roopa",
  Rupali: "rupali",
  Shreya: "shreya",
  Shruti: "shruti",
  Shubh: "shubh",
  Simran: "simran",
  Sophia: "sophia",
  Suhani: "suhani",
  Sumit: "sumit",
  Sunny: "sunny",
  Tanya: "tanya",
  Varun: "varun",
};

// Some older speaker IDs may be seeded in DB but no longer recognized upstream.
const SPEAKER_ALIAS_FALLBACKS: Record<string, string> = {
  ankit: "anand",
};

function buildGreetingText(voiceName: string): string {
  return [
    `नमस्ते, मेरा नाम ${voiceName} है - आपका स्वरलैब्स में स्वागत है।`,
    "यहां आप भाषा और मीडिया के शक्तिशाली उपकरणों का उपयोग एक ही जगह पर कर सकते हैं।",
  ].join("\n");
}

function sanitizeFileName(voiceName: string): string {
  return voiceName
    .trim()
    .replace(/[<>:\"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_");
}

async function generateWavForVoice(params: {
  apiKey: string;
  speaker: string;
  text: string;
}): Promise<Buffer> {
  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": params.apiKey,
    },
    body: JSON.stringify({
      text: params.text,
      target_language_code: "hi-IN",
      speaker: params.speaker,
      pace: 1,
      speech_sample_rate: 22050,
      model: "bulbul:v3",
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Sarvam API ${response.status}: ${errText || "request failed"}`);
  }

  const data = (await response.json()) as SarvamTtsResponse;
  const base64Audio = data.audios?.[0];

  if (!base64Audio) {
    throw new Error("Sarvam API returned no audio payload");
  }

  return Buffer.from(base64Audio, "base64");
}

async function loadVoicesFromDatabase(databaseUrl: string): Promise<VoiceItem[]> {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const voices = await prisma.voice.findMany({
      where: {
        variant: "SYSTEM",
        r2ObjectKey: { not: null },
      },
      select: {
        name: true,
        r2ObjectKey: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return voices
      .filter((voice) => typeof voice.r2ObjectKey === "string" && voice.r2ObjectKey.length > 0)
      .map((voice) => ({
        name: voice.name,
        r2ObjectKey: voice.r2ObjectKey as string,
      }));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function main() {
  const apiKey = process.env.SARVAM_API_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!apiKey) {
    throw new Error("Missing SARVAM_API_KEY in .env");
  }

  const outputDir = path.resolve(process.cwd(), "voice-greetings-wav");
  await mkdir(outputDir, { recursive: true });

  let voices: VoiceItem[] = [];

  if (databaseUrl) {
    voices = await loadVoicesFromDatabase(databaseUrl);
  }

  if (voices.length === 0) {
    voices = Object.entries(FALLBACK_VOICE_NAME_TO_SPEAKER)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, r2ObjectKey]) => ({ name, r2ObjectKey }));

    console.warn("No SYSTEM voices found in database. Using fallback voice list.");
  }

  console.log(`Generating ${voices.length} WAV files in ${outputDir}`);

  let successCount = 0;
  const failures: Array<{ name: string; reason: string }> = [];

  for (const voice of voices) {
    const text = buildGreetingText(voice.name);
    const fileName = `${sanitizeFileName(voice.name)}.wav`;
    const filePath = path.join(outputDir, fileName);
    const primarySpeaker = voice.r2ObjectKey.toLowerCase();
    const aliasSpeaker = SPEAKER_ALIAS_FALLBACKS[primarySpeaker];
    const speakersToTry = aliasSpeaker
      ? [primarySpeaker, aliasSpeaker]
      : [primarySpeaker];

    try {
      let audioBuffer: Buffer | null = null;
      let usedSpeaker = primarySpeaker;
      let lastError: unknown;

      for (const speaker of speakersToTry) {
        try {
          audioBuffer = await generateWavForVoice({
            apiKey,
            speaker,
            text,
          });
          usedSpeaker = speaker;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!audioBuffer) {
        throw lastError;
      }

      await writeFile(filePath, audioBuffer);
      successCount += 1;
      if (usedSpeaker !== primarySpeaker) {
        console.log(`OK ${voice.name} -> ${fileName} (fallback speaker: ${usedSpeaker})`);
      } else {
        console.log(`OK ${voice.name} -> ${fileName}`);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push({ name: voice.name, reason });
      console.error(`FAIL ${voice.name}: ${reason}`);
    }
  }

  console.log(`Finished. Success: ${successCount}, Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.log("Failed voices summary:");
    for (const failure of failures) {
      console.log(`- ${failure.name}: ${failure.reason}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
