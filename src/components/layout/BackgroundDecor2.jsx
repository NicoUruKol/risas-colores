import { useEffect, useMemo, useRef, useState } from "react";

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

// mide alto real del contenedor (Home / AppShell)
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

    function WormPath({
        t,
        dA,
        dB,
        colorVar,
        thickness = 54,
        cycleSec = 12.5,
        visibleFrac = 0.60,
        seed = 1,
        startDelaySec = 0,
        }) {
        const [pathLen, setPathLen] = useState(0);
        const pathRef = useRef(null);

        // tiempo local (para stagger sin romper hooks)
        const tt = t - startDelaySec;
        const started = tt > 0;

        // progreso 0..1
        const phase = started ? tt / cycleSec : 0;
        const cycle = Math.floor(phase);
        const frac = phase - cycle; // 0..1
        const useB = cycle % 2 === 1;

        const d = useMemo(() => (useB ? dB : dA), [useB, dA, dB]);

        useEffect(() => {
            if (!pathRef.current) return;
            try {
            const L = pathRef.current.getTotalLength();
            setPathLen(Number.isFinite(L) && L > 10 ? L : 6000);
            } catch {
            setPathLen(6000);
            }
        }, [d]);

        // primer frame: todavía no sabemos largo => no pintamos
        if (pathLen < 50) {
            return (
            <path ref={pathRef} d={d} fill="none" stroke="transparent" strokeWidth={1} />
            );
        }

        // ✅ cabeza avanza siempre (aunque alpha=0 antes de start)
        const head = pathLen * frac;

        // largo “objetivo”
        const baseVisible = pathLen * visibleFrac;

        // ✅ nacer: crece en el inicio | salir: cola persigue al final
        const grow = smoothstep(0.0, 0.10, frac);          // 10% inicial
        const shrink = 1 - smoothstep(0.86, 1.0, frac);    // 14% final
        let visibleNow = baseVisible * grow * shrink;

        // ✅ CLAVE ANTI-WRAP: mientras nace, visible no puede superar lo recorrido
        visibleNow = Math.min(visibleNow, head);

        // si aún no empezó, invisible total
        const alpha = started ? 1 : 0;

        const dasharray = `${visibleNow} ${pathLen}`;
        const dashoffset = pathLen - head;

        const glowId = `glow-${seed}-${useB ? "b" : "a"}`;
        const haloId = `halo-${seed}-${useB ? "b" : "a"}`;

        return (
            <g opacity={alpha}>
            <defs>
                <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="14" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
                </filter>
                <filter id={haloId} x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="26" />
                </filter>
            </defs>

            {/* halo VIAJA con el gusano (no queda “sucio”) */}
            <path
                d={d}
                fill="none"
                stroke={`var(${colorVar})`}
                strokeWidth={thickness * 1.10}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                opacity={0.14}
                filter={`url(#${haloId})`}
            />

            {/* trazo principal */}
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
                style={{ filter: `url(#${glowId}) saturate(1.25) brightness(1.10)` }}
            />
            </g>
        );
        }

    export default function BackgroundDecor2({ containerRef }) {
    const t = useRafTime();
    const heightPx = useResizeHeight(containerRef);

    const viewW = 1200;
    const viewH = 2000;

    // 🟠 NARANJA
    const ORANGE_A = `M 170 -320
        C 260 -40, 240 220, 160 520
        C 90 760, 190 920, 360 980
        C 560 1050, 650 900, 540 760
        C 420 610, 240 660, 250 860
        C 280 1140, 660 1180, 760 940
        C 880 660, 650 520, 460 610
        C 320 680, 420 920, 650 1040
        C 920 1180, 980 1480, 740 1680
        C 520 1860, 280 1940, 140 2300`;

        const ORANGE_B = `M -260 140
        C -20 220, 160 360, 210 560
        C 280 830, 120 980, -20 1120
        C -180 1280, -40 1480, 220 1480
        C 520 1480, 650 1240, 520 1040
        C 380 830, 180 930, 210 1150
        C 260 1480, 650 1540, 880 1340
        C 1100 1140, 980 900, 740 940
        C 520 980, 620 1240, 880 1340
        C 1180 1520, 1180 1880, 820 2080
        C 520 2260, 220 2300, 40 2360`;

    // 🟣 VIOLETA
    const VIOLET_A = `M 520 -260
        C 680 60, 420 240, 520 520
        C 640 840, 820 900, 940 740
        C 1080 560, 980 340, 760 360
        C 520 380, 520 620, 700 700
        C 860 770, 880 920, 760 1040
        C 600 1190, 420 1100, 420 920
        C 420 740, 620 700, 740 780
        C 880 880, 900 1100, 760 1240
        C 560 1440, 420 1500, 300 1700
        C 180 1880, 240 2020, 360 2140`;

    const VIOLET_B = `M 1320 40
        C 1020 120, 880 260, 820 460
        C 720 790, 540 860, 420 720
        C 260 540, 360 340, 560 360
        C 780 380, 820 620, 660 700
        C 500 780, 460 940, 560 1040
        C 700 1190, 900 1100, 900 900
        C 900 740, 720 700, 600 780
        C 460 880, 440 1100, 580 1240
        C 760 1440, 880 1500, 980 1700
        C 1080 1880, 1040 2020, 900 2140`;

    // 🔵 AZUL
    const BLUE_A = `M 1100 -240
        C 1040 20, 900 160, 760 300
        C 560 500, 560 760, 820 820
        C 1060 880, 1120 1120, 900 1260
        C 700 1400, 520 1320, 520 1120
        C 520 920, 700 900, 820 980
        C 980 1090, 980 1300, 820 1420
        C 620 1580, 420 1580, 260 1460
        C 80 1320, 40 1140, 200 1000
        C 380 840, 640 900, 780 1040
        C 940 1200, 860 1420, 660 1560
        C 420 1740, 140 1860, -120 2140`;

    const BLUE_B = `M 1280 220
        C 1040 260, 900 380, 860 560
        C 800 840, 980 980, 1120 860
        C 1280 720, 1180 520, 980 520
        C 760 520, 720 760, 900 860
        C 1080 960, 1080 1180, 920 1300
        C 720 1460, 520 1460, 340 1340
        C 160 1200, 120 980, 300 880
        C 520 760, 760 820, 860 980
        C 980 1160, 860 1400, 640 1560
        C 380 1740, 120 1860, -160 2140`;

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
            cycleSec={13.5}
            visibleFrac={0.62}
            seed={7}
            startDelaySec={0.2}
            />

            <WormPath
            t={t}
            dA={VIOLET_A}
            dB={VIOLET_B}
            colorVar="--brand-accent"
            thickness={56}
            cycleSec={14.2}
            visibleFrac={0.60}
            seed={13}
            startDelaySec={0.8}
            />

            <WormPath
            t={t}
            dA={BLUE_A}
            dB={BLUE_B}
            colorVar="--brand-secondary"
            thickness={50}
            cycleSec={13.0}
            visibleFrac={0.58}
            seed={21}
            startDelaySec={1.4}
            />
        </svg>
        </div>
    );
}
