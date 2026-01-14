import { useEffect, useMemo, useRef, useState } from "react";

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

// mide alto real del contenedor (Home o wrapper en AppShell)
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

    // Gusano recorriendo un path:
    // - 1) nace desde afuera y CRECE (wormLen = head)
    // - 2) llega a maxLen y la cola persigue (wormLen fijo)
    // - 3) no hay “wrap” => no aparece completo ni retrocede
    function WormPath({
        t,
        dA,
        dB,
        colorVar,
        thickness = 54,
        cycleSec = 12.5,
        visibleFrac = 0.60, // largo máximo relativo
        seed = 1,
        startDelay = 0,     // ✅ nuevo: para que no arranque “en cualquier parte”
        }) {
        const pathRef = useRef(null);
        const [pathLen, setPathLen] = useState(0);

        const L = pathLen > 10 ? pathLen : 6000;
        const maxLen = L * visibleFrac;

        // ✅ delay real: hasta que arranca, no hay progreso
        const tt = Math.max(0, t - startDelay);

        // ✅ ciclo entero (0,1,2...) sin seed metido en el frac
        const cycle = Math.floor(tt / cycleSec);
        const cycleT = (tt - cycle * cycleSec) / cycleSec; // 0..1

        // alterna A/B por ciclo
        const useB = cycle % 2 === 1;
        const d = useMemo(() => (useB ? dB : dA), [useB, dA, dB]);

        // medir path
        useEffect(() => {
            if (!pathRef.current) return;
            try {
            const len = pathRef.current.getTotalLength();
            setPathLen( Number.isFinite(len) && len > 10 ? len : 6000 );
            } catch {
            setPathLen(6000);
            }
        }, [d]);

        // ✅ CLAVE: el head viaja más que el path (sale con cola)
        // head: 0 .. (L + maxLen)
        const travel = L + maxLen;
        const head = travel * cycleT;

        // gusano crece hasta maxLen
        const wormLen = Math.min(maxLen, head);

        // segmento visible
        const dasharray = `${wormLen} ${L}`;
        const dashoffset = L - head;

        // fade-in suave solo al inicio del ciclo
        const alpha = 0.95 * smoothstep(0.0, 0.05, cycleT);

        const glowId = `glow-${seed}-${useB ? "b" : "a"}`;
        const haloId = `halo-${seed}-${useB ? "b" : "a"}`;

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
                <feGaussianBlur stdDeviation="28" />
                </filter>
            </defs>

            {/* halo continuo */}
            <path
                d={d}
                fill="none"
                stroke={`var(${colorVar})`}
                strokeWidth={thickness * 1.12}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.10}
                filter={`url(#${haloId})`}
            />

            {/* gusano viajando */}
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
                style={{ filter: `url(#${glowId}) saturate(1.6) brightness(1.2)` }}
            />
            </g>
        );
        }

    export default function BackgroundDecor2({ containerRef }) {
    const t = useRafTime();
    const heightPx = useResizeHeight(containerRef);

    const viewW = 1200;
    const viewH = 2000;

    /**
     * Ajuste clave:
     * - ORANGE_A y ORANGE_B: 1 loop cada uno (no “doble loop encima”)
     * - Todos los paths nacen fuera (x<0 o x>viewW o y<0) y mueren fuera (y>viewH)
     * - Mantienen curvas suaves “brazo entero”
     */

    // 🟠 NARANJA (A): entra arriba, loop grande temprano, segundo loop más abajo y se va por ABAJO-IZQ
        const ORANGE_A = `M 220 -280
        C 340 60, 260 260, 200 460
        C 120 720, 260 820, 460 900
        C 720 1020, 760 820, 600 680
        C 430 530, 220 640, 300 900
        C 420 1280, 760 1260, 820 980
        C 880 720, 620 640, 460 820
        C 320 980, 420 1160, 640 1200
        C 920 1260, 860 1560, 640 1700
        C 460 1820, 360 1700, 420 1540
        C 500 1340, 760 1400, 740 1640
        C 720 1900, 420 1960, -160 2140`;

        // 🟠 NARANJA (B): entra por IZQ arriba, loop más abajo (más apretado) y sale por ABAJO-DER
        const ORANGE_B = `M -260 120
        C 40 200, 160 380, 220 560
        C 300 800, 160 940, 40 1040
        C -60 1140, 60 1240, 280 1240
        C 560 1240, 680 1020, 520 860
        C 360 700, 180 820, 260 1060
        C 380 1440, 740 1460, 860 1200
        C 960 980, 760 900, 620 1040
        C 480 1180, 620 1340, 820 1400
        C 1120 1490, 1080 1840, 860 1960
        C 640 2080, 360 2060, 1320 2140`;


        // 🟣 VIOLETA (A): orgánico, S larga, loop amplio más abajo, sale por ABAJO-CENTRO (no derecha)
        const VIOLET_A = `M 560 -300
        C 820 80, 460 300, 600 560
        C 770 880, 1020 900, 1100 700
        C 1180 520, 1040 320, 820 360
        C 600 400, 620 680, 820 780
        C 1010 880, 980 1140, 760 1260
        C 560 1380, 440 1240, 520 1000
        C 620 720, 860 780, 940 960
        C 1040 1200, 820 1500, 580 1640
        C 360 1760, 240 1940, 540 2140`;

        // 🟣 VIOLETA (B): entra por DERECHA, loop más arriba y más grande (distinto al A), sale por IZQ abajo
        const VIOLET_B = `M 1460 40
        C 1120 160, 960 360, 900 560
        C 820 860, 580 920, 460 760
        C 300 560, 420 320, 680 360
        C 940 400, 980 720, 760 820
        C 560 900, 600 1100, 800 1220
        C 1040 1370, 1180 1200, 1120 940
        C 1080 720, 860 760, 760 900
        C 620 1100, 760 1320, 980 1400
        C 1260 1500, 1200 1780, 940 1920
        C 700 2060, 520 2060, -220 2140`;


        // 🔵 AZUL (A): columna vertebral, sin loops perfectos, cruza y sale por IZQ
        const BLUE_A = `M 1160 -280
        C 1080 40, 880 220, 720 380
        C 520 580, 560 860, 860 900
        C 1140 940, 1160 1240, 900 1380
        C 660 1510, 560 1350, 600 1140
        C 640 920, 840 940, 940 1080
        C 1080 1260, 980 1500, 740 1640
        C 520 1760, 260 1880, -240 2140`;

        // 🔵 AZUL (B): entra por DERECHA, 1 “rulo” suave (no compás), sale por ABAJO-DER (distinto del A)
        const BLUE_B = `M 1440 260
        C 1140 320, 960 480, 920 680
        C 860 980, 1100 1120, 1240 940
        C 1380 760, 1220 540, 1040 600
        C 860 660, 880 880, 1040 980
        C 1220 1100, 1140 1320, 940 1460
        C 720 1620, 500 1600, 320 1460
        C 140 1320, 180 1060, 420 960
        C 640 860, 820 980, 900 1180
        C 1000 1460, 900 1700, 700 1820
        C 460 1980, 160 2040, 1320 2140`;


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
            <WormPath
                t={t}
                dA={ORANGE_A}
                dB={ORANGE_B}
                colorVar="--brand-primary"
                thickness={54}
                cycleSec={15.5}
                visibleFrac={0.62}
                seed={7}
                startDelay={0.0}   // ✅ arranca primero
                />

                <WormPath
                t={t}
                dA={VIOLET_A}
                dB={VIOLET_B}
                colorVar="--brand-accent"
                thickness={56}
                cycleSec={16.2}
                visibleFrac={0.60}
                seed={13}
                startDelay={1.2}   // ✅ arranca después
                />

                <WormPath
                t={t}
                dA={BLUE_A}
                dB={BLUE_B}
                colorVar="--brand-secondary"
                thickness={50}
                cycleSec={15.8}
                visibleFrac={0.58}
                seed={21}
                startDelay={2.2}   // ✅ arranca después
                />
        </svg>
        </div>
    );
}
