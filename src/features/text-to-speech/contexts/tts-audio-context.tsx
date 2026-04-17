"use client";

import { createContext, useContext, useRef, useState } from "react";

interface TTSAudioContextValue {
  audioUrl: string | null;
  setAudioUrl: (url: string | null) => void;
  isGeneratingAudio: boolean;
  setIsGeneratingAudio: (v: boolean) => void;
}

const TTSAudioContext = createContext<TTSAudioContextValue | null>(null);

export function TTSAudioProvider({ children }: { children: React.ReactNode }) {
  const [audioUrl, setAudioUrlRaw] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  function setAudioUrl(url: string | null) {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
    }
    prevUrlRef.current = url;
    setAudioUrlRaw(url);
  }

  return (
    <TTSAudioContext.Provider value={{ audioUrl, setAudioUrl, isGeneratingAudio, setIsGeneratingAudio }}>
      {children}
    </TTSAudioContext.Provider>
  );
}

export function useTTSAudio() {
  const ctx = useContext(TTSAudioContext);
  if (!ctx) throw new Error("useTTSAudio must be used within TTSAudioProvider");
  return ctx;
}
