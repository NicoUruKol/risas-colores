import { useEffect, useMemo, useRef } from "react";

/* ==============================
Helpers
============================== */
const clamp01 = (n) => Math.max(0, Math.min(1, n));

const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

function applyWormDynamic(pathEl, haloEl, L, frac, visibleFrac, haloOpacityMul) {
    if (!pathEl || !haloEl || !L || L <= 10) return;

    const maxLen = L * visibleFrac;
    const travel = L + maxLen;

    const headDist = clamp01(frac) * travel;
    const headOnPath = Math.min(L, headDist);
    const tailDist = Math.max(0, headDist - maxLen);
    const tailOnPath = Math.min(L, tailDist);

    const wormLen = Math.max(0, headOnPath - tailOnPath);

    const alpha = 0.95 * smoothstep(0.0, 0.02, frac);

    const dasharray = `${wormLen} ${L}`;
    const dashoffset = String(-tailOnPath);

    pathEl.setAttribute("stroke-dasharray", dasharray);
    pathEl.setAttribute("stroke-dashoffset", dashoffset);
    pathEl.setAttribute("opacity", String(alpha));

    haloEl.setAttribute("stroke-dasharray", dasharray);
    haloEl.setAttribute("stroke-dashoffset", dashoffset);
    haloEl.setAttribute("opacity", String(alpha * haloOpacityMul));
}

