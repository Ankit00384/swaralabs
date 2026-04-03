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
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
      <DashboardSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2 text-sm font-semibold tracking-tight">
            <span>Swarlabs</span>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
};