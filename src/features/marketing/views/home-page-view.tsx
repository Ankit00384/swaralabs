"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, Globe2, Mic, Rocket, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_DASHBOARD_URL } from "@/lib/app-links";
import { cn } from "@/lib/utils";

import { MarketingHeader } from "../components/marketing-header";
import {
  MARKETING_SLIDES,
  type MarketingSlide,
  type SlideTone,
  VISION_COPY,
} from "../data/site-content";

function toneClasses(tone: SlideTone) {
  switch (tone) {
    case "amber":
      return {
        badge: "bg-[#f3d9a8] text-[#7d3f1d]",
        glow: "from-[#f5d9a6]/70 via-[#f8ead1]/60 to-transparent",
        card: "border-[#e9c889] bg-[#fffaf0]",
      };
    case "rose":
      return {
        badge: "bg-[#e7c2c5] text-[#6f2432]",
        glow: "from-[#e9c0c8]/75 via-[#f4d9de]/60 to-transparent",
        card: "border-[#dca6af] bg-[#fff8f8]",
      };
    case "emerald":
      return {
        badge: "bg-[#dbe6cb] text-[#4d6238]",
        glow: "from-[#d9e6c7]/75 via-[#eef3df]/60 to-transparent",
        card: "border-[#c8d8b0] bg-[#fbfdf6]",
      };
    case "violet":
      return {
        badge: "bg-[#dccbe3] text-[#5c3668]",
        glow: "from-[#dcc9e6]/75 via-[#efe4f4]/60 to-transparent",
        card: "border-[#ccb3d7] bg-[#fcf8ff]",
      };
    case "sky":
    default:
      return {
        badge: "bg-[#ead8bf] text-[#6f2432]",
        glow: "from-[#ead7b8]/70 via-[#f7edd9]/60 to-transparent",
        card: "border-[#dec59f] bg-[#fffaf2]",
      };
  }
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function StorySection({
  slide,
  index,
  sectionRef,
}: {
  slide: MarketingSlide;
  index: number;
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const { ref, visible } = useInView<HTMLElement>();
  const reverse = index % 2 === 1;
  const tone = toneClasses(slide.tone);
  const Icon = slide.icon;

  return (
    <section
      id={slide.id}
      ref={(node) => {
        ref.current = node;
        sectionRef?.(node);
      }}
      className="relative flex min-h-screen scroll-mt-28 items-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-75", tone.glow)} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(111,36,50,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(111,36,50,0.05)_1px,transparent_1px)] bg-[size:96px_96px]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/55 to-transparent" />

      <div
        className={cn(
          "relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]",
          reverse && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
        )}
      >
        <div
          className={cn(
            "rounded-[2.2rem] border border-white/60 bg-white/70 p-7 shadow-[0_30px_90px_rgba(111,36,50,0.10)] backdrop-blur-sm transition-all duration-700 sm:p-9",
            visible
              ? "translate-x-0 opacity-100"
              : reverse
                ? "translate-x-20 opacity-0"
                : "-translate-x-20 opacity-0",
          )}
        >
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold",
              tone.badge,
            )}
          >
            <Icon className="size-4" />
            <span>{slide.eyebrow}</span>
          </div>
          <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-[#4b1724] sm:text-5xl lg:text-6xl">
            {slide.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#75535a] sm:text-xl">
            {slide.body}
          </p>
        </div>

        <div
          className={cn(
            "transition-all duration-700",
            visible
              ? "translate-x-0 opacity-100"
              : reverse
                ? "-translate-x-20 opacity-0"
                : "translate-x-20 opacity-0",
          )}
        >
          <div
            className={cn(
              "rounded-[2.2rem] border p-6 shadow-[0_30px_100px_rgba(111,36,50,0.10)]",
              tone.card,
            )}
          >
            <div className="grid gap-4">
              {slide.points.map((point, pointIndex) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-[1.4rem] border border-[#eddcc0] bg-white/95 px-4 py-4"
                >
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-xs font-bold",
                      tone.badge,
                    )}
                  >
                    0{pointIndex + 1}
                  </div>
                  <span className="text-sm font-medium text-[#5f4a4f] sm:text-base">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePageView() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const sectionIds = useMemo(
    () => ["hero", ...MARKETING_SLIDES.map((slide) => slide.id), "cta"],
    [],
  );
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sections = sectionIds
      .map((id) => sectionRefs.current[id])
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target.id) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -18% 0px",
        threshold: [0.18, 0.4, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  function scrollToSection(id: string) {
    const section = sectionRefs.current[id];
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden bg-[#f8edd8] text-[#4b1724]">
      <MarketingHeader />

      <div className="fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 xl:flex xl:flex-col xl:gap-2">
        {sectionIds.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={`Go to ${id} section`}
            onClick={() => scrollToSection(id)}
            className={cn(
              "h-3 w-3 rounded-full border transition hover:scale-125",
              activeSection === id
                ? "border-[#6f2432] bg-[#6f2432]"
                : "border-[#cfa9ae] bg-white/70 hover:border-[#a85d69] hover:bg-[#e9c7cb]",
            )}
          />
        ))}
      </div>

      <section
        id="hero"
        ref={(node) => {
          sectionRefs.current.hero = node;
        }}
        className="relative flex min-h-[calc(100vh-88px)] scroll-mt-28 items-start overflow-hidden px-6 pb-10 pt-24 sm:px-10 sm:pt-28 lg:px-16"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(236,191,121,0.52),transparent_24%),radial-gradient(circle_at_75%_22%,rgba(155,68,84,0.18),transparent_20%),linear-gradient(180deg,#fff8eb_0%,#f8edd8_56%,#f4e0c1_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_24%,rgba(255,255,255,0.9),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(111,36,50,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(111,36,50,0.035)_1px,transparent_1px)] bg-[size:88px_88px]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center">
          <div className="grid w-full items-start gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
            <div className="max-w-4xl pt-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-5 py-2 text-sm font-semibold text-[#7d3f1d] shadow-[0_12px_30px_rgba(111,36,50,0.06)]">
              <Sparkles className="size-4" />
              <span>One connected workspace for language and media</span>
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-tight text-[#4b1724] sm:text-6xl lg:text-7xl">
                Bring useful tools together.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#6d4c53] sm:text-xl">
                Swarlabs is building a professional workspace for text to speech, speech to text,
                translation, extraction, and the next useful tools that belong in the same system.
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-[#88686d] sm:text-lg">
                We are not chasing a fake finish line. The platform grows as real needs grow,
                because useful tools are effectively infinite.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  className="h-14 rounded-full bg-[#6f2432] px-8 text-base font-semibold text-white shadow-[0_14px_32px_rgba(111,36,50,0.24)] hover:bg-[#5d1d2a]"
                >
                  <Link href={APP_DASHBOARD_URL}>
                    Go to app
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-[#e0c8a8] bg-white/88 px-8 text-base font-semibold text-[#4b1724] shadow-[0_10px_26px_rgba(111,36,50,0.06)] hover:bg-white"
                >
                  <Link href="/about">About Swarlabs</Link>
                </Button>
              </div>

              <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-[#ecd7b5] bg-white/72 px-4 py-4 shadow-[0_14px_32px_rgba(111,36,50,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6872]">Built around</p>
                  <p className="mt-2 text-lg font-semibold text-[#4b1724]">Useful workflows</p>
                </div>
                <div className="rounded-[1.6rem] border border-[#ecd7b5] bg-white/72 px-4 py-4 shadow-[0_14px_32px_rgba(111,36,50,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6872]">Designed for</p>
                  <p className="mt-2 text-lg font-semibold text-[#4b1724]">Language + media</p>
                </div>
                <div className="rounded-[1.6rem] border border-[#ecd7b5] bg-white/72 px-4 py-4 shadow-[0_14px_32px_rgba(111,36,50,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6872]">Meant to</p>
                  <p className="mt-2 text-lg font-semibold text-[#4b1724]">Keep expanding</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2.3rem] border border-white/80 bg-white/72 p-5 shadow-[0_26px_80px_rgba(111,36,50,0.10)] backdrop-blur xl:p-6">
              <div className="grid gap-5">
                <div className="rounded-[1.8rem] border border-[#efd9b6] bg-[#fffaf1] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa727a]">
                    Why Swarlabs
                  </p>
                  <div className="mt-5 grid gap-3 text-base leading-7 text-[#6d4c53]">
                    {VISION_COPY.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[0.95fr_1.1fr]">
                  <div className="rounded-[1.7rem] border border-[#ead0aa] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#f3d9a8] px-3 py-1 text-xs font-semibold text-[#7d3f1d]">
                        Text to speech
                      </span>
                      <AudioLines className="size-4 text-[#8d6770]" />
                    </div>
                    <div className="mt-5 rounded-[1.3rem] bg-[#f8f2e8] p-4">
                      <div className="h-2 w-24 rounded-full bg-[#ddc9a8]" />
                      <div className="mt-3 h-2 w-full rounded-full bg-[#efe3d0]" />
                      <div className="mt-2 h-2 w-[82%] rounded-full bg-[#efe3d0]" />
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] border border-[#dcb4bb] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#e7c2c5] px-3 py-1 text-xs font-semibold text-[#6f2432]">
                        Translate
                      </span>
                      <Globe2 className="size-4 text-[#8d6770]" />
                    </div>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl bg-[#fbf4f5] px-4 py-3 text-sm text-[#6a4f55]">
                        English to Hindi
                      </div>
                      <div className="rounded-2xl bg-[#fbf4f5] px-4 py-3 text-sm text-[#6a4f55]">
                        Meaning stays intact
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-[#d7c7aa] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#ead8bf] px-3 py-1 text-xs font-semibold text-[#6f2432]">
                      Speech to text
                    </span>
                    <Mic className="size-4 text-[#8d6770]" />
                  </div>
                  <div className="mt-5 rounded-[1.3rem] bg-[#f7f0e5] p-4">
                    <p className="text-sm font-medium text-[#6a4f55]">
                      Inputs can start anywhere. The workflow should still stay together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {MARKETING_SLIDES.map((slide, index) => (
        <StorySection
          key={slide.id}
          slide={slide}
          index={index}
          sectionRef={(node) => {
            sectionRefs.current[slide.id] = node;
          }}
        />
      ))}

      <section
        id="cta"
        ref={(node) => {
          sectionRefs.current.cta = node;
        }}
        className="relative flex min-h-screen scroll-mt-28 items-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,194,197,0.45),transparent_30%),linear-gradient(180deg,#faefdd_0%,#f5e5cb_100%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#6f2432] px-4 py-2 text-sm font-semibold text-white">
              <Rocket className="size-4" />
              Start here
            </p>
            <h2 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-[#4b1724] sm:text-6xl">
              Swarlabs is building a living platform for useful tools.
            </h2>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-[#6d4c53]">
              Jump into the app now, explore the tools, or come back to the company story as the platform keeps expanding.
            </p>
          </div>
          <Button
            asChild
            className="h-14 rounded-full bg-[#6f2432] px-8 text-base font-semibold text-white hover:bg-[#5d1d2a]"
          >
            <Link href={APP_DASHBOARD_URL}>
              Go to app
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
