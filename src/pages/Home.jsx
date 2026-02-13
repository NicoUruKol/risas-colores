import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import styles from "./Home.module.css";
import HeroCarousel from "../components/ui/HeroCarousel";
import SEO from "../components/seo/SEO";

import { getHomeHeroContent } from "../services/apiContent";

export default function Home() {
    const homeRef = useRef(null);

    const [heroTick, setHeroTick] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);

    // ==============================
    // Hero (fallback solo imágenes)
    // ==============================
    const fallbackHeroImages = useMemo(
        () => [
        "https://res.cloudinary.com/dbwrmebbo/image/upload/v1770669220/Hero1_gslohl.webp",
        "https://res.cloudinary.com/dbwrmebbo/image/upload/v1770669220/Hero2_dfy8uh.webp",
        ],
        []
    );

    // Content desde backend (Firestore)
    const [heroContent, setHeroContent] = useState({
        title: "",
        subtitle: "",
        items: [],
    });

    useEffect(() => {
        let alive = true;

        getHomeHeroContent()
        .then((data) => {
            if (!alive) return;
            const items = Array.isArray(data?.items) ? data.items : [];

            setHeroContent({
            title: data?.title || "",
            subtitle: data?.subtitle || "",
            items,
            });
        })
        .catch(() => {
            // fallback silencioso: queda el fallbackHeroImages y textos genéricos
        });

        return () => {
        alive = false;
        };
    }, []);

    const heroImages =
        heroContent.items?.length > 0
        ? heroContent.items.map((it) => it.url).filter(Boolean)
        : fallbackHeroImages;

    // title/subtitle SOLO backend (si no hay, genéricos)
    const heroTitle =
        heroContent.title?.trim() || "Aprender jugando, explorando y descubriendo el mundo a su propio ritmo.";
    const heroSubtitle =
        heroContent.subtitle?.trim() ||
        "Una propuesta cálida y respetuosa para acompañar cada etapa.";

    // CTAs fijos (no dependen del slide)
    const cta1 = { to: "/el-jardin", label: "Conocer el jardín" };
    const cta2 = { to: "/uniformes", label: "Ir a la tienda" };

    const focusOnlyIfBackground = (e) => {
        if (e.target === e.currentTarget) e.currentTarget.focus();
    };

    const handleHeroChange = useCallback((next) => {
        setHeroIndex((prev) => (prev === next ? prev : next));
        setHeroTick((t) => t + 1);
    }, []);

    const [activeTopic, setActiveTopic] = useState(null);
    const [openQ, setOpenQ] = useState({});

    const toggleTopic = (tIdx) => {
        setActiveTopic((prev) => (prev === tIdx ? null : tIdx));
        setOpenQ({});
    };

    const toggleQuestion = (tIdx, qIdx) => {
        setOpenQ((prev) => ({
        ...prev,
        [tIdx]: prev[tIdx] === qIdx ? -1 : qIdx,
        }));
    };

    const faqs = useMemo(
        () => [
        {
            topic: "Ingreso y contacto",
            items: [
            {
                q: "¿Cómo coordino una entrevista o visita?",
                a: "Podés escribirnos por WhatsApp. Coordinamos una entrevista personalizada para que conozcas el jardín y podamos responder todas tus dudas.",
            },
            {
                q: "¿Cómo puedo pedir información?",
                a: "A través de WhatsApp o redes. Siempre respondemos de manera directa y personalizada.",
            },
            ],
        },
        {
            topic: "Propuesta y metodología",
            items: [
            {
                q: "¿Qué metodología utiliza el jardín?",
                a: "Trabajamos con una propuesta pedagógica basada en el juego, el vínculo afectivo y el respeto por los tiempos de cada niño y niña.",
            },
            {
                q: "¿En qué línea educativa se basa la propuesta?",
                a: "Nuestra mirada está centrada en la primera infancia, priorizando el desarrollo emocional, social y cognitivo en un entorno cuidado y estimulante.",
            },
            ],
        },
        {
            topic: "Seguridad y emergencias",
            items: [
            {
                q: "¿Qué pasa si un niño o niña se lastima?",
                a: "Ante cualquier situación, se actúa de forma inmediata siguiendo los protocolos del jardín y se avisa a la familia de manera directa.",
            },
            {
                q: "¿El jardín cuenta con protocolos de emergencia?",
                a: "Sí. Contamos con protocolos de seguridad y emergencia establecidos para garantizar el cuidado de todos los niños y niñas.",
            },
            {
                q: "¿Qué nivel de seguridad tiene el jardín?",
                a: "El espacio está preparado especialmente para la primera infancia, con medidas de seguridad acordes a cada etapa.",
            },
            ],
        },
        {
            topic: "Marco institucional",
            items: [
            {
                q: "¿El jardín está habilitado?",
                a: "Sí, el jardín cuenta con la habilitación correspondiente para funcionar como jardín maternal.",
            },
            {
                q: "¿Está incorporado a la enseñanza oficial?",
                a: "El jardín maternal no funciona como escuela formal. Su objetivo es acompañar la primera infancia desde el cuidado, el juego y el desarrollo integral.",
            },
            {
                q: "¿Cuál es la diferencia entre jardín maternal y guardería?",
                a: "Un jardín maternal no solo cuida, sino que acompaña el desarrollo infantil a través de una propuesta pedagógica pensada para cada etapa.",
            },
            ],
        },
        ],
        []
    );

    return (
        <main ref={homeRef} className={`relative py-10 ${styles.stage}`}>
        <SEO
            title="Educación, juego y cuidado"
            description="Jardín Maternal Risas y Colores. Acompañamos a niños y niñas en sus primeros pasos con una propuesta basada en el juego, el afecto y el aprendizaje."
            path="/"
        />

        <div className={styles.bg} />

        <Container className="relative z-10 grid gap-10">
            {/* ==============================
                Hero
                ============================== */}
            <section
            tabIndex={0}
            onPointerDown={focusOnlyIfBackground}
            className={`${styles.heroCard} p-6 md:p-8 grid gap-4`}
            >
            <HeroCarousel images={heroImages} onChange={handleHeroChange} />

            <div key={heroTick} className={styles.heroTextAnim}>
                <h1
                className={`text-[1.6rem] sm:text-2xl md:text-4xl font-extrabold leading-tight text-[var(--ui-text)] ${styles.heroTitle}`}
                >
                {heroTitle}
                </h1>

                <p className="text-sm sm:text-base text-[var(--ui-muted)]">
                {heroSubtitle}
                </p>

                <div className={`flex flex-col sm:flex-row gap-3 ${styles.heroActions}`}>
                <Link to={cta1.to} className="w-full sm:w-auto">
                    <Button variant="secondary" className={`w-full sm:w-auto ${styles.heroBtn}`}>
                    {cta1.label} <span className={styles.heroArrow}>→</span>
                    </Button>
                </Link>

                <Link to={cta2.to} className="w-full sm:w-auto">
                    <Button
                    variant="primary"
                    className={`w-full sm:w-auto ${styles.heroBtn} ${styles.heroBtnPrimary}`}
                    >
                    {cta2.label} <span className={styles.heroArrow}>→</span>
                    </Button>
                </Link>
                </div>
            </div>
            </section>

            {/* ==============================
                FAQ (4 temas)
                ============================== */}
            <section
            className={`${styles.faqShell} p-6 md:p-7 grid gap-4`}
            aria-label="Preguntas frecuentes"
            >
            <div className={styles.faqHead}>
                <h2 className={styles.faqTitle}>Preguntas frecuentes</h2>
                <p className={styles.faqSub}>
                Resolvemos dudas rápidas antes de coordinar una visita.
                </p>
            </div>

            <div className={styles.faqTopics}>
                {faqs.map((group, tIdx) => {
                const topicOpen = activeTopic === tIdx;

                return (
                    <div
                    key={group.topic}
                    data-tone={tIdx % 3}
                    className={`${styles.faqTopic} ${topicOpen ? styles.faqTopicActive : ""}`}
                    >
                    <button
                        type="button"
                        className={styles.faqTopicBtn}
                        aria-expanded={topicOpen}
                        onClick={() => toggleTopic(tIdx)}
                    >
                        <span className={styles.faqTopicTitle}>{group.topic}</span>
                        <span className={styles.faqPlus} aria-hidden="true">
                        +
                        </span>
                    </button>

                    <div className={styles.faqTopicPanel} hidden={!topicOpen}>
                        <div className={styles.faqInner}>
                        {group.items.map((item, qIdx) => {
                            const qOpen = (openQ[tIdx] ?? -1) === qIdx;

                            return (
                            <div key={item.q} className={styles.faqQItem}>
                                <button
                                type="button"
                                className={styles.faqQBtn}
                                aria-expanded={qOpen}
                                onClick={() => toggleQuestion(tIdx, qIdx)}
                                >
                                <span className={styles.faqQText}>{item.q}</span>
                                <span className={styles.faqChevron} aria-hidden="true">
                                    +
                                </span>
                                </button>

                                <div className={styles.faqA} hidden={!qOpen}>
                                <p className={styles.cardText}>{item.a}</p>
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            </section>

            {/* ==============================
                Familias actuales
                ============================== */}
            <section
            tabIndex={0}
            onPointerDown={focusOnlyIfBackground}
            className={`${styles.familiasShell} p-6 grid gap-3`}
            >
            <h3 className="text-lg md:text-xl font-extrabold text-[var(--ui-text)]">
                ¿Ya formás parte del jardín?
            </h3>

            <p className="text-sm text-[var(--ui-muted)]">
                Accesos rápidos para resolver en segundos.
            </p>

            <div className="flex flex-wrap gap-3">
                <Link to="/uniformes">
                <Button variant="primary" className={styles.btnTextDark}>
                    Ver uniformes
                </Button>
                </Link>
                <Button variant="ghost">Información importante</Button>
            </div>
            </section>
        </Container>
        </main>
    );
}
