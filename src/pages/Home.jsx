import { useRef } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
//import BackgroundDecor2 from "../components/layout/BackgroundDecor2";

export default function Home() {
    const homeRef = useRef(null);

    return (
        <main ref={homeRef} className="relative py-10 overflow-hidden">
            {/*{/*Fondo animado: ocupa TODO el alto del Home}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <BackgroundDecor2 containerRef={homeRef} />
            </div>*/}

        <Container className="relative z-10 grid gap-8">
            {/* Hero */}
            <section className="bg-ui-tintBlue border border-ui-border rounded-lg shadow-card p-6 grid gap-4">
            <div className="h-56 rounded-md bg-gray-300 border border-ui-border" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-ui-text">
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

            {/* Beneficios */}
            <section className="grid gap-4">
            <h2 className="text-xl font-extrabold text-ui-text">¿Por qué elegirnos?</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {["Proyecto educativo", "Equipo docente", "Espacios seguros", "Acompañamiento familiar"].map((t) => (
                <Card key={t} className="p-4">
                    <div className="font-semibold text-ui-text">{t}</div>
                    <p className="text-sm text-ui-muted mt-1">Texto breve (1 línea) que refuerce confianza.</p>
                </Card>
                ))}
            </div>
            </section>

            {/* Familias actuales */}
            <section className="bg-ui-tintOrange border border-ui-border rounded-lg p-5 grid gap-3">
            <h3 className="text-lg font-extrabold text-ui-text">¿Ya formás parte del jardín?</h3>
            <p className="text-sm text-ui-muted">Accesos rápidos para resolver en segundos.</p>
            <div className="flex flex-wrap gap-3">
                <Link to="/uniformes">
                <Button variant="primary">Ver uniformes</Button>
                </Link>
                <Button variant="ghost">Información importante</Button>
            </div>
            </section>

            {/* Más contenido */}
            <section className="grid gap-4">
            <h2 className="text-xl font-extrabold text-ui-text">¿Por qué elegirnos?</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {["Proyecto educativo", "Equipo docente", "Espacios seguros", "Acompañamiento familiar"].map((t) => (
                <Card key={t} className="p-4">
                    <div className="font-semibold text-ui-text">{t}</div>
                    <p className="text-sm text-ui-muted mt-1">Texto breve (1 línea) que refuerce confianza.</p>
                </Card>
                ))}
            </div>
            </section>
        </Container>
        </main>
    );
}
