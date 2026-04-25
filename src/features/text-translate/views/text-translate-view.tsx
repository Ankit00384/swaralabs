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
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";
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
  auto: "bg-slate-300",
  "en-IN": "bg-lime-400",
  "hi-IN": "bg-pink-400",
  "bn-IN": "bg-orange-300",
  "kn-IN": "bg-indigo-500",
  "ml-IN": "bg-amber-300",
  "mr-IN": "bg-cyan-400",
  "or-IN": "bg-red-400",
  "pa-IN": "bg-emerald-400",
  "ta-IN": "bg-violet-500",
  "te-IN": "bg-sky-400",
  "gu-IN": "bg-rose-400",
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
        <div className="-mt-1 flex min-w-0 items-center gap-3">
          <span className={cn("h-3.5 w-3.5 shrink-0 rounded-full", dotClassName)} />
          <SelectValue
            placeholder="Select language"
            className="truncate text-[1.15rem] font-semibold text-slate-900"
          />
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
  const [smart, setSmart] = useState<boolean>(DEFAULT_EXAMPLE.smart);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedSourceLanguage, setDetectedSourceLanguage] =
    useState<TextTranslateLanguageCode>(DEFAULT_EXAMPLE.sourceLanguageCode);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSequence = useRef(0);

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
          throw new Error(payload.error || PROJECT_ISSUE_MESSAGE);
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
          translateError instanceof Error && translateError.message
            ? translateError.message
            : PROJECT_ISSUE_MESSAGE;
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
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#fbf8f3] lg:overflow-hidden">
      <PageHeader title="Text Translate" className="hidden lg:flex" />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4 lg:overflow-hidden lg:p-6">
        <section className="mx-auto flex w-full max-w-[1600px] flex-col rounded-[1.7rem] border border-[#eee7dd] bg-[#fbf8f3] p-2.5 sm:rounded-[2.25rem] sm:p-4 lg:h-full lg:min-h-0 lg:overflow-hidden lg:rounded-[2rem] lg:p-3">
          <div className="hidden shrink-0 pb-3 lg:block">
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">Text Translate</h1>
          </div>

          <div className="grid shrink-0 gap-2.5 md:gap-3 lg:grid-cols-2">
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

          <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:mt-5 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
            <section className="flex flex-col rounded-[1.45rem] border border-[#eee7dd] bg-white p-4 sm:rounded-[1.9rem] sm:p-5 lg:min-h-0 lg:overflow-hidden lg:p-7">
              <Textarea
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                className="min-h-[180px] resize-none rounded-none border-0 bg-transparent px-0 py-0 text-base leading-7 text-slate-900 shadow-none focus-visible:ring-0 sm:min-h-[220px] lg:min-h-0 lg:flex-1 lg:leading-10"
                placeholder="Type here"
              />

              <div className="mt-4 flex shrink-0 items-center justify-between gap-3 text-xs text-slate-500">
                <span>{charactersUsed} / {inputLimit} characters</span>
                <span>{remainingCharacters} remaining</span>
              </div>
            </section>

            <section className="flex flex-col rounded-[1.45rem] border border-[#eee7dd] bg-white p-4 sm:rounded-[1.9rem] sm:p-5 lg:min-h-0 lg:overflow-hidden lg:p-7">
              <div className="relative lg:min-h-0 lg:flex-1">
                <Textarea
                  readOnly
                  value={translatedText}
                  className="min-h-[180px] resize-none rounded-none border-0 bg-transparent px-0 py-0 text-base leading-7 text-slate-900 shadow-none focus-visible:ring-0 sm:min-h-[220px] lg:min-h-0 lg:h-full lg:flex-1 lg:leading-10"
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
                      ? "Translating..."
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

              <div className="mt-4 shrink-0 rounded-[1.35rem] border border-[#eee7dd] bg-[#fcfaf6] p-2.5 sm:mt-5 sm:rounded-[1.65rem] sm:p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={mode} onValueChange={(value) => setMode(value as TextTranslateMode)}>
                    <SelectTrigger className="h-10 min-w-32 rounded-full border-[#e8e1d8] bg-white px-3.5 shadow-none sm:h-11 sm:min-w-36 sm:px-4">
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
                    <SelectTrigger className="h-10 min-w-28 rounded-full border-[#e8e1d8] bg-white px-3.5 shadow-none sm:h-11 sm:min-w-32 sm:px-4">
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
                    <SelectTrigger className="h-10 min-w-24 rounded-full border-[#e8e1d8] bg-white px-3.5 shadow-none sm:h-11 sm:min-w-28 sm:px-4">
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

                  <div className="flex h-10 items-center gap-2.5 rounded-full border border-[#e8e1d8] bg-white px-3.5 text-xs text-slate-700 shadow-none sm:h-11 sm:gap-3 sm:px-4 sm:text-sm">
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
