import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

import { mediaList, mediaUploadOne, mediaDelete } from "../../services/apiMedia";
import {
  getHomeHeroContent,
  getElJardinGalleryContent,
  saveHomeHeroContent,
  saveElJardinGalleryContent,
} from "../../services/apiContent";

const FOLDER_HERO = "risas-colores/web/Hero";
const FOLDER_GALLERY = "risas-colores/web/gallery";

const byCreatedDesc = (a, b) => String(b.created_at || "").localeCompare(String(a.created_at || ""));

const normalizeConfigItems = (items) => {
    const arr = Array.isArray(items) ? items : [];
    return arr
        .map((it, idx) => ({
        public_id: String(it?.public_id || "").trim(),
        url: String(it?.url || "").trim(),
        active: it?.active !== false,
        order: Number.isFinite(Number(it?.order)) ? Number(it.order) : idx + 1,
        alt: it?.alt ? String(it.alt) : "",
        }))
        .filter((it) => it.public_id && it.url)
        .sort((a, b) => a.order - b.order);
};

export default function AdminContenido() {
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    // Cloudinary
    const [heroCloud, setHeroCloud] = useState([]);
    const [galleryCloud, setGalleryCloud] = useState([]);

    // Firestore config
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroConfigItems, setHeroConfigItems] = useState([]);

    const [galleryConfigItems, setGalleryConfigItems] = useState([]);

    const heroSelectedMap = useMemo(() => {
        const m = new Map();
        heroConfigItems.forEach((it) => m.set(it.public_id, it));
        return m;
    }, [heroConfigItems]);

    const gallerySelectedMap = useMemo(() => {
        const m = new Map();
        galleryConfigItems.forEach((it) => m.set(it.public_id, it));
        return m;
    }, [galleryConfigItems]);

    const loadAll = async () => {
        setLoading(true);
        try {
        const [heroMedia, galMedia, heroContent, galContent] = await Promise.all([
            mediaList(FOLDER_HERO),
            mediaList(FOLDER_GALLERY),
            getHomeHeroContent(),
            getElJardinGalleryContent(),
        ]);

        setHeroCloud([...heroMedia].sort(byCreatedDesc));
        setGalleryCloud([...galMedia].sort(byCreatedDesc));

        setHeroTitle(heroContent?.title || "");
        setHeroSubtitle(heroContent?.subtitle || "");
        setHeroConfigItems(normalizeConfigItems(heroContent?.items || []));

        setGalleryConfigItems(normalizeConfigItems(galContent?.items || []));
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const toggleSelect = (section, item) => {
        const base = {
        public_id: item.public_id,
        url: item.url,
        active: true,
        order: 9999,
        alt: "",
        };

        if (section === "hero") {
        setHeroConfigItems((prev) => {
            const exists = prev.some((x) => x.public_id === item.public_id);
            if (exists) return prev.filter((x) => x.public_id !== item.public_id);
            const maxOrder = prev.reduce((m, x) => Math.max(m, Number(x.order || 0)), 0);
            return [...prev, { ...base, order: maxOrder + 1 }];
        });
        } else {
        setGalleryConfigItems((prev) => {
            const exists = prev.some((x) => x.public_id === item.public_id);
            if (exists) return prev.filter((x) => x.public_id !== item.public_id);
            const maxOrder = prev.reduce((m, x) => Math.max(m, Number(x.order || 0)), 0);
            return [...prev, { ...base, order: maxOrder + 1 }];
        });
        }
    };

    const moveItem = (section, public_id, dir) => {
        const setter = section === "hero" ? setHeroConfigItems : setGalleryConfigItems;

        setter((prev) => {
        const arr = [...prev].sort((a, b) => a.order - b.order);
        const idx = arr.findIndex((x) => x.public_id === public_id);
        if (idx < 0) return prev;

        const swapIdx = dir === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= arr.length) return prev;

        const a = arr[idx];
        const b = arr[swapIdx];
        const next = [...arr];
        next[idx] = { ...b, order: a.order };
        next[swapIdx] = { ...a, order: b.order };
        return next.sort((x, y) => x.order - y.order);
        });
    };

    const uploadOne = async (section, file) => {
        const folder = section === "hero" ? FOLDER_HERO : FOLDER_GALLERY;
        setBusy(true);
        try {
        await mediaUploadOne(folder, file);
        await loadAll();
        } finally {
        setBusy(false);
        }
    };

    const deleteOne = async (public_id) => {
        setBusy(true);
        try {
        await mediaDelete(public_id);

        // además lo sacamos del config si estaba seleccionado
        setHeroConfigItems((prev) => prev.filter((x) => x.public_id !== public_id));
        setGalleryConfigItems((prev) => prev.filter((x) => x.public_id !== public_id));

        await loadAll();
        } finally {
        setBusy(false);
        }
    };

    const saveHero = async () => {
        setBusy(true);
        try {
        const items = normalizeConfigItems(heroConfigItems).map((it, idx) => ({
            ...it,
            order: idx + 1,
        }));

        await saveHomeHeroContent({
            title: heroTitle,
            subtitle: heroSubtitle,
            items,
        });

        await loadAll();
        } finally {
        setBusy(false);
        }
    };

    const saveGallery = async () => {
        setBusy(true);
        try {
        const items = normalizeConfigItems(galleryConfigItems).map((it, idx) => ({
            ...it,
            order: idx + 1,
        }));

        await saveElJardinGalleryContent({ items });
        await loadAll();
        } finally {
        setBusy(false);
        }
    };

    return (
        <div className="grid gap-4">
        <div className="flex items-start justify-between gap-4">
            <div>
            <Badge variant="lavender">Admin</Badge>
            <h2 className="text-2xl font-extrabold text-ui-text mt-2">Contenido</h2>
            <p className="text-sm text-ui-muted mt-2">
                Hero (imágenes + título/subtítulo) y Galería de “El Jardín”.
            </p>
            </div>
        </div>

        {loading ? (
            <Card className="p-5">
            <p className="text-ui-muted">Cargando…</p>
            </Card>
        ) : (
            <>
            {/* HERO */}
            <Card className="p-5 grid gap-4">
                <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="font-extrabold text-ui-text">Hero</div>
                    <div className="text-sm text-ui-muted">
                    Folder: <span className="font-mono">{FOLDER_HERO}</span>
                    </div>
                </div>

                <label className="inline-flex items-center gap-2">
                    <input
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadOne("hero", f);
                        e.target.value = "";
                    }}
                    />
                </label>
                </div>

                <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Título</label>
                <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                />
                </div>

                <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Subtítulo</label>
                <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                />
                </div>

                <div className="flex items-center justify-between">
                <div className="text-sm text-ui-muted">
                    Seleccionadas: <b>{heroConfigItems.length}</b>
                </div>
                <Button variant="primary" disabled={busy} onClick={saveHero}>
                    {busy ? "Guardando…" : "Guardar Hero"}
                </Button>
                </div>

                {/* seleccionadas */}
                {heroConfigItems.length > 0 && (
                <div className="grid gap-2">
                    <div className="font-bold text-ui-text">Orden (seleccionadas)</div>
                    <div className="grid gap-2">
                    {[...heroConfigItems].sort((a, b) => a.order - b.order).map((it) => (
                        <div key={it.public_id} className="flex items-center gap-3">
                        <img
                            src={it.url}
                            alt=""
                            className="w-20 h-12 object-cover rounded-md border border-ui-border"
                        />
                        <div className="text-xs text-ui-muted font-mono truncate flex-1">
                            {it.public_id}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => moveItem("hero", it.public_id, "up")}>
                            ↑
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => moveItem("hero", it.public_id, "down")}>
                            ↓
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => toggleSelect("hero", it)}>
                            Quitar
                            </Button>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* cloudinary */}
                <div className="grid gap-2">
                <div className="font-bold text-ui-text">Imágenes disponibles (Cloudinary)</div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {heroCloud.map((m) => {
                    const selected = heroSelectedMap.has(m.public_id);
                    return (
                        <div
                        key={m.public_id}
                        className={`p-3 rounded-xl border border-ui-border bg-ui-surface grid gap-2`}
                        >
                        <img
                            src={m.url}
                            alt=""
                            className="w-full aspect-[16/9] object-cover rounded-lg border border-ui-border"
                        />
                        <div className="text-[11px] text-ui-muted font-mono truncate">
                            {m.public_id}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                            variant={selected ? "secondary" : "primary"}
                            size="sm"
                            onClick={() => toggleSelect("hero", m)}
                            >
                            {selected ? "Deseleccionar" : "Seleccionar"}
                            </Button>
                            <Button variant="ghost" size="sm" disabled={busy} onClick={() => deleteOne(m.public_id)}>
                            Borrar
                            </Button>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            </Card>

            {/* GALLERY */}
            <Card className="p-5 grid gap-4">
                <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="font-extrabold text-ui-text">Galería “El Jardín”</div>
                    <div className="text-sm text-ui-muted">
                    Folder: <span className="font-mono">{FOLDER_GALLERY}</span>
                    </div>
                </div>

                <label className="inline-flex items-center gap-2">
                    <input
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadOne("gallery", f);
                        e.target.value = "";
                    }}
                    />
                </label>
                </div>

                <div className="flex items-center justify-between">
                <div className="text-sm text-ui-muted">
                    Seleccionadas: <b>{galleryConfigItems.length}</b>
                </div>
                <Button variant="primary" disabled={busy} onClick={saveGallery}>
                    {busy ? "Guardando…" : "Guardar Galería"}
                </Button>
                </div>

                {galleryConfigItems.length > 0 && (
                <div className="grid gap-2">
                    <div className="font-bold text-ui-text">Orden (seleccionadas)</div>
                    <div className="grid gap-2">
                    {[...galleryConfigItems].sort((a, b) => a.order - b.order).map((it) => (
                        <div key={it.public_id} className="flex items-center gap-3">
                        <img
                            src={it.url}
                            alt=""
                            className="w-20 h-12 object-cover rounded-md border border-ui-border"
                        />
                        <div className="text-xs text-ui-muted font-mono truncate flex-1">
                            {it.public_id}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => moveItem("gallery", it.public_id, "up")}>
                            ↑
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => moveItem("gallery", it.public_id, "down")}>
                            ↓
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => toggleSelect("gallery", it)}>
                            Quitar
                            </Button>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                <div className="grid gap-2">
                <div className="font-bold text-ui-text">Imágenes disponibles (Cloudinary)</div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {galleryCloud.map((m) => {
                    const selected = gallerySelectedMap.has(m.public_id);
                    return (
                        <div
                        key={m.public_id}
                        className={`p-3 rounded-xl border border-ui-border bg-ui-surface grid gap-2`}
                        >
                        <img
                            src={m.url}
                            alt=""
                            className="w-full aspect-[16/9] object-cover rounded-lg border border-ui-border"
                        />
                        <div className="text-[11px] text-ui-muted font-mono truncate">
                            {m.public_id}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                            variant={selected ? "secondary" : "primary"}
                            size="sm"
                            onClick={() => toggleSelect("gallery", m)}
                            >
                            {selected ? "Deseleccionar" : "Seleccionar"}
                            </Button>
                            <Button variant="ghost" size="sm" disabled={busy} onClick={() => deleteOne(m.public_id)}>
                            Borrar
                            </Button>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            </Card>
            </>
        )}
        </div>
    );
}
