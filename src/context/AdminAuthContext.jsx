import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const AdminAuthContext = createContext(null);

const TOKEN_KEY = "token";
const LAST_ACTIVITY_KEY = "admin_last_activity";

// ✅ 30 minutos (podés cambiarlo)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

// Eventos que cuentan como “actividad”
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

export function AdminAuthProvider({ children }) {
    // ✅ sessionStorage: se borra al cerrar la pestaña/ventana
    const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
    const isAdmin = Boolean(token);

    const intervalRef = useRef(null);

    const touchActivity = () => {
        try {
        sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        } catch {
        // noop
        }
    };

    const logout = () => {
        try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(LAST_ACTIVITY_KEY);
        } catch {
        // noop
        }
        setToken("");
    };

    const login = (nextToken) => {
        sessionStorage.setItem(TOKEN_KEY, nextToken);
        touchActivity();
        setToken(nextToken);
    };

    // ✅ cuando está logueado, escuchamos actividad + controlamos timeout
    useEffect(() => {
        if (!isAdmin) return;

        touchActivity();

        const onActivity = () => touchActivity();
        ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

        intervalRef.current = window.setInterval(() => {
        const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY);
        const last = Number(raw || 0);

        // si por algún motivo no hay lastActivity, lo tratamos como “ahora”
        if (!last) {
            touchActivity();
            return;
        }

        const idle = Date.now() - last;
        if (idle >= IDLE_TIMEOUT_MS) {
            logout();
        }
        }, 10_000); // chequea cada 10s (liviano)

        return () => {
        ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    const value = useMemo(() => ({ token, isAdmin, login, logout }), [token, isAdmin]);

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth debe usarse dentro de AdminAuthProvider");
    return ctx;
}
