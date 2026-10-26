import { useRef } from "react";
import { Controller } from "react-hook-form";

const InputPin = ({
    control,
    label,
    name,
    errors = {},
    required = false,
    length = 6
}) => {
    const inputsRef = useRef([]);

    // Maneja el cambio en cada caja
    const handleChange = (e, index, field) => {
        const value = e.target.value;

        // Solo permitir dígitos
        if (!/^\d*$/.test(value)) return;

        // Tomar solo el último dígito si pegan varios
        const digit = value.slice(-1);
        const currentPin = field.value || "";
        const pinArray = currentPin.padEnd(length, " ").split("");
        pinArray[index] = digit || " ";
        const newPin = pinArray.join("").trimEnd();
        field.onChange(newPin);

        // Mover el foco al siguiente input si se escribió un dígito
        if (digit && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    // Maneja la tecla Backspace para retroceder
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    // Maneja el pegado (pegar los 6 dígitos de una vez)
    const handlePaste = (e, field) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (pasted) {
            field.onChange(pasted);
            const lastIndex = Math.min(pasted.length - 1, length - 1);
            inputsRef.current[lastIndex]?.focus();
        }
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: required,
                validate: (value) =>
                    value && value.length === length
                        ? true
                        : `El PIN debe tener ${length} dígitos`
            }}
            defaultValue=""
            render={({ field }) => {
                const pinValue = (field.value || "").padEnd(length, " ").split("");

                return (
                    <div className="form-group mb-3">
                        {label && (
                            <label className="form-label d-block text-center mb-2">
                                {label}
                            </label>
                        )}
                        <div className="d-flex justify-content-center gap-2">
                            {Array.from({ length }).map((_, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputsRef.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className={`form-control text-center fw-bold ${
                                        errors?.type ? "is-invalid" : ""
                                    }`}
                                    style={{
                                        width: "48px",
                                        height: "56px",
                                        fontSize: "20px",
                                        borderRadius: "8px"
                                    }}
                                    value={pinValue[index].trim()}
                                    onChange={(e) => handleChange(e, index, field)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={(e) => handlePaste(e, field)}
                                    onBlur={field.onBlur}
                                />
                            ))}
                        </div>

                        {errors?.type === "required" && (
                            <p className="small text-danger text-center mt-2 mb-0">
                                <span className="me-1">⚠️</span>Este campo es obligatorio
                            </p>
                        )}
                        {errors?.type === "validate" && (
                            <p className="small text-danger text-center mt-2 mb-0">
                                <span className="me-1">⚠️</span>
                                {errors?.message}
                            </p>
                        )}
                    </div>
                );
            }}
        />
    );
};

export default InputPin;