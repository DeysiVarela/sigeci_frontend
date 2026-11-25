import { TOPICS, getStatusLabel } from "../utils/constants";

/**
 * filtrado: línea temática, estado y rango de fechas
 * de postulación, combinables, con botón "Limpiar filtros".
 */
const ArticleFilters = ({ values, statusOptions, onChange, onClear, canClear }) => (
    <div className="row g-2 align-items-end mb-3" role="search" aria-label="Filtros del catálogo">
        <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="filter-topic" className="form-label small fw-semibold mb-1">
                Línea temática
            </label>
            <select
                id="filter-topic"
                className="form-select"
                value={values.topic}
                onChange={(e) => onChange({ topic: e.target.value })}
            >
                <option value="">Todas las líneas</option>
                {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                        {t.label}
                    </option>
                ))}
            </select>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="filter-status" className="form-label small fw-semibold mb-1">
                Estado
            </label>
            <select
                id="filter-status"
                className="form-select"
                value={values.status}
                onChange={(e) => onChange({ status: e.target.value })}
            >
                <option value="">Todos los estados</option>
                {statusOptions.map((s) => (
                    <option key={s} value={s}>
                        {getStatusLabel(s)}
                    </option>
                ))}
            </select>
        </div>

        <div className="col-6 col-md-4 col-xl-2">
            <label htmlFor="filter-date-from" className="form-label small fw-semibold mb-1">
                Postulado desde
            </label>
            <input
                id="filter-date-from"
                type="date"
                className="form-control"
                value={values.dateFrom}
                max={values.dateTo || undefined}
                onChange={(e) => onChange({ dateFrom: e.target.value })}
            />
        </div>

        <div className="col-6 col-md-4 col-xl-2">
            <label htmlFor="filter-date-to" className="form-label small fw-semibold mb-1">
                Postulado hasta
            </label>
            <input
                id="filter-date-to"
                type="date"
                className="form-control"
                value={values.dateTo}
                min={values.dateFrom || undefined}
                onChange={(e) => onChange({ dateTo: e.target.value })}
            />
        </div>

        <div className="col-12 col-md-4 col-xl-2 d-grid">
            <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                onClick={onClear}
                disabled={!canClear}
            >
                <i className="bi bi-funnel" aria-hidden="true"></i>
                <span>Limpiar filtros</span>
            </button>
        </div>
    </div>
);

export default ArticleFilters;
