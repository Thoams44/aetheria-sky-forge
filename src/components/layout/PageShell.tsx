import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string | undefined;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-surface/30">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_120%_at_20%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}