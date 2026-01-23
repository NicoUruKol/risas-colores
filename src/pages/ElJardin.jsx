import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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
  // Izquierda grande (árbol + hamaca)
    { id: "tree", label: "Árbol", tip: "Naturaleza y juego al aire libre 🌿", rect: { x: 2, y: 14, w: 22, h: 78 }, z: 30 },
    // Casa (centro)
    { id: "house", label: "La casa", tip: "Un espacio pensado para crecer con seguridad ✨", rect: { x: 26, y: 33, w: 46, h: 34 }, z: 20, animKey: "house" },
    // Niños derecha abajo
    { id: "kids", label: "Niños", tip: "Jugamos, aprendemos y nos cuidamos 🤍", rect: { x: 52, y: 67, w: 30, h: 22 }, z: 30 },
    // Nube izquierda (chiquita)
    { id: "cloudL", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 34, y: 14, w: 18, h: 12 }, z: 40, animKey: "clouds" },
    // Pájaros (centro arriba)
    { id: "birds", label: "Pajaritos", tip: "Acompañamos cada primer paso 🐦", rect: { x: 56, y: 11, w: 16, h: 12 }, z: 60 },
    // Sol/cara (arriba derecha) -> MÁS CHICO para no tapar nube
    { id: "sun", label: "Sol", tip: "Un ambiente cálido y amable ☀️", rect: { x: 73, y: 6, w: 14, h: 14 }, z: 80, animKey: "sun" },
    // Nube derecha (chiquita)
    { id: "cloudR", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 84, y: 18, w: 14, h: 12 }, z: 50, animKey: "clouds" },
];


export default function ElJardin() {
    const [discovered, setDiscovered] = useState(() => new Set());
    const [forceUnlocked, setForceUnlocked] = useState(false);

    const discoveredCount = discovered.size;
    const unlocked = forceUnlocked || discoveredCount >= 3;

    const [activeTip, setActiveTip] = useState(null);
    const [tipVisible, setTipVisible] = useState(false);

    // Para reiniciar animaciones con key
    const [anim, setAnim] = useState({
        sun: 0,
        clouds: 0,
        birds: 0,
        kids: 0,
        tree: 0,
        house: 0,
    });

    const sceneWrapRef = useRef(null);
    const nextSectionRef = useRef(null);
    const [showUnlockModal, setShowUnlockModal] = useState(false);


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

        const key = spot.animKey ?? spot.id; // 👈 acá
        setAnim((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));

        window.clearTimeout(onHotspotClick._t);
        onHotspotClick._t = window.setTimeout(() => setTipVisible(false), 2200);
        };


    const smoothScrollTo = (targetY, duration = 1100) => {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    const start = performance.now();

    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
    smoothScrollTo(targetY, 1100); // 🔥 más lento (podés subir a 1300 si querés)
    };
    const skipToContent = () => {
    setForceUnlocked(true);      // ✅ habilita el resto
    setShowUnlockModal(false);   // ✅ si está el modal, lo cierra
    requestAnimationFrame(() => goToNext()); // ✅ scroll suave al contenido
    };


    return (
        <main className={styles.page}>
        {/* ====== BLOQUE SUPERIOR: panel + escena ====== */}
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
                {!unlocked && discoveredCount === 0 && (
                    <p className={styles.sideHint}> </p>
                )}

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
                <div className={styles.scene} aria-label="Escena interactiva del jardín">
                    {/* Fondo */}
                    <img src={fondoImg} alt="" className={styles.layer} />

                    {/* Sol */}
                    <div key={`sun-${anim.sun}`} className={`${styles.sun} ${anim.sun ? styles.play : ""}`}>
                    <img src={solImg} alt="" className={`${styles.layer} ${styles.sunRays}`} />
                    <img src={solCaraImg} alt="" className={styles.layer} />
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

                    {/* Cartel Casa (se anima con el hotspot "house") */}
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

                    {/* HOTSPOTS */}
                    {SCENE_HOTSPOTS.map((spot) => (
                    <button
                        key={spot.id}
                        type="button"
                        onClick={() => onHotspotClick(spot)}
                        className={styles.hotspot}
                        style={{
                        left: `${spot.rect.x}%`,
                        top: `${spot.rect.y}%`,
                        width: `${spot.rect.w}%`,
                        height: `${spot.rect.h}%`,
                        zIndex: spot.z,
                        }}
                        aria-label={`Interactuar con ${spot.label}`}
                    />
                    ))}

                    {/* Tooltip */}
                    {activeTip && tipVisible && (
                    <div className={styles.tooltip}>
                        <div className={styles.tooltipTitle}>{activeTip.label}</div>
                        <div className={styles.tooltipText}>{activeTip.tip}</div>
                    </div>
                    )}

                    {/* OVERLAY desbloqueo (centrado, blur + botón) */}
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

        {/* ====== RESTO DEL COMPONENTE: FULL WIDTH (normal) ====== */}
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

            {/* BLOQUES INFO */}
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

            {/* GALERÍA */}
            <section className="grid gap-4">
                <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-ui-text">Conocé el espacio</h2>
                    <p className="text-sm text-ui-muted mt-1">Imágenes del jardin.</p>
                </div>
                <Badge variant="orange">Galería</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-md bg-gray-200 border border-ui-border" />
                <div className="aspect-video rounded-md bg-gray-200 border border-ui-border" />
                <div className="aspect-video rounded-md bg-gray-200 border border-ui-border" />
                </div>
            </section>

            {/* FAQ */}
            <section className="grid gap-4">
                <h2 className="text-xl font-extrabold text-ui-text">Preguntas frecuentes</h2>

                <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-5">
                    <div className="font-extrabold text-ui-text">¿Qué edades reciben?</div>
                    <p className="mt-1 text-sm text-ui-muted">
                    Desde lactantes y salas por edad (consultar salas).
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="font-extrabold text-ui-text">¿Cómo coordino una visita?</div>
                    <p className="mt-1 text-sm text-ui-muted">
                    Podés contactarnos por WhatsApp o completar un formulario.
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="font-extrabold text-ui-text">¿Cómo compro uniformes?</div>
                    <p className="mt-1 text-sm text-ui-muted">
                    Entrás a Uniformes, elegís sala, talle y agregás al carrito.
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="font-extrabold text-ui-text">¿Hacen envíos?</div>
                    <p className="mt-1 text-sm text-ui-muted">
                    Podés definir retiro en el jardín o envío a domicilio (según lo que decidan).
                    </p>
                </Card>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="bg-ui-tintOrange border border-ui-border rounded-lg p-6 grid gap-3 text-center">
                <h3 className="text-xl font-extrabold text-ui-text">¿Listos para empezar?</h3>
                <p className="text-sm text-ui-muted">
                Conocé el catálogo de uniformes y resolvé la compra en minutos.
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                <Link to="/uniformes">
                    <Button variant="primary">Ir a Uniformes</Button>
                </Link>
                <Link to="/">
                    <Button variant="secondary">Volver al inicio</Button>
                </Link>
                </div>
            </section>
            </Container>
        </div>
        </main>
    );
}
