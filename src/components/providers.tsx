"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  notify: (message: string, note?: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

const STORAGE_KEY = "aurelle-cart-v1";

export function Providers({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; note?: string }[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const notify = useCallback((message: string, note?: string) => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, message, note }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === item.slug);
        if (existing) {
          return prev.map((i) =>
            i.slug === item.slug ? { ...i, qty: Math.min(i.qty + qty, 10) } : i,
          );
        }
        return [...prev, { ...item, qty }];
      });
      setOpen(true);
    },
    [],
  );

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(qty, 10) } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { subtotal, count } = useMemo(
    () => ({
      subtotal: items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: items.reduce((sum, i) => sum + i.qty, 0),
    }),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      hydrated,
      isOpen,
      setOpen,
      add,
      remove,
      setQty,
      clear,
      notify,
    }),
    [items, count, subtotal, hydrated, isOpen, add, remove, setQty, clear, notify],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[130] flex w-[min(92vw,380px)] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-start gap-3 border border-gold/25 bg-coal/95 px-4 py-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur"
            >
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" />
              <div>
                <p className="text-sm leading-snug text-ivory">{toast.message}</p>
                {toast.note && (
                  <p className="mt-0.5 text-xs tracking-wide text-greige">{toast.note}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CartContext.Provider>
  );
}
