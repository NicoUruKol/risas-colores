import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // items: { id, name, price, talle, qty }
    const [items, setItems] = useState([]);

    function addItem(product, { talle = "Único", qty = 1 } = {}) {
        setItems((prev) => {
        const index = prev.findIndex(
            (x) => x.id === product.id && x.talle === talle
        );

        if (index >= 0) {
            const copy = [...prev];
            copy[index] = { ...copy[index], qty: copy[index].qty + qty };
            return copy;
        }

        return [
            ...prev,
            {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            talle,
            qty: Math.max(1, qty),
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
        prev.map((x) =>
            x.id === id && x.talle === talle ? { ...x, qty: safeQty } : x
        )
        );
    }

    function clearCart() {
        setItems([]);
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
    if (!ctx) {
        throw new Error("useCart debe usarse dentro de <CartProvider>");
    }
    return ctx;
}
