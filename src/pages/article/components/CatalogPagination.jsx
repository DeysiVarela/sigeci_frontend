import { PAGE_SIZE_OPTIONS } from "../utils/constants";

const getPageWindow = (page, totalPages, span = 2) => {
    const start = Math.max(1, page - span);
    const end = Math.min(totalPages, page + span);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

/** Paginación del servidor (CA-02 catálogo / CA-03 filtrado). */
const CatalogPagination = ({ page, size, total, loading, onPageChange, onSizeChange }) => {
    const totalPages = Math.max(1, Math.ceil(total / size));
    const from = total === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(page * size, total);
    const go = (target) => {
        if (target >= 1 && target <= totalPages && target !== page && !loading) onPageChange(target);
    };

    return (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3">
            <div className="d-flex align-items-center gap-2 small text-muted">
                <label htmlFor="catalog-page-size" className="text-nowrap mb-0">
                    Por página
                </label>
                <select
                    id="catalog-page-size"
                    className="form-select form-select-sm"
                    style={{ width: "auto" }}
                    value={size}
                    disabled={loading}
                    onChange={(e) => onSizeChange(Number(e.target.value))}
                >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
                <span className="text-nowrap">
                    {from}–{to} de {total}
                </span>
            </div>

            <nav aria-label="Paginación del catálogo">
                <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page <= 1 || loading ? "disabled" : ""}`}>
                        <button type="button" className="page-link" onClick={() => go(page - 1)} aria-label="Página anterior">
                            <i className="bi bi-chevron-left" aria-hidden="true"></i>
                        </button>
                    </li>
                    {getPageWindow(page, totalPages).map((p) => (
                        <li key={p} className={`page-item d-none d-sm-block ${p === page ? "active" : ""}`}>
                            <button
                                type="button"
                                className="page-link"
                                onClick={() => go(p)}
                                aria-current={p === page ? "page" : undefined}
                            >
                                {p}
                            </button>
                        </li>
                    ))}
                    <li className="page-item disabled d-sm-none">
                        <span className="page-link">
                            {page} / {totalPages}
                        </span>
                    </li>
                    <li className={`page-item ${page >= totalPages || loading ? "disabled" : ""}`}>
                        <button type="button" className="page-link" onClick={() => go(page + 1)} aria-label="Página siguiente">
                            <i className="bi bi-chevron-right" aria-hidden="true"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default CatalogPagination;
