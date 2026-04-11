export function HeroPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="absolute -right-16 top-8 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-white/95 via-white/75 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-size-[42px_42px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(173,234,236,0.4)_0%,transparent_55%)]" />
    </div>
  );
}