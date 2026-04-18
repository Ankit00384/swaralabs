"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";
import {
  STT_LANGUAGE_OPTIONS,
  type SpeechToTextLanguageCode,
  type SpeechToTextMode,
  type SpeechToTextModel,
} from "../data/constants";

type STTResponse = {
  transcript?: string;
  language_code?: string | null;
  language_probability?: number | null;
  request_id?: string | null;
  timestamps?: unknown | null;
  diarized_transcript?: unknown | null;
};

type StoredTranscriptResult = {
  transcript: string;
  languageCode: string;
  languageProbability: number | null;
  requestId: string | null;
  timestamps: unknown;
  diarizedTranscript: unknown;
  audioDataUrl: string;
  audioName: string;
  audioType: string;
  model: string;
  mode: string;
  withTimestamps: boolean;
  withDiarization: boolean;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read recorded audio"));
    reader.readAsDataURL(blob);
  });
}

function isSpeechToTextLanguageCode(value: string | null): value is SpeechToTextLanguageCode {
  return STT_LANGUAGE_OPTIONS.some((option) => option.value === value);
}

function isSpeechToTextModel(value: string | null): value is SpeechToTextModel {
  return value === "saarika:v2.5" || value === "saaras:v3";
}

function isSpeechToTextMode(value: string | null): value is SpeechToTextMode {
  return value === "transcribe" || value === "translate" || value === "verbatim" || value === "translit" || value === "codemix";
}

async function blobToWav(blob: Blob): Promise<Blob> {
  const audioCtx = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  const sampleRate = 16000;
  const offline = new OfflineAudioContext(1, audioBuffer.duration * sampleRate, sampleRate);
  const src = offline.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(offline.destination);
  src.start(0);
  const rendered = await offline.startRendering();
  const pcm = rendered.getChannelData(0);

  const wav = new ArrayBuffer(44 + pcm.length * 2);
  const v = new DataView(wav);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };

  w(0, "RIFF");
  v.setUint32(4, 36 + pcm.length * 2, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, pcm.length * 2, true);

  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([wav], { type: "audio/wav" });
}

const SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION_MS = 5000;

