import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import styles from "./AdminContenido.module.css";

/* ==============================
AdminContenido
============================== */
export default function AdminContenido() {
    return (
        <section className={styles.page}>
        <header className={styles.head}>
            <h2 className={styles.title}>Contenido</h2>
            <p className={styles.sub}>Administrá lo que ve el público.</p>
        </header>

        <div className={styles.grid}>
            <Link to="/admin/contenido/hero" className={styles.linkReset}>
            <Card className={`${styles.card} ${styles.cardHero}`}>
                <Badge variant="orange">Home</Badge>
                <div className={styles.cardTitle}>Hero</div>
                <p className={styles.cardText}>Imágenes + título y subtítulo.</p>
            </Card>
            </Link>

            <Link to="/admin/contenido/galeria" className={styles.linkReset}>
            <Card className={`${styles.card} ${styles.cardGaleria}`}>
                <Badge variant="blue">El Jardín</Badge>
                <div className={styles.cardTitle}>Galería</div>
                <p className={styles.cardText}>Seleccionar, subir y borrar imágenes.</p>
            </Card>
            </Link>

            <Link to="/admin/contenido/reseñas" className={styles.linkReset}>
            <Card className={`${styles.card} ${styles.cardResenas}`}>
                <Badge variant="lavender">Comentarios</Badge>
                <div className={styles.cardTitle}>Reseñas</div>
                <p className={styles.cardText}>CRUD + activar/desactivar + link Google.</p>
            </Card>
            </Link>
        </div>
        </section>
    );
}