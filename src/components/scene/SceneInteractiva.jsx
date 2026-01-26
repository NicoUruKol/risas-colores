import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import styles from "./SceneInteractiva.module.css";

/* === IMÁGENES  === */
import fondoImg from "../../assets/animacion/escena_0013_Capa-1.webp";

import solImg from "../../assets/animacion/escena_0001_sol-y-rayos.png";
import solCaraImg from "../../assets/animacion/escena_0000_sol-cara.png";

import nubesImg from "../../assets/animacion/escena_0008_nubes.png";

import pajarosImg from "../../assets/animacion/escena_0004_pajaros.png";
import alaDerImg from "../../assets/animacion/escena_0002_pajaros-alas-largas.png";
import alaIzqImg from "../../assets/animacion/escena_0003_pajaros-alas-cortas.png";

import hojasImg from "../../assets/animacion/escena_0006_hojas.png";
import cartelCasa from "../../assets/animacion/escena_0005_risas-colores.png";

import ninoHamacaImg from "../../assets/animacion/escena_0007_hamaca.png";
import pelotaImg from "../../assets/animacion/escena_0010_pelota.png";
import brazoDerImg from "../../assets/animacion/escena_0012_brazo-azul-hamaca.png";
import brazoIzqImg from "../../assets/animacion/escena_0011_brazo-azul-rosa.png";
import lupaImg from "../../assets/animacion/escena_0009_lupa-rosa.png";

/* === HOTSPOTS === */
const SCENE_HOTSPOTS = [
    { id: "tree", label: "Árbol", tip: "Naturaleza y juego al aire libre 🌿", rect: { x: 2, y: 14, w: 30, h: 78 }, z: 30 },
    { id: "house", label: "La casa", tip: "Un espacio pensado para crecer con seguridad ✨", rect: { x: 32, y: 30, w: 46, h: 40 }, z: 20, animKey: "house" },
    { id: "kids", label: "Niños", tip: "Jugamos, aprendemos y nos cuidamos 🤍", rect: { x: 56, y: 70, w: 30, h: 26 }, z: 30 },
    { id: "cloudL", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 27, y: 8, w: 18, h: 12 }, z: 40, animKey: "clouds" },
    { id: "birds", label: "Pajaritos", tip: "Acompañamos cada primer paso 🐦", rect: { x: 52, y: 11, w: 16, h: 12 }, z: 60 },
    { id: "sun", label: "Sol", tip: "Un ambiente cálido y amable ☀️", rect: { x: 70, y: 5, w: 14, h: 22 }, z: 80, animKey: "sun" },
    { id: "cloudR", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 81.5, y: 19, w: 18, h: 15 }, z: 50, animKey: "clouds" },
];

// tamaño real export Figma
const IMG_W = 1536;
const IMG_H = 1024;

