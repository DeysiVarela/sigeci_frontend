import { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import ReCAPTCHA from "react-google-recaptcha";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import HandlerApp from "../../utils/HandlerApp";
import { login } from "../../api/auth";
import { AppContext } from "../../context/AppContext";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/multilanguage/LanguageSelector";

const LoginScreen = () => {
    const nav               = useNavigate();
    const handlerApp        = HandlerApp();
    const captchaRef        = useRef(null);

    const {setApp} = useContext(AppContext);
    const { t } = useTranslation();

    const [captchaToken, setCaptchaToken] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const captchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    const { control, handleSubmit, formState: { errors }, setError } = useForm({
        mode: "onBlur",
    });
    
    const submitData = async (data) => {
        if (!captchaSiteKey) {
            // setSubmitError("El CAPTCHA no está configurado. Comunícate con soporte.");
            console.error("El CAPTCHA no está configurado. Comunícate con soporte.");
            return;
        }

        if (!captchaToken) {
            setSubmitError(t("login.captchaRequired"));
            return;
        }

        setSubmitError("");
        setIsSubmitting(true);
        handlerApp.setLoader(true);
        try {
            let res = await login({
                identifier: data.email,
                password: data.password,
                captchaToken
            });
            if(res.success){
                let data = res.data;
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refresh_token);
                localStorage.setItem("name", data.user.name);
                localStorage.setItem("lastname", data.user.lastname);
                localStorage.setItem("email", data.user.email);
                localStorage.setItem("id", data.user.id);
                localStorage.setItem("permissions", JSON.stringify(data.permissions));
                
                let profiles = data.user.profiles;
                
                let profile = null;
                // mostrar modal para seleccionar perfil.
                if(profiles.length > 1){
                    handlerApp.setLoader(false);
                    res = await Swal.fire({
                        title: t("login.selectProfile"),
                        input: "select",
                        inputOptions: profiles.reduce((acc, profile) => {
                            acc[profile.id] = profile.name;
                            return acc;
                        }, {}),
                        inputValidator: (value) => {
                            if (!value) {
                                return t("login.selectProfileRequired");
                            }
                        },
                    });
                    profile = parseInt(res.value);
                }else{
                    profile = parseInt(profiles[0].id);
                }
                
                localStorage.setItem("profiles", JSON.stringify(profiles));
                localStorage.setItem("profile", profile);

                setApp((app) => ({
                    ...app,
                    profile,
                    profiles,
                    permissions: data.permissions,
                    user: data.user,
                    token: data.token,
                    isAuthenticated: true
                }));
                nav("/home");
            }else{
                setSubmitError(res.message);
            }
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                setError("email", { type: "server", message: t("login.invalidCredentials") });
                setError("pass", { type: "server", message: t("login.invalidCredentials") });
                setSubmitError(t("login.loginFailed"));
            } else if (error.status === 400 || error.status === 503) {
                setSubmitError(error.message);
            } else {
                setSubmitError(t("login.connectionError"));
            }
            captchaRef.current?.reset();
            setCaptchaToken("");
        } finally {
            setIsSubmitting(false);
            handlerApp.setLoader(false);
        }
    };

    const submitForm = (event) => {
        void handleSubmit(submitData)(event);
    };

    return (
        <div className="login-page bg-body-secondary position-relative">
            <div className="position-absolute top-0 end-0 p-3">
                <LanguageSelector toggleClassName="btn btn-light border shadow-sm" />
            </div>
            <main className="login-box">
                <div className="login-logo mb-3 text-center">
                    <img
                        src="/logo-sigeci-login.png"
                        alt={import.meta.env.VITE_PROJECT_NAME || "SIGECI"}
                        className="img-fluid"
                        style={{ maxHeight: "82px", width: "auto", objectFit: "contain" }}
                    />
                </div>
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">{t("login.title")}</p>

                        <form onSubmit={submitForm} noValidate>
                            <InputEmail
                                control={control}
                                label={t("login.email")}
                                name="email"
                                errors={errors.email}
                                required={true}
                            />
                            {errors.email?.type === "server" && (
                                <p className="small text-danger mt-1" role="alert">{errors.email.message}</p>
                            )}
                            <InputPassword
                                control={control}
                                label={t("login.password")}
                                name="password"
                                placeholder={t("login.password")}
                                errors={errors.password}
                                required={true}
                            />
                            {errors.password?.type === "server" && (
                                <p className="small text-danger mt-1" role="alert">{errors.password.message}</p>
                            )}

                            <div className="mb-3" aria-describedby="captcha-error">
                                {captchaSiteKey ? (
                                    <ReCAPTCHA
                                        ref={captchaRef}
                                        sitekey={captchaSiteKey}
                                        onChange={(token) => {
                                            console.log({token});
                                            setCaptchaToken(token || "");
                                            setSubmitError("");
                                        }}
                                        onExpired={() => setCaptchaToken("")}
                                        onErrored={() => {
                                            setCaptchaToken("");
                                            setSubmitError(t("login.captchaLoadError"));
                                        }}
                                    />
                                ) : (
                                    <p className="small text-danger mb-0" role="alert">
                                        {t("login.captchaNotConfigured")}
                                    </p>
                                )}
                                {!captchaToken && submitError === t("login.captchaRequired") && (
                                    <p id="captcha-error" className="small text-danger mt-1 mb-0" role="alert">
                                        {t("login.captchaBeforeSubmit")}
                                    </p>
                                )}
                            </div>
                            {submitError && submitError !== t("login.captchaRequired") && (
                                <div className="alert alert-danger" role="alert">{submitError}</div>
                            )}

                            <div className="row mb-3">
                                <div className="col-8">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexCheckDefault">
                                            {t("login.rememberMe")}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <ButtonPrimary
                                label={isSubmitting ? t("login.submitting") : t("login.submit")}
                                className="w-100"
                                type="submit"
                                disabled={isSubmitting}
                            />
                        </form>

                        <div className="social-auth-links text-center d-grid gap-2">
                            <button type="button" className="btn btn-danger" disabled>
                                <i className="bi bi-google me-2"></i>{t("login.google")}
                            </button>
                        </div>

                        <p className="mb-1">
                            <a href="/forgot-password">{t("login.forgotPassword")}</a>
                        </p>
                        <p className="mb-0">
                            {t("login.noAccount")} <Link to="/register">{t("login.register")}</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginScreen;