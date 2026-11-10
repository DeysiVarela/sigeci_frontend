import { STATUS_META, getStatusLabel } from "../utils/constants";

// CA-03: insignia con color + ícono por estado (Bootstrap 5.3 `text-bg-*`).
const StatusBadge = ({ status, className = "" }) => {
    const meta = STATUS_META[status] ?? { variant: "light", icon: "bi-question-circle" };
    return (
        <span
            className={`badge rounded-pill text-bg-${meta.variant} d-inline-flex align-items-center gap-1 fw-semibold text-wrap text-start ${className}`}
            style={{ lineHeight: 1.2 }}
            title={getStatusLabel(status)}
        >
            <i className={`bi ${meta.icon}`} aria-hidden="true"></i>
            <span>{getStatusLabel(status)}</span>
        </span>
    );
};

export default StatusBadge;
