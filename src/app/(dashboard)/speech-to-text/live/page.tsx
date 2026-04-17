import type { Metadata } from "next";

import { SpeechToTextLiveView } from "@/features/speech-to-text/views/speech-to-text-live-view";

export const metadata: Metadata = {
  title: "Speech to Text Live",
};

export default function SpeechToTextLivePage() {
  return <SpeechToTextLiveView />;
}