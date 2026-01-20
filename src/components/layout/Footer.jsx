import { Link } from "react-router-dom";
import Container from "./Container";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
        {/* Strip de color arriba */}
            <div className={styles.bottomConfetti} aria-hidden="true" />

            <Container className={styles.inner}>
                {/* Col 1 */}
                <div className="grid gap-2">
                <div className={styles.title}>Jardín Maternal Risas y Colores</div>

                <div className={`${styles.metaRow} ${styles.muted}`}>
                    <span>Dirección ·</span>

                    <Link className={styles.link} to="/contacto">
                        Contacto
                    </Link>

                    <span>· Teléfono</span>
                </div>

                <div className={`${styles.muted} ${styles.small}`}>
                    © {new Date().getFullYear()} Risas y Colores. Todos los derechos reservados.
                </div>
                </div>

                {/* Col 2 */}
                <div className="grid gap-3 md:justify-self-end">
                <div className={styles.links}>
                    <Link className={styles.link} to="/el-jardin">El Jardín</Link>
                    <Link className={styles.link} to="/uniformes">Uniformes</Link>
                    <Link className={styles.link} to="/carrito">Carrito</Link>

                    <a
                    className={styles.link}
                    href="https://instagram.com/risasycolores.jardinmaternal?igsh=dXFqeGdseGoyM3F4"
                    target="_blank"
                    rel="noreferrer"
                    >
                    Instagram
                    </a>
                </div>

                <div className={styles.pill}>
                    <a className={styles.pillLabel}
                    href="https://wa.me/549XXXXXXXXXX"
                    target="_blank"
                    rel="noreferrer"
                    >WhatsApp</a>
                    <span className={`${styles.muted} ${styles.small}`}>
                    Respuesta rápida por WhatsApp
                    </span>
                </div>
                </div>
            </Container>
        </footer>
    );
}


