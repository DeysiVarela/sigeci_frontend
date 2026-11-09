import { describe, expect, it } from "vitest";
import { MOCK_ARTICLES } from "../mockArticles";
import { buildArticleQuery, normalizePage, queryArticles } from "../utils/articleService";
import { mergeCatalog, readCatalogParams, toSearchParams } from "../utils/catalogParams";
import { canEditArticle, canViewArticle } from "../utils/permissions";
import { CATALOG_SCOPE, PUBLIC_STATUSES } from "../utils/constants";

const AUTOR = { id: 101, role: "AUTOR" };
const MEMBER = { id: 25, role: "MEMBER" }; // como llega de la sesión real
const ADMIN = { id: 901, role: "ADMIN" };
const all = (user, query) => queryArticles(MOCK_ARTICLES, { page: 1, size: 100, ...query }, user).items;

describe("RBAC del catálogo (CA-05 / CA-06)", () => {
    it("el admin ve todos los artículos", () => {
        expect(all(ADMIN, {}).length).toBe(MOCK_ARTICLES.length);
    });

    it("el miembro del comité solo ve los artículos asignados para evaluar", () => {
        const assigned = all(MEMBER, { scope: CATALOG_SCOPE.ASSIGNED });
        expect(assigned.map((a) => a.id).sort((a, b) => a - b)).toEqual([2, 3, 8, 14, 20]);
        expect(all({ id: 999, role: "MEMBER" }, {})).toHaveLength(0);
    });

    it("vistas por rol: admin una, miembro una (asignados), autor dos", () => {
        expect(readCatalogParams(new URLSearchParams(), ADMIN).scope).toBe(CATALOG_SCOPE.ALL);
        expect(readCatalogParams(new URLSearchParams("scope=all"), MEMBER).scope).toBe(CATALOG_SCOPE.ASSIGNED);
        expect(readCatalogParams(new URLSearchParams(), AUTOR).scope).toBe(CATALOG_SCOPE.MINE);
    });

    it("el autor en 'mis artículos' solo ve los suyos, en cualquier estado", () => {
        const mine = all(AUTOR, { scope: CATALOG_SCOPE.MINE });
        expect(mine.length).toBeGreaterThan(0);
        expect(mine.every((a) => a.authorId === 101)).toBe(true);
        expect(new Set(mine.map((a) => a.status)).size).toBeGreaterThan(1);
    });

    it("el autor en 'publicados' solo ve artículos públicos (de cualquier autor)", () => {
        const pub = all(AUTOR, { scope: CATALOG_SCOPE.PUBLIC });
        expect(pub.every((a) => PUBLIC_STATUSES.includes(a.status))).toBe(true);
        expect(pub.some((a) => a.authorId !== 101)).toBe(true);
    });

    it("el autor no puede ver artículos EN_REVISION de otros, aunque lo pida por filtro", () => {
        const pub = all(AUTOR, { scope: CATALOG_SCOPE.PUBLIC, status: "EN_REVISION" });
        expect(pub).toHaveLength(0);
        const params = readCatalogParams(new URLSearchParams("scope=public&status=EN_REVISION"), AUTOR);
        expect(params.status).toBe("");
    });

    it("un autor que pide scope=all cae en sus propios artículos", () => {
        const params = readCatalogParams(new URLSearchParams("scope=all"), AUTOR);
        expect(params.scope).toBe(CATALOG_SCOPE.MINE);
    });

    it("permisos de detalle y edición", () => {
        const ajenoEnRevision = MOCK_ARTICLES.find((a) => a.authorId !== 101 && a.status === "EN_REVISION");
        const ajenoPublicado = MOCK_ARTICLES.find((a) => a.authorId !== 101 && PUBLIC_STATUSES.includes(a.status));
        const propio = MOCK_ARTICLES.find((a) => a.authorId === 101);
        expect(canViewArticle(AUTOR, ajenoEnRevision)).toBe(false);
        expect(canViewArticle(AUTOR, ajenoPublicado)).toBe(true);
        expect(canEditArticle(AUTOR, ajenoPublicado)).toBe(false);
        expect(canEditArticle(AUTOR, propio)).toBe(true);
        const noAsignado = MOCK_ARTICLES.find((a) => !a.reviewerIds.includes(25));
        expect(canViewArticle(MEMBER, ajenoEnRevision)).toBe(ajenoEnRevision.reviewerIds.includes(25));
        expect(canViewArticle(MEMBER, noAsignado)).toBe(false);
        expect(canEditArticle(MEMBER, noAsignado)).toBe(false);
        expect(canEditArticle(ADMIN, noAsignado)).toBe(true);
    });
});