export default function SceneInteractiva({
    minUnlock = 3,
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
        birds: 0,
        kids: 0,
        tree: 0,
        house: 0,
    });

    const sceneWrapRef = useRef(null);
    const sceneRef = useRef(null);

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [fit, setFit] = useState({ x: 0, y: 0, w: 0, h: 0 });

    // header height → para que entre
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

    // fit contain real (hotspots perfectos mobile/desktop)
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

        // clave: resize + orientación
        window.addEventListener("resize", updateFit);
        window.addEventListener("orientationchange", updateFit);
        return () => {
        window.removeEventListener("resize", updateFit);
        window.removeEventListener("orientationchange", updateFit);
        };
    }, []);

    // cuando desbloquea: avisar 1 vez + modal con delay para ver animación
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

    // centro del sol (en % del lienzo original)
    const sunCx = useMemo(() => fit.x + 0.77 * fit.w, [fit]);
    const sunCy = useMemo(() => fit.y + 0.18 * fit.h, [fit]);

    return (
        <div ref={sceneWrapRef} className={styles.sceneWrap}>
        <div ref={sceneRef} className={styles.scene} aria-label="Escena interactiva del jardín">
            {/* Fondo */}
            <img src={fondoImg} alt="" className={styles.layer} />

            {/* Sol */}
            <div
            key={`sun-${anim.sun}`}
            className={`${styles.sun} ${anim.sun ? styles.play : ""}`}
            style={{
                "--sun-cx": `${sunCx}px`,
                "--sun-cy": `${sunCy}px`,
            }}
            >
            <img src={solImg} alt="" className={styles.layer} />
            <img src={solCaraImg} alt="" className={`${styles.layer} ${styles.sunFace}`} />
            </div>

            {/* Nubes */}
            <div key={`clouds-${anim.clouds}`} className={`${styles.clouds} ${anim.clouds ? styles.play : ""}`}>
            <img src={nubesImg} alt="" className={styles.layer} />
            <div className={styles.cloudDrops} aria-hidden="true" />
            </div>

            {/* Pájaros */}
            <div key={`birds-${anim.birds}`} className={`${styles.birds} ${anim.birds ? styles.play : ""}`}>
            <img src={pajarosImg} alt="" className={styles.layer} />
            <img src={alaDerImg} alt="" className={`${styles.layer} ${styles.wingR}`} />
            <img src={alaIzqImg} alt="" className={`${styles.layer} ${styles.wingL}`} />
            </div>

            {/* Hojas */}
            <div key={`tree-${anim.tree}`} className={`${styles.tree} ${anim.tree ? styles.play : ""}`}>
            <img src={hojasImg} alt="" className={styles.layer} />
            <img src={ninoHamacaImg} alt="" className={styles.layer} />
            </div>

            {/* Cartel Casa */}
            <div key={`house-${anim.house}`} className={`${styles.house} ${anim.house ? styles.play : ""}`}>
            <img src={cartelCasa} alt="" className={styles.layer} />
            </div>

            {/* Niño hamaca + brazos */}
            <div key={`kids-${anim.kids}`} className={`${styles.kids} ${anim.kids ? styles.play : ""}`}>
            <img src={brazoDerImg} alt="" className={`${styles.layer} ${styles.armR}`} />
            <img src={brazoIzqImg} alt="" className={`${styles.layer} ${styles.armL}`} />
            </div>

            {/* Pelota */}
            <div key={`ball-${anim.kids}`} className={`${styles.ball} ${anim.kids ? styles.play : ""}`}>
            <img src={pelotaImg} alt="" className={styles.layer} />
            </div>

            {/* Lupa */}
            <div key={`lupa-${anim.kids}`} className={`${styles.magnifier} ${anim.kids ? styles.play : ""}`}>
            <img src={lupaImg} alt="" className={styles.layer} />
            </div>

            {/* HOTSPOTS (con fit) */}
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

            {/* Tooltip */}
            {activeTip && tipVisible && (
            <div className={styles.tooltip}>
                <div className={styles.tooltipTitle}>{activeTip.label}</div>
                <div className={styles.tooltipText}>{activeTip.tip}</div>
            </div>
            )}

            {/* Modal desbloqueo */}
            {showUnlockModal && unlocked && (
            <div className={styles.unlockOverlay} role="dialog" aria-modal="true">
                <div className={styles.unlockCard}>
                <div className={styles.unlockTitle}>¡Felicidades! 🌈</div>
                <div className={styles.unlockSubtitle}>Desbloqueaste el camino.</div>

                <Button
                    variant="primary"
                    onClick={() => {
                    setShowUnlockModal(false);
                    onGoToNext?.();
                    }}
                >
                    Descubrí el jardín ↓
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

        {/* mini progreso abajo (opcional) */}
        {discoveredCount > 0 && !unlocked && (
            <div className={styles.progressLine}>¡Bien! Llevás {discoveredCount}/{minUnlock} descubrimientos.</div>
        )}
        </div>
    );
}
