const API_BASE = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "token";

/* ==============================
Utils
============================== */

const joinUrl = (base, path) => {
    const b = String(base || "").replace(/\/+$/, "");
    const p = String(path || "").replace(/^\/+/, "");
    return `${b}/${p}`;
};

const readJson = async (res) => {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
};

/* ==============================
Admin auth helpers
============================== */

export const getAdminToken = () => sessionStorage.getItem(TOKEN_KEY) || "";

export const authHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const clearAdminSession = () => {
    try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem("admin_last_activity");
    } catch {
        // noop
    }
    };

    const redirectToAdminLogin = () => {
    const routerType = import.meta.env.VITE_ROUTER; // "hash" o "browser"
    const target = routerType === "hash" ? "/#/admin/login" : "/admin/login";
    window.location.assign(target);
};

/* ==============================
Request Base
============================== */

export const request = async (path, { method = "GET", body, headers } = {}) => {
    const res = await fetch(joinUrl(API_BASE, path), {
        method,
        headers: body ? { "Content-Type": "application/json", ...headers } : headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await readJson(res);

    if (!res.ok) {
        // ✅ si es request con Authorization y falla 401/403 => limpiar sesión + redirect
        const isAdminReq = Boolean(headers?.Authorization);
        if (isAdminReq && (res.status === 401 || res.status === 403)) {
        clearAdminSession();
        redirectToAdminLogin();
        }

        const err = new Error(data?.message || `Error HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
};
