
export const MAX_FILE_MB = 10;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export const FILE_RULES = Object.freeze({
    // Versión corregida / final: solo PDF
    pdf: { extensions: [".pdf"], accept: ".pdf,application/pdf", label: "debe ser un PDF" },
    // Copyright: el backend acepta PDF o imagen
    copyright: {
        extensions: [".pdf", ".jpg", ".jpeg", ".png"],
        accept: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
        label: "debe ser un PDF o una imagen (JPG/PNG)"
    }
});

/** Devuelve el mensaje de error o null si el archivo es válido. `kind`: "pdf" | "copyright". */
export const validateVersionFile = (file, kind, documentName = "archivo") => {
    if (!file) return "Selecciona un archivo.";
    const rule = FILE_RULES[kind];
    const name = String(file.name ?? "").toLowerCase();
    if (!rule.extensions.some((ext) => name.endsWith(ext))) {
        return `El ${documentName} ${rule.label}.`;
    }
    if (file.size === 0) return `El ${documentName} está vacío.`;
    if (file.size > MAX_FILE_BYTES) return `El ${documentName} no debe superar los ${MAX_FILE_MB} MB.`;
    return null;
};

/** Las URLs locales del backend llegan relativas (/media/...): se completan con la URL del backend. */
export const toAbsoluteUrl = (url, backendUrl = "") => {
    if (!url) return "#";
    if (/^https?:\/\//i.test(url)) return url;
    return `${String(backendUrl).replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
};

/** "1.0" → "v1.0" · "Final" → "Final" */
export const formatVersionLabel = (version) => {
    const text = String(version ?? "").trim();
    if (!text) return "—";
    return /^\d/.test(text) ? `v${text}` : text;
};

/** article_attached (backend) → fila del historial de la UI. */
export const normalizeAttachment = (raw, backendUrl = "") => {
    if (!raw) return null;
    const url = toAbsoluteUrl(raw.article_attached_url, backendUrl);
    const lastSegment = String(raw.article_attached_url ?? "").split("?")[0].split("/").pop();
    let name = lastSegment;
    try {
        name = decodeURIComponent(lastSegment);
    } catch {
        // nombre con % inválido: se deja tal cual
    }
    return {
        id: raw.article_attached_id,
        version: formatVersionLabel(raw.article_attached_version),
        date: String(raw.article_attached_created_at ?? "").slice(0, 10) || "—",
        url,
        name: name || "Documento"
    };
};