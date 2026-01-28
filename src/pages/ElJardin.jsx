import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

import styles from "./ElJardin.module.css";
import SceneInteractiva from "../components/scene/SceneInteractiva";

export default function ElJardin() {
    const nextSectionRef = useRef(null);
    const [unlocked, setUnlocked] = useState(false);

    const scrollAnimRef = useRef(null);

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

        const headerH = (document.querySelector("header")?.getBoundingClientRect()?.height) ?? 0;
        const y1 = el.getBoundingClientRect().top + window.scrollY - headerH - 12;

        const distance = Math.abs(y1 - window.scrollY);
        const duration = Math.min(2000, Math.max(1100, distance * 0.7));


        smoothScrollTo(y1, duration);


        requestAnimationFrame(() => {
            const headerH2 = (document.querySelector("header")?.getBoundingClientRect()?.height) ?? 0;
            const y2 = el.getBoundingClientRect().top + window.scrollY - headerH2 - 12;
            window.scrollTo(0, y2); 
        });
    };





    const skipToContent = () => {
        setUnlocked(true);
        requestAnimationFrame(() => goToNext());
    };

    return (
        <main className={styles.page}>
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
                    O seguí sin jugar <span className={styles.arrow} aria-hidden>→</span>
                </button>

                <div className={styles.sideInfo}>
                    {unlocked && (
                    <p className={styles.sideUnlocked}>¡Desbloqueaste el recorrido! 🌈</p>
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

        {/* ====== RESTO DEL COMPONENTE ====== */}
        <div
            ref={nextSectionRef}
            className={`${styles.restWrap} ${unlocked ? styles.restWrapIn : styles.restWrapLocked}`}
        >
            <Container>
            {/* Intro */}
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

            {/* Propuesta */}
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

            {/* Galería */}
            <section className={styles.section}>
                <div className={styles.sectionHead}>
                <div>
                    <h2 className={styles.h3}>Conocé el espacio</h2>
                    <p className={styles.smallMuted}>Imágenes del jardín.</p>
                </div>
                <Badge variant="orange">Galería</Badge>
                </div>

                <div className={styles.galleryGrid}>
                <div className={styles.galleryItem} />
                <div className={styles.galleryItem} />
                <div className={styles.galleryItem} />
                </div>
            </section>

            {/* FAQ */}
            <section className={styles.section}>
                <h2 className={styles.h3}>Preguntas frecuentes</h2>

                <div className={styles.cardsGrid2}>
                <Card className={`${styles.softCard} ${styles.softBlue}`}>
                    <div className={styles.faqQ}>¿Qué edades reciben?</div>
                    <p className={styles.cardText}>
                    Desde lactantes y salas por edad (consultar salas).
                    </p>
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

            {/* CTA */}
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
