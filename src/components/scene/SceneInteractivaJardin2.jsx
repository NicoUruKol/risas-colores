/* ==============================
SceneInteractivaJardin2
============================== */
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import styles from "./SceneInteractivaJardin2.module.css";

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
    {
        id: "cloud1",
        label: "Nube",
        tip: "La imaginación también se mueve ☁️",
        rect: { x: 0, y: 3, w: 15, h: 15 },
        z: 40,
        animKey: "clouds",
    },
    {
        id: "cloud2",
        label: "Nube",
        tip: "La imaginación también se mueve ☁️",
        rect: { x: 32, y: 1, w: 18, h: 12 },
        z: 40,
        animKey: "clouds",
    },
    {
        id: "cloud3",
        label: "Nube",
        tip: "La imaginación también se mueve ☁️",
        rect: { x: 59, y: 0, w: 15, h: 13 },
        z: 40,
        animKey: "clouds",
    },
    {
        id: "cloud4",
        label: "Nube",
        tip: "La imaginación también se mueve ☁️",
        rect: { x: 87, y: 34, w: 8, h: 14 },
        z: 40,
        animKey: "clouds",
    },
    {
        id: "cloud5",
        label: "Nube",
        tip: "La imaginación también se mueve ☁️",
        rect: { x: 4, y: 34, w: 8, h: 14 },
        z: 40,
        animKey: "clouds",
    },
    {
        id: "sun",
        label: "Sol",
        tip: "Un ambiente cálido y amable ☀️",
        rect: { x: 77, y: 2, w: 22, h: 29 },
        z: 50,
        animKey: "sun",
    },
    {
        id: "cat",
        label: "Gato",
        tip: "Siempre hay ternura en los pequeños detalles 🐱",
        rect: { x: 17, y: 3, w: 13, h: 10 },
        z: 50,
        animKey: "cat",
    },
    {
        id: "tree",
        label: "Árbol",
        tip: "Naturaleza, juego y aire libre 🌿",
        rect: { x: 0, y: 50, w: 13, h: 46 },
        z: 35,
        animKey: "tree",
    },
    {
        id: "people1",
        label: "Ventanas",
        tip: "Jugamos, aprendemos y nos saludamos con alegría 🤍",
        rect: { x: 29, y: 67, w: 19, h: 17 },
        z: 45,
        animKey: "people",
    },
    {
        id: "people2",
        label: "Ventanas",
        tip: "Jugamos, aprendemos y nos saludamos con alegría 🤍",
        rect: { x: 65, y: 67, w: 19, h: 17 },
        z: 45,
        animKey: "people",
    },
    {
        id: "dog",
        label: "Ofelia",
        tip: "Nuestra amiga también tiene su sorpresa 🎒",
        rect: { x: 42, y: 85, w: 9, h: 14 },
        z: 45,
        animKey: "dog",
    },
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

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [fit, setFit] = useState({ x: 0, y: 0, w: 0, h: 0 });

    const sceneWrapRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
    let resizeObserver;

    const setHeaderH = () => {
        const headerEl = document.querySelector("header");
        const h = headerEl?.getBoundingClientRect?.().height ?? 88;
        sceneWrapRef.current?.style.setProperty("--header-h", `${Math.round(h)}px`);
    };

    setHeaderH();

    window.addEventListener("resize", setHeaderH);
    window.addEventListener("load", setHeaderH);

    if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
            setHeaderH();
        });
    }

    const headerEl = document.querySelector("header");
    if (typeof ResizeObserver !== "undefined" && headerEl) {
        resizeObserver = new ResizeObserver(() => {
            setHeaderH();
        });
        resizeObserver.observe(headerEl);
    }

    return () => {
        window.removeEventListener("resize", setHeaderH);
        window.removeEventListener("load", setHeaderH);

        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    };
}, []);

    useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timeoutId = 0;
    let resizeObserver;

    const updateFit = () => {
        const el = sceneRef.current;
        if (!el) return;

        const cw = el.clientWidth;
        const ch = el.clientHeight;

        if (!cw || !ch) return;

        const scale = Math.min(cw / IMG_W, ch / IMG_H);
        const w = IMG_W * scale;
        const h = IMG_H * scale;

        setFit((prev) => {
            const next = {
                w,
                h,
                x: (cw - w) / 2,
                y: (ch - h) / 2,
            };

            const same =
                Math.abs(prev.w - next.w) < 0.5 &&
                Math.abs(prev.h - next.h) < 0.5 &&
                Math.abs(prev.x - next.x) < 0.5 &&
                Math.abs(prev.y - next.y) < 0.5;

            return same ? prev : next;
        });
    };

    const scheduleUpdateFit = () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(timeoutId);

        raf1 = requestAnimationFrame(() => {
            updateFit();

            raf2 = requestAnimationFrame(() => {
                updateFit();
            });
        });

        timeoutId = window.setTimeout(() => {
            updateFit();
        }, 180);
    };

    scheduleUpdateFit();

    window.addEventListener("resize", scheduleUpdateFit);
    window.addEventListener("orientationchange", scheduleUpdateFit);
    window.addEventListener("load", scheduleUpdateFit);

    if (typeof ResizeObserver !== "undefined" && sceneRef.current) {
        resizeObserver = new ResizeObserver(() => {
            scheduleUpdateFit();
        });
        resizeObserver.observe(sceneRef.current);
    }

    if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
            scheduleUpdateFit();
        });
    }

    return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(timeoutId);

        window.removeEventListener("resize", scheduleUpdateFit);
        window.removeEventListener("orientationchange", scheduleUpdateFit);
        window.removeEventListener("load", scheduleUpdateFit);

        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    };
}, []);

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

    const anchors = useMemo(
        () => ({
        sunCx: "87.3%",
        sunCy: "20.4%",

        catTailX: "20%",
        catTailY: "12.8%",

        teacherArmX: "31.5%",
        teacherArmY: "76%",

        boyArmX: "67.5%",
        boyArmY: "79%",

        girlRightArmX: "80.5%",
        girlRightArmY: "78.5%",

        girlLeftArmAX: "44%",
        girlLeftArmAY: "78%",

        girlLeftArmBX: "40%",
        girlLeftArmBY: "75%",

        girlLeftArmCX: "39%",
        girlLeftArmCY: "78%",

        dogMouthX: "46.5%",
        dogMouthY: "87%",
        }),
        []
    );

    return (
        <div ref={sceneWrapRef} className={styles.sceneWrap}>
        <div ref={sceneRef} className={styles.scene} aria-label="Escena interactiva del jardín 2">
            {/* Fondo base */}
            <img src={bgSceneGardenBase} alt="" className={styles.layer} />

            {/* Sol */}
            <div
            key={`sun-${anim.sun}`}
            className={`${styles.sun} ${anim.sun ? styles.play : ""}`}
            style={{
                "--sun-cx": anchors.sunCx,
                "--sun-cy": anchors.sunCy,
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
                "--cat-tail-x": anchors.catTailX,
                "--cat-tail-y": anchors.catTailY,
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
                "--teacher-arm-x": anchors.teacherArmX,
                "--teacher-arm-y": anchors.teacherArmY,
                "--boy-arm-x": anchors.boyArmX,
                "--boy-arm-y": anchors.boyArmY,
                "--girl-right-arm-x": anchors.girlRightArmX,
                "--girl-right-arm-y": anchors.girlRightArmY,
                "--girl-left-arm-a-x": anchors.girlLeftArmAX,
                "--girl-left-arm-a-y": anchors.girlLeftArmAY,
                "--girl-left-arm-b-x": anchors.girlLeftArmBX,
                "--girl-left-arm-b-y": anchors.girlLeftArmBY,
                "--girl-left-arm-c-x": anchors.girlLeftArmCX,
                "--girl-left-arm-c-y": anchors.girlLeftArmCY,
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
                "--dog-mouth-x": anchors.dogMouthX,
                "--dog-mouth-y": anchors.dogMouthY,
            }}
            >
            <img src={fxDogTongue} alt="" className={`${styles.layer} ${styles.dogTongue}`} />
            <img src={fxDogBag} alt="" className={`${styles.layer} ${styles.dogBag}`} />
            <img src={maskDogMouth} alt="" className={`${styles.layer} ${styles.dogMouthMask}`} />
            </div>

            {/* Máscara superior única */}
            <div className={styles.buildingMaskUp}>
            <img src={maskBuildingUp} alt="" className={styles.layer} />
            </div>

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
        </div>

        {activeTip && tipVisible && (
            <div className={styles.tipBar} role="status" aria-live="polite">
            <span className={styles.tipLabel}>{activeTip.label}:</span>{" "}
            <span className={styles.tipText}>{activeTip.tip}</span>
            </div>
        )}

        {discoveredCount > 0 && !unlocked && (
            <div className={styles.progressLine}>
            ¡Bien! Llevás {discoveredCount}/{minUnlock} descubrimientos.
            </div>
        )}

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
    );
}