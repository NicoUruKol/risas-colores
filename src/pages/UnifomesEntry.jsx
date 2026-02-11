import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ImageBox from "../components/ui/ImageBox";
import { listAll } from "../services/productsApi";

import styles from "./UniformesEntry.module.css";
import SEO from "../components/seo/SEO";

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

const getPriceFromVariants = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const prices = variants
        .map((v) => Number(v?.price))
        .filter((n) => Number.isFinite(n) && n > 0);

    if (prices.length) return Math.min(...prices);
    return Number(product?.price ?? 0) || 0;
};

export default function UniformesEntry() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        setLoading(true);

        listAll()
            .then((res) => {
            if (!alive) return;

            const arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
            setProducts(arr);
            setLoading(false);
            })
            .catch((e) => {
            console.error("listAll error:", e);
            if (!alive) return;
            setProducts([]);
            setLoading(false);
            });

        return () => {
            alive = false;
        };
        }, []);


    const view = useMemo(() => {
        const base = Array.isArray(products) ? products : [];
        return base.map((p) => {
        const sizes = getSizesFromVariants(p.variants);
        const price = getPriceFromVariants(p);
        const sizeLabel =
            sizes.length === 1 && sizes[0] === "U"
            ? "Talle: Único"
            : sizes.length
            ? `Talles: ${sizes.map((s) => (s === "U" ? "Único" : s)).join(" · ")}`
            : "Talles: Consultar";

        return { ...p, _sizes: sizes, _price: price, _sizeLabel: sizeLabel };
        });
    }, [products]);

    return (
        <main className={`py-10 ${styles.stage}`}>
        <SEO
            title="Uniformes"
            description="Uniformes del Jardín Maternal Risas y Colores."
            path="/uniformes"
        />

        <div className={styles.bg} />
        <Container className="grid gap-6">
            <section className={`${styles.headerShell} grid gap-3 text-center p-5`}>
            <div className="grid justify-center">
                <Badge variant="blue">Tienda</Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-ui-text">Uniformes del jardín</h1>
            <p className="text-ui-muted">
                Elegí un producto y después seleccioná el talle disponible en el detalle.
            </p>
            </section>

            {loading ? (
            <Card className={`p-5 ${styles.productCard}`}>
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : (
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {view.map((p) => (
                <Card key={p.id} className={`p-4 ${styles.productCard}`}>
                    <Link to={`/producto/${p.id}`}>
                    <ImageBox
                        src={p.avatar}
                        alt={p.name}
                        fit="contain"
                        tone="soft"
                        bordered={false}
                        rounded="xl"
                        className={styles.media}
                    />
                    </Link>

                    <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                        <div className="font-bold text-ui-text">{p.name}</div>
                        <div className="text-xs text-ui-muted mt-1">{p._sizeLabel}</div>
                    </div>

                    <div className={`font-extrabold text-brand-orange ${styles.price}`}>
                        ${Number(p._price || 0).toLocaleString("es-AR")}
                    </div>
                    </div>

                    <Link to={`/producto/${p.id}`} className="mt-4 block">
                    <Button variant="ghost" className={`${styles.cta} ${styles.ctaReadable}`}>
                        Ver detalle <span className={styles.ctaArrow}>→</span>
                    </Button>
                    </Link>
                </Card>
                ))}
            </section>
            )}
        </Container>
        </main>
    );
}
