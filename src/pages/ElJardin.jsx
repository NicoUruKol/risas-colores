import { Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import styles from "./ElJardin.module.css";


// ✅ tu imagen (ajustá la ruta)
import sceneImg from "../assets/escena2.webp";

const SCENE_HOTSPOTS = [
    { id: "kids", label: "Niños", tip: "Jugamos, aprendemos y nos cuidamos 🤍", rect: { x: 6, y: 60, w: 70, h: 38 } },
    { id: "house", label: "La casa", tip: "Un espacio pensado para crecer con seguridad ✨", rect: { x: 26, y: 26, w: 48, h: 40 } },
    { id: "tree", label: "Árbol", tip: "Naturaleza y juego al aire libre 🌿", rect: { x: 0, y: 10, w: 30, h: 55 } },
    { id: "sun", label: "Sol", tip: "Un ambiente cálido y amable ☀️", rect: { x: 76, y: 6, w: 20, h: 24 } },
    { id: "clouds", label: "Nubes", tip: "La imaginación también se aprende ☁️", rect: { x: 28, y: 8, w: 72, h: 22 } },
    { id: "birds", label: "Pajaritos", tip: "Acompañamos cada primer paso 🐦", rect: { x: 56, y: 6, w: 22, h: 22 } },
];

export default function ElJardin() {
  // 🔒 “gate”
    const [discovered, setDiscovered] = useState(() => new Set());
    const discoveredCount = discovered.size;
    const unlocked = discoveredCount >= 3;

    const [anim, setAnim] = useState({
    kids: 0,
    house: 0,
    tree: 0,
    sun: 0,
    clouds: 0,
    birds: 0,
});

    // tip flotante
    const [activeTip, setActiveTip] = useState(null);
    const [tipVisible, setTipVisible] = useState(false);

    // referencia a la HERO (para scrollear ahí)
    const heroRef = useRef(null);

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
        setAnim((prev) => ({ ...prev, [spot.id]: prev[spot.id] + 1 }));
        setTipVisible(true);

        window.clearTimeout(onHotspotClick._t);
        onHotspotClick._t = window.setTimeout(() => setTipVisible(false), 2200);

        {/* OVERLAYS ANIMADOS (no pesan, solo CSS) */}
        <div className="absolute inset-0 pointer-events-none">
        {/* ☀️ Sol: pulso + rayos giran */}
        <div
            className={`spotSun ${anim.sun ? "play" : ""}`}
            key={`sun-${anim.sun}`}
        />

        {/* ☁️ Nubes: se deslizan suave */}
        <div
            className={`spotClouds ${anim.clouds ? "play" : ""}`}
            key={`clouds-${anim.clouds}`}
        />

        {/* 🐦 Pajaritos: “vuelo” corto */}
        <div
            className={`spotBirds ${anim.birds ? "play" : ""}`}
            key={`birds-${anim.birds}`}
        />

        {/* 🌳 Árbol: balanceo + hojitas */}
        <div
            className={`spotTree ${anim.tree ? "play" : ""}`}
            key={`tree-${anim.tree}`}
        >
            <span className="leaf l1" />
            <span className="leaf l2" />
            <span className="leaf l3" />
        </div>

        {/* 🏠 Casa: “respira” + brillito */}
        <div
            className={`spotHouse ${anim.house ? "play" : ""}`}
            key={`house-${anim.house}`}
        />

        {/* 👶 Niños: saltito + confetti mini */}
        <div
            className={`spotKids ${anim.kids ? "play" : ""}`}
            key={`kids-${anim.kids}`}
        >
            <span className="spark s1" />
            <span className="spark s2" />
            <span className="spark s3" />
        </div>
        </div>

    };

    const revealRest = () => {
        // scroll suave a la HERO (ya visible porque desbloqueaste)
        // usamos requestAnimationFrame por si el render todavía no aplicó el cambio visual
        requestAnimationFrame(() => {
        heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    return (
        <main className="py-10">
        <Container className="grid gap-10">
            {/* ==========================
                1) ESCENA (SIEMPRE ARRIBA)
            ========================== */}
            <section className="grid gap-4">
            <div className="grid gap-2">
                <Badge variant="blue">Descubrí el jardín</Badge>
                <p className="text-sm text-ui-muted">{progressText}</p>
            </div>

            <div className="relative w-full overflow-hidden rounded-lg border border-ui-border bg-white shadow-card">
                <div className="relative w-full aspect-[16/10]">
                <img
                    src={sceneImg}
                    alt="Escena interactiva del jardín Risas y Colores"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    draggable="false"
                />
                {/* OVERLAYS ANIMADOS */}
                {/* CAPAS ANIMADAS (SVGs livianos alineados al dibujo) */}
                <div className="absolute inset-0 pointer-events-none">
                {/* ☀️ SOL */}
                    <div
                        className={`${styles.sun} ${anim.sun ? styles.play : ""}`}
                        key={`sun-${anim.sun}`}
                    >
                        <svg viewBox="0 0 100 100" className={styles.sunSvg} aria-hidden="true">
                        <g className={styles.sunRays}>
                            {[...Array(12)].map((_, i) => (
                            <rect key={i} x="48" y="2" width="4" height="14" rx="2" transform={`rotate(${i*30} 50 50)`} />
                            ))}
                        </g>
                        <circle cx="50" cy="50" r="22" className={styles.sunCore} />
                        </svg>
                    </div>

                    {/* ☁️ NUBES (2) */}
                    <div className={`${styles.cloud1} ${anim.clouds ? styles.play : ""}`} key={`c1-${anim.clouds}`}>
                        <svg viewBox="0 0 120 70" className={styles.cloudSvg} aria-hidden="true">
                        <path d="M35 55c-12 0-22-8-22-18s10-18 22-18c4-11 16-18 29-16 10 2 18 10 20 20 12 1 21 9 21 19 0 10-10 18-22 18H35z" />
                        </svg>
                    </div>

                    <div className={`${styles.cloud2} ${anim.clouds ? styles.play : ""}`} key={`c2-${anim.clouds}`}>
                        <svg viewBox="0 0 120 70" className={styles.cloudSvg} aria-hidden="true">
                        <path d="M35 55c-12 0-22-8-22-18s10-18 22-18c4-11 16-18 29-16 10 2 18 10 20 20 12 1 21 9 21 19 0 10-10 18-22 18H35z" />
                        </svg>
                    </div>

                    {/* 🎈 GLOBOS (3) */}
                    <div className={`${styles.balloons} ${anim.house ? styles.play : ""}`} key={`b-${anim.house}`}>
                        {[0,1,2].map((i) => (
                        <svg key={i} viewBox="0 0 60 90" className={`${styles.balloon} ${styles["b"+i]}`} aria-hidden="true">
                            <ellipse cx="30" cy="30" rx="18" ry="22" />
                            <path d="M30 52 C28 58 32 58 30 64" fill="none" strokeWidth="3" />
                            <path d="M30 64 C24 70 26 78 22 86" fill="none" strokeWidth="2" />
                        </svg>
                        ))}
                    </div>

                    {/* 🐦 PÁJAROS (2) */}
                    <div className={`${styles.birds} ${anim.birds ? styles.play : ""}`} key={`birds-${anim.birds}`}>
                        {[0,1].map((i) => (
                        <svg key={i} viewBox="0 0 80 50" className={`${styles.bird} ${styles["bird"+i]}`} aria-hidden="true">
                            <path d="M10 30 Q25 10 40 25 Q55 10 70 30" fill="none" strokeWidth="6" strokeLinecap="round" />
                        </svg>
                        ))}
                    </div>
                    </div>

                <div className="absolute inset-0 pointer-events-none">
                <div
                    key={`sun-${anim.sun}`}
                    className={`${styles.spotSun} ${anim.sun ? styles.play : ""}`}
                />
                <div
                    key={`clouds-${anim.clouds}`}
                    className={`${styles.spotClouds} ${anim.clouds ? styles.play : ""}`}
                />
                <div
                    key={`birds-${anim.birds}`}
                    className={`${styles.spotBirds} ${anim.birds ? styles.play : ""}`}
                />
                <div
                    key={`tree-${anim.tree}`}
                    className={`${styles.spotTree} ${anim.tree ? styles.play : ""}`}
                >
                    <span className={`${styles.leaf} ${styles.l1}`} />
                    <span className={`${styles.leaf} ${styles.l2}`} />
                    <span className={`${styles.leaf} ${styles.l3}`} />
                </div>
                <div
                    key={`house-${anim.house}`}
                    className={`${styles.spotHouse} ${anim.house ? styles.play : ""}`}
                />
                <div
                    key={`kids-${anim.kids}`}
                    className={`${styles.spotKids} ${anim.kids ? styles.play : ""}`}
                >
                    <span className={`${styles.spark} ${styles.s1}`} />
                    <span className={`${styles.spark} ${styles.s2}`} />
                    <span className={`${styles.spark} ${styles.s3}`} />
                </div>
                </div>

                {/* Hotspots clickeables */}
                {SCENE_HOTSPOTS.map((spot) => {
                    const { x, y, w, h } = spot.rect;
                    return (
                    <button
                        key={spot.id}
                        type="button"
                        onClick={() => onHotspotClick(spot)}
                        className="absolute rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-text active:scale-[0.99] transition-transform"
                        style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${w}%`,
                        height: `${h}%`,
                        background: "transparent",
                        }}
                        aria-label={`Interactuar con ${spot.label}`}
                    />
                    );
                })}

                {/* Tip flotante */}
                {activeTip && tipVisible && (
                    <div className="absolute left-3 right-3 bottom-3">
                    <div className="rounded-2xl border border-ui-border bg-white/90 backdrop-blur px-4 py-3 shadow-card">
                        <div className="text-sm font-extrabold text-ui-text">{activeTip.label}</div>
                        <div className="text-sm text-ui-muted mt-0.5">{activeTip.tip}</div>
                    </div>
                    </div>
                )}

                {/* Mini progreso */}
                <div className="absolute top-2 left-2">
                    <div className="rounded-full border border-ui-border bg-white/85 backdrop-blur px-3 py-1 text-xs text-ui-muted">
                    {discoveredCount}/6
                    </div>
                </div>
                </div>
            </div>

            {/* ✅ Botón aparece SOLO al 3er descubrimiento */}
            {unlocked && (
                <div className="flex justify-center">
                <Button variant="primary" onClick={revealRest}>
                    Conocé el jardín ↓
                </Button>
                </div>
            )}
            </section>

            {/* ==========================================
                2) RESTO DEL COMPONENTE (BLOQUEADO)
            ========================================== */}
            <div className={unlocked ? "grid gap-10" : "hidden"}>
            {/* HERO */}
            <section
                ref={heroRef}
                className="grid gap-6 md:grid-cols-2 items-center bg-ui-tintBlue border border-ui-border rounded-lg shadow-card p-6"
            >
                <div className="grid gap-3">
                <Badge variant="blue">Jardín materno infantil</Badge>
                <h1 className="text-3xl md:text-4xl font-extrabold text-ui-text leading-tight">
                    Un lugar seguro, cálido y creativo para crecer
                </h1>
                <p className="text-ui-muted">
                    Acompañamos a las familias en la primera infancia con propuestas
                    pensadas para cada etapa: juego, vínculo, exploración y hábitos.
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                    <Link to="/uniformes">
                    <Button variant="primary">Comprar uniformes</Button>
                    </Link>
                    <Button variant="ghost">Agendar visita</Button>
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

            {/* GALERÍA (placeholder) */}
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
            </div>
        </Container>
        </main>
    );
}

