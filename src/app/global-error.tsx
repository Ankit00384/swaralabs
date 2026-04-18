"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { PROJECT_ISSUE_MESSAGE } from "@/lib/public-error-messages";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#f8f4ec] px-4">
        <main className="w-full max-w-lg rounded-3xl border border-[#e8dcc9] bg-white p-8 text-center shadow-[0_24px_70px_rgba(111,36,50,0.12)]">
          <h1 className="text-3xl font-semibold tracking-tight text-[#4b1724]">Something went wrong</h1>
          <p className="mt-4 text-base leading-7 text-[#6d4c53]">{PROJECT_ISSUE_MESSAGE}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#6f2432] px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(111,36,50,0.24)] transition hover:bg-[#5d1d2a]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
