import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./HeroCarousel.module.css";

export default function HeroCarousel({ images = [], interval = 4500, onChange }) {
    const [index, setIndex] = useState(0);
    const startX = useRef(null);

    // ✅ guardar el callback más reciente sin meterlo en deps
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // ✅ mantener index válido si cambia images
    useEffect(() => {
        setIndex((i) => {
        if (images.length === 0) return 0;
        return Math.min(i, images.length - 1);
        });
    }, [images.length]);

    // ✅ notificar al padre SOLO cuando cambia index (sin loop)
    const lastNotified = useRef(null);
    useEffect(() => {
        if (images.length === 0) return;

        // evita notificar dos veces el mismo index (StrictMode/mount)
        if (lastNotified.current === index) return;
        lastNotified.current = index;

        onChangeRef.current?.(index);
    }, [index, images.length]);

    const goTo = useCallback(
        (next) => {
        if (images.length === 0) return;
        const safe = ((next % images.length) + images.length) % images.length;
        setIndex(safe);
        },
        [images.length]
    );

    const nextSlide = useCallback(() => {
        if (images.length <= 1) return;
        setIndex((i) => (i + 1) % images.length);
    }, [images.length]);

    const prevSlide = useCallback(() => {
        if (images.length <= 1) return;
        setIndex((i) => (i - 1 + images.length) % images.length);
    }, [images.length]);

    // autoplay
    useEffect(() => {
        if (images.length <= 1) return;

        const id = setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
        }, interval);

        return () => clearInterval(id);
    }, [images.length, interval]);

    // swipe mobile
    const onTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (startX.current == null) return;
        const dx = e.changedTouches[0].clientX - startX.current;

        if (Math.abs(dx) > 40) {
        if (dx < 0) nextSlide();
        else prevSlide();
        }

        startX.current = null;
    };

    return (
        <div
        className={styles.carousel}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-roledescription="carousel"
        >
        {images.map((src, i) => (
            <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className={`${styles.slide} ${i === index ? styles.active : ""}`}
            draggable={false}
            />
        ))}

        <div className={styles.dots}>
            {images.map((_, i) => (
            <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ver imagen ${i + 1}`}
            />
            ))}
        </div>
        </div>
    );
}
