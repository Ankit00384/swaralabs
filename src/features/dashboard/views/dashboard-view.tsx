import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  FileImage,
  Layers3,
  MessageSquareMore,
  Mic,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

const toolCards = [
  {
    title: "Text to Speech",
    description: "Turn scripts, drafts, and narration into polished voice output.",
    href: "/text-to-speech",
    icon: AudioLines,
    accent: "bg-[#f3d9a8] text-[#7d3f1d]",
    panel: "border-[#e4c48b] bg-[#fff8ef]",
  },
  {
    title: "Speech to Text",
    description: "Upload or record audio and move into clean transcription flows.",
    href: "/speech-to-text",
    icon: Mic,
    accent: "bg-[#e7c2c5] text-[#6f2432]",
    panel: "border-[#ddb1b9] bg-[#fff7f7]",
  },
  {
    title: "Text Translate",
    description: "Translate across languages with a workspace built for real use.",
    href: "/translate",
    icon: MessageSquareMore,
    accent: "bg-[#ddd0e6] text-[#5d3d67]",
    panel: "border-[#d0bfdc] bg-[#fbf8ff]",
  },
  {
    title: "Text Extractor",
    description: "Pull text from documents, scans, screenshots, and images quickly.",
    href: "/text-extractor",
    icon: FileImage,
    accent: "bg-[#dbe6cb] text-[#476136]",
    panel: "border-[#c7d5b3] bg-[#fbfdf7]",
  },
] as const;

const projectNotes = [
  "One connected workspace for language and media tools.",
  "Each tool should feel related, not bolted on.",
  "The platform should stay useful, expandable, and practical.",
  "Real workflows matter more than showing off features.",
] as const;

export function DashboardView() {
  return (
    <div className="h-full overflow-y-auto scroll-smooth">
      <PageHeader title="Home" className="hidden lg:flex" />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8">
        <section className="flex items-start py-4 sm:py-6 lg:min-h-[calc(100vh-8rem)] lg:items-center">
          <div className="grid w-full gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="order-2 space-y-6 lg:order-1 lg:space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm sm:px-4 sm:py-2 sm:text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Swarlabs workspace</span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                  One Workspace for Language &amp; Media
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl sm:leading-8">
                  Swarlabs brings text-to-speech, speech-to-text, translation, and extraction into
                  one connected platform. Built for real workflows, it helps teams create,
                  transform, and ship content without switching tools. An evolving system designed
                  to grow with every new useful capability.
                </p>
              </div>

              <div className="grid w-full max-w-md gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:gap-4">
                <Button asChild className="h-12 w-full rounded-full px-6 text-sm font-semibold shadow-[0_16px_30px_rgba(111,36,50,0.18)] sm:h-14 sm:w-auto sm:px-8 sm:text-base">
                  <Link href="/text-to-speech" prefetch={false}>
                    Open Text to Speech
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full rounded-full border-border bg-card/75 px-6 text-sm font-semibold sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                >
                  <Link href="/translate" prefetch={false}>
                    Open Translate
                  </Link>
                </Button>
              </div>
            </div>

            <div className="order-1 grid gap-3 sm:grid-cols-2 lg:order-2 lg:gap-4">
              {toolCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  prefetch={false}
                  className={`group rounded-[1.6rem] border p-4 shadow-[0_20px_50px_rgba(111,36,50,0.08)] transition-transform hover:-translate-y-1 sm:rounded-[1.9rem] sm:p-6 ${card.panel}`}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${card.accent}`}>
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-2xl">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:leading-7">
                    {card.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground sm:mt-6">
                    Open tool
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-start py-6 sm:py-8 lg:min-h-[90vh] lg:items-center">
          <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="rounded-[1.7rem] border border-border bg-card/85 p-5 shadow-[0_24px_60px_rgba(111,36,50,0.08)] sm:rounded-[2.2rem] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:px-3.5 sm:py-1.5 sm:text-sm">
                <Layers3 className="h-4 w-4" />
                About the project
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl lg:text-5xl">
                Swarlabs is a connected tool system, not a random dashboard.
              </h2>

              <p className="mt-4 text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
                The project is about bringing the most useful language and media tools into one place
                with a shared design language and a shared workflow logic.
              </p>

              <div className="mt-6 grid w-full max-w-md gap-3 sm:mt-8 sm:flex sm:max-w-none sm:flex-wrap sm:gap-4">
                <Button asChild className="h-12 w-full rounded-full px-6 text-sm font-semibold sm:h-14 sm:w-auto sm:px-7">
                  <Link href="/about" prefetch={false}>
                    Read About Swarlabs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full rounded-full border-border bg-card/70 px-6 text-sm font-semibold sm:h-14 sm:w-auto sm:px-7">
                  <Link href="/voices" prefetch={false}>
                    Explore voices
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {projectNotes.map((note, index) => (
                <div
                  key={note}
                  className="rounded-[1.7rem] border border-border bg-card/85 p-5 shadow-[0_18px_44px_rgba(111,36,50,0.06)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-base leading-7 text-foreground/85">{note}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-[1.9rem] border border-border bg-linear-to-br from-card via-card to-accent/40 p-6 shadow-[0_18px_44px_rgba(111,36,50,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Quick entry
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link href="/speech-to-text" prefetch={false} className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
                    Open Speech to Text
                  </Link>
                  <Link href="/text-extractor" prefetch={false} className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
                    Open Text Extractor
                  </Link>
                  <Link href="/translate" prefetch={false} className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
                    Open Translate
                  </Link>
                  <Link href="/text-to-speech" prefetch={false} className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
                    Open Text to Speech
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
