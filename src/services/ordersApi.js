const API_URL = import.meta.env.VITE_API_URL;

const readJson = async (res) => {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
};

export const createOrder = async (payload) => {
    const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await readJson(res);

    if (!res.ok) {
        const err = new Error(data?.message || `Error HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data.data; // { id, status, total, init_point }
};
