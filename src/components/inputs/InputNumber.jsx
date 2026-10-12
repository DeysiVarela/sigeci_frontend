import { Controller } from "react-hook-form";

const InputNumber = ({
    control,
    label,
    name,
    onChange,
    rules = {},
    errors = {},
    placeholder = null,
    required = false,
    min = undefined,
    max = undefined,
    step = "any"
}) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={{
                ...rules,
                required: required,
                min: min !== undefined ? min : rules.min,
                max: max !== undefined ? max : rules.max
            }}
            defaultValue=""
            render={({ field }) => (
                <div className="form-group mb-3">
                    <label htmlFor={name}>{label}</label>
                    <input
                        type="number"
                        id={name}
                        step={step}
                        className={`form-control ${errors?.type ? "is-invalid" : ""}`}
                        value={field.value}
                        onKeyDown={(e) => {
                            // Permitir solo números y teclas de control
                            if (
                                ["Backspace", "Tab", "Enter", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
                            ) {
                                return;
                            }
                            // Permitir signo menos y punto decimal según corresponda
                            if (e.key === "-" || e.key === ".") {
                                return;
                            }
                            if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                            onChange?.(e.target.value);
                            field.onChange(e);
                        }}
                        onBlur={field.onBlur}
                        placeholder={placeholder ? placeholder : label}
                    />
                    {errors?.type === "required" && (
                        <p className="small text-danger">
                            <span className="mr-1">⚠️</span>This field is required
                        </p>
                    )}
                    {errors?.type === "min" && (
                        <p className="small text-danger">
                            <span className="mr-1">⚠️</span>The value must be at least {min ?? rules.min?.value ?? rules.min}
                        </p>
                    )}
                    {errors?.type === "max" && (
                        <p className="small text-danger">
                            <span className="mr-1">⚠️</span>The value cannot exceed {max ?? rules.max?.value ?? rules.max}
                        </p>
                    )}
                    {errors?.type === "validate" && (
                        <p className="small text-danger">
                            <span className="mr-1">⚠️</span>{errors?.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
};

export default InputNumber;
