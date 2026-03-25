import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/ordersApi";
import styles from "./Checkout.module.css";

/* ==============================
Checkout (Risas y Colores)
============================== */

const LS_CTX_KEY = "rc_checkout_ctx";

const mapSize = (t) => (t === "Único" ? "U" : String(t || "").trim());

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const onlyDigitsCount = (v) => String(v || "").replace(/\D/g, "").length;

export default function Checkout() {
    const navigate = useNavigate();
    const { items, total } = useCart();

    const [kidName, setKidName] = useState("");
    const [adultName, setAdultName] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [showMpNotice, setShowMpNotice] = useState(false);

    const [touched, setTouched] = useState({
        kidName: false,
        adultName: false,
        email: false,
        tel: false,
    });

    const errors = useMemo(() => {
        const e = {};
        const k = kidName.trim();
        const a = adultName.trim();
        const em = email.trim();
        const ph = tel.trim();

        if (!k) e.kidName = "¿Nos decís el nombre del peque? 😊";
        if (!a) e.adultName = "¿Quién es el adulto responsable? 💛";
        if (!em) e.email = "Necesitamos un mail para enviarte la confirmación.";
        else if (!isValidEmail(em)) e.email = "Ese mail parece incompleto.";
        if (!ph) e.tel = "Nos falta un teléfono de contacto.";
        else if (onlyDigitsCount(ph) < 8) e.tel = "¿Te faltó algún número en el teléfono?";

        return e;
    }, [kidName, adultName, email, tel]);

    const canPay = items.length > 0 && Object.keys(errors).length === 0 && !submitting;

    const safeItems = useMemo(() => {
        return (items || []).map((it) => ({
        id: it.id,
        name: it.name,
        talle: it.talle,
        qty: it.qty,
        price: Number(it.price ?? 0),
        avatar: it.avatar,
        }));
    }, [items]);

    const openNoticeOrSubmit = () => {
        if (!items?.length) return;

        setTouched({ kidName: true, adultName: true, email: true, tel: true });
        if (Object.keys(errors).length > 0) return;

        setShowMpNotice(true);
    };

    const handleConfirm = async () => {
        if (!canPay) return;

        setSubmitting(true);
        try {
        const payload = {
            customer: { name: adultName.trim(), email: email.trim(), phone: tel.trim() },
            items: items.map((it) => ({
            code: it.id,
            size: mapSize(it.talle),
            qty: it.qty,
            })),
            // Tu backend hoy lo ignora si no lo guardás. Igual lo mandamos.
            meta: {
            kidName: kidName.trim(),
            adultName: adultName.trim(),
            },
        };

        const created = await createOrder(payload);
        console.log("CHECKOUT order response =>", created);
        console.log("INIT POINT =>", created?.init_point);

        // Guardamos contexto para mostrar el “Gracias Pepa… Pepito…” al volver de MP
        localStorage.setItem(
            LS_CTX_KEY,
            JSON.stringify({
            kidName: kidName.trim(),
            adultName: adultName.trim(),
            orderId: created?.id,
            at: Date.now(),
            })
        );

        // Redirigir a Mercado Pago
        window.location.href = created.init_point;
        } catch (err) {
        console.error(err);
        alert(err?.data?.message || err.message || "No se pudo crear la orden");
        setSubmitting(false);
        setShowMpNotice(false);
        }
    };

    return (
        <main className={`${styles.stage} py-10`}>
        <div className={styles.bg} aria-hidden="true" />

        <Container className="grid gap-6 max-w-[920px]">
            <div className={styles.head}>
            <h1 className={styles.title}>¡Ya falta poquito! 🌈</h1>
            <p className={styles.sub}>
                Completá estos datos y te redirigimos a <b>Mercado Pago</b> para pagar de forma segura.
            </p>
            </div>

            <div className={styles.grid}>
            <Card className={`${styles.shell} p-5 grid gap-4`}>
                <div className={styles.sectionHead}>
                <div className={styles.sectionTitle}>Datos para preparar el uniforme</div>
                <div className={styles.sectionHint}>Esto nos ayuda a dejar todo listo.</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Input
                    label="Nombre del niño/a"
                    value={kidName}
                    onChange={(e) => setKidName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, kidName: true }))}
                    placeholder="Ej: Pepita"
                    />
                    {touched.kidName && errors.kidName ? (
                    <div className={styles.err}>{errors.kidName}</div>
                    ) : null}
                </div>

                <div>
                    <Input
                    label="Adulto responsable"
                    value={adultName}
                    onChange={(e) => setAdultName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, adultName: true }))}
                    placeholder="Ej: Pepa"
                    />
                    {touched.adultName && errors.adultName ? (
                    <div className={styles.err}>{errors.adultName}</div>
                    ) : null}
                </div>
                </div>

                <div className={styles.sectionHead}>
                <div className={styles.sectionTitle}>Datos de contacto</div>
                <div className={styles.sectionHint}>Por si necesitamos confirmar talles o coordinar.</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Input
                    label="Teléfono"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, tel: true }))}
                    placeholder="Ej: 11 1234 5678"
                    />
                    {touched.tel && errors.tel ? <div className={styles.err}>{errors.tel}</div> : null}
                </div>

                <div>
                    <Input
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    placeholder="Ej: familia@email.com"
                    />
                    {touched.email && errors.email ? <div className={styles.err}>{errors.email}</div> : null}
                </div>
                </div>

                <div className={styles.infoBox}>
                <div className={styles.infoIcon} aria-hidden="true">
                    🔒
                </div>
                <div className={styles.infoText}>
                    <b>Importante:</b> no ingresás datos de tarjeta en esta página.
                    <br />
                    El pago se realiza dentro de <b>Mercado Pago</b>, en su plataforma segura.
                </div>
                </div>

                <div className="border-t border-ui-border pt-4 flex items-center justify-between">
                <div className="text-sm text-ui-muted">Total</div>
                <div className="text-xl font-extrabold text-ui-text">
                    ${Number(total || 0).toLocaleString("es-AR")}
                </div>
                </div>

                <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => navigate("/carrito")} disabled={submitting}>
                    Volver
                </Button>
                <Button variant="primary" disabled={!canPay} onClick={openNoticeOrSubmit}>
                    Ir a pagar con Mercado Pago
                </Button>
                </div>
            </Card>

            <Card className={`${styles.shell} p-5 grid gap-4`}>
                <div className={styles.sectionHead}>
                <div className={styles.sectionTitle}>Resumen del pedido</div>
                <div className={styles.sectionHint}>Revisá talles y cantidades.</div>
                </div>

                {safeItems.length === 0 ? (
                <div className={styles.empty}>
                    Tu carrito está vacío. Volvé al catálogo y elegí un uniforme 💛
                </div>
                ) : (
                <div className={styles.lines}>
                    {safeItems.map((it) => (
                    <div key={`${it.id}-${it.talle}`} className={styles.line}>
                        <div className={styles.lineMain}>
                        <div className={styles.lineName}>{it.name}</div>
                        <div className={styles.lineMeta}>
                            Talle <b>{it.talle}</b> · Cantidad <b>{it.qty}</b>
                        </div>
                        </div>
                        <div className={styles.linePrice}>
                        ${Number(it.price * it.qty).toLocaleString("es-AR")}
                        </div>
                    </div>
                    ))}
                </div>
                )}

                <div className={styles.totalBox}>
                <div className={styles.totalLabel}>Total</div>
                <div className={styles.totalValue}>
                    ${Number(total || 0).toLocaleString("es-AR")}
                </div>
                </div>

                <div className={styles.miniNote}>
                Vas a completar el pago en Mercado Pago. Al finalizar, volvés al sitio y te mostramos la confirmación.
                </div>
            </Card>
            </div>
        </Container>

        {showMpNotice ? (
            <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Aviso Mercado Pago">
            <div className={styles.modal}>
                <div className={styles.modalTop}>
                <div className={styles.modalIcon} aria-hidden="true">
                    🧾
                </div>
                <div className={styles.modalTitle}>Te redirigimos a Mercado Pago</div>
                </div>

                <div className={styles.modalBody}>
                <p className={styles.modalP}>
                    En el siguiente paso vas a pagar en <b>Mercado Pago</b>. <br />
                    <b>No</b> ingresás datos de tarjeta en esta página.
                </p>

                <div className={styles.modalBullets}>
                    <div>✅ Pago seguro en plataforma Mercado Pago</div>
                    <div>✅ Al terminar, volvés y te mostramos la confirmación</div>
                </div>
                </div>

                <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setShowMpNotice(false)} disabled={submitting}>
                    Revisar datos
                </Button>
                <Button variant="primary" onClick={handleConfirm} disabled={!canPay}>
                    Continuar a Mercado Pago
                </Button>
                </div>
            </div>
            </div>
        ) : null}
        </main>
    );
}