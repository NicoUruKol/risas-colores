import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

import { adminLogin } from "../../services/apiAuth";
import { useAdminAuth } from "../../context/AdminAuthContext";

import styles from "./AdminLogin.module.css";

/* ==============================
AdminLogin
============================== */
export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);

    const [sending, setSending] = useState(false);
    const [err, setErr] = useState("");

    const { login } = useAdminAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const backTo = loc.state?.from || "/admin/contenido";

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setSending(true);

        try {
        const token = await adminLogin({ email, password });
        login(token);
        nav(backTo, { replace: true });
        } catch (e2) {
        setErr(e2?.message || "Credenciales inválidas");
        } finally {
        setSending(false);
        }
    };

    return (
        <main className={styles.page}>
        <Container className={styles.wrap}>
            <section className={styles.intro}>
            <div className={styles.badgeWrap}>
                <Badge variant="lavender">Admin</Badge>
            </div>

            <div className={styles.head}>
                <h1 className={styles.title}>Ingresar</h1>
                <p className={styles.sub}>
                Acceso restringido al panel de administración.
                </p>
            </div>
            </section>

            <Card className={styles.card}>
            <form className={styles.form} onSubmit={onSubmit}>
                {/* ==============================
                Email
                ============================== */}
                <div className={styles.field}>
                <label htmlFor="admin-email" className={styles.label}>
                    Email
                </label>

                <input
                    id="admin-email"
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    placeholder="admin@correo.com"
                />
                </div>

                {/* ==============================
                Password
                ============================== */}
                <div className={styles.field}>
                <label htmlFor="admin-password" className={styles.label}>
                    Contraseña
                </label>

                <input
                    id="admin-password"
                    type={showPass ? "text" : "password"}
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                />

                <label className={styles.checkRow}>
                    <input
                    type="checkbox"
                    className={styles.check}
                    checked={showPass}
                    onChange={(e) => setShowPass(e.target.checked)}
                    />
                    Ver contraseña
                </label>
                </div>

                {/* ==============================
                Error
                ============================== */}
                {err ? <div className={styles.error}>{err}</div> : null}

                {/* ==============================
                Actions
                ============================== */}
                <div className={styles.actions}>
                <Button
                    variant="ghost"
                    className={styles.submitBtn}
                    disabled={sending}
                    type="submit"
                >
                    {sending ? "Ingresando…" : "Entrar"}
                </Button>
                </div>
            </form>
            </Card>

            <Link to="/" className={styles.backLink}>
            ← Volver al sitio
            </Link>
        </Container>
        </main>
    );
}