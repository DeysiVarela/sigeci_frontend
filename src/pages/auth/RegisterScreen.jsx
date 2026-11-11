import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import HandlerApp from "../../utils/HandlerApp";
import { register } from "../../api/auth";

const NAME_MAX = 60;
const EMAIL_MAX = 120;
const CAPTCHA_MISSING = "Completa el CAPTCHA para continuar.";
const SERVER_FIELDS = ["name", "lastname", "email", "password"];

const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#^()+=])[A-Za-z\d@$!%*?&._\-#^()+=]{8,}$/;
const cleanName = (value) => (value || "").trim().replace(/\s+/g, " ");

const nameRules = {
    validate: (value) => {
        const text = cleanName(value);
        if (!text) return "Este campo es obligatorio";
        if (text.length > NAME_MAX) return `Máximo ${NAME_MAX} caracteres`;
        if (!NAME_PATTERN.test(text)) return "Solo se permiten letras, espacios, apóstrofo (') y guion (-)";
        return true;
    },
};

const passwordRules = {
    // Primero los espacios, para dar un mensaje claro; luego la regla de contraseña segura
    pattern: { value: /^\S*$/, message: "La contraseña no puede contener espacios" },
    validate: (value) =>
        STRONG_PASSWORD.test(value) ||
        "Debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
};

const firstMessage = (value) => (Array.isArray(value) ? value[0] : value);

const RegisterScreen = () => {
    const nav = useNavigate();
    const handlerApp = HandlerApp();
    const captchaRef = useRef(null);
    const [captchaToken, setCaptchaToken] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const captchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    const { control, handleSubmit, getValues, trigger, setError, formState: { errors } } = useForm({
        mode: "onTouched",
    });

    const resetCaptcha = () => {
        captchaRef.current?.reset();
        setCaptchaToken("");
    };

    // Lleva los errores del backend (400 por campo / 409 correo duplicado) a cada input
    const applyServerErrors = (error) => {
        const data = error.data || {};
        let mapped = false;
        SERVER_FIELDS.forEach((field) => {
            if (data[field]) {
                setError(field, { type: "validate", message: firstMessage(data[field]) });
                mapped = true;
            }
        });
        return mapped;
    };

    const submitData = async (data) => {
        if (!captchaSiteKey) {
            setSubmitError("El CAPTCHA no está configurado. Comunícate con soporte.");
            return;
        }
        if (!captchaToken) {
            setSubmitError(CAPTCHA_MISSING);
            return;
        }

        setSubmitError("");
        setIsSubmitting(true);
        handlerApp.setLoader(true);
        try {
            // Solo se envían estos campos: la confirmación de contraseña no viaja y el rol nunca se incluye
            await register({
                name: cleanName(data.name),
                lastname: cleanName(data.lastname),
                email: data.email.trim().toLowerCase(),
                password: data.password,
                captchaToken,
            });
            handlerApp.setLoader(false);
            await Swal.fire({
                icon: "success",
                title: "Cuenta creada",
                text: "Tu cuenta de autor fue creada. Ahora inicia sesión con tu correo y contraseña.",
                confirmButtonText: "Ir al login",
                allowOutsideClick: false,
            });
            nav("/login", { replace: true });
        } catch (error) {
            if (error.status === 409) {
                setError("email", { type: "validate", message: "Este correo ya está registrado." });
                setSubmitError("Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.");
            } else if (error.status === 400) {
                const mapped = applyServerErrors(error);
                setSubmitError(mapped ? "Revisa los campos marcados." : error.message);
            } else if (error.status === 429) {
                setSubmitError("Demasiados intentos de registro. Espera un minuto e inténtalo de nuevo.");
            } else if (error.status === 503) {
                setSubmitError(error.message);
            } else {
                setSubmitError("No pudimos conectar con el servicio. Inténtalo nuevamente.");
            }
            resetCaptcha(); // el token de reCAPTCHA es de un solo uso
        } finally {
            setIsSubmitting(false);
            handlerApp.setLoader(false);
        }
    };

    const submitForm = (event) => {
        void handleSubmit(submitData)(event);
    };

    return (
        <div className="login-page bg-body-secondary">
            <main className="login-box">
                <h1 className="login-logo">
                    {import.meta.env.VITE_PROJECT_NAME || "SIGECI"}
                </h1>
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Crear cuenta de autor</p>

                        <form onSubmit={submitForm} noValidate>
                            <InputText
                                control={control}
                                label="Nombres"
                                name="name"
                                errors={errors.name}
                                rules={nameRules}
                                required={true}
                            />
                            <InputText
                                control={control}
                                label="Apellidos"
                                name="lastname"
                                errors={errors.lastname}
                                rules={nameRules}
                                required={true}
                            />
                            <InputEmail
                                control={control}
                                label="Correo electrónico"
                                name="email"
                                errors={errors.email}
                                rules={{
                                    validate: (value) =>
                                        (value || "").trim().length <= EMAIL_MAX || `Máximo ${EMAIL_MAX} caracteres`,
                                }}
                                required={true}
                            />
                            <InputPassword
                                control={control}
                                label="Contraseña"
                                name="password"
                                errors={errors.password}
                                required={true}
                                rules={passwordRules}
                                onChange={() => {
                                    
                                    if (getValues("confirmPassword")) void trigger("confirmPassword");
                                }}
                            />
                            <p className="small text-muted mb-3" style={{ marginTop: "-0.75rem" }}>
                                Mínimo 8 caracteres, con mayúscula, minúscula, número y un carácter especial.
                            </p>
                            <InputPassword
                                control={control}
                                label="Confirmar contraseña"
                                name="confirmPassword"
                                errors={errors.confirmPassword}
                                required={true}
                                rules={{
                                    // En la confirmación solo importa que coincida (las reglas ya se validan arriba)
                                    minLength: { value: 0, message: "" },
                                    pattern: { value: /[\s\S]*/, message: "" },
                                    validate: (value) =>
                                        value === getValues("password") || "Las contraseñas no coinciden",
                                }}
                            />

                            <div className="mb-3" aria-describedby="captcha-error">
                                {captchaSiteKey ? (
                                    <ReCAPTCHA
                                        ref={captchaRef}
                                        sitekey={captchaSiteKey}
                                        onChange={(token) => {
                                            setCaptchaToken(token || "");
                                            setSubmitError("");
                                        }}
                                        onExpired={() => setCaptchaToken("")}
                                        onErrored={() => {
                                            setCaptchaToken("");
                                            setSubmitError("No pudimos cargar el CAPTCHA. Inténtalo nuevamente.");
                                        }}
                                    />
                                ) : (
                                    <p className="small text-danger mb-0" role="alert">
                                        El CAPTCHA no está configurado. Comunícate con soporte.
                                    </p>
                                )}
                                {!captchaToken && submitError === CAPTCHA_MISSING && (
                                    <p id="captcha-error" className="small text-danger mt-1 mb-0" role="alert">
                                        Completa el CAPTCHA antes de enviar.
                                    </p>
                                )}
                            </div>

                            {submitError && submitError !== CAPTCHA_MISSING && (
                                <div className="alert alert-danger" role="alert">{submitError}</div>
                            )}

                            <ButtonPrimary
                                label={isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                                className="w-100"
                                type="submit"
                                disabled={isSubmitting}
                            />
                        </form>

                        <p className="mt-3 mb-0 text-center">
                            ¿Ya tienes cuenta? <Link to="/login">Volver al login</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterScreen;
