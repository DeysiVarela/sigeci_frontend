import axios from "axios";

export async function uploadFile(api, file, path = "uploads", { onProgress, signal } = {}) {
    // Pre firmar carga - debemos estar autenticados, por eso uso api (useFetch)
    const data = await api.post("uploads/sign/", {
        folder: path,
        filename: file.name,
        size: file.size,
    });

    // Cargo directo a S3 - sin exponer headers, por eso uso axios directo.
    await axios.put(data.url, file, {
        headers: { "Content-Type": data.content_type },
        signal,
        onUploadProgress: (e) => {
            if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
        },
    });

    return data.path;
}