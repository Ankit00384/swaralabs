import { AppProviders } from "@/components/app-providers";

export default function OrgSelectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppProviders>{children}</AppProviders>;
}
