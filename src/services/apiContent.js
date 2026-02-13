import { request } from "./http";

export const getHomeHeroContent = async () => {
    const r = await request("/api/content/home-hero");
    return r?.data ?? r; // tolerante a tu backend (ok:true,...)
};

export const getElJardinGalleryContent = async () => {
    const r = await request("/api/content/el-jardin-gallery");
    return r?.data ?? r;
};
