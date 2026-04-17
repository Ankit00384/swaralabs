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
      <PageHeader title="Home" className="lg:hidden" />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-8">
        <section className="flex min-h-[calc(100vh-8rem)] items-center py-6">
          <div className="grid w-full gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Swarlabs workspace</span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  Use the tools directly.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  This home page is now focused on what matters: entering the right tool fast,
                  understanding what the platform is for, and moving into real work without noise.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild className="h-14 rounded-full px-8 text-base font-semibold shadow-[0_16px_30px_rgba(111,36,50,0.18)]">
                  <Link href="/text-to-speech" prefetch>
                    Open Text to Speech
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-border bg-card/75 px-8 text-base font-semibold"
                >
                  <Link href="/translate" prefetch>
                    Open Translate
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {toolCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`group rounded-[1.9rem] border p-6 shadow-[0_20px_50px_rgba(111,36,50,0.08)] transition-transform hover:-translate-y-1 ${card.panel}`}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {card.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    Open tool
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[90vh] items-center py-8">
          <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="rounded-[2.2rem] border border-border bg-card/85 p-7 shadow-[0_24px_60px_rgba(111,36,50,0.08)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
                <Layers3 className="h-4 w-4" />
                About the project
              </div>

              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Swarlabs is a connected tool system, not a random dashboard.
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                The project is about bringing the most useful language and media tools into one place
                with a shared design language and a shared workflow logic.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="h-14 rounded-full px-7 text-sm font-semibold">
                  <Link href="/about" prefetch>
                    Read About Swarlabs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-14 rounded-full border-border bg-card/70 px-7 text-sm font-semibold">
                  <Link href="/voices" prefetch>
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

              <div className="rounded-[1.9rem] border border-border bg-gradient-to-br from-card via-card to-accent/40 p-6 shadow-[0_18px_44px_rgba(111,36,50,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Quick entry
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link href="/speech-to-text" className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
                    Open Speech to Text
                  </Link>
                  <Link href="/text-extractor" className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
                    Open Text Extractor
                  </Link>
                  <Link href="/translate" className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
                    Open Translate
                  </Link>
                  <Link href="/text-to-speech" className="rounded-[1.2rem] border border-border bg-background/80 px-4 py-4 text-sm font-medium text-foreground transition hover:bg-background">
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
