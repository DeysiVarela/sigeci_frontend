const InputPdf = ({
    name = "pdfFile",
    label = "Archivo PDF",
    register,
    errors,
    maxSizeMB = 10,
    required = false
}) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validatePdf = (fileList) => {
        const file = fileList?.[0];

        if (!file) {
            return required ? "El archivo PDF es requerido" : true;
        }

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            return "Solo se permiten archivos en formato PDF";
        }

        if (file.size > maxSizeBytes) {
            return `El archivo no puede superar los ${maxSizeMB} MB`;
        }

        return true;
    };

    const fieldError = errors?.[name];

    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label fw-semibold">{label}</label>
            <input
                id={name}
                type="file"
                accept="application/pdf,.pdf"
                className={`form-control ${fieldError ? "is-invalid" : ""}`}
                {...register(name, { validate: validatePdf })}
            />
            <div className="form-text">Formato PDF. Tamaño máximo: {maxSizeMB} MB.</div>
            {fieldError && (
                <p className="small text-danger mt-1 mb-0">
                    <span className="me-1">⚠️</span>
                    {fieldError.message}
                </p>
            )}
        </div>
    );
};

export default InputPdf;
