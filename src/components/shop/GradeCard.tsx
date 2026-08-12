import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductIcon, productBorder } from "@/components/shop/ProductIcon";
import { formatPrice, type Product } from "@/data/products";
import { cn } from "@/lib/utils";

export function GradeCard({ product }: { product: Product }) {
  return (
    <article
      className={cn(
        "aether-surface lift relative flex flex-col rounded-3xl p-7",
        product.badge && productBorder[product.color],
      )}
    >
      {product.badge && (
        <span
          className={cn(
            "absolute -top-2.5 left-7 rounded-full px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em]",
            product.color === "premium"
              ? "bg-premium/15 text-premium"
              : "bg-[image:var(--gradient-aether)] text-primary-foreground",
          )}
        >
          {product.badge}
        </span>
      )}

      <ProductIcon product={product} className="h-12 w-12" size={22} />

      <h3 className="mt-5 font-display text-2xl tracking-[0.14em] text-foreground">
        {product.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <div className="mt-5 border-t border-border pt-5">
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
          Tarif
        </p>
        <p className="mt-1 font-display text-lg text-foreground">{formatPrice(product)}</p>
      </div>

      <ul className="mt-5 flex-1 space-y-2">
        {product.advantages.slice(0, 3).map((a, i) => (
          <li
            key={`${product.id}-adv-${i}`}
            className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-secondary/70" />
            {a}
          </li>
        ))}
      </ul>

      <div className="mt-7 grid gap-2.5">
        <AddToCartButton product={product} size="sm" />
        <Link
          to="/boutique/$productId"
          params={{ productId: product.id }}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-4 text-xs font-semibold text-foreground transition-colors hover:border-secondary/45"
        >
          Voir les avantages <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
