import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const InputTextArea = ({
    control,
    label,
    name,
    onChange,
    rules = {},
    errors = {},
    placeholder = null,
    required = false,
    rows = 4
}) => {
    const { t } = useTranslation();
    return (
        <Controller
            control={control}
            name={name}
            rules={{ ...rules, required: required }}
            defaultValue=""
            render={({ field }) => (
                <div className="form-group mb-3">
                    <label htmlFor={name}>{label}</label>
                    <textarea
                        id={name}
                        className={`form-control ${errors?.type ? "is-invalid" : ""}`}
                        rows={rows}
                        value={field.value}
                        onChange={(e) => {
                            onChange?.(e.target.value);
                            field.onChange(e);
                        }}
                        onBlur={(e) => {
                            field.onBlur(e);
                        }}
                        placeholder={placeholder ? placeholder : label}
                    />
                    {errors?.type === "required" && (
                        <p className="small text-danger mt-1">
                            <span className="me-1">⚠️</span>{t("validation.required")}
                        </p>
                    )}
                </div>
            )}
        />
    );
};

export default InputTextArea;