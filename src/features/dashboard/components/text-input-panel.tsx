"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm backdrop-blur-sm md:p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Create New Audio</h2>
          <p className="text-xs text-muted-foreground">
            Paste your script below to generate a natural voice preview.
          </p>
        </div>

        <Textarea
          placeholder="Start typing or paste your text here..."
          className="min-h-40 resize-none rounded-xl border-border/70 bg-background px-3 py-2 text-sm leading-6 shadow-none focus-visible:ring-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={TEXT_MAX_LENGTH}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1.5 border border-border/70 bg-muted/40 text-foreground">
            <Coins className="size-3 text-chart-5" />
            <span className="text-xs">
              {text.length === 0 ? (
                "Start typing to estimate"
              ) : (
                <>
                  <span className="tabular-nums">
                    ${(text.length * 0.0003).toFixed(4)}
                  </span>{" "}
                  estimated
                </>
              )}
            </span>
          </Badge>

          <span className="text-xs text-muted-foreground">
            {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()} characters
          </span>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Pricing estimate is approximate and updates as you type.
          </p>
          <Button
            size="sm"
            disabled={!text.trim()}
            onClick={handleGenerate}
            className="w-full sm:w-auto"
          >
            Generate speech
          </Button>
        </div>
      </div>
    </div>
  )
}