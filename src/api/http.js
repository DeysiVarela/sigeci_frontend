const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const PROFILE_KEY = "profile";

const getStoredProfile = () => {
    const rawProfile = localStorage.getItem(PROFILE_KEY);
    if (!rawProfile || rawProfile === "undefined" || rawProfile === "null") return "1";
    const parsed = parseInt(rawProfile, 10);
    return Number.isNaN(parsed) ? rawProfile : String(parsed);
};

const buildApiUrl = (path) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const rootUrl = backendUrl.replace(/\/api\/v1$/, "");

    // Si la ruta ya empieza por /api/ (ej. /api/auth/password/forgot/, /api/users/), apunta a http://localhost:8000/api/...
    if (cleanPath.startsWith("/api/")) {
        return `${rootUrl}${cleanPath}`;
    }

    // Si la ruta no empieza por /api/ (ej. /auth/refresh/), usa http://localhost:8000/api/v1/...
    return `${rootUrl}/api/v1${cleanPath}`;
};

export class ApiError extends Error {
    constructor(status, message, data = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

const getErrorMessage = (payload, fallback) => {
    if (!payload || typeof payload !== "object") {
        return fallback;
    }

    if (payload.message) {
        return payload.message;
    }

    if (payload.detail) {
        return Array.isArray(payload.detail) ? payload.detail.join(" ") : payload.detail;
    }

    const fieldMessages = Object.values(payload)
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value) => typeof value === "string");

    return fieldMessages.length ? fieldMessages.join(" ") : fallback;
};

const isFormData = (value) => typeof FormData !== "undefined" && value instanceof FormData;

export const request = async (path, options = {}) => {
    const { skipAuthRefresh = false, ...fetchOptions } = options;
    const hasBody = options.body !== undefined && options.body !== null;
    // Con FormData el navegador pone solo el Content-Type (multipart + boundary): no se debe forzar JSON.
    const headers = {
        ...(hasBody && !isFormData(options.body) ? { "Content-Type": "application/json" } : {}),
        ...(fetchOptions.headers || {})
    };
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    const profile = getStoredProfile();
    if (profile && !headers.profile) {
        headers.profile = profile;
    }
    const body = hasBody && typeof fetchOptions.body !== "string" && !isFormData(fetchOptions.body)
        ? JSON.stringify(fetchOptions.body)
        : fetchOptions.body;
    const url = new URL(buildApiUrl(path));

    Object.entries(fetchOptions.params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, value);
        }
    });

    const response = await fetch(url, {
        ...fetchOptions,
        body,
        headers
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (response.status === 401 && !skipAuthRefresh && !path.includes("/auth/refresh")) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
            try {
                const refreshResponse = await request("/auth/refresh/", {
                    method: "POST",
                    body: { refresh_token: refreshToken },
                    skipAuthRefresh: true
                });
                const newToken = refreshResponse.data?.token || refreshResponse.token;
                if (newToken) {
                    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
                    return request(path, { ...fetchOptions, skipAuthRefresh: true });
                }
            } catch {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
            }
        }
    }

    if (!response.ok) {
        throw new ApiError(
            response.status,
            getErrorMessage(payload, "No fue posible completar la solicitud."),
            payload
        );
    }

    return payload;
};


const tryRefreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;
    try {
        const refreshResponse = await request("/api/auth/refresh/", {
            method: "POST",
            body: { refresh: refreshToken },
            skipAuthRefresh: true
        });
        localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.access);
        return true;
    } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return false;
    }
};

// POST multipart con progreso real (0-100). fetch() no informa el avance de una subida, por eso XMLHttpRequest.
// Mantiene el mismo contrato que request(): devuelve el JSON o lanza ApiError (status 0 = sin conexión).
export const uploadRequest = (path, formData, { onProgress, signal, skipAuthRefresh = false } = {}) =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", buildApiUrl(path));
        xhr.setRequestHeader("Accept", "application/json");
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (accessToken) xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        const profile = getStoredProfile();
        if (profile) xhr.setRequestHeader("profile", profile);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = async () => {
            let payload = null;
            try {
                payload = JSON.parse(xhr.responseText);
            } catch {
                payload = null;
            }

            if (xhr.status === 401 && !skipAuthRefresh && (await tryRefreshToken())) {
                uploadRequest(path, formData, { onProgress, signal, skipAuthRefresh: true }).then(resolve, reject);
                return;
            }

            if (xhr.status >= 200 && xhr.status < 300) return resolve(payload);

            reject(new ApiError(
                xhr.status,
                getErrorMessage(payload, "No fue posible completar la solicitud."),
                payload
            ));
        };

        xhr.onerror = () => reject(new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo."));
        xhr.onabort = () => reject(new DOMException("Subida cancelada", "AbortError"));
        signal?.addEventListener("abort", () => xhr.abort(), { once: true });

        xhr.send(formData);
    });