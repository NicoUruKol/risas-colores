import { request } from "./http";

export const adminLogin = async ({ email, password }) => {
    const r = await request("/api/auth/login", {
        method: "POST",
        body: { email, password },
    });

    return r?.token;
};
