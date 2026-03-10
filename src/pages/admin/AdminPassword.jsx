import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { adminChangeMyPassword } from "../../services/adminsApi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminPassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    const nav = useNavigate();
    const loc = useLocation();
    const { logout } = useAdminAuth();

    const goLogin = () => {
        logout();
        nav("/admin/login", { replace: true, state: { from: loc.pathname } });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setSaving(true);

        try {
        await adminChangeMyPassword({ currentPassword, newPassword });
        // por seguridad: forzamos re-login
        goLogin();
        } catch (e2) {
        if (e2?.status === 401 || e2?.status === 403) return goLogin();
        setErr(e2?.message || "Error cambiando password");
        } finally {
        setSaving(false);
        }
    };

    return (
        <div className="grid gap-4 max-w-[560px]">
        <div>
            <Badge variant="lavender">Admin</Badge>
            <h2 className="text-2xl font-extrabold text-ui-text mt-2">Cambiar contraseña</h2>
            <p className="text-sm text-ui-muted mt-2">
            Luego de cambiarla vas a tener que volver a iniciar sesión.
            </p>
        </div>

        {err ? (
            <Card className="p-4">
            <p className="text-sm text-red-500">{err}</p>
            </Card>
        ) : null}

        <Card className="p-5">
            <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Contraseña actual</label>
                <input
                type={show ? "text" : "password"}
                className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                />
            </div>

            <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Nueva contraseña</label>
                <input
                type={show ? "text" : "password"}
                className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>

            <label className="flex items-center gap-2 text-sm text-ui-text">
                <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
                Ver contraseña
            </label>

            <Button
                type="submit"
                variant="ghost"
                className="text-black border-black w-fit px-6"
                disabled={saving}
            >
                {saving ? "Guardando…" : "Cambiar contraseña"}
            </Button>
            </form>
        </Card>
        </div>
    );
}