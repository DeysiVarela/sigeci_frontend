import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import Swal from "sweetalert2";

const UserProfileScreen = () => {
    const handlerApp = HandlerApp();

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
        mode: "onChange"
    });

    const newPassword = watch("newPassword", "");

    useEffect(() => {
        setTimeout(() => {
            const mockUser = {
                nombre: "Laura Dayana",
                apellido: "Tascon",
                email: "laura@test.com",
                telefono: "+57 300 123 4567",
                afiliacion: "Universidad del Valle"
            };
            reset(mockUser); 
            setIsLoadingData(false);
        }, 1000);
    }, [reset]);

    const submitData = () => {
        handlerApp.setLoader(true);
        
        setTimeout(() => {
            handlerApp.setLoader(false);
            Swal.fire({
                title: 'Perfil actualizado',
                text: 'Tus datos se guardaron correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        }, 2000);
    };

    const submitPassword = () => {
        handlerApp.setLoader(true);
        
        setTimeout(() => {
            handlerApp.setLoader(false);
            Swal.fire({
                title: 'Contraseña actualizada',
                text: 'Tu contraseña ha sido cambiada exitosamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                setShowPasswordSection(false);
            });
        }, 2000);
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
                                            control={control}
                                            label="Nombre"
                                            name="nombre"
                                            errors={errors.nombre}
                                            required={true}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <InputText
                                            control={control}
                                            label="Apellido"
                                            name="apellido"
                                            errors={errors.apellido}
                                            required={true}
                                        />
                                    </div>
                                </div>

                                <InputEmail
                                    control={control}
                                    label="Correo electronico"
                                    name="email"
                                    errors={errors.email}
                                    required={true}
                                />

                                <InputText
                                    control={control}
                                    label="Telefono"
                                    name="telefono"
                                    errors={errors.telefono}
                                    required={true}
                                />

                                <InputText
                                    control={control}
                                    label="Afiliacion / Institucion"
                                    name="afiliacion"
                                    errors={errors.afiliacion}
                                    required={true}
                                />

                                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                    <ButtonPrimary
                                        label="Guardar cambios"
                                        onClick={handleSubmit(submitData)}
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
                                    control={control}
                                    label="Contraseña actual"
                                    name="currentPassword"
                                    errors={errors.currentPassword}
                                    required={true}
                                />
                                <InputPassword
                                    control={control}
                                    label="Nueva contraseña"
                                    name="newPassword"
                                    errors={errors.newPassword}
                                    required={true}
                                />
                                <InputPassword
                                    control={control}
                                    label="Confirmar nueva contraseña"
                                    name="confirmPassword"
                                    errors={errors.confirmPassword}
                                    required={true}
                                    rules={{
                                        validate: value => value === newPassword || "Las contraseñas no coinciden"
                                    }}
                                />
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowPasswordSection(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <ButtonPrimary
                                        label="Actualizar contraseña"
                                        onClick={handleSubmit(submitPassword)}
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