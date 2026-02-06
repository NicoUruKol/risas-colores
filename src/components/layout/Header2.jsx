{/*}
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";
import styles from "./Header2.module.css";
import logo from "../../assets/logoDesat.webp";

export default function Header2() {
    const { count } = useCart();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const panelRef = useRef(null);
    const btnRef = useRef(null);

    // Cierra al navegar
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // Escape + click afuera + focus básico
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
        if (e.key === "Escape") setOpen(false);
        };

        const onMouseDown = (e) => {
        const panel = panelRef.current;
        const btn = btnRef.current;
        if (!panel || !btn) return;
        if (!panel.contains(e.target) && !btn.contains(e.target)) setOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("mousedown", onMouseDown);

        // focus al panel
        setTimeout(() => panelRef.current?.focus(), 0);

        return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("mousedown", onMouseDown);
        };
    }, [open]);

    const navLinkClass = ({ isActive }) =>
        `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

    return (
        <header className={styles.header}>
        <Container className={styles.inner}>
            {/* Brand (más prota) *//*}
            <Link to="/" className={styles.brand} aria-label="Ir al inicio">
            <div className={styles.logoWrap} aria-hidden="true">
                <img src={logo} alt="" className={styles.logoImg} />
            </div>

            <div className={styles.brandText}>
                <span className={styles.brandLine1}>
                <span className={styles.blue}>Risas</span> y{" "}
                <span className={styles.orange}>Colores</span>
                </span>
                <span className={styles.brandLine2}>Jardín materno infantil</span>
            </div>
            </Link>

            {/* Acciones + Menú desplegable (desktop y mobile) *//*}
            <div className={styles.actions}>
            <Link to="/carrito" className={styles.cart} aria-label="Ir al carrito">
                🛒 <span className={styles.cartCount}>({count})</span>
            </Link>

            <Link to="/uniformes" className={styles.buyLink}>
                <Button variant="primary" size="sm" className={styles.buyBtn}>
                Comprar <span className={styles.arrow}>→</span>
                </Button>
            </Link>

            <button
                ref={btnRef}
                type="button"
                className={styles.menuBtn}
                aria-label={open ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen((v) => !v)}
            >
                <span className={styles.menuIcon} aria-hidden="true">
                <span className={`${styles.burgerLine} ${open ? styles.burgerTop : ""}`} />
                <span className={`${styles.burgerLine} ${open ? styles.burgerMid : ""}`} />
                <span className={`${styles.burgerLine} ${open ? styles.burgerBot : ""}`} />
                </span>
            </button>
            </div>
        </Container>

        <div className={styles.bottomConfetti} aria-hidden="true" />

        {/* Panel desplegable *//*}
        <div className={`${styles.menuWrap} ${open ? styles.open : ""}`}>
            <div className={styles.overlay} aria-hidden="true" />
            <div
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-label="Menú"
            tabIndex={-1}
            >
            <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>Navegación</div>
                <button className={styles.close} aria-label="Cerrar" onClick={() => setOpen(false)}>
                ✕
                </button>
            </div>

            <nav className={styles.panelNav}>
                <NavLink to="/el-jardin" className={navLinkClass} onClick={() => setOpen(false)}>
                El Jardín
                </NavLink>
                <NavLink to="/uniformes" className={navLinkClass} onClick={() => setOpen(false)}>
                Uniformes
                </NavLink>
                <NavLink to="/carrito" className={navLinkClass} onClick={() => setOpen(false)}>
                Carrito <span className={styles.mobileCount}>({count})</span>
                </NavLink>
            </nav>

            <div className={styles.panelCtas}>
                <Link to="/uniformes" onClick={() => setOpen(false)}>
                <Button variant="primary" className={styles.ctaPrimary}>
                    Comprar uniformes <span className={styles.ctaArrow}>→</span>
                </Button>
                </Link>
                <Link to="/el-jardin" onClick={() => setOpen(false)}>
                <Button variant="ghost" className={styles.ctaGhost}>
                    Conocer el jardín
                </Button>
                </Link>
            </div>
            </div>
        </div>
        </header>
    );
}
*/}