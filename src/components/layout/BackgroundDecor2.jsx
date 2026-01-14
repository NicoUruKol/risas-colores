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

    // 🟠 NARANJA (A): un loop grande, luego se va
    const ORANGE_A = `M 160 -260
        C 260 40, 220 260, 160 460
        C 90 700, 210 820, 380 900
        C 600 1000, 640 820, 520 700
        C 390 560, 170 620, 220 880
        C 300 1220, 680 1240, 720 980
        C 760 720, 520 620, 380 760
        C 240 900, 340 1080, 560 1160
        C 860 1260, 880 1600, 620 1760
        C 420 1880, 240 1980, 200 2140`;

    // 🟠 NARANJA (B): otro loop, más abajo (espaciado)
    const ORANGE_B = `M -220 120
        C 60 200, 160 360, 190 520
        C 240 760, 120 860, 40 980
        C -30 1100, 80 1200, 260 1200
        C 520 1200, 620 1000, 500 860
        C 360 700, 160 820, 220 1040
        C 320 1440, 760 1440, 820 1120
        C 860 900, 640 820, 520 960
        C 380 1120, 520 1320, 740 1380
        C 980 1460, 980 1760, 760 1900
        C 520 2040, 260 2060, 80 2140`;

    // 🟣 VIOLETA (A): S larga orgánica + loop amplio
    const VIOLET_A = `M 540 -280
        C 760 60, 440 260, 560 540
        C 700 860, 920 920, 1040 760
        C 1180 580, 1080 340, 840 360
        C 560 380, 560 680, 760 760
        C 940 840, 960 1100, 780 1220
        C 560 1360, 420 1240, 460 1040
        C 520 760, 760 780, 860 920
        C 1040 1120, 880 1420, 660 1560
        C 420 1720, 260 1900, 320 2140`;

    // 🟣 VIOLETA (B): segundo recorrido igual de “bien”, con loop más abajo
    const VIOLET_B = `M 1400 80
        C 1080 160, 920 340, 860 540
        C 760 860, 560 920, 440 780
        C 280 600, 380 360, 620 380
        C 900 400, 920 720, 720 800
        C 520 880, 520 1080, 680 1180
        C 900 1320, 1060 1200, 1040 980
        C 1020 760, 820 760, 720 860
        C 560 1020, 680 1280, 900 1360
        C 1180 1460, 1160 1800, 900 1940
        C 660 2060, 460 2060, 260 2140`;

    // 🔵 AZUL (A): columna vertebral, curvas amplias, sin loops perfectos
    const BLUE_A = `M 1180 -260
        C 1100 20, 900 180, 760 320
        C 560 520, 560 780, 840 840
        C 1120 900, 1160 1180, 900 1320
        C 660 1460, 520 1340, 540 1140
        C 560 940, 760 940, 880 1040
        C 1040 1180, 980 1420, 760 1560
        C 520 1720, 220 1860, -160 2140`;

    // 🔵 AZUL (B): segundo cruce estable, sin “compás”
    const BLUE_B = `M 1380 240
        C 1120 300, 940 440, 900 620
        C 820 900, 1040 1040, 1200 900
        C 1380 740, 1240 520, 1020 560
        C 820 600, 820 820, 980 920
        C 1160 1040, 1120 1260, 920 1380
        C 700 1520, 480 1540, 300 1420
        C 120 1300, 120 1040, 340 940
        C 560 840, 780 920, 900 1120
        C 1040 1360, 920 1620, 720 1760
        C 460 1940, 160 2020, -200 2140`;

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
