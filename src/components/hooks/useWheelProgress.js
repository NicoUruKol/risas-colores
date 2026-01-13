import { useEffect, useRef, useState } from "react";

/**
 * useWheelProgress
 * - NO depende del scroll real.
 * - Wheel controla una "velocidad" (impulso).
 * - RAF integra esa velocidad a un "progreso" continuo.
 *
 * Params:
 * - speed: sensibilidad del wheel (más alto = aparece antes)
 * - friction: desaceleración suave (0.90..0.97)
 * - maxVel: límite de velocidad para que no “salga disparado”
 * - clampMin/clampMax: opcional, para acotar el progreso
 */
export function useWheelProgress({
    speed = 0.02,
    friction = 0.95,
    maxVel = 0.14,
    clampMin = -1e9,
    clampMax = 1e9,
    } = {}) {
    const [progress, setProgress] = useState(0);

    const pRef = useRef(0);
    const vRef = useRef(0);
    const rafRef = useRef(0);

    useEffect(() => {
        const onWheel = (e) => {
        // Normalización: evita deltas gigantes (trackpads)
        const dy = Math.max(-120, Math.min(120, e.deltaY));

        // dy>0 (scroll down) => progreso aumenta
        vRef.current += dy * speed * 0.01;

        // clamp velocidad
        if (vRef.current > maxVel) vRef.current = maxVel;
        if (vRef.current < -maxVel) vRef.current = -maxVel;
        };

        window.addEventListener("wheel", onWheel, { passive: true });
        return () => window.removeEventListener("wheel", onWheel);
    }, [speed, maxVel]);

    useEffect(() => {
        const tick = () => {
        // Integrar velocidad -> progreso
        pRef.current += vRef.current;

        // Fricción (suaviza y elimina “saltos”)
        vRef.current *= friction;

        // Umbral para que no quede vibrando
        if (Math.abs(vRef.current) < 0.00001) vRef.current = 0;

        // Clamp opcional
        if (pRef.current < clampMin) pRef.current = clampMin;
        if (pRef.current > clampMax) pRef.current = clampMax;

        setProgress(pRef.current);
        rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [friction, clampMin, clampMax]);

    return progress;
}


