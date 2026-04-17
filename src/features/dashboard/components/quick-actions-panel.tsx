import { quickActions } from "@/features/dashboard/data/quick-actions";
import { QuickActionCard } from "@/features/dashboard/components/quick-action-card";

export function QuickActionsPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Quick actions</h2>
        <p className="text-xs text-muted-foreground">
          Start faster with curated prompts for common use cases.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            gradient={action.gradient}
            href={action.href}
          />
        ))}
      </div>
    </div>
  );
}
