import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
    adminCreateAdmin,
    adminDeactivateAdmin,
    adminListAdmins,
    adminReactivateAdmin,
} from "../../services/adminsApi";
import { useAdminAuth } from "../../context/AdminAuthContext";
import styles from "./AdminAdmins.module.css";

/* ==============================
Helpers token
============================== */
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

const getAdminIdFromToken = (token) => {
    try {
        if (!token) return "";
        const parts = token.split(".");
        if (parts.length !== 3) return "";
        const payload = JSON.parse(atob(parts[1]));
        return String(payload?.adminId || "").trim();
    } catch {
        return "";
    }
};

/* ==============================
AdminAdmins
============================== */
export default function AdminAdmins() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [err, setErr] = useState("");
    const [forbidden, setForbidden] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");
    const [creating, setCreating] = useState(false);

    const [workingId, setWorkingId] = useState("");

    const nav = useNavigate();
    const loc = useLocation();
    const { logout, token } = useAdminAuth();

    const myRole = getRoleFromToken(token);
    const myAdminId = getAdminIdFromToken(token);
    const isSuperAdmin = myRole === "superadmin";

    const goLogin = () => {
        logout();
        nav("/admin/login", { replace: true, state: { from: loc.pathname } });
    };

    /* ==============================
    Load
    ============================== */
    const load = async () => {
        setErr("");
        setForbidden(false);
        setLoading(true);

        try {
        const data = await adminListAdmins();
        setRows(Array.isArray(data) ? data : []);
        } catch (e) {
        if (e?.status === 401) return goLogin();

        if (e?.status === 403) {
            setForbidden(true);
            setRows([]);
            setErr("No tenés permisos para administrar usuarios.");
            return;
        }

        setRows([]);
        setErr(e?.message || "Error cargando admins");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ==============================
    Create
    ============================== */
    const onCreate = async (e) => {
        e.preventDefault();
        setErr("");

        if (forbidden) {
        setErr("No tenés permisos para crear administradores.");
        return;
        }

        setCreating(true);

        try {
        await adminCreateAdmin({ email, password, role });
        setEmail("");
        setPassword("");
        setRole("admin");
        await load();
        } catch (e2) {
        if (e2?.status === 401) return goLogin();

        if (e2?.status === 403) {
            setForbidden(true);
            setErr("No tenés permisos para crear administradores.");
            return;
        }

        setErr(e2?.message || "Error creando admin");
        } finally {
        setCreating(false);
        }
    };

    /* ==============================
    Deactivate
    ============================== */
    const onDeactivate = async (adminId) => {
        const ok = window.confirm("¿Desactivar este administrador?");
        if (!ok) return;

        setErr("");
        setWorkingId(adminId);

        try {
        await adminDeactivateAdmin(adminId);
        await load();
        } catch (e3) {
        if (e3?.status === 401) return goLogin();

        if (e3?.status === 403) {
            setForbidden(true);
            setErr("No tenés permisos para desactivar administradores.");
            return;
        }

        setErr(e3?.message || "Error desactivando admin");
        } finally {
        setWorkingId("");
        }
    };

    /* ==============================
    Reactivate
    ============================== */
    const onReactivate = async (adminId) => {
        const ok = window.confirm("¿Reactivar este administrador?");
        if (!ok) return;

        setErr("");
        setWorkingId(adminId);

        try {
        await adminReactivateAdmin(adminId);
        await load();
        } catch (e4) {
        if (e4?.status === 401) return goLogin();

        if (e4?.status === 403) {
            setForbidden(true);
            setErr("No tenés permisos para reactivar administradores.");
            return;
        }

        setErr(e4?.message || "Error reactivando admin");
        } finally {
        setWorkingId("");
        }
    };

    return (
        <section className={styles.page}>
        <header className={styles.head}>
            <div className={styles.badgeWrap}>
            <Badge variant="lavender">Admin</Badge>
            </div>

            <div className={styles.headText}>
            <h2 className={styles.title}>Administradores</h2>
            <p className={styles.sub}>
                Solo superadmin puede ver, crear, desactivar y reactivar administradores.
            </p>
            </div>
        </header>

        {err ? (
            <Card className={styles.errorCard}>
            <p className={styles.errorText}>{err}</p>
            </Card>
        ) : null}

        <Card className={styles.card}>
            <div className={styles.sectionTitle}>Crear nuevo admin</div>

            <form className={styles.form} onSubmit={onCreate}>
            <input
                className={styles.input}
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                disabled={forbidden || creating}
            />

            <input
                type="password"
                className={styles.input}
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={forbidden || creating}
            />

            <select
                className={styles.select}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={forbidden || creating}
            >
                <option value="admin">admin</option>
                <option value="superadmin">superadmin</option>
            </select>

            <div className={styles.formActions}>
                <Button
                type="submit"
                variant="ghost"
                className={styles.primaryBtn}
                disabled={forbidden || creating}
                >
                {creating ? "Creando…" : "Crear admin"}
                </Button>
            </div>
            </form>
        </Card>

        <Card className={styles.card}>
            <div className={styles.listHead}>
            <div className={styles.sectionTitle}>Lista</div>

            <Button
                variant="ghost"
                className={styles.secondaryBtn}
                onClick={load}
                type="button"
                disabled={loading}
            >
                Refrescar
            </Button>
            </div>

            {loading ? (
            <p className={styles.emptyText}>Cargando…</p>
            ) : forbidden ? (
            <p className={styles.emptyText}>No disponible para este usuario.</p>
            ) : rows.length === 0 ? (
            <p className={styles.emptyText}>No hay admins.</p>
            ) : (
            <div className={styles.list}>
                {rows.map((a) => {
                const isMe = a.id === myAdminId;

                return (
                    <article key={a.id} className={styles.row}>
                    <div className={styles.rowInfo}>
                        <div className={styles.email}>{a.email}</div>
                        <div className={styles.meta}>
                        Rol: {a.role} · Estado: {a.active ? "Activo" : "Inactivo"}
                        </div>
                    </div>

                    {isSuperAdmin && !isMe ? (
                        a.active ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className={styles.secondaryBtn}
                            disabled={workingId === a.id}
                            onClick={() => onDeactivate(a.id)}
                        >
                            {workingId === a.id ? "Procesando…" : "Desactivar"}
                        </Button>
                        ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            className={styles.secondaryBtn}
                            disabled={workingId === a.id}
                            onClick={() => onReactivate(a.id)}
                        >
                            {workingId === a.id ? "Procesando…" : "Reactivar"}
                        </Button>
                        )
                    ) : null}
                    </article>
                );
                })}
            </div>
            )}
        </Card>
        </section>
    );
}