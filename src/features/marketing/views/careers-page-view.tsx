import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MarketingHeader } from "../components/marketing-header";
import { CAREERS_OPENINGS } from "../data/site-content";

export function CareersPageView() {
  return (
    <div className="min-h-screen bg-[#f6fbff] text-slate-950">
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-16">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Company</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">Careers at Swarlabs</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          We are keeping this page ready as the company grows. For now, there are no open roles, but the mission is active and the platform is evolving.
        </p>

        <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Current openings</p>
          <div className="mt-4 flex items-end gap-4">
            <span className="text-6xl font-semibold tracking-tight text-slate-950">{CAREERS_OPENINGS}</span>
            <span className="pb-2 text-lg text-slate-500">open positions right now</span>
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-600">
            If you want to introduce yourself early, you can still reach out through the sales/contact flow on the homepage.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-8 h-11 rounded-full border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
