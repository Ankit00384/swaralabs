export const AUTO_TTS_LANGUAGE_VALUE = "__auto__" as const;

export const TTS_LANGUAGE_VALUES = [
  AUTO_TTS_LANGUAGE_VALUE,
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
] as const;

export type TTSLanguageValue = (typeof TTS_LANGUAGE_VALUES)[number];

export const TTS_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: TTSLanguageValue;
  label: string;
}> = [
  { value: AUTO_TTS_LANGUAGE_VALUE, label: "Auto (voice + script detection)" },
  { value: "en-IN", label: "English" },
  { value: "hi-IN", label: "Hindi (hi-IN)" },
  { value: "bn-IN", label: "Bengali (bn-IN)" },
  { value: "kn-IN", label: "Kannada (kn-IN)" },
  { value: "ml-IN", label: "Malayalam (ml-IN)" },
  { value: "mr-IN", label: "Marathi (mr-IN)" },
  { value: "or-IN", label: "Odia (or-IN)" },
  { value: "pa-IN", label: "Punjabi (pa-IN)" },
  { value: "ta-IN", label: "Tamil (ta-IN)" },
  { value: "te-IN", label: "Telugu (te-IN)" },
  { value: "gu-IN", label: "Gujarati (gu-IN)" },
];
