export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";

export async function POST(req: NextRequest) {
  try {
    const apiKey = env.SARVAM_API_KEY || process.env.SARVAM_API_KEY;
    if (!apiKey) {
      console.error("Speech-to-text route misconfigured: missing API key");
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const model = String(formData.get("model") || "saaras:v3");
    const mode = String(formData.get("mode") || "transcribe");
    const languageCode = String(formData.get("languageCode") || "unknown");
    const withTimestamps = String(formData.get("withTimestamps") || "false") === "true";
    const withDiarization = String(formData.get("withDiarization") || "false") === "true";
    const numSpeakersValue = formData.get("numSpeakers");
    const numSpeakers =
      typeof numSpeakersValue === "string" && numSpeakersValue.trim().length > 0
        ? Number(numSpeakersValue)
        : undefined;

    const normalizedType = file.type.split(";")[0].trim() || "audio/webm";
    const normalizedFile = new File([file], file.name, { type: normalizedType });

    const remoteFormData = new FormData();
    remoteFormData.append("file", normalizedFile, normalizedFile.name);
    remoteFormData.append("model", model);
    remoteFormData.append("language_code", languageCode);

    if (model === "saaras:v3") {
      remoteFormData.append("mode", mode);
    }

    if (withTimestamps) {
      remoteFormData.append("with_timestamps", "true");
    }

    if (withDiarization) {
      remoteFormData.append("with_diarization", "true");
      if (Number.isFinite(numSpeakers)) {
        remoteFormData.append("num_speakers", String(numSpeakers));
      }
    }

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: remoteFormData,
    });

    const payload = await response.json().catch(async () => ({
      error: { message: await response.text().catch(() => "") },
    }));

    if (!response.ok) {
      console.error("Speech-to-text upstream error:", response.status, payload);
      return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: response.status });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Speech-to-text route error:", error);
    return NextResponse.json({ error: PROJECT_ISSUE_MESSAGE }, { status: 500 });
  }
}
