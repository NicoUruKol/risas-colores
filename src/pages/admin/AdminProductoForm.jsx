import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ImageBox from "../../components/ui/ImageBox";

import { adminCreate, adminUpdate, adminGetById } from "../../services/productsApi";
import { mediaUploadOne } from "../../services/apiMedia";

const TALLES = ["1", "2", "3", "4", "5"];
const UNICO = "U";
const MAX_IMAGES = 5;
const PRODUCTS_FOLDER = "risas-colores/web/products";

const cleanUrls = (arr) =>
    (Array.isArray(arr) ? arr : [])
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .slice(0, MAX_IMAGES);

const buildVariantsForSizes = (sizes, fromVariants = []) => {
    const map = new Map(
        (Array.isArray(fromVariants) ? fromVariants : [])
        .map((v) => {
            const size = String(v?.size ?? "").trim();
            if (!size) return null;
            return [
            size,
            {
                size,
                price: v?.price ?? "",
                stock: v?.stock ?? "",
            },
            ];
        })
        .filter(Boolean)
    );

    return sizes.map((size) => {
        const v = map.get(size) || {};
        return {
        size,
        price: v.price === "" ? "" : String(v.price),
        stock: v.stock === "" ? "" : String(v.stock),
        };
    });
};

export default function AdminProductoForm() {
    const { id } = useParams();
    const editing = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});

    // modo talles: "numeric" (1-5) o "unico"
    const [sizeMode, setSizeMode] = useState("numeric");

    const sizes = useMemo(
        () => (sizeMode === "unico" ? [UNICO] : TALLES),
        [sizeMode]
    );

    const [form, setForm] = useState({
        name: "",
        description: "",
        active: true,
        avatar: [],
        variants: buildVariantsForSizes(TALLES),
    });

    useEffect(() => {
        if (!editing) return;

        let alive = true;
        setLoading(true);

        adminGetById(id)
        .then((found) => {
        if (!alive) return;
        if (!found) return;

            const avatarArr = cleanUrls(found.avatar);

            const foundSizes = Array.from(
            new Set(
                (Array.isArray(found.variants) ? found.variants : [])
                .map((v) => String(v?.size ?? "").trim())
                .filter(Boolean)
            )
            );

            const isUnico = foundSizes.includes(UNICO);
            const nextMode = isUnico ? "unico" : "numeric";
            const nextSizes = isUnico ? [UNICO] : TALLES;

            setSizeMode(nextMode);

            setForm({
            name: found.name ?? "",
            description: found.description ?? "",
            active: found.active !== false,
            avatar: avatarArr,
            variants: buildVariantsForSizes(nextSizes, found.variants),
            });
        })
        .finally(() => {
            if (!alive) return;
            setLoading(false);
        });

        return () => {
        alive = false;
        };
    }, [editing, id]);

    // si cambia el modo (solo relevante al crear), re-armo variants preservando lo que se pueda
    useEffect(() => {
        if (editing) return;
        setForm((prev) => ({
        ...prev,
        variants: buildVariantsForSizes(sizes, prev.variants),
        }));
    }, [sizes, editing]);

    const cover = useMemo(() => {
        const a = Array.isArray(form.avatar) ? form.avatar : [];
        return a[0] || "";
    }, [form.avatar]);

    const setVariantField = (size, field, value) => {
        setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((v) =>
            v.size === size ? { ...v, [field]: value } : v
        ),
        }));
    };

    const validate = () => {
        const e = {};

        if (!String(form.name).trim()) e.name = "Obligatorio";

        const avatars = cleanUrls(form.avatar);
        if (avatars.length === 0) e.avatar = "Subí al menos 1 imagen";
        if (avatars.length > MAX_IMAGES) e.avatar = `Máximo ${MAX_IMAGES} imágenes`;

        const vErrors = [];
        sizes.forEach((size) => {
        const row = form.variants.find((v) => v.size === size);
        const price = row?.price;
        const stock = row?.stock;

        if (price === "" || price === null || price === undefined) {
            vErrors.push(`Precio obligatorio en talle ${size}`);
        } else if (Number.isNaN(Number(price))) {
            vErrors.push(`Precio inválido en talle ${size}`);
        }

        if (stock === "" || stock === null || stock === undefined) {
            vErrors.push(`Stock obligatorio en talle ${size}`);
        } else if (Number.isNaN(Number(stock))) {
            vErrors.push(`Stock inválido en talle ${size}`);
        }
        });

        if (vErrors.length) e.variants = vErrors[0];

        return e;
    };

    const onPickFile = async (ev) => {
        const file = ev.target.files?.[0];
        ev.target.value = "";
        if (!file) return;

        if ((form.avatar?.length || 0) >= MAX_IMAGES) {
        setErrors((p) => ({ ...p, avatar: `Máximo ${MAX_IMAGES} imágenes` }));
        return;
        }

        try {
        setUploading(true);
        const uploaded = await mediaUploadOne(PRODUCTS_FOLDER, file);
        const url = uploaded?.url ? String(uploaded.url).trim() : "";
        if (!url) throw new Error("No llegó url desde Cloudinary");

        setForm((prev) => ({
            ...prev,
            avatar: [...cleanUrls(prev.avatar), url].slice(0, MAX_IMAGES),
        }));

        setErrors((p) => ({ ...p, avatar: undefined }));
        } catch (err) {
        setErrors((p) => ({
            ...p,
            avatar: err?.message || "Error subiendo imagen",
        }));
        } finally {
        setUploading(false);
        }
    };

    const removeAvatarAt = (idx) => {
        setForm((prev) => ({
        ...prev,
        avatar: (prev.avatar || []).filter((_, i) => i !== idx),
        }));
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;

        setSaving(true);

        const payload = {
        category: "prenda",
        name: String(form.name).trim(),
        description: String(form.description || "").trim(),
        active: Boolean(form.active),
        avatar: cleanUrls(form.avatar),
        variants: sizes.map((size) => {
            const row = form.variants.find((v) => v.size === size) || {};
            return {
            size,
            price: Number(row.price),
            stock: Number(row.stock),
            };
        }),
        };

        try {
        if (editing) await adminUpdate(id, payload);
        else await adminCreate(payload);
        navigate("/admin/productos");
        } finally {
        setSaving(false);
        }
    };

    return (
        <main className="py-10">
        <Container className="grid gap-6 max-w-[980px]">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
            <div>
                <Badge variant="lavender">Admin</Badge>
                <h1 className="text-2xl font-extrabold text-ui-text mt-2">
                {editing ? "Editar producto" : "Nuevo producto"}
                </h1>
            </div>

            <Link to="/admin/productos">
                <Button variant="ghost" size="sm" className="text-black border-black">
                ← Volver
                </Button>
            </Link>
            </div>

            {loading ? (
            <Card className="p-5">
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : (
            <Card className="p-5">
                <form className="grid gap-5" onSubmit={handleSubmit}>
                {/* Nombre */}
                <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Nombre</label>
                    <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    {errors.name && <div className="text-xs text-red-500">{errors.name}</div>}
                </div>

                {/* Descripción */}
                <div className="grid gap-2">
                    <label className="text-sm text-ui-muted">Descripción</label>
                    <textarea
                    className="min-h-[96px] p-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={form.description}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    />
                </div>

                {/* Modo talles (solo al crear) */}
                {!editing && (
                    <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-ui-text">
                        <input
                        type="checkbox"
                        checked={sizeMode === "unico"}
                        onChange={(e) => setSizeMode(e.target.checked ? "unico" : "numeric")}
                        />
                        Único (Mochila)
                    </label>
                    </div>
                )}

                {/* Imágenes */}
                <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-sm text-ui-muted">Imágenes (máx {MAX_IMAGES})</div>
                        <div className="text-xs text-ui-muted">
                        Se guardan como URLs en <b>avatar[]</b>.
                        </div>
                    </div>

                    <label className="inline-flex items-center gap-2">
                        <input
                        type="file"
                        accept="image/*"
                        onChange={onPickFile}
                        disabled={uploading || (form.avatar?.length || 0) >= MAX_IMAGES}
                        style={{ display: "none" }}
                        id="admin-product-upload"
                        />
                        <Button
                        type="button"
                        variant="ghost"
                        className="text-black border-black"
                        disabled={uploading || (form.avatar?.length || 0) >= MAX_IMAGES}
                        onClick={() => document.getElementById("admin-product-upload")?.click()}
                        >
                        {uploading ? "Subiendo…" : "Subir imagen"}
                        </Button>
                    </label>
                    </div>

                    {errors.avatar && <div className="text-xs text-red-500">{errors.avatar}</div>}

                    {cover ? (
                    <div className="grid gap-3 md:grid-cols-[240px_1fr]">
                        <div>
                        <ImageBox src={cover} alt={form.name || "Producto"} />
                        <div className="text-xs text-ui-muted mt-2">Portada = primera imagen</div>
                        </div>

                        <div className="grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {(form.avatar || []).map((url, idx) => (
                            <div
                                key={url + idx}
                                className="rounded-md border border-ui-border p-2 bg-ui-surface"
                            >
                                <div className="rounded-md overflow-hidden">
                                <img
                                    src={url}
                                    alt={`img-${idx + 1}`}
                                    className="w-full h-32 object-cover"
                                />
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                <div className="text-xs text-ui-muted truncate">#{idx + 1}</div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-black border-black"
                                    onClick={() => removeAvatarAt(idx)}
                                >
                                    Quitar
                                </Button>
                                </div>
                            </div>
                            ))}
                        </div>

                        <div className="text-xs text-ui-muted">
                            Podes quitar la imagen y volver a subirla.
                        </div>
                        </div>
                    </div>
                    ) : (
                    <div className="text-sm text-ui-muted">Todavía no hay imágenes cargadas.</div>
                    )}
                </div>

                {/* Variants */}
                <div className="grid gap-2">
                    <div className="text-sm text-ui-muted">
                    Precio y stock por talle {sizeMode === "unico" ? "(Único)" : "(1–5)"}
                    </div>

                    {errors.variants && <div className="text-xs text-red-500">{errors.variants}</div>}

                    <div className="rounded-md border border-ui-border overflow-hidden">
                    <div className="grid grid-cols-[90px_1fr_1fr] bg-ui-surface p-3 text-xs text-ui-muted">
                        <div>Talle</div>
                        <div>Precio</div>
                        <div>Stock</div>
                    </div>
                    

                    <div className="divide-y divide-ui-border">
                        {sizes.map((size) => {
                        const row =
                            form.variants.find((v) => v.size === size) || {
                            price: "",
                            stock: "",
                            };

                        return (
                            <div
                            key={size}
                            className="grid grid-cols-[90px_1fr_1fr] p-3 gap-3 items-center bg-white/50"
                            >
                            <div className="font-bold text-ui-text">{size}</div>

                            <input
                                className="h-11 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                                value={row.price}
                                onChange={(e) => setVariantField(size, "price", e.target.value)}
                                placeholder="8500"
                            />

                            <input
                                className="h-11 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                                value={row.stock}
                                onChange={(e) => setVariantField(size, "stock", e.target.value)}
                                placeholder="10"
                            />
                            </div>
                            
                        );
                        
                        })}
                    </div>
                    <div className="text-xs text-ui-muted">
                            Para que el talle no sea público poné el stock en "0"
                        </div>
                    </div>
                </div>

                {/* Activo + Guardar */}
                <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm text-ui-text">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                    />
                    Activo
                    </label>

                    <Button
                    type="submit"
                    variant="ghost"
                    className="text-black border-black"
                    disabled={saving}
                    >
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
