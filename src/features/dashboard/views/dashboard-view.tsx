import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileImage,
  Globe,
  Headphones,
  Layers3,
  Languages,
  Mic,
  MessageSquareMore,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  WandSparkles,
  Workflow,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    icon: AudioLines,
    title: "Text to Speech",
    description:
      "Turn drafts, product copy, explainers, and narration into polished voice output with production-ready pacing.",
    href: "/text-to-speech",
    accent: "from-sky-500/15 to-cyan-500/10 text-sky-600 dark:text-sky-300",
  },
  {
    icon: FileImage,
    title: "Text Extractor",
    description:
      "Pull accurate text from PDFs, scans, and images with a workflow that stays fast even on longer documents.",
    href: "/text-extractor",
    accent: "from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-300",
  },
  {
    icon: Languages,
    title: "Voice Library",
    description:
      "Browse a structured voice catalog with distinct tones, accents, and styles for different use cases.",
    href: "/voices",
    accent: "from-amber-500/15 to-orange-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    icon: Mic,
    title: "Speech to Text",
    description:
      "Record live speech or upload audio and move into a transcription workspace with a single click.",
    href: "/speech-to-text",
    accent: "from-rose-500/15 to-pink-500/10 text-rose-600 dark:text-rose-300",
  },
  {
    icon: MessageSquareMore,
    title: "Text Translate",
    description:
      "Translate content with a polished interface that keeps tone, numbers, and script controls close at hand.",
    href: "/translate",
    accent: "from-violet-500/15 to-fuchsia-500/10 text-violet-600 dark:text-violet-300",
  },
] as const;

const metrics = [
  { value: "4", label: "connected tools", tone: "bg-slate-900 text-white dark:bg-white dark:text-slate-950" },
  { value: "24/7", label: "always available", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { value: "1 click", label: "fast routing", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { value: "10+", label: "workflows below", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
] as const;

const processSteps = [
  {
    step: "01",
    title: "Pick a workflow",
    description:
      "Choose the right lane for content creation, transcription, extraction, or voice browsing without leaving the dashboard.",
  },
  {
    step: "02",
    title: "Input your source",
    description:
      "Drop in text, upload files, or start speaking. Each entry point is tuned for quick, low-friction capture.",
  },
  {
    step: "03",
    title: "Review the result",
    description:
      "Use the result page to inspect output, copy text, listen back, or keep iterating until it feels right.",
  },
  {
    step: "04",
    title: "Reuse at scale",
    description:
      "Build a repeatable content system with the same tools, same style, and consistent output across teams.",
  },
] as const;

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Reliable by design",
    description:
      "The home page sets up a stable, predictable path into each tool so the experience stays clear for new users.",
  },
  {
    icon: BadgeCheck,
    title: "Clear handoffs",
    description:
      "Each flow moves to a dedicated workspace or result page, so the app feels structured instead of crowded.",
  },
  {
    icon: Clock3,
    title: "Faster repetition",
    description:
      "Frequent tasks are surfaced near the top, then expanded into a deeper story for teams that need more context.",
  },
] as const;

const languagePills = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Punjabi",
  "Urdu",
  "Odia",
] as const;

const scenarioCards = [
  {
    title: "Product teams",
    text: "Create demos, release narration, onboarding walkthroughs, and support clips with one dashboard.",
    icon: Rocket,
  },
  {
    title: "Operations teams",
    text: "Convert meetings, notes, and field recordings into searchable text that can be reviewed quickly.",
    icon: Workflow,
  },
  {
    title: "Content studios",
    text: "Draft, refine, voice, and ship long-form content with a structure that supports repeated production.",
    icon: WandSparkles,
  },
  {
    title: "Analysts and researchers",
    text: "Use extraction, transcription, and playback together to move from raw input to usable insight.",
    icon: BarChart3,
  },
] as const;

const outcomeCards = [
  {
    icon: Target,
    title: "Focused execution",
    text: "The page centers the main jobs first, then progressively reveals supporting context and secondary tools.",
  },
  {
    icon: Globe,
    title: "Language breadth",
    text: "Built to support multilingual work so teams can operate across the languages they actually use every day.",
  },
  {
    icon: Layers3,
    title: "Organized depth",
    text: "Long-form sections give the page a premium, editorial feel while still keeping the structure easy to scan.",
  },
  {
    icon: Headphones,
    title: "Playback-friendly",
    text: "The experience is designed so audio, transcript, and result review can all live comfortably together.",
  },
] as const;

const marqueeItems = [...languagePills, ...languagePills];

