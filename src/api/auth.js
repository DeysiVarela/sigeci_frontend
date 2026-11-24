import { request } from "./http";

export const login = async ({ identifier, password, captchaToken }) => {
    const response = await request("/api/auth/login/", {
        method: "POST",
        body: { identifier, password, captchaToken }
    });
    localStorage.setItem("access", response.access);
    localStorage.setItem("refresh", response.refresh);
    localStorage.setItem("user", JSON.stringify(response.user));
    return response;
};

export const register = ({ name, lastname, email, password, captchaToken }) =>
    request("/api/auth/register/", {
        method: "POST",
        body: { name, lastname, email, password, captchaToken }
    });

export const getCurrentUser = () => request("/auth/me/");

// Claves de sesión: las actuales (login con /api/v1: token, refreshToken, profile...) y las legacy (access, refresh).
// Se conserva "language": es una preferencia de la persona, no de la sesión.
const SESSION_KEYS = [
    "token", "refreshToken", "name", "lastname", "email", "id", "permissions", "profiles", "profile",
    "user", "user_uuid", "photo", "auth", "access", "refresh",
];

export const logout = () => {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const forgotPassword = (email) =>
    request("/api/auth/password/forgot/", {
        method: "POST",
        body: { email }
    });

export const resetPassword = ({ email, code, password }) =>
    request("/api/auth/password/reset/", {
        method: "POST",
        body: { email, pin: code, password }
    });
