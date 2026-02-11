const API_URL = import.meta.env.VITE_API_URL;

const readJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

const request = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
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
  const r = await request(`/api/products?active=true`);
  return Array.isArray(r) ? r : r.data;
};

export const getById = async (id) => {
  const r = await request(`/api/products/${id}`);
  return r?.data ?? r;
};


/* ==============================
ADMIN CRUD
============================== */
export const adminList = async () => {
  const r = await request(`/api/products`);
  return r.data;
};

export const adminCreate = async (payload) => {
  const r = await request(`/api/products`, { method: "POST", body: payload });
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
