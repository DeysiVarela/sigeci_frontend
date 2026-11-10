import { useCallback, useEffect, useState } from "react";
import { getArticles } from "../utils/articleService";

const toFriendlyMessage = (error) => {
    if (error?.status) return error.message;
    if (error instanceof TypeError) return "No fue posible conectar con el servidor. Verifica tu conexión.";
    return error?.message || "Ocurrió un error inesperado al cargar los artículos.";
};

/**
 * Consulta paginada del catálogo. Cancela la petición anterior cuando cambian
 * los filtros/página para evitar que una respuesta vieja pise a la nueva.
 */
export const useArticleCatalog = (query, user) => {
    const [reloadKey, setReloadKey] = useState(0);
    const [result, setResult] = useState({ key: null, items: [], total: 0, error: null });

    const queryKey = JSON.stringify(query);
    const userId = user?.id;
    const userRole = user?.role;
    const requestKey = `${queryKey}|${userId}|${userRole}|${reloadKey}`;

    useEffect(() => {
        const controller = new AbortController();

        getArticles(JSON.parse(queryKey), { signal: controller.signal, user: { id: userId, role: userRole } })
            .then(({ items, total }) => setResult({ key: requestKey, items, total, error: null }))
            .catch((error) => {
                if (error?.name === "AbortError") return;
                setResult({ key: requestKey, items: [], total: 0, error: toFriendlyMessage(error) });
            });

        return () => controller.abort();
    }, [requestKey, queryKey, userId, userRole]);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    const loading = result.key !== requestKey;

    return {
        items: result.items,
        total: result.total,
        loading,
        error: loading ? null : result.error,
        reload
    };
};