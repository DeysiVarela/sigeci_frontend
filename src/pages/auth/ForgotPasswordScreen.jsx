import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputEmail from "../../components/inputs/InputEmail";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import HandlerApp from "../../utils/HandlerApp";

const ForgotPasswordScreen = () => {
    const nav = useNavigate();
    const handlerApp = HandlerApp();

    const { control, handleSubmit, formState: { errors } } = useForm();

    const submitData = (data) => {
        handlerApp.setLoader(true);
        console.log("Enviando PIN al correo:", data.email);

        // Simulación de envío al backend
        setTimeout(() => {
            handlerApp.setLoader(false);
            // Guardamos el correo para usarlo en la pantalla del PIN
            sessionStorage.setItem("recovery_email", data.email);
            nav("/reset-pin");
        }, 2000);
    };

    return (
        <div className="login-page bg-body-secondary">
            <main className="login-box">
                <h1 className="login-logo">
                    {import.meta.env.VITE_PROJECT_NAME || "SIGECI"}
                </h1>
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Recuperar contraseña</p>
                        <p className="small text-muted text-center mb-3">
                            Te enviaremos un PIN de 6 dígitos a tu correo.
                        </p>

                        <form>
                            <InputEmail
                                control={control}
                                label="Correo electrónico"
                                name="email"
                                errors={errors.email}
                                required={true}
                            />

                            <ButtonPrimary
                                label="Enviar código"
                                className="w-100"
                                onClick={handleSubmit(submitData)}
                            />
                        </form>

                        <p className="mt-3 mb-0 text-center">
                            <a href="/login">Volver al login</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordScreen;