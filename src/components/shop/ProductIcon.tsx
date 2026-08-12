import { Coins, Crown, Gem, Sparkles, type LucideIcon } from "lucide-react";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { Coins, Crown, Gem, Sparkles };

export const productAccent: Record<Product["color"], string> = {
  info: "bg-info/12 text-info",
  secondary: "bg-secondary/12 text-secondary",
  primary: "bg-primary/15 text-primary",
  premium: "bg-premium/12 text-premium",
};

export const productBorder: Record<Product["color"], string> = {
  info: "border-info/25",
  secondary: "border-secondary/30",
  primary: "border-primary/35",
  premium: "border-premium/35",
};

export function ProductIcon({
  product,
  size = 20,
  className,
}: {
  product: Product;
  size?: number;
  className?: string;
}) {
  const Icon = icons[product.icon] ?? Sparkles;
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-xl",
        productAccent[product.color],
        className,
      )}
    >
      <Icon size={size} />
    </span>
  );
}
