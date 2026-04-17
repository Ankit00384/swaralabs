"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrganizationSwitcher,
  UserButton,
  useClerk
} from "@clerk/nextjs";
import {
  type LucideIcon,
  Home,
  LayoutGrid,
  AudioLines,
  Mic,
  Settings,
  Headphones,
  FileImage,
  MessageSquareMore,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
};

interface NavSectionProps {
  label?: string;
  items: MenuItem[];
  pathname: string;
};

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!!item.url}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-11 px-3.5 py-2.5 text-[15px] tracking-tight font-medium text-sidebar-foreground transition-colors data-[active=true]:bg-primary/15 data-[active=true]:text-primary [&_svg:not([class*='size-'])]:size-[1.2em]"
              >
                {item.url ? (
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const clerk = useClerk();

  const mainMenuItems: MenuItem[] = [
    {
      title: "Home",
      url: "/app",
      icon: Home,
    },
    {
      title: "Explore voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Text to speech",
      url: "/text-to-speech",
      icon: AudioLines,
    },
    {
      title: "Speech to text",
      url: "/speech-to-text",
      icon: Mic,
    },
    {
      title: "Text translate",
      url: "/translate",
      icon: MessageSquareMore,
    },
    {
      title: "Text extractor",
      url: "/text-extractor",
      icon: FileImage,
    },
  ];

  const othersMenuItems: MenuItem[] = [
    {
      title: "Settings",
      icon: Settings,
      onClick: () => clerk.openOrganizationProfile(),
    },
    {
      title: "Help and support",
      url: "mailto:contact@swarlabs.com",
      icon: Headphones,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-between gap-2.5 px-1">
          <Link
            href="/app"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full"
          >
            <Image
              src="/logo.svg"
              alt="Swarlabs"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="group-data-[collapsible=icon]:hidden font-bold text-[23px] tracking-tight text-foreground">
              Swarlabs
            </span>
            <span className="group-data-[collapsible=icon]:hidden rounded-md bg-primary/10 px-2 py-1 text-[12px] font-medium leading-none text-primary">
              BETA
            </span>
          </Link>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher
              hidePersonal
              fallback={
                <Skeleton
                  className="h-10 w-full group-data-[collapsible=icon]:size-10 rounded-md border bg-white"
                />
              }
              appearance={{
                elements: {
                  rootBox:
                    "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                  organizationSwitcherTrigger:
                    "w-full! justify-between! bg-sidebar-accent! border! border-sidebar-border! rounded-md! pl-2! pr-2.5! py-1.5! gap-3! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1.5!",
                  organizationPreview: "gap-2!",
                  organizationPreviewAvatarBox: "size-7! rounded-sm!",
                  organizationPreviewTextContainer:
                    "text-[13px]! tracking-tight! font-medium! text-sidebar-foreground! group-data-[collapsible=icon]:hidden!",
                  organizationPreviewMainIdentifier: "text-[15px]!",
                  organizationSwitcherTriggerIcon:
                    "size-5! text-sidebar-foreground! group-data-[collapsible=icon]:hidden!",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection items={mainMenuItems} pathname={pathname} />
        <NavSection
          label="Others"
          items={othersMenuItems}
          pathname={pathname}
        />
      </SidebarContent>
      <SidebarFooter className="gap-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserButton
              showName
              fallback={
                <Skeleton className="h-10 w-full group-data-[collapsible=icon]:size-10 rounded-md border border-border bg-white" />
              }
              appearance={{
                elements: {
                  rootBox:
                    "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                  userButtonTrigger:
                    "w-full! justify-between! bg-sidebar-accent! border! border-sidebar-border! rounded-md! pl-2! pr-2.5! py-1.5! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1.5! group-data-[collapsible=icon]:after:hidden!",
                  userButtonBox: "flex-row-reverse! gap-2!",
                  userButtonOuterIdentifier: "text-[15px]! tracking-tight! font-medium! text-sidebar-foreground! pl-0! group-data-[collapsible=icon]:hidden!",
                  userButtonAvatarBox: "size-7!",
                }
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
