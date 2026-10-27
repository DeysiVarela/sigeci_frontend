import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import HandlerApp from "../../utils/HandlerApp";
import { login } from "../../api/auth";

const LoginScreen = () => {

    const nav = useNavigate();
    const handlerApp = HandlerApp();

    const { control, handleSubmit, formState: { errors } } = useForm();

    const [error, setError] = useState(null);

    const submitData = async (data) => {
        setError(null);
        handlerApp.setLoader(true);
        try {
            await login(data.email, data.pass);
            nav("/home");
        } catch (e) {
            setError(e.status === 401 ? "Correo o contraseña incorrectos." : e.message);
        } finally {
            handlerApp.setLoader(false);
        }
    };

    return (
        <div className="login-page bg-body-secondary">
            <main className="login-box">
                <h1 className="login-logo">
                    {import.meta.env.VITE_PROJECT_NAME}
                </h1>
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Inicia sesión para comenzar</p>

                        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

                        <form onSubmit={(e) => e.preventDefault()}>
                            <InputEmail
                                control={control}
                                label="Correo electrónico"
                                name="email"
                                errors={errors.email}
                                required={true}
                            />
                            <InputPassword
                                control={control}
                                label="Contraseña"
                                name="pass"
                                placeholder="Contraseña"
                                errors={errors.pass}
                                required={true}
                            />

                            <div className="row mb-3">
                                <div className="col-8">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexCheckDefault">
                                            Recuérdame
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <ButtonPrimary label="Iniciar sesión" className="w-100" onClick={handleSubmit(submitData)} />
                        </form>

                        <div className="social-auth-links text-center d-grid gap-2">
                            <a href="#" className="btn btn-danger">
                                <i className="bi bi-google me-2"></i>Iniciar sesión con Google
                            </a>
                        </div>

                        <p className="mb-1">
                            <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
                        </p>
                        <p className="mb-0">
                            <a href="register.html" className="text-center">
                                Registrar nueva cuenta
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginScreen;