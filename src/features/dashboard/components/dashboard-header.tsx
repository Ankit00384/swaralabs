"use client";

import { useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export function DashboardHeader() {
  const { isLoaded, user } = useUser();
  const displayName = isLoaded
    ? user?.firstName ?? user?.fullName ?? "there"
    : "...";

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
        <Sparkles className="size-4 text-primary" />
      </div>
      <div>
        <h1 className="text-base font-semibold leading-tight tracking-tight text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-xs text-muted-foreground">
          Generate narration, preview voices, and ship polished audio.
        </p>
      </div>
    </div>
  );
}
