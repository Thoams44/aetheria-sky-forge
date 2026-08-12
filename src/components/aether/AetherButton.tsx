import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "premium";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-[image:var(--gradient-aether)] text-primary-foreground shadow-[0_14px_35px_-18px_var(--primary)] hover:brightness-110 hover:-translate-y-0.5",
  outline:
    "border border-border bg-surface/60 text-foreground hover:border-secondary/45 hover:bg-surface-raised hover:-translate-y-0.5",
  ghost: "text-muted-foreground hover:text-foreground",
  premium:
    "border border-premium/40 bg-premium/10 text-premium hover:bg-premium/18 hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-sm sm:h-13 sm:px-8",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const AetherButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);
AetherButton.displayName = "AetherButton";

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(base, variants[variant], sizes[size]);
}