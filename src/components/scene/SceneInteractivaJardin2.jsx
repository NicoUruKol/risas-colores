/* ==============================
SceneInteractivaJardin2
============================== */
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import styles from "./SceneInteractivaJardin2.module.css";

const DEBUG = false; // 👈 apagar cuando termines

/* ==============================
Imágenes
============================== */
import bgSceneGardenBase from "../../assets/animacion2/bg_scene_garden_base.png";

import fxSunCore from "../../assets/animacion2/fx_sun.png";
import fxSunRays from "../../assets/animacion2/fx_sun_rays.png";
import maskBuildingUp from "../../assets/animacion2/mask_building_up.png";

import fxCloudsMain from "../../assets/animacion2/fx_clouds_main.png";

import fxCatTail from "../../assets/animacion2/fx_cat_tail.png";
import fxTreeLeaves from "../../assets/animacion2/fx_tree_leaves_fall.png";

import fxTeacherArm from "../../assets/animacion2/fx_teacher_arm.png";
import fxBoyArmRight from "../../assets/animacion2/fx_boy_arm_right.png";
import fxGirlRightArm from "../../assets/animacion2/fx_girl_right_arm.png";
import fxGirlLeftArmA from "../../assets/animacion2/fx_girl_left_arm_a.png";
import fxGirlLeftArmB from "../../assets/animacion2/fx_girl_left_arm_b.png";
import fxGirlLeftArmC from "../../assets/animacion2/fx_girl_left_arm_c.png";

import fxDogTongue from "../../assets/animacion2/fx_dog_tongue.png";
import fxDogBag from "../../assets/animacion2/fx_dog_bag.png";
import maskDogMouth from "../../assets/animacion2/mask_dog_mouth.png";

/* ==============================
Hotspots
============================== */
const SCENE_HOTSPOTS = [
    { id: "cloud1", label: "Nube", tip: "La imaginación también se mueve ☁️", rect: { x: 0, y: 3, w: 15, h: 15 }, z: 40, animKey: "clouds" },
    { id: "cloud2", label: "Nube", tip: "La imaginación también se mueve ☁️", rect: { x: 32, y: 1, w: 18, h: 12 }, z: 40, animKey: "clouds" },
    { id: "cloud3", label: "Nube", tip: "La imaginación también se mueve ☁️", rect: { x: 59, y: 0, w: 15, h: 13 }, z: 40, animKey: "clouds" },
    { id: "cloud4", label: "Nube", tip: "La imaginación también se mueve ☁️", rect: { x: 87, y: 34, w: 8, h: 14 }, z: 40, animKey: "clouds" },
    { id: "cloud5", label: "Nube", tip: "La imaginación también se mueve ☁️", rect: { x: 4, y: 34, w: 8, h: 14 }, z: 40, animKey: "clouds" },

    { id: "sun", label: "Sol", tip: "Un ambiente cálido y amable ☀️", rect: { x: 77, y: 2, w: 22, h: 29 }, z: 50, animKey: "sun" },
    { id: "cat", label: "Gato", tip: "Siempre hay ternura en los pequeños detalles 🐱", rect: { x: 17, y: 3, w: 13, h: 10 }, z: 50, animKey: "cat" },
    { id: "tree", label: "Árbol", tip: "Naturaleza, juego y aire libre 🌿", rect: { x: 0, y: 50, w: 13, h: 46 }, z: 35, animKey: "tree" },

    { id: "people1", label: "Ventanas", tip: "Jugamos, aprendemos y nos saludamos con alegría 🤍", rect: { x: 29, y: 67, w: 19, h: 17 }, z: 45, animKey: "people" },
    { id: "people2", label: "Ventanas", tip: "Jugamos, aprendemos y nos saludamos con alegría 🤍", rect: { x: 65, y: 67, w: 19, h: 17 }, z: 45, animKey: "people" },

    { id: "dog", label: "Ofelia", tip: "Nuestra amiga también tiene su sorpresa 🎒", rect: { x: 42, y: 85, w: 9, h: 14 }, z: 45, animKey: "dog" },
];

/* ==============================
Tamaño real exportado
============================== */
const IMG_W = 2048;
const IMG_H = 1447;

