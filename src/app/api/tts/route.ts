import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";
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
    console.error("TTS route misconfigured: missing API key");
    return new Response(PROJECT_ISSUE_MESSAGE, { status: 500 });
  }

  try {
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
      const errText = await response.text().catch(() => "");
      console.error("TTS upstream error:", response.status, errText);
      return new Response(PROJECT_ISSUE_MESSAGE, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "audio/wav",
      },
    });
  } catch (error) {
    console.error("TTS route error:", error);
    return new Response(PROJECT_ISSUE_MESSAGE, { status: 500 });
  }
}
