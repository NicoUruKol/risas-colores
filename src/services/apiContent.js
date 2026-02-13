import { request } from "./http";

const getAdminToken = () =>
    localStorage.getItem("adminToken") || localStorage.getItem("token") || "";

const authHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/* Público */
export const getHomeHeroContent = async () => {
    const r = await request("/api/content/home-hero");
    return r?.data ?? r;
};

export const getElJardinGalleryContent = async () => {
    const r = await request("/api/content/el-jardin-gallery");
    return r?.data ?? r;
};

/* Admin */
export const saveHomeHeroContent = async (payload) => {
    const r = await request("/api/content/home-hero", {
        method: "PUT",
        body: payload,
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};

export const saveElJardinGalleryContent = async (payload) => {
    const r = await request("/api/content/el-jardin-gallery", {
        method: "PUT",
        body: payload,
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};

