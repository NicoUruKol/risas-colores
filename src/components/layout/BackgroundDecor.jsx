import { useEffect, useMemo, useRef, useState } from "react";

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function buildWormPath({ seed = 1, w = 1200, h = 1800, side = "left", loop }) {
    const startY = -260;
    const endY = h + 320;

    const baseX =
        side === "left" ? w * 0.30 : side === "right" ? w * 0.70 : w * 0.52;

    // Serpenteo redondo (no “río”)
    const amp = 260 + ((seed * 41) % 120);
    const period = 560 + ((seed * 31) % 180);
    const phase = ((seed * 0.77) % 6.28);

    const step = 18;
    const pts = [];

    for (let yy = startY; yy <= endY; yy += step) {
        let x =
        baseX +
        Math.sin(yy / period + phase) * amp +
        Math.sin(yy / (period * 0.58) + phase * 1.8) * (amp * 0.12);

        let y = yy;

        // Loop visible y prolijo (solo donde lo definimos)
        if (loop) {
        const y0 = loop.y - loop.span / 2;
        const y1 = loop.y + loop.span / 2;

        if (y >= y0 && y <= y1) {
            const t = (y - y0) / (y1 - y0); // 0..1
            const theta = t * Math.PI * 2; // 1 vuelta

            const wIn = smoothstep(0.0, 0.18, t);
            const wOut = 1 - smoothstep(0.82, 1.0, t);
            const wMix = wIn * wOut;

            x = x + Math.cos(theta) * loop.radius * wMix;
            y = y + Math.sin(theta) * loop.radius * 0.22 * wMix;
        }
        }

        pts.push({ x, y });
    }

    // Curva cúbica suave
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        const cx1 = p0.x + (p1.x - p0.x) * 0.35;
        const cy1 = p0.y + (p1.y - p0.y) * 0.35;
        const cx2 = p0.x + (p1.x - p0.x) * 0.65;
        const cy2 = p0.y + (p1.y - p0.y) * 0.65;
        d += ` C ${cx1} ${cy1} ${cx2} ${cy2} ${p1.x} ${p1.y}`;
    }

    return d;
    }

    function Worm({
    scrollY,
    startAt = 0,
    cycleLen = 4200,
    seed = 1,
    thickness = 56, // (ya está ~20% más fino vs tus 70 aprox)
    colorVar = "--brand-primary",
    anchorA,
    anchorB,
    sideA,
    sideB,
    loopA,
    loopB,
    }) {
    if (scrollY < startAt) return null;

    const t = (scrollY - startAt) / cycleLen;
    const cycle = Math.floor(t);
    const frac = t - cycle;

    // Fade-in/out real (no suma infinitos)
    const fadeIn = smoothstep(0.00, 0.08, frac);
    const fadeOut = 1 - smoothstep(0.88, 0.98, frac);
    const alpha = fadeIn * fadeOut;

    // alterna origen por ciclo => “sale por un lado / nace por otro”
    const alt = cycle % 2 === 1;
    const anchor = alt ? anchorB : anchorA;
    const side = alt ? sideB : sideA;
    const loop = alt ? loopB : loopA;

    const d = useMemo(
        () => buildWormPath({ seed: seed + (alt ? 101 : 0), side, loop }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [seed, alt, side, loop?.y, loop?.radius, loop?.span]
    );

    const pathRef = useRef(null);
    const [len, setLen] = useState(1);

    // Largo real => el gusano se “dibuja” con el scroll (no aparece completo)
    useEffect(() => {
        if (!pathRef.current) return;
        try {
        const L = pathRef.current.getTotalLength();
        if (Number.isFinite(L) && L > 10) setLen(L);
        } catch {
        setLen(6000);
        }
    }, [d]);

    const dash = len;
    const offset = dash * (1 - frac);

    return (
        <div
        className="absolute top-0 pointer-events-none"
        style={{
            left: anchor.x,
            top: anchor.y,
            width: "900px",
            height: "210vh",
            opacity: alpha,
        }}
        >
        <svg viewBox="0 0 1200 1800" className="h-full w-full overflow-visible" aria-hidden="true">
            <defs>
            <filter id={`glow-${seed}-${alt ? "b" : "a"}`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="18" result="blur" />
                <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <filter id={`halo-${seed}-${alt ? "b" : "a"}`} x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="34" />
            </filter>
            </defs>

            {/* halo */}
            <path
            d={d}
            fill="none"
            stroke={`var(${colorVar})`}
            strokeWidth={thickness * 1.08}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dash}
            strokeDashoffset={offset}
            opacity={0.22}
            filter={`url(#halo-${seed}-${alt ? "b" : "a"})`}
            />

            {/* trazo */}
            <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke={`var(${colorVar})`}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dash}
            strokeDashoffset={offset}
            filter={`url(#glow-${seed}-${alt ? "b" : "a"})`}
            style={{
                filter: `url(#glow-${seed}-${alt ? "b" : "a"}) saturate(2.1) brightness(1.35)`,
            }}
            />
        </svg>
        </div>
    );
    }

    export default function BackgroundDecor() {
    const [y, setY] = useState(0);

    useEffect(() => {
        const onScroll = () => setY(window.scrollY || 0);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: -1 }} // ✅ atrás del Home sin taparlo
        >
        {/* NARANJA */}
        <Worm
            scrollY={y}
            colorVar="--brand-primary"
            seed={7}
            thickness={56} // -20% aprox
            startAt={30}
            cycleLen={2200}
            anchorA={{ x: -240, y: -170 }}
            anchorB={{ x: "calc(100vw - 680px)", y: -170 }}
            sideA="left"
            sideB="right"
            loopA={{ y: 720, radius: 220, span: 640 }}
            loopB={{ y: 560, radius: 180, span: 560 }}
        />

        {/* VIOLETA */}
        <Worm
            scrollY={y}
            colorVar="--brand-accent"
            seed={13}
            thickness={54}
            startAt={60}
            cycleLen={2400}
            anchorA={{ x: "calc(50vw - 320px)", y: -190 }}
            anchorB={{ x: -220, y: -190 }}
            sideA="center"
            sideB="left"
            loopA={{ y: 980, radius: 240, span: 740 }} // loop grande y visible
            loopB={{ y: 700, radius: 200, span: 660 }}
        />

        {/* AZUL */}
        <Worm
            scrollY={y}
            colorVar="--brand-secondary"
            seed={21}
            thickness={55}
            startAt={90}
            cycleLen={2100}
            anchorA={{ x: "calc(100vw - 680px)", y: -175 }}
            anchorB={{ x: -260, y: -175 }}
            sideA="right"
            sideB="left"
            loopA={{ y: 760, radius: 170, span: 540 }}
            loopB={null}
        />
        </div>
    );
}
