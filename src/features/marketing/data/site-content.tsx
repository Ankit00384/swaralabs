import {
  AudioLines,
  Blocks,
  FileImage,
  Globe2,
  Layers3,
  Mic,
  Orbit,
  Shapes,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SlideTone = "sky" | "amber" | "rose" | "emerald" | "violet";

export type MarketingSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  tone: SlideTone;
  icon: LucideIcon;
};

export const TOOL_LINKS = [
  { href: "/text-to-speech", label: "Text to Speech" },
  { href: "/speech-to-text", label: "Speech to Text" },
  { href: "/translate", label: "Text Translate" },
  { href: "/text-extractor", label: "Text Extractor" },
] as const;

export const COMPANY_LINKS = [
  { href: "/about", label: "About Swarlabs" },
  { href: "/careers", label: "Careers" },
] as const;

export const CAREERS_OPENINGS = 0;

export const VISION_COPY = [
  "Swarlabs is building toward one platform for useful language and media tools.",
  "The goal is not to claim completion. It is to keep bringing the next useful capability into the same system with the same clarity and product language.",
  "There are infinitely many useful tools, so the platform should stay alive, expandable, and practical for real work.",
] as const;

export const MARKETING_SLIDES: MarketingSlide[] = [
  {
    id: "platform",
    eyebrow: "One evolving workspace",
    title: "Swarlabs brings language and media tools into one place.",
    body:
      "Instead of jumping between scattered products, teams can create, transform, review, and ship from a single, focused surface.",
    points: [
      "Built for Indian language workflows first",
      "Designed for creators, teams, and operations together",
      "Made to grow without turning into a messy toolbox",
    ],
    tone: "sky",
    icon: Layers3,
  },
  {
    id: "tts",
    eyebrow: "Product 01",
    title: "Text to Speech that feels production-ready, not demo-ready.",
    body:
      "Generate expressive narration, try voices quickly, and move from raw script to preview without breaking your pace.",
    points: [
      "Fast generation flow",
      "Voice previews and selection",
      "Made for real scripts, not toy examples",
    ],
    tone: "amber",
    icon: AudioLines,
  },
  {
    id: "stt",
    eyebrow: "Product 02",
    title: "Speech to Text that helps capture what people actually say.",
    body:
      "Handle spoken language, mixed-language conversation, and rough recordings with a workflow that is practical and fast.",
    points: [
      "Transcribe spoken content",
      "Support multilingual input patterns",
      "Turn recordings into usable text",
    ],
    tone: "rose",
    icon: Mic,
  },
  {
    id: "translate",
    eyebrow: "Product 03",
    title: "Translation that stays close to tone, meaning, and context.",
    body:
      "Useful translation is not just word replacement. Swarlabs is shaping tools that keep intent intact while staying easy to use.",
    points: [
      "Useful for working drafts and live workflows",
      "Better handoff between input and output language",
      "Fits into the same product surface as the rest of the tools",
    ],
    tone: "emerald",
    icon: Globe2,
  },
  {
    id: "extract",
    eyebrow: "Product 04",
    title: "Extract text from images and documents without changing tools.",
    body:
      "When content starts in screenshots, scans, or files, the next step should still happen in the same workspace.",
    points: [
      "Capture text from visual material",
      "Continue into translate or speech instantly",
      "Keep teams inside one product loop",
    ],
    tone: "violet",
    icon: FileImage,
  },
  {
    id: "teams",
    eyebrow: "Shared system",
    title: "Organizations, voices, prompts, and output should feel connected.",
    body:
      "Swarlabs is being shaped as a multi-tool platform where teams can move through work together instead of rebuilding context in every feature.",
    points: [
      "Organization-aware experience",
      "Shared voice and workflow context",
      "Less friction between tools and teammates",
    ],
    tone: "sky",
    icon: Users,
  },
  {
    id: "vision",
    eyebrow: "Core vision",
    title: "Bring the most useful tools under one platform.",
    body:
      "That mission is intentionally unfinished. It is not complete today, and it probably never will be, because useful tools keep expanding with real human needs.",
    points: [
      "The platform grows as needs grow",
      "There is no fake finish line",
      "Useful beats complete",
    ],
    tone: "amber",
    icon: Orbit,
  },
  {
    id: "system",
    eyebrow: "Design principle",
    title: "Not a pile of features. A system.",
    body:
      "Every addition should feel like it belongs to the same product language, the same workflow logic, and the same long-term direction.",
    points: [
      "Consistent interaction patterns",
      "Symmetry across tools and surfaces",
      "Clarity before complexity",
    ],
    tone: "rose",
    icon: Shapes,
  },
  {
    id: "future",
    eyebrow: "Open-ended roadmap",
    title: "The roadmap is alive because the platform is alive.",
    body:
      "New tools can join the system when they earn their place. Swarlabs is meant to stay flexible enough for the next useful thing.",
    points: [
      "Built to expand without losing identity",
      "Future tools can plug into the same foundation",
      "The platform becomes stronger as it connects more work",
    ],
    tone: "emerald",
    icon: Blocks,
  },
];
