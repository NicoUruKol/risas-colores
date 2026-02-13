import { request } from "./http";

export const adminLogin = async ({ email, password }) => {
    const r = await request("/api/auth/login", {
        method: "POST",
        body: { email, password },
    });
    

    const token = r?.token;
    if (!token) throw new Error(r?.message || "Login: no llegó token");
    return token;

};
