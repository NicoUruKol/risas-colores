import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Container from "./Container";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";
import styles from "./Header.module.css";

export default function Header() {
    const { count } = useCart();
    const [open, setOpen] = useState(false);
    const location = useLocation();

    // Cierra el menú al navegar
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const navLinkClass = ({ isActive }) =>
        `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

    return (
        <header className={styles.header}>
        <Container className={styles.inner}>
            {/* Brand */}
            <Link to="/" className={styles.brand} aria-label="Ir al inicio">
            <div className={styles.logoWrap}>
                {<img
                    src="/logoDesat.png"
                    alt="Risas y Colores"
                    className={styles.logoImg}
                    />
                    }
            </div>

            <div className={styles.brandText}>
                <span className={styles.brandLine1}>
                <span className={styles.blue}>Risas</span> y{" "}
                <span className={styles.orange}>Colores</span>
                </span>
                <span className={styles.brandLine2}>Jardín materno infantil</span>
            </div>
            </Link>

            {/* Nav desktop */}
            <nav className={styles.nav} aria-label="Navegación principal">
            <NavLink to="/el-jardin" className={navLinkClass}>
                El Jardín
            </NavLink>
            <NavLink to="/uniformes" className={navLinkClass}>
                Uniformes
            </NavLink>
            </nav>

            {/* Actions */}
            <div className={styles.actions}>
            <Link to="/uniformes" className={styles.buyLink}>
                <Button variant="primary" size="sm" className={styles.buyBtn}>
                Comprar <span className={styles.arrow}>→</span>
                </Button>
            </Link>

            <Link to="/carrito" className={styles.cart} aria-label="Ir al carrito">
                🛒 <span className={styles.cartCount}>({count})</span>
            </Link>

            {/* Burger (solo mobile) */}
            <button
                type="button"
                className={styles.burger}
                aria-label={open ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <span className={`${styles.burgerLine} ${open ? styles.burgerTop : ""}`} />
                <span className={`${styles.burgerLine} ${open ? styles.burgerMid : ""}`} />
                <span className={`${styles.burgerLine} ${open ? styles.burgerBot : ""}`} />
            </button>
            </div>
        </Container>

        <div className={styles.bottomConfetti} aria-hidden="true" />

        {/* Mobile menu */}
        <div className={`${styles.mobileWrap} ${open ? styles.mobileOpen : ""}`}>
            {/* overlay */}
            <button
            className={styles.overlay}
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            />

            <div className={styles.mobilePanel} role="dialog" aria-label="Menú">
            <div className={styles.mobileHeader}>
                <div className={styles.mobileTitle}>Menú</div>
                <button
                className={styles.close}
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                >
                ✕
                </button>
            </div>

            <nav className={styles.mobileNav}>
                <NavLink to="/el-jardin" className={navLinkClass}>
                El Jardín
                </NavLink>
                <NavLink to="/uniformes" className={navLinkClass}>
                Uniformes
                </NavLink>
                <NavLink to="/carrito" className={navLinkClass}>
                Carrito <span className={styles.mobileCount}>({count})</span>
                </NavLink>
            </nav>

            <div className={styles.mobileCtas}>
                <Link to="/uniformes">
                <Button variant="primary" className={`${styles.heroBtnLike} w-full`}>
                    Comprar uniformes <span className={styles.heroArrowLike}>→</span>
                </Button>
                </Link>
                <Link to="/el-jardin">
                <Button variant="ghost" className="w-full">
                    Conocer el jardín
                </Button>
                </Link>
            </div>
            </div>
        </div>
        </header>
    );
}
