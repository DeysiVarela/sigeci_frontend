import { useState, useRef } from "react";
import Card from "../../../components/cards/Card";
import ButtonPrimary from "../../../components/buttons/ButtonPrimary";
import Swal from "sweetalert2";

const ArticleVersionManager = ({ article }) => {
    // Estados para los archivos
    const [pdfFile, setPdfFile] = useState(null);
    const [copyrightFile, setCopyrightFile] = useState(null);
    
    // Estados para la carga
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Referencias para limpiar los inputs
    const pdfInputRef = useRef(null);
    const copyrightInputRef = useRef(null);

    // Historial simulado (CA-01)
    const [versions, setVersions] = useState([
        { id: 1, version: 1, date: "2026-11-01", url: "#", name: "Articulo_Inicial.pdf" },
        { id: 2, version: 2, date: "2026-11-10", url: "#", name: "Articulo_Corregido.pdf" },
    ]);

    // Validación de archivos (CA-04)
    const validateFile = (file, type) => {
        if (!file) return false;
        if (file.type !== "application/pdf") {
            Swal.fire("Error", `El archivo de ${type} debe ser un PDF.`, "error");
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire("Error", "El archivo no debe superar los 10 MB.", "error");
            return false;
        }
        return true;
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (validateFile(file, "versión")) setPdfFile(file);
    };

    const handleCopyrightChange = (e) => {
        const file = e.target.files[0];
        if (validateFile(file, "copyright")) setCopyrightFile(file);
    };

    // Simulación de subida con barra de progreso (CA-05)
    const handleUpload = () => {
        // Validaciones mínimas
        if (article.status === 'ACEPTADO' && !pdfFile) {
            return Swal.fire("Atención", "Debes adjuntar el PDF corregido.", "warning");
        }
        if (article.status === 'CON_AVAL_PRESENTACION' && (!pdfFile || !copyrightFile)) {
            return Swal.fire("Atención", "Debes adjuntar el PDF final y el Copyright.", "warning");
        }

        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    
                    // Simulación de éxito (CA-06)
                    Swal.fire({
                        title: '¡Subida Exitosa!',
                        text: 'El archivo ha sido cargado correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        // Refrescar lista y limpiar campos
                        const newVersion = {
                            id: versions.length + 1,
                            version: versions.length + 1,
                            date: new Date().toISOString().split('T')[0],
                            url: "#",
                            name: pdfFile ? pdfFile.name : "Documento.pdf"
                        };
                        setVersions([...versions, newVersion]);
                        setPdfFile(null);
                        setCopyrightFile(null);
                        if (pdfInputRef.current) pdfInputRef.current.value = "";
                        if (copyrightInputRef.current) copyrightInputRef.current.value = "";
                    });
                    return 100;
                }
                return prev + 10;
            });
        }, 300); // Simula 3 segundos de carga
    };

    return (
        <div className="mt-4">
            {/* Sección de Historial (CA-01) */}
            <Card title="Historial de Versiones">
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
                                    <td>v{v.version}</td>
                                    <td>{v.date}</td>
                                    <td>{v.name}</td>
                                    <td>
                                        <a href={v.url} className="btn btn-sm btn-outline-primary" download>
                                            <i className="bi bi-download me-1"></i> Descargar
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Formulario Condicional (CA-02 y CA-03) */}
            {(article.status === 'ACEPTADO' || article.status === 'CON_AVAL_PRESENTACION') && (
                <Card title="Subir Nueva Versión" className="mt-4" outline outlineColor="warning">
                    <div className="alert alert-warning py-2 small mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        {article.status === 'ACEPTADO' 
                            ? "El artículo fue aceptado. Sube la versión corregida para obtener el aval de presentación."
                            : "Sube la versión final y el documento de cesión de derechos (Copyright) para obtener el aval de publicación."}
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Archivo PDF {article.status === 'ACEPTADO' ? 'Corregido' : 'Final'} *</label>
                        <input 
                            type="file" 
                            className="form-control" 
                            accept=".pdf"
                            onChange={handlePdfChange}
                            ref={pdfInputRef}
                            disabled={isUploading}
                        />
                    </div>

                    {/* Input de Copyright solo si está en CON_AVAL_PRESENTACION (CA-03) */}
                    {article.status === 'CON_AVAL_PRESENTACION' && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Documento de Cesión de Derechos (Copyright) *</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".pdf"
                                onChange={handleCopyrightChange}
                                ref={copyrightInputRef}
                                disabled={isUploading}
                            />
                        </div>
                    )}

                    {/* Barra de Progreso (CA-05) */}
                    {isUploading && (
                        <div className="mb-3">
                            <div className="progress" style={{ height: "20px" }}>
                                <div 
                                    className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                                    role="progressbar" 
                                    style={{ width: `${uploadProgress}%` }}
                                >
                                    {uploadProgress}%
                                </div>
                            </div>
                            <small className="text-muted mt-1 d-block">Subiendo archivos, por favor espera...</small>
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