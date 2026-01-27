import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ImageBox from "../components/ui/ImageBox";
import { listAll } from "../services/productsApi";

export default function UniformesEntry() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        setLoading(true);

        listAll().then((res) => {
        if (!alive) return;
        setProducts(res);
        setLoading(false);
        });

        return () => {
        alive = false;
        };
    }, []);

    return (
        <main className="py-10">
        <Container className="grid gap-6">
            <section className="grid gap-3 text-center">
            <Badge variant="blue">Tienda</Badge>
            <h1 className="text-3xl font-extrabold text-ui-text">
                Uniformes del jardín
            </h1>
            <p className="text-ui-muted">
                Elegí un producto y después seleccioná el talle disponible (1 a 5) en el detalle.
            </p>
            </section>

            {loading ? (
            <Card className="p-5">
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : (
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                <Card key={p.id} className="p-4">
                    <ImageBox src={p.image} alt={p.name} />
                    <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                        <div className="font-bold text-ui-text">{p.name}</div>
                        <div className="text-xs text-ui-muted mt-1">
                        {p.talles?.includes("Único")
                            ? "Talle: Único"
                            : `Talles: ${p.talles.join(" · ")}`}
                        </div>
                    </div>
                    <div className="font-extrabold text-brand-orange">
                        ${Number(p.price || 0).toLocaleString("es-AR")}
                    </div>
                    </div>

                    <Link to={`/producto/${p.id}`} className="mt-4 block">
                    <Button variant="secondary" className="w-full">
                        Ver detalle
                    </Button>
                    </Link>
                </Card>
                ))}
            </section>
            )}
        </Container>
        </main>
    );
}

