const API_BASE = import.meta.env.VITE_API_URL;

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
Request Base
============================== */

export const request = async (
    path,
    { method = "GET", body, headers } = {}
    ) => {
    const res = await fetch(joinUrl(API_BASE, path), {
        method,
        headers: body
        ? { "Content-Type": "application/json", ...headers }
        : headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await readJson(res);

    if (!res.ok) {
        const err = new Error(data?.message || `Error HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
};
