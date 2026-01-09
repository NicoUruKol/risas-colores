import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const SALAS = [
    { key: "lactantes", label: "Lactantes", desc: "Primeros meses" },
    { key: "sala-1", label: "Sala 1 año", desc: "Primeros pasos" },
    { key: "sala-2", label: "Sala 2 años", desc: "Exploración y juego" },
    { key: "sala-3", label: "Sala 3 años", desc: "Autonomía y creatividad" },
    ];

    export default function UniformesEntry() {
    const navigate = useNavigate();

    return (
        <main className="py-10">
            <Container className="grid gap-10 max-w-[900px]">
        {/* Header */}
                <section className="grid gap-3 text-center">
                    <Badge variant="blue">Tienda</Badge>
                    <h1 className="text-3xl font-extrabold text-ui-text">
                        Uniformes del jardín
                    </h1>
                    <p className="text-ui-muted">
                        Seleccioná la sala para ver los uniformes correspondientes.
                    </p>
                </section>

        {/* Salas */}
                <section className="grid gap-4 md:grid-cols-2">
                    {SALAS.map((sala) => (
                        <Card key={sala.key} className="p-5 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-ui-text">
                                {sala.label}
                                </h2>
                                <p className="text-sm text-ui-muted mt-1">
                                {sala.desc}
                                </p>
                            </div>

                            <div className="mt-4">
                                <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => navigate(`/uniformes/${sala.key}`)}
                                >
                                Ver uniformes
                                </Button>
                            </div>
                        </Card>
                    ))}
                </section>

        {/* Info */}
                <section className="bg-ui-tintLavender border border-ui-border rounded-lg p-6 text-center grid gap-2">
                    <h3 className="text-lg font-extrabold text-ui-text">
                        Comprá de forma simple
                    </h3>
                    <p className="text-sm text-ui-muted">
                        Elegís la sala, seleccionás los productos o packs y finalizás la compra.
                    </p>
                </section>
            </Container>
        </main>
    );
}
