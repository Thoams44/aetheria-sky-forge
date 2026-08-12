import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { AetherButton } from "@/components/aether/AetherButton";
import { useCart } from "@/lib/cart";
import type { Product } from "@/data/products";

export function AddToCartButton({
  product,
  variant = "primary",
  size = "md",
  className,
}: {
  product: Product;
  variant?: "primary" | "outline" | "premium";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { add, lines } = useCart();
  const [done, setDone] = useState(false);
  const alreadyOwnedGrade =
    product.type === "grade" && lines.some((l) => l.productId === product.id);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1800);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <AetherButton
      variant={variant}
      size={size}
      className={className}
      disabled={alreadyOwnedGrade}
      onClick={() => {
        add(product.id);
        setDone(true);
      }}
    >
      {alreadyOwnedGrade ? (
        <>
          <Check size={15} /> Dans le panier
        </>
      ) : done ? (
        <>
          <Check size={15} /> Ajouté
        </>
      ) : (
        <>
          <ShoppingCart size={15} /> Ajouter au panier
        </>
      )}
    </AetherButton>
  );
}
