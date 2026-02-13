import { request } from "./http";

const TOKEN_KEY = "token";

const getAdminToken = () => localStorage.getItem(TOKEN_KEY) || "";

const authHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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

export const adminList = async () => {
  const r = await request("/api/products", { headers: authHeaders() });
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
