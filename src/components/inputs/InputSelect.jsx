import { Controller } from "react-hook-form";

const InputSelect = ({
    control,
    label,
    name,
    onChange,
    options = [],
    rules = {},
    errors = {},
    required = false,
    placeholder = "Seleccione una opción"
}) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={{ ...rules, required: required }}
            defaultValue=""
            render={({ field }) => (
                <div className="form-group mb-3">
                    <label htmlFor={name}>{label}</label>
                    <select
                        id={name}
                        className={`form-control ${errors?.type ? "is-invalid" : ""}`}
                        value={field.value}
                        onChange={(e) => {
                            onChange?.(e.target.value);
                            field.onChange(e);
                        }}
                        onBlur={(e) => {
                            field.onBlur(e);
                        }}
                    >
                        <option value="" disabled>{placeholder}</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {errors?.type === "required" && (
                        <p className="small text-danger mt-1">
                            <span className="me-1">⚠️</span>Este campo es obligatorio
                        </p>
                    )}
                </div>
            )}
        />
    );
};

export default InputSelect;