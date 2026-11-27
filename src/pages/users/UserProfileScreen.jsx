import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";

const UserProfileScreen = () => {
    const handlerApp = HandlerApp();
    const api = useFetch();
    const { setApp } = useContext(AppContext);

    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [profilesLabel, setProfilesLabel] = useState("");

    const {
        control: profileControl,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        reset: resetProfile,
    } = useForm({ mode: "onChange" });

    const {
        control: passwordControl,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        watch: watchPassword,
    } = useForm({ mode: "onChange" });

    const newPassword = watchPassword("new_password", "");

    useEffect(() => {
        let cancelled = false;
        handlerApp.setLoader(true);

        api.get("users/me")
            .then((res) => {
                if (cancelled) return;
                if (res.success) {
                    const me = res.data;
                    resetProfile({
                        user_name: me.user_name,
                        user_lastname: me.user_lastname,
                        user_email: me.user_email,
                    });
                    setProfilesLabel(
                        Array.isArray(me.profiles) && me.profiles.length > 0
                            ? me.profiles.map((p) => p.profile_name).join(", ")
                            : ""
                    );
                } else {
                    handlerApp.showError(res.message);
                }
            })
            .catch((err) => {
                if (!cancelled) handlerApp.showError(err.message);
            })
            .finally(() => {
                if (!cancelled) handlerApp.setLoader(false);
            });

        return () => {
            cancelled = true;
        };
    }, [resetProfile]);

    const submitData = async (formData) => {
        handlerApp.setLoader(true);
        try {
            const res = await api.patch("users/me", {
                user_name: formData.user_name.trim(),
                user_lastname: formData.user_lastname.trim(),
                user_email: formData.user_email.trim().toLowerCase(),
            });

            handlerApp.setLoader(false);
            if (res.success) {
                const updated = res.data;
                localStorage.setItem("name", updated.user_name);
                localStorage.setItem("lastname", updated.user_lastname);
                localStorage.setItem("email", updated.user_email);
                setApp((prev) => ({
                    ...prev,
                    name: updated.user_name,
                    email: updated.user_email,
                }));
                resetProfile({
                    user_name: updated.user_name,
                    user_lastname: updated.user_lastname,
                    user_email: updated.user_email,
                });
                handlerApp.showOk(res.message);
            } else {
                handlerApp.showError(res.message);
            }
        } catch (err) {
            handlerApp.setLoader(false);
            handlerApp.showError(err.message);
        }
    };

    const submitPassword = async ({ current_password, new_password }) => {
        handlerApp.setLoader(true);
        try {
            const res = await api.put("users/me/password/", {
                current_password,
                new_password,
            });
            handlerApp.setLoader(false);

            if (res.success) {
                await handlerApp.showOk(res.message);
                setShowPasswordSection(false);
                resetPassword();
            } else {
                handlerApp.showError(res.message);
            }
        } catch (err) {
            handlerApp.setLoader(false);
            handlerApp.showError(err.message);
        }
    };

    return (
        <div className="container-fluid pt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-7">
                    <Card title="Mi Perfil" outline outlineColor="primary">
                        {profilesLabel && (
                            <div className="mb-3">
                                <span className="text-muted small me-2">Perfiles asignados:</span>
                                <span className="badge bg-light text-dark border">
                                    <i className="bi bi-person-badge me-1 text-primary"></i>
                                    {profilesLabel}
                                </span>
                            </div>
                        )}
                        <form onSubmit={handleProfileSubmit(submitData)}>
                            <div className="row">
                                <div className="col-md-6">
                                    <InputText
                                        control={profileControl}
                                        label="Nombre"
                                        name="user_name"
                                        errors={profileErrors.user_name}
                                        required={true}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <InputText
                                        control={profileControl}
                                        label="Apellido"
                                        name="user_lastname"
                                        errors={profileErrors.user_lastname}
                                        required={true}
                                    />
                                </div>
                            </div>

                            <InputEmail
                                control={profileControl}
                                label="Correo electrónico"
                                name="user_email"
                                errors={profileErrors.user_email}
                                required={true}
                            />

                            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                <ButtonPrimary
                                    label="Guardar cambios"
                                    type="submit"
                                />
                            </div>
                        </form>
                    </Card>

                    <Card title="Cambiar Contraseña" outline outlineColor="secondary">
                        {!showPasswordSection ? (
                            <div className="text-center py-3">
                                <p className="text-muted mb-3">
                                    Por seguridad, puedes actualizar tu contraseña desde aquí.
                                </p>
                                <ButtonPrimary
                                    label="Cambiar mi contraseña"
                                    onClick={() => setShowPasswordSection(true)}
                                />
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSubmit(submitPassword)}>
                                <InputPassword
                                    control={passwordControl}
                                    label="Contraseña actual"
                                    name="current_password"
                                    errors={passwordErrors.current_password}
                                    required={true}
                                />
                                <InputPassword
                                    control={passwordControl}
                                    label="Nueva contraseña"
                                    name="new_password"
                                    errors={passwordErrors.new_password}
                                    required={true}
                                />
                                <InputPassword
                                    control={passwordControl}
                                    label="Confirmar nueva contraseña"
                                    name="confirm_password"
                                    errors={passwordErrors.confirm_password}
                                    required={true}
                                    rules={{
                                        minLength: { value: 0, message: "" },
                                        pattern: { value: /^[\s\S]*$/, message: "" },
                                        validate: (value) =>
                                            value === newPassword || "Las contraseñas no coinciden",
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
                                        Cancelar
                                    </button>
                                    <ButtonPrimary
                                        label="Actualizar contraseña"
                                        type="submit"
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