/* ==============================
Component
============================== */
export default function BackgroundDecor2() {
    const viewW = 1200;
    const viewH = 2000;

    const isMobile = useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia?.("(max-width: 768px)").matches ?? false;
    }, []);

    const fps = isMobile ? 30 : 60;
    const minFrameMs = 1000 / fps;

    const glowBlur = isMobile ? 6 : 16;
    const haloBlur = isMobile ? 10 : 30;

    const thicknessMul = isMobile ? 0.85 : 1.0;
    const visibleMul = isMobile ? 0.92 : 1.0;

    const haloOpacityMul = isMobile ? 0.03 : 0.10;

    const paths = useMemo(() => {
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

        const VIOLET_A = `M 600 -280
    C 620 40, 580 260, 640 520
    C 720 760, 760 980, 680 1180
    C 620 1320, 640 1460, 700 1560
    C 780 1700, 640 1760, 560 1680
    C 460 1580, 520 1400, 640 1420
    C 800 1460, 820 1720, 700 1880
    C 620 2000, 560 2060, 520 2140`;

        const VIOLET_B = `M 80 -240
    C 100 80, 140 260, 200 440
    C 280 640, 360 820, 260 960
    C 180 1080, 110 1040, 140 940
    C 200 780, 360 860, 380 1020
    C 420 1260, 300 1380, 220 1560
    C 140 1760, 120 1960, 120 2140`;

        const BLUE_A = `M 1080 -260
    C 1040 80, 980 260, 1040 440
    C 1140 660, 1180 820, 1080 940
    C 960 1080, 940 980, 980 880
    C 1040 760, 1160 820, 1180 980
    C 1220 1240, 1100 1400, 1040 1580
    C 940 1800, 920 1980, 940 2140`;

        const BLUE_B = `M 720 -260
    C 700 60, 640 260, 700 440
    C 780 640, 760 800, 640 900
    C 520 1000, 500 880, 560 800
    C 640 700, 740 760, 760 900
    C 820 1140, 740 1340, 660 1540
    C 560 1760, 540 1960, 560 2140`;

        return { ORANGE_A, ORANGE_B, VIOLET_A, VIOLET_B, BLUE_A, BLUE_B };
    }, []);

    const orangeHaloRef = useRef(null);
    const orangeMainRef = useRef(null);
    const violetHaloRef = useRef(null);
    const violetMainRef = useRef(null);
    const blueHaloRef = useRef(null);
    const blueMainRef = useRef(null);

    const lensRef = useRef({
        orange: 0,
        violet: 0,
        blue: 0,
        orangeModeA: true,
        violetModeA: true,
        blueModeA: true,
    });

    useEffect(() => {
        let raf = 0;
        let lastNow = 0;
        const start = performance.now();

        const setPathAndLen = (mainEl, haloEl, d, colorVar, thickness) => {
        if (!mainEl || !haloEl) return 0;

        mainEl.setAttribute("d", d);
        haloEl.setAttribute("d", d);

        mainEl.setAttribute("stroke", `var(${colorVar})`);
        mainEl.setAttribute("stroke-width", String(thickness));
        haloEl.setAttribute("stroke", `var(${colorVar})`);
        haloEl.setAttribute("stroke-width", String(thickness * 1.1));

        try {
            const L = mainEl.getTotalLength();
            return Number.isFinite(L) ? L : 0;
        } catch {
            return 0;
        }
        };

        lensRef.current.orangeModeA = true;
        lensRef.current.violetModeA = true;
        lensRef.current.blueModeA = true;

        lensRef.current.orange = setPathAndLen(
        orangeMainRef.current,
        orangeHaloRef.current,
        paths.ORANGE_A,
        "--brand-primary",
        54 * thicknessMul
        );

        lensRef.current.violet = setPathAndLen(
        violetMainRef.current,
        violetHaloRef.current,
        paths.VIOLET_A,
        "--brand-accent",
        56 * thicknessMul
        );

        lensRef.current.blue = setPathAndLen(
        blueMainRef.current,
        blueHaloRef.current,
        paths.BLUE_A,
        "--brand-secondary",
        50 * thicknessMul
        );

        const stepPair = (
        tSec,
        name,
        durA,
        durB,
        dA,
        dB,
        haloEl,
        mainEl,
        colorVar,
        thickness,
        visibleFrac
        ) => {
        const period = durA + durB;
        const local = tSec % period;

        const isA = local < durA;
        const frac = isA ? local / durA : (local - durA) / durB;

        const modeKey = `${name}ModeA`;
        if (lensRef.current[modeKey] !== isA) {
            lensRef.current[modeKey] = isA;
            const d = isA ? dA : dB;
            lensRef.current[name] = setPathAndLen(mainEl, haloEl, d, colorVar, thickness);
        }

        applyWormDynamic(mainEl, haloEl, lensRef.current[name], frac, visibleFrac, haloOpacityMul);
        };

        const loop = (now) => {
        if (!lastNow) lastNow = now;

        if (now - lastNow < minFrameMs) {
            raf = requestAnimationFrame(loop);
            return;
        }
        lastNow = now;

        const tSec = (now - start) / 1000;

        stepPair(
            tSec,
            "orange",
            16.0,
            15.0,
            paths.ORANGE_A,
            paths.ORANGE_B,
            orangeHaloRef.current,
            orangeMainRef.current,
            "--brand-primary",
            54 * thicknessMul,
            0.60 * visibleMul
        );

        stepPair(
            tSec,
            "violet",
            15.0,
            16.0,
            paths.VIOLET_A,
            paths.VIOLET_B,
            violetHaloRef.current,
            violetMainRef.current,
            "--brand-accent",
            56 * thicknessMul,
            0.58 * visibleMul
        );

        stepPair(
            tSec,
            "blue",
            16.0,
            15.0,
            paths.BLUE_A,
            paths.BLUE_B,
            blueHaloRef.current,
            blueMainRef.current,
            "--brand-secondary",
            50 * thicknessMul,
            0.56 * visibleMul
        );

        raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [paths, minFrameMs, thicknessMul, visibleMul, haloOpacityMul]);

    return (
        <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 0 }}>
        <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            <defs>
            <filter id="wormGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation={String(glowBlur)} result="blur" />
                <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <filter id="wormHalo" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation={String(haloBlur)} />
            </filter>
            </defs>

            <path
            ref={orangeHaloRef}
            d={paths.ORANGE_A}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wormHalo)"
            />
            <path
            ref={orangeMainRef}
            d={paths.ORANGE_A}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wormGlow)"
            />

            <path
            ref={violetHaloRef}
            d={paths.VIOLET_A}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wormHalo)"
            />
            <path
            ref={violetMainRef}
            d={paths.VIOLET_A}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wormGlow)"
            />

            <path
            ref={blueHaloRef}
            d={paths.BLUE_A}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wormHalo)"
            />
            <path
            ref={blueMainRef}
            d={paths.BLUE_A}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wormGlow)"
            />
        </svg>
        </div>
    );
}
