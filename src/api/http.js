// Cliente HTTP base: agrega el token, renueva el access token una vez si vence
// y normaliza los errores del backend (DRF) a un mensaje legible.

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export class ApiError extends Error {
    constructor(status, message, fields = {}) {
        super(message);
        this.status = status;
        this.fields = fields; // errores por campo: { email: "Ya existe..." }
    }
}

export const session = {
    get access() { return localStorage.getItem("token"); },
    get refresh() { return localStorage.getItem("refresh"); },
    save({ access, refresh, user }) {
        if (access) localStorage.setItem("token", access);
        if (refresh) localStorage.setItem("refresh", refresh);
        if (user) {
            localStorage.setItem("name", `${user.name} ${user.lastname}`);
            localStorage.setItem("email", user.email);
            localStorage.setItem("profile", user.profile_name);
            localStorage.setItem("permissions", JSON.stringify(user.permissions || {}));
        }
    },
    clear() {
        ["token", "refresh", "name", "email", "profile", "permissions"].forEach((k) => localStorage.removeItem(k));
    },
    can(action, permission) {
        try {
            const perms = JSON.parse(localStorage.getItem("permissions") || "{}");
            return (perms[action] || []).includes(permission);
        } catch {
            return false;
        }
    },
};

const parseError = async (res) => {
    let body = null;
    try { body = await res.json(); } catch { /* sin cuerpo */ }
    const fields = {};
    let message = "Ocurrió un error inesperado.";
    if (body && typeof body === "object") {
        if (body.detail) message = Array.isArray(body.detail) ? body.detail.join(" ") : body.detail;
        for (const [k, v] of Object.entries(body)) {
            if (k !== "detail") fields[k] = Array.isArray(v) ? v.join(" ") : String(v);
        }
        if (!body.detail && Object.keys(fields).length) message = Object.values(fields).join(" ");
    }
    return new ApiError(res.status, message, fields);
};

let refreshing = null;
const refreshAccess = async () => {
    if (!session.refresh) return false;
    refreshing ??= fetch(`${BASE_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: session.refresh }),
    })
        .then(async (res) => {
            if (!res.ok) return false;
            session.save(await res.json());
            return true;
        })
        .catch(() => false)
        .finally(() => { refreshing = null; });
    return refreshing;
};

export const request = async (path, { method = "GET", body, params, auth = true } = {}, retry = true) => {
    const url = new URL(`${BASE_URL}${path}`);
    Object.entries(params || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });

    const headers = { "Content-Type": "application/json" };
    if (auth && session.access) headers.Authorization = `Bearer ${session.access}`;

    let res;
    try {
        res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch {
        throw new ApiError(0, "No se pudo conectar con el servidor.");
    }

    if (res.status === 401 && auth && retry && (await refreshAccess())) {
        return request(path, { method, body, params, auth }, false);
    }
    if (res.status === 401 && auth) {
        session.clear();
        window.location.assign("/login");
    }
    if (!res.ok) throw await parseError(res);
    return res.status === 204 ? null : res.json();
};
