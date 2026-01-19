import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import styles from "./Home.module.css";
import HeroCarousel from "../components/ui/HeroCarousel";
import { useRevealOnScroll } from "../components/hooks/useRevealOnScroll";
import Hero1 from "../assets/Hero1.webp";
import Hero2 from "../assets/Hero2.webp";
import Hero3 from "../assets/Hero3.webp";

export default function Home() {
    const heroSlides = [
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
        ];

    const homeRef = useRef(null);
    const benefitsSentinelRef = useRef(null);  //Sentinel: dispara scrolleando (así la animación se nota)
    const [benefitsIn, setBenefitsIn] = useState(false);
    const [heroTick, setHeroTick] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);
    const currentHero = heroSlides[heroIndex];  




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
            { threshold: 0, rootMargin: "0px 0px -25% 0px" }
        );

        io.observe(el);
        return () => io.disconnect();
        }, []);


    //Animación base (inline → no depende de Tailwind)
    const sectionRevealStyle = {
        opacity: benefitsIn ? 1 : 0,
        transform: benefitsIn ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 700ms ease, transform 700ms ease",
        willChange: "opacity, transform",
    };
    
    return (
        <main ref={homeRef} className={`relative py-10 ${styles.stage}`}>
        <div className={styles.bg} />

        <Container className="relative z-10 grid gap-10">
            {/* Hero */}
            <section
            className={`${styles.hero} ${styles.heroCard} border p-6 md:p-8 grid gap-4
                bg-[rgba(255,255,255,0.88)]
                border-[var(--ui-border)]
                shadow-[0_12px_30px_rgba(0,0,0,0.08)]
                backdrop-blur-[2px]`}
            >
            <div className={styles.heroConfetti}>
                <span className={`${styles.confettiPaper} ${styles.paperPurple} ${styles.p1}`} />
                <span className={`${styles.confettiPaper} ${styles.paperOrange} ${styles.p2}`} />
                <span className={`${styles.confettiPaper} ${styles.paperBlue} ${styles.p3}`} />
                <span className={`${styles.confettiPaper} ${styles.paperPurple} ${styles.p4}`} />
                <span className={`${styles.confettiPaper} ${styles.paperOrange} ${styles.p5}`} />
                <span className={`${styles.confettiPaper} ${styles.paperBlue} ${styles.p6}`} />
                <span className={`${styles.confettiPaper} ${styles.paperPurple} ${styles.p7}`} />
                <span className={`${styles.confettiPaper} ${styles.paperOrange} ${styles.p8}`} />
                <span className={`${styles.confettiPaper} ${styles.paperBlue} ${styles.p9}`} />
                <span className={`${styles.confettiPaper} ${styles.paperPurple} ${styles.p10}`} />
            </div>


            <HeroCarousel
                images={heroSlides.map((s) => s.img)}
                onChange={(next) => {
                    setHeroIndex(next);
                    setHeroTick((t) => t + 1);
                }}
                />

            <div key={heroTick} className={styles.heroTextAnim}>
                <h1 className={`text-[1.6rem] sm:text-2xl md:text-4xl font-extrabold leading-tight text-[var(--ui-text)] ${styles.heroTitle}`}>
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
                    <Button variant="primary" className={`w-full sm:w-auto ${styles.heroBtn} ${styles.heroBtnPrimary}`}>
                        {currentHero.cta2.label} <span className={styles.heroArrow}>→</span>
                    </Button>
                    </Link>
                </div>
            </div>
            </section>

            {/* ✅ Sentinel (gatillo del reveal) */}
            <div ref={benefitsSentinelRef} className="h-1" />

            {/* Beneficios */}
            <section
            style={sectionRevealStyle}
                className={`
                grid gap-4 rounded-3xl p-5 md:p-6 border
                bg-[rgba(255,255,255,0.55)]
                border-[var(--ui-border)]
                backdrop-blur-[1px]
                ${styles.benefitsSection}
            `}
            >
            <h2 className="text-xl md:text-2xl font-extrabold text-[var(--ui-text)]">
                ¿Por qué elegirnos?
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
                {[
                    "Proyecto educativo",
                    "Equipo docente",
                    "Espacios seguros",
                    "Acompañamiento familiar",
                ].map((t, i) => (
                    <Card
                    key={t}
                    data-in={benefitsIn ? "1" : "0"}
                    style={{ "--d": `${i * 120}ms` }}
                    className={`
                        p-6 transition-transform duration-200 hover:-translate-y-1
                        ${styles.softCard} ${styles.softPurple} ${styles.benefitCard}
                        ${i === 1 ? "md:translate-x-2" : ""}
                        ${i === 2 ? "md:-translate-x-2" : ""}
                    `}
                    >
                    <div className="font-semibold text-[var(--ui-text)] text-base md:text-lg">
                        {t}
                    </div>
                    <p className="text-sm text-[var(--ui-muted)] mt-1">
                        Texto breve (1 línea) que refuerce confianza.
                    </p>
                    </Card>
                ))}
            </div>

            </section>

            {/* Familias actuales */}
            <section className="border rounded-3xl p-6 grid gap-3 bg-[var(--ui-tint-primary)] border-[var(--ui-border)]">
            <h3 className="text-lg md:text-xl font-extrabold text-[var(--ui-text)]">
                ¿Ya formás parte del jardín?
            </h3>
            <p className="text-sm text-[var(--ui-muted)]">
                Accesos rápidos para resolver en segundos.
            </p>
            <div className="flex flex-wrap gap-3">
                <Link to="/uniformes">
                <Button variant="primary">Ver uniformes</Button>
                </Link>
                <Button variant="ghost">Información importante</Button>
            </div>
            </section>
        </Container>
        </main>
    );
}
