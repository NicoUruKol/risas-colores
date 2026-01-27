// VUELA POR EL BACKEND
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { adminCreate, adminUpdate, adminList } from "../../services/productsApi";

const TALLES = ["1", "2", "3", "4", "5"];

const isValidUrlOrPath = (s) => {
    const v = String(s || "").trim();
    if (!v) return false;
    if (v.startsWith("/")) return true; // /img/...
    try {
        new URL(v);
        return true;
    } catch {
        return false;
    }
    };

    export default function AdminProductoForm() {
    const { id } = useParams();
    const editing = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        image: "",
        stock: "",
        talles: ["1"],
        active: true,
    });

    useEffect(() => {
        if (!editing) return;

        let alive = true;
        setLoading(true);

        adminList().then((all) => {
        if (!alive) return;
        const found = all.find((p) => p.id === id);

        if (found) {
            setForm({
            name: found.name ?? "",
            description: found.description ?? "",
            price: String(found.price ?? ""),
            image: found.image ?? "",
            stock: String(found.stock ?? ""),
            talles: Array.isArray(found.talles) && found.talles.length ? found.talles : ["1"],
            active: found.active !== false,
            });
        }

        setLoading(false);
        });

        return () => {
        alive = false;
        };
    }, [editing, id]);

    const isUnico = useMemo(() => form.talles.includes("Único"), [form.talles]);

    const setUnico = (checked) => {
        setForm((p) => ({ ...p, talles: checked ? ["Único"] : ["1"] }));
    };

    const toggleTalle = (t) => {
        setForm((prev) => {
        const has = prev.talles.includes(t);
        const next = has ? prev.talles.filter((x) => x !== t) : [...prev.talles, t];
        return { ...prev, talles: next.length ? next : ["1"] };
        });
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Obligatorio";
        if (!String(form.price).trim()) e.price = "Obligatorio";
        if (String(form.price).trim() && Number.isNaN(Number(form.price))) e.price = "Debe ser número";
        if (!form.image.trim()) e.image = "Obligatorio";
        if (form.image.trim() && !isValidUrlOrPath(form.image)) e.image = "URL inválida (o /img/...)";
        if (!Array.isArray(form.talles) || form.talles.length === 0) e.talles = "Elegí talles (1–5) o Único";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;

        setSaving(true);

        const payload = {
        type: "product",
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: form.image.trim(),
        stock: form.stock === "" ? 0 : Number(form.stock),
        talles: isUnico ? ["Único"] : form.talles.filter((t) => TALLES.includes(t)),
        active: Boolean(form.active),
        };

        if (editing) await adminUpdate(id, payload);
        else await adminCreate(payload);

        setSaving(false);
        navigate("/admin/productos");
    };

    return (
        <main className="py-10">
        <Container className="grid gap-6 max-w-[900px]">
            <div className="flex items-center justify-between gap-4">
            <div>
                <Badge variant="lavender">Admin</Badge>
                <h1 className="text-2xl font-extrabold text-ui-text mt-2">
                {editing ? "Editar producto" : "Nuevo producto"}
                </h1>
            </div>

            <Link to="/admin/productos">
                <Button variant="ghost" size="sm">← Volver</Button>
            </Link>
            </div>

            {loading ? (
            <Card className="p-5">
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : (
            <Card className="p-5">
                <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Nombre</label>
                    <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    {errors.name && <div className="text-xs text-red-500">{errors.name}</div>}
                </div>

                <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Descripción</label>
                    <textarea
                    className="min-h-[96px] p-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Precio</label>
                    <input
                        className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    />
                    {errors.price && <div className="text-xs text-red-500">{errors.price}</div>}
                    </div>

                    <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Stock</label>
                    <input
                        className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                        value={form.stock}
                        onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                    />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Imagen (URL o /img/...)</label>
                    <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={form.image}
                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    />
                    {errors.image && <div className="text-xs text-red-500">{errors.image}</div>}
                </div>

                <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Talles</label>

                    <label className="flex items-center gap-2 text-sm text-ui-text">
                    <input type="checkbox" checked={isUnico} onChange={(e) => setUnico(e.target.checked)} />
                    Único (para mochila)
                    </label>

                    <div className={`flex flex-wrap gap-2 ${isUnico ? "opacity-50 pointer-events-none" : ""}`}>
                    {TALLES.map((t) => (
                        <button
                        key={t}
                        type="button"
                        className={`px-3 h-10 rounded-md border border-ui-border text-sm ${
                            form.talles.includes(t) ? "font-bold" : ""
                        }`}
                        onClick={() => toggleTalle(t)}
                        >
                        {t}
                        </button>
                    ))}
                    </div>

                    {errors.talles && <div className="text-xs text-red-500">{errors.talles}</div>}
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm text-ui-text">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                    />
                    Activo
                    </label>

                    <Button variant="primary" disabled={saving}>
                    {saving ? "Guardando…" : "Guardar"}
                    </Button>
                </div>
                </form>
            </Card>
            )}
        </Container>
        </main>
    );
}
