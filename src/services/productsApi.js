//ESTO VUELA POR EL BACKEND
import { products as mockProducts } from "../data/mockProducts";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const listAll = async () => {
  await delay(120);
  return mockProducts.filter((p) => p.active !== false);
};

export const getById = async (id) => {
  await delay(120);
  return mockProducts.find((p) => p.id === id && p.active !== false) ?? null;
};

// ===== ADMIN CRUD (mock) =====
export const adminList = async () => {
  await delay(120);
  return [...mockProducts];
};

export const adminCreate = async (payload) => {
  await delay(120);
  const id = payload.id?.trim() || crypto.randomUUID();
  return { ...payload, id, type: "product" };
};

export const adminUpdate = async (id, payload) => {
  await delay(120);
  return { ...payload, id, type: "product" };
};

export const adminDelete = async (id) => {
  await delay(120);
  return { ok: true, id };
};
