import { Skeleton } from "@/components/ui/skeleton";

export default function VoicesLoading() {
  return (
    <div className="flex-1 space-y-8 overflow-y-auto p-3 lg:p-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-[min(34rem,100%)]" />
        <Skeleton className="h-10 w-[min(28rem,100%)]" />
      </div>

      {[1, 2, 3].map((section) => (
        <section key={section} className="space-y-4">
          <Skeleton className="h-6 w-44" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2].map((card) => (
              <div
                key={`${section}-${card}`}
                className="rounded-xl border border-border/70 bg-card/50 p-4"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}