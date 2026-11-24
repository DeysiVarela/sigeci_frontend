import { useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const InputPassword = ({
    control,
    label,
    name,
    onChange,
    rules = {},
    errors = {},
    placeholder = null,
    required = false
}) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    // Contraseña segura: al menos 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._<>\-#^()+=])[A-Za-z\d@$!%*?&._<>\-#^()+=]{8,}$/;

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                ...rules,
                required: required,
                minLength: rules.minLength || {
                    value: 8,
                    message: t("validation.passwordMinLength", { min: 8 })
                },
                pattern: rules.pattern || {
                    value: strongPasswordRegex,
                    message: t("validation.passwordStrong")
                }
            }}
            defaultValue=""
            render={({ field }) => (
                <div className="form-group mb-3">
                    {label && <label htmlFor={name} className="form-label">{label}</label>}
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id={name}
                            className={`form-control ${errors ? (errors.type ? "is-invalid" : "") : ""}`}
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
                        <button
                            type="button"
                            className="input-group-text bg-transparent border-start-0"
                            onClick={() => setShowPassword(prev => !prev)}
                            tabIndex={-1}
                            style={{ cursor: "pointer" }}
                            title={showPassword ? t("validation.hidePassword") : t("validation.showPassword")}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                        </button>
                    </div>

                    {errors?.type === "required" && (
                        <p className="small text-danger mt-1 mb-0">
                            <span className="me-1">⚠️</span>{t("validation.required")}
                        </p>
                    )}
                    {errors?.type === "minLength" && (
                        <p className="small text-danger mt-1 mb-0">
                            <span className="me-1">⚠️</span>{errors?.message || t("validation.passwordMinLength", { min: 8 })}
                        </p>
                    )}
                    {errors?.type === "pattern" && (
                        <p className="small text-danger mt-1 mb-0">
                            <span className="me-1">⚠️</span>{errors?.message || t("validation.passwordStrong")}
                        </p>
                    )}
                    {errors?.type === "validate" && (
                        <p className="small text-danger mt-1 mb-0">
                            <span className="me-1">⚠️</span>{errors?.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
};

export default InputPassword;
