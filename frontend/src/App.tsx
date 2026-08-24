import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import "@/theme/material";
import { CommandPalette } from "@/components/CommandPalette";
import { NavBar } from "@/components/NavBar";
import { HistoryView } from "@/views/HistoryView";
import { ReadingDetailView } from "@/views/ReadingDetailView";
import { ReadingView } from "@/views/ReadingView";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <NavBar onOpenPalette={() => setPaletteOpen(true)} />
        <Routes>
          <Route path="/" element={<ReadingView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/readings/:id" element={<ReadingDetailView />} />
        </Routes>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--md-sys-color-surface-container-high)",
              color: "var(--md-sys-color-on-surface)",
              border: "1px solid var(--md-sys-color-outline-variant)",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
