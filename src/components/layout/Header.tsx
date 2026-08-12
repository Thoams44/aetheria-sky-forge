import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { IpCopy } from "@/components/aether/IpCopy";
import { mainNav, siteConfig } from "@/config/site";
import { DiscordIcon } from "@/components/brand/DiscordIcon";
import { useCart } from "@/lib/cart";

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:h-18">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:text-foreground data-[status=active]:bg-accent/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <IpCopy size="sm" className="hidden xl:flex" />
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Rejoindre le Discord"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-secondary/40 hover:text-foreground sm:flex"
          >
            <DiscordIcon className="h-4 w-4" />
          </a>
          <Link
            to="/panier"
            aria-label={`Panier (${count} article${count > 1 ? "s" : ""})`}
            className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-secondary/40 hover:text-foreground sm:flex"
          >
            <ShoppingCart size={16} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[0.6rem] font-bold text-background">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/compte"
            className="hidden h-9 items-center gap-2 rounded-full border border-border bg-surface/60 px-4 text-xs font-semibold text-foreground transition-colors hover:border-secondary/40 sm:flex"
          >
            <User size={14} /> Mon compte
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="rise-in border-t border-border bg-background/98 px-5 pb-6 pt-4 lg:hidden">
          <nav className="grid gap-1">
            {mainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-accent/50 text-foreground" }}
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-3">
            <IpCopy />
            <div className="grid grid-cols-2 gap-3">
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-foreground"
              >
                <DiscordIcon className="h-4 w-4" /> Discord
              </a>
              <Link
                to="/panier"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-foreground"
              >
                <ShoppingCart size={14} /> Panier{count > 0 ? ` (${count})` : ""}
              </Link>
              <Link
                to="/compte"
                onClick={() => setOpen(false)}
                className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-foreground"
              >
                <User size={14} /> Mon compte
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}