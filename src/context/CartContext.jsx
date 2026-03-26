import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "rc_cart";

export function CartProvider({ children }) {
    // items: { id(code), name, price(unitPrice), avatar?, talle, qty, max? }
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // no rompemos la app si localStorage falla
        }
    }, [items]);

    function addItem(product, { talle = "Único", qty = 1, max } = {}) {
        const safeQty = Math.max(1, Number(qty) || 1);
        const safeMax = Number.isFinite(Number(max)) ? Number(max) : undefined;

        const avatar =
            typeof product.avatar === "string"
                ? product.avatar
                : Array.isArray(product.avatar)
                ? product.avatar[0]
                : undefined;

        setItems((prev) => {
            const index = prev.findIndex((x) => x.id === product.id && x.talle === talle);

            if (index >= 0) {
                const copy = [...prev];
                const nextQty = copy[index].qty + safeQty;

                copy[index] = {
                    ...copy[index],
                    qty: safeMax ? Math.min(nextQty, safeMax) : nextQty,
                    price: Number(product.price),
                    avatar: avatar ?? copy[index].avatar,
                    max: safeMax ?? copy[index].max,
                };

                return copy;
            }

            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    avatar,
                    talle,
                    qty: safeMax ? Math.min(safeQty, safeMax) : safeQty,
                    max: safeMax,
                },
            ];
        });
    }

    function removeItem(id, talle = "Único") {
        setItems((prev) => prev.filter((x) => !(x.id === id && x.talle === talle)));
    }

    function updateQty(id, talle = "Único", qty) {
        const safeQty = Math.max(1, Number(qty) || 1);

        setItems((prev) =>
            prev.map((x) => {
                if (x.id !== id || x.talle !== talle) return x;
                const capped = x.max ? Math.min(safeQty, x.max) : safeQty;
                return { ...x, qty: capped };
            })
        );
    }

    function clearCart() {
        setItems([]);
        try {
            localStorage.removeItem(CART_STORAGE_KEY);
        } catch {
            // no rompemos la app si localStorage falla
        }
    }

    const total = useMemo(
        () => items.reduce((acc, x) => acc + x.price * x.qty, 0),
        [items]
    );

    const count = useMemo(
        () => items.reduce((acc, x) => acc + x.qty, 0),
        [items]
    );

    const value = useMemo(
        () => ({ items, addItem, removeItem, updateQty, clearCart, total, count }),
        [items, total, count]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
    return ctx;
}