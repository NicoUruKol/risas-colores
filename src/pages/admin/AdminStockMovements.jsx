import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

import { adminListStockMovements } from "../../services/stockMovementsApi";
import styles from "./AdminStockMovements.module.css";

const TYPE_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "admin_adjust", label: "Ajuste admin" },
    { value: "order_create", label: "Venta (orden)" },
    { value: "order_cancel", label: "Cancelación (orden)" },
];

const SIZE_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "U", label: "Único" },
];

const LIMIT_OPTIONS = ["50", "100", "200", "300"];

/* ==============================
Utils
============================== */
const toDateString = (ts) => {
    if (!ts) return "-";
    const seconds = ts?.seconds;
    if (typeof seconds === "number") {
        const d = new Date(seconds * 1000);
        return d.toLocaleString("es-AR");
    }
    try {
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString("es-AR");
    } catch {
        return "-";
    }
};

const formatDelta = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "-";
    return v > 0 ? `+${v}` : `${v}`;
};

/* ==============================
Component
============================== */
export default function AdminStockMovements() {
    const nav = useNavigate();
    const loc = useLocation();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [err, setErr] = useState("");

    const [filters, setFilters] = useState({
        productCode: "",
        size: "",
        type: "",
        orderId: "",
        limit: "100",
    });

    const query = useMemo(
        () => ({
        productCode: String(filters.productCode || "").trim(),
        size: filters.size || "",
        type: filters.type || "",
        orderId: String(filters.orderId || "").trim(),
        limit: filters.limit || "100",
        }),
        [filters]
    );

    const load = async (q = query) => {
        setErr("");
        setLoading(true);

        try {
        const data = await adminListStockMovements(q);
        setItems(Array.isArray(data) ? data : []);
        } catch (e) {
        if (e?.status === 401 || e?.status === 403) {
            nav("/admin/login", { replace: true, state: { from: loc.pathname } });
            return;
        }
        setErr(e?.message || "Error cargando movimientos");
        setItems([]);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        load(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = (ev) => {
        ev.preventDefault();
        load(query);
    };

    const onClear = () => {
        const next = {
        productCode: "",
        size: "",
        type: "",
        orderId: "",
        limit: "100",
        };
        setFilters(next);
        load(next);
    };

    return (
        <main className={styles.page}>
        <Container className={styles.wrap}>
            <header className={styles.head}>
            <div className={styles.headInfo}>
                <div className={styles.badgeWrap}>
                <Badge variant="lavender">Admin</Badge>
                </div>

                <h1 className={styles.title}>Movimientos de stock</h1>
                <p className={styles.sub}>
                Historial de ajustes y movimientos por producto/talle.
                </p>
            </div>

            <Link to="/admin/productos" className={styles.linkReset}>
                <Button variant="ghost" className={styles.headerBtn}>
                Ver productos
                </Button>
            </Link>
            </header>

            <Card className={styles.filtersCard}>
            <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.filtersRow}>
                <div className={`${styles.field} ${styles.wCode}`}>
                    <label className={styles.label}>Producto (código)</label>
                    <input
                    className={styles.input}
                    value={filters.productCode}
                    onChange={(e) =>
                        setFilters((p) => ({ ...p, productCode: e.target.value }))
                    }
                    placeholder="010"
                    />
                </div>

                <div className={`${styles.field} ${styles.wSize}`}>
                    <label className={styles.label}>Talle</label>
                    <select
                    className={styles.input}
                    value={filters.size}
                    onChange={(e) =>
                        setFilters((p) => ({ ...p, size: e.target.value }))
                    }
                    >
                    {SIZE_OPTIONS.map((o) => (
                        <option key={o.value || "all"} value={o.value}>
                        {o.label}
                        </option>
                    ))}
                    </select>
                </div>

                <div className={`${styles.field} ${styles.wType}`}>
                    <label className={styles.label}>Tipo</label>
                    <select
                    className={styles.input}
                    value={filters.type}
                    onChange={(e) =>
                        setFilters((p) => ({ ...p, type: e.target.value }))
                    }
                    >
                    {TYPE_OPTIONS.map((o) => (
                        <option key={o.value || "all"} value={o.value}>
                        {o.label}
                        </option>
                    ))}
                    </select>
                </div>

                <div className={`${styles.field} ${styles.wOrder}`}>
                    <label className={styles.label}>Order ID</label>
                    <input
                    className={styles.input}
                    value={filters.orderId}
                    onChange={(e) =>
                        setFilters((p) => ({ ...p, orderId: e.target.value }))
                    }
                    placeholder="opcional"
                    />
                </div>

                <div className={`${styles.field} ${styles.wLimit}`}>
                    <label className={styles.label}>Límite</label>
                    <select
                    className={styles.input}
                    value={filters.limit}
                    onChange={(e) =>
                        setFilters((p) => ({ ...p, limit: e.target.value }))
                    }
                    >
                    {LIMIT_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                        {n}
                        </option>
                    ))}
                    </select>
                </div>
                </div>

                <div className={styles.actions}>
                <Button
                    type="button"
                    variant="ghost"
                    className={styles.clearBtn}
                    onClick={onClear}
                >
                    Limpiar
                </Button>

                <Button
                    type="submit"
                    variant="ghost"
                    disabled={loading}
                    className={styles.searchBtn}
                >
                    {loading ? "Buscando…" : "Buscar"}
                </Button>
                </div>

                {err ? <div className={styles.error}>{err}</div> : null}
            </form>
            </Card>

            {loading ? (
            <Card className={styles.stateCard}>
                <p className={styles.stateText}>Cargando…</p>
            </Card>
            ) : items.length === 0 ? (
            <Card className={styles.stateCard}>
                <p className={styles.stateText}>No hay movimientos para esos filtros.</p>
            </Card>
            ) : (
            <>
                <Card className={styles.tableWrap}>
                <div className={styles.tableHead}>
                    <div>Fecha</div>
                    <div>Producto</div>
                    <div>Talle</div>
                    <div>Delta</div>
                    <div>Stock</div>
                    <div>Detalle</div>
                </div>

                <div>
                    {items.map((m) => (
                    <div key={m.id} className={styles.tableRow}>
                        <div className={styles.tableText}>{toDateString(m.createdAt)}</div>
                        <div className={`${styles.bold} ${styles.tableText}`}>
                        {m.productCode || "-"}
                        </div>
                        <div className={styles.tableText}>
                        {m.size === "U" ? "Único" : m.size || "-"}
                        </div>
                        <div className={styles.tableText}>{formatDelta(m.qtyDelta)}</div>
                        <div className={styles.tableText}>
                        {Number.isFinite(Number(m.stockBefore)) &&
                        Number.isFinite(Number(m.stockAfter))
                            ? `${m.stockBefore} → ${m.stockAfter}`
                            : "-"}
                        </div>
                        <div className={styles.muted}>
                        {m.type || "-"}
                        {m.orderId ? ` · order: ${m.orderId}` : ""}
                        {m.actor ? ` · por: ${m.actor}` : ""}
                        {m.reason ? ` · ${m.reason}` : ""}
                        </div>
                    </div>
                    ))}
                </div>
                </Card>

                <div className={styles.cards}>
                {items.map((m) => (
                    <Card key={m.id} className={styles.mobileCard}>
                    <div className={styles.cardRow}>
                        <div>
                        <div className={styles.muted}>{toDateString(m.createdAt)}</div>
                        <div className={styles.cardTitle}>
                            Producto {m.productCode || "-"} ·{" "}
                            {m.size === "U" ? "Único" : m.size || "-"}
                        </div>
                        </div>

                        <div className={styles.delta}>{formatDelta(m.qtyDelta)}</div>
                    </div>

                    <div className={styles.mobileText}>
                        Stock:{" "}
                        {Number.isFinite(Number(m.stockBefore)) &&
                        Number.isFinite(Number(m.stockAfter))
                        ? `${m.stockBefore} → ${m.stockAfter}`
                        : "-"}
                    </div>

                    <div className={styles.muted}>
                        {m.type || "-"}
                        {m.orderId ? ` · order: ${m.orderId}` : ""}
                        {m.actor ? ` · por: ${m.actor}` : ""}
                    </div>

                    {m.reason ? (
                        <div className={styles.muted}>Motivo: {m.reason}</div>
                    ) : null}
                    </Card>
                ))}
                </div>
            </>
            )}
        </Container>
        </main>
    );
}