import { useEffect, useMemo, useState } from "react";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ImageBox from "../../components/ui/ImageBox";

import { getHomeHeroContent, getElJardinGalleryContent } from "../../services/apiContent";
import { adminSaveHomeHero, adminSaveElJardinGallery } from "../../services/apiAdminContent";
import { mediaList, mediaUpload, mediaDelete } from "../../services/apiMedia";

const FOLDERS = {
    hero: "risas-colores/web/Hero",
    gallery: "risas-colores/web/gallery",
};

const sortByOrder = (items = []) =>
    [...items].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const makeItem = (m, order) => ({
    public_id: m.public_id,
    url: m.url,
    alt: m.alt || "",
    active: true,
    order,
});

export default function AdminContenido() {
    const [loading, setLoading] = useState(true);
    const [savingHero, setSavingHero] = useState(false);
    const [savingGallery, setSavingGallery] = useState(false);
    const [err, setErr] = useState("");

    const [heroMedia, setHeroMedia] = useState([]);
    const [galleryMedia, setGalleryMedia] = useState([]);

    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroItems, setHeroItems] = useState([]); // selected items

    const [galleryItems, setGalleryItems] = useState([]); // selected items

    const heroSelectedIds = useMemo(
        () => new Set(heroItems.map((x) => x.public_id)),
        [heroItems]
    );
    const gallerySelectedIds = useMemo(
        () => new Set(galleryItems.map((x) => x.public_id)),
        [galleryItems]
    );

    const loadAll = async () => {
        setErr("");
        setLoading(true);

        try {
        const [heroCfg, galCfg, heroM, galM] = await Promise.all([
            getHomeHeroContent(),
            getElJardinGalleryContent(),
            mediaList(FOLDERS.hero),
            mediaList(FOLDERS.gallery),
        ]);

        setHeroTitle(heroCfg?.title ?? "");
        setHeroSubtitle(heroCfg?.subtitle ?? "");
        setHeroItems(sortByOrder(heroCfg?.items ?? []).filter((x) => x?.public_id && x?.url));

        setGalleryItems(sortByOrder(galCfg?.items ?? []).filter((x) => x?.public_id && x?.url));

        setHeroMedia(heroM?.items ?? heroM ?? []);
        setGalleryMedia(galM?.items ?? galM ?? []);
        } catch (e) {
        setErr(e?.message || "Error cargando contenido.");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const toggleSelect = (type, m) => {
        if (!m?.public_id || !m?.url) return;

        if (type === "hero") {
        setHeroItems((prev) => {
            const exists = prev.some((x) => x.public_id === m.public_id);
            if (exists) return prev.filter((x) => x.public_id !== m.public_id);
            const nextOrder = prev.length ? Math.max(...prev.map((x) => Number(x.order || 0))) + 1 : 1;
            return [...prev, makeItem(m, nextOrder)];
        });
        return;
        }

        setGalleryItems((prev) => {
        const exists = prev.some((x) => x.public_id === m.public_id);
        if (exists) return prev.filter((x) => x.public_id !== m.public_id);
        const nextOrder = prev.length ? Math.max(...prev.map((x) => Number(x.order || 0))) + 1 : 1;
        return [...prev, makeItem(m, nextOrder)];
        });
    };

    const moveItem = (type, public_id, dir) => {
        const setter = type === "hero" ? setHeroItems : setGalleryItems;

        setter((prev) => {
        const items = sortByOrder(prev);
        const idx = items.findIndex((x) => x.public_id === public_id);
        if (idx < 0) return prev;

        const j = dir === "up" ? idx - 1 : idx + 1;
        if (j < 0 || j >= items.length) return prev;

        const swapped = [...items];
        [swapped[idx], swapped[j]] = [swapped[j], swapped[idx]];

        return swapped.map((it, i) => ({ ...it, order: i + 1 }));
        });
    };

    const toggleActive = (type, public_id) => {
        const setter = type === "hero" ? setHeroItems : setGalleryItems;
        setter((prev) => prev.map((x) => (x.public_id === public_id ? { ...x, active: !x.active } : x)));
    };

    const saveHero = async () => {
        setErr("");
        setSavingHero(true);
        try {
        const payload = {
            title: heroTitle.trim(),
            subtitle: heroSubtitle.trim(),
            items: sortByOrder(heroItems).map((it, i) => ({
            ...it,
            order: i + 1,
            active: it.active !== false,
            })),
        };
        await adminSaveHomeHero(payload);
        } catch (e) {
        setErr(e?.message || "Error guardando Hero.");
        } finally {
        setSavingHero(false);
        }
    };

    const saveGallery = async () => {
        setErr("");
        setSavingGallery(true);
        try {
        const payload = {
            items: sortByOrder(galleryItems).map((it, i) => ({
            ...it,
            order: i + 1,
            active: it.active !== false,
            })),
        };
        await adminSaveElJardinGallery(payload);
        } catch (e) {
        setErr(e?.message || "Error guardando Galería.");
        } finally {
        setSavingGallery(false);
        }
    };

    const onUpload = async (type, ev) => {
        const files = ev.target.files;
        ev.target.value = "";
        if (!files || files.length === 0) return;

        setErr("");
        try {
        const folder = type === "hero" ? FOLDERS.hero : FOLDERS.gallery;
        await mediaUpload(folder, files);
        await loadAll();
        } catch (e) {
        setErr(e?.message || "Error subiendo imagen.");
        }
    };

    const onDelete = async (public_id) => {
        if (!public_id) return;
        setErr("");
        try {
        await mediaDelete(public_id);
        await loadAll();
        } catch (e) {
        setErr(e?.message || "Error borrando imagen.");
        }
    };

    return (
        <main className="py-10">
        <Container className="grid gap-6">
            <div className="flex items-start justify-between gap-4">
            <div>
                <Badge variant="lavender">Admin</Badge>
                <h1 className="text-2xl font-extrabold text-ui-text mt-2">Contenido</h1>
                <p className="text-sm text-ui-muted mt-2">
                Configurá Hero (imágenes + título/subtítulo) y Galería de “El Jardín”.
                </p>
            </div>

            <div className="flex gap-2">
                <Button variant="ghost" onClick={loadAll} disabled={loading}>
                {loading ? "Actualizando…" : "Refrescar"}
                </Button>
                <Button variant="secondary" onClick={() => (window.location.href = "/admin/productos")}>
                Productos →
                </Button>
            </div>
            </div>

            {err ? (
            <Card className="p-4">
                <p className="text-sm text-red-500">{err}</p>
            </Card>
            ) : null}

            {/* ==============================
                HERO
            ============================== */}
            <Card className="p-5 grid gap-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                <div className="font-extrabold text-ui-text">Hero</div>
                <div className="text-xs text-ui-muted mt-1">Folder: {FOLDERS.hero}</div>
                </div>

                <label className="inline-flex items-center gap-2">
                <input type="file" multiple accept="image/*" onChange={(e) => onUpload("hero", e)} />
                </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Título</label>
                <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                />
                </div>

                <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Subtítulo</label>
                <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                />
                </div>
            </div>

            <div className="grid gap-3">
                <div className="text-sm font-bold text-ui-text">Seleccionadas (orden + activo)</div>

                {heroItems.length === 0 ? (
                <p className="text-sm text-ui-muted">No hay imágenes seleccionadas.</p>
                ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {sortByOrder(heroItems).map((it) => (
                    <Card key={it.public_id} className="p-3">
                        <ImageBox src={it.url} alt={it.alt || ""} />
                        <div className="mt-3 grid gap-2">
                        <div className="text-xs text-ui-muted break-all">{it.public_id}</div>

                        <div className="flex items-center justify-between gap-2">
                            <Button variant="ghost" size="sm" onClick={() => moveItem("hero", it.public_id, "up")}>
                            ↑
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => moveItem("hero", it.public_id, "down")}>
                            ↓
                            </Button>

                            <label className="flex items-center gap-2 text-sm text-ui-text">
                            <input
                                type="checkbox"
                                checked={it.active !== false}
                                onChange={() => toggleActive("hero", it.public_id)}
                            />
                            Activo
                            </label>
                        </div>
                        </div>
                    </Card>
                    ))}
                </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3">
                <Button variant="secondary" onClick={saveHero} disabled={savingHero}>
                {savingHero ? "Guardando…" : "Guardar Hero"}
                </Button>

                <div className="text-xs text-ui-muted">
                Disponibles: {heroMedia.length} · Seleccionadas: {heroItems.length}
                </div>
            </div>

            <div className="grid gap-3">
                <div className="text-sm font-bold text-ui-text">Disponibles en Cloudinary</div>

                {heroMedia.length === 0 ? (
                <p className="text-sm text-ui-muted">No hay imágenes en la carpeta.</p>
                ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {heroMedia.map((m) => {
                    const selected = heroSelectedIds.has(m.public_id);
                    return (
                        <Card key={m.public_id} className="p-3">
                        <ImageBox src={m.url} alt={m.alt || ""} />
                        <div className="mt-3 grid gap-2">
                            <div className="text-xs text-ui-muted break-all">{m.public_id}</div>

                            <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={selected ? "secondary" : "primary"}
                                className="w-full"
                                onClick={() => toggleSelect("hero", m)}
                            >
                                {selected ? "Quitar" : "Agregar"}
                            </Button>

                            <Button variant="ghost" className="w-full" onClick={() => onDelete(m.public_id)}>
                                Borrar
                            </Button>
                            </div>
                        </div>
                        </Card>
                    );
                    })}
                </div>
                )}
            </div>
            </Card>

            {/* ==============================
                GALLERY
            ============================== */}
            <Card className="p-5 grid gap-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                <div className="font-extrabold text-ui-text">Galería “El Jardín”</div>
                <div className="text-xs text-ui-muted mt-1">Folder: {FOLDERS.gallery}</div>
                </div>

                <label className="inline-flex items-center gap-2">
                <input type="file" multiple accept="image/*" onChange={(e) => onUpload("gallery", e)} />
                </label>
            </div>

            <div className="grid gap-3">
                <div className="text-sm font-bold text-ui-text">Seleccionadas (orden + activo)</div>

                {galleryItems.length === 0 ? (
                <p className="text-sm text-ui-muted">No hay imágenes seleccionadas.</p>
                ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {sortByOrder(galleryItems).map((it) => (
                    <Card key={it.public_id} className="p-3">
                        <ImageBox src={it.url} alt={it.alt || ""} />
                        <div className="mt-3 grid gap-2">
                        <div className="text-xs text-ui-muted break-all">{it.public_id}</div>

                        <div className="flex items-center justify-between gap-2">
                            <Button variant="ghost" size="sm" onClick={() => moveItem("gallery", it.public_id, "up")}>
                            ↑
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => moveItem("gallery", it.public_id, "down")}>
                            ↓
                            </Button>

                            <label className="flex items-center gap-2 text-sm text-ui-text">
                            <input
                                type="checkbox"
                                checked={it.active !== false}
                                onChange={() => toggleActive("gallery", it.public_id)}
                            />
                            Activo
                            </label>
                        </div>
                        </div>
                    </Card>
                    ))}
                </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3">
                <Button variant="secondary" onClick={saveGallery} disabled={savingGallery}>
                {savingGallery ? "Guardando…" : "Guardar Galería"}
                </Button>

                <div className="text-xs text-ui-muted">
                Disponibles: {galleryMedia.length} · Seleccionadas: {galleryItems.length}
                </div>
            </div>

            <div className="grid gap-3">
                <div className="text-sm font-bold text-ui-text">Disponibles en Cloudinary</div>

                {galleryMedia.length === 0 ? (
                <p className="text-sm text-ui-muted">No hay imágenes en la carpeta.</p>
                ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {galleryMedia.map((m) => {
                    const selected = gallerySelectedIds.has(m.public_id);
                    return (
                        <Card key={m.public_id} className="p-3">
                        <ImageBox src={m.url} alt={m.alt || ""} />
                        <div className="mt-3 grid gap-2">
                            <div className="text-xs text-ui-muted break-all">{m.public_id}</div>

                            <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={selected ? "secondary" : "primary"}
                                className="w-full"
                                onClick={() => toggleSelect("gallery", m)}
                            >
                                {selected ? "Quitar" : "Agregar"}
                            </Button>

                            <Button variant="ghost" className="w-full" onClick={() => onDelete(m.public_id)}>
                                Borrar
                            </Button>
                            </div>
                        </div>
                        </Card>
                    );
                    })}
                </div>
                )}
            </div>
            </Card>
        </Container>
        </main>
    );
}
