import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ImageZoomModal.module.css";

export default function ImageZoomModal({
    open,
    src,
    alt = "",
    hasNav = false,
    onClose,
    onPrev,
    onNext,
    }) {
    const viewportRef = useRef(null);
    const rafRef = useRef(null);
    const [pos, setPos] = useState({ x: 50, y: 50 });

    const canRender = Boolean(open && src);

    const zoomScale = useMemo(() => 2.2, []);

    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
        if (e.key === "Escape") onClose?.();
        if (e.key === "ArrowRight" && hasNav) onNext?.();
        if (e.key === "ArrowLeft" && hasNav) onPrev?.();
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, hasNav, onClose, onNext, onPrev]);

    useEffect(() => {
        if (!open) {
        setPos({ x: 50, y: 50 });
        }
    }, [open, src]);

    const updateFromEvent = (e) => {
        const el = viewportRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const clientX = e.touches?.[0]?.clientX ?? e.clientX;
        const clientY = e.touches?.[0]?.clientY ?? e.clientY;

        const px = ((clientX - rect.left) / rect.width) * 100;
        const py = ((clientY - rect.top) / rect.height) * 100;

        const clampedX = Math.max(0, Math.min(100, px));
        const clampedY = Math.max(0, Math.min(100, py));

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => setPos({ x: clampedX, y: clampedY }));
    };

    const handleMouseMove = (e) => updateFromEvent(e);

    const handleTouchMove = (e) => {
        updateFromEvent(e);
    };

    if (!canRender) return null;

    return (
        <div
        className={styles.overlay}
        onClick={() => onClose?.()}
        role="dialog"
        aria-modal="true"
        aria-label="Vista ampliada"
        >
        <div className={styles.content} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.close} onClick={() => onClose?.()} aria-label="Cerrar">
            ✕
            </button>

            <div
            ref={viewportRef}
            className={styles.viewport}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            >
            <img
                src={src}
                alt={alt}
                draggable={false}
                className={styles.img}
                style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
                }}
            />
            </div>

            {hasNav && (
            <>
                <button type="button" className={styles.navLeft} onClick={onPrev} aria-label="Anterior">
                ‹
                </button>
                <button type="button" className={styles.navRight} onClick={onNext} aria-label="Siguiente">
                ›
                </button>
            </>
            )}
        </div>
        </div>
    );
}
