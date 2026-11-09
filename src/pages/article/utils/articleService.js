// Servicio de consulta del catálogo de artículos.
//
// Variables de entorno (Vite):
//   VITE_API_URL           URL base del backend (ej. http://localhost:8080/api)
//   VITE_ARTICLES_MOCK     "false" para consumir el backend real (por defecto usa el mock)
//   VITE_API_PAGE_BASE     0 si el backend numera páginas desde 0 (Spring), 1 por defecto
//
// Contrato esperado:  GET {VITE_API_URL}/articles?page=&size=&scope=&topic=&status=&dateFrom=&dateTo=
//   - scope: "assigned" (miembro del comité) | "mine" | "public" (autor); el admin no lo envía
//   - dateFrom / dateTo: YYYY-MM-DD, ambos inclusivos, sobre la fecha de postulación
//   - Respuesta: { content, totalElements } | { items, total } | { data, count }
import { MOCK_ARTICLES } from "../mockArticles";
import { CATALOG_SCOPE, DEFAULT_PAGE_SIZE } from "./constants";
import { isAdmin, isAssignedReviewer, isAuthor, isMember, isOwner, isPublicArticle } from "./permissions";

const env = import.meta.env ?? {};
const API_URL = (env.VITE_API_URL ?? "").replace(/\/$/, "");
const USE_MOCK = env.VITE_ARTICLES_MOCK !== "false";
const SERVER_PAGE_BASE = Number(env.VITE_API_PAGE_BASE ?? 1);
const MOCK_LATENCY_MS = 450;

/** Construye los query params HTTP a partir del estado del catálogo (CA-02 filtrado). */
export const buildArticleQuery = ({
    page = 1,
    size = DEFAULT_PAGE_SIZE,
    scope,
    topic,
    status,
    dateFrom,
    dateTo
} = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page - 1 + SERVER_PAGE_BASE));
    params.set("size", String(size));
    if (scope && scope !== CATALOG_SCOPE.ALL) params.set("scope", scope);
    if (topic) params.set("topic", topic);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params;
};

/** Normaliza las formas de respuesta paginada más comunes a { items, total }. */
export const normalizePage = (body) => {
    if (Array.isArray(body)) return { items: body, total: body.length };
    const items = body?.content ?? body?.items ?? body?.data ?? [];
    const total = body?.totalElements ?? body?.total ?? body?.count ?? items.length;
    return { items, total: Number(total) || 0 };
};

// TODO: reemplazar por el cliente HTTP / manejo de sesión del proyecto si ya existe uno
const getAuthHeaders = () => {
    const token = localStorage.getItem("sigeci_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getArticles = async (query, { signal, user } = {}) => {
    if (USE_MOCK) return getArticlesMock(query, user, { signal });

    const response = await fetch(`${API_URL}/articles?${buildArticleQuery(query)}`, {
        signal,
        headers: { Accept: "application/json", ...getAuthHeaders() }
    });

    if (!response.ok) {
        const error = new Error(
            response.status === 401 || response.status === 403
                ? "No tienes permisos para consultar estos artículos."
                : `El servidor respondió con un error (${response.status}).`
        );
        error.status = response.status;
        throw error;
    }
    return normalizePage(await response.json());
};

/* ------------------------------------------------------------------ */
/* Mock que replica el comportamiento esperado del backend             */
/* ------------------------------------------------------------------ */

/** RBAC del catálogo (CA-05 catálogo / CA-06 filtrado). */
export const filterVisibleArticles = (articles, user, scope) => {
    if (isAdmin(user)) return articles;
    if (isMember(user)) return articles.filter((a) => isAssignedReviewer(user, a));
    if (!isAuthor(user)) return [];
    if (scope === CATALOG_SCOPE.PUBLIC) return articles.filter(isPublicArticle);
    return articles.filter((a) => isOwner(user, a));
};

export const applyCatalogFilters = (articles, { topic, status, dateFrom, dateTo } = {}) =>
    articles.filter(
        (a) =>
            (!topic || a.topic === topic) &&
            (!status || a.status === status) &&
            (!dateFrom || a.submittedAt >= dateFrom) &&
            (!dateTo || a.submittedAt <= dateTo)
    );

export const queryArticles = (source, query = {}, user) => {
    const page = query.page ?? 1;
    const size = query.size ?? DEFAULT_PAGE_SIZE;
    const matching = applyCatalogFilters(filterVisibleArticles(source, user, query.scope), query).sort(
        (a, b) => b.submittedAt.localeCompare(a.submittedAt) || b.id - a.id
    );
    const start = (page - 1) * size;
    return { items: matching.slice(start, start + size), total: matching.length };
};

const getArticlesMock = (query, user, { signal } = {}) =>
    new Promise((resolve, reject) => {
        const abortError = () => new DOMException("Consulta cancelada", "AbortError");
        if (signal?.aborted) return reject(abortError());
        const timer = setTimeout(
            () => resolve(queryArticles(MOCK_ARTICLES, query, user)),
            MOCK_LATENCY_MS
        );
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(timer);
                reject(abortError());
            },
            { once: true }
        );
    });
