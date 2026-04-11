"use client";

import { useUser } from "@clerk/nextjs";
import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { isLoaded, user } = useUser();
  const displayName = isLoaded
    ? user?.fullName ?? user?.firstName ?? "there"
    : "...";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-start sm:justify-between md:p-5">
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Workspace overview
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Welcome back, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate narration, preview voices, and ship polished audio faster.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:pt-1">
        <Button variant="outline" size="sm" className="border-border/70 bg-background" asChild>
          <Link href="mailto:business@codewithantonio.com">
            <ThumbsUp className="size-4" />
            <span className="hidden sm:inline">Feedback</span>
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="border-border/70 bg-background" asChild>
          <Link href="mailto:business@codewithantonio.com">
            <Headphones className="size-4" />
            <span className="hidden sm:inline">Need help?</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};