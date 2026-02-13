import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import SEO from "../components/seo/SEO";

import styles from "./ElJardin.module.css";
import SceneInteractiva from "../components/scene/SceneInteractiva";
import { getElJardinGalleryContent } from "../services/apiContent";

export default function ElJardin() {
    const nextSectionRef = useRef(null);
    const [unlocked, setUnlocked] = useState(false);

    const scrollAnimRef = useRef(null);

    // ==============================
    // Gallery (desde backend)
    // ==============================
    const [galleryItems, setGalleryItems] = useState([]);

    useEffect(() => {
        let alive = true;

        getElJardinGalleryContent()
        .then((data) => {
            if (!alive) return;
            const items = Array.isArray(data?.items) ? data.items : [];
            setGalleryItems(items);
        })
        .catch(() => {
            // fallback silencioso: se ven placeholders
        });

        return () => {
        alive = false;
        };
    }, []);

    const smoothScrollTo = (targetY, duration = 1400) => {
        if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);

        const startY = window.scrollY || window.pageYOffset || 0;
        const diff = targetY - startY;
        const start = performance.now();

        const easeInOut = (t) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const step = (now) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = easeInOut(t);

        window.scrollTo(0, startY + diff * eased);

        if (t < 1) {
            scrollAnimRef.current = requestAnimationFrame(step);
        } else {
            scrollAnimRef.current = null;
        }
        };

        scrollAnimRef.current = requestAnimationFrame(step);
    };

    const goToNext = () => {
        const el = nextSectionRef.current;
        if (!el) return;

        const headerH =
        document.querySelector("header")?.getBoundingClientRect()?.height ?? 0;
        const y1 = el.getBoundingClientRect().top + window.scrollY - headerH - 12;

        const distance = Math.abs(y1 - window.scrollY);
        const duration = Math.min(2000, Math.max(1100, distance * 0.7));

        smoothScrollTo(y1, duration);

        requestAnimationFrame(() => {
        const headerH2 =
            document.querySelector("header")?.getBoundingClientRect()?.height ?? 0;
        const y2 = el.getBoundingClientRect().top + window.scrollY - headerH2 - 12;
        window.scrollTo(0, y2);
        });
    };

    const skipToContent = () => {
        setUnlocked(true);
        requestAnimationFrame(() => goToNext());
    };

    const benefitsSentinelRef = useRef(null);
    const [benefitsIn, setBenefitsIn] = useState(false);

    useEffect(() => {
        const el = benefitsSentinelRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setBenefitsIn(true));
            });
            io.disconnect();
            }
        },
        { threshold: 0, rootMargin: "200px 0px -10% 0px" }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    const whyRefs = useRef([]);
    const [whyIn, setWhyIn] = useState([false, false, false, false]);

    useEffect(() => {
        if (!unlocked) return;

        const els = whyRefs.current.filter(Boolean);
        if (!els.length) return;

        setWhyIn([false, false, false, false]);

        const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idx = Number(entry.target.dataset.idx);

            setWhyIn((prev) => {
                if (prev[idx]) return prev;
                const next = [...prev];
                next[idx] = true;
                return next;
            });

            io.unobserve(entry.target);
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -20% 0px" }
        );

        requestAnimationFrame(() => {
        els.forEach((el) => io.observe(el));
        });

        return () => io.disconnect();
    }, [unlocked]);

    return (
        <main className={styles.page}>
        <SEO
            title="Nuestro Jardín"
            description="Conocé la propuesta educativa del Jardín Maternal Risas y Colores, nuestros valores y el espacio donde los niños crecen acompañados."
            path="/el-jardin"
        />

        <div className={styles.bg} aria-hidden="true" />

        <Container>
            <section className={styles.layout}>
            <aside className={styles.side}>
                <div className={styles.sideShell}>
                <h1 className={styles.title}>Descubrí Risas y Colores</h1>

                <p className={styles.subtitle}>
                    {unlocked
                    ? "¡Genial! Ahora podés seguir explorando la escena o bajar a conocer más."
                    : "Tocá la escena, jugá con nosotros y desbloqueá el recorrido."}
                </p>

                <button
                    type="button"
                    className={styles.skipHint}
                    onClick={skipToContent}
                >
                    O seguí sin jugar{" "}
                    <span className={styles.arrow} aria-hidden>
                    →
                    </span>
                </button>

                <div className={styles.sideInfo}>
                    {unlocked && (
                    <p className={styles.sideUnlocked}>
                        ¡Desbloqueaste el recorrido! 🌈
                    </p>
                    )}
                </div>
                </div>
            </aside>

            <div className={styles.sceneShell}>
                <SceneInteractiva
                minUnlock={3}
                unlockedExternal={unlocked}
                onUnlocked={() => setUnlocked(true)}
                onGoToNext={goToNext}
                onSkip={() => setUnlocked(true)}
                />
            </div>
            </section>
        </Container>

        <div
            ref={nextSectionRef}
            className={`${styles.restWrap} ${
            unlocked ? styles.restWrapIn : styles.restWrapLocked
            }`}
        >
            <Container>
            {/* ==============================
                Intro
                ============================== */}
            <section className={`${styles.shell} ${styles.introShell}`}>
                <div className={styles.introGrid}>
                <div className={styles.introLeft}>
                    <Badge variant="blue">Jardín materno infantil</Badge>

                    <h2 className={styles.h2}>
                    Un lugar seguro, cálido y creativo para crecer
                    </h2>

                    <p className={styles.pMuted}>
                    Acompañamos a las familias en la primera infancia con propuestas
                    pensadas para cada etapa: juego, vínculo, exploración y hábitos.
                    </p>

                    <div className={styles.actions}>
                    <Link to="/uniformes" className={styles.linkReset}>
                        <Button variant="primary">Comprar uniformes</Button>
                    </Link>
                    </div>
                </div>

                <div className={styles.mediaMock} />
                </div>
            </section>

            {/* ==============================
                Propuesta
                ============================== */}
            <section className={styles.section}>
                <h2 className={styles.h3}>Nuestra propuesta</h2>

                <div className={styles.cardsGrid3}>
                <Card className={`${styles.softCard} ${styles.softBlue}`}>
                    <div className={styles.icon}>🧩</div>
                    <div className={styles.cardTitle}>Aprender jugando</div>
                    <p className={styles.cardText}>
                    Actividades lúdicas para desarrollar autonomía, lenguaje y motricidad.
                    </p>
                </Card>

                <Card className={`${styles.softCard} ${styles.softOrange}`}>
                    <div className={styles.icon}>🤍</div>
                    <div className={styles.cardTitle}>Cuidado y vínculo</div>
                    <p className={styles.cardText}>
                    Acompañamiento afectivo y rutinas que brindan seguridad y confianza.
                    </p>
                </Card>

                <Card className={`${styles.softCard} ${styles.softPurple}`}>
                    <div className={styles.icon}>🌈</div>
                    <div className={styles.cardTitle}>Ambiente amable</div>
                    <p className={styles.cardText}>
                    Espacios pensados para explorar, crear y compartir en comunidad.
                    </p>
                </Card>
                </div>
            </section>

            {/* ==============================
                Sentinel (reveal Por qué elegirnos)
                ============================== */}
            <div ref={benefitsSentinelRef} className="h-1" />

            {/* ==============================
                Por qué elegirnos (bloques narrativos)
                ============================== */}
            <section className={styles.section} aria-label="Por qué elegirnos">
                <h2 className={styles.h3}>¿Por qué elegirnos?</h2>

                <div className={styles.whyGrid}>
                {[
                    {
                    t: "Proyecto educativo",
                    d: "Nuestra propuesta pedagógica acompaña a cada niño y niña respetando sus tiempos, intereses y necesidades. El juego es el eje central del aprendizaje, promoviendo la autonomía, la exploración y el desarrollo integral.",
                    },
                    {
                    t: "Acompañamiento familiar",
                    d: "Creemos en el trabajo conjunto con las familias. Mantenemos una comunicación constante, con seguimiento personalizado y espacios de intercambio que fortalecen el vínculo entre el jardín y el hogar.",
                    },
                    {
                    t: "Espacios seguros",
                    d: "El jardín está diseñado especialmente para la primera infancia, priorizando la seguridad, el cuidado y el bienestar emocional en cada ambiente.",
                    },
                    {
                    t: "Salas y funcionamiento",
                    d: "Las salas están organizadas por edades, con propuestas acordes a cada etapa del desarrollo. En cada una se trabajan rutinas, juegos y actividades pensadas para acompañar el crecimiento de forma gradual y respetuosa.",
                    },
                ].map((item, i) => (
                    <div
                    key={item.t}
                    data-idx={i}
                    ref={(el) => (whyRefs.current[i] = el)}
                    className={`${styles.softCard} ${styles.softPurple} ${styles.whyItem}`}
                    data-in={whyIn[i] ? "1" : "0"}
                    style={{ "--d": `${i * 90}ms` }}
                    >
                    <div className={styles.whyHead}>
                        <div className={styles.whyTitle}>{item.t}</div>
                    </div>

                    <div className={styles.whyBody}>
                        <p className={styles.whyText}>{item.d}</p>
                    </div>
                    </div>
                ))}
                </div>
            </section>

            {/* ==============================
                Galería
                ============================== */}
            <section className={styles.section}>
                <div className={styles.sectionHead}>
                <div>
                    <h2 className={styles.h3}>Conocé el espacio</h2>
                    <p className={styles.smallMuted}>Imágenes del jardín.</p>
                </div>
                <Badge variant="orange">Galería</Badge>
                </div>

                <div className={styles.galleryGrid}>
                {(galleryItems?.length ? galleryItems : [null, null, null]).map((it, idx) => (
                    <div key={it?.public_id || idx} className={styles.galleryItem}>
                    {it?.url ? (
                        <img
                        className={styles.galleryImg}
                        src={it.url}
                        alt={it.alt || "Galería del jardín"}
                        loading="lazy"
                        decoding="async"
                        />
                    ) : null}
                    </div>
                ))}
                </div>
            </section>

            {/* ==============================
                CTA
                ============================== */}
            <section className={`${styles.shell} ${styles.ctaShell}`}>
                <h3 className={styles.ctaTitle}>¿Listos para empezar?</h3>
                <p className={styles.smallMuted}>
                Conocé el catálogo de uniformes y resolvé la compra en minutos.
                </p>

                <div className={styles.ctaActions}>
                <Link to="/uniformes" className={styles.linkReset}>
                    <Button variant="primary">Ir a Uniformes</Button>
                </Link>
                <Link to="/" className={styles.linkReset}>
                    <Button variant="secondary">Volver al inicio</Button>
                </Link>
                </div>
            </section>
            </Container>
        </div>
        </main>
    );
}