export function DashboardView() {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_24%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(241,245,249,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_24%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(15,23,42,0.96))]">
      <PageHeader title="Home" className="lg:hidden" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-24 px-4 pb-20 pt-8 sm:px-6 lg:px-10 lg:pt-14">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-drift absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="animate-drift absolute right-0 top-96 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl [animation-delay:1.5s]" />
          <div className="animate-drift absolute bottom-16 left-1/3 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl [animation-delay:2.5s]" />
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="animate-slide-in-left space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-sky-500" />
              <span>Resonance dashboard</span>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-slate-950">
                premium workspace
              </span>
            </div>

            <div className="max-w-3xl space-y-5">
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                A cleaner home for building audio, text, and transcription workflows.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
                This home page is laid out like a product brief: a strong hero, clear paths into each tool, deeper context for
                teams, and enough content to feel complete without turning into a wall of noise.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/text-to-speech">
                <Button size="lg" className="group h-14 rounded-full px-7 text-base font-semibold shadow-lg shadow-slate-900/10">
                  Start creating
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/speech-to-text">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full border-slate-300/70 bg-background/70 px-7 text-base font-semibold backdrop-blur hover:bg-slate-950 hover:text-white dark:border-white/15 dark:bg-white/5 dark:hover:bg-white dark:hover:text-slate-950"
                >
                  Open transcription
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="animate-fade-rise rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className={`inline-flex rounded-2xl px-3 py-1 text-2xl font-semibold ${metric.tone}`}>
                    {metric.value}
                  </div>
                  <p className="mt-3 text-sm font-medium text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-slide-in-right relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20 dark:border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_26%)]" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Studio preview</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">Long-form content orchestration</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                    Live ready
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Today</p>
                    <p className="mt-3 text-3xl font-semibold">18</p>
                    <p className="mt-2 text-sm text-slate-300">assets prepared for review</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Queue</p>
                    <p className="mt-3 text-3xl font-semibold">04</p>
                    <p className="mt-2 text-sm text-slate-300">projects moving in parallel</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Latency</p>
                    <p className="mt-3 text-3xl font-semibold">Low</p>
                    <p className="mt-2 text-sm text-slate-300">smooth input to output flow</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_0.88fr]">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-300">
                        <WandSparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Featured flow</p>
                        <p className="text-lg font-semibold">Voice, extract, and transcribe from one surface</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-slate-300">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                        <span>Text to Speech</span>
                        <span className="text-sky-300">Ready</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                        <span>OCR extraction</span>
                        <span className="text-emerald-300">Queued</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                        <span>Speech to Text</span>
                        <span className="text-amber-300">Live</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur animate-drift">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview output</p>
                      <p className="mt-3 text-xl font-semibold leading-8">
                        Build a dashboard that feels less like a utility and more like a premium studio.
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        Designed for long pages, clear hierarchy, and repeat usage.
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quality</p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">Structured, not crowded</p>
                          <p className="text-sm text-slate-300">A visual system with enough breathing room to feel intentional.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Capabilities</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Four primary tools, presented like a product suite.
              </h2>
            </div>
            <p className="hidden max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400 lg:block">
              Each card links to a dedicated flow and uses a different accent so the page stays readable even when it gets long.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {featureCards.map((card, index) => (
              <Link
                key={card.title}
                href={card.href}
                className="group animate-fade-rise relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/10 dark:border-white/10 dark:bg-white/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-linear-to-br ${card.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative flex h-full flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/80 text-slate-950 shadow-sm dark:bg-white/10 dark:text-white">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                    Open tool
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Motion strip</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                A moving language band gives the page a more alive, studio-like feel.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              The moving rows below create the slide effect you asked for while staying subtle enough to keep the page professional.
            </p>
          </div>

          <div className="space-y-4 overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-slate-950 px-4 py-5 text-white dark:border-white/10">
            <div className="flex w-[200%] gap-3 animate-marquee">
              {marqueeItems.map((language, index) => (
                <div
                  key={`${language}-${index}`}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200"
                >
                  {language}
                </div>
              ))}
            </div>
            <div className="flex w-[200%] gap-3 animate-marquee-reverse opacity-80">
              {marqueeItems.map((language, index) => (
                <div
                  key={`reverse-${language}-${index}`}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300"
                >
                  {language}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Designed to feel like a guided sequence, not a cluttered index.
              </h2>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="relative space-y-6 pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-linear-to-b from-sky-500 via-emerald-500 to-amber-500" />
                {processSteps.map((item, index) => (
                  <div key={item.step} className="relative animate-fade-rise pl-2" style={{ animationDelay: `${index * 120}ms` }}>
                    <div className="absolute -left-2.75 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-slate-900 shadow-sm dark:border-slate-950 dark:bg-white" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{item.step}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {scenarioCards.map((item, index) => (
              <div
                key={item.title}
                className="animate-fade-rise rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Why it feels premium</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                The layout opens up slowly, so the page keeps rewarding scrolling.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Each section adds more texture and detail. The result is a home page that feels deeper than a standard dashboard.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {outcomeCards.map((item, index) => (
              <div
                key={item.title}
                className="animate-fade-rise rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-stretch">
          <div className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 dark:border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Trust</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Designed to keep teams moving</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                Production feel
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {trustPoints.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">
                The styling uses strong contrast, clear spacing, and layered sections so the page feels deliberate from top to bottom.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
                <MessageSquareMore className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Feedback loop</p>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">A page that keeps adding context as you scroll</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  The goal here is not just to fill space. It’s to create a more credible first impression with enough structure for a real product
                  home screen.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Strong headings, motion accents, and repeated visual rhythm help the page feel more intentional than a typical dashboard grid.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  There’s enough copy here to support a long scroll, while still leaving the key actions easy to spot near the top.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Final action</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Ready for a cleaner product-first home page.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              The final section keeps the navigation obvious and gives the page a proper ending instead of a hard stop.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
                <CheckCircle2 className="h-4 w-4" />
                Multi-tool dashboard
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Clock3 className="h-4 w-4" />
                Scroll-friendly layout
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <BadgeCheck className="h-4 w-4" />
                Professional tone
              </div>
            </div>

            <Link href="/text-to-speech">
              <Button size="lg" className="group h-14 rounded-full px-7 text-base font-semibold shadow-lg shadow-slate-900/10">
                Start with voice
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
