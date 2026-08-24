interface MoonStepsProps {
  stage: "ask" | "dealing" | "reading";
}

const PHASES: { key: string; glyph: string; label: string }[] = [
  { key: "ask", glyph: "\u25CB", label: "ask" },
  { key: "dealing", glyph: "\u25D0", label: "draw" },
  { key: "reading", glyph: "\u25CF", label: "read" },
];

export function MoonSteps({ stage }: MoonStepsProps) {
  const activeIndex = PHASES.findIndex((phase) => phase.key === stage);

  return (
    <div className="flex items-center justify-center gap-6" aria-label={`Stage: ${stage}`}>
      {PHASES.map((phase, index) => (
        <span
          key={phase.key}
          aria-current={index === activeIndex}
          className={`font-utility text-sm transition-colors duration-700 ${
            index === activeIndex ? "text-primary" : index < activeIndex ? "text-on-surface/60" : "text-on-surface-variant/40"
          }`}
          title={phase.label}
        >
          {phase.glyph}
        </span>
      ))}
    </div>
  );
}
