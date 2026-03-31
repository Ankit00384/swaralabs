import { HeroPattern } from "@/features/dashboard/components/hero-pattern";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { TextInputPanel } from "@/features/dashboard/components/text-input-panel";
import { QuickActionsPanel } from "@/features/dashboard/components/quick-actions-panel";

export default function DashboardPage() {
  return (
    <>
      <HeroPattern />
      <div className="mx-auto w-full max-w-5xl space-y-8 p-4 md:p-6 lg:p-8 relative z-10">
        <DashboardHeader />
        <TextInputPanel />
        <QuickActionsPanel />
      </div>
    </>
  );
} 