import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";

export type LegalBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

/**
 * Gabarit commun aux pages légales AetheriaSky.
 * Réutilise l'en-tête et la section standard du site.
 */
export function LegalPage({
  eyebrow,
  title,
  description,
  blocks,
  footNote,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  blocks: LegalBlock[];
  footNote?: string;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {blocks.map((block, i) => (
            <article key={block.title} className="aether-surface lift rounded-2xl p-6">
              <p className="font-display text-sm text-secondary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">{block.title}</h2>
              {block.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2.5 text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
              {block.items && (
                <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-secondary">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
        {footNote && <p className="mt-10 text-xs text-muted-foreground">{footNote}</p>}
      </Section>
    </>
  );
}

/** Marqueur explicite pour les informations juridiques non encore fournies. */
export const TO_COMPLETE = "[À COMPLÉTER]";
