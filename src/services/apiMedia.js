import { request } from "./http";

const API_BASE = import.meta.env.VITE_API_URL;

const joinUrl = (base, path) => {
    const b = String(base || "").replace(/\/+$/, "");
    const p = String(path || "").replace(/^\/+/, "");
    return `${b}/${p}`;
};

const getAdminToken = () => localStorage.getItem("token") || "";

const authHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const mediaList = async (folder) => {
    const r = await request(`/api/media/list?folder=${encodeURIComponent(folder)}`, {
        headers: authHeaders(),
    });
    return r?.items ?? [];
};

export const mediaUploadOne = async (folder, file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(
        joinUrl(API_BASE, `/api/media/upload?folder=${encodeURIComponent(folder)}`),
        {
        method: "POST",
        headers: { ...authHeaders() },
        body: fd,
        }
    );

    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        const err = new Error(data?.message || `Error HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data?.item ?? data;
};

export const mediaDelete = async (public_id) => {
    const r = await request(`/api/media/delete?public_id=${encodeURIComponent(public_id)}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return r?.result ?? r;
};
