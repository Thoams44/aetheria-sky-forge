import heroImage from "@/assets/hero-islands.jpg";
import { IpCopy } from "@/components/aether/IpCopy";
import { ServerStatusLine } from "@/components/aether/ServerStatusLine";
import { DiscordIcon } from "@/components/brand/DiscordIcon";
import { siteConfig } from "@/config/site";

const stats = [
  { label: "Joueurs inscrits", value: "12 480" },
  { label: "Îles actives", value: "3 210" },
  { label: "Saison en cours", value: "Aether II" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={heroImage}
        alt="Îles flottantes AetheriaSky au coucher du soleil"
        width={1920}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
      />
      <div className="absolute inset-0 bg-[image:var(--gradient-veil)]" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_10%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_70%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          "left-[12%] top-[28%]",
          "left-[26%] top-[62%]",
          "left-[48%] top-[22%]",
          "left-[68%] top-[48%]",
          "left-[84%] top-[34%]",
        ].map((pos, i) => (
          <span
            key={pos}
            className={`float-slow absolute h-1.5 w-1.5 rounded-full bg-secondary/70 blur-[1px] ${pos}`}
            style={{ animationDelay: `${i * 1.4}s` }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28 lg:pt-36">
        <p className="eyebrow rise-in">Serveur SkyBlock français</p>
        <h1 className="rise-in mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl">
          <span className="text-secondary">{siteConfig.mark}</span> Aetheria
          <span className="text-aether">Sky</span>
        </h1>
        <p className="rise-in mt-5 max-w-xl font-display text-lg text-secondary sm:text-2xl">
          {siteConfig.tagline}
        </p>
        <p className="rise-in mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Une poignée de blocs suspendus au-dessus des nuages, et tout le reste
          à écrire. AetheriaSky réunit une progression profonde, une économie
          maîtrisée et des îles qui vivent au fil des saisons — pensé pour les
          joueurs qui restent.
        </p>

        <div className="rise-in mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col items-start gap-2">
            <IpCopy />
            <ServerStatusLine className="pl-1" />
          </div>
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-surface/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/45 hover:bg-surface-raised"
          >
            <DiscordIcon className="h-4 w-4" /> Discord
          </a>
        </div>

        <dl className="mt-14 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-background/70 px-5 py-5 backdrop-blur">
              <dt className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
                {s.label}
              </dt>
              <dd className="mt-2 font-display text-xl text-foreground">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}