import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

import {
    getElJardinGalleryContent,
    saveElJardinGalleryContent,
} from "../../services/apiContent";

import styles from "./AdminGallery.module.css";

const API_BASE = import.meta.env.VITE_API_URL;
const FOLDER = "risas-colores/web/gallery";
const MAX_SELECT = 30;

const joinUrl = (base, path) => {
    const b = String(base || "").replace(/\/+$/, "");
    const p = String(path || "").replace(/^\/+/, "");
    return `${b}/${p}`;
};

const getAdminToken = () =>
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    "";

const authHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const readJson = async (res) => {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
};

const normalizeSavedItems = (data) => {
    const raw = data?.items ?? data?.gallery ?? data?.images ?? data;
    const arr = Array.isArray(raw) ? raw : [];
    return arr
        .map((x) => ({
        public_id: String(x?.public_id || "").trim(),
        url: String(x?.url || "").trim(),
        alt: String(x?.alt || "").trim(),
        }))
        .filter((x) => x.public_id && x.url);
};

export default function AdminGallery() {
    const nav = useNavigate();
    const loc = useLocation();
    const fileRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState("");

    const [library, setLibrary] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);

    const [selected, setSelected] = useState([]);
    const selectedSet = useMemo(
        () => new Set(selected.map((x) => x.public_id)),
        [selected]
    );

    const goLogin = () => {
        nav("/admin/login", { replace: true, state: { from: loc.pathname } });
    };

    const fetchLibrary = async ({ cursor = null, append = false } = {}) => {
        const url =
        `/api/media/list?folder=${encodeURIComponent(FOLDER)}` +
        `&max=60` +
        (cursor ? `&next_cursor=${encodeURIComponent(cursor)}` : "");

        const res = await fetch(joinUrl(API_BASE, url), {
        method: "GET",
        headers: { ...authHeaders() },
        });

        const data = await readJson(res);

        if (!res.ok) {
        const e = new Error(data?.message || `Error HTTP ${res.status}`);
        e.status = res.status;
        throw e;
        }

        const items = Array.isArray(data?.items) ? data.items : [];
        setNextCursor(data?.next_cursor || null);
        setLibrary((prev) => (append ? [...prev, ...items] : items));
    };

    const fetchSaved = async () => {
        const data = await getElJardinGalleryContent();
        const savedItems = normalizeSavedItems(data);
        setSelected(savedItems.slice(0, MAX_SELECT));
    };

    const loadAll = async () => {
        setErr("");
        setLoading(true);
        try {
        await Promise.all([fetchLibrary({ append: false }), fetchSaved()]);
        } catch (e) {
        if (e?.status === 401 || e?.status === 403) return goLogin();
        setErr(e?.message || "Error cargando galería");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleSelect = (item) => {
        const pid = String(item?.public_id || "").trim();
        const url = String(item?.url || "").trim();
        if (!pid || !url) return;

        setSelected((prev) => {
        const exists = prev.some((x) => x.public_id === pid);
        if (exists) return prev.filter((x) => x.public_id !== pid);
        if (prev.length >= MAX_SELECT) return prev;
        return [...prev, { public_id: pid, url, alt: "" }];
        });
    };

    const moveSelected = (pid, dir) => {
        setSelected((prev) => {
        const idx = prev.findIndex((x) => x.public_id === pid);
        if (idx < 0) return prev;
        const to = idx + dir;
        if (to < 0 || to >= prev.length) return prev;
        const next = [...prev];
        const [it] = next.splice(idx, 1);
        next.splice(to, 0, it);
        return next;
        });
    };

    const removeSelected = (pid) => {
        setSelected((prev) => prev.filter((x) => x.public_id !== pid));
    };

    const setAlt = (pid, value) => {
        setSelected((prev) =>
        prev.map((x) =>
            x.public_id === pid ? { ...x, alt: String(value || "") } : x
        )
        );
    };

    const onPickFile = async (ev) => {
        const file = ev.target.files?.[0];
        ev.target.value = "";
        if (!file) return;

        setErr("");
        setUploading(true);

        try {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(
            joinUrl(API_BASE, `/api/media/upload?folder=${encodeURIComponent(FOLDER)}`),
            {
            method: "POST",
            headers: { ...authHeaders() },
            body: fd,
            }
        );

        const data = await readJson(res);

        if (!res.ok) {
            const e = new Error(data?.message || `Error HTTP ${res.status}`);
            e.status = res.status;
            throw e;
        }

        await fetchLibrary({ append: false });
        } catch (e) {
        if (e?.status === 401 || e?.status === 403) return goLogin();
        setErr(e?.message || "Error subiendo imagen");
        } finally {
        setUploading(false);
        }
    };

    const onDeleteCloudinary = async (publicId) => {
        if (!publicId) return;
        const ok = window.confirm("¿Eliminar esta imagen de Cloudinary? (No se puede deshacer)");
        if (!ok) return;

        setErr("");
        try {
        const res = await fetch(
            joinUrl(API_BASE, `/api/media/delete?public_id=${encodeURIComponent(publicId)}`),
            {
            method: "DELETE",
            headers: { ...authHeaders() },
            }
        );

        const data = await readJson(res);

        if (!res.ok) {
            const e = new Error(data?.message || `Error HTTP ${res.status}`);
            e.status = res.status;
            throw e;
        }

        removeSelected(publicId);
        await fetchLibrary({ append: false });
        } catch (e) {
        if (e?.status === 401 || e?.status === 403) return goLogin();
        setErr(e?.message || "Error eliminando imagen");
        }
    };

    const onSave = async () => {
        setErr("");

        if (selected.length === 0) {
        setErr("Seleccioná al menos 1 imagen para la galería.");
        return;
        }

        setSaving(true);
        try {
        const payload = {
            items: selected.slice(0, MAX_SELECT).map((x) => ({
            public_id: x.public_id,
            url: x.url,
            alt: String(x.alt || "").trim() || "Galería del jardín",
            })),
        };

        await saveElJardinGalleryContent(payload);
        } catch (e) {
        if (e?.status === 401 || e?.status === 403) return goLogin();
        setErr(e?.message || "Error guardando galería");
        } finally {
        setSaving(false);
        }
    };

    const loadMore = async () => {
        if (!nextCursor) return;
        setErr("");
        setLoadingMore(true);
        try {
        await fetchLibrary({ cursor: nextCursor, append: true });
        } catch (e) {
        if (e?.status === 401 || e?.status === 403) return goLogin();
        setErr(e?.message || "Error cargando más imágenes");
        } finally {
        setLoadingMore(false);
        }
    };

    return (
        <main className={styles.page}>
        <div className={styles.wrap}>
            {/* Header */}
            <div className={styles.header}>
            <div className={styles.headerLeft}>
                <Badge variant="lavender">Admin</Badge>
                <h1 className={styles.title}>Galería “El Jardín”</h1>
                <p className={styles.sub}>
                Elegí imágenes desde Cloudinary, ordenalas y guardá la selección en Firestore.
                </p>
            </div>

            <div className={styles.headerRight}>
                <Link to="/admin/contenido">
                <Button variant="ghost" className="text-black border-black">
                    ← Volver
                </Button>
                </Link>
            </div>
            </div>

            {err ? (
            <Card className={styles.errorCard}>
                <p className={styles.errorText}>{err}</p>
            </Card>
            ) : null}

            {/* Actions */}
            <Card className={styles.actionsCard}>
            <div className={styles.actionsTop}>
                <div className={styles.meta}>
                <div className={styles.metaRow}>
                    Folder: <b className={styles.metaStrong}>{FOLDER}</b>
                </div>
                <div className={styles.metaRow}>
                    Seleccionadas:{" "}
                    <b className={styles.metaStrong}>
                    {selected.length}/{MAX_SELECT}
                    </b>
                </div>
                </div>

                <div className={styles.actionsBtns}>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onPickFile}
                    style={{ display: "none" }}
                />

                <Button
                    type="button"
                    variant="ghost"
                    className="text-black border-black"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                >
                    {uploading ? "Subiendo…" : "Subir imagen"}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    disabled={saving || selected.length === 0}
                    onClick={onSave}
                >
                    {saving ? "Guardando…" : "Guardar galería"}
                </Button>
                </div>
            </div>

            <div className={styles.tip}>
                Tip: la galería pública usa el <b>orden</b> de la lista “Seleccionadas”.
            </div>
            </Card>

            {loading ? (
            <Card className={styles.loadingCard}>
                <p className={styles.muted}>Cargando…</p>
            </Card>
            ) : (
            <div className={styles.twoCol}>
                {/* Biblioteca */}
                <Card className={styles.panel}>
                <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>Biblioteca (Cloudinary)</div>
                    <Button
                    variant="ghost"
                    className="text-black border-black"
                    onClick={loadAll}
                    type="button"
                    >
                    Refrescar
                    </Button>
                </div>

                {library.length === 0 ? (
                    <p className={styles.muted}>No hay imágenes en el folder.</p>
                ) : (
                    <div className={styles.gridLibrary}>
                    {library.map((it) => {
                        const pid = it.public_id;
                        const isSel = selectedSet.has(pid);

                        return (
                        <article
                            key={pid}
                            className={`${styles.itemCard} ${isSel ? styles.itemCardSelected : ""}`}
                        >
                            <div className={styles.thumb}>
                            <img
                                src={it.url}
                                alt={it.filename || "imagen"}
                                className={styles.thumbImg}
                                loading="lazy"
                                decoding="async"
                            />
                            </div>

                            <div className={styles.itemMeta}>
                            <div className={styles.itemName} title={it.filename || pid}>
                                {it.filename || pid}
                            </div>
                            <div className={styles.itemMark}>{isSel ? "✓ Seleccionada" : " "}</div>
                            </div>

                            <div className={styles.itemActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-black border-black"
                                onClick={() => toggleSelect(it)}
                                disabled={!isSel && selected.length >= MAX_SELECT}
                            >
                                {isSel ? "Quitar" : "Agregar"}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="text-black border-black"
                                onClick={() => onDeleteCloudinary(pid)}
                            >
                                Borrar
                            </Button>
                            </div>
                        </article>
                        );
                    })}
                    </div>
                )}

                {nextCursor ? (
                    <div className={styles.moreWrap}>
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={loadingMore}
                        onClick={loadMore}
                    >
                        {loadingMore ? "Cargando…" : "Cargar más"}
                    </Button>
                    </div>
                ) : null}
                </Card>

                {/* Seleccionadas */}
                <Card className={styles.panel}>
                <div className={styles.panelTitle}>Seleccionadas (orden público)</div>

                {selected.length === 0 ? (
                    <p className={styles.muted}>Todavía no seleccionaste imágenes.</p>
                ) : (
                    <div className={styles.selectedList}>
                    {selected.map((it, idx) => (
                        <article key={it.public_id} className={styles.selectedCard}>
                        <div className={styles.selectedHead}>
                            <div className={styles.selectedIndex}>#{idx + 1}</div>

                            <div className={styles.selectedBtns}>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-black border-black"
                                onClick={() => moveSelected(it.public_id, -1)}
                                disabled={idx === 0}
                            >
                                ↑
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-black border-black"
                                onClick={() => moveSelected(it.public_id, +1)}
                                disabled={idx === selected.length - 1}
                            >
                                ↓
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-black border-black"
                                onClick={() => removeSelected(it.public_id)}
                            >
                                Quitar
                            </Button>
                            </div>
                        </div>

                        <div className={styles.selectedThumb}>
                            <img
                            src={it.url}
                            alt={it.alt || "Galería del jardín"}
                            className={styles.selectedImg}
                            loading="lazy"
                            decoding="async"
                            />
                        </div>

                        <div className={styles.altField}>
                            <label className={styles.altLabel}>Alt (opcional)</label>
                            <input
                            className={styles.altInput}
                            value={it.alt || ""}
                            onChange={(e) => setAlt(it.public_id, e.target.value)}
                            placeholder="Galería del jardín"
                            />
                        </div>
                        </article>
                    ))}
                    </div>
                )}

                <div className={styles.tipSmall}>
                    Guardar escribe en Firestore lo que ves acá (selección + orden).
                </div>
                </Card>
            </div>
            )}
        </div>
        </main>
    );
}