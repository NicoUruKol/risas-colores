import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ImageBox from "../components/ui/ImageBox";
import { listBySala } from "../services/productsApi";

const salaLabel = (sala) => {
    const map = { lactantes: "Lactantes", "sala-1": "Sala 1 año", "sala-2": "Sala 2 años", "sala-3": "Sala 3 años" };
    return map[sala] ?? sala;
    };

    export default function Catalogo() {
    const { sala } = useParams();
    const [data, setData] = useState({ packs: [], products: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        listBySala(sala).then((res) => {
        if (!alive) return;
        setData(res);
        setLoading(false);
        });
        return () => { alive = false; };
    }, [sala]);

    return (
        <main className="py-10">
            <Container className="grid gap-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-ui-text">Uniformes</h1>
                        <div className="mt-2"><Badge variant="blue">{salaLabel(sala)}</Badge></div>
                        <p className="text-sm text-ui-muted mt-2">
                        Elegí packs para resolver más rápido o agregá prendas individuales.
                        </p>
                    </div>
                    <Link to="/uniformes">
                        <Button variant="ghost" size="sm">Cambiar sala</Button>
                    </Link>
                </div>

                {loading ? (
                <Card className="p-5"><p className="text-ui-muted">Cargando…</p></Card>
                ) : (
                <>
                    {/* Packs */}
                    {data.packs.length > 0 && (
                    <section className="grid gap-3">
                        <h2 className="text-lg font-extrabold text-ui-text">Packs recomendados</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {data.packs.map((pack) => (
                            <Card key={pack.id} className="p-5">
                                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                                    <ImageBox src={pack.image} alt={pack.name} className="md:aspect-square aspect-video" />
                                    <div className="grid gap-2">
                                        <div className="font-extrabold text-ui-text">{pack.name}</div>
                                        <div className="text-sm text-ui-muted">{pack.description}</div>
                                        <div className="text-sm text-ui-muted">Incluye: {pack.items.length} prendas</div>
                                        <div className="flex items-center justify-between mt-1">
                                            <Badge variant="lavender">Más rápido</Badge>
                                            <div className="text-xl font-extrabold text-brand-orange">
                                                ${pack.price.toLocaleString("es-AR")}
                                            </div>
                                        </div>
                                        <Link to={`/producto/${pack.id}`} className="mt-2">
                                            <Button variant="primary" className="w-full">Ver pack</Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                            ))}
                        </div>
                    </section>
                    )}

                    {/* Productos */}
                    <section className="grid gap-3">
                    <h2 className="text-lg font-extrabold text-ui-text">Productos</h2>

                    {data.products.length === 0 ? (
                        <Card className="p-5"><p className="text-ui-muted">Todavía no hay productos cargados para esta sala.</p></Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.products.map((p) => (
                            <Card key={p.id} className="p-4">
                            <ImageBox src={p.image} alt={p.name} />
                            <div className="mt-3 flex items-start justify-between gap-3">
                                <div>
                                <div className="font-bold text-ui-text">{p.name}</div>
                                <div className="text-xs text-ui-muted mt-1">Talles: {p.talles.join(" · ")}</div>
                                </div>
                                <div className="font-extrabold text-brand-orange">
                                ${p.price.toLocaleString("es-AR")}
                                </div>
                            </div>
                            <Link to={`/producto/${p.id}`} className="mt-4 block">
                                <Button variant="secondary" className="w-full">Ver detalle</Button>
                            </Link>
                            </Card>
                        ))}
                        </div>
                    )}
                    </section>
                </>
                )}
            </Container>
        </main>
    );
}
