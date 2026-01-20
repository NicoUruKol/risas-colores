import { Link } from "react-router-dom";
import Container from "./Container";
import styles from "./Footer.module.css";
import whatsappIcon from "../../assets/whatsapp.svg";


export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
        {/* Strip de color arriba */}
        <div className={styles.bottomConfetti} aria-hidden="true" />

        <Container className={styles.inner}>
            {/* Col 1 */}
            <div className={styles.col}>
            <div className={styles.titleRow}>
            <div className={styles.title}>Jardín Maternal Risas y Colores</div>
            <Link className={styles.titleContact} to="/contacto">
                — Contacto
            </Link>
            </div>

            <div className={`${styles.metaRow} ${styles.muted}`}>
            <span className={styles.address}>
                Cuenca 4359, C1419ABI Cdad. Autónoma de Buenos Aires
            </span>
            <span className={styles.phone}>Teléfono: 011 4509-7984</span>
            </div>

            </div>

            {/* Col 2 */}
            <div className={`${styles.col} ${styles.colRight}`}>
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
                <a
                    className={styles.pillMain}
                    href="https://wa.me/5491152499974?text=Hola%20%F0%9F%8C%88%F0%9F%91%B6%F0%9F%91%A7%0ASomos%20una%20familia%20interesada%20en%20conocer%20m%C3%A1s%20sobre%20el%20Jard%C3%ADn%20Maternal%20Risas%20y%20Colores.%0A%C2%A1Gracias!"
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                    src={whatsappIcon}
                    alt=""
                    aria-hidden="true"
                    className={styles.pillIcon}
                    />
                    <span className={styles.pillLabel}>WhatsApp</span>
                </a>

                <span className={`${styles.muted} ${styles.small}`}>
                    Mensaje por WhatsApp
                </span>
            </div>

            </div>

            {/* ⬇️ BLOQUE LEGAL */}
            <div className={styles.legal}>
                <span className={styles.muted}>
                    © {new Date().getFullYear()} Risas y Colores. Todos los derechos reservados.
                </span>

                <a
                    href="https://wa.me/5491152499974"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.credit}
                >
                    Sitio creado por Glotch
                </a>
            </div>
        </Container>
        </footer>
    );
}
