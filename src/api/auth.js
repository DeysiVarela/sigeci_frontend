import { request, session } from "./http";

/**
 * Única función de login del frontend.
 * POST /api/auth/login  { identifier, password, captchaToken }
 *  - 200 -> { access, refresh, user }  (guarda la sesión y devuelve el usuario)
 *  - 400 -> CAPTCHA inválido o faltante
 *  - 401 -> credenciales inválidas
 */
export const login = async ({ identifier, password, captchaToken = "" }) => {
    const data = await request("/api/auth/login", {
        method: "POST",
        body: { identifier, password, captchaToken },
        auth: false,
    });
    session.save(data);
    return data.user;
};

export const logout = () => session.clear();

export const forgotPassword = (email) =>
    request("/api/auth/password/forgot/", { method: "POST", body: { email }, auth: false });

export const resetPassword = (email, pin, password) =>
    request("/api/auth/password/reset/", { method: "POST", body: { email, pin, password }, auth: false });
