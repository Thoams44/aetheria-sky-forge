import { useState } from "react";
import { LogIn, Mail } from "lucide-react";
import { AetherButton } from "@/components/aether/AetherButton";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

/** Identification du joueur — sans session, aucune donnée privée n'est chargée. */
export function AccountSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const res =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/compte` },
          });
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (mode === "signup" && !res.data.session) {
      setInfo("Vérifie ta boîte mail pour confirmer ton compte.");
      return;
    }
    onSignedIn();
  }

  async function google() {
    setError(null);
    try {
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    }
  }

  return (
    <div className="aether-surface mx-auto max-w-md rounded-3xl p-8">
      <div className="flex items-center gap-2">
        <LogIn size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Accéder à mon espace
        </h2>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Connecte-toi pour afficher ton grade, tes monnaies, tes votes et tes commandes.
      </p>

      <AetherButton variant="outline" size="sm" className="mt-6 w-full" onClick={google}>
        Continuer avec Google
      </AetherButton>

      <div className="my-5 flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-3" onSubmit={submit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse e-mail"
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-secondary/50"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-secondary/50"
        />
        <AetherButton type="submit" size="sm" className="w-full" disabled={busy}>
          <Mail size={14} /> {mode === "signin" ? "Se connecter" : "Créer mon compte"}
        </AetherButton>
      </form>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {info && <p className="mt-3 text-xs text-secondary">{info}</p>}

      <button
        type="button"
        className="mt-4 text-xs text-muted-foreground transition-colors hover:text-secondary"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Créer un compte" : "J'ai déjà un compte"}
      </button>
    </div>
  );
}
