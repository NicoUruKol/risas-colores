import styles from "./AddToCartConfirmModal.module.css";
import Button from "../ui/Button";

export default function AddToCartConfirmModal({
    open,
    title = "Agregado al carrito",
    text = "Se agregó el producto correctamente.",
    onClose,
    onContinue,
    onCheckout,
    }) {
    if (!open) return null;

    return (
        <div
        className={styles.overlay}
        onClick={() => onClose?.()}
        role="dialog"
        aria-modal="true"
        aria-label="Producto agregado"
        >
        <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <button
            type="button"
            className={styles.close}
            onClick={() => onClose?.()}
            aria-label="Cerrar"
            >
            ✕
            </button>

            <div className={styles.header}>
            <div className={styles.badge}>Listo</div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.text}>{text}</p>
            </div>

            <div className={styles.actions}>
            <Button
                variant="secondary"
                className={`${styles.ctaReadable} ${styles.ctaBtn}`}
                onClick={() => onContinue?.()}
            >
                Seguir comprando
                <span className={styles.ctaArrow}>→</span>
            </Button>

            <Button
                variant="secondary"
                className={`${styles.ctaReadable} ${styles.ctaBtn}`}
                onClick={() => onCheckout?.()}
            >
                Finalizar compra
                <span className={styles.ctaArrow}>→</span>
            </Button>
            </div>
        </div>
        </div>
    );
}
