import { useState, useRef, useEffect } from "react";
import Card from "../../../components/cards/Card";
import ButtonPrimary from "../../../components/buttons/ButtonPrimary";
import Swal from "sweetalert2";
import { getCorrectedVersion, submitCorrectedVersion, submitFinalVersion } from "../../../api/articles";
import { getErrorMessage } from "../../../utils/apiError";
import { FILE_RULES, MAX_FILE_MB, normalizeAttachment, validateVersionFile } from "../utils/versionFiles";

// SCRUM-33 · Frontend de SCRUM-30 (versión corregida) y SCRUM-31 (versión final + copyright).
//
// VITE_VERSIONS_MOCK="false" → usa el backend real. Por defecto simula (para quien no tenga el back levantado).
//
// Estado del contrato con el backend:
//   ✔ GET  /api/articles/:id/corrected-version/   → historial (solo devuelve la versión más reciente)
//   ✔ POST /api/articles/:id/corrected-version/   → versión corregida, estado ACEPTADO (multipart)
//   ✔ POST /api/articles/:id/final-submission/    → versión final + copyright (multipart)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const USE_MOCK = import.meta.env.VITE_VERSIONS_MOCK !== "false";

const MOCK_VERSIONS = [
    { id: 1, version: "v1", date: "2026-11-01", url: "#", name: "Articulo_Inicial.pdf" },
    { id: 2, version: "v2", date: "2026-11-10", url: "#", name: "Articulo_Corregido.pdf" },
];

const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Historial real (SCRUM-30). El backend devuelve solo la versión más reciente.
// Devuelve { versions, error } o null si la petición fue cancelada.
const requestHistory = async (articleId, signal) => {
    try {
        const data = await getCorrectedVersion(articleId, { signal });
        const latest = normalizeAttachment(data?.corrected_version, BACKEND_URL);
        return { versions: latest ? [latest] : [], error: "" };
    } catch (err) {
        if (err?.name === "AbortError") return null;
        return { versions: [], error: getErrorMessage(err, "No se pudo cargar el historial de versiones.") };
    }
};

