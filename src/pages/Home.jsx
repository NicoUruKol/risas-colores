import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import styles from "./Home.module.css";
import { useRevealOnScroll } from "../components/hooks/useRevealOnScroll";


export default function Home() {
    const homeRef = useRef(null);

    // ✅ Sentinel: dispara cuando llegás scrolleando (así la animación se nota)
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
            { threshold: 0, rootMargin: "0px 0px -25% 0px" }
        );

        io.observe(el);
        return () => io.disconnect();
        }, []);


    // ✅ Animación base (inline → no depende de Tailwind)
    const sectionRevealStyle = {
        opacity: benefitsIn ? 1 : 0,
        transform: benefitsIn ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 700ms ease, transform 700ms ease",
        willChange: "opacity, transform",
    };

    const getCardRevealStyle = (i) => {
        const delay = i * 120;
        return {
        opacity: benefitsIn ? 1 : 0,
        transform: benefitsIn ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
        willChange: "opacity, transform",
        };
    };

    return (
        <main ref={homeRef} className={`relative py-10 ${styles.stage}`}>
        <div className={styles.bg} />

        <Container className="relative z-10 grid gap-10">
            {/* Hero */}
            <section
            className={`${styles.hero} border p-6 md:p-8 grid gap-4
                bg-[rgba(255,255,255,0.88)]
                border-[var(--ui-border)]
                shadow-[0_12px_30px_rgba(0,0,0,0.08)]
                backdrop-blur-[2px]`}
            >
            <div
                className="h-56 rounded-2xl border
                bg-[var(--ui-tint-secondary)] border-[var(--ui-border)]"
            />
            <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--ui-text)] leading-tight">
                Acompañamos los primeros pasos con cuidado, juego y aprendizaje
            </h1>

            <div className="flex flex-wrap gap-3">
                <Link to="/el-jardin">
                <Button variant="secondary">Conocer el jardín</Button>
                </Link>
                <Link to="/uniformes">
                <Button variant="primary">Comprar uniformes</Button>
                </Link>
            </div>
            </section>

            {/* ✅ Sentinel (gatillo del reveal) */}
            <div ref={benefitsSentinelRef} className="h-1" />

            {/* Beneficios */}
            <section
            style={sectionRevealStyle}
            className="
                grid gap-4 rounded-3xl p-5 md:p-6 border
                bg-[rgba(255,255,255,0.55)]
                border-[var(--ui-border)]
                backdrop-blur-[1px]
            "
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
            ].map((t, i) => {
                const { ref, visible } = useRevealOnScroll({
                rootMargin: "0px 0px -10% 0px",
                });

                const color = styles.softPurple;

                const style = {
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 600ms ease ${i * 120}ms, transform 600ms ease ${
                    i * 120
                }ms`,
                };

                return (
                <Card
                    key={t}
                    ref={ref}
                    style={style}
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
                );
            })}
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
