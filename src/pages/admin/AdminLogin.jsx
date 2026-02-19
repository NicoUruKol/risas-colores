import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

import { adminLogin } from "../../services/apiAuth";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        <main className="py-10">
        <Container className="max-w-[520px] grid gap-6">
            <div>
            <Badge variant="lavender">Admin</Badge>
            <h1 className="text-2xl font-extrabold text-ui-text mt-2">Ingresar</h1>
            <p className="text-sm text-ui-muted mt-2">Acceso restringido.</p>
            </div>

            <Card className="p-5">
            <form className="grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Email</label>
                <input
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                />
                </div>

                <div className="grid gap-2">
                <label className="text-sm text-ui-muted">Password</label>
                <input
                    type="password"
                    className="h-12 px-3 rounded-md border border-ui-border bg-ui-surface text-ui-text outline-none focus:ring-4 focus:ring-[rgba(74,144,194,.25)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
                </div>

                {err ? <p className="text-sm text-red-500">{err}</p> : null}

                <Button variant="ghost" disabled={sending}>
                {sending ? "Ingresando…" : "Entrar"}
                </Button>
            </form>
            </Card>

            <Link to="/" className="text-sm text-ui-muted underline w-fit">← Volver al sitio</Link>
        </Container>
        </main>
    );
}
