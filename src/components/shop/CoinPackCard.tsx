import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductIcon } from "@/components/shop/ProductIcon";
import { formatPrice, type Product } from "@/data/products";

export function CoinPackCard({ product }: { product: Product }) {
  return (
    <article className="aether-surface lift relative flex flex-col rounded-2xl p-6">
      {product.badge && (
        <span className="absolute right-5 top-5 rounded-full bg-premium/12 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-premium">
          {product.badge}
        </span>
      )}
      <ProductIcon product={product} className="h-10 w-10" size={18} />
      <p className="mt-4 font-display text-xl text-foreground">{product.name}</p>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {product.description}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">{formatPrice(product)}</p>
      <AddToCartButton product={product} variant="premium" size="sm" className="mt-5 w-full" />
    </article>
  );
}
