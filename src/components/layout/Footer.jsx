import { Link } from "react-router-dom";
import Container from "./Container";
import styles from "./Footer.module.css";

import whatsappIcon from "../../assets/whatsapp.svg";
import instagramIcon from "../../assets/instagram.svg"; 
import contactIcon from "../../assets/contacto.svg";       

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
        <div className={styles.bottomConfetti} aria-hidden="true" />

        <Container className={styles.inner}>
            {/* 1) Título */}
            <div className={styles.titleRow}>
            <div className={styles.title}>Jardín Maternal Risas y Colores</div>
            </div>

            {/* 2) Dirección */}
            <div className={`${styles.metaRow} ${styles.muted}`}>
            <a
            className={styles.locationLink}
            href="https://www.google.com/maps/search/?api=1&query=Cuenca+4359+CABA"
            target="_blank"
            rel="noreferrer"
            >
            <span className={styles.locationIcon}>📍</span>
            <span>Ubicación</span>
            <span className={styles.locationArrow}>→</span>
            </a>

            <div className={styles.phone}>Teléfono: 011 4509-7984</div>
            </div>

            {/* 4) Links internos */}
            <nav className={styles.links} aria-label="Enlaces">
            <Link className={`${styles.link} ${styles.bulleted}`} to="/el-jardin">El Jardín</Link>
            <Link className={`${styles.link} ${styles.bulleted}`} to="/uniformes">Uniformes</Link>
            <Link className={`${styles.link} ${styles.bulleted}`} to="/carrito">Carrito</Link>
            </nav>


            {/* 5) Botonera: WhatsApp / Instagram / Contacto */}
            <div className={styles.pillsRow}>
            <a
                className={styles.pill}
                href="https://wa.me/5491152499974?text=Hola%20%F0%9F%8C%88%F0%9F%91%B6%F0%9F%91%A7%0ASomos%20una%20familia%20interesada%20en%20conocer%20m%C3%A1s%20sobre%20el%20Jard%C3%ADn%20Maternal%20Risas%20y%20Colores.%0A%C2%A1Gracias!"
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir WhatsApp"
            >
                <img className={styles.pillIcon} src={whatsappIcon} alt="" aria-hidden="true" />
                <span className={styles.pillLabel}>WhatsApp</span>
            </a>
            
            <a
                className={styles.pill}
                href="https://instagram.com/risasycolores.jardinmaternal?igsh=dXFqeGdseGdseGoyM3F4"
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir Instagram"
            >
                <img className={styles.pillIcon} src={instagramIcon} alt="" aria-hidden="true" />
                <span className={styles.pillLabel}>Instagram</span>
            </a>

            <Link className={styles.pill} to="/contacto" aria-label="Ir a contacto">
                <img className={styles.pillIcon} src={contactIcon} alt="" aria-hidden="true" />
                <span className={styles.pillLabel}>Contacto</span>
            </Link>
            </div>

            {/* Último: derechos + realizado */}
            <div className={styles.legal}>
            <span className={styles.muted}>© {year} Risas y Colores. Todos los derechos reservados.</span>

            <a
                href="https://wa.me/5491152499974"
                target="_blank"
                rel="noreferrer"
                className={styles.credit}
            >
                Realizado por Glotch 2.0
            </a>
            </div>
        </Container>
        </footer>
    );
}
