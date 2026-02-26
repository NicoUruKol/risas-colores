import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import styles from "./HorariosSalas.module.css";
import whatsappIcon from "../../assets/whatsapp.svg";

/* ==============================
Data
============================== */
const SALAS = [
    {
        key: "lactarios",
        tone: 2, // violeta
        chip: "Lactarios",
        title: "45 días a 1 año",
        bullets: ["Primer vínculo y cuidados personalizados", "Rutinas de sueño, higiene y alimentación"],
        quote: "Un espacio cálido y seguro para acompañar cada necesidad 💜",
    },
    {
        key: "deambuladores",
        tone: 1, // azul
        chip: "Deambuladores",
        title: "1 a 2 años",
        bullets: ["Exploración guiada y juego libre", "Autonomía en un entorno preparado"],
        quote: "Nos movemos, descubrimos y aprendemos jugando 💙",
    },
    {
        key: "sala2",
        tone: 0, // naranja
        chip: "Sala de 2",
        title: "2 a 3 años",
        bullets: ["Lenguaje, arte y música todos los días", "Curiosidad y socialización acompañadas"],
        quote: "Cada detalle importa cuando se trata de infancias 🧡",
    },
    ];

    const JORNADAS = [
    {
        key: "simple",
        icon: "🕐",
        title: "Jornada simple",
        lines: ["Mañana: 8 a 13 / 9 a 14", "Tarde: 12 a 17"],
        note: "Ideal para acompañar rutinas familiares.",
    },
    {
        key: "completa",
        icon: "🌈",
        title: "Jornada completa",
        lines: ["8 a 16 / 9 a 17"],
        note: "Un día completo de juego, cuidado y propuestas.",
    },
];

/* ==============================
Helpers
============================== */
const clampIndex = (i, len) => {
    if (len <= 0) return 0;
    const x = i % len;
    return x < 0 ? x + len : x;
};

