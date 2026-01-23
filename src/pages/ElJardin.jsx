import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
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

import ninoHamacaImg from "../assets/animacion/escena_0007_hamaca.png";
import pelotaImg from "../assets/animacion/escena_0010_pelota.png";
import brazoDerImg from "../assets/animacion/escena_0012_brazo-azul-hamaca.png";
import brazoIzqImg from "../assets/animacion/escena_0011_brazo-azul-rosa.png";
import lupaImg from "../assets/animacion/escena_0009_lupa-rosa.png";

/* === HOTSPOTS === */
const SCENE_HOTSPOTS = [
    { id: "kids", label: "Niños", tip: "Jugamos, aprendemos y nos cuidamos 🤍", rect: { x: 6, y: 60, w: 70, h: 38 }, z: 30 },
    { id: "house", label: "La casa", tip: "Un espacio pensado para crecer con seguridad ✨", rect: { x: 26, y: 26, w: 48, h: 40 }, z: 20 },
    { id: "tree", label: "Árbol", tip: "Naturaleza y juego al aire libre 🌿", rect: { x: 0, y: 10, w: 30, h: 55 }, z: 20 },
    { id: "sun", label: "Sol", tip: "Un ambiente cálido y amable ☀️", rect: { x: 70, y: 0, w: 30, h: 34 }, z: 90 },
    { id: "clouds", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 28, y: 6, w: 72, h: 26 }, z: 40 },
    { id: "birds", label: "Pajaritos", tip: "Acompañamos cada primer paso 🐦", rect: { x: 52, y: 2, w: 30, h: 26 }, z: 50 },
];

