import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ImageBox from "../../components/ui/ImageBox";
import { adminDelete, adminList } from "../../services/productsApi";

const toImages = (p) => {
    const a = p?.avatar;
    if (typeof a === "string") {
        const s = a.trim();
        return s ? [s] : [];
    }
    if (Array.isArray(a)) {
        return a.map((x) => String(x || "").trim()).filter(Boolean);
    }
    return [];
};

const getSizesFromVariants = (variants) => {
    if (!Array.isArray(variants)) return [];
    return variants
        .map((v) => String(v?.size || "").trim())
        .filter(Boolean);
};

const formatSizes = (sizes = []) => {
    const uniq = Array.from(new Set(sizes));
    if (!uniq.length) return "-";
    return uniq.join(" · ");
};

const minPriceFromVariants = (variants) => {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    const prices = variants
        .map((v) => Number(v?.price))
        .filter((n) => Number.isFinite(n) && n >= 0);
    if (!prices.length) return null;
    return Math.min(...prices);
};

const totalStockFromVariants = (variants) => {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    const stocks = variants
        .map((v) => Number(v?.stock))
        .filter((n) => Number.isFinite(n) && n >= 0);
    if (!stocks.length) return null;
    return stocks.reduce((acc, n) => acc + n, 0);
};

export default function AdminProductos() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await adminList();
        setItems(Array.isArray(res) ? res : []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id) => {
        await adminDelete(id);
        load();
    };

    return (
        <main className="py-10">
        <Container className="grid gap-6">
            <div className="flex items-start justify-between gap-4">
            <div>
                <Badge variant="lavender">Admin</Badge>
                <h1 className="text-2xl font-extrabold text-ui-text mt-2">
                Productos
                </h1>
                <p className="text-sm text-ui-muted mt-2">
                Gestioná Remera, Pantalón, Buzo y Mochila.
                </p>
            </div>

            <Link to="/admin/productos/nuevo">
                <Button variant="primary">Nuevo producto</Button>
            </Link>
            </div>

            {loading ? (
            <Card className="p-5">
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : items.length === 0 ? (
            <Card className="p-5">
                <p className="text-ui-muted">No hay productos cargados.</p>
            </Card>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => {
                const images = toImages(p);
                const cover = images[0] || "";

                const sizes = getSizesFromVariants(p?.variants);
                const priceFrom = minPriceFromVariants(p?.variants);
                const stockTotal = totalStockFromVariants(p?.variants);

                return (
                    <Card key={p.id} className="p-4">
                    <ImageBox src={cover} alt={p.name} />

                    <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                        <div className="font-bold text-ui-text">{p.name}</div>

                        <div className="text-xs text-ui-muted mt-1">
                            Talles: {formatSizes(sizes)}
                        </div>

                        <div className="text-xs text-ui-muted mt-1">
                            Stock:{" "}
                            {stockTotal === null ? "-" : String(stockTotal)}
                            {" · "}
                            Estado: {p.active === false ? "Inactivo" : "Activo"}
                        </div>

                        <div className="text-xs text-ui-muted mt-1">
                            Imágenes: {images.length}
                        </div>
                        </div>

                        <div className="font-extrabold text-brand-orange">
                        {priceFrom === null
                            ? "-"
                            : `Desde $${priceFrom.toLocaleString("es-AR")}`}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link to={`/admin/productos/${p.id}/editar`}>
                        <Button
                            variant="ghost"
                            className="w-full text-black border-black"
                        >
                            Editar
                        </Button>
                        </Link>

                        <Button
                        variant="ghost"
                        className="w-full text-black border-black"
                        onClick={() => handleDelete(p.id)}
                        >
                        Eliminar
                        </Button>
                    </div>
                    </Card>
                );
                })}
            </div>
            )}
        </Container>
        </main>
    );
}
