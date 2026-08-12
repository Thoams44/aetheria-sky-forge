import { Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { buttonClasses } from "@/components/aether/AetherButton";
import { formatDate } from "@/data/account";
import type { AccountGradeDTO } from "@/lib/backend/account.server";

export function AccountGradeCard({ grade }: { grade: AccountGradeDTO | null }) {
  return (
    <div className="aether-surface flex h-full flex-col rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Crown size={16} className="text-premium" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mon grade
        </h2>
      </div>

      <p
        className="mt-4 font-display text-3xl text-premium"
        style={grade?.color ? { color: grade.color } : undefined}
      >
        {grade?.name ?? "Joueur"}
      </p>

      {grade ? (
        <>
          <span
            className={`mt-3 inline-flex w-fit rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] ${
              grade.active
                ? "border-success/40 bg-success/10 text-success"
                : "border-border bg-accent/50 text-muted-foreground"
            }`}
          >
            {grade.active ? "Actif" : "Expiré"}
          </span>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Obtenu le</dt>
              <dd className="text-foreground">{formatDate(grade.obtainedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Expiration</dt>
              <dd className="text-foreground">
                {grade.expiresAt ? formatDate(grade.expiresAt) : "Permanent"}
              </dd>
            </div>
          </dl>

          {grade.advantages.length > 0 ? (
            <ul className="mt-5 space-y-1.5 text-xs text-muted-foreground">
              {grade.advantages.map((advantage) => (
                <li key={advantage}>• {advantage}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-xs text-muted-foreground">
              Avantages à définir.
            </p>
          )}

          <Link
            to="/boutique/$productId"
            params={{ productId: grade.slug }}
            className={`${buttonClasses("premium", "sm")} mt-6 w-fit`}
          >
            Voir le grade
          </Link>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun grade attribué pour le moment.
          </p>
          <Link to="/boutique" className={`${buttonClasses("outline", "sm")} mt-6 w-fit`}>
            Découvrir les grades
          </Link>
        </>
      )}
    </div>
  );
}
