import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import DataTable from "react-data-table-component";
import Card from "../../components/cards/Card";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import StatusBadge from "./components/StatusBadge";
import ArticleFilters from "./components/ArticleFilters";
import ArticleCardList from "./components/ArticleCardList";
import CatalogPagination from "./components/CatalogPagination";
import { CatalogEmptyState, CatalogError, TableSkeleton } from "./components/CatalogStates";
import { useArticleCatalog } from "./hooks/useArticleCatalog";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { CATALOG_SCOPE, getStatusOptionsForScope, getTopicLabel } from "./utils/constants";
import { canCreateArticle, canEditArticle, getAllowedScopes } from "./utils/permissions";
import { formatSubmittedDate } from "./utils/catalogFormat";
import {
    EMPTY_FILTERS,
    hasActiveFilters,
    mergeCatalog,
    readCatalogParams,
    toSearchParams
} from "./utils/catalogParams";

// Pestañas posibles del catálogo. Cada usuario ve las de sus vistas permitidas
// (getAllowedScopes): autor -> mine + public; miembro -> assigned + public.
const CATALOG_TABS = [
    {
        scope: CATALOG_SCOPE.MINE,
        label: "Mis artículos",
        shortLabel: "Mis artículos",
        icon: "bi-person-lines-fill",
        hint: "Artículos que has postulado y su estado actual de revisión."
    },
    {
        scope: CATALOG_SCOPE.ASSIGNED,
        label: "Asignados para evaluar",
        shortLabel: "Por evaluar",
        icon: "bi-clipboard-check",
        hint: "Artículos que te asignaron para evaluar y su estado actual."
    },
    {
        scope: CATALOG_SCOPE.PUBLIC,
        label: "Artículos publicados",
        shortLabel: "Publicados",
        icon: "bi-globe2",
        hint: "Artículos de dominio público publicados en las memorias de la conferencia."
    }
];

// Textos de cabecera según la vista del usuario
const SCOPE_SUBTITLE = {
    all: "Todos los artículos postulados a la conferencia y su estado de postulación.",
    assigned: "Consulta los artículos que te asignaron para evaluar y los publicados en las memorias.",
    mine: "Consulta tus postulaciones y los artículos publicados en las memorias.",
    public: "Consulta tus postulaciones y los artículos publicados en las memorias."
};
const SCOPE_TITLE = {
    all: "Artículos postulados",
    assigned: "Artículos asignados para evaluar"
};

const ArticleScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const user = useCurrentUser();
    // Vistas del usuario: la primera es la de inicio (define el subtítulo de la página)
    const allowedScopes = getAllowedScopes(user);
    const tabs = CATALOG_TABS.filter((t) => allowedScopes.includes(t.scope));

    // Estado del catálogo derivado de la URL (filtros + página + vista)
    const catalog = useMemo(() => readCatalogParams(searchParams, user), [searchParams, user]);
    const { items, total, loading, error, reload } = useArticleCatalog(catalog, user);
    const filtersActive = hasActiveFilters(catalog);

    const updateCatalog = useCallback(
        (patch) => setSearchParams(toSearchParams(mergeCatalog(catalog, patch)), { replace: true }),
        [catalog, setSearchParams]
    );
    const clearFilters = () => updateCatalog({ ...EMPTY_FILTERS });

    // Si la página quedó fuera de rango (p. ej. tras filtrar), ir a la última disponible
    useEffect(() => {
        if (loading || error || total === 0) return;
        const lastPage = Math.ceil(total / catalog.size);
        if (catalog.page > lastPage) updateCatalog({ page: lastPage });
    }, [loading, error, total, catalog.page, catalog.size, updateCatalog]);

    // Mensaje de retroalimentación que llega desde crear/editar
    const [alertNotification, setAlertNotification] = useState(() =>
        location.state?.message
            ? {
                type: location.state.type || "success",
                title: location.state.title || "Operación exitosa",
                message: location.state.message
            }
            : null
    );

    const goToDetail = (article) =>
        navigate(`/article/${article.id}`, { state: { from: `/article${location.search}` } });

    const renderActions = (article, compact = false) => (
        <>
            <ButtonSecondary
                label="Ver detalle"
                className={`btn-sm py-1 px-2 text-nowrap ${compact ? "flex-fill" : ""}`}
                onClick={() => goToDetail(article)}
            />
            {/* "Editar" solo en la pestaña "Mis artículos" del autor */}
            {catalog.scope === CATALOG_SCOPE.MINE && canEditArticle(user, article) && (
                <ButtonPrimary
                />
            )}
        </>
    );

    const showAuthor = catalog.scope !== CATALOG_SCOPE.MINE;

    const columns = [
        {
            name: "Título del artículo",
            grow: 3,
            cell: (row) => (
                <div className="py-2 w-100" style={{ minWidth: 0 }}>
                    <button
                        type="button"
                        className="btn btn-link p-0 fw-semibold text-start text-decoration-none d-block text-truncate w-100"
                        onClick={() => goToDetail(row)}
                        title={row.title}
                    >
                        {row.title}
                    </button>
                    {showAuthor && (
                        <small className="text-muted d-block text-truncate">
                            <i className="bi bi-person me-1" aria-hidden="true"></i>
                            {row.author}
                        </small>
                    )}
                </div>
            )
        },
        {
            name: "Línea temática",
            minWidth: "190px",
            cell: (row) => (
                <span className="badge bg-light text-dark border fw-normal text-wrap text-start">
                    {getTopicLabel(row.topic)}
                </span>
            )
        },
        {
            name: "Fecha de postulación",
            width: "160px",
            cell: (row) => <span className="small text-muted">{formatSubmittedDate(row.submittedAt)}</span>
        },
        {
            name: "Estado actual",
            width: "200px",
            cell: (row) => <StatusBadge status={row.status} />
        },
        {
            name: "Acciones",
            width: "190px",
            right: true,
            ignoreRowClick: true,
            cell: (row) => <div className="d-flex gap-2 py-1 flex-nowrap">{renderActions(row)}</div>
        }
    ];

    const emptyVariant = filtersActive ? "filtered" : catalog.scope;
    const emptyState = (
        <CatalogEmptyState
            variant={emptyVariant}
            onClear={clearFilters}
            onCreate={canCreateArticle(user) ? () => navigate("/article/postulate") : undefined}
        />
    );

    const activeTab = tabs.find((t) => t.scope === catalog.scope);

    return (
        <div className="container-fluid p-3 p-md-4">
            {alertNotification && (
                <div
                    className={`alert alert-${alertNotification.type} alert-dismissible fade show shadow-sm border-0 mb-4`}
                    role="alert"
                >
                    <strong className="d-block">{alertNotification.title}</strong>
                    <span>{alertNotification.message}</span>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Cerrar"
                        onClick={() => setAlertNotification(null)}
                    ></button>
                </div>
            )}

            {/* Cabecera */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2 h3">
                        <i className="bi bi-journal-text text-primary" aria-hidden="true"></i>
                        Catálogo de artículos
                    </h2>
                    <p className="text-secondary mb-0">
                        {SCOPE_SUBTITLE[allowedScopes[0]] ?? SCOPE_SUBTITLE.mine}
                    </p>
                </div>
                {canCreateArticle(user) && (
                    <button
                        type="button"
                        className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
                        onClick={() => navigate("/article/postulate")}
                    >
                        <i className="bi bi-plus-circle" aria-hidden="true"></i>
                        <span>Postular artículo</span>
                    </button>
                )}
            </div>

            {/* CA-05: dos vistas para autor (propios / publicados) y miembro (asignados / publicados) */}
            {tabs.length > 1 && (
                <>
                    <ul className="nav nav-tabs nav-fill flex-nowrap mb-2" role="tablist">
                        {tabs.map((tab) => (
                            <li className="nav-item" role="presentation" key={tab.scope}>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={catalog.scope === tab.scope}
                                    className={`nav-link d-flex align-items-center justify-content-center gap-2 text-nowrap ${catalog.scope === tab.scope ? "active fw-semibold" : ""
                                        }`}
                                    onClick={() => catalog.scope !== tab.scope && updateCatalog({ scope: tab.scope })}
                                >
                                    <i className={`bi ${tab.icon}`} aria-hidden="true"></i>
                                    <span className="d-none d-sm-inline">{tab.label}</span>
                                    <span className="d-sm-none">{tab.shortLabel}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {activeTab && <p className="small text-muted mb-3">{activeTab.hint}</p>}
                </>
            )}

            <Card
                title={SCOPE_TITLE[catalog.scope] ?? activeTab?.label ?? "Artículos"}
                outline
                outlineColor="primary"
            >
                <ArticleFilters
                    values={catalog}
                    statusOptions={getStatusOptionsForScope(catalog.scope)}
                    onChange={updateCatalog}
                    onClear={clearFilters}
                    canClear={filtersActive}
                />

                {/* CA-03 filtrado: contador total de coincidencias */}
                <p className="small text-muted mb-2" aria-live="polite">
                    {loading ? (
                        "Buscando artículos…"
                    ) : error ? (
                        " "
                    ) : (
                        <>
                            <strong className="text-dark">{total}</strong>{" "}
                            {total === 1 ? "artículo coincide" : "artículos coinciden"}
                            {filtersActive ? " con los filtros aplicados" : ""}
                        </>
                    )}
                </p>

                {error ? (
                    <CatalogError message={error} onRetry={reload} />
                ) : (
                    <>
                        {/* Escritorio / tablet: tabla */}
                        <div className="d-none d-md-block border rounded">
                            <DataTable
                                columns={columns}
                                data={items}
                                keyField="id"
                                progressPending={loading}
                                progressComponent={<TableSkeleton rows={Math.min(catalog.size, 8)} />}
                                noDataComponent={emptyState}
                                persistTableHead
                                highlightOnHover
                                responsive
                            />
                        </div>

                        {/* Móvil: tarjetas */}
                        <div className="d-md-none">
                            <ArticleCardList
                                items={items}
                                loading={loading}
                                showAuthor={showAuthor}
                                renderActions={(article) => renderActions(article, true)}
                                emptyState={<div className="card border-0 shadow-sm">{emptyState}</div>}
                            />
                        </div>

                        {total > 0 && (
                            <CatalogPagination
                                page={catalog.page}
                                size={catalog.size}
                                total={total}
                                loading={loading}
                                onPageChange={(page) => updateCatalog({ page })}
                                onSizeChange={(size) => updateCatalog({ size })}
                            />
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default ArticleScreen;
