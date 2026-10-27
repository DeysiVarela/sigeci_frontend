import { request, session } from "./http";

export const login = async (email, password) => {
    const data = await request("/api/auth/login/", { method: "POST", body: { email, password }, auth: false });
    session.save(data);
    return data.user;
};

export const logout = () => session.clear();

export const forgotPassword = (email) =>
    request("/api/auth/password/forgot/", { method: "POST", body: { email }, auth: false });

export const resetPassword = (email, pin, password) =>
    request("/api/auth/password/reset/", { method: "POST", body: { email, pin, password }, auth: false });
