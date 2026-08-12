import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "@/data/products";

export type CartLine = { productId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  detailed: { line: CartLine; product: Product }[];
  count: number;
  /** null tant qu'aucun prix n'est défini. */
  subtotal: number | null;
  total: number | null;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "aetheriasky.cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  // Lecture après hydratation pour éviter tout décalage SSR.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* panier illisible : on repart d'un panier vide */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* stockage indisponible */
    }
  }, [lines]);

  const add = useCallback((productId: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      const isGrade = getProduct(productId)?.type === "grade";
      if (existing) {
        // Un grade ne s'achète qu'une fois.
        if (isGrade) return prev;
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { productId, quantity: isGrade ? 1 : quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const detailed = lines
      .map((line) => {
        const product = getProduct(line.productId);
        return product ? { line, product } : null;
      })
      .filter((v): v is { line: CartLine; product: Product } => v !== null);

    const count = detailed.reduce((sum, d) => sum + d.line.quantity, 0);
    const priced = detailed.every((d) => d.product.price !== null);
    const subtotal = priced
      ? detailed.reduce((sum, d) => sum + (d.product.price ?? 0) * d.line.quantity, 0)
      : null;

    return {
      lines,
      detailed,
      count,
      subtotal: detailed.length ? subtotal : 0,
      total: detailed.length ? subtotal : 0,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lines, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
