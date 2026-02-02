import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { getById } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import ProductoDetalleCarousel from "..//components/producto/ProductoDetalleCarousel";
import ImageZoomModal from "../components/producto/ImageZoomModal";
import styles from "./ProductosDetalle.module.css";

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

    useEffect(() => {
        let alive = true;
        setLoading(true);

        getById(id).then((res) => {
        if (!alive) return;
        setItem(res);
        setLoading(false);

        setTalle(res?.talles?.[0] ?? "1");
        setQty(1);
        setImgIndex(0);
        setZoomOpen(false);
        });

        return () => {
        alive = false;
        };
    }, [id]);

    const images = useMemo(() => {
        if (!item) return [];
        if (item.image && typeof item.image === "object") {
        return [item.image.producto, item.image.puesta].filter(Boolean);
        }
        if (typeof item.image === "string") return [item.image];
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

    const handleAdd = () => {
        if (!item) return;
        addItem({ id: item.id, name: item.name, price: item.price }, { talle, qty });
        navigate("/carrito");
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
                        " Volver"
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
                    Talles: {item.talles?.length ? item.talles.join(" · ") : "Consultar"}
                    </p>

                    <div className={`text-3xl font-extrabold text-brand-orange ${styles.price}`}>
                    ${Number(item.price || 0).toLocaleString("es-AR")}
                    </div>

                    <div className={styles.controlsGrid}>
                    <div className={styles.controlBlock}>
                        <label className={styles.controlLabel}>Talle</label>
                        <select
                        className={styles.select}
                        value={talle}
                        onChange={(e) => setTalle(e.target.value)}
                        disabled={!item.talles?.length}
                        >
                        {(item.talles?.length ? item.talles : ["1", "2", "3", "4", "5"]).map((t) => (
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
                            onClick={() => setQty((q) => q + 1)}
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
                        >
                            Agregar al carrito
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
            </Card>
            )}
        </Container>
        </main>
    );
}
