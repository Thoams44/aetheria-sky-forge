import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { DiscordIcon } from "@/components/brand/DiscordIcon";
import { IpCopy } from "@/components/aether/IpCopy";
import { legalNav, mainNav, siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/40">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo compact />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Un SkyBlock français pensé dans le détail : îles vivantes, économie
            sérieuse et une communauté qui construit haut.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <IpCopy size="sm" />
            <a
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-semibold text-foreground transition-colors hover:border-secondary/40"
            >
              <DiscordIcon className="h-4 w-4" /> Discord
            </a>
          </div>
        </div>

        <nav aria-label="Navigation du site">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2.5">
            {mainNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informations légales">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
            Informations
          </h3>
          <ul className="mt-4 space-y-2.5">
            {legalNav.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
          <p>
            Non affilié à Mojang Studios ou Microsoft.
          </p>
        </div>
      </div>
    </footer>
  );
}