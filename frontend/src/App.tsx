import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReadingView } from "@/views/ReadingView";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <nav className="flex items-center justify-end px-6 pt-5">
          <span className="font-utility text-[0.6rem] tracking-[0.3em] text-on-surface-variant/60 uppercase">
            readings Â· soon: history
          </span>
        </nav>
        <ReadingView />
      </div>
    </QueryClientProvider>
  );
}
