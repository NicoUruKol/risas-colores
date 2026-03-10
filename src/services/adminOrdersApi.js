import { request, authHeaders } from "./http";

/* ==============================
Admin Orders
============================== */
export const adminListOrders = async () => {
    const r = await request("/api/orders", {
        headers: authHeaders(),
    });
    return r?.data ?? [];
};

export const adminGetOrderById = async (id) => {
    const r = await request(`/api/orders/${id}`, {
        headers: authHeaders(),
    });
    return r?.data ?? null;
};

export const adminUpdateOrderStatus = async (id, status) => {
    const r = await request(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: { status },
    });
    return r?.data ?? null;
};

export const adminUpdateOrderDeliveryStatus = async (id, deliveryStatus) => {
    const r = await request(`/api/orders/${id}/delivery-status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: { deliveryStatus },
    });
    return r?.data ?? null;
};

export const adminCancelOrder = async (id) => {
    const r = await request(`/api/orders/${id}/cancel`, {
        method: "POST",
        headers: authHeaders(),
    });
    return r?.data ?? null;
};