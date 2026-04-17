import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  className,
  actions,
}: {
  title: string;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
