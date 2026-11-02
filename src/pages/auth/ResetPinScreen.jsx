import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputPin from "../../components/inputs/InputPin";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import HandlerApp from "../../utils/HandlerApp";
import { resetPassword } from "../../api/auth";

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

    const submitData = async (data) => {
        const email = sessionStorage.getItem("recovery_email");

        if (!email) {
            nav("/forgot-password");
            return;
        }

        handlerApp.setLoader(true);

        try {
            await resetPassword(email, data.pin, data.password);
            sessionStorage.removeItem("recovery_email");
            nav("/login");
        } catch (error) {
            console.error("Error al restablecer contraseña:", error);
            alert(error.message || "No fue posible restablecer la contraseña.");
        } finally {
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
                        </form>

                        <p className="mt-3 mb-0 text-center">
                            <a href="/forgot-password">Reenviar PIN</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResetPinScreen;