import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ImageBox from "../../components/ui/ImageBox";
import { adminDelete, adminList } from "../../services/productsApi";
import styles from "./AdminProductos.module.css";

/* ==============================
Helpers
============================== */
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

/* ==============================
AdminProductos
============================== */
export default function AdminProductos() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");

    const [pendingDelete, setPendingDelete] = useState(null);
    const [deletingId, setDeletingId] = useState("");
    const [err, setErr] = useState("");

    const load = async (active = activeFilter) => {
        setLoading(true);
        setErr("");

        try {
        const res = await adminList({ active });
        setItems(Array.isArray(res) ? res : []);
        } catch (e) {
        setItems([]);
        setErr(e?.message || "No se pudieron cargar los productos.");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        load("all");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load(activeFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter]);

    const openDeleteConfirm = (product) => {
        setPendingDelete(product);
    };

    const closeDeleteConfirm = () => {
        if (deletingId) return;
        setPendingDelete(null);
    };

    const confirmDelete = async () => {
        if (!pendingDelete?.id) return;

        setDeletingId(pendingDelete.id);
        setErr("");

        try {
        await adminDelete(pendingDelete.id);
        setPendingDelete(null);
        await load(activeFilter);
        } catch (e) {
        setErr(e?.message || "No se pudo eliminar el producto.");
        } finally {
        setDeletingId("");
        }
    };

    const filterLabel = useMemo(
        () => FILTERS.find((f) => f.value === activeFilter)?.label || "Todos",
        [activeFilter]
    );

    return (
        <main className={styles.page}>
        <Container className={styles.wrap}>
            <header className={styles.head}>
            <div className={styles.headInfo}>
                <div className={styles.badgeWrap}>
                <Badge variant="lavender">Admin</Badge>
                </div>

                <h1 className={styles.title}>Productos</h1>
                <p className={styles.sub}>Gestioná tus productos.</p>
            </div>

            <div className={styles.headActions}>
                <div className={styles.filterBox}>
                <span className={styles.filterLabel}>Mostrar:</span>

                <select
                    className={styles.select}
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

                <Link to="/admin/productos/nuevo" className={styles.linkReset}>
                <Button variant="ghost" size="sm" className={styles.primaryBtn}>
                    Nuevo producto
                </Button>
                </Link>
            </div>
            </header>

            <div className={styles.filterState}>
            Filtro actual: <b>{filterLabel}</b>
            </div>

            {err ? (
            <Card className={styles.errorCard}>
                <p className={styles.errorText}>{err}</p>
            </Card>
            ) : null}

            {loading ? (
            <Card className={styles.stateCard}>
                <p className={styles.stateText}>Cargando…</p>
            </Card>
            ) : items.length === 0 ? (
            <Card className={styles.stateCard}>
                <p className={styles.stateText}>No hay productos para este filtro.</p>
            </Card>
            ) : (
            <section className={styles.grid}>
                {items.map((p) => {
                const images = toImages(p);
                const cover = images[0] || "";

                const sizes = getSizesFromVariants(p?.variants);
                const priceFrom = minPriceFromVariants(p?.variants);
                const stockTotal = totalStockFromVariants(p?.variants);

                return (
                    <Card key={p.id} className={styles.card}>
                    <div className={styles.imageWrap}>
                        <ImageBox src={cover} alt={p.name} />
                    </div>

                    <div className={styles.cardTop}>
                        <div className={styles.info}>
                        <div className={styles.name}>{p.name}</div>

                        <div className={styles.meta}>
                            Talles: {formatSizes(sizes)}
                        </div>

                        <div className={styles.meta}>
                            Stock: {stockTotal === null ? "-" : String(stockTotal)}
                            {" · "}
                            Estado: {p.active === false ? "Inactivo" : "Activo"}
                        </div>

                        <div className={styles.meta}>
                            Imágenes: {images.length}
                        </div>
                        </div>

                        <div className={styles.price}>
                        {priceFrom === null
                            ? "-"
                            : `Desde $${priceFrom.toLocaleString("es-AR")}`}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link
                        to={`/admin/productos/${p.id}/editar`}
                        className={styles.linkReset}
                        >
                        <Button variant="ghost" className={styles.actionBtn}>
                            Editar
                        </Button>
                        </Link>

                        <Button
                        variant="ghost"
                        className={styles.actionBtnDanger}
                        onClick={() => openDeleteConfirm(p)}
                        >
                        Eliminar
                        </Button>
                    </div>
                    </Card>
                );
                })}
            </section>
            )}

            {pendingDelete ? (
            <div
                className={styles.modalOverlay}
                onClick={closeDeleteConfirm}
                role="presentation"
            >
                <div
                className={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-product-title"
                >
                <div className={styles.modalBadgeWrap}>
                    <Badge variant="orange">Confirmación</Badge>
                </div>

                <div className={styles.modalHead}>
                    <h2 id="delete-product-title" className={styles.modalTitle}>
                    ¿Eliminar producto?
                    </h2>

                    <p className={styles.modalText}>
                    Vas a eliminar{" "}
                    <strong>{pendingDelete.name || "este producto"}</strong>.
                    Esta acción puede ser irreversible.
                    </p>
                </div>

                <div className={styles.modalActions}>
                    <Button
                    type="button"
                    variant="ghost"
                    className={styles.modalCancelBtn}
                    onClick={closeDeleteConfirm}
                    disabled={Boolean(deletingId)}
                    >
                    Cancelar
                    </Button>

                    <Button
                    type="button"
                    variant="ghost"
                    className={styles.modalDeleteBtn}
                    onClick={confirmDelete}
                    disabled={Boolean(deletingId)}
                    >
                    {deletingId ? "Eliminando…" : "Sí, eliminar"}
                    </Button>
                </div>
                </div>
            </div>
            ) : null}
        </Container>
        </main>
    );
}