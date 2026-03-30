import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import styles from "./Home.module.css";
import HeroCarousel from "../components/ui/HeroCarousel";
import SEO from "../components/seo/SEO";
import { getGoogleReviewsContent } from "../services/apiGoogleReviews";
import ReviewsSection from "../components/sections/ReviewsSection";
import { getHomeHeroContent } from "../services/apiContent";

export default function Home() {
    const homeRef = useRef(null);

    const [heroIndex, setHeroIndex] = useState(0);

    const [heroContent, setHeroContent] = useState({
        items: [],
    });

    useEffect(() => {
        let alive = true;

        getHomeHeroContent()
            .then((data) => {
                if (!alive) return;
                const items = Array.isArray(data?.items) ? data.items : [];
                setHeroContent({ items });
            })
            .catch(() => {});

        return () => {
            alive = false;
        };
    }, []);

    const fallbackHeroSlides = useMemo(
        () => [
            {
                url: "https://res.cloudinary.com/dbwrmebbo/image/upload/v1770669220/Hero1_gslohl.webp",
                title: "Crecer jugando, descubriendo y a su propio ritmo.",
                subtitle: "Un recorrido que estimula la curiosidad, el vínculo y el desarrollo en cada etapa.",
                active: true,
                order: 1,
                public_id: "fallback-1",
            },
            {
                url: "https://res.cloudinary.com/dbwrmebbo/image/upload/v1770669220/Hero2_dfy8uh.webp",
                title: "Elegir con tranquilidad, confiar desde el primer día.",
                subtitle: "Un espacio que contiene, acompaña y brinda calma desde el primer día.",
                active: true,
                order: 2,
                public_id: "fallback-2",
            },
        ],
        []
    );

    const heroSlides =
        heroContent.items?.length > 0 ? heroContent.items : fallbackHeroSlides;

    const heroImages = heroSlides.map((it) => it.url).filter(Boolean);

    const safeIndex = Math.min(heroIndex, Math.max(0, heroSlides.length - 1));
    const heroTitle = heroSlides[safeIndex]?.title || "";
    const heroSubtitle = heroSlides[safeIndex]?.subtitle || "";

    const cta1 = { to: "/el-jardin", label: "Conocer el jardín" };
    const cta2 = { to: "/uniformes", label: "Ver uniformes" };

    const focusOnlyIfBackground = (e) => {
        if (e.target === e.currentTarget) e.currentTarget.focus();
    };

    const handleHeroChange = useCallback((next) => {
        setHeroIndex((prev) => (prev === next ? prev : next));
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
                topic: "Contacto",
                items: [
                    {
                        q: "¿Cómo coordino una entrevista?",
                        a: "Podes contactarnos a través del botón de whatsapp solicitando información o directamente coordinar una visita para conocer el jardin.",
                    },
                ],
            },
            {
                topic: "Propuesta pedagógica",
                items: [
                    {
                        q: "¿Qué propuesta pedagógica ofrece el jardín?",
                        a: [
                            "Nuestra propuesta se basa en el Diseño Curricular vigente del Nivel Inicial.",
                            "Trabajamos a través de escenarios pedagógicos, donde el equipo docente acompaña y observa los procesos individuales.",
                            "Además, incluimos áreas como expresión artística, movimiento y juego corporal, generando experiencias acordes a cada etapa del desarrollo.",
                        ],
                    },
                ],
            },
            {
                topic: "Seguridad y emergencias",
                items: [
                    {
                        q: "¿El jardín cuenta con protocolos de emergencia?",
                        a: [
                            "Sí. La institución cuenta con protocolos de cuidado y actuación ante situaciones de emergencia, priorizando siempre el bienestar y la seguridad de los niños y niñas.",
                            "El equipo docente está preparado para acompañar estas situaciones y actuar de manera responsable, informando a las familias cuando sea necesario.",
                            "El cuidado, la prevención y la comunicación con las familias forman parte del funcionamiento cotidiano del jardín",
                        ],
                    },
                ],
            },
            {
                topic: "Marco institucional",
                items: [
                    {
                        q: "¿El jardín cuenta con habilitación?",
                        a: "Sí, Risas y Colores es una institución educativa habilitada que recibe niños y niñas desde los 45 días hasta los 3 años.",
                    },
                    {
                        q: "¿Por qué no está incorporado a la enseñanza oficial?",
                        a: "No forma parte de la enseñanza oficial, ya que pertenece al ámbito de la educación materno infantil.",
                    },
                ],
            },
        ],
        []
    );

    const [reviewsData, setReviewsData] = useState({ googleReviewsUrl: "", items: [] });

    useEffect(() => {
        getGoogleReviewsContent().then(setReviewsData).catch(() => {});
    }, []);

    return (
        <main ref={homeRef} className={`relative py-10 ${styles.stage}`}>
            <SEO
                title="Jardín Maternal en Villa Pueyrredón"
                description="Jardín Maternal Risas y Colores en Villa Pueyrredón. Acompañamos a niños y niñas en sus primeros pasos con una propuesta basada en el juego, el afecto y el aprendizaje."
                path="/"
            />

            <h1 className={styles.visuallyHidden}>
                Jardín Maternal Risas y Colores
            </h1>

            <section className={styles.visuallyHidden} aria-label="Información del jardín">
                <h2>Jardín maternal en Villa Pueyrredón</h2>
                <p>
                    El Jardín Maternal Risas y Colores acompaña a niños y niñas en sus primeros años
                    de aprendizaje en Villa Pueyrredón, Ciudad de Buenos Aires, con una propuesta
                    basada en el juego, el afecto y el desarrollo integral.
                </p>
            </section>

            <div className={styles.bg} />

            <Container className="relative z-10 grid gap-10">
                <section
                    tabIndex={0}
                    onPointerDown={focusOnlyIfBackground}
                    className={`${styles.heroCard} p-6 md:p-8 grid gap-4`}
                >
                    <HeroCarousel images={heroImages} onChange={handleHeroChange} />

                    <div className={`${styles.heroTextAnim} ${styles.heroTextBlock}`}>
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
                                                            {Array.isArray(item.a) ? (
                                                                item.a.map((parrafo, i) => (
                                                                    <p key={i} className={styles.cardText}>
                                                                        {parrafo}
                                                                    </p>
                                                                ))
                                                            ) : (
                                                                <p className={styles.cardText}>{item.a}</p>
                                                            )}
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

                <div className={styles.reviewsSlot}>
                    <ReviewsSection
                        reviews={reviewsData.items}
                        googleReviewsUrl={reviewsData.googleReviewsUrl}
                        buttonText="Ver todas las reseñas"
                    />
                </div>

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
                            <Button variant="ghost" className={styles.btnTextDark}>
                                Ver uniformes
                            </Button>
                        </Link>

                        <a
                            href="/PEI.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="ghost" className={styles.btnTextDark}>
                                Información importante
                            </Button>
                        </a>
                    </div>
                </section>
            </Container>
        </main>
    );
}
