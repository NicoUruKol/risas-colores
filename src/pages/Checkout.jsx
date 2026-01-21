import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Checkout() {
    const navigate = useNavigate();
    const { items, total } = useCart();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");

    const canPay = items.length > 0 && name && email && tel;

    const handleConfirm = () => {
        if (!canPay) return;
        // integrar Mercado Pago / backend
        navigate("/confirmacion");
    };

    return (
        <main className="py-10">
            <Container className="grid gap-6 max-w-[760px]">
                <h1 className="text-2xl font-extrabold text-ui-text">Finalizar compra</h1>

                <Card className="p-5 grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Nombre y apellido" value={name} onChange={(e) => setName(e.target.value)} />
                        <Input label="Teléfono" value={tel} onChange={(e) => setTel(e.target.value)} />
                    </div>
                    <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <div className="border-t border-ui-border pt-4 flex items-center justify-between">
                        <div className="text-sm text-ui-muted">Total</div>
                        <div className="text-xl font-extrabold text-ui-text">
                            ${total.toLocaleString("es-AR")}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => navigate("/carrito")}>Volver</Button>
                        <Button variant="primary" disabled={!canPay} onClick={handleConfirm}>
                        Confirmar compra
                        </Button>
                    </div>
                </Card>
            </Container>
        </main>
    );
}
