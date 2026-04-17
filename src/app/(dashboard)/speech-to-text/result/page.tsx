import type { Metadata } from "next";

import { SpeechToTextResultView } from "@/features/speech-to-text/views/speech-to-text-result-view";

export const metadata: Metadata = {
  title: "Speech to Text Result",
};

export default function SpeechToTextResultPage() {
  return <SpeechToTextResultView />;
}
