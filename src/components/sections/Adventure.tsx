import { Section, SectionHeading } from "@/components/aether/Section";
import { features } from "@/data/features";

export function Adventure() {
  return (
    <Section id="aventure">
      <SectionHeading
        eyebrow="Le serveur"
        title="L'aventure AetheriaSky"
        description="Six piliers travaillés séparément, assemblés pour tenir sur la durée. Rien d'inutile, rien de laissé au hasard."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="aether-surface lift group rounded-2xl p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-accent/40 text-secondary transition-colors duration-300 group-hover:border-secondary/40 group-hover:text-foreground">
              <Icon size={19} />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}