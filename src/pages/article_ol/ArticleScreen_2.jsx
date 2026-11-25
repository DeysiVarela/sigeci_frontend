import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import DataTable from "react-data-table-component";
import Card from "../../components/cards/Card";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import ButtonLink from "../../components/buttons/ButtonLink";
import { useFetch } from "../../hooks/useFetch";
import HandlerApp from "../../utils/HandlerApp";
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
    const api = useFetch();
    const handlerApp = HandlerApp();

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    

    const updateCatalog = useCallback(
        (patch) => setSearchParams(toSearchParams(mergeCatalog(catalog, patch)), { replace: true }),
        [catalog, setSearchParams]
    );
    const clearFilters = () => updateCatalog({ ...EMPTY_FILTERS });

    const loadArticles = async () => {
        setLoading(true);
        handlerApp.setLoader(true);
        try {
            const res = await api.get("article");
            if (res.data) setArticles(res.data);
        } catch {
            setArticles([]);
            triggerAlert("danger", "No pudimos cargar los artículos desde el servidor.", "Error");
        } finally {
            setLoading(false);
            handlerApp.setLoader(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    // Modal de confirmación para eliminar
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

    const handleConfirmDelete = async () => {
        if (!selectedArticle) return;
        handlerApp.setLoader(true);
        try {
            await api.deleteMethod(`article/${selectedArticle.article_id}/delete`);
            setArticles(prev => prev.filter(a => a.article_id !== selectedArticle.article_id));
            setDeleteModalOpen(false);
            triggerAlert(
                "danger",
                `El artículo "${selectedArticle.article_subject}" (ID: #${selectedArticle.article_id}) ha sido eliminado con éxito.`,
                "¡Artículo Eliminado!"
            );
        } catch (error) {
            console.error("Error al eliminar artículo:", error);
            triggerAlert("danger", "No fue posible eliminar el artículo.", "Error");
        } finally {
            handlerApp.setLoader(false);
            setSelectedArticle(null);
        }
    };

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const subject = article.article_subject || "";
            const desc = article.article_description || "";
            const matchesSearch =
                subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                desc.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "TODOS" ||
                (statusFilter === "ACTIVO" && article.article_active) ||
                (statusFilter === "INACTIVO" && !article.article_active);
            return matchesSearch && matchesStatus;
        });
    }, [articles, searchTerm, statusFilter]);

    const columns = [
        {
            name: "ID",
            selector: row => row.article_id,
            sortable: true,
            width: "80px",
            center: true,
            cell: row => <span className="badge bg-light text-secondary border">#{row.article_id}</span>
        },
        {
            name: "Título del Artículo",
            selector: row => row.article_subject,
            sortable: true,
            cell: row => (
                <div className="py-2 text-truncate" style={{ maxWidth: "100%" }}>
                    <span
                        className="fw-semibold text-primary d-block mb-1 text-truncate"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/article/${row.article_id}`)}
                        title={row.article_subject}
                    >
                        {row.article_subject}
                    </span>
                    <small className="text-muted d-block text-truncate" title={row.article_description}>
                        {row.article_description}
                    </small>
                </div>
            )
        },
        {
            name: "Tópico ID",
            selector: row => row.topic_id,
            sortable: true,
            width: "120px",
            center: true,
            cell: row => (
                <span className="badge bg-light text-dark border">
                    ID #{row.topic_id}
                </span>
            )
        },
        {
            name: "Fecha",
            selector: row => row.article_date,
            sortable: true,
            width: "140px",
            cell: row => <span className="small text-muted">{row.article_date || "—"}</span>
        },
        {
            name: "Estado",
            selector: row => row.article_active,
            sortable: true,
            width: "120px",
            center: true,
            cell: row => (
                <Badge
                    type={row.article_active ? "Success" : "Secondary"}
                    text={row.article_active ? "Activo" : "Inactivo"}
                    pill
                />
            )
        },
        {
            name: "Acciones",
            width: "190px",
            right: true,
            ignoreRowClick: true,
            button: true,
            cell: row => (
                <div className="d-flex align-items-center gap-2 justify-content-end py-1 flex-nowrap">
                    <ButtonSecondary
                        label="Ver"
                        className="btn-sm py-1 px-2 text-nowrap"
                        onClick={() => navigate(`/article/${row.article_id}`)}
                    />
                    <ButtonPrimary
                        label="Editar"
                        className="btn-sm py-1 px-2 text-nowrap"
                        onClick={() => navigate(`/article/edit/${row.article_id}`)}
                    />
                    <ButtonLink
                        label="Eliminar"
                        className="text-danger fw-semibold small text-nowrap px-1"
                        onClick={() => handleOpenDelete(row)}
                    />
                </div>
            )
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
