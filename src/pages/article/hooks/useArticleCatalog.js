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
    const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
    const [reloadKey, setReloadKey] = useState(0);

    const queryKey = JSON.stringify(query);
    const userKey = `${user?.id}|${user?.role}`;

    useEffect(() => {
        const controller = new AbortController();
        setState((prev) => ({ ...prev, loading: true, error: null }));

        getArticles(JSON.parse(queryKey), { signal: controller.signal, user })
            .then(({ items, total }) => setState({ items, total, loading: false, error: null }))
            .catch((error) => {
                if (error?.name === "AbortError") return;
                setState({ items: [], total: 0, loading: false, error: toFriendlyMessage(error) });
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey, userKey, reloadKey]);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    return { ...state, reload };
};
