import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import Swal from "sweetalert2";
import { getMyProfile, updateMyProfile, changeMyPassword, deleteMyAccount } from "../../api/users";
import { getErrorMessage } from "../../utils/apiError";
import { logout } from "../../api/auth";

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
    const navigate = useNavigate();

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
                    title: "No se pudo cargar tu perfil",
                    text: getErrorMessage(err, "Intenta de nuevo en unos minutos."),
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            } finally {
                if (!cancelled) setIsLoadingData(false);
            }
        };

        loadProfile();


        return () => { cancelled = true; };
    }, [resetProfile]);

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
                title: 'Perfil actualizado',
                text: 'Tus datos se guardaron correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        } catch (err) {
            Swal.fire({
                title: 'No se pudo actualizar el perfil',
                text: getErrorMessage(err, "Revisa los datos e intenta de nuevo."),
                icon: 'error',
                confirmButtonText: 'Aceptar'
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
                title: 'Contraseña actualizada',
                text: 'Tu contraseña ha sido cambiada exitosamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
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
                    title: 'Demasiados intentos',
                    text: 'Espera un minuto antes de volver a intentarlo.',
                    icon: 'warning',
                    confirmButtonText: 'Aceptar'
                });
            } else if (currentMsg || newMsg) {
                // 400 con error por campo: se muestra debajo del input correspondiente
                if (currentMsg) setPasswordError("currentPassword", { type: "validate", message: currentMsg });
                if (newMsg) setPasswordError("newPassword", { type: "validate", message: newMsg });
            } else {
                Swal.fire({
                    title: 'No se pudo cambiar la contraseña',
                    text: getErrorMessage(err, "Intenta de nuevo."),
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        } finally {
            handlerApp.setLoader(false);
        }
    };

        //Funcion para manejar la eliminacion de la cuenta
    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción desactivará tu cuenta. Tus artículos se conservarán, pero no podrás volver a ingresar.",
            icon: "warning",
            input: "password",
            inputLabel: "Ingresa tu contraseña para confirmar",
            inputPlaceholder: "Tu contraseña actual",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar mi cuenta",
            cancelButtonText: "Cancelar",
            showLoaderOnConfirm: true,                          //  muestra el spinner mientras llama al backend
            allowOutsideClick: () => !Swal.isLoading(),         // no se puede cerrar mientras carga
            inputValidator: (value) => (value ? undefined : "Debes ingresar tu contraseña"),
            //  Llamada REAL al backend (ya no hay setTimeout simulado)
            preConfirm: async (password) => {
                try {
                    await deleteMyAccount({ password });
                    return true;
                } catch (err) {
                    // 400 (clave incorrecta / último admin) o 429 (demasiados intentos):
                    // el error se ve dentro del diálogo y este sigue abierto
                    Swal.showValidationMessage(
                        getErrorMessage(err, "No se pudo eliminar la cuenta. Intenta de nuevo.")
                    );
                    return false;
                }
            },
        });

        if (!result.isConfirmed) return; // canceló o cerró el diálogo

        // Antes borraba "token" y "user" (claves que no existen). logout() borra access, refresh y user.
        logout();

        await Swal.fire({
            title: "Cuenta eliminada",
            text: "Tu cuenta ha sido desactivada.", //se quitó lo de "reactivación": ese flujo no existe
            icon: "success",
            confirmButtonText: "Ir al Login",
        });

        navigate("/login", { replace: true }); // evita volver atrás a una pantalla protegida
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

                    {/* Zona de peligro: eliminar la cuenta (SCRUM-129) */}
                    <Card title="Zona de Peligro" outline outlineColor="danger" className="mt-4">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <h6 className="fw-bold text-danger mb-1">Eliminar mi cuenta</h6>
                                {/* se quitó "sin solicitar reactivación": no existe ese flujo */}
                                <p className="text-muted small mb-0">
                                    Una vez eliminada, tu cuenta se desactivará y no podrás volver a ingresar.
                                </p>
                            </div>
                            <button 
                                type="button" 
                                className="btn btn-danger"
                                onClick={handleDeleteAccount}
                            >
                                <i className="bi bi-trash me-1"></i> Eliminar mi cuenta
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserProfileScreen;