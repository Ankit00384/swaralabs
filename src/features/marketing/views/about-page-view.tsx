import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_DASHBOARD_URL } from "@/lib/app-links";

import { MarketingHeader } from "../components/marketing-header";
import { MARKETING_SLIDES, VISION_COPY } from "../data/site-content";

function toneStyles(tone: (typeof MARKETING_SLIDES)[number]["tone"]) {
  switch (tone) {
    case "amber":
      return {
        badge: "bg-[#f3d9a8] text-[#7d3f1d]",
        border: "border-[#e7c88f]",
        panel: "bg-[#fff8ee]",
        accent: "bg-[#eabf72]",
      };
    case "rose":
      return {
        badge: "bg-[#e7c2c5] text-[#6f2432]",
        border: "border-[#dbadb4]",
        panel: "bg-[#fff7f7]",
        accent: "bg-[#b65d6d]",
      };
    case "emerald":
      return {
        badge: "bg-[#dbe6cb] text-[#476136]",
        border: "border-[#c7d5b3]",
        panel: "bg-[#fbfdf7]",
        accent: "bg-[#93ab69]",
      };
    case "violet":
      return {
        badge: "bg-[#ddd0e6] text-[#5d3d67]",
        border: "border-[#d0bfdc]",
        panel: "bg-[#fbf8ff]",
        accent: "bg-[#9a7cb3]",
      };
    case "sky":
    default:
      return {
        badge: "bg-[#ead8bf] text-[#6f2432]",
        border: "border-[#ddc49f]",
        panel: "bg-[#fffaf2]",
        accent: "bg-[#cda86a]",
      };
  }
}

export function AboutPageView() {
  return (
    <div className="min-h-screen bg-[#f6e9d2] text-[#4b1724]">
      <MarketingHeader />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,194,129,0.44),transparent_22%),radial-gradient(circle_at_85%_12%,rgba(149,63,79,0.12),transparent_18%),linear-gradient(180deg,#fff8eb_0%,#f6e9d2_52%,#f1dfc0_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(111,36,50,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(111,36,50,0.035)_1px,transparent_1px)] bg-[size:90px_90px]" />

        <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-14 sm:px-10 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div className="rounded-[2.4rem] border border-white/80 bg-white/72 p-8 shadow-[0_32px_90px_rgba(111,36,50,0.10)] backdrop-blur-sm sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9b6d74]">
                About Swarlabs
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-[#4b1724] sm:text-6xl lg:text-7xl">
                A platform for useful tools, built as a living system.
              </h1>

              <div className="mt-8 grid gap-5 text-lg leading-8 text-[#6c4d53]">
                {VISION_COPY.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  asChild
                  className="h-14 rounded-full bg-[#6f2432] px-7 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(111,36,50,0.22)] hover:bg-[#5f1f2b]"
                >
                  <Link href={APP_DASHBOARD_URL}>
                    Enter the platform
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-[#dfc7a7] bg-white/80 px-7 text-sm font-semibold text-[#4b1724] hover:bg-white"
                >
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-[#e5cca7] bg-[#fff9ef]/92 p-6 shadow-[0_24px_60px_rgba(111,36,50,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a7742a]">
                  Position
                </p>
                <p className="mt-4 text-2xl font-semibold leading-tight text-[#4b1724]">
                  Not a one-tool product. Not a feature pile. A system designed to keep earning new tools.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.7rem] border border-[#d9b8be] bg-[#fff7f7]/95 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b6d74]">
                    Build logic
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#6c4d53]">
                    Each product should feel connected in language, behavior, and workflow instead of feeling bolted on.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-[#d9c8a6] bg-[#fffaf2]/95 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b6d74]">
                    Long view
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#6c4d53]">
                    The roadmap stays open because useful work keeps changing and the platform has to stay alive with it.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_24px_60px_rgba(111,36,50,0.08)]">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6d74]">
                      Principle
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#4b1724]">Useful over flashy</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6d74]">
                      Product shape
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#4b1724]">Shared workspace</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6d74]">
                      Ambition
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#4b1724]">Open-ended platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-6 sm:px-10 lg:px-16">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b6d74]">
                The System
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#4b1724] sm:text-5xl">
                A clearer structure for what Swarlabs is becoming.
              </h2>
            </div>
            <p className="hidden max-w-md text-sm leading-7 text-[#7d5f65] lg:block">
              Same content, stronger hierarchy. The page now reads more like a designed product narrative than a list of startup claims.
            </p>
          </div>

          <div className="grid gap-6">
            {MARKETING_SLIDES.map((slide, index) => {
              const tone = toneStyles(slide.tone);
              const reverse = index % 2 === 1;
              const Icon = slide.icon;

              return (
                <article
                  key={slide.id}
                  className={`grid gap-6 rounded-[2.2rem] border ${tone.border} ${tone.panel} p-6 shadow-[0_24px_70px_rgba(111,36,50,0.08)] lg:grid-cols-[0.92fr_1.08fr] lg:p-8 ${
                    reverse ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""
                  }`}
                >
                  <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${tone.badge}`}>
                        <Icon className="size-4" />
                        <span>{slide.eyebrow}</span>
                      </div>
                      <div className={`hidden h-3 w-24 rounded-full lg:block ${tone.accent}`} />
                    </div>

                    <h3 className="mt-5 text-3xl font-semibold tracking-tight text-[#4b1724]">
                      {slide.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-[#6c4d53]">{slide.body}</p>
                  </div>

                  <div className="grid gap-3">
                    {slide.points.map((point, pointIndex) => (
                      <div
                        key={point}
                        className="flex items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/85 px-4 py-4"
                      >
                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${tone.badge}`}>
                          0{pointIndex + 1}
                        </div>
                        <p className="text-sm font-medium leading-7 text-[#5f454b] sm:text-base">{point}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
