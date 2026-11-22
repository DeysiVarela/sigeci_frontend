import { request, uploadRequest } from "./http";

// SCRUM-30: GET devuelve el artículo con su versión adjunta MÁS RECIENTE (corrected_version, o null).
export const getCorrectedVersion = (articleId, options = {}) =>
    request(`/api/articles/${articleId}/corrected-version/`, options);

// SCRUM-30: el autor sube su PDF corregido (multipart). Campo validado por el backend: corrected_pdf.
export const submitCorrectedVersion = (articleId, { correctedPdf }, options = {}) => {
    const formData = new FormData();
    formData.append("corrected_pdf", correctedPdf);
    return uploadRequest(`/api/articles/${articleId}/corrected-version/`, formData, options);
};

// SCRUM-31: el autor sube la versión final + el documento de copyright (multipart).
// Los nombres de campo son los que valida el backend: final_pdf y copyright_pdf.
export const submitFinalVersion = (articleId, { finalPdf, copyrightFile }, options = {}) => {
    const formData = new FormData();
    formData.append("final_pdf", finalPdf);
    formData.append("copyright_pdf", copyrightFile);
    return uploadRequest(`/api/articles/${articleId}/final-submission/`, formData, options);
};

// SCRUM-176: Obtener los artículos de un tópico específico para la pantalla de Drag & Drop
export const getArticlesByTopic = (topicId) => {
    return request(`/api/articles/topics/${topicId}/articles/`, {
        method: "GET",
    });
};

// SCRUM-176: Guardar el nuevo orden de los artículos después de arrastrarlos
export const reorderArticles = (orderedIds) => {
    return request("/api/articles/reorder/", {
        method: "POST",
        body: { ordered_ids: orderedIds },
    });
};