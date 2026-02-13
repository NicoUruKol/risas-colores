import { request } from "./http";

const getAdminToken = () =>
    localStorage.getItem("token") || localStorage.getItem("adminToken") || "";

const authHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminSaveHomeHero = async (payload) => {
    const r = await request("/api/content/home-hero", {
        method: "PUT",
        body: payload,
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};

export const adminSaveElJardinGallery = async (payload) => {
    const r = await request("/api/content/el-jardin-gallery", {
        method: "PUT",
        body: payload,
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};
