import StatusBadge from "./StatusBadge";
import { CardSkeleton } from "./CatalogStates";
import { getTopicLabel } from "../utils/constants";
import { formatSubmittedDate } from "../utils/catalogFormat";

/** Vista en tarjetas para pantallas pequeñas (CA-01 / CA-07 catálogo). */
const ArticleCardList = ({ items, loading, skeletonCount = 4, showAuthor, renderActions, emptyState }) => {
    if (loading) {
        return (
            <div className="d-grid gap-2">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (items.length === 0) return emptyState;

    return (
        <ul className="list-unstyled d-grid gap-2 mb-0">
            {items.map((article) => (
                <li key={article.id} className="card shadow-sm border-0 border-start border-3 border-primary-subtle">
                    <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <h3 className="h6 fw-semibold text-dark mb-0">{article.title}</h3>
                            <StatusBadge status={article.status} className="flex-shrink-0" />
                        </div>
                        {showAuthor && (
                            <p className="small text-muted mb-1">
                                <i className="bi bi-person me-1" aria-hidden="true"></i>
                                {article.author}
                            </p>
                        )}
                        <div className="d-flex flex-wrap gap-2 small text-muted mb-3">
                            <span className="badge bg-light text-dark border fw-normal">
                                {getTopicLabel(article.topic)}
                            </span>
                            <span>
                                <i className="bi bi-calendar-event me-1" aria-hidden="true"></i>
                                {formatSubmittedDate(article.submittedAt)}
                            </span>
                        </div>
                        <div className="d-flex gap-2">{renderActions(article)}</div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ArticleCardList;
