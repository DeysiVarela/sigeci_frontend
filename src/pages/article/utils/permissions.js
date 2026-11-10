// Reglas RBAC del módulo de artículos (lado cliente).
// IMPORTANTE: son solo para la UI. El backend debe aplicar las mismas reglas
// sobre el token, porque cualquier usuario puede llamar al endpoint directamente.
import { CATALOG_SCOPE, PUBLIC_STATUSES, ROLES, ARTICLE_STATUS, normalizeRole } from "./constants";

const roleOf = (user) => normalizeRole(user?.role);

export const isAdmin = (user) => roleOf(user) === ROLES.ADMIN;

// Miembro del comité científico: evalúa los artículos que le asignan
export const isMember = (user) => roleOf(user) === ROLES.MEMBER;

// Comité y administrador: evalúan y hacen seguimiento, no postulan
export const isCommittee = (user) => isAdmin(user) || isMember(user);

// Autor: se valida explícitamente (un rol desconocido ya NO cuenta como autor)
export const isAuthor = (user) => roleOf(user) === ROLES.AUTOR;

export const isOwner = (user, article) =>
    article?.authorId != null && user?.id != null && String(article.authorId) === String(user.id);

// ¿El artículo fue asignado a este miembro para evaluar?
export const isAssignedReviewer = (user, article) =>
    user?.id != null && (article?.reviewerIds ?? []).some((id) => String(id) === String(user.id));

export const isPublicArticle = (article) => PUBLIC_STATUSES.includes(article?.status);

// Consultar detalle: admin todo; miembro solo sus asignados; autor lo propio o lo publicado
export const canViewArticle = (user, article) => {
    if (!user || !article) return false;
    if (isAdmin(user)) return true;
    if (isMember(user)) return isAssignedReviewer(user, article) || isPublicArticle(article);
    if (isAuthor(user)) return isOwner(user, article) || isPublicArticle(article);
    return false;
};

// Modificar: el admin no edita artículos desde el catálogo
// autor solo los propios (título, línea temática, autores, resumen, etc) mientras no esté deshabilitado
// El miembro del comité no edita artículos desde el catálogo (la calificación es otra historia).
export const canEditArticle = (user, article) => {
    if (!user || !article) return false;
    if (isAdmin(user)) return false; 
    if (isMember(user)) return false;
    if (isAuthor(user)) return isOwner(user, article) && article.status !== ARTICLE_STATUS.DESHABILITADO;
    return false;
};


// Solo el autor postula artículos
export const canCreateArticle = (user) => isAuthor(user);

// Vistas: admin una (todo); miembro una (asignados y catalogo publico); autor dos (propios y catalogo publico)
export const getAllowedScopes = (user) => {
    if (isAdmin(user)) return [CATALOG_SCOPE.ALL];
    if (isMember(user)) return [CATALOG_SCOPE.ASSIGNED, CATALOG_SCOPE.PUBLIC];
    if (isAuthor(user)) return [CATALOG_SCOPE.MINE, CATALOG_SCOPE.PUBLIC];
    return [];
};