export function SpeechToTextLiveView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const silenceCheckRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const [isStarting, setIsStarting] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const languageCode = useMemo<SpeechToTextLanguageCode>(() => {
    const candidate = searchParams.get("languageCode");
    return isSpeechToTextLanguageCode(candidate) ? candidate : "unknown";
  }, [searchParams]);

  const model = useMemo<SpeechToTextModel>(() => {
    const candidate = searchParams.get("model");
    return isSpeechToTextModel(candidate) ? candidate : "saaras:v3";
  }, [searchParams]);

  const mode = useMemo<SpeechToTextMode>(() => {
    const candidate = searchParams.get("mode");
    return isSpeechToTextMode(candidate) ? candidate : "transcribe";
  }, [searchParams]);

  const cleanup = useCallback(() => {
    if (silenceCheckRef.current) {
      cancelAnimationFrame(silenceCheckRef.current);
      silenceCheckRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    analyserRef.current = null;
  }, []);

  const transcribeAndFinalize = useCallback(
    async (audioBlob: Blob) => {
      if (!mountedRef.current) return;

      setIsTranscribing(true);
      try {
        const wavBlob = await blobToWav(audioBlob);
        const file = new File([wavBlob], "recording.wav", { type: "audio/wav" });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("languageCode", languageCode);
        formData.append("model", model);
        formData.append("mode", mode);
        formData.append("withTimestamps", "false");
        formData.append("withDiarization", "false");

        const response = await fetch("/api/speech-to-text", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json().catch(() => ({}))) as STTResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || PROJECT_ISSUE_MESSAGE);
        }

        const text = payload.transcript?.trim() || "";
        const audioDataUrl = await blobToDataUrl(audioBlob);

        const result: StoredTranscriptResult = {
          transcript: text,
          languageCode: payload.language_code || languageCode,
          languageProbability: payload.language_probability ?? null,
          requestId: payload.request_id ?? null,
          timestamps: payload.timestamps ?? null,
          diarizedTranscript: payload.diarized_transcript ?? null,
          audioDataUrl,
          audioName: "speech-live-recording.webm",
          audioType: audioBlob.type || "audio/webm",
          model,
          mode,
          withTimestamps: false,
          withDiarization: false,
        };

        window.sessionStorage.setItem("speech_to_text_result", JSON.stringify(result));
        router.push("/speech-to-text/result");
      } catch (err) {
        const message = err instanceof Error && err.message ? err.message : PROJECT_ISSUE_MESSAGE;
        setError(message);
        toast.error(message);
        setIsTranscribing(false);
      }
    },
    [languageCode, mode, model, router],
  );

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
  }, []);

  const startCapture = useCallback(async () => {
    try {
      setError(null);
      setIsStarting(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      // Set up silence detection
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceSince: number | null = null;

      const checkSilence = () => {
        if (!mountedRef.current || !recorderRef.current || recorderRef.current.state !== "recording") return;

        analyser.getByteTimeDomainData(dataArray);
        let maxAmplitude = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const amplitude = Math.abs(dataArray[i] - 128) / 128;
          if (amplitude > maxAmplitude) maxAmplitude = amplitude;
        }

        if (maxAmplitude < SILENCE_THRESHOLD) {
          if (silenceSince === null) {
            silenceSince = Date.now();
          } else if (Date.now() - silenceSince >= SILENCE_DURATION_MS) {
            stopRecording();
            return;
          }
        } else {
          silenceSince = null;
        }

        silenceCheckRef.current = requestAnimationFrame(checkSilence);
      };

      // Set up recorder
      const preferredMimeType =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";

      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
        cleanup();

        if (chunks.length > 0 && mountedRef.current) {
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          void transcribeAndFinalize(audioBlob);
        }
      };

      recorderRef.current = recorder;
      recorder.start();

      setIsStarting(false);
      setIsRecording(true);
      setElapsedTime(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);

      silenceCheckRef.current = requestAnimationFrame(checkSilence);
    } catch (captureError) {
      cleanup();
      setIsStarting(false);

      if (captureError instanceof DOMException && captureError.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        setError("Failed to start live transcription. Please check your microphone.");
      }
    }
  }, [cleanup, stopRecording, transcribeAndFinalize]);

  const startCaptureRef = useRef(startCapture);
  startCaptureRef.current = startCapture;

  useEffect(() => {
    mountedRef.current = true;
    void startCaptureRef.current();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
      <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <div className="max-w-2xl text-center text-[17px] leading-8 tracking-tight text-foreground md:text-[20px] md:leading-9">
            {isTranscribing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Transcribing your speech...</p>
              </div>
            ) : isRecording || isStarting ? (
              <p className="text-muted-foreground">Listening for your speech...</p>
            ) : null}
          </div>

          {error && (
            <div className="mt-8 w-full max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border/70 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex w-full max-w-2xl items-center rounded-full bg-slate-50 px-4 py-3 shadow-sm md:px-5">
          <div className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
            {formatTime(elapsedTime)}
          </div>

          <div className="mx-4 flex min-w-0 flex-1 items-center gap-1.5">
            <span className="h-2 w-1 rounded-full bg-slate-300" />
            <span className="h-3 w-1 rounded-full bg-slate-300" />
            <span className="h-5 w-1 rounded-full bg-slate-400" />
            <span className="h-3 w-1 rounded-full bg-slate-300" />
            <span className="h-4 w-1 rounded-full bg-slate-300" />
            <span className="h-2 w-1 rounded-full bg-slate-300" />
            <span className="h-4 w-1 rounded-full bg-slate-300" />
            <span className="h-3 w-1 rounded-full bg-slate-300" />
            <span className="h-5 w-1 rounded-full bg-slate-400" />
            <span className="h-3 w-1 rounded-full bg-slate-300" />
            <span className="h-2 w-1 rounded-full bg-slate-300" />
            <span className="h-px min-w-8 flex-1 bg-slate-300" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 shrink-0 rounded-full border-0 bg-rose-100 text-rose-500 shadow-sm hover:bg-rose-100"
            onClick={stopRecording}
            disabled={!isRecording || isTranscribing}
          >
            {isTranscribing ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4 fill-current" />}
          </Button>
        </div>

        <div className="mx-auto mt-3 flex w-full max-w-2xl items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            {isStarting ? "Starting mic..." : isTranscribing ? "Transcribing..." : isRecording ? "Recording live" : "Done"}
          </span>
          <span>Auto detect</span>
        </div>
      </div>
    </div>
  );
}
