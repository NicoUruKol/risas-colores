import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
    adminCreateAdmin,
    adminDeactivateAdmin,
    adminListAdmins,
} from "../../services/adminsApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

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

export default function AdminAdmins() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [err, setErr] = useState("");
    const [forbidden, setForbidden] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");
    const [creating, setCreating] = useState(false);
    const [deactivatingId, setDeactivatingId] = useState("");

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

    const onDeactivate = async (adminId) => {
        const ok = window.confirm("¿Desactivar este administrador?");
        if (!ok) return;

        setErr("");
        setDeactivatingId(adminId);

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
        setDeactivatingId("");
        }
    };

    return (
        <div className="grid gap-6">
            <div>
                <Badge variant="lavender">Admin</Badge>
                <h2 className="text-2xl font-extrabold text-ui-text mt-2">
                Administradores
                </h2>
                <p className="text-sm text-ui-muted mt-2">
                Solo superadmin puede ver, crear y desactivar administradores.
                </p>
            </div>

            {err ? (
                <Card className="p-4">
                    <p className="text-sm text-red-500">{err}</p>
                </Card>
            ) : null}

            <Card className="p-5 grid gap-4">
                <div className="font-extrabold text-ui-text">Crear nuevo admin</div>

                <form className="grid gap-3 sm:grid-cols-3" onSubmit={onCreate}>
                    <input
                        className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)] sm:col-span-1"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        disabled={forbidden || creating}
                    />

                    <input
                        type="password"
                        className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)] sm:col-span-1"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={forbidden || creating}
                    />

                    <select
                        className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none sm:col-span-1"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={forbidden || creating}
                    >
                        <option value="admin">admin</option>
                        <option value="superadmin">superadmin</option>
                    </select>

                    <div className="sm:col-span-3">
                        <Button
                        type="submit"
                        variant="ghost"
                        className="text-black border-black w-fit px-6"
                        disabled={forbidden || creating}
                        >
                        {creating ? "Creando…" : "Crear admin"}
                        </Button>
                    </div>
                </form>
            </Card>

            <Card className="p-5 grid gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="font-extrabold text-ui-text">Lista</div>
                    <Button
                        variant="ghost"
                        className="text-black border-black"
                        onClick={load}
                        type="button"
                        disabled={loading}
                    >
                        Refrescar
                    </Button>
                </div>

                {loading ? (
                <p className="text-ui-muted">Cargando…</p>
                ) : forbidden ? (
                <p className="text-ui-muted">No disponible para este usuario.</p>
                ) : rows.length === 0 ? (
                <p className="text-ui-muted">No hay admins.</p>
                ) : (
                <div className="grid gap-2">
                    {rows.map((a) => {
                    const isMe = a.id === myAdminId;

                    return (
                        <div
                        key={a.id}
                        className="rounded-xl border border-ui-border bg-ui-surface p-3 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <div className="font-bold text-ui-text truncate">{a.email}</div>
                                <div className="text-xs text-ui-muted">
                                    Rol: {a.role} · Estado: {a.active ? "Activo" : "Inactivo"}
                                </div>
                            </div>

                            {isSuperAdmin && a.active && !isMe ? (
                                <Button
                                type="button"
                                variant="ghost"
                                className="text-black border-black"
                                disabled={deactivatingId === a.id}
                                onClick={() => onDeactivate(a.id)}
                                >
                                {deactivatingId === a.id ? "Desactivando…" : "Desactivar"}
                                </Button>
                            ) : null}
                        </div>
                    );
                    })}
                </div>
                )}
            </Card>
        </div>
    );
}