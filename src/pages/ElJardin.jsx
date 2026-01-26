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

    const smoothScrollTo = (targetY, duration = 1100) => {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        const start = performance.now();

        const easeInOut = (t) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

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

        const targetY =
        el.getBoundingClientRect().top + window.pageYOffset - headerH - 12;

        smoothScrollTo(targetY, 1100);
    };

    const skipToContent = () => {
        setUnlocked(true);
        requestAnimationFrame(() => goToNext());
    };

    return (
        <main className={styles.page}>
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
                        {unlocked && (
                        <p className={styles.sideUnlocked}>
                            ¡Desbloqueaste el recorrido! 🌈
                        </p>
                        )}
                    </div>
                    </div>
                </aside>

                <div className={styles.sceneSection}>
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
                            </div> <Badge variant="orange">Galería</Badge> 
                        </div> 
                        <div className="grid gap-4 md:grid-cols-3"> 
                            <div className="aspect-video rounded-md bg-gray-200 border border-ui-border" /> 
                            <div className="aspect-video rounded-md bg-gray-200 border border-ui-border" /> 
                            <div className="aspect-video rounded-md bg-gray-200 border border-ui-border" /> 
                        </div> </section> {/* FAQ */} 
                    <section className="grid gap-4"> 
                        <h2 className="text-xl font-extrabold text-ui-text">Preguntas frecuentes</h2> 
                        <div className="grid gap-4 md:grid-cols-2"> 
                            <Card className="p-5"> 
                                <div className="font-extrabold text-ui-text">
                                    ¿Qué edades reciben?
                                </div> 
                                <p className="mt-1 text-sm text-ui-muted"> 
                                    Desde lactantes y salas por edad (consultar salas). 
                                </p> 
                            </Card> 
                            <Card className="p-5"> 
                                <div className="font-extrabold text-ui-text">
                                    ¿Cómo coordino una visita?
                                </div> 
                                <p className="mt-1 text-sm text-ui-muted"> 
                                    Podés contactarnos por WhatsApp o completar un formulario. 
                                </p>
                            </Card> 
                            <Card className="p-5"> 
                                <div className="font-extrabold text-ui-text">
                                    ¿Cómo compro uniformes?
                                </div> 
                                <p className="mt-1 text-sm text-ui-muted"> 
                                    Entrás a Uniformes, elegís sala, talle y agregás al carrito. 
                                </p> 
                            </Card> 
                            <Card className="p-5"> 
                                <div className="font-extrabold text-ui-text">
                                    ¿Hacen envíos?
                                </div> 
                                <p className="mt-1 text-sm text-ui-muted"> 
                                    Podés definir retiro en el jardín o envío a domicilio (según lo que decidan). 
                                </p> 
                            </Card> 
                        </div> 
                    </section> {/* CTA FINAL */} 
                    <section className="bg-ui-tintOrange border border-ui-border rounded-lg p-6 grid gap-3 text-center"> 
                        <h3 className="text-xl font-extrabold text-ui-text">
                            ¿Listos para empezar?
                        </h3> 
                        <p className="text-sm text-ui-muted"> 
                            Conocé el catálogo de uniformes y resolvé la compra en minutos. 
                        </p> 
                        <div className="flex justify-center gap-3 flex-wrap"> 
                            <Link to="/uniformes"> 
                                <Button variant="primary">
                                    Ir a Uniformes
                                </Button> 
                            </Link> 
                            <Link to="/"> 
                                <Button variant="secondary">
                                    Volver al inicio
                                </Button> 
                            </Link> 
                        </div> 
                    </section>
                </Container>
            </div>
        </main>
    );
}

