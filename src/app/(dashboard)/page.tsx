import { HeroPattern } from "@/features/dashboard/components/hero-pattern";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { TextInputPanel } from "@/features/dashboard/components/text-input-panel";
import { QuickActionsPanel } from "@/features/dashboard/components/quick-actions-panel";

export default function DashboardPage() {
  return (
    <section className="relative isolate flex-1">
      <HeroPattern />
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 pb-10 pt-6 md:px-6 md:pt-8 lg:px-8 lg:pt-10">
        <DashboardHeader />
        <TextInputPanel />
        <QuickActionsPanel />
      </div>
    </section>
  );
} 