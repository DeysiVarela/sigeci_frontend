

import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const InputText = ({ control, label, name, onChange, rules = {}, errors = {}, placeholder = null, required = false }) => {
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
                    <input
                        type="text"
                        id={name}
                        className="form-control"
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
                    {/* {JSON.stringify(errors)} */}
                    {errors?.type === "required" && <p className="small text-danger"><span className="mr-1">⚠️</span>{t("validation.required")}</p>}
                    {errors?.type === "min" && <p className="small text-danger"><span className="mr-1">⚠️</span>{t("validation.min", { field: label || name })}</p>}
                    {errors?.type === "max" && <p className="small text-danger"><span className="mr-1">⚠️</span>{t("validation.max", { field: label || name })}</p>}
                    {errors?.type === "minLength" && <p className="small text-danger"><span className="mr-1">⚠️</span>{t("validation.minLength", { min: rules?.minLength?.value ?? rules?.minLength })}</p>}
                    {errors?.type === "email" && <p className="small text-danger"><span className="mr-1">⚠️</span>{t("validation.email")}</p>}
                    {errors?.type === "pattern" && <p className="small text-danger"><span className="mr-1">⚠️</span>{t("validation.pattern")}</p>}
                    {errors?.type === "validate" && <p className="small text-danger"><span className="mr-1">⚠️</span>{errors?.message}</p>}
                </div>
            )}
        />
    );
};

export default InputText;