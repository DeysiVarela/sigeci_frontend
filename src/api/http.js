const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "ApiError";
        this.status = status;
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
    const hasBody = options.body !== undefined && options.body !== null;
    const headers = {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
    };
    const body = hasBody && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body;
    const url = new URL(`${backendUrl}${path}`);

    Object.entries(options.params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, value);
        }
    });

    const response = await fetch(url, {
        ...options,
        body,
        credentials: "include",
        headers
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        throw new ApiError(
            response.status,
            getErrorMessage(payload, "No fue posible completar la solicitud.")
        );
    }

    return payload;
};
