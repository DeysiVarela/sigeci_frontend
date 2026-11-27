import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import { useFetch } from "../../hooks/useFetch";

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
    const api = useFetch();

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
                const me = await api.get("users/me");
                if (cancelled) return;
                resetProfile({ name: me.name, lastname: me.lastname, email: me.email });
            } catch (err) {
                if (cancelled) return;
                handlerApp.showError(err?.message || err?.detail || "No se pudo cargar tu perfil.");
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
    }, [resetProfile]);

    // Funcion para guardar los datos personales (PATCH /api/users/me)
    const submitData = async (formData) => {
        handlerApp.setLoader(true);
        try {
            const updated = await api.patch("users/me", {
                name: formData.name.trim(),
                lastname: formData.lastname.trim(),
                email: formData.email.trim()
            });
            syncSessionUser(updated);
            // El backend normaliza el correo (minúsculas): se refleja en el formulario
            resetProfile({ name: updated.name, lastname: updated.lastname, email: updated.email });
            handlerApp.showOk("Tus datos se guardaron correctamente.");
        } catch (err) {
            handlerApp.showError(err?.message || err?.detail || "No se pudo actualizar el perfil.");
        } finally {
            handlerApp.setLoader(false);
        }
    };

    // Funcion para cambiar la contraseña (PUT /api/users/me/password/)
    // confirmPassword solo se valida en la pantalla: no se envía.
    const submitPassword = async ({ currentPassword, newPassword }) => {
        handlerApp.setLoader(true);
        try {
            await api.put("users/me/password/", { currentPassword, newPassword });
            await handlerApp.showOk("Tu contraseña ha sido cambiada exitosamente.");
            setShowPasswordSection(false);
            resetPassword();
        } catch (err) {
            const currentMsg = err?.currentPassword?.[0];
            const newMsg = err?.newPassword?.[0];

            if (currentMsg || newMsg) {
                if (currentMsg) setPasswordError("currentPassword", { type: "validate", message: currentMsg });
                if (newMsg) setPasswordError("newPassword", { type: "validate", message: newMsg });
            } else {
                handlerApp.showError(err?.message || err?.detail || "No se pudo cambiar la contraseña.");
            }
        } finally {
            handlerApp.setLoader(false);
        }
    };

    return (
        <div className="container-fluid pt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-7">
                    <Card title="Mi Perfil">
                        {isLoadingData ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="mt-2 text-muted">Cargando datos del perfil...</p>
                            </div>
                        ) : (
                            <form>
                                <div className="row">
                                    <div className="col-md-6">
                                        <InputText
                                            control={profileControl}
                                            label="Nombre"
                                            name="name"
                                            errors={profileErrors.name}
                                            required={true}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <InputText
                                            control={profileControl}
                                            label="Apellido"
                                            name="lastname"
                                            errors={profileErrors.lastname}
                                            required={true}
                                        />
                                    </div>
                                </div>

                                <InputEmail
                                    control={profileControl}
                                    label="Correo electronico"
                                    name="email"
                                    errors={profileErrors.email}
                                    required={true}
                                />

                                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                    <ButtonPrimary
                                        label="Guardar cambios"
                                        onClick={handleProfileSubmit(submitData)}
                                    />
                                </div>
                            </form>
                        )}
                    </Card>

                    <Card title="Cambiar Contraseña">
                        {!showPasswordSection ? (
                            <div className="text-center py-3">
                                <p className="text-muted mb-3">Por seguridad, puedes cambiar tu contraseña desde aqui.</p>
                                <ButtonPrimary 
                                    label="Cambiar mi contraseña" 
                                    onClick={() => setShowPasswordSection(true)} 
                                />
                            </div>
                        ) : (
                            <form>
                                <InputPassword
                                    control={passwordControl}
                                    label="Contraseña actual"
                                    name="currentPassword"
                                    errors={passwordErrors.currentPassword}
                                    required={true}
                                />
                                <InputPassword
                                    control={passwordControl}
                                    label="Nueva contraseña"
                                    name="newPassword"
                                    errors={passwordErrors.newPassword}
                                    required={true}
                                />
                                <InputPassword
                                    control={passwordControl}
                                    label="Confirmar nueva contraseña"
                                    name="confirmPassword"
                                    errors={passwordErrors.confirmPassword}
                                    required={true}
                                    rules={{
                                        validate: value => value === newPassword || "Las contraseñas no coinciden"
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