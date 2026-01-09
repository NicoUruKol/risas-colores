import { Link, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useCart } from "../context/CartContext";

export default function Carrito() {
    const navigate = useNavigate();
    const { items, total, updateQty, removeItem } = useCart();

    const goCheckout = () => {
        if (items.length === 0) return;
        navigate("/checkout");
    };

    return (
        <main className="py-10">
        <Container className="grid gap-6 max-w-[900px]">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-extrabold text-ui-text">Carrito</h1>
                <Link to="/uniformes">
                    <Button variant="ghost" size="sm">Seguir comprando</Button>
                </Link>
            </div>

            {items.length === 0 ? (
            <Card className="p-6">
                <p className="text-ui-muted">Tu carrito está vacío.</p>
                <div className="mt-4">
                    <Link to="/uniformes">
                        <Button variant="primary">Ver uniformes</Button>
                    </Link>
                </div>
            </Card>
            ) : (
            <>
                <div className="grid gap-3">
                    {items.map((it) => (
                        <Card key={`${it.id}-${it.talle}`} className="p-4">
                            <div className="grid gap-4 md:grid-cols-[88px_1fr_auto] items-center">
                                <div className="w-[88px] h-[88px] bg-gray-200 border border-ui-border rounded-md" />
                                <div>
                                    <div className="font-extrabold text-ui-text">{it.name}</div>
                                    <div className="text-sm text-ui-muted mt-1">
                                        Talle: <span className="font-semibold text-ui-text">{it.talle ?? "Único"}</span>
                                    </div>
                                    <div className="text-sm text-ui-muted mt-1">
                                        ${it.price.toLocaleString("es-AR")} c/u
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => updateQty(it.id, it.talle, it.qty - 1)}>−</Button>
                                            <div className="min-w-[44px] text-center font-bold">
                                                {it.qty}
                                            </div>
                                        <Button variant="ghost" size="sm" onClick={() => updateQty(it.id, it.talle, it.qty + 1)}>+</Button>
                                    </div>

                                    <div className="font-extrabold text-brand-orange">
                                        ${(it.price * it.qty).toLocaleString("es-AR")}
                                    </div>

                                    <button
                                        className="text-xs font-semibold text-state-error hover:underline"
                                        onClick={() => removeItem(it.id, it.talle)}
                                    >
                                        Quitar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-ui-muted">Total</div>
                        <div className="text-2xl font-extrabold text-ui-text">
                            ${total.toLocaleString("es-AR")}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 justify-end">
                        <Link to="/uniformes">
                            <Button variant="ghost">Agregar más</Button>
                        </Link>
                        <Button variant="primary" onClick={goCheckout}>Finalizar compra</Button>
                    </div>
                </Card>
            </>
            )}
        </Container>
        </main>
    );
}
