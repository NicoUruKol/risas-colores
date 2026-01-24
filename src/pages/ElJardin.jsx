import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

import styles from "./ElJardin.module.css";

/* === IMÁGENES  === */
import fondoImg from "../assets/animacion/escena_0013_Capa-1.webp";

import solImg from "../assets/animacion/escena_0001_sol-y-rayos.png";
import solCaraImg from "../assets/animacion/escena_0000_sol-cara.png";

import nubesImg from "../assets/animacion/escena_0008_nubes.png";

import pajarosImg from "../assets/animacion/escena_0004_pajaros.png";
import alaDerImg from "../assets/animacion/escena_0002_pajaros-alas-largas.png";
import alaIzqImg from "../assets/animacion/escena_0003_pajaros-alas-cortas.png";

import hojasImg from "../assets/animacion/escena_0006_hojas.png";

import cartelCasa from "../assets/animacion/escena_0005_risas-colores.png";

import ninoHamacaImg from "../assets/animacion/escena_0007_hamaca.png";
import pelotaImg from "../assets/animacion/escena_0010_pelota.png";
import brazoDerImg from "../assets/animacion/escena_0012_brazo-azul-hamaca.png";
import brazoIzqImg from "../assets/animacion/escena_0011_brazo-azul-rosa.png";
import lupaImg from "../assets/animacion/escena_0009_lupa-rosa.png";

/* === HOTSPOTS === */
const SCENE_HOTSPOTS = [
    { id: "tree", label: "Árbol", tip: "Naturaleza y juego al aire libre 🌿", rect: { x: 2, y: 14, w: 30, h: 78 }, z: 30 },
    { id: "house", label: "La casa", tip: "Un espacio pensado para crecer con seguridad ✨", rect: { x: 32, y: 30, w: 46, h: 40}, z: 20, animKey: "house" },
    { id: "kids", label: "Niños", tip: "Jugamos, aprendemos y nos cuidamos 🤍", rect: { x: 58, y: 72, w: 30, h: 28 }, z: 30 },
    { id: "cloudL", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 27, y: 3, w: 18, h: 12 }, z: 40, animKey: "clouds" },
    { id: "birds", label: "Pajaritos", tip: "Acompañamos cada primer paso 🐦", rect: { x: 52, y: 5, w: 16, h: 12 }, z: 60 },
    { id: "sun", label: "Sol", tip: "Un ambiente cálido y amable ☀️", rect: { x: 70, y: 2, w: 14, h: 22 }, z: 80, animKey: "sun" },
    { id: "cloudR", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 81.5, y: 19, w: 18, h: 15 }, z: 50, animKey: "clouds" },
];

// ✅ Poné el tamaño real de tu export (Figma)
const IMG_W = 1536;
const IMG_H = 1024;


