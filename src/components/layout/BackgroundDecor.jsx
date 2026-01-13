// src/components/layout/BackgroundDecor.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useWheelProgress } from "../hooks/useWheelProgress";

/* =========================
   HELPERS
========================= */
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

/* =========================
   CATMULL-ROM -> BEZIER
   - más “delicado”: s más bajo
   - más puntos: step menor
========================= */
function catmullRomToBezierPath(points, s = 0.22) {
    if (!points || points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const c1x = p1.x + (p2.x - p0.x) * (s / 6);
        const c1y = p1.y + (p2.y - p0.y) * (s / 6);
        const c2x = p2.x - (p3.x - p1.x) * (s / 6);
        const c2y = p2.y - (p3.y - p1.y) * (s / 6);

        d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
    }

    return d;
    }

    /* =========================
    PATH GENERATOR
    - más suave: menos componentes “raras”
    - más largo: h grande
    - loops circulares ok
    ========================= */
    function buildWormPath({ seed = 1, w = 1200, h = 5200, side = "left", loop }) {
    const startY = -380;
    const endY = h + 520;

    const baseX =
        side === "left" ? w * 0.28 : side === "right" ? w * 0.72 : w * 0.52;

    // Movimiento “serpiente”: 1 seno principal + 1 micro seno MUY suave
    const amp = 320 + ((seed * 41) % 160);
    const period = 980 + ((seed * 31) % 320);
    const phase = ((seed * 0.77) % 6.283);

    const amp2 = amp * 0.08;
    const period2 = period * 0.62;
    const phase2 = phase * 1.25;

    const step = 7; // ✅ más puntos = menos quiebres
    const pts = [];

    for (let yy = startY; yy <= endY; yy += step) {
        let x =
        baseX +
        Math.sin(yy / period + phase) * amp +
        Math.sin(yy / period2 + phase2) * amp2;

        let y = yy;

        if (loop) {
        const y0 = loop.y - loop.span / 2;
        const y1 = loop.y + loop.span / 2;

        if (y >= y0 && y <= y1) {
            const t = (y - y0) / (y1 - y0);
            const theta = t * Math.PI * 2;

            const wIn = smoothstep(0.0, 0.16, t);
            const wOut = 1 - smoothstep(0.84, 1.0, t);
            const wMix = wIn * wOut;

            x = x + Math.cos(theta) * loop.radius * wMix;
            y = y + Math.sin(theta) * loop.radius * wMix;
        }
        }

        pts.push({ x, y });
    }

    return catmullRomToBezierPath(pts, 0.20);
    }

    /* =========================
    WORM
    - maxSeg más largo (0.95)
    - ciclo más corto => nace/continúa casi sin pausa
    ========================= */
    function Worm({
    progress,
    seed = 1,
    thickness = 48,
    maxSeg = 1.95,     // ✅ +50% vs 0.85 y mucho más que 0.35
    cycleLen = 3.2,    // ✅ alterna rápido => “casi continuo”
    colorVar = "--brand-primary",
    anchorA,
    anchorB,
    sideA,
    sideB,
    loopA,
    loopB,
    }) {
    // progress es continuo (RAF), así que no “salta”
    const t = progress / cycleLen;
    const cycle = Math.floor(t);
    const u = t - cycle; // 0..1

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

    useEffect(() => {
        if (!pathRef.current) return;
        try {
        const L = pathRef.current.getTotalLength();
        if (Number.isFinite(L) && L > 10) setLen(L);
        } catch {
        setLen(20000);
        }
    }, [d]);

    // Segmento visible: crece y luego cola persigue
    const uExt = u * (1 + maxSeg);
    const head = Math.min(1, uExt);
    const tail = Math.min(1, Math.max(0, uExt - maxSeg));

    const visible = Math.max(0.0001, head - tail);
    const visibleLen = visible * len;

    const dasharray = `${visibleLen} ${len}`;
    const dashoffset = len - tail * len;

    return (
        <div
        className="absolute top-0 pointer-events-none"
        style={{
            left: anchor.x,
            top: anchor.y,
            width: "1180px",
            height: "560vh",
        }}
        >
        <svg viewBox="0 0 1200 5200" className="h-full w-full overflow-visible" aria-hidden="true">
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
            strokeWidth={thickness * 1.06}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            opacity={0.20}
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
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            filter={`url(#glow-${seed}-${alt ? "b" : "a"})`}
            style={{
                filter: `url(#glow-${seed}-${alt ? "b" : "a"}) saturate(2.35) brightness(1.38)`,
            }}
            />
        </svg>
        </div>
    );
    }

    /* =========================
    BACKGROUND DECOR
    CLAVE:
    - wheelRaw puede venir a saltos
    - acá lo “convertimos” a progresión continua con RAF
    ========================= */
    export default function BackgroundDecor() {
    // el hook existente: lo usamos SOLO como “input”
    // (subí speed para que al 1er tick aparezca cabeza)
    const wheelRaw = useWheelProgress({ speed: 0.010, smooth: 0.08 });

    // progresión continua: evita saltos visibles
    const [p, setP] = useState(0);
    const targetRef = useRef(0);
    const pRef = useRef(0);

    useEffect(() => {
        targetRef.current = wheelRaw;
    }, [wheelRaw]);

    useEffect(() => {
        let raf = 0;

        const tick = () => {
        // easing fuerte => sin escalones
        const cur = pRef.current;
        const tgt = targetRef.current;

        // si el wheel “pega saltos”, acá se vuelve continuo
        const next = cur + (tgt - cur) * 0.12;

        pRef.current = next;
        setP(next);

        raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
        {/* NARANJA */}
        <Worm
            progress={p}
            colorVar="--brand-primary"
            seed={7}
            thickness={50}
            maxSeg={0.95}
            cycleLen={3.1}
            anchorA={{ x: -150, y: -220 }}                    // ✅ entra ya
            anchorB={{ x: "calc(78vw - 650px)", y: -220 }}
            sideA="left"
            sideB="right"
            loopA={{ y: 1200, radius: 240, span: 700 }}
            loopB={{ y: 760, radius: 210, span: 640 }}
        />

        {/* VIOLETA */}
        <Worm
            progress={p}
            colorVar="--brand-accent"
            seed={13}
            thickness={54}
            maxSeg={0.95}
            cycleLen={3.25}
            anchorA={{ x: "calc(52vw - 500px)", y: -260 }}
            anchorB={{ x: -300, y: -220 }}
            sideA="center"
            sideB="left"
            loopA={{ y: 1500, radius: 290, span: 820 }}
            loopB={{ y: 980, radius: 240, span: 720 }}
        />

        {/* AZUL */}
        <Worm
            progress={p}
            colorVar="--brand-secondary"
            seed={21}
            thickness={44}
            maxSeg={0.95}
            cycleLen={2.95}
            anchorA={{ x: "calc(100vw - 860px)", y: -280 }}
            anchorB={{ x: 10, y: -280 }}
            sideA="right"
            sideB="left"
            loopA={{ y: 1200, radius: 200, span: 600 }}
            loopB={null}
        />
        </div>
    );
}
