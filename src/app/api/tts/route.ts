import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { text, speaker, languageCode, pace, speechSampleRate, dictId } = body;

  if (!text || typeof text !== "string") {
    return new Response("text is required", { status: 400 });
  }

  const apiKey = env.SARVAM_API_KEY;
  if (!apiKey) {
    return new Response("SARVAM_API_KEY not configured", { status: 500 });
  }

  const response = await fetch("https://api.sarvam.ai/text-to-speech/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      text,
      target_language_code: languageCode || "hi-IN",
      speaker: speaker || "aditya",
      pace: pace ?? 1.0,
      speech_sample_rate: speechSampleRate ?? 22050,
      model: "bulbul:v3",
      ...(dictId ? { dict_id: dictId } : {}),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return new Response(`Sarvam API error: ${errText}`, { status: response.status });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "audio/wav",
    },
  });
}
