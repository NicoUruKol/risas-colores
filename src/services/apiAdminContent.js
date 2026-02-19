import { request, authHeaders } from "./http";

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

