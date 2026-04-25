import { cookies } from "next/headers";

import { AppProviders } from "@/components/app-providers";
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
    <AppProviders>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="h-svh bg-background"
      >
        <DashboardSidebar />
        <SidebarInset className="flex min-h-0 flex-col border-l border-border/80 bg-transparent">
          <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md lg:hidden">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <div className="flex flex-1 items-center gap-2 text-sm">
              <span className="font-semibold tracking-tight text-foreground">Swarlabs</span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary">BETA</span>
            </div>
          </header>
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppProviders>
  )
};
