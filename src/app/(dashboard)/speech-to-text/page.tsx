import type { Metadata } from "next";

import { SpeechToTextView } from "@/features/speech-to-text/views/speech-to-text-view";

export const metadata: Metadata = {
  title: "Speech to Text",
};

export default function SpeechToTextPage() {
  return <SpeechToTextView />;
}
