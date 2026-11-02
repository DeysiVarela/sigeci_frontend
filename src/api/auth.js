import { request } from "./http";

export const login = async ({ identifier, password, captchaToken }) =>
    request("/api/auth/login", {
        method: "POST",
        body: { identifier, password, captchaToken }
    });

export const register = (credentials) =>
    request("/api/auth/register", {
        method: "POST",
        body: credentials
    });

export const getCurrentUser = () => request("/api/auth/me");

export const logout = () =>
    request("/api/auth/logout", { method: "POST" });

export const forgotPassword = (email) =>
    request("/api/auth/recovery", {
        method: "POST",
        body: { email }
    });

export const resetPassword = ({ email, code, password }) =>
    request("/api/auth/reset-password", {
        method: "POST",
        body: { email, code, password }
    });
