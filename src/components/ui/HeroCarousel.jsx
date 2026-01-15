import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./HeroCarousel.module.css";

export default function HeroCarousel({ images = [], interval = 4500, onChange }) {
    const [index, setIndex] = useState(0);
    const startX = useRef(null);

    // ir a un índice específico (UN solo lugar para cambiar)
    const goTo = useCallback(
        (next) => {
        const safe = ((next % images.length) + images.length) % images.length;
        setIndex(safe);
        if (onChange) onChange(safe);
        },
        [images.length, onChange]
    );

    const nextSlide = useCallback(() => {
        if (images.length <= 1) return;
        goTo(index + 1);
    }, [images.length, goTo, index]);

    const prevSlide = useCallback(() => {
        if (images.length <= 1) return;
        goTo(index - 1);
    }, [images.length, goTo, index]);

    // autoplay
    useEffect(() => {
        if (images.length <= 1) return;
        const id = setInterval(() => {
        setIndex((i) => {
            const next = (i + 1) % images.length;
            if (onChange) onChange(next);
            return next;
        });
        }, interval);

        return () => clearInterval(id);
    }, [images.length, interval, onChange]);

    // swipe mobile
    const onTouchStart = (e) => (startX.current = e.touches[0].clientX);

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
            key={src}
            src={src}
            alt=""
            className={`${styles.slide} ${i === index ? styles.active : ""}`}
            draggable={false}
            />
        ))}

        {/* indicadores */}
        <div className={styles.dots}>
            {images.map((_, i) => (
            <button
                key={i}
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ver imagen ${i + 1}`}
            />
            ))}
        </div>
        </div>
    );
}
