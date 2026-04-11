/**
 * Supported languages for TTS generation.
 * Primary quality path is XTTS languages; others use backend fallback.
 */

export const SUPPORTED_LANGUAGES = {
  en: { name: "English", nativeName: "English", code: "en-US", flag: "US" },
  hi: { name: "Hindi", nativeName: "Hindi", code: "hi-IN", flag: "IN" },
  bn: { name: "Bengali", nativeName: "Bengali", code: "bn-IN", flag: "IN" },
  te: { name: "Telugu", nativeName: "Telugu", code: "te-IN", flag: "IN" },
  mr: { name: "Marathi", nativeName: "Marathi", code: "mr-IN", flag: "IN" },
  ta: { name: "Tamil", nativeName: "Tamil", code: "ta-IN", flag: "IN" },
  gu: { name: "Gujarati", nativeName: "Gujarati", code: "gu-IN", flag: "IN" },
  kn: { name: "Kannada", nativeName: "Kannada", code: "kn-IN", flag: "IN" },
  ml: { name: "Malayalam", nativeName: "Malayalam", code: "ml-IN", flag: "IN" },
  pa: { name: "Punjabi", nativeName: "Punjabi", code: "pa-IN", flag: "IN" },
  ur: { name: "Urdu", nativeName: "Urdu", code: "ur-PK", flag: "PK" },
  ja: { name: "Japanese", nativeName: "Japanese", code: "ja-JP", flag: "JP" },
  ko: { name: "Korean", nativeName: "Korean", code: "ko-KR", flag: "KR" },
  zh: { name: "Chinese", nativeName: "Chinese", code: "zh-CN", flag: "CN" },
  fr: { name: "French", nativeName: "French", code: "fr-FR", flag: "FR" },
  es: { name: "Spanish", nativeName: "Spanish", code: "es-ES", flag: "ES" },
  de: { name: "German", nativeName: "German", code: "de-DE", flag: "DE" },
  it: { name: "Italian", nativeName: "Italian", code: "it-IT", flag: "IT" },
  pt: { name: "Portuguese", nativeName: "Portuguese", code: "pt-PT", flag: "PT" },
  nl: { name: "Dutch", nativeName: "Dutch", code: "nl-NL", flag: "NL" },
  pl: { name: "Polish", nativeName: "Polish", code: "pl-PL", flag: "PL" },
  cs: { name: "Czech", nativeName: "Czech", code: "cs-CZ", flag: "CZ" },
  hu: { name: "Hungarian", nativeName: "Hungarian", code: "hu-HU", flag: "HU" },
  ro: { name: "Romanian", nativeName: "Romanian", code: "ro-RO", flag: "RO" },
  el: { name: "Greek", nativeName: "Greek", code: "el-GR", flag: "GR" },
  ru: { name: "Russian", nativeName: "Russian", code: "ru-RU", flag: "RU" },
  uk: { name: "Ukrainian", nativeName: "Ukrainian", code: "uk-UA", flag: "UA" },
  tr: { name: "Turkish", nativeName: "Turkish", code: "tr-TR", flag: "TR" },
  ar: { name: "Arabic", nativeName: "Arabic", code: "ar-SA", flag: "SA" },
  he: { name: "Hebrew", nativeName: "Hebrew", code: "he-IL", flag: "IL" },
  fa: { name: "Persian", nativeName: "Persian", code: "fa-IR", flag: "IR" },
  vi: { name: "Vietnamese", nativeName: "Vietnamese", code: "vi-VN", flag: "VN" },
  th: { name: "Thai", nativeName: "Thai", code: "th-TH", flag: "TH" },
  id: { name: "Indonesian", nativeName: "Indonesian", code: "id-ID", flag: "ID" },
  ms: { name: "Malay", nativeName: "Malay", code: "ms-MY", flag: "MY" },
  sv: { name: "Swedish", nativeName: "Swedish", code: "sv-SE", flag: "SE" },
  no: { name: "Norwegian", nativeName: "Norwegian", code: "no-NO", flag: "NO" },
  da: { name: "Danish", nativeName: "Danish", code: "da-DK", flag: "DK" },
  fi: { name: "Finnish", nativeName: "Finnish", code: "fi-FI", flag: "FI" },
  sw: { name: "Swahili", nativeName: "Swahili", code: "sw-KE", flag: "KE" },
  yo: { name: "Yoruba", nativeName: "Yoruba", code: "yo-NG", flag: "NG" },
  ig: { name: "Igbo", nativeName: "Igbo", code: "ig-NG", flag: "NG" },
  xh: { name: "Xhosa", nativeName: "Xhosa", code: "xh-ZA", flag: "ZA" },
  zu: { name: "Zulu", nativeName: "Zulu", code: "zu-ZA", flag: "ZA" },
  af: { name: "Afrikaans", nativeName: "Afrikaans", code: "af-ZA", flag: "ZA" },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const LANGUAGE_LIST = Object.entries(SUPPORTED_LANGUAGES).map(
  ([langCode, config]) => ({
    langCode: langCode as LanguageCode,
    ...config,
  }),
);

export function getLanguageName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES[code]?.name || "Unknown";
}

export function getLanguageNativeName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES[code]?.nativeName || "Unknown";
}

export function getLanguageCode(languageCode: LanguageCode): string {
  return SUPPORTED_LANGUAGES[languageCode]?.code || "en-US";
}
