const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
const ACCESS_TOKEN_KEY = "access";
const REFRESH_TOKEN_KEY = "refresh";

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

export const request = async (path, options = {}) => {
    const { skipAuthRefresh = false, ...fetchOptions } = options;
    const hasBody = options.body !== undefined && options.body !== null;
    const headers = {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(fetchOptions.headers || {})
    };
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    const body = hasBody && typeof fetchOptions.body !== "string"
        ? JSON.stringify(fetchOptions.body)
        : fetchOptions.body;
    const url = new URL(`${backendUrl}${path}`);

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

    if (response.status === 401 && !skipAuthRefresh && path !== "/api/auth/refresh/") {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
            try {
                const refreshResponse = await request("/api/auth/refresh/", {
                    method: "POST",
                    body: { refresh: refreshToken },
                    skipAuthRefresh: true
                });
                localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.access);
                return request(path, { ...fetchOptions, skipAuthRefresh: true });
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
