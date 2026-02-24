import { request, authHeaders } from "./http";

/* Público */
export const getGoogleReviewsContent = async () => {
    const r = await request("/api/reviews/google-reviews");
    return r?.data ?? r;
};

/* Admin */
export const getGoogleReviewsAdmin = async () => {
    const r = await request("/api/reviews/google-reviews/admin", {
        headers: authHeaders(),
    });
    return r?.data ?? r;
};

export const saveGoogleReviewsUrl = async (googleReviewsUrl) => {
    const r = await request("/api/reviews/google-reviews/url", {
        method: "PUT",
        body: { googleReviewsUrl },
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};

export const createGoogleReview = async (payload) => {
    const r = await request("/api/reviews/google-reviews", {
        method: "POST",
        body: payload,
        headers: authHeaders(),
    });
    return r?.saved ?? r;
    };

    export const updateGoogleReview = async (id, payload) => {
    const r = await request(`/api/reviews/google-reviews/${id}`, {
        method: "PUT",
        body: payload,
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};

export const setGoogleReviewActive = async (id, active) => {
    const r = await request(`/api/reviews/google-reviews/${id}/active`, {
        method: "PATCH",
        body: { active },
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};

export const deleteGoogleReview = async (id) => {
    const r = await request(`/api/reviews/google-reviews/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return r?.saved ?? r;
};