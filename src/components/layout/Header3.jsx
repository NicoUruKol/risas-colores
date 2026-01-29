import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";
import styles from "./Header3.module.css";
import logo from "../../assets/logoDesat.webp";
import whatsappIcon from "../../assets/whatsapp.svg";

export default function Header3() {
    const { count } = useCart();
    const hasItems = Number(count) > 0;

    const [open, setOpen] = useState(false);
    const location = useLocation();
    const drawerRef = useRef(null);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
        if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        setTimeout(() => drawerRef.current?.focus(), 0);

        return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prev;
        };
    }, [open]);

    const navLinkClass = ({ isActive }) =>
        `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

    return (
        <header className={styles.header}>
        <Container className={styles.inner}>
            <button
            type="button"
            className={styles.burger}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            >
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            </button>

            <Link to="/" className={styles.brand} aria-label="Ir al inicio">
            <img src={logo} alt="Risas y Colores" className={styles.logoImg} />
            <div className={styles.brandText}>
                <div className={styles.brandLine1}>
                <span className={styles.blue}>Risas</span> y{" "}
                <span className={styles.orange}>Colores</span>
                </div>
                <div className={styles.brandLine2}>Jardín materno infantil</div>
            </div>
            </Link>

            {/* Derecha: carrito + CTA */}
            {hasItems ? (
            <div className={styles.right}>
                <Link to="/carrito" className={styles.cart} aria-label="Ir al carrito">
                🛒 <span className={styles.cartCount}>({count})</span>
                </Link>

                <Link to="/uniformes" className={styles.buyLink}>
                <Button variant="primary" size="sm" className={styles.buyBtn}>
                    Comprar <span className={styles.arrow}>→</span>
                </Button>
                </Link>
            </div>
            ) : (
            <div className={styles.right}>
                {/* WhatsApp pill */}
                <a
                className={styles.pill}
                href="https://wa.me/5491152499974?text=Hola%20%F0%9F%91%A6%F0%9F%8F%BB%20%F0%9F%91%A7%F0%9F%8F%BB%20%F0%9F%8C%88%0ASomos%20una%20familia%20interesada%20en%20conocer%20m%C3%A1s%20sobre%20el%20Jard%C3%ADn%20Maternal%20Risas%20y%20Colores.%0A%C2%A1Gracias%21"
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir WhatsApp"
                >
                <img
                    className={styles.pillIcon}
                    src={whatsappIcon}
                    alt=""
                    aria-hidden="true"
                />
                <span className={styles.pillLabel}>WhatsApp</span>
                </a>
            </div>
            )}
        </Container>

        <div className={styles.bottomConfetti} aria-hidden="true" />

        {/* Drawer */}
        <div className={`${styles.drawerWrap} ${open ? styles.open : ""}`}>
            <button
            className={styles.overlay}
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            />

            <aside
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-label="Menú"
            tabIndex={-1}
            >
            <div className={styles.drawerHeader}>
                <div className={styles.drawerTitle}>Menú</div>
                <button className={styles.close} aria-label="Cerrar" onClick={() => setOpen(false)}>
                ✕
                </button>
            </div>

            {/* Links principales (sin repetición) */}
            <nav className={styles.drawerNav}>
                <NavLink to="/el-jardin" className={navLinkClass} onClick={() => setOpen(false)}>
                El Jardín
                </NavLink>

                <NavLink to="/uniformes" className={navLinkClass} onClick={() => setOpen(false)}>
                Uniformes
                </NavLink>

                {/* Carrito SOLO si hay items */}
                {hasItems && (
                <NavLink to="/carrito" className={navLinkClass} onClick={() => setOpen(false)}>
                    Carrito <span className={styles.drawerCount}>({count})</span>
                </NavLink>
                )}
            </nav>

            {/* Acciones inferiores (sin botones con recuadro) */}
            <div className={styles.drawerActions}>
                {hasItems ? (
                <Link to="/carrito" className={styles.actionPrimary} onClick={() => setOpen(false)}>
                    Ir al carrito <span className={styles.actionMeta}>({count})</span>
                </Link>
                ) : (
                <Link to="/uniformes" className={styles.actionPrimary} onClick={() => setOpen(false)}>
                    Ver uniformes
                </Link>
                )}

                <Link to="/" className={styles.actionSecondary} onClick={() => setOpen(false)}>
                Inicio
                </Link>
            </div>
            </aside>
        </div>
        </header>
    );
}
