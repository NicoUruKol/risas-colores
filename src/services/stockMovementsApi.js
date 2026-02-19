import { request } from "./http";

const TOKEN_KEY = "token";

// token en sessionStorage
const getAdminToken = () => sessionStorage.getItem(TOKEN_KEY) || "";

const authHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const withQuery = (path, params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        qs.set(k, String(v));
    });
    const s = qs.toString();
    return s ? `${path}?${s}` : path;
};

/* ==============================
ADMIN STOCK MOVEMENTS
GET /api/stock-movements
============================== */

export const adminListStockMovements = async ({
    productCode,
    size,
    type,
    orderId,
    limit,
    } = {}) => {
    const url = withQuery("/api/stock-movements", {
        productCode,
        size,
        type,
        orderId,
        limit,
    });

    const r = await request(url, { headers: authHeaders() });
    return r?.data ?? r;
};

export const adminGetStockMovementById = async (id) => {
    const r = await request(`/api/stock-movements/${id}`, {
        headers: authHeaders(),
    });
    return r?.data ?? r;
};
