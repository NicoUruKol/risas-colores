import { request, authHeaders } from "./http";

/* ==============================
Superadmin
============================== */
export const adminListAdmins = async () => {
    const r = await request("/api/admins", { headers: authHeaders() });
    return r?.data ?? r;
};

export const adminCreateAdmin = async ({ email, password, role = "admin" }) => {
    const r = await request("/api/admins", {
        method: "POST",
        body: { email, password, role },
        headers: authHeaders(),
    });
    return r?.data ?? r;
};

export const adminDeactivateAdmin = async (id) => {
    const r = await request(`/api/admins/${id}/deactivate`, {
        method: "PATCH",
        headers: authHeaders(),
    });
    return r?.data ?? r;
};

export const adminReactivateAdmin = async (id) => {
    const r = await request(`/api/admins/${id}/reactivate`, {
        method: "PATCH",
        headers: authHeaders(),
    });
    return r?.data ?? r;
};

/* ==============================
Admin logueado
============================== */
export const adminChangeMyPassword = async ({ currentPassword, newPassword }) => {
    const r = await request("/api/admins/me/password", {
        method: "PATCH",
        body: { currentPassword, newPassword },
        headers: authHeaders(),
    });
    return r;
};