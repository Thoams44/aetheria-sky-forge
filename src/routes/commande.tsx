import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AetherButton } from "@/components/aether/AetherButton";
import { ProductIcon } from "@/components/shop/ProductIcon";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart";

const title = "Finaliser ma commande — AetheriaSky";
const description =
  "Dernière étape avant validation : renseigne ton pseudo Minecraft et ton e-mail pour recevoir ta commande AetheriaSky.";

export const Route = createFileRoute("/commande")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommandePage,
});

function CommandePage() {
  const { detailed, count } = useCart();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Commande"
        title="Finaliser ma commande"
        description="Interface de démonstration : aucune donnée n'est enregistrée et aucun paiement n'est demandé."
      />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <form
            className="aether-surface rounded-3xl p-7 sm:p-9"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <h2 className="font-display text-xl text-foreground">Informations de livraison</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ta commande sera créditée directement sur ton compte Minecraft.
            </p>

            <div className="mt-7 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Pseudo Minecraft
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nyxeril"
                  autoComplete="off"
                  className="h-12 rounded-xl border border-border bg-background/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-secondary/50"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  E-mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toi@exemple.fr"
                  autoComplete="email"
                  className="h-12 rounded-xl border border-border bg-background/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-secondary/50"
                />
              </label>
            </div>

            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info size={14} className="mt-0.5 shrink-0 text-info" />
              Le pseudo saisi ici ne vaut pas authentification. La vérification
              du compte Minecraft sera ajoutée avant l'ouverture des paiements.
            </p>

            <AetherButton type="submit" className="mt-8 w-full" disabled={count === 0}>
              Valider ma commande (démo)
            </AetherButton>

            {submitted && (
              <p className="rise-in mt-5 flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/8 p-4 text-sm text-foreground">
                <CheckCircle2 size={16} className="text-secondary" />
                Commande de démonstration enregistrée localement. Aucun paiement
                n'a été effectué.
              </p>
            )}
          </form>

          <aside className="aether-surface h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h2 className="font-display text-xl text-foreground">Ma sélection</h2>
            {detailed.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Aucun article.{" "}
                <Link to="/boutique" className="text-secondary hover:underline">
                  Retour à la boutique
                </Link>
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-border">
                {detailed.map(({ line, product }) => (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <ProductIcon product={product} className="h-9 w-9" size={15} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ×{line.quantity} — {formatPrice(product)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex justify-between border-t border-border pt-5 text-sm">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-lg text-foreground">Prix à définir</span>
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-info" />
              Paiement sécurisé à venir. Cette page prépare simplement le futur
              tunnel de commande.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
