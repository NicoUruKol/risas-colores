import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll(options = {}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
            requestAnimationFrame(() => setVisible(true));
            io.disconnect();
            }
        },
        { threshold: 0.15, ...options }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return { ref, visible };
}
