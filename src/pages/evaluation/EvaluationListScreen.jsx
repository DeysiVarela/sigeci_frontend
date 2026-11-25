import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import DataTable from "react-data-table-component";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import { getAssignedEvaluations } from "../../api/evaluations";

const EvaluationListScreen = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("TODOS");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        getAssignedEvaluations()
            .then((data) => {
                if (!active) return;
                const assigned = Array.isArray(data) ? data : (data.results || []);
                setEvaluations(assigned);
            })
            .catch((apiError) => {
                if (active && apiError.status !== 404) {
                    setError(t("evaluationScreen.loadError"));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [t]);

    const getStatusBadge = (status) => {
        const map = {
            PENDIENTE: ["Warning", t("evaluationScreen.status.pending")],
            EN_REVISION: ["Info", t("evaluationScreen.status.inReview")],
            APROBADO: ["Success", t("evaluationScreen.status.approved")],
            RECHAZADO: ["Danger", t("evaluationScreen.status.rejected")]
        };
        const [type, text] = map[status] || ["Secondary", status || t("evaluationScreen.status.noStatus")];
        return <Badge type={type} text={text} pill />;
    };

    const filtered = useMemo(() => evaluations.filter((item) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = `${item.title} ${item.author} ${item.category}`.toLowerCase().includes(term);
        return matchesSearch && (statusFilter === "TODOS" || item.status === statusFilter);
    }), [evaluations, searchTerm, statusFilter]);

    const dateLocale = i18n.language?.startsWith("en") ? "en-US" : "es-CO";

    const columns = [
        {
            name: t("evaluationScreen.table.article"),
            sortable: true,
            selector: row => row.title,
            grow: 3,
            cell: row => (
                <div className="py-2">
                    <button type="button" className="btn btn-link p-0 fw-semibold text-start" onClick={() => navigate(`/evaluations/${row.id}`)}>
                        {row.title}
                    </button>
                    <div className="small text-muted">{row.author}</div>
                </div>
            )
        },
        {
            name: t("evaluationScreen.table.category"),
            width: "150px",
            selector: row => row.category,
            cell: row => <span className="badge text-bg-light border">{row.category}</span>
        },
        {
            name: t("evaluationScreen.table.deadline"),
            sortable: true,
            width: "145px",
            selector: row => row.deadline,
            cell: row => (
                <span className="small">
                    <i className="bi bi-calendar-event me-1 text-secondary"></i>
                    {row.deadline ? new Date(`${row.deadline}T12:00:00`).toLocaleDateString(dateLocale) : t("evaluationScreen.table.noDeadline")}
                </span>
            )
        },
        {
            name: t("evaluationScreen.table.state"),
            width: "130px",
            center: true,
            selector: row => row.status,
            cell: row => getStatusBadge(row.status)
        },
        {
            name: t("evaluationScreen.table.action"),
            width: "135px",
            center: true,
            cell: row => (
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/evaluations/${row.id}`)}>
                    <i className="bi bi-eye me-1"></i>
                    {row.status === "APROBADO" || row.status === "RECHAZADO"
                        ? t("evaluationScreen.actions.view")
                        : t("evaluationScreen.actions.evaluate")}
                </button>
            )
        }
    ];

    return (
        <div className="container-fluid p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="bi bi-clipboard2-check-fill text-primary me-2"></i>
                        {t("evaluationScreen.title")}
                    </h2>
                    <p className="text-secondary mb-0">{t("evaluationScreen.description")}</p>
                </div>
                <div className="badge text-bg-primary fs-6 px-3 py-2">
                    {t("evaluationScreen.assignedCount", { count: evaluations.length })}
                </div>
            </div>

            {error && <div className="alert alert-warning" role="alert">{error}</div>}

            {loading ? (
                <Card title={t("evaluationScreen.loadingTitle")} outline outlineColor="primary">
                    <div className="py-5 text-center">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="text-muted mt-3 mb-0">{t("evaluationScreen.loadingText")}</p>
                    </div>
                </Card>
            ) : (
                <Card title={t("evaluationScreen.inboxTitle")} outline outlineColor="primary">
                    <div className="row g-2 mb-3">
                        <div className="col-12 col-md-7">
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-search"></i></span>
                                <input
                                    className="form-control"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder={t("evaluationScreen.searchPlaceholder")}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-5">
                            <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                <option value="TODOS">{t("evaluationScreen.filters.all")}</option>
                                <option value="PENDIENTE">{t("evaluationScreen.filters.pending")}</option>
                                <option value="EN_REVISION">{t("evaluationScreen.filters.inReview")}</option>
                                <option value="APROBADO">{t("evaluationScreen.filters.approved")}</option>
                                <option value="RECHAZADO">{t("evaluationScreen.filters.rejected")}</option>
                            </select>
                        </div>
                    </div>
                    <div className="border rounded">
                        <DataTable
                            columns={columns}
                            data={filtered}
                            pagination
                            paginationPerPage={5}
                            responsive
                            highlightOnHover
                            noDataComponent={
                                <div className="py-5 text-muted">
                                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                                    {t("evaluationScreen.empty")}
                                </div>
                            }
                        />
                    </div>
                </Card>
            )}
        </div>
    );
};

export default EvaluationListScreen;