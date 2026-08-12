import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="text-lg text-secondary transition-transform duration-500 group-hover:rotate-90">
        {siteConfig.mark}
      </span>
      <span className="font-display text-base font-semibold tracking-[0.12em] text-foreground sm:text-lg">
        Aetheria<span className="text-aether">Sky</span>
      </span>
      {!compact && (
        <span className="hidden text-[0.62rem] font-medium uppercase tracking-[0.28em] text-muted-foreground lg:block">
          SkyBlock
        </span>
      )}
    </Link>
  );
}