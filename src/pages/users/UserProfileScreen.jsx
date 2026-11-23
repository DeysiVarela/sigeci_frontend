import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import Swal from "sweetalert2";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../../api/users";
import { getErrorMessage } from "../../utils/apiError";
import { useTranslation } from "react-i18next";

// El login guarda el usuario en localStorage["user"] (lo leen otras pantallas).
// El PATCH devuelve la misma forma, así que se mezcla para no dejar la sesión desactualizada.
const syncSessionUser = (updatedUser) => {
    try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, ...updatedUser }));
    } catch {
        // sesión corrupta: se ignora, el próximo login la reescribe
    }
};

const UserProfileScreen = () => {
    const handlerApp = HandlerApp();
    const { t, i18n } = useTranslation();

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    // Formulario separado para los datos del perfil
    const {
        control: profileControl,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        reset: resetProfile
    } = useForm({ mode: "onChange" });

    // Formulario separado para la contraseña
    const {
        control: passwordControl,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        setError: setPasswordError,
        watch: watchPassword
    } = useForm({ mode: "onChange" });

    const newPassword = watchPassword("newPassword", "");

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            try {
                const me = await getMyProfile();
                if (cancelled) return;
                resetProfile({ name: me.name, lastname: me.lastname, email: me.email });
            } catch (err) {
                if (cancelled) return;
                Swal.fire({
                    title: i18n.t("userProfile.loadErrorTitle"),
                    text: getErrorMessage(err, i18n.t("userProfile.loadErrorText")),
                    icon: "error",
                    confirmButtonText: i18n.t("userForm.ok")
                });
            } finally {
                if (!cancelled) setIsLoadingData(false);
            }
        };

        loadProfile();

        // --- BLOQUE MOCK (Movido al final según tu indicación) ---
        // Nota: Si quitas el comentario de estas líneas, los datos de prueba 
        // sobrescribirán los datos reales de la API.
        /*
        setTimeout(() => {
            const mockUser = {
                nombre: "Laura Dayana",
                apellido: "Tascon",
                email: "laura@test.com",
            };
            resetProfile(mockUser); 
            setIsLoadingData(false);
        }, 1000);
        */
        // --------------------------------------------------------

        return () => { cancelled = true; };
    }, [resetProfile, i18n]);

    // Funcion para guardar los datos personales (PATCH /api/users/me)
    const submitData = async (formData) => {
        handlerApp.setLoader(true);
        try {
            const updated = await updateMyProfile({
                name: formData.name.trim(),
                lastname: formData.lastname.trim(),
                email: formData.email.trim()
            });
            syncSessionUser(updated);
            // El backend normaliza el correo (minúsculas): se refleja en el formulario
            resetProfile({ name: updated.name, lastname: updated.lastname, email: updated.email });
            Swal.fire({
                title: t("userProfile.updatedTitle"),
                text: t("userProfile.updatedText"),
                icon: 'success',
                confirmButtonText: t("userForm.ok")
            });
        } catch (err) {
            Swal.fire({
                title: t("userProfile.updateErrorTitle"),
                text: getErrorMessage(err, t("userProfile.updateErrorText")),
                icon: 'error',
                confirmButtonText: t("userForm.ok")
            });
        } finally {
            handlerApp.setLoader(false);
        }
    };

    // Funcion para cambiar la contraseña (PUT /api/users/me/password/)
    // confirmPassword solo se valida en la pantalla: no se envía.
    const submitPassword = async ({ currentPassword, newPassword }) => {
        handlerApp.setLoader(true);
        try {
            await changeMyPassword({ currentPassword, newPassword });
            Swal.fire({
                title: t("userProfile.password.updatedTitle"),
                text: t("userProfile.password.updatedText"),
                icon: 'success',
                confirmButtonText: t("userForm.ok")
            }).then(() => {
                setShowPasswordSection(false);
                resetPassword();
            });
        } catch (err) {
            const fieldErrors = err?.data;
            const currentMsg = fieldErrors?.currentPassword?.[0];
            const newMsg = fieldErrors?.newPassword?.[0];

            if (err?.status === 429) {
                Swal.fire({
                    title: t("userProfile.password.tooManyTitle"),
                    text: t("userProfile.password.tooManyText"),
                    icon: 'warning',
                    confirmButtonText: t("userForm.ok")
                });
            } else if (currentMsg || newMsg) {
                // 400 con error por campo: se muestra debajo del input correspondiente
                if (currentMsg) setPasswordError("currentPassword", { type: "validate", message: currentMsg });
                if (newMsg) setPasswordError("newPassword", { type: "validate", message: newMsg });
            } else {
                Swal.fire({
                    title: t("userProfile.password.errorTitle"),
                    text: getErrorMessage(err, t("userProfile.password.errorText")),
                    icon: 'error',
                    confirmButtonText: t("userForm.ok")
                });
            }
        } finally {
            handlerApp.setLoader(false);
        }
    };

    return (
        <div className="container-fluid pt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-7">
                    <Card title={t("userProfile.title")}>
                        {isLoadingData ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">{t("userProfile.loadingShort")}</span>
                                </div>
                                <p className="mt-2 text-muted">{t("userProfile.loading")}</p>
                            </div>
                        ) : (
                            <form>
                                <div className="row">
                                    <div className="col-md-6">
                                        <InputText
                                            control={profileControl}
                                            label={t("userForm.fields.name")}
                                            name="name"
                                            errors={profileErrors.name}
                                            required={true}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <InputText
                                            control={profileControl}
                                            label={t("userForm.fields.lastname")}
                                            name="lastname"
                                            errors={profileErrors.lastname}
                                            required={true}
                                        />
                                    </div>
                                </div>

                                <InputEmail
                                    control={profileControl}
                                    label={t("userForm.fields.email")}
                                    name="email"
                                    errors={profileErrors.email}
                                    required={true}
                                />

                                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                    <ButtonPrimary
                                        label={t("userProfile.save")}
                                        onClick={handleProfileSubmit(submitData)}
                                    />
                                </div>
                            </form>
                        )}
                    </Card>

                    <Card title={t("userProfile.password.title")}>
                        {!showPasswordSection ? (
                            <div className="text-center py-3">
                                <p className="text-muted mb-3">{t("userProfile.password.intro")}</p>
                                <ButtonPrimary
                                    label={t("userProfile.password.open")}
                                    onClick={() => setShowPasswordSection(true)}
                                />
                            </div>
                        ) : (
                            <form>
                                <InputPassword
                                    control={passwordControl}
                                    label={t("userProfile.password.current")}
                                    name="currentPassword"
                                    errors={passwordErrors.currentPassword}
                                    required={true}
                                />
                                <InputPassword
                                    control={passwordControl}
                                    label={t("userProfile.password.new")}
                                    name="newPassword"
                                    errors={passwordErrors.newPassword}
                                    required={true}
                                />
                                <InputPassword
                                    control={passwordControl}
                                    label={t("userProfile.password.confirm")}
                                    name="confirmPassword"
                                    errors={passwordErrors.confirmPassword}
                                    required={true}
                                    rules={{
                                        validate: value => value === newPassword || t("userForm.passwordsMismatch")
                                    }}
                                />
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowPasswordSection(false);
                                            resetPassword();
                                        }}
                                    >
                                        {t("userForm.cancel")}
                                    </button>
                                    <ButtonPrimary
                                        label={t("userProfile.password.save")}
                                        onClick={handlePasswordSubmit(submitPassword)}
                                    />
                                </div>
                            </form>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserProfileScreen;