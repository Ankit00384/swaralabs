import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { QuickAction } from "@/features/dashboard/data/quick-actions";
import { cn } from "@/lib/utils";

type QuickActionCardProps = QuickAction;

export function QuickActionCard({
  title,
  description,
  gradient,
  href,
}: QuickActionCardProps) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={cn(
          "relative h-32 overflow-hidden bg-linear-to-br",
          gradient,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.02))]" />
        <div className="absolute bottom-3 right-3 rounded-full bg-white/70 p-1.5 text-slate-700 shadow-sm">
          <ArrowRight className="size-4" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold leading-snug tracking-tight">{title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-auto w-fit border-border/70"
          asChild
        >
          <Link href={href}>
            Use prompt
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
};