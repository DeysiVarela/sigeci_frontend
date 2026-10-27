import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { registerUser } from "../../services/authService";

const RegisterScreen = () => {
    const nav = useNavigate();
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm();
    const submit = async ({ email, password }) => {
        setError("");
        setIsSubmitting(true);
        try { await registerUser({ email, password }); nav("/home"); }
        catch (requestError) { setError(requestError.message); }
        finally { setIsSubmitting(false); }
    };
    return (
        <div className="login-page bg-body-secondary"><main className="login-box">
            <h1 className="login-logo">{import.meta.env.VITE_PROJECT_NAME || "SIGECI"}</h1>
            <div className="card"><div className="card-body login-card-body">
                <p className="login-box-msg">Crear cuenta</p>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <InputEmail control={control} label="Correo electrónico" name="email" errors={errors.email} required />
                    <InputPassword control={control} label="Contraseña (mínimo 8 caracteres)" name="password" errors={errors.password} required />
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <ButtonPrimary label={isSubmitting ? "Creando cuenta..." : "Crear cuenta"} className="w-100" type="submit" disabled={isSubmitting} />
                </form>
                <p className="mt-3 mb-0 text-center"><a href="/login">Volver al login</a></p>
            </div></div>
        </main></div>
    );
};
export default RegisterScreen;
