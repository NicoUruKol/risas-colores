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

    const [talle, setTalle] = useState("1");
    const [qty, setQty] = useState(1);

    // ✅ toggle para ver "producto" vs "puesta"
    const [view, setView] = useState("producto"); // "producto" | "puesta"

    useEffect(() => {
        let alive = true;
        setLoading(true);

        getById(id).then((res) => {
        if (!alive) return;

        setItem(res);
        setLoading(false);

        // talle default seguro
        const first = res?.talles?.[0] ?? "1";
        setTalle(first);

        // si no hay imagen "puesta", forzar "producto"
        if (!res?.image?.puesta) setView("producto");
        });

        return () => {
        alive = false;
        };
    }, [id]);

    const badgeVariant = useMemo(() => "blue", []);

    const imgSrc = useMemo(() => {
        if (!item) return "";
        const obj = item.image;
        if (obj && typeof obj === "object") {
        return view === "puesta" ? obj.puesta ?? obj.producto : obj.producto ?? obj.puesta;
        }
        return obj; // compat: si image es string
    }, [item, view]);

    const hasPuesta = Boolean(item?.image && typeof item.image === "object" && item.image.puesta);

    const handleAdd = () => {
        if (!item) return;
        addItem(
        { id: item.id, name: item.name, price: item.price },
        { talle, qty }
        );
        navigate("/carrito");
    };

    return (
        <main className="py-10">
        <Container className="grid gap-6 max-w-[860px]">
            <div className="flex items-center justify-between gap-4">
            <Link to="/uniformes">
                <Button variant="ghost" size="sm">← Volver</Button>
            </Link>

            {!loading && item && (
                <Badge variant={badgeVariant}>Producto</Badge>
            )}
            </div>

            {loading ? (
            <Card className="p-5">
                <p className="text-ui-muted">Cargando…</p>
            </Card>
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
                <div className="grid gap-3">
                    <ImageBox src={imgSrc} alt={item.name} />

                    {hasPuesta && (
                    <div className="flex gap-2">
                        <Button
                        variant={view === "producto" ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => setView("producto")}
                        >
                        Producto
                        </Button>
                        <Button
                        variant={view === "puesta" ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => setView("puesta")}
                        >
                        Puesta
                        </Button>
                    </div>
                    )}
                </div>

                <div className="grid gap-3">
                    <h1 className="text-2xl font-extrabold text-ui-text">{item.name}</h1>

                    <p className="text-ui-muted">
                    {item.description ?? "Detalle breve del producto."}
                    </p>

                    <p className="text-sm text-ui-muted">
                    Talles: {item.talles?.length ? item.talles.join(" · ") : "Consultar"}
                    </p>

                    <div className="text-3xl font-extrabold text-brand-orange">
                    ${Number(item.price || 0).toLocaleString("es-AR")}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-2">
                        <label className="text-sm text-ui-muted">Talle</label>
                        <select
                        className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)] disabled:opacity-60"
                        value={talle}
                        onChange={(e) => setTalle(e.target.value)}
                        disabled={!item.talles?.length}
                        >
                        {(item.talles?.length ? item.talles : ["1","2","3","4","5"]).map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm text-ui-muted">Cantidad</label>
                        <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                        >
                            −
                        </Button>
                        <div className="min-w-[44px] text-center font-bold">{qty}</div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQty((q) => q + 1)}
                        >
                            +
                        </Button>
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