export default function ElJardin() {
    const [discovered, setDiscovered] = useState(() => new Set());
    const [forceUnlocked, setForceUnlocked] = useState(false);

    const discoveredCount = discovered.size;
    const unlocked = forceUnlocked || discoveredCount >= 3;

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
    const nextSectionRef = useRef(null);

    const [showUnlockModal, setShowUnlockModal] = useState(false);

    // ✅ Fit real del “conten” (para hotspots perfectos en mobile)
    const [fit, setFit] = useState({ x: 0, y: 0, w: 0, h: 0 });

    // ✅ medir header real para que la escena entre sin scroll
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

    // ✅ calcula el “fit contain” dentro de .scene
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
        return () => window.removeEventListener("resize", updateFit);
    }, []);

    useEffect(() => {
        if (unlocked) setShowUnlockModal(true);
    }, [unlocked]);

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

    const smoothScrollTo = (targetY, duration = 1100) => {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        const start = performance.now();

        const easeInOut = (t) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const step = (now) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = easeInOut(t);
        window.scrollTo(0, startY + diff * eased);
        if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    const goToNext = () => {
        const el = nextSectionRef.current;
        if (!el) return;

        const headerEl = document.querySelector("header");
        const headerH = headerEl?.getBoundingClientRect?.().height ?? 0;

        const targetY = el.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
        smoothScrollTo(targetY, 1100);
    };

    const skipToContent = () => {
        setForceUnlocked(true);
        setShowUnlockModal(false);
        requestAnimationFrame(() => goToNext());
    };

    // ✅ Centro del sol (en % del lienzo original)
    // tus valores actuales: 77% / 12%
    const sunCx = fit.x + (0.77 * fit.w);
    const sunCy = fit.y + (0.12 * fit.h);

    return (
        <main className={styles.page}>
        <Container>
            <section className={styles.layout}>
            <aside className={styles.side}>
                <div className={styles.sideInner}>
                <h1 className={styles.title}>Descubrí Risas y Colores</h1>

                <p className={styles.subtitle}>
                    {unlocked
                    ? "¡Genial! Ahora podés seguir explorando la escena o bajar a conocer más."
                    : "Tocá la escena y desbloqueá el recorrido."}
                </p>

                <button
                    type="button"
                    className={styles.skipHint}
                    onClick={skipToContent}
                >
                    O seguí sin jugar <span aria-hidden>→</span>
                </button>

                <div className={styles.sideInfo}>
                    {!unlocked && discoveredCount > 0 && (
                    <p className={styles.sideProgress}>
                        ¡Bien! Llevás {discoveredCount}/3 descubrimientos.
                    </p>
                    )}

                    {unlocked && (
                    <p className={styles.sideUnlocked}>¡Desbloqueaste el recorrido! 🌈</p>
                    )}
                </div>
                </div>
            </aside>

            <div className={styles.sceneSection}>
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
                    <div
                    key={`clouds-${anim.clouds}`}
                    className={`${styles.clouds} ${anim.clouds ? styles.play : ""}`}
                    >
                    <img src={nubesImg} alt="" className={styles.layer} />
                    <div className={styles.cloudDrops} aria-hidden="true" />
                    </div>

                    {/* Pájaros + alas */}
                    <div key={`birds-${anim.birds}`} className={`${styles.birds} ${anim.birds ? styles.play : ""}`}>
                    <img src={pajarosImg} alt="" className={styles.layer} />
                    <img src={alaDerImg} alt="" className={`${styles.layer} ${styles.wingR}`} />
                    <img src={alaIzqImg} alt="" className={`${styles.layer} ${styles.wingL}`} />
                    </div>

                    {/* Hojas */}
                    <div key={`tree-${anim.tree}`} className={`${styles.tree} ${anim.tree ? styles.play : ""}`}>
                    <img src={hojasImg} alt="" className={styles.layer} />
                    </div>

                    {/* Cartel Casa */}
                    <div key={`house-${anim.house}`} className={`${styles.house} ${anim.house ? styles.play : ""}`}>
                    <img src={cartelCasa} alt="" className={styles.layer} />
                    </div>

                    {/* Niño hamaca + brazos */}
                    <div key={`kids-${anim.kids}`} className={`${styles.kids} ${anim.kids ? styles.play : ""}`}>
                    <img src={ninoHamacaImg} alt="" className={styles.layer} />
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

                    {/* HOTSPOTS (✅ corregidos con fit) */}
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

                    {/* OVERLAY desbloqueo */}
                    {showUnlockModal && unlocked && (
                    <div className={styles.unlockOverlay} role="dialog" aria-modal="true">
                        <div className={styles.unlockCard}>
                        <div className={styles.unlockTitle}>¡Felicidades! 🌈</div>
                        <div className={styles.unlockSubtitle}>Desbloqueaste el camino.</div>

                        <Button
                            variant="primary"
                            onClick={() => {
                            setShowUnlockModal(false);
                            goToNext();
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
                </div>
            </div>
            </section>
        </Container>

        {/* ====== RESTO DEL COMPONENTE ====== */}
        <div ref={nextSectionRef} className={unlocked ? styles.rest : styles.hidden}>
            <Container>
            <section className="grid gap-6 md:grid-cols-2 items-center bg-ui-tintBlue border border-ui-border rounded-lg shadow-card p-6">
                <div className="grid gap-3">
                <Badge variant="blue">Jardín materno infantil</Badge>
                <h2 className="text-3xl md:text-4xl font-extrabold text-ui-text leading-tight">
                    Un lugar seguro, cálido y creativo para crecer
                </h2>
                <p className="text-ui-muted">
                    Acompañamos a las familias en la primera infancia con propuestas
                    pensadas para cada etapa: juego, vínculo, exploración y hábitos.
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                    <Link to="/uniformes">
                    <Button variant="primary">Comprar uniformes</Button>
                    </Link>
                </div>
                </div>

                <div className="aspect-video md:aspect-square rounded-md bg-gray-200 border border-ui-border" />
            </section>

            {/* ... resto igual ... */}
            <section className="grid gap-4">
                <h2 className="text-xl font-extrabold text-ui-text">Nuestra propuesta</h2>

                <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                    <div className="text-2xl">🧩</div>
                    <div className="mt-2 font-extrabold text-ui-text">Aprender jugando</div>
                    <p className="mt-1 text-sm text-ui-muted">
                    Actividades lúdicas para desarrollar autonomía, lenguaje y motricidad.
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="text-2xl">🤍</div>
                    <div className="mt-2 font-extrabold text-ui-text">Cuidado y vínculo</div>
                    <p className="mt-1 text-sm text-ui-muted">
                    Acompañamiento afectivo y rutinas que brindan seguridad y confianza.
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="text-2xl">🌈</div>
                    <div className="mt-2 font-extrabold text-ui-text">Ambiente amable</div>
                    <p className="mt-1 text-sm text-ui-muted">
                    Espacios pensados para explorar, crear y compartir en comunidad.
                    </p>
                </Card>
                </div>
            </section>
            </Container>
        </div>
        </main>
    );
}
