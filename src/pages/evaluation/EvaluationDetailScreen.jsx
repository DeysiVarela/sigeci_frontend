import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import Modal from "../../components/modals/Modal";
import { getAssignedEvaluation, submitEvaluationVerdict } from "../../api/evaluations";

const EvaluationDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState(evaluation?.comments || "");
    const [decision, setDecision] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [alert, setAlert] = useState(null);
    const finalized = evaluation?.status === "APROBADO" || evaluation?.status === "RECHAZADO";

    useEffect(() => {
        let active = true;
        getAssignedEvaluation(id)
            .then((data) => {
                if (!active) return;
                setEvaluation(data);
                setComments(data.comments || "");
            })
            .catch(() => {
                // The mock remains available while the backend endpoint is not implemented.
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [id]);

    const dateLocale = i18n.language?.startsWith("en") ? "en-US" : "es-CO";

    const deadlineText = useMemo(() => {
        if (!evaluation?.deadline) return t("evaluationDetail.noDeadline");
        return new Date(`${evaluation.deadline}T12:00:00`).toLocaleDateString(dateLocale, {
            year: "numeric", month: "long", day: "numeric"
        });
    }, [evaluation, dateLocale, t]);

    const openConfirmation = (selectedDecision) => {
        if (!comments.trim()) {
            setAlert({ type: "danger", message: t("evaluationDetail.alerts.commentsRequired") });
            return;
        }
        setDecision(selectedDecision);
        setModalOpen(true);
    };

    const confirmVerdict = async () => {
        if (!decision) return;
        setSubmitting(true);
        const status = decision === "APROBAR" ? "APROBADO" : "RECHAZADO";
        try {
            const confirmed = await submitEvaluationVerdict(id, {
                verdict: status,
                comments: comments.trim()
            });
            setEvaluation(confirmed);
            setModalOpen(false);
            setAlert({ type: "success", message: t("evaluationDetail.alerts.verdictSuccess") });
        } catch (error) {
            setModalOpen(false);
            setAlert({ type: "danger", message: error.message || t("evaluationDetail.alerts.verdictError") });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid p-4">
                <Card title={t("evaluationDetail.loadingTitle")} outline outlineColor="primary">
                    <div className="py-5 text-center">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="text-muted mt-3 mb-0">{t("evaluationDetail.loadingText")}</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-warning">{t("evaluationDetail.notFound")}</div>
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/evaluations")}>
                    {t("evaluationDetail.backToList")}
                </button>
            </div>
        );
    }

    const statusBadge = evaluation.status === "APROBADO"
        ? <Badge type="Success" text={t("evaluationScreen.status.approved")} pill />
        : evaluation.status === "RECHAZADO"
            ? <Badge type="Danger" text={t("evaluationScreen.status.rejected")} pill />
            : <Badge type="Warning" text={evaluation.status === "EN_REVISION" ? t("evaluationScreen.status.inReview") : t("evaluationScreen.status.pending")} pill />;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div className="d-flex align-items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-circle"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => navigate("/evaluations")}
                        title={t("evaluationDetail.back")}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div>
                        <span className="text-muted small text-uppercase">
                            {t("evaluationDetail.header", { id: evaluation.id })}
                        </span>
                        <h3 className="fw-bold mb-0">{evaluation.title}</h3>
                    </div>
                </div>
                {statusBadge}
            </div>

            {alert && (
                <div className={`alert alert-${alert.type} alert-dismissible shadow-sm`} role="alert">
                    {alert.message}
                    <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-7">
                    <Card title={t("evaluationDetail.documentCardTitle")} outline outlineColor="primary">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                            <div>
                                <i className="bi bi-file-earmark-pdf-fill text-danger fs-4 me-2"></i>
                                <strong>{evaluation.pdfFileName || t("evaluationDetail.defaultPdfName")}</strong>
                            </div>
                            {evaluation.pdfSignedUrl ? (
                                <div className="d-flex gap-2">
                                    <a className="btn btn-outline-primary btn-sm" href={evaluation.pdfSignedUrl} target="_blank" rel="noopener noreferrer">
                                        <i className="bi bi-box-arrow-up-right me-1"></i>{t("evaluationDetail.openPdf")}
                                    </a>
                                    <a className="btn btn-primary btn-sm" href={evaluation.pdfSignedUrl} download>
                                        <i className="bi bi-download me-1"></i>{t("evaluationDetail.downloadPdf")}
                                    </a>
                                </div>
                            ) : (
                                <span className="badge text-bg-secondary">{t("evaluationDetail.pdfUnavailable")}</span>
                            )}
                        </div>
                        {evaluation.pdfSignedUrl ? (
                            <iframe
                                title={t("evaluationDetail.iframeTitle")}
                                src={evaluation.pdfSignedUrl}
                                style={{ width: "100%", height: "520px", border: "1px solid #dee2e6", borderRadius: "0.375rem" }}
                            />
                        ) : (
                            <div className="border rounded bg-light py-5 px-3 text-center text-muted">
                                <i className="bi bi-file-earmark-pdf fs-1 d-block mb-2"></i>
                                {t("evaluationDetail.pdfPendingBackend")}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="col-lg-5">
                    <Card title={t("evaluationDetail.reviewInfoTitle")} outline outlineColor="info">
                        <dl className="row mb-0">
                            <dt className="col-5 text-muted">{t("evaluationDetail.fields.author")}</dt>
                            <dd className="col-7 fw-semibold">{evaluation.author}</dd>
                            <dt className="col-5 text-muted">{t("evaluationDetail.fields.category")}</dt>
                            <dd className="col-7"><span className="badge text-bg-light border">{evaluation.category}</span></dd>
                            <dt className="col-5 text-muted">{t("evaluationDetail.fields.deadline")}</dt>
                            <dd className="col-7 fw-semibold"><i className="bi bi-calendar3 me-1 text-warning"></i>{deadlineText}</dd>
                        </dl>
                        {evaluation.summary && <p className="small text-muted border-top pt-3 mt-3 mb-0">{evaluation.summary}</p>}
                    </Card>

                    <Card title={t("evaluationDetail.gradingTitle")} outline outlineColor={finalized ? "success" : "warning"}>
                        {finalized && (
                            <div className="alert alert-light border mb-3">
                                <i className="bi bi-lock-fill me-2"></i>
                                {t("evaluationDetail.verdictLocked")}
                            </div>
                        )}
                        <div className="mb-3">
                            <label htmlFor="comments" className="form-label fw-semibold">
                                {t("evaluationDetail.commentsLabel")} <span className="text-danger">*</span>
                            </label>
                            <textarea
                                id="comments"
                                className="form-control"
                                rows="7"
                                value={comments}
                                disabled={finalized || submitting}
                                onChange={(event) => setComments(event.target.value)}
                                placeholder={t("evaluationDetail.commentsPlaceholder")}
                            />
                            <div className="form-text">{t("evaluationDetail.commentsHint")}</div>
                        </div>
                        <div className="d-grid d-sm-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-success flex-fill"
                                disabled={finalized || submitting || !comments.trim()}
                                onClick={() => openConfirmation("APROBAR")}
                            >
                                <i className="bi bi-check-circle-fill me-2"></i>{t("evaluationDetail.buttons.approve")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger flex-fill"
                                disabled={finalized || submitting || !comments.trim()}
                                onClick={() => openConfirmation("RECHAZAR")}
                            >
                                <i className="bi bi-x-circle-fill me-2"></i>{t("evaluationDetail.buttons.reject")}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            <Modal
                show={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                title={t("evaluationDetail.modal.title")}
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" disabled={submitting} onClick={() => setModalOpen(false)}>
                            {t("evaluationDetail.modal.cancel")}
                        </button>
                        <button
                            type="button"
                            className={`btn ${decision === "APROBAR" ? "btn-success" : "btn-danger"}`}
                            disabled={submitting}
                            onClick={confirmVerdict}
                        >
                            {submitting ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>{t("evaluationDetail.modal.submitting")}</>
                            ) : (
                                <>
                                    <i className={`bi ${decision === "APROBAR" ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                                    {decision === "APROBAR" ? t("evaluationDetail.modal.confirmApprove") : t("evaluationDetail.modal.confirmReject")}
                                </>
                            )}
                        </button>
                    </>
                }
            >
                <div className="text-center py-2">
                    <i className={`bi ${decision === "APROBAR" ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"} fs-1 d-block mb-3`}></i>
                    <h5>{t("evaluationDetail.modal.question")}</h5>
                    <p className="text-muted">
                        {decision === "APROBAR" ? t("evaluationDetail.modal.warningApprove") : t("evaluationDetail.modal.warningReject")}
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default EvaluationDetailScreen;