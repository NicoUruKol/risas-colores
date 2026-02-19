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
    return variants.map((v) => String(v?.size || "").trim()).filter(Boolean);
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

const FILTERS = [
    { value: "all", label: "Todos" },
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
];

export default function AdminProductos() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ por defecto: admin ve TODO (activos + inactivos)
    const [activeFilter, setActiveFilter] = useState("all");

    const load = async (active = activeFilter) => {
        setLoading(true);
        const res = await adminList({ active });
        setItems(Array.isArray(res) ? res : []);
        setLoading(false);
    };

    useEffect(() => {
        load("all");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load(activeFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter]);

    const handleDelete = async (id) => {
        await adminDelete(id);
        load(activeFilter);
    };

    const filterLabel = useMemo(
        () => FILTERS.find((f) => f.value === activeFilter)?.label || "Todos",
        [activeFilter]
    );

    return (
        <main className="py-10">
        <Container className="grid gap-6">
            {/* Header */}
            <div className="grid gap-4 sm:flex sm:items-start sm:justify-between">
            <div>
                <Badge variant="lavender">Admin</Badge>
                <h1 className="text-2xl font-extrabold text-ui-text mt-2">Productos</h1>
                <p className="text-sm text-ui-muted mt-2">
                Gestioná Remera, Pantalón, Buzo y Mochila.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                {/* Filtro (mobile-first) */}
                <div className="flex items-center gap-2">
                <span className="text-xs text-ui-muted">Mostrar:</span>
                <select
                    className="h-10 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    aria-label="Filtro de productos"
                >
                    {FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                        {f.label}
                    </option>
                    ))}
                </select>
                </div>

                <Link to="/admin/productos/nuevo">
                <Button variant="primary">Nuevo producto</Button>
                </Link>
            </div>
            </div>

            {/* Estado filtro */}
            <div className="text-xs text-ui-muted">
            Filtro actual: <b>{filterLabel}</b>
            </div>

            {loading ? (
            <Card className="p-5">
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : items.length === 0 ? (
            <Card className="p-5">
                <p className="text-ui-muted">No hay productos para este filtro.</p>
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
                            Stock: {stockTotal === null ? "-" : String(stockTotal)}
                            {" · "}
                            Estado: {p.active === false ? "Inactivo" : "Activo"}
                        </div>

                        <div className="text-xs text-ui-muted mt-1">
                            Imágenes: {images.length}
                        </div>
                        </div>

                        <div className="font-extrabold text-brand-orange">
                        {priceFrom === null ? "-" : `Desde $${priceFrom.toLocaleString("es-AR")}`}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link to={`/admin/productos/${p.id}/editar`}>
                        <Button
                            variant="ghost"
                            className="w-full !text-black !border-black"
                        >
                            Editar
                        </Button>
                        </Link>

                        <Button
                        variant="ghost"
                        className="w-full !text-black !border-black"
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
