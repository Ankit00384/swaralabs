import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardView } from "@/features/dashboard/views/dashboard-view";

function isMobileDevice(userAgent: string) {
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
}

export default async function AppDashboardPage() {
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "";

  if (isMobileDevice(userAgent)) {
    redirect("/text-to-speech");
  }

  return <DashboardView />;
}
