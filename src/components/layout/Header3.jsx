import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";
import styles from "./Header3.module.css";
import logo from "../../assets/logoDesat.webp";

export default function Header3() {
    const { count } = useCart();
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

        // Lock scroll (simple y efectivo)
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
            {/* Izquierda: botón menú */}
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

            {/* Centro: Brand protagonista */}
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
        </Container>

        <div className={styles.bottomConfetti} aria-hidden="true" />

        {/* Drawer */}
        <div className={`${styles.drawerWrap} ${open ? styles.open : ""}`}>
            <button className={styles.overlay} aria-label="Cerrar menú" onClick={() => setOpen(false)} />

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

            <nav className={styles.drawerNav}>
                <NavLink to="/el-jardin" className={navLinkClass} onClick={() => setOpen(false)}>
                El Jardín
                </NavLink>
                <NavLink to="/uniformes" className={navLinkClass} onClick={() => setOpen(false)}>
                Uniformes
                </NavLink>
                <NavLink to="/carrito" className={navLinkClass} onClick={() => setOpen(false)}>
                Carrito <span className={styles.drawerCount}>({count})</span>
                </NavLink>
            </nav>

            <div className={styles.drawerCtas}>
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
            </aside>
        </div>
        </header>
    );
}
