const API_BASE = import.meta.env.VITE_API_URL;

const joinUrl = (base, path) => {
    const b = String(base).replace(/\/+$/, "");
    const p = String(path).replace(/^\/+/, "");
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

export const request = async (
    path,
    { method = "GET", body, token, headers } = {}
    ) => {
    const h = {
        ...(headers || {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(joinUrl(API_BASE, path), {
        method,
        headers: Object.keys(h).length ? h : undefined,
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
