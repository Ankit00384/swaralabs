"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Loader2,
  Mic,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  STT_EXAMPLES,
  type SpeechToTextLanguageCode,
  type SpeechToTextMode,
  type SpeechToTextModel,
} from "../data/constants";

type STTResponse = {
  transcript?: string;
  language_code?: string | null;
  language_probability?: number | null;
  request_id?: string | null;
  timestamps?: {
    words?: string[];
    start_time_seconds?: number[];
    end_time_seconds?: number[];
  } | null;
  diarized_transcript?: {
    entries?: Array<{
      transcript: string;
      start_time_seconds: number;
      end_time_seconds: number;
      speaker_id: string;
    }>;
  } | null;
};

type ExampleSelection = (typeof STT_EXAMPLES)[number];

const DEFAULT_LANGUAGE = "unknown";
const DEFAULT_MODEL: SpeechToTextModel = "saaras:v3";
const DEFAULT_MODE: SpeechToTextMode = "transcribe";

export function SpeechToTextView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<STTResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState<SpeechToTextLanguageCode>(DEFAULT_LANGUAGE);
  const [model, setModel] = useState<SpeechToTextModel>(DEFAULT_MODEL);
  const [mode, setMode] = useState<SpeechToTextMode>(DEFAULT_MODE);
  const [withTimestamps, setWithTimestamps] = useState(false);
  const [withDiarization, setWithDiarization] = useState(false);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [selectedExample, setSelectedExample] = useState<string>(STT_EXAMPLES[0].id);

  async function fileToDataUrl(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read audio file"));
      reader.readAsDataURL(file);
    });
  }


  function handleStartSpeaking() {
    const searchParams = new URLSearchParams({
      languageCode,
      model,
      mode,
    });

    router.push(`/speech-to-text/live?${searchParams.toString()}`);
  }
  async function storeTranscriptResult(file: File, payload: STTResponse) {
    const audioDataUrl = await fileToDataUrl(file);

    window.sessionStorage.setItem(
      "speech_to_text_result",
      JSON.stringify({
        transcript: payload.transcript || "",
        languageCode: payload.language_code || "unknown",
        languageProbability: payload.language_probability ?? null,
        requestId: payload.request_id ?? null,
        timestamps: payload.timestamps ?? null,
        diarizedTranscript: payload.diarized_transcript ?? null,
        audioDataUrl,
        audioName: file.name,
        audioType: file.type || "audio/wav",
        model,
        mode,
        withTimestamps,
        withDiarization,
      }),
    );
  }

  async function transcribeFile(file: File) {
    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("languageCode", languageCode);
      formData.append("model", model);
      formData.append("mode", mode);
      formData.append("withTimestamps", String(withTimestamps));
      formData.append("withDiarization", String(withDiarization));

      if (withDiarization) {
        formData.append("numSpeakers", String(numSpeakers));
      }

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as STTResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to transcribe audio");
      }

      setResult(payload);
      await storeTranscriptResult(file, payload);
      toast.success("Transcript ready");
      router.push("/speech-to-text/result");
    } catch (transcriptionError) {
      const message =
        transcriptionError instanceof Error
          ? transcriptionError.message
          : "Failed to transcribe audio";
      setError(message);
      toast.error(message);
    } finally {
      setIsTranscribing(false);
    }
  }

  function applyExample(example: ExampleSelection) {
    setSelectedExample(example.id);
    setLanguageCode(example.languageCode);
    setModel(example.model);
    setMode(example.mode);

    if (example.id === "diarization") {
      setWithDiarization(true);
      setNumSpeakers(2);
    } else {
      setWithDiarization(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void transcribeFile(file);
      event.target.value = "";
    }
  }

  const transcript = result?.transcript?.trim() || "";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
      <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-border/70 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Speech to Text</h1>
          <p className="text-sm text-muted-foreground">Record live or upload audio for transcription.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full px-4">
            <a href="mailto:contact@swarlabs.com?subject=Speech%20to%20Text%20feedback">Feedback</a>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 py-12 md:px-8 lg:py-20">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Transcribe speech and get transcripts
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Record live or upload audio to transcribe in multiple languages.
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-full border border-border/70 bg-slate-50 p-1.5 shadow-sm sm:flex-row">
            <Button
              type="button"
              onClick={handleStartSpeaking}
              disabled={isTranscribing}
              className="h-12 rounded-full bg-zinc-900 px-5 font-semibold text-white hover:bg-zinc-800"
            >
              <Mic className="mr-2 size-4" />
              Start Speaking
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTranscribing}
              className="h-12 rounded-full px-5 font-semibold text-foreground hover:bg-white"
            >
              {isTranscribing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
              Upload Audio
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="mt-7 flex items-center gap-4 text-[13px] text-muted-foreground">
            <div className="h-px w-16 bg-border" />
            <span>or try an example</span>
            <div className="h-px w-16 bg-border" />
          </div>

          <div className="mt-6 grid w-full grid-cols-1 gap-3 md:grid-cols-3">
            {STT_EXAMPLES.map((example) => {
              const isActive = selectedExample === example.id;

              return (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => applyExample(example)}
                  className={`group flex items-center gap-4 rounded-2xl border bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isActive ? "border-zinc-900/30 ring-2 ring-zinc-900/10" : "border-border/70"
                  }`}
                >
                  <div className={`h-14 w-14 shrink-0 rounded-xl bg-linear-to-br ${example.accent} shadow-inner`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{example.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{example.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-8 w-full space-y-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            </div>
          )}

          <div className="mt-8 flex w-full items-center justify-center rounded-[28px] border border-dashed border-border/70 bg-slate-50 p-10 text-center text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Ready to transcribe</p>
              <p className="mt-1">You will be redirected to the result page after transcription completes.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="size-4 text-emerald-500" />
          Supports live capture, audio upload, timestamps, and diarization.
          <ArrowRight className="size-4" />
        </div>
      </div>
    </div>
  );
}
