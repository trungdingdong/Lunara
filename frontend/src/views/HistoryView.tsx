import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { HistoryGridSkeleton } from "@/components/Skeleton";
import { ReadingCard } from "@/components/ReadingCard";

export function HistoryView() {
  const readingsQuery = useQuery({
    queryKey: queryKeys.readings.list(24, 0),
    queryFn: () => api.getReadings(24, 0),
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24">
      <header className="pt-12 pb-10">
        <h1 className="font-display text-4xl font-semibold text-on-surface">History</h1>
        <p className="mt-2 font-body text-sm text-on-surface-variant">
          Every reading is kept — cards, question and interpretation.
        </p>
      </header>

      {readingsQuery.isPending ? (
        <HistoryGridSkeleton />
      ) : readingsQuery.isError ? (
        <p role="alert" className="border-l-2 border-error pl-4 font-body text-sm text-on-surface-variant">
          Could not load history. Is the API reachable?
        </p>
      ) : readingsQuery.data.length === 0 ? (
        <p className="font-body text-sm text-on-surface-variant">
          No readings yet. Your first one is waiting on the Reading page.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {readingsQuery.data.map((reading) => (
            <ReadingCard key={reading.id} reading={reading} />
          ))}
        </div>
      )}
    </main>
  );
}
