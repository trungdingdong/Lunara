import type { Spread } from "@/lib/api";

interface SpreadPickerProps {
  spreads: Spread[];
  selected: string;
  onSelect: (spreadId: string) => void;
}

export function SpreadPicker({ spreads, selected, onSelect }: SpreadPickerProps) {
  return (
    <fieldset>
      <legend className="mb-3 font-utility text-[0.65rem] tracking-[0.25em] text-on-surface-variant uppercase">
        Choose a spread
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup">
        {spreads.map((spread) => {
          const isSelected = spread.id === selected;
          return (
            <button
              key={spread.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(spread.id)}
              className={`rounded-md border px-3 py-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-gilt ${
                isSelected
                  ? "border-primary/80 bg-primary/10 shadow-[0_0_18px_-6px] shadow-primary/40"
                  : "border-outline-variant/25 hover:border-outline-variant/50"
              }`}
            >
              <span className={`block font-display text-lg ${isSelected ? "text-on-surface" : "text-on-surface/75"}`}>
                {spread.name}
              </span>
              <span className="font-utility text-[0.6rem] tracking-widest text-on-surface-variant uppercase">
                {spread.positions.length} card{spread.positions.length > 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
