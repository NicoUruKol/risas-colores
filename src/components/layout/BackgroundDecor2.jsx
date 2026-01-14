import { useEffect, useRef, useState } from "react";

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

// mide alto real del contenedor (Home o wrapper)
function useResizeHeight(ref) {
    const [h, setH] = useState(1400);

    useEffect(() => {
        const el = ref?.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
        const rect = el.getBoundingClientRect();
        const height = Math.max(el.scrollHeight || 0, rect.height || 0, 900);
        setH(height);
        });

        ro.observe(el);

        const rect = el.getBoundingClientRect();
        setH(Math.max(el.scrollHeight || 0, rect.height || 0, 900));

        return () => ro.disconnect();
    }, [ref]);

    return h;
    }

    // tiempo continuo estable
    function useRafTime() {
    const [t, setT] = useState(0);
    const tRef = useRef(0);
    const lastRef = useRef(0);

    useEffect(() => {
        let raf = 0;

        const loop = (now) => {
        if (!lastRef.current) lastRef.current = now;
        const dt = Math.min(0.05, (now - lastRef.current) / 1000);
        lastRef.current = now;

        tRef.current += dt;
        setT(tRef.current);

        raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    return t;
    }

    /**
     * Gusano sobre un path con dinámica correcta:
     * - head avanza 0..L
     * - wormLen = min(maxLen, head) => crece al principio
     * - tail sigue cuando head > maxLen
     *
     * Importante: NO hay fadeOut por tiempo.
     * El gusano sale naturalmente cuando head y tail salen del viewport (porque el path termina fuera).
     */
    function WormRunner({
        d,
        frac, // 0..1 para ESTE recorrido
        colorVar,
        thickness = 54,
        visibleFrac = 0.60, // largo máximo del gusano (fracción del path)
        seed = 1,
        }) {
        const [pathLen, setPathLen] = useState(0);
        const pathRef = useRef(null);

        useEffect(() => {
            if (!pathRef.current) return;
            try {
            const L = pathRef.current.getTotalLength();
            setPathLen(Number.isFinite(L) && L > 10 ? L : 0);
            } catch {
            setPathLen(0);
            }
        }, [d]);

        // Hasta medir, no mostramos nada (evita “saltos” y gusanos fantasmas)
        if (pathLen <= 10) {
            return (
            <path ref={pathRef} d={d} fill="none" stroke="transparent" strokeWidth={1} />
            );
        }

        const L = pathLen;

        // máximo largo visible en unidades del path
        const maxLen = L * visibleFrac;

        // CLAVE: hacemos que en un ciclo la cabeza recorra L + maxLen
        // (primero crece, luego cola persigue y termina de salir)
        const travel = L + maxLen;
        const headDist = clamp01(frac) * travel;

        const headOnPath = Math.min(L, headDist);
        const tailDist = Math.max(0, headDist - maxLen);
        const tailOnPath = Math.min(L, tailDist);

        const wormLen = Math.max(0, headOnPath - tailOnPath);

        const dasharray = `${wormLen} ${L}`;
        const dashoffset = -tailOnPath; // ✅ ANCLA EN LA COLA (no “rebota” al inicio)

        // Fade MUY leve solo al inicio para evitar “pop”
        const alpha = 0.95 * smoothstep(0.0, 0.02, frac);

        const glowId = `glow-${seed}`;
        const haloId = `halo-${seed}`;

        return (
            <g opacity={alpha}>
            <defs>
                <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="16" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
                </filter>
                <filter id={haloId} x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="30" />
                </filter>
            </defs>

            {/* halo con el MISMO dash => no ensucia */}
            <path
                d={d}
                fill="none"
                stroke={`var(${colorVar})`}
                strokeWidth={thickness * 1.10}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                opacity={0.10}
                filter={`url(#${haloId})`}
            />

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
                filter={`url(#${glowId})`}
            />
            </g>
        );
        }

    /**
     * Scheduler A/B:
     * - Nunca aparecen juntos.
     * - durA y durB son independientes y NO se contaminan.
     */
    function WormPair({
        t,
        dA,
        dB,
        durA,
        durB,
        colorVar,
        thickness,
        visibleFrac,
        seedBase,
        startDelay = 0, // ✅ delay real (no arranca “a mitad de camino”)
        }) {
        const period = durA + durB;

        // ✅ Mientras no se cumple el delay, nada “desplegado”
        if (t < startDelay) return null;

        // ✅ tiempo local arranca en 0 cuando aparece
        const tt = t - startDelay;
        const local = tt % period;

        const isA = local < durA;
        const frac = isA ? local / durA : (local - durA) / durB;
        const d = isA ? dA : dB;

        // seed SOLO para ids (no afecta tiempo)
        const seed = isA ? seedBase * 10 + 1 : seedBase * 10 + 2;

        return (
            <WormRunner
            key={isA ? `${seedBase}-A` : `${seedBase}-B`}  // ✅ fuerza remount al alternar
            d={d}
            frac={frac}
            colorVar={colorVar}
            thickness={thickness}
            visibleFrac={visibleFrac}
            seed={seed}
        />
        );
        }

    export default function BackgroundDecor2({ containerRef }) {
    const t = useRafTime();
    const heightPx = useResizeHeight(containerRef);

    const viewW = 1200;
    const viewH = 2000;

// viewW=1200 viewH=2000
// nacen fuera (y<0 o x fuera) y mueren fuera (y>2000 o x fuera)
// =========================

    // 🟠 ORANGE_A: loop temprano (y~520), sale abajo-izq
    const ORANGE_A = `M 140 -260
    C 160 60, 140 260, 200 430
    C 300 650, 420 780, 320 920
    C 220 1040, 140 980, 180 880
    C 240 760, 420 820, 420 980
    C 420 1180, 260 1300, 200 1480
    C 120 1700, 110 1920, 80 2140`;

    const ORANGE_B = `M 1160 -240
    C 1145 10, 1090 320, 1105 560
    C 1130 920, 1210 1140, 1120 1280
    C 1060 1420, 1040 1540, 1080 1640
    C 1180 1760, 1040 1840, 940 1720
    C 840 1600, 920 1420, 1060 1460
    C 1220 1520, 1240 1760, 1120 1900
    C 1040 2000, 1000 2060, 1020 2140`;


    // 🟣 VIOLET_A: loop medio (y~850), sale abajo-centro
    const VIOLET_A = `M 600 -280
    C 620 40, 580 260, 640 520
    C 720 760, 760 980, 680 1180
    C 620 1320, 640 1460, 700 1560
    C 780 1700, 640 1760, 560 1680
    C 460 1580, 520 1400, 640 1420
    C 800 1460, 820 1720, 700 1880
    C 620 2000, 560 2060, 520 2140`;

    // 🟣 VIOLET_B: loop bien abajo (y~1500), sale abajo-izq
    const VIOLET_B = `M 80 -240
    C 100 80, 140 260, 200 440
    C 280 640, 360 820, 260 960
    C 180 1080, 110 1040, 140 940
    C 200 780, 360 860, 380 1020
    C 420 1260, 300 1380, 220 1560
    C 140 1760, 120 1960, 120 2140`;


    // 🔵 BLUE_A: loop bajo-izq (y~1050), sale abajo-izq
    const BLUE_A = `M 1080 -260
    C 1040 80, 980 260, 1040 440
    C 1140 660, 1180 820, 1080 940
    C 960 1080, 940 980, 980 880
    C 1040 760, 1160 820, 1180 980
    C 1220 1240, 1100 1400, 1040 1580
    C 940 1800, 920 1980, 940 2140`;

    // 🔵 BLUE_B: loop más arriba (y~650), sale abajo-der
    const BLUE_B = `M 720 -260
    C 700 60, 640 260, 700 440
    C 780 640, 760 800, 640 900
    C 520 1000, 500 880, 560 800
    C 640 700, 740 760, 760 900
    C 820 1140, 740 1340, 660 1540
    C 560 1760, 540 1960, 560 2140`;


    return (
        <div
        className="pointer-events-none absolute left-0 top-0 w-full overflow-hidden"
        style={{ height: `${heightPx}px`, zIndex: 0 }}
        >
        <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            {/* 🟠 Naranja: SOLO A o SOLO B (nunca juntos) */}
            <WormPair
            t={t}
            dA={ORANGE_A}
            dB={ORANGE_B}
            durA={6.0}  // ← velocidad del recorrido A
            durB={6.0}  // ← velocidad del recorrido B
            colorVar="--brand-primary"
            thickness={54}
            visibleFrac={0.60}
            seedBase={701}
            />

            {/* 🟣 Violeta */}
            <WormPair
            t={t}
            dA={VIOLET_A}
            dB={VIOLET_B}
            durA={12.0}
            durB={12.0}
            colorVar="--brand-accent"
            thickness={56}
            visibleFrac={0.58}
            seedBase={1301}
            />

            {/* 🔵 Azul */}
            <WormPair
            t={t}
            dA={BLUE_A}
            dB={BLUE_B}
            durA={12.0}
            durB={12.0}
            colorVar="--brand-secondary"
            thickness={50}
            visibleFrac={0.56}
            seedBase={2101}
            />
        </svg>
        </div>
    );
}
