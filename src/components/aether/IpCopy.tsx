import { Check, Copy } from "lucide-react";
import { useCopyIp } from "@/hooks/useCopyIp";
import { cn } from "@/lib/utils";

export function IpCopy({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const { copied, copy, ip } = useCopyIp();

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copier l'adresse IP ${ip}`}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-full border border-border bg-surface/70 backdrop-blur transition-all duration-300 hover:border-secondary/45 hover:bg-surface-raised",
        size === "md" ? "h-12 pl-5 pr-2" : "h-9 pl-4 pr-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "font-mono tracking-tight text-foreground",
          size === "md" ? "text-sm sm:text-base" : "text-xs",
        )}
      >
        {ip}
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 font-semibold uppercase tracking-[0.18em] transition-colors duration-300",
          size === "md" ? "h-9 text-[0.65rem]" : "h-6.5 text-[0.58rem]",
          copied
            ? "bg-success/15 text-success"
            : "bg-[image:var(--gradient-aether)] text-primary-foreground",
        )}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "IP copiée !" : "Copier l'IP"}
      </span>
      {copied && (
        <span className="pointer-events-none absolute inset-0 rise-in rounded-full ring-1 ring-success/40" />
      )}
    </button>
  );
}