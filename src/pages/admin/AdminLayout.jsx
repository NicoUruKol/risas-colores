import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Container from "../../components/layout/Container";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import styles from "./AdminLayout.module.css";
import { useAdminAuth } from "../../context/AdminAuthContext";
import useInactivityLogout from "../../components/hooks/useInactivityLogout";

const NavItem = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
        }
        end
    >
        {children}
    </NavLink>
);

const getRoleFromToken = (token) => {
    try {
        if (!token) return "";
        const parts = token.split(".");
        if (parts.length !== 3) return "";

        const payload = JSON.parse(atob(parts[1]));
        return String(payload?.role || "").trim();
    } catch {
        return "";
    }
};

export default function AdminLayout() {
    const { logout, token } = useAdminAuth();
    const navigate = useNavigate();

    const [showWarning, setShowWarning] = useState(false);

    const role = getRoleFromToken(token);
    const isSuperAdmin = role === "superadmin";

    const handleLogout = () => {
        setShowWarning(false);
        logout();
        navigate("/admin/login", { replace: true });
    };

    useInactivityLogout({
        enabled: Boolean(token),
        timeoutMs: 15 * 60 * 1000,
        warningMs: 60 * 1000,
        onWarning: () => {
            setShowWarning(true);
        },
        onTimeout: () => {
            setShowWarning(false);
            logout();
            navigate("/admin/login", { replace: true });
        },
    });

    useEffect(() => {
        if (!showWarning) return;

        const hide = setTimeout(() => {
            setShowWarning(false);
        }, 55 * 1000);

        return () => clearTimeout(hide);
    }, [showWarning]);

    return (
        <main className="py-10">
            <Container className="grid gap-6">
                <header className={styles.head}>
                    <div>
                        <Badge variant="lavender">Admin</Badge>
                        <h1 className={styles.title}>Panel de administración</h1>
                        <p className={styles.sub}>Productos y contenido (Hero / Galería).</p>
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                </header>

                {showWarning ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Tu sesión se cerrará por inactividad en menos de 1 minuto.
                    </div>
                ) : null}

                <div className={styles.shell}>
                    <aside className={styles.sidebar}>
                        <nav className={styles.nav}>
                            <NavItem to="/admin/productos">Productos</NavItem>
                            <NavItem to="/admin/stock">Stock</NavItem>
                            <NavItem to="/admin/contenido">Contenido</NavItem>
                            <NavItem to="/admin/pedidos">Pedidos</NavItem>

                            {isSuperAdmin && <NavItem to="/admin/admins">Admins</NavItem>}

                            <NavItem to="/admin/password">Contraseña</NavItem>
                        </nav>
                    </aside>

                    <section className={styles.main}>
                        <Outlet />
                    </section>
                </div>
            </Container>
        </main>
    );
}