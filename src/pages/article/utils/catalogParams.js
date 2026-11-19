// Estado del catálogo <-> query string de la URL.
// Guardar filtros y página en la URL permite volver desde "Ver detalle"
// sin perder la búsqueda y compartir el enlace con los filtros aplicados.
import {
    CATALOG_SCOPE,
    DEFAULT_PAGE_SIZE,
    PAGE_SIZE_OPTIONS,
    TOPICS,
    getStatusOptionsForScope
} from "./constants";
import { getAllowedScopes } from "./permissions";

export const EMPTY_FILTERS = Object.freeze({ topic: "", status: "", dateFrom: "", dateTo: "" });

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

/** Lee y sanea el estado del catálogo según el rol del usuario. */
export const readCatalogParams = (searchParams, user) => {
    const allowedScopes = getAllowedScopes(user);
    const rawScope = searchParams.get("scope");
    const scope = allowedScopes.includes(rawScope) ? rawScope : allowedScopes[0];

    const rawTopic = searchParams.get("topic") ?? "";
    const topic = TOPICS.some((t) => t.value === rawTopic) ? rawTopic : "";

    // CA-06 filtrado: un autor en "públicos" no puede pedir estados no públicos
    const rawStatus = searchParams.get("status") ?? "";
    const status = getStatusOptionsForScope(scope).includes(rawStatus) ? rawStatus : "";

    let dateFrom = isIsoDate(searchParams.get("dateFrom")) ? searchParams.get("dateFrom") : "";
    let dateTo = isIsoDate(searchParams.get("dateTo")) ? searchParams.get("dateTo") : "";
    if (dateFrom && dateTo && dateFrom > dateTo) dateTo = "";

    const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
    const rawSize = Number.parseInt(searchParams.get("size"), 10);
    const size = PAGE_SIZE_OPTIONS.includes(rawSize) ? rawSize : DEFAULT_PAGE_SIZE;

    return { scope, topic, status, dateFrom, dateTo, page, size };
};

/** Serializa el estado omitiendo valores por defecto para mantener la URL limpia. */
export const toSearchParams = (catalog) => {
    const params = new URLSearchParams();
    if (catalog.scope && catalog.scope !== CATALOG_SCOPE.ALL) params.set("scope", catalog.scope);
    ["topic", "status", "dateFrom", "dateTo"].forEach((key) => {
        if (catalog[key]) params.set(key, catalog[key]);
    });
    if (catalog.page > 1) params.set("page", String(catalog.page));
    if (catalog.size !== DEFAULT_PAGE_SIZE) params.set("size", String(catalog.size));
    return params;
};

export const hasActiveFilters = (catalog) =>
    Boolean(catalog.topic || catalog.status || catalog.dateFrom || catalog.dateTo);

/**
 * Aplica un cambio parcial. Cualquier cambio de filtro vuelve a la página 1;
 * un rango de fechas invertido limpia el extremo contrario.
 */
export const mergeCatalog = (current, patch) => {
    const next = { ...current, ...patch };
    if (!("page" in patch)) next.page = 1;
    if (next.dateFrom && next.dateTo && next.dateFrom > next.dateTo) {
        if ("dateFrom" in patch) next.dateTo = "";
        else next.dateFrom = "";
    }
    return next;
};
