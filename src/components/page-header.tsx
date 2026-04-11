import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
         <Button variant="outline" size="sm" className="border-border/70 bg-background" asChild>
            <Link href="mailto:business@codewithantonio.com">
              <ThumbsUp className="size-4" />
              <span className="hidden lg:block">Feedback</span>
            </Link>
         </Button>
         <Button variant="outline" size="sm" className="border-border/70 bg-background" asChild>
          <Link href="mailto:business@codewithantonio.com">
            <Headphones className="size-4" />
            <span className="hidden lg:block">Need help?</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};