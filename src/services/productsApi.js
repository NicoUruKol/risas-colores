import { request } from "./http";

const TOKEN_KEY = "token";

// ✅ token en sessionStorage
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
PUBLIC
============================== */

export const listAll = async () => {
  const r = await request("/api/products?active=true");
  return r?.data ?? r;
};

export const getById = async (id) => {
  const r = await request(`/api/products/${id}`);
  return r?.data ?? r;
};

/* ==============================
ADMIN CRUD
============================== */

export const adminList = async ({ active } = {}) => {
  const url = withQuery("/api/products", { active });
  const r = await request(url, { headers: authHeaders() });
  return r?.data ?? r;
};

export const adminCreate = async (payload) => {
  const r = await request("/api/products", {
    method: "POST",
    body: payload,
    headers: authHeaders(),
  });
  return r?.data ?? r;
};

export const adminUpdate = async (id, payload) => {
  const r = await request(`/api/products/${id}`, {
    method: "PUT",
    body: payload,
    headers: authHeaders(),
  });
  return r?.data ?? r;
};

export const adminDelete = async (id) => {
  const r = await request(`/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return r?.data ?? r;
};

export const adminGetById = async (id) => {
  const r = await request(`/api/products/${id}/admin`, { headers: authHeaders() });
  return r?.data ?? r;
};

/* ==============================
ADMIN STOCK (movimientos)
PATCH /api/products/:id/stock
body: { size, delta, reason? }
============================== */

export const adminAdjustStock = async (id, { size, delta, reason } = {}) => {
  const payload = {
    size: String(size ?? "").trim(),
    delta: Number(delta),
    reason: reason === undefined || reason === null ? undefined : String(reason).trim(),
  };

  const r = await request(`/api/products/${id}/stock`, {
    method: "PATCH",
    body: payload,
    headers: authHeaders(),
  });

  return r?.data ?? r;
};
