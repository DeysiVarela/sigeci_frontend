// filtrado: skeletons de carga y estados vacíos.

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="w-100 placeholder-glow" aria-busy="true" aria-label="Cargando artículos">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="d-flex align-items-center gap-3 px-3 py-3 border-bottom">
                <div className="flex-grow-1">
                    <span className="placeholder col-8 d-block mb-2 rounded"></span>
                    <span className="placeholder placeholder-xs col-4 d-block rounded"></span>
                </div>
                <span className="placeholder col-2 rounded"></span>
                <span className="placeholder col-1 rounded"></span>
                <span className="placeholder col-1 rounded-pill"></span>
                <span className="placeholder col-1 rounded"></span>
            </div>
        ))}
    </div>
);

export const CardSkeleton = () => (
    <div className="card shadow-sm border-0 placeholder-glow" aria-hidden="true">
        <div className="card-body">
            <span className="placeholder col-10 d-block mb-2 rounded"></span>
            <span className="placeholder col-7 d-block mb-3 rounded"></span>
            <span className="placeholder placeholder-sm col-4 rounded-pill me-2"></span>
            <span className="placeholder placeholder-sm col-3 rounded"></span>
        </div>
    </div>
);

const EMPTY_COPY = {
    filtered: {
        icon: "bi-search",
        title: "Ningún artículo coincide con los filtros",
        text: "Prueba con otra línea temática, estado o rango de fechas."
    },
    mine: {
        icon: "bi-file-earmark-plus",
        title: "Aún no has postulado artículos",
        text: "Cuando postules un artículo aparecerá aquí con su estado de revisión."
    },
    public: {
        icon: "bi-journal-x",
        title: "Todavía no hay artículos publicados",
        text: "Los artículos con aval de publicación aparecerán aquí."
    },

    assigned: {
        icon: "bi-clipboard-check",
        title: "No tienes artículos asignados",
        text: "Cuando se te asigne un artículo para evaluar aparecerá aquí."
    },

    all: {
        icon: "bi-inbox",
        title: "No hay artículos postulados",
        text: "Los artículos aparecerán aquí a medida que los autores los postulen."
    }
};

export const CatalogEmptyState = ({ variant, onClear, onCreate }) => {
    const copy = EMPTY_COPY[variant] ?? EMPTY_COPY.all;
    return (
        <div className="py-5 px-3 text-center text-muted w-100" role="status">
            <i className={`bi ${copy.icon} fs-1 d-block mb-2 text-secondary opacity-50`} aria-hidden="true"></i>
            <p className="fw-semibold text-dark mb-1">{copy.title}</p>
            <p className="small mb-3">{copy.text}</p>
            {variant === "filtered" && onClear && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                    Limpiar filtros
                </button>
            )}
            {variant === "mine" && onCreate && (
                <button type="button" className="btn btn-sm btn-primary" onClick={onCreate}>
                    <i className="bi bi-plus-circle me-1" aria-hidden="true"></i>
                    Postular artículo
                </button>
            )}
        </div>
    );
};

export const CatalogError = ({ message, onRetry }) => (
    <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 mb-0" role="alert">
        <div>
            <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
            {message}
        </div>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
            Reintentar
        </button>
    </div>
);