const ArticleVersionManager = ({ article, canUpload }) => {
    const [pdfFile, setPdfFile] = useState(null);
    const [copyrightFile, setCopyrightFile] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [versions, setVersions] = useState(USE_MOCK ? MOCK_VERSIONS : []);
    const [loadingHistory, setLoadingHistory] = useState(!USE_MOCK);
    const [historyError, setHistoryError] = useState("");

    const pdfInputRef = useRef(null);
    const copyrightInputRef = useRef(null);
    const intervalRef = useRef(null);
    const abortRef = useRef(null);

    const isCorrectedStep = article.status === "ACEPTADO";
    const isFinalStep = article.status === "CON_AVAL_PRESENTACION";

    const applyHistory = (result) => {
        if (!result) return; // petición cancelada
        setVersions(result.versions);
        setHistoryError(result.error);
        setLoadingHistory(false);
    };

    // Carga inicial: loadingHistory ya arranca en true con el back real
    useEffect(() => {
        if (USE_MOCK) return undefined;
        const controller = new AbortController();
        requestHistory(article.id, controller.signal).then((result) => {
            if (!controller.signal.aborted) applyHistory(result);
        });
        return () => controller.abort();
    }, [article.id]);

    // Recarga manual (botón Reintentar y después de subir)
    const reloadHistory = async () => {
        setLoadingHistory(true);
        setHistoryError("");
        applyHistory(await requestHistory(article.id));
    };

    // Cleanup al desmontar: corta la simulación y cancela una subida en curso
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            abortRef.current?.abort();
        };
    }, []);

    const resetForm = () => {
        setPdfFile(null);
        setCopyrightFile(null);
        setUploadProgress(0);
        if (pdfInputRef.current) pdfInputRef.current.value = "";
        if (copyrightInputRef.current) copyrightInputRef.current.value = "";
    };

    const handlePick = (kind, documentName, setFile) => (e) => {
        const file = e.target.files[0];
        if (!file) return setFile(null);
        const problem = validateVersionFile(file, kind, documentName);
        if (problem) {
            Swal.fire("Error", problem, "error");
            e.target.value = "";
            setFile(null);
        } else {
            setFile(file);
        }
    };

    // --- Modo simulado (VITE_VERSIONS_MOCK != "false") ---
    const simulateUpload = () => {
        const uploadedName = pdfFile ? pdfFile.name : "Documento.pdf";
        let progress = 0;
        intervalRef.current = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(intervalRef.current);
                setIsUploading(false);
                Swal.fire({
                    title: "¡Subida Exitosa!",
                    text: "El archivo ha sido cargado correctamente.",
                    icon: "success",
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    setVersions((prev) => [
                        ...prev,
                        { id: prev.length + 1, version: `v${prev.length + 1}`, date: todayISO(), url: "#", name: uploadedName }
                    ]);
                    resetForm();
                });
            }
        }, 300);
    };

    // --- Subida real: versión corregida (SCRUM-30) o versión final + copyright (SCRUM-31) ---
    const uploadReal = async () => {
        const controller = new AbortController();
        abortRef.current = controller;
        const options = { onProgress: setUploadProgress, signal: controller.signal };
        try {
            if (isCorrectedStep) {
                await submitCorrectedVersion(article.id, { correctedPdf: pdfFile }, options);
            } else {
                await submitFinalVersion(article.id, { finalPdf: pdfFile, copyrightFile }, options);
            }
            setUploadProgress(100);
            await Swal.fire({
                title: "¡Subida Exitosa!",
                text: isCorrectedStep
                    ? "La versión corregida se cargó correctamente."
                    : "La versión final y el documento de copyright se cargaron correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar"
            });
            resetForm();
            await reloadHistory();
        } catch (err) {
            if (err?.name === "AbortError") return;
            setUploadProgress(0);
            Swal.fire("No se pudo subir", getErrorMessage(err, "Ocurrió un error al subir los archivos. Intenta de nuevo."), "error");
        } finally {
            setIsUploading(false);
            abortRef.current = null;
        }
    };

    const handleUpload = async () => {
        if (isUploading) return; // evita doble envío

        if (isCorrectedStep && !pdfFile) {
            return Swal.fire("Atención", "Debes adjuntar el PDF corregido.", "warning");
        }
        if (isFinalStep && (!pdfFile || !copyrightFile)) {
            return Swal.fire("Atención", "Debes adjuntar el PDF final y el Copyright.", "warning");
        }

        if (!USE_MOCK) {
            const { isConfirmed } = await Swal.fire({
                title: isCorrectedStep ? "¿Subir versión corregida?" : "¿Subir versión final?",
                text: isCorrectedStep
                    ? "Se registrará la versión corregida de este artículo."
                    : "Se registrará la versión final y el documento de copyright de este artículo.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, subir",
                cancelButtonText: "Cancelar"
            });
            if (!isConfirmed) return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        if (USE_MOCK) simulateUpload();
        else uploadReal();
    };

    const serverProcessing = isUploading && uploadProgress >= 100 && !USE_MOCK;

    return (
        <div className="mt-4">
            {/* CA-01: El historial lo pueden ver todos los que tengan acceso al artículo */}
            <Card title="Historial de Versiones">
                {loadingHistory && (
                    <div className="text-center text-muted py-4">
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Cargando historial...
                    </div>
                )}

                {!loadingHistory && historyError && (
                    <div className="alert alert-danger d-flex flex-wrap gap-2 align-items-center justify-content-between mb-0">
                        <span><i className="bi bi-exclamation-triangle me-2"></i>{historyError}</span>
                        <button className="btn btn-sm btn-outline-danger" onClick={reloadHistory}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
                        </button>
                    </div>
                )}

                {!loadingHistory && !historyError && versions.length === 0 && (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-folder2-open me-2"></i>Aún no hay versiones registradas para este artículo.
                    </div>
                )}

                {!loadingHistory && !historyError && versions.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Versión</th>
                                    <th>Fecha</th>
                                    <th>Archivo</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {versions.map((v) => (
                                    <tr key={v.id}>
                                        <td>{v.version}</td>
                                        <td>{v.date}</td>
                                        <td>{v.name}</td>
                                        <td>
                                            <a
                                                href={v.url}
                                                className="btn btn-sm btn-outline-primary"
                                                {...(v.url === "#" ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
                                            >
                                                <i className="bi bi-download me-1"></i> Descargar
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!USE_MOCK && !loadingHistory && !historyError && versions.length > 0 && (
                    <small className="text-muted d-block mt-2">Se muestra la versión más reciente registrada.</small>
                )}
            </Card>

            {/* CA-02: El formulario de subida SOLO lo ve el autor dueño (canUpload) */}
            {canUpload && (isCorrectedStep || isFinalStep) && (
                <Card title="Subir Nueva Versión" className="mt-4" outline outlineColor="warning">
                    <div className="alert alert-warning py-2 small mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        {isCorrectedStep
                            ? "El artículo fue aceptado. Sube la versión corregida para obtener el aval de presentación."
                            : "Sube la versión final y el documento de cesión de derechos (Copyright) para obtener el aval de publicación."}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="version-pdf" className="form-label fw-semibold">
                            Archivo PDF {isCorrectedStep ? "Corregido" : "Final"} *
                        </label>
                        <input
                            id="version-pdf"
                            type="file"
                            className="form-control"
                            accept={FILE_RULES.pdf.accept}
                            onChange={handlePick("pdf", isCorrectedStep ? "PDF corregido" : "PDF final", setPdfFile)}
                            ref={pdfInputRef}
                            disabled={isUploading}
                        />
                        <div className="form-text">Formato PDF. Tamaño máximo: {MAX_FILE_MB} MB.</div>
                    </div>

                    {isFinalStep && (
                        <div className="mb-3">
                            <label htmlFor="version-copyright" className="form-label fw-semibold">
                                Documento de Cesión de Derechos (Copyright) *
                            </label>
                            <input
                                id="version-copyright"
                                type="file"
                                className="form-control"
                                accept={FILE_RULES.copyright.accept}
                                onChange={handlePick("copyright", "documento de copyright", setCopyrightFile)}
                                ref={copyrightInputRef}
                                disabled={isUploading}
                            />
                            <div className="form-text">PDF o imagen (JPG/PNG). Tamaño máximo: {MAX_FILE_MB} MB.</div>
                        </div>
                    )}

                    {isUploading && (
                        <div className="mb-3">
                            <div
                                className="progress"
                                style={{ height: "20px" }}
                                role="progressbar"
                                aria-valuenow={uploadProgress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                    style={{ width: `${uploadProgress}%` }}
                                >
                                    {uploadProgress}%
                                </div>
                            </div>
                            <small className="text-muted mt-1 d-block">
                                {serverProcessing ? "Procesando en el servidor..." : "Subiendo archivos, por favor espera..."}
                            </small>
                        </div>
                    )}

                    <div className="d-flex justify-content-end mt-4">
                        <ButtonPrimary
                            label={isUploading ? "Subiendo..." : "Subir Archivos"}
                            onClick={handleUpload}
                            disabled={isUploading}
                        />
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ArticleVersionManager;