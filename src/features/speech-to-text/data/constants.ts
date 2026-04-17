export type SpeechToTextModel = "saarika:v2.5" | "saaras:v3";

export type SpeechToTextMode =
  | "transcribe"
  | "translate"
  | "verbatim"
  | "translit"
  | "codemix";

export type SpeechToTextLanguageCode =
  | "unknown"
  | "hi-IN"
  | "bn-IN"
  | "kn-IN"
  | "ml-IN"
  | "mr-IN"
  | "od-IN"
  | "pa-IN"
  | "ta-IN"
  | "te-IN"
  | "en-IN"
  | "gu-IN"
  | "as-IN"
  | "ur-IN"
  | "ne-IN"
  | "kok-IN"
  | "ks-IN"
  | "sd-IN"
  | "sa-IN"
  | "sat-IN"
  | "mni-IN"
  | "brx-IN"
  | "mai-IN"
  | "doi-IN";

export const STT_LANGUAGE_OPTIONS: Array<{
  value: SpeechToTextLanguageCode;
  label: string;
}> = [
  { value: "unknown", label: "Auto detect" },
  { value: "en-IN", label: "English" },
  { value: "hi-IN", label: "Hindi" },
  { value: "bn-IN", label: "Bengali" },
  { value: "gu-IN", label: "Gujarati" },
  { value: "kn-IN", label: "Kannada" },
  { value: "ml-IN", label: "Malayalam" },
  { value: "mr-IN", label: "Marathi" },
  { value: "ta-IN", label: "Tamil" },
  { value: "te-IN", label: "Telugu" },
  { value: "pa-IN", label: "Punjabi" },
  { value: "as-IN", label: "Assamese" },
  { value: "ur-IN", label: "Urdu" },
  { value: "ne-IN", label: "Nepali" },
  { value: "kok-IN", label: "Konkani" },
  { value: "ks-IN", label: "Kashmiri" },
  { value: "sd-IN", label: "Sindhi" },
  { value: "sa-IN", label: "Sanskrit" },
  { value: "sat-IN", label: "Santali" },
  { value: "mni-IN", label: "Manipuri" },
  { value: "brx-IN", label: "Bodo" },
  { value: "mai-IN", label: "Maithili" },
  { value: "doi-IN", label: "Dogri" },
];

export const STT_MODE_OPTIONS: Array<{
  value: SpeechToTextMode;
  label: string;
}> = [
  { value: "transcribe", label: "Transcribe" },
  { value: "translate", label: "Translate" },
  { value: "verbatim", label: "Verbatim" },
  { value: "translit", label: "Transliterate" },
  { value: "codemix", label: "Code mix" },
];

export const STT_MODEL_OPTIONS: Array<{
  value: SpeechToTextModel;
  label: string;
  description: string;
}> = [
  {
    value: "saaras:v3",
    label: "Saaras v3",
    description: "Flexible output formats and stronger multilingual transcription",
  },
  {
    value: "saarika:v2.5",
    label: "Saarika v2.5",
    description: "Direct transcription in the spoken language",
  },
];

export const STT_EXAMPLES = [
  {
    id: "codemix",
    title: "Code Mixed",
    subtitle: "Gujarati finance news",
    languageCode: "gu-IN" as SpeechToTextLanguageCode,
    mode: "codemix" as SpeechToTextMode,
    model: "saaras:v3" as SpeechToTextModel,
    accent: "from-indigo-500 via-indigo-400 to-sky-400",
  },
  {
    id: "verbatim",
    title: "Verbatim",
    subtitle: "Marathi cricket commentary",
    languageCode: "mr-IN" as SpeechToTextLanguageCode,
    mode: "verbatim" as SpeechToTextMode,
    model: "saaras:v3" as SpeechToTextModel,
    accent: "from-pink-500 via-rose-400 to-fuchsia-400",
  },
  {
    id: "diarization",
    title: "Diarization",
    subtitle: "Tamil healthcare conversation",
    languageCode: "ta-IN" as SpeechToTextLanguageCode,
    mode: "transcribe" as SpeechToTextMode,
    model: "saaras:v3" as SpeechToTextModel,
    accent: "from-lime-500 via-emerald-400 to-green-500",
  },
];
