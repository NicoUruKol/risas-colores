import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./HeroCarousel.module.css";

export default function HeroCarousel({ images = [], interval = 4500, onChange }) {
    const [index, setIndex] = useState(0);
    const startX = useRef(null);

    const isMulti = images.length > 1;

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        setIndex((i) => {
        if (images.length === 0) return 0;
        return Math.min(i, images.length - 1);
        });
    }, [images.length]);

    const lastNotified = useRef(null);
    useEffect(() => {
        if (images.length === 0) return;
        if (lastNotified.current === index) return;
        lastNotified.current = index;
        onChangeRef.current?.(index);
    }, [index, images.length]);

    const goTo = useCallback(
        (next) => {
        if (!isMulti) return;
        const safe = ((next % images.length) + images.length) % images.length;
        setIndex(safe);
        },
        [images.length, isMulti]
    );

    const nextSlide = useCallback(() => {
        if (!isMulti) return;
        setIndex((i) => (i + 1) % images.length);
    }, [images.length, isMulti]);

    const prevSlide = useCallback(() => {
        if (!isMulti) return;
        setIndex((i) => (i - 1 + images.length) % images.length);
    }, [images.length, isMulti]);

    useEffect(() => {
        if (!isMulti) return;

        const id = setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
        }, interval);

        return () => clearInterval(id);
    }, [images.length, interval, isMulti]);

    const onTouchStart = (e) => {
        if (!isMulti) return;
        startX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (!isMulti) return;
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
        <div className={styles.viewport}>
            {images.map((src, i) => (
            <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                draggable={false}
                className={`${styles.slide} ${i === index ? styles.active : ""}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
            />
            ))}
        </div>

        {isMulti && (
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
        )}
        </div>
    );
}
