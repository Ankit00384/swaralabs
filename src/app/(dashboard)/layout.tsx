import { cookies } from "next/headers";

import { 
  SidebarInset, 
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
  const cookieStore = await cookies();
  const cookieState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = cookieState === undefined ? true : cookieState === "true";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="h-svh bg-[radial-gradient(circle_at_top,#effbfb_0%,#f7fafb_45%,#f2f5f8_100%)]"
    >
      <DashboardSidebar />
      <SidebarInset className="min-h-0 overflow-hidden border-l border-border/60 bg-background/80 backdrop-blur-sm">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/90 px-4 backdrop-blur-sm lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2 text-sm">
            <span className="font-semibold tracking-tight text-foreground">Swarlabs</span>
            <span className="text-xs text-muted-foreground">Workspace</span>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
};