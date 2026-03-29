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
      <SidebarInset className="min-h-0 min-w-0">
        <header className="flex shrink-0 items-center gap-2 p-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex min-h-0 flex-1 flex-col">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
};