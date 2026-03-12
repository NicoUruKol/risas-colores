import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { adminChangeMyPassword } from "../../services/adminsApi";
import { useAdminAuth } from "../../context/AdminAuthContext";
import styles from "./AdminPassword.module.css";

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
        goLogin();
        } catch (e2) {
        if (e2?.status === 401 || e2?.status === 403) return goLogin();
        setErr(e2?.message || "Error cambiando password");
        } finally {
        setSaving(false);
        }
    };

    return (
        <section className={styles.page}>
        <header className={styles.head}>
            <div className={styles.badgeWrap}>
            <Badge variant="lavender">Admin</Badge>
            </div>

            <div className={styles.headText}>
            <h2 className={styles.title}>Cambiar contraseña</h2>
            <p className={styles.sub}>
                Luego de cambiarla vas a tener que volver a iniciar sesión.
            </p>
            </div>
        </header>

        {err ? (
            <Card className={styles.errorCard}>
            <p className={styles.errorText}>{err}</p>
            </Card>
        ) : null}

        <Card className={styles.card}>
            <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="current-password">
                Contraseña actual
                </label>
                <input
                id="current-password"
                type={show ? "text" : "password"}
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="new-password">
                Nueva contraseña
                </label>
                <input
                id="new-password"
                type={show ? "text" : "password"}
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                />
            </div>

            <label className={styles.checkRow}>
                <input
                type="checkbox"
                className={styles.check}
                checked={show}
                onChange={(e) => setShow(e.target.checked)}
                />
                Ver contraseña
            </label>

            <div className={styles.actions}>
                <Button
                type="submit"
                variant="ghost"
                className={styles.submitBtn}
                disabled={saving}
                >
                {saving ? "Guardando…" : "Cambiar contraseña"}
                </Button>
            </div>
            </form>
        </Card>
        </section>
    );
}