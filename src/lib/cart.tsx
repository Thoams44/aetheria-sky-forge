import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getShopCatalog, type ShopProductDTO } from "@/lib/backend/shop.functions";
import type { Product } from "@/data/products";

export type CartLine = { productId: string; quantity: number };

export const shopCatalogQuery = {
  queryKey: ["shop", "catalog"] as const,
  queryFn: () => getShopCatalog(),
  staleTime: 60_000,
};

type CartContextValue = {
  lines: CartLine[];
  detailed: { line: CartLine; product: Product }[];
  count: number;
  /** null tant que tous les prix ne sont pas définis côté backend. */
  subtotal: number | null;
  total: number | null;
  currency: string;
  catalogLoading: boolean;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "aetheriasky.cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const catalogQuery = useQuery(shopCatalogQuery);
  const catalog: ShopProductDTO[] = Array.isArray(catalogQuery.data) ? catalogQuery.data : [];

  // Lecture après hydratation pour éviter tout décalage SSR.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed as CartLine[]);
      }
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

  const findProduct = useCallback(
    (productId: string) => catalog.find((p) => p.id === productId),
    [catalog],
  );

  const add = useCallback(
    (productId: string, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === productId);
        const isGrade = findProduct(productId)?.type === "grade";
        if (existing) {
          // Un grade ne s'achète qu'une fois.
          if (isGrade) return prev;
          return prev.map((l) =>
            l.productId === productId ? { ...l, quantity: Math.min(l.quantity + quantity, 20) } : l,
          );
        }
        return [...prev, { productId, quantity: isGrade ? 1 : Math.min(quantity, 20) }];
      });
    },
    [findProduct],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) =>
            l.productId === productId ? { ...l, quantity: Math.min(quantity, 20) } : l,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const detailed = lines
      .map((line) => {
        const product = catalog.find((p) => p.id === line.productId);
        return product ? { line, product: product as Product } : null;
      })
      .filter((v): v is { line: CartLine; product: Product } => v !== null);

    const count = detailed.reduce((sum, d) => sum + d.line.quantity, 0);
    const priced = detailed.length > 0 && detailed.every((d) => d.product.price !== null);
    const subtotal = priced
      ? detailed.reduce((sum, d) => sum + (d.product.price ?? 0) * d.line.quantity, 0)
      : null;

    return {
      lines,
      detailed,
      count,
      subtotal,
      total: subtotal,
      currency: detailed[0]?.product.currency ?? "EUR",
      catalogLoading: catalogQuery.isLoading,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lines, catalog, catalogQuery.isLoading, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
