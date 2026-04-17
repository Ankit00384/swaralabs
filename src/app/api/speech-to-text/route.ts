export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

function getFriendlyErrorMessage(status: number, payload: unknown) {
  const rawMessage =
    typeof payload === "object" && payload !== null
      ? String(
          (payload as { error?: { message?: unknown }; message?: unknown }).error?.message ??
            (payload as { message?: unknown }).message ??
            "",
        )
      : "";
  const normalized = rawMessage.toLowerCase();

  if (status === 401 || status === 403 || normalized.includes("credit") || normalized.includes("quota")) {
    return "Transcription is temporarily unavailable right now. Please try again later.";
  }

  if (status === 429 || normalized.includes("limit")) {
    return "Too many requests right now. Please wait a moment and try again.";
  }

  return "We could not process that recording. Please try again.";
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = env.SARVAM_API_KEY || process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Transcription is temporarily unavailable right now. Please try again later." }, { status: 500 });
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
      return NextResponse.json({ error: getFriendlyErrorMessage(response.status, payload) }, { status: response.status });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Speech-to-text route error:", error);
    return NextResponse.json({ error: "Transcription is temporarily unavailable right now. Please try again later." }, { status: 500 });
  }
}
