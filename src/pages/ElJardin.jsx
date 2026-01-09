import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function ElJardin() {
    return (
        <main className="py-10">
            <Container className="grid gap-10">
        {/* HERO */}
                <section className="grid gap-6 md:grid-cols-2 items-center bg-ui-tintBlue border border-ui-border rounded-lg shadow-card p-6">
                    <div className="grid gap-3">
                        <Badge variant="blue">Jardín maternal</Badge>
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
                                Actividades lúdicas para desarrollar autonomía, lenguaje y
                                motricidad.
                            </p>
                        </Card>

                        <Card className="p-5">
                            <div className="text-2xl">🤍</div>
                            <div className="mt-2 font-extrabold text-ui-text">Cuidado y vínculo</div>
                            <p className="mt-1 text-sm text-ui-muted">
                                Acompañamiento afectivo y rutinas que brindan seguridad y
                                confianza.
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
                        <p className="text-sm text-ui-muted mt-1">
                            Algunas imágenes para que las familias se ubiquen y se entusiasmen.
                        </p>
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
                                Desde lactantes y salas por edad (ajustalo a la realidad del jardín).
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
                    <h3 className="text-xl font-extrabold text-ui-text">
                        ¿Listos para empezar?
                    </h3>
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
            </Container>
        </main>
    );
}
