import { LANGUAGE_LIST } from "@/lib/languages";

export type TextTranslateLanguageCode =
  | "auto"
  | "en-IN"
  | "hi-IN"
  | "bn-IN"
  | "kn-IN"
  | "ml-IN"
  | "mr-IN"
  | "or-IN"
  | "pa-IN"
  | "ta-IN"
  | "te-IN"
  | "gu-IN";

export type TextTranslateMode =
  | "formal"
  | "modern-colloquial"
  | "classic-colloquial"
  | "code-mixed";

export type TextTranslateOutputScript =
  | "native"
  | "roman"
  | "spoken-form-in-native";

export type TextTranslateSpeakerGender = "Male" | "Female";

export type TextTranslateModel = "mayura:v1" | "sarvam-translate:v1";

export const TEXT_TRANSLATE_LANGUAGE_CODES = [
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
] as const satisfies readonly TextTranslateLanguageCode[];
const TRANSLATE_LANGUAGE_LOOKUP = new Map<string, string>([
  ["en-IN", "English"],
  ["hi-IN", "Hindi (hi-IN)"],
  ["bn-IN", "Bengali (bn-IN)"],
  ["kn-IN", "Kannada (kn-IN)"],
  ["ml-IN", "Malayalam (ml-IN)"],
  ["mr-IN", "Marathi (mr-IN)"],
  ["or-IN", "Odia (or-IN)"],
  ["pa-IN", "Punjabi (pa-IN)"],
  ["ta-IN", "Tamil (ta-IN)"],
  ["te-IN", "Telugu (te-IN)"],
  ["gu-IN", "Gujarati (gu-IN)"],
  ...LANGUAGE_LIST.map((language) => [language.code, language.name] as const),
]);

export function getTextTranslateLanguageLabel(code: TextTranslateLanguageCode) {
  if (code === "auto") {
    return "Auto detect";
  }

  return TRANSLATE_LANGUAGE_LOOKUP.get(code) || code;
}

function buildLanguageOptions(includeAuto: boolean) {
  const options = TEXT_TRANSLATE_LANGUAGE_CODES.map((code) => ({
    value: code,
    label: getTextTranslateLanguageLabel(code),
  }));

  return includeAuto
    ? [{ value: "auto", label: getTextTranslateLanguageLabel("auto") }, ...options]
    : options;
}

export const TEXT_TRANSLATE_SOURCE_LANGUAGE_OPTIONS = buildLanguageOptions(true);
export const TEXT_TRANSLATE_TARGET_LANGUAGE_OPTIONS = buildLanguageOptions(false);

export const TEXT_TRANSLATE_MODE_OPTIONS: Array<{
  value: TextTranslateMode;
  label: string;
}> = [
  { value: "formal", label: "Formal" },
  { value: "modern-colloquial", label: "Modern colloquial" },
  { value: "classic-colloquial", label: "Classic colloquial" },
  { value: "code-mixed", label: "Code mixed" },
];

export const TEXT_TRANSLATE_OUTPUT_SCRIPT_OPTIONS: Array<{
  value: TextTranslateOutputScript;
  label: string;
}> = [
  { value: "native", label: "Native" },
  { value: "roman", label: "Roman" },
  { value: "spoken-form-in-native", label: "Spoken native" },
];

export const TEXT_TRANSLATE_SPEAKER_GENDER_OPTIONS: Array<{
  value: TextTranslateSpeakerGender;
  label: string;
}> = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const TEXT_TRANSLATE_EXAMPLES = [
  {
    id: "office-update",
    title: "Office update",
    subtitle: "English to Hindi",
    sourceLanguageCode: "en-IN" as TextTranslateLanguageCode,
    targetLanguageCode: "hi-IN" as TextTranslateLanguageCode,
    mode: "formal" as TextTranslateMode,
    outputScript: "native" as TextTranslateOutputScript,
    speakerGender: "Male" as TextTranslateSpeakerGender,
    smart: true,
    input:
      "Hey, talk like you normally do.\n\nKal office mein 3 meetings thi.\n2 chai breaks.\n1 deadline miss hui.\nAur haan — salary ₹45,000 credit ho gayi 😌",
    translatedText:
      "अरे, जैसे बोलते हो वैसे ही लिखो।\n\nकल office में 3 meetings थीं।\n2 chai breaks.\n1 deadline miss हो गई।\nऔर हाँ — salary ₹45,000 credit हो गई 😌",
  },
  {
    id: "business-brief",
    title: "Business brief",
    subtitle: "Hindi to English",
    sourceLanguageCode: "hi-IN" as TextTranslateLanguageCode,
    targetLanguageCode: "en-IN" as TextTranslateLanguageCode,
    mode: "modern-colloquial" as TextTranslateMode,
    outputScript: "roman" as TextTranslateOutputScript,
    speakerGender: "Female" as TextTranslateSpeakerGender,
    smart: false,
    input:
      "कल ग्राहक ने कहा कि डिलीवरी दो दिन पहले चाहिए।\nटीम ने तुरंत टाइमलाइन revise कर दी और final draft भेज दिया।",
    translatedText:
      "Yesterday the customer said the delivery should be ready two days earlier.\nThe team immediately revised the timeline and sent the final draft.",
  },
  {
    id: "code-mix",
    title: "Code mix",
    subtitle: "Tamil to English",
    sourceLanguageCode: "ta-IN" as TextTranslateLanguageCode,
    targetLanguageCode: "en-IN" as TextTranslateLanguageCode,
    mode: "code-mixed" as TextTranslateMode,
    outputScript: "native" as TextTranslateOutputScript,
    speakerGender: "Male" as TextTranslateSpeakerGender,
    smart: true,
    input:
      "இந்த week la product launch super smooth ah pochu.\nCustomer feedback um positive ah irukku.",
    translatedText:
      "This week the product launch went super smoothly.\nThe customer feedback is also positive.",
  },
] as const;
