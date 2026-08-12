import { useState } from "react";
import { ArrowRight, Coins, ShieldAlert, User } from "lucide-react";
import { AetherButton } from "@/components/aether/AetherButton";
import { formatVotes } from "@/lib/vote";

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

export function VoteProfileCard({
  username,
  monthlyVotes,
  goal,
  totalVotes,
  coinsFromTiers,
  nextTierReward,
  pendingVoteKeys,
  onChange,
}: {
  username: string;
  monthlyVotes: number;
  goal: number;
  totalVotes: number;
  coinsFromTiers: number;
  nextTierReward: string | null;
  pendingVoteKeys: number;
  onChange: () => void;
}) {
  const percent = goal > 0 ? Math.min(100, Math.round((totalVotes / goal) * 100)) : 100;
  const remaining = Math.max(0, goal - totalVotes);

  return (
    <div className="aether-surface aether-glow rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-secondary">
          <User size={19} />
        </span>
        <div>
          <p className="eyebrow">Progression des paliers</p>
          <p className="font-display text-xl text-foreground">{username}</p>
        </div>
        <button
          type="button"
          onClick={onChange}
          className="ml-auto text-xs font-semibold text-muted-foreground transition-colors hover:text-secondary"
        >
          Changer de pseudo
        </button>
      </div>

      <div className="mt-7 flex items-end justify-between gap-4">
        <p className="font-display text-4xl text-foreground">
          {totalVotes}
          <span className="text-muted-foreground"> / {goal || totalVotes}</span>
          <span className="ml-2 text-sm text-muted-foreground">votes</span>
        </p>
        <span className="rounded-full border border-premium/40 bg-premium/10 px-3 py-1 text-xs font-semibold text-premium">
          {percent} %
        </span>
      </div>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-accent/60">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-aether)] transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <dl className="mt-7 grid gap-3 sm:grid-cols-3">
        <Stat label="Votes ce mois-ci" value={formatVotes(monthlyVotes)} />
        <Stat
          label="Votes restants"
          value={remaining > 0 ? formatVotes(remaining) : "—"}
        />
        <Stat label="Clés de Vote en attente" value={formatVotes(pendingVoteKeys)} />
      </dl>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-premium/25 bg-premium/8 px-4 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-premium/12 text-premium">
          <Coins size={18} />
        </span>
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
            Aether Coins obtenus via les paliers
          </p>
          <p className="font-display text-2xl text-foreground">
            {formatVotes(coinsFromTiers)} <span className="text-sm text-muted-foreground">AC</span>
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {nextTierReward
          ? `Prochain palier : ${nextTierReward}.`
          : "Tous les paliers sont débloqués."}{" "}
        Chaque vote validé crée une Clé de Vote livrée en jeu par AetheriaCore ;
        les Éclats restent une monnaie distincte.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 px-4 py-3">
      <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg text-foreground">{value}</dd>
    </div>
  );
}
