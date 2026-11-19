import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputPin from "../../components/inputs/InputPin";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonLink from "../../components/buttons/ButtonLink";
import HandlerApp from "../../utils/HandlerApp";
import { forgotPassword, resetPassword } from "../../api/auth";

// Espera entre envíos del PIN (debe coincidir con PASSWORD_RESET_RESEND_SECONDS del backend)
const RESEND_SECONDS = 60;

const getSecondsLeft = () => {
    const sentAt = Number(sessionStorage.getItem("recovery_sent_at") || 0);
    if (!sentAt) return 0;
    return Math.max(0, RESEND_SECONDS - Math.floor((Date.now() - sentAt) / 1000));
};

// Guarda cuánto falta para poder reenviar (por defecto, la espera completa)
const markSent = (secondsLeft = RESEND_SECONDS) => {
    sessionStorage.setItem("recovery_sent_at", String(Date.now() - (RESEND_SECONDS - secondsLeft) * 1000));
};

const ResetPinScreen = () => {
    const nav = useNavigate();
    const handlerApp = HandlerApp();

    const { control, handleSubmit, formState: { errors } } = useForm();

    // Si el usuario llega aquí sin haber pedido el PIN, redirigir a la solicitud
    useEffect(() => {
        const email = sessionStorage.getItem("recovery_email");
        if (!email) {
            nav("/forgot-password");
        }
    }, [nav]);

    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

    // Cuenta regresiva para habilitar "Reenviar PIN"
    useEffect(() => {
        if (secondsLeft <= 0) return undefined;
        const timer = setTimeout(() => setSecondsLeft(getSecondsLeft()), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const resendPin = async () => {
        if (secondsLeft > 0) return;
        handlerApp.setLoader(true);
        setError("");
        setInfo("");
        try {
            await forgotPassword(sessionStorage.getItem("recovery_email"));
            markSent();
            setSecondsLeft(RESEND_SECONDS);
            setInfo("Te enviamos un nuevo PIN. Revisa tu correo.");
        } catch (requestError) {
            setError(requestError.message);
            if (requestError.status === 429) {
                // El backend indica cuántos segundos faltan: "Espera N segundos..."
                const match = /(\d+)/.exec(requestError.message);
                if (match) {
                    markSent(Number(match[1]));
                    setSecondsLeft(getSecondsLeft());
                }
            }
        } finally {
            handlerApp.setLoader(false);
        }
    };

    const submitData = async (data) => {
        handlerApp.setLoader(true);
        setError("");
        try {
            await resetPassword({
                email: sessionStorage.getItem("recovery_email"),
                code: data.pin,
                password: data.password,
            });
            handlerApp.setLoader(false);
            sessionStorage.removeItem("recovery_email");
            nav("/login");
        } catch (requestError) {
            setError(requestError.message);
            handlerApp.setLoader(false);
        }
    };

    return (
        <div className="login-page bg-body-secondary">
            <main className="login-box">
                <h1 className="login-logo">
                    {import.meta.env.VITE_PROJECT_NAME || "SIGECI"}
                </h1>
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Ingresa el PIN</p>
                        <p className="small text-muted text-center mb-3">
                            Revisa tu correo. El PIN tiene 6 dígitos.
                        </p>

                        <form>
                            <InputPin
                                control={control}
                                label="PIN de verificación"
                                name="pin"
                                errors={errors.pin}
                                required={true}
                                length={6}
                            />

                            <InputPassword
                                control={control}
                                label="Nueva contraseña"
                                name="password"
                                placeholder="Nueva contraseña"
                                errors={errors.password}
                                required={true}
                            />

                            <ButtonPrimary
                                label="Confirmar PIN"
                                className="w-100"
                                onClick={handleSubmit(submitData)}
                            />
                            {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
                            {info && <div className="alert alert-success mt-3" role="status">{info}</div>}
                        </form>

                        <p className="mt-3 mb-0 text-center">
                            <ButtonLink
                                label={secondsLeft > 0 ? `Reenviar PIN (disponible en ${secondsLeft} s)` : "Reenviar PIN"}
                                onClick={resendPin}
                                disabled={secondsLeft > 0}
                            />
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResetPinScreen;