import { createContext, useContext, useMemo, useState } from "react";

const AdminAuthContext = createContext(null);
const TOKEN_KEY = "token";

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");

    const isAdmin = Boolean(token);

    const login = (nextToken) => {
        sessionStorage.setItem(TOKEN_KEY, nextToken);
        setToken(nextToken);
    };

    const logout = () => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken("");
    };

    const value = useMemo(() => ({ token, isAdmin, login, logout }), [token, isAdmin]);

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth debe usarse dentro de AdminAuthProvider");
    return ctx;
}