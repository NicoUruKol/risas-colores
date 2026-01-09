import { packs, products } from "../data/mockProducts";

const wait = (ms) => new Promise((r) => setTimeout(r, ms)); // simula red

export async function listBySala(sala) {
    await wait(150);
    return {
    packs: packs.filter((p) => p.sala === sala),
    products: products.filter((p) => p.sala === sala),
    };
}

export async function getById(id) {
    await wait(120);
    return packs.find((p) => p.id === id) || products.find((p) => p.id === id) || null;
}
