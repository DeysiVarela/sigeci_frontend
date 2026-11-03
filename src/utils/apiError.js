// Convierte el error que lanza request() en un texto legible para el usuario.
// Soporta el formato de Django REST Framework: { detail: "..." } o { campo: ["mensaje"] }.
const FIELD_LABELS = {
    name: "Nombre",
    lastname: "Apellido",
    email: "Correo",
    password: "Contraseña",
    profile: "Rol",
    active: "Estado",
};

const flatten = (data) => {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.map(flatten).filter(Boolean).join(" ");
    if (typeof data === "object") {
        if (data.detail) return flatten(data.detail);
        return Object.entries(data)
            .map(([key, value]) => {
                const text = flatten(value);
                return FIELD_LABELS[key] ? `${FIELD_LABELS[key]}: ${text}` : text;
            })
            .filter(Boolean)
            .join(" ");
    }
    return String(data);
};

export const getErrorMessage = (err, fallback = "Ocurrió un error. Intenta de nuevo.") => {
    // 1. El error trae el cuerpo de la respuesta ya parseado
    const payload = err?.data ?? err?.body ?? err?.response?.data ?? err?.payload;
    const fromPayload = flatten(payload);
    if (fromPayload) return fromPayload;

    // 2. El mensaje del error es el JSON del backend en texto
    if (typeof err?.message === "string") {
        try {
            const fromMessage = flatten(JSON.parse(err.message));
            if (fromMessage) return fromMessage;
        } catch {
            // el mensaje no es JSON, se usa tal cual
        }
    }

    return err?.message || fallback;
};