export default function ElJardin() {
    const [discovered, setDiscovered] = useState(() => new Set());
    const discoveredCount = discovered.size;
    const unlocked = discoveredCount >= 3;

    const [activeTip, setActiveTip] = useState(null);
    const [tipVisible, setTipVisible] = useState(false);

    // “Play” de animaciones (con key para reiniciar)
    const [anim, setAnim] = useState({
        sun: 0,
        clouds: 0,
        birds: 0,
        kids: 0,
        house: 0,
        tree: 0,
    });

    const heroRef = useRef(null);
    const sceneWrapRef = useRef(null);

    // medir header real para que la escena entre sin scroll
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

    const progressText = useMemo(() => {
        if (discoveredCount === 0) return "Tocá la escena para descubrir el jardín";
        if (discoveredCount < 3) return `¡Bien! Llevás ${discoveredCount}/3 descubrimientos`;
        return "¡Desbloqueaste el recorrido! 🌈";
    }, [discoveredCount]);

    const onHotspotClick = (spot) => {
        setDiscovered((prev) => {
        const next = new Set(prev);
        next.add(spot.id);
        return next;
        });

        setActiveTip({ label: spot.label, tip: spot.tip });
        setTipVisible(true);

        setAnim((prev) => ({ ...prev, [spot.id]: (prev[spot.id] ?? 0) + 1 }));

        window.clearTimeout(onHotspotClick._t);
        onHotspotClick._t = window.setTimeout(() => setTipVisible(false), 2200);
    };

    const revealRest = () => {
        requestAnimationFrame(() => {
        heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    return (
        <main className={styles.page}>
        <Container className={styles.layout}>
            {/* ======= LADO IZQUIERDO ======= */}
            <aside className={styles.side}>
            <div className={styles.sideInner}>
                {/* ❌ Sacado: el chip/botón “El Jardín” */}
                <h1 className={styles.title}>Descubrí Risas y Colores</h1>
                <p className={styles.subtitle}>Tocá la escena y desbloqueá el recorrido.</p>

                <div className={styles.sideCtaRow}>
                <Link to="/uniformes">
                    <Button variant="primary">Uniformes</Button>
                </Link>
                {/* ❌ Sacado: Agendar visita */}
                </div>

                {/* texto de progreso en desktop */}
                <div className={styles.progressTextDesktop}>{progressText}</div>
            </div>
            </aside>

            {/* ================= ESCENA ================= */}
            <section className={styles.sceneSection}>
            <div ref={sceneWrapRef} className={styles.sceneWrap}>
                <div className={styles.scene} aria-label="Escena interactiva del jardín">
                {/* Fondo */}
                <img src={fondoImg} alt="" className={styles.layer} />

                {/* Sol */}
                <div key={`sun-${anim.sun}`} className={`${styles.sun} ${anim.sun ? styles.play : ""}`}>
                    <img src={solImg} alt="" className={styles.layer} />
                    <img src={solCaraImg} alt="" className={styles.layer} />
                </div>

                {/* Nubes */}
                <div key={`clouds-${anim.clouds}`} className={`${styles.clouds} ${anim.clouds ? styles.play : ""}`}>
                    <img src={nubesImg} alt="" className={styles.layer} />
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

                {/* Niño hamaca + brazos */}
                <div key={`kids-${anim.kids}`} className={`${styles.kids} ${anim.kids ? styles.play : ""}`}>
                    <img src={ninoHamacaImg} alt="" className={styles.layer} />
                    <img src={brazoDerImg} alt="" className={`${styles.layer} ${styles.armR}`} />
                    <img src={brazoIzqImg} alt="" className={`${styles.layer} ${styles.armL}`} />
                </div>

                {/* Pelota */}
                <div className={`${styles.ball} ${anim.kids ? styles.play : ""}`} key={`ball-${anim.kids}`}>
                    <img src={pelotaImg} alt="" className={styles.layer} />
                </div>

                {/* Lupa */}
                <div className={`${styles.magnifier} ${anim.kids ? styles.play : ""}`} key={`lupa-${anim.kids}`}>
                    <img src={lupaImg} alt="" className={styles.layer} />
                </div>

                {/* HOTSPOTS */}
                {SCENE_HOTSPOTS.map((spot) => {
                    const { x, y, w, h } = spot.rect;
                    return (
                    <button
                        key={spot.id}
                        type="button"
                        onClick={() => onHotspotClick(spot)}
                        className={styles.hotspot}
                        style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${w}%`,
                        height: `${h}%`,
                        zIndex: spot.z,
                        }}
                        aria-label={`Interactuar con ${spot.label}`}
                    />
                    );
                })}

                {/* Tooltip adentro */}
                {activeTip && tipVisible && (
                    <div className={styles.tooltip}>
                    <div className={styles.tooltipTitle}>{activeTip.label}</div>
                    <div className={styles.tooltipText}>{activeTip.tip}</div>
                    </div>
                )}
                </div>

                {/* texto progreso mobile debajo */}
                <div className={styles.progressTextMobile}>{progressText}</div>

                {unlocked && (
                <div className={styles.unlockRow}>
                    <Button variant="primary" onClick={revealRest}>
                    Conocé el jardín ↓
                    </Button>
                </div>
                )}

                {/* Mensaje desbloqueo (si lo querés mantener fuera de escena) */}
                {unlocked && <div className={styles.unlockedLine}>¡Desbloqueaste el recorrido! 🌈</div>}
            </div>

            {/* ================= RESTO DEL COMPONENTE (BLOQUEADO) ================= */}
            <div className={unlocked ? styles.rest : styles.hidden}>
                <section
                ref={heroRef}
                className="grid gap-6 md:grid-cols-2 items-center bg-ui-tintBlue border border-ui-border rounded-lg shadow-card p-6"
                >
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
                    {/* ❌ Sacado: Agendar visita */}
                    </div>
                </div>

                <div className="aspect-video md:aspect-square rounded-md bg-gray-200 border border-ui-border" />
                </section>

                {/* (Acá pegás el resto cuando lo retomemos: propuesta, galería, FAQ, CTA) */}
            </div>
            </section>
        </Container>
        </main>
    );
    }