describe("Filtros combinables (CA-01 / CA-02)", () => {
    it("filtra por línea temática", () => {
        const res = all(ADMIN, { topic: "sistemas_inteligentes" });
        expect(res.length).toBeGreaterThan(0);
        expect(res.every((a) => a.topic === "sistemas_inteligentes")).toBe(true);
    });

    it("combina línea, estado y rango de fechas (inclusivo)", () => {
        const res = all(ADMIN, {
            topic: "sistemas_inteligentes",
            status: "CON_AVAL_PUBLICACION",
            dateFrom: "2026-08-04",
            dateTo: "2026-08-22"
        });
        expect(res.map((a) => a.id).sort()).toEqual([1, 5]);
    });

    it("sin coincidencias devuelve lista vacía y total 0 (CA-05)", () => {
        const res = queryArticles(MOCK_ARTICLES, { dateFrom: "2030-01-01" }, ADMIN);
        expect(res).toEqual({ items: [], total: 0 });
    });

    it("envía solo los parámetros activos en la consulta HTTP", () => {
        const qs = buildArticleQuery({ page: 2, size: 10, scope: "public", topic: "sistemas_software" }).toString();
        expect(qs).toBe("page=2&size=10&scope=public&topic=sistemas_software");
        expect(buildArticleQuery({ page: 1, size: 20, scope: "all" }).toString()).toBe("page=1&size=20");
    });
});

describe("Paginación del servidor (CA-02 / CA-03)", () => {
    it("pagina y mantiene el total de coincidencias", () => {
        const p1 = queryArticles(MOCK_ARTICLES, { page: 1, size: 10 }, ADMIN);
        const p3 = queryArticles(MOCK_ARTICLES, { page: 3, size: 10 }, ADMIN);
        expect(p1.items).toHaveLength(10);
        expect(p1.total).toBe(MOCK_ARTICLES.length);
        expect(p3.items).toHaveLength(MOCK_ARTICLES.length - 20);
    });

    it("cambiar un filtro reinicia a la página 1; cambiar de página no", () => {
        const base = readCatalogParams(new URLSearchParams("page=3"), ADMIN);
        expect(mergeCatalog(base, { topic: "sistemas_software" }).page).toBe(1);
        expect(mergeCatalog(base, { page: 2 }).page).toBe(2);
    });

    it("un rango invertido limpia el extremo contrario", () => {
        const base = { ...readCatalogParams(new URLSearchParams(), MEMBER), dateTo: "2026-08-10" };
        expect(mergeCatalog(base, { dateFrom: "2026-09-01" }).dateTo).toBe("");
    });

    it("la URL omite valores por defecto", () => {
        const c = readCatalogParams(new URLSearchParams("topic=sistemas_software"), ADMIN);
        expect(toSearchParams(c).toString()).toBe("topic=sistemas_software");
    });

    it("normaliza respuestas tipo Spring y genéricas", () => {
        expect(normalizePage({ content: [1, 2], totalElements: 40 })).toEqual({ items: [1, 2], total: 40 });
        expect(normalizePage({ items: [1], total: 7 })).toEqual({ items: [1], total: 7 });
    });
});
