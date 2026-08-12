import { useState } from "react";
import { ArrowRight, ShieldAlert, User } from "lucide-react";
import { AetherButton } from "@/components/aether/AetherButton";

export function VoteIdentityForm({ onSubmit }: { onSubmit: (username: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = value.trim();
        if (name.length >= 3) onSubmit(name);
      }}
      className="aether-surface rounded-2xl p-6 sm:p-8"
    >
      <label
        htmlFor="vote-username"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <User size={15} className="text-secondary" /> Votre pseudo Minecraft
      </label>
      <p className="mt-2 text-sm text-muted-foreground">
        Indiquez votre pseudo pour consulter votre progression de vote enregistrée
        par le backend AetheriaSky.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          id="vote-username"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Entrer votre pseudo"
          minLength={3}
          maxLength={16}
          className="h-11 w-full rounded-full border border-border bg-background/60 px-5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary/50"
        />
        <AetherButton type="submit" className="shrink-0">
          Continuer <ArrowRight size={15} />
        </AetherButton>
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldAlert size={13} className="mt-0.5 shrink-0 text-premium" />
        Interface de démonstration : un pseudo seul ne constitue pas une
        authentification. La vérification du compte Minecraft arrivera plus tard.
      </p>
    </form>
  );
}
