import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ImageBox from "../../components/ui/ImageBox";

import {
    adminCreate,
    adminUpdate,
    adminGetById,
    adminAdjustStock,
} from "../../services/productsApi";
import { mediaUploadOne } from "../../services/apiMedia";
import styles from "./AdminProductoForm.module.css";

const TALLES = ["1", "2", "3", "4", "5"];
const UNICO = "U";
const MAX_IMAGES = 5;
const PRODUCTS_FOLDER = "risas-colores/web/products";

const normalizeSize = (s) => {
    const raw = String(s ?? "").trim();
    if (!raw) return "";
    const low = raw.toLowerCase();
    if (low === "único" || low === "unico" || raw === "U") return "U";
    return raw;
};

const cleanUrls = (arr) =>
    (Array.isArray(arr) ? arr : [])
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .slice(0, MAX_IMAGES);

const buildVariantsForSizes = (sizes, fromVariants = []) => {
    const map = new Map(
        (Array.isArray(fromVariants) ? fromVariants : [])
        .map((v) => {
            const size = normalizeSize(v?.size);
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
        const price = v.price;
        const stock = v.stock;

        return {
        size,
        price:
            price === "" || price === null || price === undefined ? "" : String(price),
        stock:
            stock === "" || stock === null || stock === undefined ? "" : String(stock),
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

    const [stockDelta, setStockDelta] = useState({});
    const [stockReason, setStockReason] = useState("");
    const [stockApplying, setStockApplying] = useState(false);
    const [stockErr, setStockErr] = useState("");
    const [pendingStockAdjust, setPendingStockAdjust] = useState(null);

    const [sizeMode, setSizeMode] = useState("numeric");
    const sizes = useMemo(() => (sizeMode === "unico" ? [UNICO] : TALLES), [sizeMode]);

    const [form, setForm] = useState({
        name: "",
        description: "",
        active: true,
        avatar: [],
        variants: buildVariantsForSizes(TALLES),
    });

    const loadProduct = async () => {
        if (!editing) return null;
        const found = await adminGetById(id);
        if (!found) return null;

        const avatarArr = cleanUrls(found.avatar);

        const foundSizes = Array.from(
        new Set(
            (Array.isArray(found.variants) ? found.variants : [])
            .map((v) => normalizeSize(v?.size))
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

        return found;
    };

    useEffect(() => {
        if (!editing) return;

        let alive = true;
        setLoading(true);

        loadProduct()
        .catch(() => {})
        .finally(() => {
            if (!alive) return;
            setLoading(false);
        });

        return () => {
        alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing, id]);

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
            vErrors.push(`Precio obligatorio en talle ${size === "U" ? "Único" : size}`);
        } else if (Number.isNaN(Number(price))) {
            vErrors.push(`Precio inválido en talle ${size === "U" ? "Único" : size}`);
        }

        if (stock === "" || stock === null || stock === undefined) {
            vErrors.push(`Stock obligatorio en talle ${size === "U" ? "Único" : size}`);
        } else if (Number.isNaN(Number(stock))) {
            vErrors.push(`Stock inválido en talle ${size === "U" ? "Único" : size}`);
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

    const openStockAdjustConfirm = (size) => {
        if (!editing) return;

        setStockErr("");
        const raw = String(stockDelta[size] ?? "").trim();
        const n = Number(raw);

        if (!Number.isFinite(n) || !Number.isInteger(n) || n === 0) {
        setStockErr("El ajuste debe ser un entero distinto de 0 (ej: +5 o -2).");
        return;
        }

        setPendingStockAdjust({
        size,
        delta: n,
        labelSize: size === "U" ? "Único" : size,
        });
    };

    const closeStockAdjustConfirm = () => {
        if (stockApplying) return;
        setPendingStockAdjust(null);
    };

    const confirmStockAdjust = async () => {
        if (!editing || !pendingStockAdjust) return;

        try {
        setStockApplying(true);
        await adminAdjustStock(id, {
            size: pendingStockAdjust.size,
            delta: pendingStockAdjust.delta,
            reason: stockReason,
        });

        await loadProduct();

        setStockDelta((p) => ({ ...p, [pendingStockAdjust.size]: "" }));
        setStockReason("");
        setPendingStockAdjust(null);
        } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
            navigate("/admin/login", {
            replace: true,
            state: { from: `/admin/productos/${id}/editar` },
            });
            return;
        }
        setStockErr(err?.message || "Error aplicando ajuste de stock");
        } finally {
        setStockApplying(false);
        }
    };

    return (
        <main className={styles.page}>
        <Container className={styles.wrap}>
            <header className={styles.head}>
            <div className={styles.headInfo}>
                <div className={styles.badgeWrap}>
                <Badge variant="lavender">Admin</Badge>
                </div>

                <h1 className={styles.title}>
                {editing ? "Editar producto" : "Nuevo producto"}
                </h1>
            </div>

            <Link to="/admin/productos" className={styles.linkReset}>
                <Button variant="ghost" size="sm" className={styles.backBtn}>
                ← Volver
                </Button>
            </Link>
            </header>

            {loading ? (
            <Card className={styles.stateCard}>
                <p className={styles.stateText}>Cargando…</p>
            </Card>
            ) : (
            <Card className={styles.card}>
                <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label}>Nombre</label>
                    <input
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    {errors.name && <div className={styles.error}>{errors.name}</div>}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Descripción</label>
                    <textarea
                    className={styles.textarea}
                    value={form.description}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    />
                </div>

                {!editing && (
                    <div className={styles.inlineRow}>
                    <label className={styles.checkRow}>
                        <input
                        type="checkbox"
                        className={styles.check}
                        checked={sizeMode === "unico"}
                        onChange={(e) =>
                            setSizeMode(e.target.checked ? "unico" : "numeric")
                        }
                        />
                        Único (Mochila)
                    </label>
                    </div>
                )}

                <div className={styles.block}>
                    <div className={styles.blockHead}>
                    <div>
                        <div className={styles.label}>Imágenes (máx {MAX_IMAGES})</div>
                        <div className={styles.helper}>
                        Se guardan como URLs en <b>avatar[]</b>.
                        </div>
                    </div>

                    <label className={styles.hiddenInputWrap}>
                        <input
                        type="file"
                        accept="image/*"
                        onChange={onPickFile}
                        disabled={uploading || (form.avatar?.length || 0) >= MAX_IMAGES}
                        className={styles.hiddenInput}
                        id="admin-product-upload"
                        />

                        <Button
                        type="button"
                        variant="ghost"
                        className={styles.secondaryBtn}
                        disabled={uploading || (form.avatar?.length || 0) >= MAX_IMAGES}
                        onClick={() =>
                            document.getElementById("admin-product-upload")?.click()
                        }
                        >
                        {uploading ? "Subiendo…" : "Subir imagen"}
                        </Button>
                    </label>
                    </div>

                    {errors.avatar && <div className={styles.error}>{errors.avatar}</div>}

                    {cover ? (
                    <div className={styles.imagesLayout}>
                        <div>
                        <ImageBox src={cover} alt={form.name || "Producto"} />
                        <div className={styles.helperTop}>Portada = primera imagen</div>
                        </div>

                        <div className={styles.imagesSide}>
                        <div className={styles.imagesGrid}>
                            {(form.avatar || []).map((url, idx) => (
                            <div key={url + idx} className={styles.thumbCard}>
                                <div className={styles.thumbMedia}>
                                <img
                                    src={url}
                                    alt={`img-${idx + 1}`}
                                    className={styles.thumbImg}
                                />
                                </div>

                                <div className={styles.thumbFoot}>
                                <div className={styles.thumbIndex}>#{idx + 1}</div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className={styles.secondaryBtn}
                                    onClick={() => removeAvatarAt(idx)}
                                >
                                    Quitar
                                </Button>
                                </div>
                            </div>
                            ))}
                        </div>

                        <div className={styles.helper}>
                            Podés quitar la imagen y volver a subirla.
                        </div>
                        </div>
                    </div>
                    ) : (
                    <div className={styles.emptyText}>
                        Todavía no hay imágenes cargadas.
                    </div>
                    )}
                </div>

                <div className={styles.block}>
                    <div className={styles.label}>
                    Editá precio y stock por talle{" "}
                    {sizeMode === "unico" ? "(Único)" : "(1–5)"}
                    </div>

                    {errors.variants && <div className={styles.error}>{errors.variants}</div>}

                    <div className={styles.variantsBox}>
                    <div className={styles.variantsHead}>
                        <div>Talle</div>
                        <div>Precio</div>
                        <div>Stock</div>
                        <div>Ajuste (+/-)</div>
                        <div></div>
                    </div>

                    <div className={styles.variantsList}>
                        {sizes.map((size) => {
                        const row = form.variants.find((v) => v.size === size) || {
                            price: "",
                            stock: "",
                        };
                        const labelSize = size === "U" ? "Único" : size;

                        return (
                            <div key={size} className={styles.variantRow}>
                            <div className={styles.variantTitle}>{labelSize}</div>

                            <div className={styles.variantCell}>
                                <div className={styles.mobileLabel}>Precio</div>
                                <input
                                className={styles.input}
                                value={row.price}
                                onChange={(e) =>
                                    setVariantField(size, "price", e.target.value)
                                }
                                placeholder="8500"
                                />
                            </div>

                            <div className={styles.variantCell}>
                                <div className={styles.mobileLabel}>Stock</div>

                                {!editing ? (
                                <input
                                    className={styles.input}
                                    value={row.stock}
                                    onChange={(e) =>
                                    setVariantField(size, "stock", e.target.value)
                                    }
                                    placeholder="10"
                                />
                                ) : (
                                <input
                                    className={styles.inputReadOnly}
                                    value={row.stock}
                                    readOnly
                                    tabIndex={-1}
                                />
                                )}
                            </div>

                            <div className={styles.variantCell}>
                                <div className={styles.mobileLabel}>Ajuste (+/-)</div>

                                {editing ? (
                                <input
                                    className={styles.input}
                                    value={stockDelta[size] ?? ""}
                                    onChange={(e) =>
                                    setStockDelta((p) => ({
                                        ...p,
                                        [size]: e.target.value,
                                    }))
                                    }
                                    placeholder="+5 o -2"
                                />
                                ) : (
                                <div className={styles.inlineMuted}>
                                    (Disponible al editar)
                                </div>
                                )}
                            </div>

                            <div className={styles.variantAction}>
                                {editing ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className={styles.secondaryBtnWide}
                                    disabled={stockApplying}
                                    onClick={() => openStockAdjustConfirm(size)}
                                >
                                    {stockApplying ? "Aplicando…" : "Aplicar"}
                                </Button>
                                ) : (
                                <div />
                                )}
                            </div>

                            {editing ? (
                                <div className={styles.reasonWrap}>
                                <div className={styles.mobileLabel}>
                                    Motivo (opcional)
                                </div>
                                <input
                                    className={styles.input}
                                    value={stockReason}
                                    onChange={(e) => setStockReason(e.target.value)}
                                    placeholder="Ej: reposición, ajuste inventario, etc."
                                />
                                </div>
                            ) : null}
                            </div>
                        );
                        })}
                    </div>

                    {editing ? (
                        <div className={styles.variantsFoot}>
                        <b>Ajuste</b> de <b>STOCK</b> queda registrado en el historial.
                        </div>
                    ) : (
                        <div className={styles.variantsFoot}>
                        En la creación cargás el <b>stock inicial</b>. Luego se ajusta por
                        movimientos.
                        </div>
                    )}
                    </div>

                    {stockErr ? <div className={styles.error}>{stockErr}</div> : null}
                </div>

                <div className={styles.footerActions}>
                    <label className={styles.checkRow}>
                    <input
                        type="checkbox"
                        className={styles.check}
                        checked={form.active}
                        onChange={(e) =>
                        setForm((p) => ({ ...p, active: e.target.checked }))
                        }
                    />
                    Activo
                    </label>

                    <Button
                    type="submit"
                    variant="ghost"
                    className={styles.primaryBtn}
                    disabled={saving}
                    >
                    {saving ? "Guardando…" : "Guardar"}
                    </Button>
                </div>
                </form>
            </Card>
            )}

            {pendingStockAdjust ? (
            <div
                className={styles.modalOverlay}
                onClick={closeStockAdjustConfirm}
                role="presentation"
            >
                <div
                className={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="stock-adjust-title"
                >
                <div className={styles.modalBadgeWrap}>
                    <Badge variant="orange">Confirmación</Badge>
                </div>

                <div className={styles.modalHead}>
                    <h2 id="stock-adjust-title" className={styles.modalTitle}>
                    ¿Aplicar ajuste de stock?
                    </h2>

                    <p className={styles.modalText}>
                    Vas a aplicar un ajuste de{" "}
                    <strong>
                        {pendingStockAdjust.delta > 0 ? "+" : ""}
                        {pendingStockAdjust.delta}
                    </strong>{" "}
                    en el talle <strong>{pendingStockAdjust.labelSize}</strong>.
                    </p>

                    {stockReason ? (
                    <p className={styles.modalNote}>
                        Motivo: <strong>{stockReason}</strong>
                    </p>
                    ) : (
                    <p className={styles.modalNote}>No agregaste motivo.</p>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <Button
                    type="button"
                    variant="ghost"
                    className={styles.modalCancelBtn}
                    onClick={closeStockAdjustConfirm}
                    disabled={stockApplying}
                    >
                    Cancelar
                    </Button>

                    <Button
                    type="button"
                    variant="ghost"
                    className={styles.modalConfirmBtn}
                    onClick={confirmStockAdjust}
                    disabled={stockApplying}
                    >
                    {stockApplying ? "Aplicando…" : "Sí, aplicar"}
                    </Button>
                </div>
                </div>
            </div>
            ) : null}
        </Container>
        </main>
    );
}