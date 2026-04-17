export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import type {
  TextTranslateLanguageCode,
  TextTranslateModel,
  TextTranslateMode,
  TextTranslateOutputScript,
  TextTranslateSpeakerGender,
} from "@/features/text-translate/data/constants";

const VALID_LANGUAGE_CODES = new Set<TextTranslateLanguageCode>([
  "auto",
  "en-IN",
  "hi-IN",
  "bn-IN",
  "kn-IN",
  "ml-IN",
  "mr-IN",
  "or-IN",
  "pa-IN",
  "ta-IN",
  "te-IN",
  "gu-IN",
]);

const VALID_MODES = new Set<TextTranslateMode>([
  "formal",
  "modern-colloquial",
  "classic-colloquial",
  "code-mixed",
]);

const VALID_OUTPUT_SCRIPTS = new Set<TextTranslateOutputScript>([
  "native",
  "roman",
  "spoken-form-in-native",
]);

const VALID_GENDERS = new Set<TextTranslateSpeakerGender>(["Male", "Female"]);

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
    return "Translation is temporarily unavailable right now. Please try again later.";
  }

  if (status === 429 || normalized.includes("limit")) {
    return "Too many translation requests right now. Please wait a moment and try again.";
  }

  if (status === 400 || status === 422) {
    return "Please adjust the text or translation settings and try again.";
  }

  return "We could not translate that text. Please try again.";
}

function normalizeLanguageCode(value: unknown, allowAuto: boolean) {
  if (typeof value !== "string") {
    return allowAuto ? "auto" : "en-IN";
  }

  if (allowAuto && value === "auto") {
    return value;
  }

  return VALID_LANGUAGE_CODES.has(value as TextTranslateLanguageCode) ? value : allowAuto ? "auto" : "en-IN";
}

function normalizeModel(value: unknown): TextTranslateModel {
  return value === "sarvam-translate:v1" ? "sarvam-translate:v1" : "mayura:v1";
}

function normalizeMode(value: unknown): TextTranslateMode {
  return VALID_MODES.has(value as TextTranslateMode) ? (value as TextTranslateMode) : "formal";
}

function normalizeOutputScript(value: unknown): TextTranslateOutputScript {
  return VALID_OUTPUT_SCRIPTS.has(value as TextTranslateOutputScript)
    ? (value as TextTranslateOutputScript)
    : "native";
}

function normalizeSpeakerGender(value: unknown): TextTranslateSpeakerGender {
  return VALID_GENDERS.has(value as TextTranslateSpeakerGender) ? (value as TextTranslateSpeakerGender) : "Male";
}

function splitInputIntoChunks(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return [input];
  }

  const chunks: string[] = [];
  const paragraphs = input.split(/\n{2,}/);
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) {
      continue;
    }

    const nextChunk = currentChunk ? `${currentChunk}\n\n${trimmedParagraph}` : trimmedParagraph;
    if (nextChunk.length <= maxLength) {
      currentChunk = nextChunk;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
      currentChunk = "";
    }

    if (trimmedParagraph.length <= maxLength) {
      currentChunk = trimmedParagraph;
      continue;
    }

    const sentences = trimmedParagraph.split(/(?<=[.!?।])\s+/);
    let sentenceChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) {
        continue;
      }

      const nextSentenceChunk = sentenceChunk ? `${sentenceChunk} ${trimmedSentence}` : trimmedSentence;
      if (nextSentenceChunk.length <= maxLength) {
        sentenceChunk = nextSentenceChunk;
        continue;
      }

      if (sentenceChunk) {
        chunks.push(sentenceChunk);
      }

      if (trimmedSentence.length <= maxLength) {
        sentenceChunk = trimmedSentence;
        continue;
      }

      for (let index = 0; index < trimmedSentence.length; index += maxLength) {
        chunks.push(trimmedSentence.slice(index, index + maxLength));
      }
      sentenceChunk = "";
    }

    if (sentenceChunk) {
      chunks.push(sentenceChunk);
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = env.SARVAM_API_KEY || process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Translation is temporarily unavailable right now. Please try again later." },
        { status: 500 },
      );
    }

    const body = (await req.json().catch(() => null)) as
      | {
          input?: unknown;
          sourceLanguageCode?: unknown;
          targetLanguageCode?: unknown;
          mode?: unknown;
          outputScript?: unknown;
          speakerGender?: unknown;
          smart?: unknown;
        }
      | null;

    const input = typeof body?.input === "string" ? body.input.trim() : "";
    if (!input) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const sourceLanguageCode = normalizeLanguageCode(body?.sourceLanguageCode, true);
    const targetLanguageCode = normalizeLanguageCode(body?.targetLanguageCode, false);

    const smart = Boolean(body?.smart);
    const requestedModel = normalizeModel(smart ? "sarvam-translate:v1" : "mayura:v1");
    const model = sourceLanguageCode === "auto" ? "mayura:v1" : requestedModel;
    const maxLength = model === "mayura:v1" ? 1000 : 2000;
    const mode = normalizeMode(body?.mode);
    const outputScript = normalizeOutputScript(body?.outputScript);
    const speakerGender = normalizeSpeakerGender(body?.speakerGender);

    const chunks = splitInputIntoChunks(input, maxLength);
    const translatedChunks: string[] = [];
    let detectedLanguage = sourceLanguageCode;
    let lastRequestId: string | null = null;

    for (const chunk of chunks) {
      const requestBody: Record<string, unknown> = {
        input: chunk,
        source_language_code: sourceLanguageCode,
        target_language_code: targetLanguageCode,
        model,
        mode,
        speaker_gender: speakerGender,
        numerals_format: outputScript === "native" ? "native" : "international",
      };

      if (model === "mayura:v1") {
        requestBody.output_script = outputScript;
      }

      const response = await fetch("https://api.sarvam.ai/translate", {
        method: "POST",
        headers: {
          "api-subscription-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const payload = await response.json().catch(async () => ({
        error: { message: await response.text().catch(() => "") },
      }));

      if (!response.ok) {
        console.error("Text translation upstream error:", response.status, payload);
        return NextResponse.json(
          { error: getFriendlyErrorMessage(response.status, payload) },
          { status: response.status },
        );
      }

      translatedChunks.push(String((payload as { translated_text?: unknown }).translated_text ?? ""));
      detectedLanguage = String(
        (payload as { source_language_code?: unknown }).source_language_code ?? detectedLanguage,
      ) as TextTranslateLanguageCode;
      lastRequestId = String((payload as { request_id?: unknown }).request_id ?? lastRequestId) || null;
    }

    return NextResponse.json({
      request_id: lastRequestId,
      translated_text: translatedChunks.join("\n\n"),
      source_language_code: detectedLanguage,
    });
  } catch (error) {
    console.error("Text translation route error:", error);
    return NextResponse.json(
      { error: "Translation is temporarily unavailable right now. Please try again later." },
      { status: 500 },
    );
  }
}
