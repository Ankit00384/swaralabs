"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioLines } from "lucide-react";

import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";

export function TextInputPanel() {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleGenerate = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    router.push(`/text-to-speech?text=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="rounded-xl border border-white/8 bg-card/60 p-3 ring-1 ring-transparent transition-all focus-within:border-primary/30 focus-within:ring-primary/10">
      <div className="flex gap-3">
        <Textarea
          placeholder="Paste your script and generate speech instantly..."
          className="min-h-17 flex-1 resize-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={TEXT_MAX_LENGTH}
        />
        <div className="flex flex-col items-end justify-between gap-2">
          <span className="text-[11px] tabular-nums text-muted-foreground/50">
            {text.length}/{TEXT_MAX_LENGTH}
          </span>
          <Button
            size="sm"
            disabled={!text.trim()}
            onClick={handleGenerate}
            className="gap-1.5"
          >
            <AudioLines className="size-3.5" />
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
