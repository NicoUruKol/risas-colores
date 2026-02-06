
import { useRef, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import styles from "./Home.module.css";
import HeroCarousel from "../components/ui/HeroCarousel";
import SEO from "../components/seo/SEO";

import Hero1 from "../assets/Hero1.webp";
import Hero2 from "../assets/Hero2.webp";
import Hero3 from "../assets/Hero3.webp";

export default function Home() {
    const heroSlides = useMemo(
        () => [
        {
            img: Hero1,
            title: "Aprender jugando, explorando y descubriendo el mundo a su propio ritmo.",
            subtitle: "Propuesta cálida y respetuosa, pensada para acompañar cada etapa.",
            cta1: { to: "/el-jardin", label: "Conocer el jardín" },
            cta2: { to: "/uniformes", label: "Comprar uniformes" },
        },
        {
            img: Hero2,
            title: "Acompañamos los primeros pasos con cuidado, juego y aprendizaje",
            subtitle: "Rutinas que dan tranquilidad y espacios seguros para explorar.",
            cta1: { to: "/el-jardin", label: "Ver propuesta" },
            cta2: { to: "/uniformes", label: "Ver uniformes" },
        },
        {
            img: Hero3,
            title: "Un lugar donde cada niño se siente seguro para crecer",
            subtitle: "Cercanía con las familias y un equipo docente que acompaña.",
            cta1: { to: "/el-jardin", label: "Más información" },
            cta2: { to: "/uniformes", label: "Ir a la tienda" },
        },
        ],
        []
    );

    const homeRef = useRef(null);

    const [heroTick, setHeroTick] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);

    const currentHero = heroSlides[heroIndex] ?? heroSlides[0];

    const focusOnlyIfBackground = (e) => {
        if (e.target === e.currentTarget) e.currentTarget.focus();
    };

    const handleHeroChange = useCallback((next) => {
        setHeroIndex((prev) => (prev === next ? prev : next));
        setHeroTick((t) => t + 1);
    }, []);

    return (
        <main ref={homeRef} className={`relative py-10 ${styles.stage}`}>
        <SEO
            title="Educación, juego y cuidado"
            description="Jardín Maternal Risas y Colores. Acompañamos a niños y niñas en sus primeros pasos con una propuesta basada en el juego, el afecto y el aprendizaje."
            path="/"
        />

        <div className={styles.bg} />

        <Container className="relative z-10 grid gap-10">
            <section
            tabIndex={0}
            onPointerDown={focusOnlyIfBackground}
            className={`${styles.heroCard} p-6 md:p-8 grid gap-4`}
            >
            <HeroCarousel
                images={heroSlides.map((s) => s.img)}
                onChange={handleHeroChange}
            />

            <div key={heroTick} className={styles.heroTextAnim}>
                <h1
                className={`text-[1.6rem] sm:text-2xl md:text-4xl font-extrabold leading-tight text-[var(--ui-text)] ${styles.heroTitle}`}
                >
                {currentHero.title}
                </h1>

                <p className="text-sm sm:text-base text-[var(--ui-muted)]">
                {currentHero.subtitle}
                </p>

                <div className={`flex flex-col sm:flex-row gap-3 ${styles.heroActions}`}>
                <Link to={currentHero.cta1.to} className="w-full sm:w-auto">
                    <Button variant="secondary" className={`w-full sm:w-auto ${styles.heroBtn}`}>
                    {currentHero.cta1.label} <span className={styles.heroArrow}>→</span>
                    </Button>
                </Link>

                <Link to={currentHero.cta2.to} className="w-full sm:w-auto">
                    <Button
                    variant="primary"
                    className={`w-full sm:w-auto ${styles.heroBtn} ${styles.heroBtnPrimary}`}
                    >
                    {currentHero.cta2.label} <span className={styles.heroArrow}>→</span>
                    </Button>
                </Link>
                </div>
            </div>
            </section>

            <section className={styles.section}>
            <h2 className={styles.h3}>Preguntas frecuentes</h2>

            <div className={styles.cardsGrid2}>
                <Card className={`${styles.softCard} ${styles.softBlue}`}>
                <div className={styles.faqQ}>¿Qué edades reciben?</div>
                <p className={styles.cardText}>Desde lactantes y salas por edad (consultar salas).</p>
                </Card>

                <Card className={`${styles.softCard} ${styles.softOrange}`}>
                <div className={styles.faqQ}>¿Cómo coordino una visita?</div>
                <p className={styles.cardText}>
                    Podés contactarnos por WhatsApp o completar un formulario.
                </p>
                </Card>

                <Card className={`${styles.softCard} ${styles.softPurple}`}>
                <div className={styles.faqQ}>¿Cómo compro uniformes?</div>
                <p className={styles.cardText}>
                    Entrás a Uniformes, elegís sala, talle y agregás al carrito.
                </p>
                </Card>

                <Card className={`${styles.softCard} ${styles.softBlue}`}>
                <div className={styles.faqQ}>¿Hacen envíos?</div>
                <p className={styles.cardText}>
                    Podés definir retiro en el jardín o envío a domicilio (según lo que decidan).
                </p>
                </Card>
            </div>
            </section>

            <section
            tabIndex={0}
            onPointerDown={focusOnlyIfBackground}
            className={`${styles.familiasShell} p-6 grid gap-3`}
            >
            <h3 className="text-lg md:text-xl font-extrabold text-[var(--ui-text)]">
                ¿Ya formás parte del jardín?
            </h3>

            <p className="text-sm text-[var(--ui-muted)]">Accesos rápidos para resolver en segundos.</p>

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
