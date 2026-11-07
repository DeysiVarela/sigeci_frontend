import { Controller } from "react-hook-form";

const InputEmail = ({
    control,
    label,
    name,
    onChange,
    rules = {},
    errors = {},
    placeholder = null,
    required = false
}) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                ...rules,
                required: required,
                pattern: rules.pattern || {
                    value: emailRegex,
                    message: "Este campo debe ser un correo electrónico válido"
                }
            }}
            defaultValue=""
            render={({ field }) => (
                <div className="form-group mb-2">
                    <label htmlFor={name}>{label}</label>
                    <input
                        type="email"
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
                    {errors?.type === "required" && (
                        <p className="small text-danger">
                            <span className="mr-1">⚠️</span>Este campo es obligatorio
                        </p>
                    )}
                    {errors?.type === "pattern" && (
                        <p className="small text-danger">
                            <span className="mr-1">⚠️</span>Este campo debe ser un correo electrónico válido
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

export default InputEmail;