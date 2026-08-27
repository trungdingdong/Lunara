import { useMemo } from "react";

import { EXPECTED_SECTION_COUNT, parseSections } from "@/lib/tarot";

interface StreamPaneProps {
  text: string;
  streaming: boolean;
  failed: boolean;
}

export function StreamPane({ text, streaming, failed }: StreamPaneProps) {
  const sections = useMemo(() => parseSections(text), [text]);

  if (failed) {
    return (
      <p className="mt-10 border-l-2 border-error pl-4 font-body text-sm text-on-surface-variant" role="alert">
        The connection to the reader broke before the reading finished. Draw again to retry.
      </p>
    );
  }

  if (sections.length === 0 && streaming) {
    return (
      <p className="mt-10 animate-pulse font-utility text-xs tracking-[0.3em] text-on-surface-variant uppercase">
        Consulting the cards&hellip;
      </p>
    );
  }

  const progress = Math.min(sections.length / EXPECTED_SECTION_COUNT, 1);

  return (
    <div className="mt-12">
      <div
        aria-hidden="true"
        className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-gilt/70 to-transparent transition-all duration-700"
        style={{ transform: `scaleX(${0.15 + progress * 0.85})` }}
      />
      <div className="space-y-10">
        {sections.map((section, index) => {
          const isLast = index === sections.length - 1;
          return (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-semibold tracking-wide text-primary">
                {section.title}
              </h2>
              {isLast && streaming ? (
                <p className="mt-3 font-body leading-relaxed text-on-surface/85 after:animate-pulse after:content-['▪']">
                  {section.body}
                </p>
              ) : (
                <p className="mt-3 font-body leading-relaxed whitespace-pre-line text-on-surface/85">
                  {section.body}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