export default function SceneInteractivaJardin2({
    minUnlock = 4,
    unlockedExternal = false,
    onUnlocked,
    onGoToNext,
    }) {
    const [discovered, setDiscovered] = useState(() => new Set());
    const discoveredCount = discovered.size;

    const unlocked = unlockedExternal || discoveredCount >= minUnlock;

    const [activeTip, setActiveTip] = useState(null);
    const [tipVisible, setTipVisible] = useState(false);

    const [anim, setAnim] = useState({
        sun: 0,
        clouds: 0,
        cat: 0,
        tree: 0,
        people: 0,
        dog: 0,
    });

    const sceneWrapRef = useRef(null);
    const sceneRef = useRef(null);

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [fit, setFit] = useState({ x: 0, y: 0, w: 0, h: 0 });

    /* ==============================
    Header height
    ============================== */
    useEffect(() => {
        const setHeaderH = () => {
        const headerEl = document.querySelector("header");
        const h = headerEl?.getBoundingClientRect?.().height ?? 88;
        sceneWrapRef.current?.style.setProperty("--header-h", `${Math.round(h)}px`);
        };

        setHeaderH();
        window.addEventListener("resize", setHeaderH);

        return () => window.removeEventListener("resize", setHeaderH);
    }, []);

    /* ==============================
    Fit contain real
    ============================== */
    useEffect(() => {
        const updateFit = () => {
        const el = sceneRef.current;
        if (!el) return;

        const cw = el.clientWidth;
        const ch = el.clientHeight;

        const scale = Math.min(cw / IMG_W, ch / IMG_H);
        const w = IMG_W * scale;
        const h = IMG_H * scale;

        setFit({
            w,
            h,
            x: (cw - w) / 2,
            y: (ch - h) / 2,
        });
        };

        updateFit();

        window.addEventListener("resize", updateFit);
        window.addEventListener("orientationchange", updateFit);

        return () => {
        window.removeEventListener("resize", updateFit);
        window.removeEventListener("orientationchange", updateFit);
        };
    }, []);

    /* ==============================
    Unlock
    ============================== */
    const hasFiredUnlockRef = useRef(false);

    useEffect(() => {
        if (!unlocked) return;

        if (!hasFiredUnlockRef.current) {
        hasFiredUnlockRef.current = true;
        onUnlocked?.();
        }

        const t = setTimeout(() => setShowUnlockModal(true), 900);
        return () => clearTimeout(t);
    }, [unlocked, onUnlocked]);

    /* ==============================
    Click hotspot
    ============================== */
    const onHotspotClick = (spot) => {
        setDiscovered((prev) => {
        const next = new Set(prev);
        next.add(spot.id);
        return next;
        });

        setActiveTip({ label: spot.label, tip: spot.tip });
        setTipVisible(true);

        const key = spot.animKey ?? spot.id;
        setAnim((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));

        window.clearTimeout(onHotspotClick._t);
        onHotspotClick._t = window.setTimeout(() => setTipVisible(false), 2200);
    };

    /* ==============================
    Anclajes (convertidos a px desde el fit)
    ============================== */
    const sunCx = useMemo(() => fit.x + 0.873 * fit.w, [fit]);
    const sunCy = useMemo(() => fit.y + 0.180 * fit.h, [fit]);

    const catTailPx = useMemo(() => fit.x + 0.20 * fit.w, [fit]);
    const catTailPy = useMemo(() => fit.y + 0.101 * fit.h, [fit]);

    const teacherArmPx = useMemo(() => fit.x + 0.314 * fit.w, [fit]);
    const teacherArmPy = useMemo(() => fit.y + 0.78 * fit.h, [fit]);

    const boyArmPx = useMemo(() => fit.x + 0.675 * fit.w, [fit]);
    const boyArmPy = useMemo(() => fit.y + 0.81 * fit.h, [fit]);

    const girlRightArmPx = useMemo(() => fit.x + 0.806 * fit.w, [fit]);
    const girlRightArmPy = useMemo(() => fit.y + 0.804 * fit.h, [fit]);

    const girlLeftArmAPx = useMemo(() => fit.x + 0.44 * fit.w, [fit]);
    const girlLeftArmAPy = useMemo(() => fit.y + 0.80 * fit.h, [fit]);

    const girlLeftArmBPx = useMemo(() => fit.x + 0.405 * fit.w, [fit]);
    const girlLeftArmBPy = useMemo(() => fit.y + 0.775 * fit.h, [fit]);

    const girlLeftArmCPx = useMemo(() => fit.x + 0.39 * fit.w, [fit]);
    const girlLeftArmCPy = useMemo(() => fit.y + 0.80 * fit.h, [fit]);

    const dogMouthPx = useMemo(() => fit.x + 0.465 * fit.w, [fit]);
    const dogMouthPy = useMemo(() => fit.y + 0.90 * fit.h, [fit]);

    /* ===== DEBUG ANCHORS START ===== */
    const DEBUG_ANCHORS = DEBUG;

    const renderDebugAnchor = (id, x, y) => {
        if (!DEBUG_ANCHORS) return null;

        return (
        <div
            key={id}
            className={styles.debugAnchor}
            style={{
            left: `${x}px`,
            top: `${y}px`,
            }}
            aria-hidden="true"
            title={`${id}: ${Math.round(x)}, ${Math.round(y)}`}
        >
            <span className={styles.debugAnchorDot} />
            <span className={styles.debugAnchorLabel}>{id}</span>
        </div>
        );
    };
    /* ===== DEBUG ANCHORS END ===== */

    return (
        <div ref={sceneWrapRef} className={styles.sceneWrap}>
        <div ref={sceneRef} className={styles.scene} aria-label="Escena interactiva del jardín 2">
            {/* Fondo */}
            <img src={bgSceneGardenBase} alt="" className={styles.layer} />

            {/* Sol */}
            <div
            key={`sun-${anim.sun}`}
            className={`${styles.sun} ${anim.sun ? styles.play : ""}`}
            style={{
                "--sun-cx": `${sunCx}px`,
                "--sun-cy": `${sunCy}px`,
            }}
            >
            <img src={fxSunCore} alt="" className={styles.layer} />
            <img src={fxSunRays} alt="" className={`${styles.layer} ${styles.sunRays}`} />
            </div>

            {/* Nubes */}
            <div key={`clouds-${anim.clouds}`} className={`${styles.clouds} ${anim.clouds ? styles.play : ""}`}>
            <img src={fxCloudsMain} alt="" className={`${styles.layer} ${styles.cloudsMain}`} />
            </div>

            {/* Gato */}
            <div
            key={`cat-${anim.cat}`}
            className={`${styles.cat} ${anim.cat ? styles.play : ""}`}
            style={{
                "--cat-tail-x": `${catTailPx}px`,
                "--cat-tail-y": `${catTailPy}px`,
            }}
            >
            <img src={fxCatTail} alt="" className={`${styles.layer} ${styles.catTail}`} />
            </div>

            {/* Árbol */}
            <div key={`tree-${anim.tree}`} className={`${styles.tree} ${anim.tree ? styles.play : ""}`}>
            <img src={fxTreeLeaves} alt="" className={`${styles.layer} ${styles.treeLeaves}`} />
            </div>

            {/* Gente */}
            <div
            key={`people-${anim.people}`}
            className={`${styles.people} ${anim.people ? styles.play : ""}`}
            style={{
                "--teacher-arm-x": `${teacherArmPx}px`,
                "--teacher-arm-y": `${teacherArmPy}px`,

                "--boy-arm-x": `${boyArmPx}px`,
                "--boy-arm-y": `${boyArmPy}px`,

                "--girl-right-arm-x": `${girlRightArmPx}px`,
                "--girl-right-arm-y": `${girlRightArmPy}px`,

                "--girl-left-arm-a-x": `${girlLeftArmAPx}px`,
                "--girl-left-arm-a-y": `${girlLeftArmAPy}px`,

                "--girl-left-arm-b-x": `${girlLeftArmBPx}px`,
                "--girl-left-arm-b-y": `${girlLeftArmBPy}px`,

                "--girl-left-arm-c-x": `${girlLeftArmCPx}px`,
                "--girl-left-arm-c-y": `${girlLeftArmCPy}px`,
            }}
            >
            <img src={fxTeacherArm} alt="" className={`${styles.layer} ${styles.teacherArm}`} />
            <img src={fxBoyArmRight} alt="" className={`${styles.layer} ${styles.boyArm}`} />
            <img src={fxGirlRightArm} alt="" className={`${styles.layer} ${styles.girlRightArm}`} />
            <img src={fxGirlLeftArmA} alt="" className={`${styles.layer} ${styles.girlLeftArmA}`} />
            <img src={fxGirlLeftArmB} alt="" className={`${styles.layer} ${styles.girlLeftArmB}`} />
            <img src={fxGirlLeftArmC} alt="" className={`${styles.layer} ${styles.girlLeftArmC}`} />
            </div>

            {/* Perro */}
            <div
            key={`dog-${anim.dog}`}
            className={`${styles.dog} ${anim.dog ? styles.play : ""}`}
            style={{
                "--dog-mouth-x": `${dogMouthPx}px`,
                "--dog-mouth-y": `${dogMouthPy}px`,
            }}
            >
            <img src={fxDogTongue} alt="" className={`${styles.layer} ${styles.dogTongue}`} />
            <img src={fxDogBag} alt="" className={`${styles.layer} ${styles.dogBag}`} />
            <img src={maskDogMouth} alt="" className={`${styles.layer} ${styles.dogMouthMask}`} />
            </div>

            {/* Máscara superior */}
            <div className={styles.buildingMaskUp}>
            <img src={maskBuildingUp} alt="" className={styles.layer} />
            </div>

            {/* ===== DEBUG ANCHORS START ===== */}
            {DEBUG_ANCHORS && (
            <div className={styles.debugAnchorsLayer} aria-hidden="true">
                {renderDebugAnchor("sun", sunCx, sunCy)}
                {renderDebugAnchor("catTail", catTailPx, catTailPy)}
                {renderDebugAnchor("teacherArm", teacherArmPx, teacherArmPy)}
                {renderDebugAnchor("boyArm", boyArmPx, boyArmPy)}
                {renderDebugAnchor("girlRightArm", girlRightArmPx, girlRightArmPy)}
                {renderDebugAnchor("girlLeftArmA", girlLeftArmAPx, girlLeftArmAPy)}
                {renderDebugAnchor("girlLeftArmB", girlLeftArmBPx, girlLeftArmBPy)}
                {renderDebugAnchor("girlLeftArmC", girlLeftArmCPx, girlLeftArmCPy)}
                {renderDebugAnchor("dogMouth", dogMouthPx, dogMouthPy)}
            </div>
            )}
            {/* ===== DEBUG ANCHORS END ===== */}

            {/* Hotspots */}
            {SCENE_HOTSPOTS.map((spot) => {
            const { x, y, w, h } = spot.rect;
            return (
                <button
                key={spot.id}
                type="button"
                onClick={() => onHotspotClick(spot)}
                className={styles.hotspot}
                style={{
                    left: `${fit.x + (x / 100) * fit.w}px`,
                    top: `${fit.y + (y / 100) * fit.h}px`,
                    width: `${(w / 100) * fit.w}px`,
                    height: `${(h / 100) * fit.h}px`,
                    zIndex: spot.z,
                }}
                aria-label={`Interactuar con ${spot.label}`}
                />
            );
            })}

            {/* Modal desbloqueo */}
            {showUnlockModal && unlocked && (
            <div className={styles.unlockOverlay} role="dialog" aria-modal="true">
                <div className={styles.unlockCard}>
                <div className={styles.unlockTitle}>¡Felicidades! 🌈</div>
                <div className={styles.unlockSubtitle}>Desbloqueaste el jardín.</div>

                <Button
                    variant="primary"
                    onClick={() => {
                    setShowUnlockModal(false);
                    requestAnimationFrame(() => {
                        onGoToNext?.();
                    });
                    }}
                >
                    Seguir descubriendo ↓
                </Button>

                <button
                    type="button"
                    className={styles.unlockClose}
                    onClick={() => setShowUnlockModal(false)}
                    aria-label="Cerrar"
                >
                    ✕
                </button>
                </div>
            </div>
            )}
        </div>

        {/* Tip */}
        {activeTip && tipVisible && (
            <div className={styles.tipBar} role="status" aria-live="polite">
            <span className={styles.tipLabel}>{activeTip.label}:</span>{" "}
            <span className={styles.tipText}>{activeTip.tip}</span>
            </div>
        )}

        {/* Progreso */}
        {discoveredCount > 0 && !unlocked && (
            <div className={styles.progressLine}>
            ¡Bien! Llevás {discoveredCount}/{minUnlock} descubrimientos.
            </div>
        )}
        </div>
    );
}