import { Controller } from "react-hook-form";

const InputMultiSelect = ({
    control,
    label,
    name,
    options = [],
    errors = {},
    required = false,
}) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: required ? "Debes seleccionar al menos un rol" : false,
            }}
            defaultValue={[]} // El valor por defecto es un arreglo vacío
            render={({ field }) => (
                <div className="form-group mb-3">
                    <label htmlFor={name} className="form-label fw-semibold">
                        {label} {required && "*"}
                    </label>
                    <select
                        multiple
                        id={name}
                        className={`form-select ${errors?.type ? "is-invalid" : ""}`}
                        style={{ height: "120px" }} // Para que se vean varias opciones
                        value={field.value || []}
                        onChange={(e) => {
                            // Extraemos todos los valores seleccionados
                            const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                            field.onChange(selectedOptions);
                        }}
                        onBlur={field.onBlur}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <small className="text-muted d-block mt-1">
                        Mantén presionado <b>Ctrl</b> (o Cmd en Mac) para seleccionar varios roles.
                    </small>
                    {errors?.type && (
                        <p className="small text-danger mt-1">
                            <span className="me-1">⚠️</span>
                            {errors.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
};

export default InputMultiSelect;