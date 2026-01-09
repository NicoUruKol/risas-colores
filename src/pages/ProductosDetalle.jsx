import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ImageBox from "../components/ui/ImageBox";
import { getById } from "../services/productsApi";
import { useCart } from "../context/CartContext";

export default function ProductoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const [talle, setTalle] = useState("Único");
    const [qty, setQty] = useState(1);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        getById(id).then((res) => {
        if (!alive) return;
        setItem(res);
        setLoading(false);
        if (res?.type === "product") setTalle(res.talles?.[0] ?? "Único");
        else setTalle("Único");
        });
        return () => { alive = false; };
    }, [id]);

    const typeBadge = useMemo(() => {
        if (!item) return "blue";
        return item.type === "pack" ? "lavender" : "blue";
    }, [item]);

    const handleAdd = () => {
        if (!item) return;
        addItem({ id: item.id, name: item.name, price: item.price }, { talle, qty });
        navigate("/carrito");
    };

    return (
        <main className="py-10">
            <Container className="grid gap-6 max-w-[860px]">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/uniformes">
                        <Button variant="ghost" size="sm">← Volver</Button>
                    </Link>
                    {!loading && item && <Badge variant={typeBadge}>{item.type === "pack" ? "Pack" : "Producto"}</Badge>}
                </div>

                {loading ? (
                <Card className="p-5"><p className="text-ui-muted">Cargando…</p></Card>
                ) : !item ? (
                <Card className="p-5">
                    <p className="text-ui-muted">No encontramos este producto.</p>
                    <div className="mt-3">
                        <Link to="/uniformes"><Button variant="secondary">Volver</Button></Link>
                    </div>
                </Card>
                ) : (
                <Card className="p-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <ImageBox src={item.image} alt={item.name} />
                        <div className="grid gap-3">
                            <h1 className="text-2xl font-extrabold text-ui-text">{item.name}</h1>
                            <p className="text-ui-muted">
                            {item.description ?? "Detalle breve del producto."}
                            </p>

                            {item.type === "pack" ? (
                            <p className="text-sm text-ui-muted">Incluye {item.items.length} prendas.</p>
                            ) : (
                            <p className="text-sm text-ui-muted">Talles: {item.talles.join(" · ")}</p>
                            )}

                            <div className="text-3xl font-extrabold text-brand-orange">
                            ${item.price.toLocaleString("es-AR")}
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <label className="text-sm text-ui-muted">Talle</label>
                                    <select
                                        className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)] disabled:opacity-60"
                                        value={talle}
                                        onChange={(e) => setTalle(e.target.value)}
                                        disabled={item.type === "pack"}
                                        >
                                        {item.type === "pack" ? (
                                            <option>Único</option>
                                        ) : (
                                            item.talles.map((t) => <option key={t} value={t}>{t}</option>)
                                        )}
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm text-ui-muted">Cantidad</label>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</Button>
                                    <div className="min-w-[44px] text-center font-bold">{qty}</div>
                                        <Button variant="ghost" size="sm" onClick={() => setQty((q) => q + 1)}>+</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-2">
                                <Button variant="primary" onClick={handleAdd}>Agregar al carrito</Button>
                                <Link to="/carrito"><Button variant="secondary">Ir al carrito</Button></Link>
                            </div>
                        </div>
                    </div>
                </Card>
                )}
            </Container>
        </main>
    );
}
