import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import styles from "./Checkout.module.css";

/* ==============================
Payment Failure
============================== */

export default function PaymentFailure() {
    return (
        <main className={`${styles.stage} py-10`}>
        <div className={styles.bg} aria-hidden="true" />

        <Container className="grid gap-6 max-w-[860px]">
            <Card className={`${styles.shell} p-6 grid gap-3`}>
            <h1 className="text-2xl font-extrabold text-ui-text">No se pudo confirmar el pago 😕</h1>
            <p className="text-ui-muted leading-relaxed">
                Parece que el pago no se completó. Podés intentarlo nuevamente cuando quieras.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-ui-border">
                <Link to="/carrito">
                <Button variant="ghost">Volver al carrito</Button>
                </Link>
                <Link to="/checkout">
                <Button variant="primary">Reintentar</Button>
                </Link>
            </div>
            </Card>
        </Container>
        </main>
    );
}