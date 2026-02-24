import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import styles from "./AdminGoogleReviews.module.css";

import {
  getGoogleReviewsAdmin,
  createGoogleReview,
  updateGoogleReview,
  setGoogleReviewActive,
  deleteGoogleReview,
} from "../../services/apiGoogleReviews";

const PRESETS = [
    "Hace una semana",
    "Hace 2 semanas",
    "Hace 1 mes",
    "Hace 2 meses",
    "Hace 3 meses",
    "Hace 6 meses",
    "Hace 1 año",
    "Hace 2 años",
    "Otro",
];

function isValidHttpUrl(value) {
    if (!value) return true;
    try {
        const u = new URL(String(value));
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
    }

    function initialForm() {
    return {
        authorName: "",
        authorPhotoUrl: "",
        rating: 5,
        relativePreset: "Hace una semana",
        relativeCustom: "",
        text: "",
        active: true,
    };
}

function getRelativeTime(form) {
    if (form.relativePreset === "Otro") return String(form.relativeCustom || "").trim();
    return String(form.relativePreset || "").trim();
}

export default function AdminGoogleReviews() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("idle"); // idle | saving | error
    const [errors, setErrors] = useState({});
    const [items, setItems] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(() => initialForm());

    const [toast, setToast] = useState(null); // null | { type: "success" | "error", message: string }

    const showToast = (type, message) => {
        setToast({ type, message });
        window.clearTimeout(showToast._t);
        showToast._t = window.setTimeout(() => setToast(null), 2000);
    };

    const sorted = useMemo(() => {
        const arr = Array.isArray(items) ? items : [];
        return [...arr].sort((a, b) => (b?.createdAt?._seconds || 0) - (a?.createdAt?._seconds || 0));
    }, [items]);

    const load = async () => {
        setLoading(true);
        setStatus("idle");
        try {
        const data = await getGoogleReviewsAdmin();
        setItems(data?.items || []);
        } catch {
        setStatus("error");
        showToast("error", "Error al cargar reseñas");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const validate = () => {
        const next = {};
        if (!String(form.authorName || "").trim()) next.authorName = "Ingresá el nombre.";
        const rating = Number(form.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) next.rating = "Rating inválido.";
        const rel = getRelativeTime(form);
        if (!rel) next.relativeTime = "Elegí un tiempo o escribí uno.";
        const text = String(form.text || "").trim();
        if (!text || text.length < 20) next.text = "Mínimo 20 caracteres.";
        if (!isValidHttpUrl(form.authorPhotoUrl)) next.authorPhotoUrl = "URL inválida (http/https).";
        return next;
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(initialForm());
        setErrors({});
        setStatus("idle");
    };

    const startEdit = (it) => {
        const preset = PRESETS.includes(it.relativeTime) ? it.relativeTime : "Otro";
        setEditingId(it.id);

        setForm({
        authorName: it.authorName || "",
        authorPhotoUrl: it.authorPhotoUrl || "",
        rating: Number(it.rating) || 5,
        relativePreset: preset,
        relativeCustom: preset === "Otro" ? it.relativeTime || "" : "",
        text: it.text || "",
        active: it.active !== false,
        });

        setErrors({});
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setStatus("saving");
        try {
        const payload = {
            authorName: String(form.authorName).trim(),
            authorPhotoUrl: String(form.authorPhotoUrl || "").trim(),
            rating: Number(form.rating),
            relativeTime: getRelativeTime(form),
            text: String(form.text).trim(),
            active: !!form.active,
        };

        if (editingId) {
            await updateGoogleReview(editingId, payload);
            showToast("success", "Reseña actualizada");
        } else {
            await createGoogleReview(payload);
            showToast("success", "Reseña creada");
        }

        await load();
        resetForm();
        } catch {
        setStatus("error");
        showToast("error", "Error al guardar");
        } finally {
        setStatus("idle");
        }
    };

    const onToggleActive = async (it) => {
        try {
        await setGoogleReviewActive(it.id, !(it.active !== false));
        await load();
        showToast("success", it.active !== false ? "Reseña desactivada" : "Reseña activada");
        } catch {
        setStatus("error");
        showToast("error", "Error al cambiar estado");
        }
    };

    const onDelete = async (it) => {
        const ok = window.confirm("¿Eliminar esta reseña? No se puede deshacer.");
        if (!ok) return;

        try {
        await deleteGoogleReview(it.id);
        await load();
        if (editingId === it.id) resetForm();
        showToast("success", "Reseña eliminada");
        } catch {
        setStatus("error");
        showToast("error", "Error al eliminar");
        }
    };

    return (
        <main className={styles.page}>
        {toast && (
            <div className={toast.type === "success" ? styles.toastSuccess : styles.toastError} role="status">
            {toast.message}
            </div>
        )}

        <header className={styles.header}>
            <div>
            <h1 className={styles.title}>Reseñas (estilo Google)</h1>
            <p className={styles.subtitle}>CRUD completo + activar/desactivar desde el panel.</p>
            </div>
            <Badge variant="blue">Contenido</Badge>
        </header>

        {status === "error" && (
            <div className={styles.noticeErr} role="alert">
            Error al cargar/guardar. Revisá el backend y el token admin.
            </div>
        )}

        <section className={styles.grid}>
            <Card className={styles.card}>
            <h2 className={styles.h2}>{editingId ? "Editar reseña" : "Nueva reseña"}</h2>

            <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.row2}>
                <label className={styles.field}>
                    <span className={styles.label}>Nombre *</span>
                    <input
                    name="authorName"
                    value={form.authorName}
                    onChange={onChange}
                    className={styles.input}
                    placeholder="Ej: Paula Panizo"
                    />
                    {errors.authorName && <span className={styles.err}>{errors.authorName}</span>}
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Rating *</span>
                    <select name="rating" value={form.rating} onChange={onChange} className={styles.input}>
                    <option value={5}>★★★★★ (5)</option>
                    <option value={4}>★★★★☆ (4)</option>
                    <option value={3}>★★★☆☆ (3)</option>
                    <option value={2}>★★☆☆☆ (2)</option>
                    <option value={1}>★☆☆☆☆ (1)</option>
                    </select>
                    {errors.rating && <span className={styles.err}>{errors.rating}</span>}
                </label>
                </div>

                <div className={styles.row2}>
                <label className={styles.field}>
                    <span className={styles.label}>Tiempo *</span>
                    <select name="relativePreset" value={form.relativePreset} onChange={onChange} className={styles.input}>
                    {PRESETS.map((x) => (
                        <option key={x} value={x}>
                        {x}
                        </option>
                    ))}
                    </select>
                    {errors.relativeTime && <span className={styles.err}>{errors.relativeTime}</span>}
                </label>

                {form.relativePreset === "Otro" ? (
                    <label className={styles.field}>
                    <span className={styles.label}>Especificar *</span>
                    <input
                        name="relativeCustom"
                        value={form.relativeCustom}
                        onChange={onChange}
                        className={styles.input}
                        placeholder="Ej: Hace 10 días"
                    />
                    </label>
                ) : (
                    <div className={styles.fieldGhost} />
                )}
                </div>

                <label className={styles.field}>
                <span className={styles.label}>Foto (URL) (opcional)</span>
                <input
                    name="authorPhotoUrl"
                    value={form.authorPhotoUrl}
                    onChange={onChange}
                    className={styles.input}
                    placeholder="https://..."
                />
                {errors.authorPhotoUrl && <span className={styles.err}>{errors.authorPhotoUrl}</span>}
                </label>

                <label className={styles.field}>
                <span className={styles.label}>Comentario *</span>
                <textarea
                    name="text"
                    value={form.text}
                    onChange={onChange}
                    className={styles.textarea}
                    rows={6}
                    placeholder="Pegá el comentario…"
                />
                {errors.text && <span className={styles.err}>{errors.text}</span>}
                </label>

                <label className={styles.toggle}>
                <input type="checkbox" name="active" checked={form.active} onChange={onChange} />
                <span>Activa</span>
                </label>

                <div className={styles.actions}>
                <button className={styles.btn} type="submit" disabled={status === "saving"}>
                    {editingId ? "Guardar cambios" : "Crear reseña"}
                    <span className={styles.arrow} aria-hidden>
                    →
                    </span>
                </button>

                {editingId ? (
                    <button className={styles.btnGhost} type="button" onClick={resetForm}>
                    Cancelar
                    </button>
                ) : null}
                </div>
            </form>
            </Card>

            <Card className={styles.cardWide}>
            <h2 className={styles.h2}>Reseñas cargadas</h2>

            {loading ? (
                <div className={styles.empty}>Cargando…</div>
            ) : sorted.length === 0 ? (
                <div className={styles.empty}>Todavía no hay reseñas.</div>
            ) : (
                <div className={styles.list}>
                {sorted.map((it) => (
                    <article key={it.id} className={styles.item}>
                    <div className={styles.itemTop}>
                        <div className={styles.person}>
                        <div className={styles.avatar}>
                            {it.authorPhotoUrl ? (
                            <img
                                src={it.authorPhotoUrl}
                                alt=""
                                className={styles.avatarImg}
                                loading="lazy"
                                onError={(e) => {
                                e.currentTarget.style.display = "none";
                                }}
                            />
                            ) : (
                            <span className={styles.avatarFallback}>
                                {String(it.authorName || "?").trim().slice(0, 1).toUpperCase()}
                            </span>
                            )}
                        </div>
                        <div className={styles.personMeta}>
                            <div className={styles.personName}>{it.authorName}</div>
                            <div className={styles.personSub}>
                            {it.rating}⭐ · {it.relativeTime} · {it.active !== false ? "Activa" : "Inactiva"}
                            </div>
                        </div>
                        </div>

                        <div className={styles.itemBtns}>
                        <button className={styles.smallBtn} type="button" onClick={() => onToggleActive(it)}>
                            {it.active !== false ? "Desactivar" : "Activar"}
                        </button>
                        <button className={styles.smallBtn} type="button" onClick={() => startEdit(it)}>
                            Editar
                        </button>
                        <button className={styles.smallBtnDanger} type="button" onClick={() => onDelete(it)}>
                            Eliminar
                        </button>
                        </div>
                    </div>

                    <p className={styles.itemText}>{it.text}</p>
                    </article>
                ))}
                </div>
            )}
            </Card>
        </section>
        </main>
    );
}