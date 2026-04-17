"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import {
  TEXT_TRANSLATE_EXAMPLES,
  TEXT_TRANSLATE_MODE_OPTIONS,
  TEXT_TRANSLATE_OUTPUT_SCRIPT_OPTIONS,
  TEXT_TRANSLATE_SPEAKER_GENDER_OPTIONS,
  TEXT_TRANSLATE_SOURCE_LANGUAGE_OPTIONS,
  TEXT_TRANSLATE_TARGET_LANGUAGE_OPTIONS,
  getTextTranslateLanguageLabel,
  type TextTranslateLanguageCode,
  type TextTranslateMode,
  type TextTranslateOutputScript,
  type TextTranslateSpeakerGender,
} from "../data/constants";

type TranslateResponse = {
  request_id?: string | null;
  translated_text?: string;
  source_language_code?: string | null;
};

const DEFAULT_EXAMPLE = TEXT_TRANSLATE_EXAMPLES[0];
const AUTO_TRANSLATE_DELAY_MS = 300;
const UI_INPUT_LIMIT = 6000;
const LANGUAGE_DOT_STYLES: Record<string, string> = {
  auto: "bg-slate-300 shadow-[0_0_0_7px_rgba(203,213,225,0.22)]",
  "en-IN": "bg-lime-400 shadow-[0_0_0_7px_rgba(163,230,53,0.18)]",
  "hi-IN": "bg-pink-400 shadow-[0_0_0_7px_rgba(244,114,182,0.18)]",
  "bn-IN": "bg-orange-300 shadow-[0_0_0_7px_rgba(253,186,116,0.18)]",
  "kn-IN": "bg-indigo-500 shadow-[0_0_0_7px_rgba(99,102,241,0.18)]",
  "ml-IN": "bg-amber-300 shadow-[0_0_0_7px_rgba(252,211,77,0.18)]",
  "mr-IN": "bg-cyan-400 shadow-[0_0_0_7px_rgba(34,211,238,0.18)]",
  "or-IN": "bg-red-400 shadow-[0_0_0_7px_rgba(248,113,113,0.18)]",
  "pa-IN": "bg-emerald-400 shadow-[0_0_0_7px_rgba(52,211,153,0.18)]",
  "ta-IN": "bg-violet-500 shadow-[0_0_0_7px_rgba(139,92,246,0.18)]",
  "te-IN": "bg-sky-400 shadow-[0_0_0_7px_rgba(56,189,248,0.18)]",
  "gu-IN": "bg-rose-400 shadow-[0_0_0_7px_rgba(251,113,133,0.18)]",
};

function LanguageSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const dotClassName = LANGUAGE_DOT_STYLES[value] ?? LANGUAGE_DOT_STYLES.auto;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-14 w-full rounded-full border-[#e8e1d8] bg-white px-5 text-left shadow-none">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("h-3.5 w-3.5 shrink-0 rounded-full", dotClassName)} />
          <SelectValue placeholder="Select language" className="truncate" />
        </div>
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="max-h-[16rem] overflow-hidden rounded-[1.75rem] border-[#e8e1d8] bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
        viewportClassName="h-[14.5rem] w-full overscroll-contain scroll-my-0 scroll-smooth pr-1"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="h-14 rounded-2xl px-3 py-3 text-[1.05rem] font-medium text-slate-900"
          >
            <span
              className={cn(
                "h-3.5 w-3.5 shrink-0 rounded-full",
                LANGUAGE_DOT_STYLES[option.value] ?? LANGUAGE_DOT_STYLES.auto,
              )}
            />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TextTranslateView() {
  const [sourceLanguageCode, setSourceLanguageCode] = useState<TextTranslateLanguageCode>(
    DEFAULT_EXAMPLE.sourceLanguageCode,
  );
  const [targetLanguageCode, setTargetLanguageCode] = useState<TextTranslateLanguageCode>(
    DEFAULT_EXAMPLE.targetLanguageCode,
  );
  const [mode, setMode] = useState<TextTranslateMode>(DEFAULT_EXAMPLE.mode);
  const [outputScript, setOutputScript] = useState<TextTranslateOutputScript>(
    DEFAULT_EXAMPLE.outputScript,
  );
  const [speakerGender, setSpeakerGender] = useState<TextTranslateSpeakerGender>(
    DEFAULT_EXAMPLE.speakerGender,
  );
  const [smart, setSmart] = useState(DEFAULT_EXAMPLE.smart);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedSourceLanguage, setDetectedSourceLanguage] =
    useState<TextTranslateLanguageCode>(DEFAULT_EXAMPLE.sourceLanguageCode);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSequence = useRef(0);

  const currentModel = smart && sourceLanguageCode !== "auto" ? "sarvam-translate:v1" : "mayura:v1";
  const inputLimit = UI_INPUT_LIMIT;
  const trimmedInput = inputText.trim();

  const detectedLanguageLabel = useMemo(
    () => getTextTranslateLanguageLabel(detectedSourceLanguage),
    [detectedSourceLanguage],
  );

  const charactersUsed = inputText.length;
  const remainingCharacters = Math.max(0, inputLimit - charactersUsed);

  async function copyTranslation() {
    if (!translatedText.trim()) {
      toast.error("Nothing to copy yet");
      return;
    }

    await navigator.clipboard.writeText(translatedText);
    toast.success("Copied translation");
  }

  useEffect(() => {
    if (!trimmedInput) {
      setTranslatedText("");
      setError(null);
      setIsTranslating(false);
      return;
    }

    if (trimmedInput.length > inputLimit) {
      setIsTranslating(false);
      setError(`Keep the input within ${inputLimit} characters.`);
      return;
    }

    const controller = new AbortController();
    const currentRequest = requestSequence.current + 1;
    requestSequence.current = currentRequest;

    setError(null);
    setIsTranslating(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/text-translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: trimmedInput,
            sourceLanguageCode,
            targetLanguageCode,
            mode,
            outputScript,
            speakerGender,
            smart,
          }),
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => ({}))) as TranslateResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Translation failed");
        }

        if (requestSequence.current !== currentRequest) {
          return;
        }

        startTransition(() => {
          setTranslatedText(payload.translated_text || "");
          setDetectedSourceLanguage(
            (payload.source_language_code as TextTranslateLanguageCode | null) ||
              sourceLanguageCode,
          );
          setIsTranslating(false);
        });
      } catch (translateError) {
        if (controller.signal.aborted || requestSequence.current !== currentRequest) {
          return;
        }

        const message =
          translateError instanceof Error ? translateError.message : "Translation failed";
        setTranslatedText("");
        setError(message);
        setIsTranslating(false);
      }
    }, AUTO_TRANSLATE_DELAY_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    inputLimit,
    mode,
    outputScript,
    smart,
    sourceLanguageCode,
    speakerGender,
    targetLanguageCode,
    trimmedInput,
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fbf8f3]">
      <PageHeader title="Text Translate" className="lg:hidden" />

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-6">
        <section className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col overflow-hidden rounded-[2rem] border border-[#eee7dd] bg-[#fbf8f3] p-3 sm:rounded-[2.25rem] sm:p-4 lg:p-3">
          <div className="hidden shrink-0 pb-3 lg:block">
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">Text Translate</h1>
          </div>

          <div className="grid shrink-0 gap-3 md:grid-cols-2">
            <LanguageSelect
              value={sourceLanguageCode}
              onChange={(value) => setSourceLanguageCode(value as TextTranslateLanguageCode)}
              options={TEXT_TRANSLATE_SOURCE_LANGUAGE_OPTIONS}
            />

            <LanguageSelect
              value={targetLanguageCode}
              onChange={(value) => setTargetLanguageCode(value as TextTranslateLanguageCode)}
              options={TEXT_TRANSLATE_TARGET_LANGUAGE_OPTIONS}
            />
          </div>

          <div className="mt-5 grid min-h-0 flex-1 gap-4 md:grid-cols-2">
            <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.9rem] border border-[#eee7dd] bg-white p-5 sm:p-7">
              <Textarea
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-0 py-0 text-base leading-10 text-slate-900 shadow-none focus-visible:ring-0"
                placeholder="Type here"
              />

              <div className="mt-4 flex shrink-0 items-center justify-between gap-3 text-xs text-slate-500">
                <span>{charactersUsed} / {inputLimit} characters</span>
                <span>{remainingCharacters} remaining</span>
              </div>
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.9rem] border border-[#eee7dd] bg-white p-5 sm:p-7">
              <div className="relative min-h-0 flex-1">
                <Textarea
                  readOnly
                  value={translatedText}
                  className="min-h-0 h-full flex-1 resize-none rounded-none border-0 bg-transparent px-0 py-0 text-base leading-10 text-slate-900 shadow-none focus-visible:ring-0"
                  placeholder={isTranslating ? "Translating..." : "Translation appears here"}
                />

                {isTranslating ? (
                  <div className="pointer-events-none absolute right-0 top-0 flex items-center gap-2 rounded-full bg-[#fbf8f3] px-3 py-1 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex shrink-0 items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  {error
                    ? error
                    : isTranslating
                      ? `Translating with ${currentModel === "sarvam-translate:v1" ? "Sarvam" : "Mayura"}`
                      : `Detected: ${detectedLanguageLabel}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3 text-slate-700 hover:bg-white"
                  onClick={copyTranslation}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>

              <div className="mt-5 shrink-0 rounded-[1.65rem] border border-[#eee7dd] bg-[#fcfaf6] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={mode} onValueChange={(value) => setMode(value as TextTranslateMode)}>
                    <SelectTrigger className="h-11 min-w-36 rounded-full border-[#e8e1d8] bg-white px-4 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_TRANSLATE_MODE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={outputScript}
                    onValueChange={(value) => setOutputScript(value as TextTranslateOutputScript)}
                  >
                    <SelectTrigger className="h-11 min-w-32 rounded-full border-[#e8e1d8] bg-white px-4 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_TRANSLATE_OUTPUT_SCRIPT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={speakerGender}
                    onValueChange={(value) => setSpeakerGender(value as TextTranslateSpeakerGender)}
                  >
                    <SelectTrigger className="h-11 min-w-28 rounded-full border-[#e8e1d8] bg-white px-4 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_TRANSLATE_SPEAKER_GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex h-11 items-center gap-3 rounded-full border border-[#e8e1d8] bg-white px-4 text-sm text-slate-700 shadow-none">
                    <span>Smart</span>
                    <Switch checked={smart} onCheckedChange={setSmart} />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end text-sm text-slate-500">
                  <span className="truncate">
                    {error
                      ? "Fix the issue above to resume live translation."
                      : isTranslating
                        ? "Updating translation as you type..."
                        : trimmedInput
                          ? "Translation is synced automatically."
                          : "No button needed. Just type."}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
