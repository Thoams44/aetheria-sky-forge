import { Blocks, Users } from "lucide-react";
import { demoServerStatus, type ServerStatus } from "@/data/server-status";
import { cn } from "@/lib/utils";

/**
 * Ligne d'informations serveur, affichée discrètement sous l'IP.
 * `status` sera fourni plus tard par le backend / l'API Minecraft.
 */
export function ServerStatusLine({
  status = demoServerStatus,
  className,
}: {
  status?: ServerStatus;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <Blocks size={13} className="text-secondary" />
        <span className="font-mono tracking-tight text-foreground/80">
          {status.version}
        </span>
      </span>
      <span aria-hidden className="text-border">•</span>
      <span className="inline-flex items-center gap-1.5">
        <Users size={13} className="text-secondary" />
        <span className="text-foreground/80">
          {status.playersOnline.toLocaleString("fr-FR")} joueurs en ligne
        </span>
      </span>
    </p>
  );
}
