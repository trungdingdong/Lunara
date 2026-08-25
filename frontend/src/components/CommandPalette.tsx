import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { useSpreadDraftStore } from "@/stores/spreadDraft";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "New reading", to: "/reading" },
  { label: "History", to: "/history" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const setSpreadId = useSpreadDraftStore((state) => state.setSpreadId);
  const spreadsQuery = useQuery({
    queryKey: ["spreads"],
    queryFn: api.getSpreads,
    enabled: open,
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function go(to: string) {
    onOpenChange(false);
    navigate(to);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Site navigation"
      shouldFilter
      className="fixed inset-x-0 top-[18%] z-50 mx-auto w-[min(92vw,540px)] overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-2xl outline-none"
    >
      <Command.Input
        placeholder="Jump to…"
        className="w-full border-b border-outline-variant bg-transparent px-5 py-4 font-body text-base text-on-surface outline-none placeholder:text-on-surface-variant"
      />
      <Command.List className="max-h-72 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center font-body text-sm text-on-surface-variant">
          Nothing matches.
        </Command.Empty>

        <Command.Group heading="Navigate" className="palette-group">
          {NAV_ITEMS.map((item) => (
            <Command.Item
              key={item.to}
              value={`go ${item.label}`}
              onSelect={() => go(item.to)}
              className="palette-item"
            >
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Prepare a spread" className="palette-group">
          {(spreadsQuery.data ?? []).map((spread) => (
            <Command.Item
              key={spread.id}
              value={`draw ${spread.name} ${spread.id}`}
              onSelect={() => {
                setSpreadId(spread.id);
                toast(`${spread.name} ready — ask your question`);
                go("/");
              }}
              className="palette-item"
            >
              {spread.name}
              <span className="ml-auto font-utility text-[0.6rem] uppercase text-on-surface-variant">
                {spread.positions.length}
              </span>
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
