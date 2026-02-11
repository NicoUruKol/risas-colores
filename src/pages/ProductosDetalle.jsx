import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { getById } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import ProductoDetalleCarousel from "../components/producto/ProductoDetalleCarousel";
import ImageZoomModal from "../components/producto/ImageZoomModal";
import AddToCartConfirmModal from "../components/producto/AddToCartConfirmModal";

import styles from "./ProductosDetalle.module.css";

const toVariantSize = (uiTalle) => (uiTalle === "Único" ? "U" : String(uiTalle || "").trim());
const toUiTalle = (variantSize) => (variantSize === "U" ? "Único" : String(variantSize || "").trim());

const getSizesFromVariants = (variants = []) => {
    const sizes = (Array.isArray(variants) ? variants : [])
        .map((v) => (v?.size ?? "").toString().trim())
        .filter(Boolean);

    const unique = Array.from(new Set(sizes));
    unique.sort((a, b) => {
        if (a === "U") return 1;
        if (b === "U") return -1;
        return Number(a) - Number(b);
    });

    return unique;
};

export default function ProductoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const [talle, setTalle] = useState("1");
    const [qty, setQty] = useState(1);

    const [imgIndex, setImgIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [addedOpen, setAddedOpen] = useState(false);

    useEffect(() => {
        let alive = true;
        setLoading(true);

        getById(id)
        .then((res) => {
            if (!alive) return;
            setItem(res);
            setLoading(false);

            const sizes = getSizesFromVariants(res?.variants);
            const first = sizes[0] ? toUiTalle(sizes[0]) : "1";
            setTalle(first);
            setQty(1);
            setImgIndex(0);
            setZoomOpen(false);
        })
        .catch(() => {
            if (!alive) return;
            setItem(null);
            setLoading(false);
        });

        return () => {
        alive = false;
        };
    }, [id]);

    const variants = useMemo(() => (Array.isArray(item?.variants) ? item.variants : []), [item]);
    const sizes = useMemo(() => getSizesFromVariants(variants), [variants]);

    const selectedVariant = useMemo(() => {
        const size = toVariantSize(talle);
        return variants.find((v) => String(v?.size ?? "").trim() === size) || null;
    }, [variants, talle]);

    const unitPrice = useMemo(() => {
        const fromVariant = Number(selectedVariant?.price);
        if (Number.isFinite(fromVariant) && fromVariant > 0) return fromVariant;
        const base = Number(item?.price);
        return Number.isFinite(base) ? base : 0;
    }, [selectedVariant, item]);

    const stock = useMemo(() => {
        const s = Number(selectedVariant?.stock ?? 0);
        return Number.isFinite(s) ? s : 0;
    }, [selectedVariant]);

    useEffect(() => {
        setQty((q) => {
        if (stock <= 0) return 1;
        return Math.min(q, stock);
        });
    }, [stock]);

    const images = useMemo(() => {
        if (!item) return [];
        if (typeof item.avatar === "string" && item.avatar.trim()) return [item.avatar.trim()];
        return [];
    }, [item]);

    useEffect(() => {
        setImgIndex((i) => Math.min(i, Math.max(0, images.length - 1)));
    }, [images.length]);

    const prevImg = useCallback(() => {
        if (images.length <= 1) return;
        setImgIndex((i) => (i - 1 + images.length) % images.length);
    }, [images.length]);

    const nextImg = useCallback(() => {
        if (images.length <= 1) return;
        setImgIndex((i) => (i + 1) % images.length);
    }, [images.length]);

    const canAdd = Boolean(item) && Boolean(selectedVariant) && stock > 0 && qty >= 1;

    const handleAdd = () => {
        if (!canAdd) return;

        addItem(
        { id: item.id, name: item.name, price: unitPrice, avatar: item.avatar },
        { talle, qty, max: stock }
        );

        setAddedOpen(true);
    };

    return (
        <main className={`py-10 ${styles.stage}`}>
        <div className={styles.bg} />
        <Container className="grid gap-6 max-w-[860px]">
            <div className="flex items-center justify-between gap-4">
            <Link to="/uniformes">
                <Button variant="secondary" className={`${styles.ctaReadable} ${styles.ctaBtn}`}>
                <span className={styles.ctaIcon}>←</span>
                Volver
                </Button>
            </Link>
            {!loading && item && <Badge variant="blue">Producto</Badge>}
            </div>

            {loading ? (
            <Card className={`p-5 ${styles.shell}`}>
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : !item ? (
            <Card className={`p-5 ${styles.shell}`}>
                <p className="text-ui-muted">No encontramos este producto.</p>
                <div className="mt-3">
                <Link to="/uniformes">
                    <Button variant="secondary" className={`${styles.ctaReadable} ${styles.ctaBtn}`}>
                    <span className={styles.ctaIcon}>←</span>
                    Volver
                    </Button>
                </Link>
                </div>
            </Card>
            ) : (
            <Card className={`p-5 ${styles.shell}`}>
                <div className="grid gap-5 md:grid-cols-2">
                <ProductoDetalleCarousel
                    images={images}
                    index={imgIndex}
                    onChange={setImgIndex}
                    onOpenZoom={() => setZoomOpen(true)}
                    onPrev={prevImg}
                    onNext={nextImg}
                    title={item.name}
                />

                <div className="grid gap-3">
                    <h1 className="text-2xl font-extrabold text-ui-text">{item.name}</h1>

                    <div className={styles.descBox}>
                    <div className={styles.descTitle}>Descripción</div>
                    <div className={styles.descText}>
                        {item.description ?? "Descripción del producto."}
                    </div>
                    </div>

                    <p className="text-sm text-ui-muted">
                    Talles:{" "}
                    {sizes.length
                        ? sizes.map((s) => (s === "U" ? "Único" : s)).join(" · ")
                        : "Consultar"}
                    </p>

                    <div className={`text-3xl font-extrabold text-brand-orange ${styles.price}`}>
                    ${Number(unitPrice || 0).toLocaleString("es-AR")}
                    </div>

                    <p className="text-xs text-ui-muted">
                    Stock disponible (talle {talle}):{" "}
                    <span className={stock > 0 ? "text-ui-text font-bold" : "text-red-500 font-bold"}>
                        {stock}
                    </span>
                    </p>

                    <div className={styles.controlsGrid}>
                    <div className={styles.controlBlock}>
                        <label className={styles.controlLabel}>Talle</label>
                        <select
                        className={styles.select}
                        value={talle}
                        onChange={(e) => setTalle(e.target.value)}
                        disabled={!sizes.length}
                        >
                        {(sizes.length ? sizes.map(toUiTalle) : ["1", "2", "3", "4", "5"]).map((t) => (
                            <option key={t} value={t}>
                            {t}
                            </option>
                        ))}
                        </select>
                    </div>

                    <div className={styles.controlBlock}>
                        <label className={styles.controlLabel}>Cantidad</label>
                        <div className={styles.stepper}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={styles.stepperBtn}
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                        >
                            −
                        </Button>

                        <div className={styles.qtyValue}>{qty}</div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className={styles.stepperBtn}
                            onClick={() => setQty((q) => (stock > 0 ? Math.min(stock, q + 1) : q + 1))}
                            disabled={stock > 0 ? qty >= stock : false}
                        >
                            +
                        </Button>
                        </div>
                    </div>
                    </div>

                    <div className={styles.ctaRow}>
                    <Button
                        variant="secondary"
                        className={`${styles.ctaReadable} ${styles.ctaBtn}`}
                        onClick={handleAdd}
                        disabled={!canAdd}
                    >
                        {stock <= 0 ? "Sin stock" : "Agregar al carrito"}
                        <span className={styles.ctaArrow}>→</span>
                    </Button>

                    <Link to="/carrito">
                        <Button variant="secondary" className={`${styles.ctaReadable} ${styles.ctaBtn}`}>
                        Ir al carrito
                        <span className={styles.ctaArrow}>→</span>
                        </Button>
                    </Link>
                    </div>
                </div>
                </div>

                <ImageZoomModal
                open={zoomOpen}
                src={images[imgIndex]}
                alt={item.name}
                hasNav={images.length > 1}
                onClose={() => setZoomOpen(false)}
                onPrev={prevImg}
                onNext={nextImg}
                />

                <AddToCartConfirmModal
                open={addedOpen}
                title="Agregado al carrito"
                text="¿Querés seguir comprando o finalizar la compra?"
                onClose={() => setAddedOpen(false)}
                onContinue={() => {
                    setAddedOpen(false);
                    navigate("/uniformes");
                }}
                onCheckout={() => {
                    setAddedOpen(false);
                    navigate("/carrito");
                }}
                />
            </Card>
            )}
        </Container>
        </main>
    );
}
