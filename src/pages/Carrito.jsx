import { Link, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useCart } from "../context/CartContext";
import styles from "./Carrito.module.css";

export default function Carrito() {
    const navigate = useNavigate();
    const { items, total, updateQty, removeItem } = useCart();

    const goCheckout = () => {
        if (items.length === 0) return;
        navigate("/checkout");
    };

    return (
        <main className={styles.stage}>
        <div className={styles.bg} aria-hidden="true" />
        <Container className={styles.page}>
            {/* Header */}
            <div className={styles.headerShell}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Carrito</h1>
                <Link to="/uniformes">
                    <Button variant="secondary" className={`${styles.ctaReadable} ${styles.ctaBtn}`}>
                            <span className={styles.ctaIcon}>←</span>
                            Seguir comprando
                    </Button>
                </Link>
            </div>
            </div>

            {items.length === 0 ? (
            <Card className={`${styles.productCard} ${styles.emptyCard}`}>
                <p className={styles.muted}>Tu carrito está vacío.</p>
                <div className={styles.emptyActions}>
                <Link to="/uniformes">
                    <Button variant="secondary" className={`${styles.ctaReadable} ${styles.ctaBtn}`}>
                            <span className={styles.ctaIcon}>←</span>
                            Ver uniformes
                    </Button>
                </Link>
                </div>
            </Card>
            ) : (
            <>
                {/* Items */}
                <div className={styles.list}>
                {items.map((it) => (
                    <Card
                    key={`${it.id}-${it.talle ?? "U"}`}
                    className={`${styles.productCard} ${styles.itemCard}`}
                    >
                    <div className={styles.itemGrid}>
                        <div className={styles.mediaBox}>
                        {it.avatar ? (
                            <img
                            className={styles.mediaImg}
                            src={it.avatar}
                            alt={it.name}
                            loading="lazy"
                            />
                        ) : (
                            <div className={styles.mediaPlaceholder} />
                        )}
                        </div>

                        <div className={styles.info}>
                        <div className={styles.name}>{it.name}</div>

                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Talle</span>
                            <span className={styles.metaValue}>
                            {it.talle ?? "Único"}
                            </span>
                        </div>

                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Precio</span>
                            <span className={`${styles.metaValue} ${styles.priceEach}`}>
                            ${it.price.toLocaleString("es-AR")} c/u
                            </span>
                        </div>
                        </div>

                        <div className={styles.right}>
                        <div className={styles.qtyRow}>
                            <Button
                            variant="ghost"
                            size="sm"
                            className={styles.qtyBtn}
                            onClick={() => updateQty(it.id, it.talle, it.qty - 1)}
                            >
                            −
                            </Button>

                            <div className={styles.qtyVal}>{it.qty}</div>

                            <Button
                            variant="ghost"
                            size="sm"
                            className={styles.qtyBtn}
                            onClick={() => updateQty(it.id, it.talle, it.qty + 1)}
                            >
                            +
                            </Button>
                        </div>

                        <div className={styles.lineTotal}>
                            ${(it.price * it.qty).toLocaleString("es-AR")}
                        </div>

                        <button
                            className={styles.remove}
                            onClick={() => removeItem(it.id, it.talle)}
                        >
                            Quitar
                        </button>
                        </div>
                    </div>
                    </Card>
                ))}
                </div>

                {/* Summary */}
                <Card className={`${styles.productCard} ${styles.summaryCard}`}>
                    <div className={styles.summaryRow}>
                        <div className={styles.summaryLabel}>Total</div>
                        <div className={styles.summaryValue}>
                        ${total.toLocaleString("es-AR")}
                        </div>
                    </div>

                    <div className={styles.summaryActions}>
                        <Link to="/uniformes">
                            <Button variant="secondary" className={`${styles.ctaReadable} ${styles.ctaBtn}`}>
                                    <span className={styles.ctaIcon}>+</span>
                                    Agregar más
                            </Button>
                        </Link>
                            <Button variant="secondary" className={`${styles.ctaReadable} ${styles.ctaBtn}`} onClick={goCheckout}>
                                Finalizar compra
                            </Button>
                    </div>
                </Card>
            </>
            )}
        </Container>
        </main>
    );
}
