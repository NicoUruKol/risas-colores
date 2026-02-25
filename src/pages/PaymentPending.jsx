import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import styles from "./Checkout.module.css";

/* ==============================
Payment Pending
============================== */

export default function PaymentPending() {
    return (
        <main className={`${styles.stage} py-10`}>
        <div className={styles.bg} aria-hidden="true" />

        <Container className="grid gap-6 max-w-[860px]">
            <Card className={`${styles.shell} p-6 grid gap-3`}>
            <h1 className="text-2xl font-extrabold text-ui-text">Pago pendiente ⏳</h1>
            <p className="text-ui-muted leading-relaxed">
                Tu pago quedó en estado <b>pendiente</b>. No te preocupes: si se aprueba, queda confirmado.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-ui-border">
                <Link to="/carrito">
                <Button variant="ghost">Volver al carrito</Button>
                </Link>
                <Link to="/catalogo">
                <Button variant="primary">Volver al catálogo</Button>
                </Link>
            </div>
            </Card>
        </Container>
        </main>
    );
}