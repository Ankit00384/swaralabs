import { Skeleton } from "@/components/ui/skeleton";

export default function TextToSpeechLoading() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50/50 p-4 lg:p-10">
      <div className="mx-auto flex w-full max-w-250 flex-col gap-6 pb-12 lg:gap-8">
        <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <Skeleton className="h-10 w-36 rounded-full" />
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
          </div>
        </div>

        <div className="hidden rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:block">
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}