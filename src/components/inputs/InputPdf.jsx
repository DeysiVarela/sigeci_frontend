import { useTranslation } from "react-i18next";

const InputPdf = ({
    name = "pdfFile",
    label,
    register,
    errors,
    maxSizeMB = 10,
    required = false
}) => {
    const { t } = useTranslation();
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validatePdf = (fileList) => {
        const file = fileList?.[0];

        if (!file) {
            return required ? t("inputPdf.required") : true;
        }

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            return t("inputPdf.onlyPdf");
        }

        if (file.size > maxSizeBytes) {
            return t("inputPdf.tooLarge", { size: maxSizeMB });
        }

        return true;
    };

    const fieldError = errors?.[name];

    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label fw-semibold">{label ?? t("inputPdf.label")}</label>
            <input
                id={name}
                type="file"
                accept="application/pdf,.pdf"
                className={`form-control ${fieldError ? "is-invalid" : ""}`}
                {...register(name, { validate: validatePdf })}
            />
            <div className="form-text">{t("inputPdf.hint", { size: maxSizeMB })}</div>
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