/* ==============================
Component
============================== */
export default function HorariosSalas() {
    const [active, setActive] = useState(0);
    const trackRef = useRef(null);
    const startX = useRef(null);
    const deltaX = useRef(0);
    const isDown = useRef(false);

    const sala = SALAS[active];

    const goTo = useCallback((next) => {
        setActive((prev) => clampIndex(next, SALAS.length));
    }, []);

    const prev = useCallback(() => goTo(active - 1), [active, goTo]);
    const next = useCallback(() => goTo(active + 1), [active, goTo]);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        el.style.setProperty("--active", String(active));
    }, [active]);

    /* ==============================
    Touch / Pointer swipe
    ============================== */
    const onPointerDown = (e) => {
        isDown.current = true;
        startX.current = e.clientX ?? (e.touches?.[0]?.clientX ?? null);
        deltaX.current = 0;
    };

    const onPointerMove = (e) => {
        if (!isDown.current) return;
        const x = e.clientX ?? (e.touches?.[0]?.clientX ?? null);
        if (startX.current == null || x == null) return;
        deltaX.current = x - startX.current;
    };

    const onPointerUp = () => {
        if (!isDown.current) return;
        isDown.current = false;

        const dx = deltaX.current;
        deltaX.current = 0;
        startX.current = null;

        const threshold = 45;
        if (dx > threshold) prev();
        else if (dx < -threshold) next();
    };

    /* ==============================
    Keyboard
    ============================== */
    const onKeyDown = (e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    return (
        <section className={styles.stage} aria-label="Horarios y salas">
        <div className={styles.bg} aria-hidden="true" />

        <Card className={styles.shell}>
            <header className={styles.head}>
            <h2 className={styles.title}>Horarios y Salas</h2>
            <p className={styles.sub}>
                Jardín abierto todo el año 🌈 Podés sumarte cuando lo necesites, sin esperar al próximo ciclo lectivo.
            </p>

            <div className={styles.badges}>
                <Badge>👶 Lactantes, deambuladores y sala de 2</Badge>
                <Badge>🕐 Jornadas simples o completas</Badge>
                <Badge>📲 Comunicación continua</Badge>
            </div>
            </header>

            <div className={styles.grid} data-tone={sala.tone}>
            {/* ==============================
            Slider Salas
            ============================== */}
            <div className={styles.slider} data-tone={sala.tone}>
                <div className={styles.sliderTop}>
                <h3 className={styles.sliderTitle}>Nuestras salas</h3>

                <div className={styles.nav} aria-label="Controles del slider">
                    <Button
                    className={styles.navBtn}
                    data-variant="secondary"
                    onClick={prev}
                    aria-label="Sala anterior"
                    type="button"
                    >
                    ←
                    </Button>
                    <Button
                    className={styles.navBtn}
                    data-variant="secondary"
                    onClick={next}
                    aria-label="Sala siguiente"
                    type="button"
                    >
                    →
                    </Button>
                </div>
                </div>

                <div
                className={styles.viewport}
                onKeyDown={onKeyDown}
                tabIndex={0}
                role="region"
                aria-roledescription="carousel"
                aria-label="Slider de salas"
                >
                <div
                    ref={trackRef}
                    className={styles.track}
                    style={{ transform: `translateX(calc(${-active} * (100% + var(--gap))))` }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onTouchStart={onPointerDown}
                    onTouchMove={onPointerMove}
                    onTouchEnd={onPointerUp}
                >
                    {SALAS.map((s, idx) => (
                    <article
                        key={s.key}
                        className={`${styles.slide} ${idx === active ? styles.slideActive : ""}`}
                        data-tone={s.tone}
                        aria-current={idx === active ? "true" : "false"}
                    >
                        <div className={styles.slideHead}>
                        <span className={styles.chip}>{s.chip}</span>
                        <h4 className={styles.slideTitle}>{s.title}</h4>
                        </div>

                        <ul className={styles.bullets}>
                        {s.bullets.map((b) => (
                            <li key={b}>{b}</li>
                        ))}
                        </ul>

                        <div className={styles.quoteBox}>
                        <p className={styles.quote}>{s.quote}</p>
                        </div>
                    </article>
                    ))}
                </div>
                </div>

                <div className={styles.dots} role="tablist" aria-label="Selector de sala">
                {SALAS.map((s, idx) => (
                    <button
                    key={s.key}
                    className={`${styles.dot} ${idx === active ? styles.dotActive : ""}`}
                    data-tone={s.tone}
                    onClick={() => goTo(idx)}
                    type="button"
                    role="tab"
                    aria-selected={idx === active}
                    aria-label={`Ir a ${s.chip}`}
                    />
                ))}
                </div>

                <p className={styles.hint}>Deslizá para cambiar de sala</p>
            </div>

            {/* ==============================
            Jornadas + Info
            ============================== */}
            <div className={styles.jornadas} data-tone={sala.tone}>
                <div className={styles.jTop}>
                <h3 className={styles.jTitle}>Jornadas</h3>
                <span className={styles.jPill}>🏡 Abierto todo el año</span>
                </div>

                <div className={styles.jCards}>
                {JORNADAS.map((j) => (
                    <div key={j.key} className={styles.jCard} data-tone={sala.tone}>
                    <div className={styles.jCardHead}>
                        <span className={styles.jIcon} aria-hidden="true">
                        {j.icon}
                        </span>
                        <h4 className={styles.jCardTitle}>{j.title}</h4>
                    </div>

                    <div className={styles.jLines}>
                        {j.lines.map((line) => (
                        <p key={line} className={styles.jLine}>
                            {line}
                        </p>
                        ))}
                    </div>

                    <p className={styles.jNote}>{j.note}</p>
                    </div>
                ))}
                </div>

                <div className={styles.extra}>
                <div className={styles.extraItem}>
                    <span className={styles.extraIcon} aria-hidden="true">
                    👩‍🍼
                    </span>
                    <p className={styles.extraText}>Un equipo que está siempre cerca.</p>
                </div>
                    <div className={styles.extraItem}>
                        <span className={styles.extraIcon} aria-hidden="true">
                        ✨
                        </span>
                        <p className={styles.extraText}>Podés comenzar cuando lo necesites.</p>
                    </div>
                </div>

                <div className={styles.ctaRow}>
                    <a
                        href="https://wa.me/5491152499974?text=Hola%20%F0%9F%91%A6%F0%9F%8F%BB%20%F0%9F%91%A7%F0%9F%8F%BB%20%F0%9F%8C%88%0AEstamos%20interesados%20en%20conocer%20disponibilidad%20y%20horarios%20del%20Jard%C3%ADn%20Maternal%20Risas%20y%20Colores.%0A%C2%A1Gracias!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.ctaLink}
                    >
                        <Button
                        className={styles.ctaBtn}
                        data-variant="primary"
                        type="button"
                        >
                        <span className={styles.ctaContent}>
                            <img
                            src={whatsappIcon}
                            alt=""
                            aria-hidden="true"
                            className={styles.ctaIcon}
                            />
                            Consultar disponibilidad por WhatsApp
                        </span>
                        </Button>
                    </a>
                </div>
            </div>
            </div>
        </Card>
        </section>
    );
}