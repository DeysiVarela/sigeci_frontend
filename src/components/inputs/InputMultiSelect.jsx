import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const InputMultiSelect = ({
    control,
    label,
    name,
    options = [],
    errors = {},
    required = false,
}) => {
    const { t } = useTranslation();
    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: required ? t("validation.selectAtLeastOne") : false,
            }}
            defaultValue={[]} // Arreglo vacío por defecto
            render={({ field }) => {
                // Aseguramos que field.value siempre sea un arreglo
                const selectedValues = Array.isArray(field.value) ? field.value : [];

                const handleCheckboxChange = (value) => {
                    // Si ya está seleccionado, lo quitamos. Si no, lo agregamos.
                    const newValue = selectedValues.includes(value)
                        ? selectedValues.filter((v) => v !== value)
                        : [...selectedValues, value];

                    field.onChange(newValue);
                };

                return (
                    <div className="form-group mb-3">
                        <label className="form-label fw-semibold d-block mb-2">
                            {label} {required && "*"}
                        </label>

                        <div className="d-flex flex-wrap gap-3 p-3 border rounded bg-light">
                            {options.map((opt) => (
                                <div className="form-check" key={opt.value}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`${name}-${opt.value}`}
                                        value={opt.value}
                                        checked={selectedValues.includes(opt.value)}
                                        onChange={() => handleCheckboxChange(opt.value)}
                                        onBlur={field.onBlur}
                                    />
                                    <label
                                        className="form-check-label user-select-none"
                                        htmlFor={`${name}-${opt.value}`}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {opt.label}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {errors?.type && (
                            <p className="small text-danger mt-1">
                                <span className="me-1">⚠️</span>
                                {errors.message}
                            </p>
                        )}
                    </div>
                );
            }}
        />
    );
};

export default InputMultiSelect;