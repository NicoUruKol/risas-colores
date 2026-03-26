import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import styles from "./Checkout.module.css";

/* ==============================
Payment Success (solo si approved)
============================== */

const LS_CTX_KEY = "rc_checkout_ctx";

const pickStatus = (sp) => {
  // MP suele devolver status/collection_status
    const a = (sp.get("status") || "").toLowerCase();
    const b = (sp.get("collection_status") || "").toLowerCase();
    return a || b;
};

const pickExternalRef = (sp) => sp.get("external_reference") || sp.get("externalReference") || "";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const { search } = useLocation();

    const sp = useMemo(() => new URLSearchParams(search), [search]);
    const status = pickStatus(sp);
    const externalRef = pickExternalRef(sp);

    const ctx = useMemo(() => {
        try {
        const raw = localStorage.getItem(LS_CTX_KEY);
        return raw ? JSON.parse(raw) : null;
        } catch {
        return null;
        }
    }, []);

    useEffect(() => {
        // Si no hay status, lo tratamos como fallo
        if (!status) {
            navigate("/payment-failure", { replace: true });
            return;
        }

        if (status !== "approved") {
            if (status === "pending" || status === "in_process") {
                navigate("/payment-pending", { replace: true });
            } else {
                navigate("/payment-failure", { replace: true });
            }
        }
    }, [status, navigate]);

    const adultName = ctx?.adultName || "Familia";
    const kidName = ctx?.kidName || "mi peque";

    return (
        <main className={`${styles.stage} py-10`}>
        <div className={styles.bg} aria-hidden="true" />

        <Container className="grid gap-6 max-w-[860px]">
            <Card className={`${styles.shell} p-6 grid gap-4`}>
            <div className="grid gap-2">
                <h1 className="text-2xl font-extrabold text-ui-text">
                ¡Gracias, {adultName}! 💛
                </h1>
                <p className="text-ui-muted leading-relaxed">
                ¡Listo! Ya tenés el uniforme de <b className="text-ui-text">{kidName}</b> 🎒🌈
                </p>
            </div>

            <div className="grid gap-1 text-sm text-ui-muted">
                {externalRef ? (
                <div>
                    Referencia: <b className="text-ui-text">#{externalRef}</b>
                </div>
                ) : null}
                <div>Si necesitás ayuda, escribinos por WhatsApp y te asistimos.</div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-ui-border">
                <Button
                variant="secondary"
                onClick={() => {
                    // limpiamos contexto (ya se usó)
                    localStorage.removeItem(LS_CTX_KEY);
                    navigate("/catalogo", { replace: true });
                }}
                >
                Volver al catálogo
                </Button>

                <Button
                variant="primary"
                onClick={() => {
                    const msg =
                    `Hola Risas y Colores 🌈\n` +
                    `Soy ${adultName}. Confirmé el pago del uniforme de ${kidName}.\n` +
                    (externalRef ? `Referencia: #${externalRef}\n` : "") +
                    `¡Gracias!`;
                    const url = `https://wa.me/5491156971231?text=${encodeURIComponent(msg)}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                }}
                >
                Enviar por WhatsApp
                </Button>

                <Link to="/" className="hidden" />
            </div>
            </Card>
        </Container>
        </main>
    );
}