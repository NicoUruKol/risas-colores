import ImageBox from "../ui/ImageBox";
import styles from "./ProductoDetalleCarousel.module.css";

export default function ProductoDetalleCarousel({
    images = [],
    index = 0,
    onChange,
    onOpenZoom,
    onPrev,
    onNext,
    title = "",
    }) {
    const canNav = images.length > 1;
    const src = images[index];

    return (
        <div className={styles.gallery} aria-roledescription="carousel">
        <button
            type="button"
            className={styles.imgButton}
            onClick={onOpenZoom}
            aria-label="Abrir zoom"
            disabled={!src}
        >
            <ImageBox
            src={src}
            alt={title}
            fit="contain"
            tone="soft"
            bordered={false}
            rounded="xl"
            ratio="auto"
            className={styles.media}
            />
            <span className={styles.zoomHint}>Tap / Click para zoom</span>
        </button>

        {canNav && (
            <>
            <button type="button" className={styles.navLeft} onClick={onPrev} aria-label="Anterior">
                ‹
            </button>
            <button type="button" className={styles.navRight} onClick={onNext} aria-label="Siguiente">
                ›
            </button>

            <div className={styles.dots} role="tablist" aria-label="Cambiar imagen">
                {images.map((_, i) => (
                <button
                    key={i}
                    type="button"
                    className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                    onClick={() => onChange?.(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                />
                ))}
            </div>
            </>
        )}
        </div>
    );
}
