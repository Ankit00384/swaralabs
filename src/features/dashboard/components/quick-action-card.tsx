import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/8 bg-card transition-all duration-200 hover:border-white/16 hover:bg-white/5"
    >
      {/* Gradient accent bar */}
      <div className={cn("h-1 w-full shrink-0 bg-linear-to-r", gradient)} />

      <div className="flex flex-col gap-2.5 p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold leading-snug text-foreground">
            {title}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-primary/80 transition-colors group-hover:text-primary">
          Use prompt
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
