import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import "@/theme/material";
import { ROUTES } from "@/routes";
import { queryClient } from "@/lib/queryClient";
import { CommandPalette } from "@/components/CommandPalette";
import { NavBar } from "@/components/NavBar";
import { HistoryView } from "@/views/HistoryView";
import LandingView from "@/views/LandingView";
import { ReadingDetailView } from "@/views/ReadingDetailView";
import { ReadingView } from "@/views/ReadingView";

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <NavBar onOpenPalette={() => setPaletteOpen(true)} />
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingView />} />
          <Route path={ROUTES.READING} element={<ReadingView />} />
          <Route path={ROUTES.HISTORY} element={<HistoryView />} />
          <Route path={ROUTES.READING_DETAIL} element={<ReadingDetailView />} />
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
