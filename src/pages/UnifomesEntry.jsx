// src/pages/UniformesEntry.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ImageBox from "../components/ui/ImageBox";
import { listAll } from "../services/productsApi";
import styles from "./UniformesEntry.module.css";
import SEO from "../components/seo/SEO";


export default function UniformesEntry() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        setLoading(true);

        listAll().then((res) => {
        if (!alive) return;
        setProducts(res);
        setLoading(false);
        });

        return () => {
        alive = false;
        };
    }, []);

    return (
        <main className={`py-10 ${styles.stage}`}>
            <SEO
            title="Uniformes"
            description="Uniformes del Jardín Maternal Risas y Colores. Prendas y packs por temporada."
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
                Elegí un producto y después seleccioná el talle disponible (1 a 5) en el detalle.
            </p>
            </section>

            {loading ? (
            <Card className={`p-5 ${styles.productCard}`}>
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : (
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                    <Card key={p.id} className={`p-4 ${styles.productCard}`}>
                        <Link to={`/producto/${p.id}`}>
                            <ImageBox
                            src={p.image?.producto ?? p.image}
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
                        <div className="text-xs text-ui-muted mt-1">
                        {p.talles?.includes("Único") ? "Talle: Único" : `Talles: ${p.talles.join(" · ")}`}
                        </div>
                    </div>

                    <div className={`font-extrabold text-brand-orange ${styles.price}`}>
                        ${Number(p.price || 0).toLocaleString("es-AR")}
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
