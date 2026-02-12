const API_BASE = import.meta.env.VITE_API_URL;

/* ==============================
Utils
============================== */

const joinUrl = (base, path) => {
  const b = String(base).replace(/\/+$/, "");
  const p = String(path).replace(/^\/+/, "");
  return `${b}/${p}`;
};

const readJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

const request = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(joinUrl(API_BASE, path), {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await readJson(res);

  if (!res.ok) {
    const err = new Error(data?.message || `Error HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
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
  const r = await request("/api/products");
  return r.data;
};

export const adminCreate = async (payload) => {
  const r = await request("/api/products", { method: "POST", body: payload });
  return r.data;
};

export const adminUpdate = async (id, payload) => {
  const r = await request(`/api/products/${id}`, { method: "PUT", body: payload });
  return r.data;
};

export const adminDelete = async (id) => {
  const r = await request(`/api/products/${id}`, { method: "DELETE" });
  return r.data;
};
