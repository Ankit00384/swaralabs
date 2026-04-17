"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileImage,
  Globe2,
  Mic,
  Shapes,
  Sparkles,
  Text,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_DASHBOARD_URL } from "@/lib/app-links";

import { TalkToSalesDialog } from "./talk-to-sales-dialog";

const TOOL_MENU = [
  {
    href: "/text-to-speech",
    label: "Text to Speech",
    description: "Generate polished voice output for real scripts.",
    icon: Text,
  },
  {
    href: "/speech-to-text",
    label: "Speech to Text",
    description: "Turn speech into usable transcripts quickly.",
    icon: Mic,
  },
  {
    href: "/translate",
    label: "Text Translate",
    description: "Keep tone and meaning intact across languages.",
    icon: Globe2,
  },
  {
    href: "/text-extractor",
    label: "Text Extractor",
    description: "Pull text from screenshots, files, and documents.",
    icon: FileImage,
  },
] as const;

const COMPANY_MENU = [
  {
    href: "/about",
    label: "About Swarlabs",
    description: "See the platform vision and the product system.",
    icon: Sparkles,
  },
  {
    href: "/careers",
    label: "Careers",
    description: "Join the team shaping the next useful tools.",
    icon: BriefcaseBusiness,
  },
  {
    href: "/",
    label: "Design Principles",
    description: "Explore the long-term product language and direction.",
    icon: Shapes,
  },
] as const;

function HoverMenu({
  label,
  href,
  items,
}: {
  label: string;
  href: string;
  items: ReadonlyArray<{
    href: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}) {
  return (
    <div className="group relative">
      <div className="flex items-center">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#6d4c53] transition hover:bg-white/70 hover:text-[#4b1724]"
        >
          <span>{label}</span>
          <ChevronDown className="size-4" />
        </Link>
      </div>
      <div className="absolute left-0 top-full z-30 h-4 w-full" />
      <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 w-[32rem] -translate-x-1/2 rounded-[1.7rem] border border-[#e3c7a4] bg-[#fffaf1]/96 p-3 opacity-0 shadow-[0_25px_80px_rgba(111,36,50,0.12)] backdrop-blur transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="mb-2 rounded-[1.2rem] border border-[#f0dcc0] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a47279]">
            {label}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#75535a]">
            {label === "Tools"
              ? "Open the product surfaces inside Swarlabs."
              : "Learn the story, direction, and company context."}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-28 items-start gap-3 rounded-[1.25rem] border border-transparent bg-white/72 px-4 py-3 transition hover:border-[#e3c7a4] hover:bg-[#f7e9cf] hover:text-[#4b1724]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f2dfbf] text-[#6f2432]">
                <item.icon className="size-[18px]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#4b1724]">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-[#75535a]">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-transparent px-6 pt-3 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-full border border-white/80 bg-[#fffaf1]/84 px-5 py-3 shadow-[0_20px_60px_rgba(111,36,50,0.08)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[#ead6b6] bg-white shadow-[0_8px_24px_rgba(111,36,50,0.06)]">
            <Image src="/logo.svg" alt="Swarlabs logo" width={24} height={24} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-[#4b1724]">Swarlabs</p>
            <p className="text-xs uppercase tracking-[0.22em] text-[#a47279]">Language media workspace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <HoverMenu label="Tools" href={APP_DASHBOARD_URL} items={TOOL_MENU} />
          <HoverMenu label="Company" href="/about" items={COMPANY_MENU} />
        </nav>

        <div className="flex items-center gap-3">
          <TalkToSalesDialog />
          <Button
            asChild
            className="h-11 rounded-full bg-[#6f2432] px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(111,36,50,0.24)] hover:bg-[#5d1d2a]"
          >
            <Link href={APP_DASHBOARD_URL}>Go to app</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
