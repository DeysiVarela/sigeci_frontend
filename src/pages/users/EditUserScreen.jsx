import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputSelect from "../../components/inputs/InputSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import Swal from "sweetalert2";

const EditUserScreen = () => {
    const nav = useNavigate();
    const { id } = useParams(); // Obtenemos el ID de la URL
    const handlerApp = HandlerApp();

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        mode: "onChange" // Valida mientras escribes
    });

    // Estado para simular la carga de datos del backend
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Simulamos que traemos los datos del usuario (SCRUM-80 de Enrique)
    useEffect(() => {
        // Simulamos 1 segundo de carga
        setTimeout(() => {
            const mockUser = {
                nombre: "Enrique",
                apellido: "Lozano",
                email: "enrique@ejemplo.com",
                rol: "comite" // Debe coincidir con el value del select
            };
            reset(mockUser); // Llenamos el formulario
            setIsLoadingData(false);
        }, 1000);
    }, [id, reset]);

    const submitData = (data) => {
        handlerApp.setLoader(true);
        

        // Simulamos la petición al backend
        setTimeout(() => {
            handlerApp.setLoader(false);
            
            Swal.fire({
                title: '¡Actualizado!',
                text: 'Usuario actualizado exitosamente (Simulación)',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                nav("/users"); // Volver al listado
            });

        }, 2000);
    };

    const rolesOptions = [
        { value: "admin", label: "Administrador" },
        { value: "comite", label: "Comité Científico" },
        { value: "autor", label: "Autor" }
    ];

    return (
        <div className="container-fluid pt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <Card title={`Editar Usuario (ID: ${id})`}>
                        {isLoadingData ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando datos...</span>
                                </div>
                                <p className="mt-2 text-muted">Cargando datos del usuario...</p>
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
                                    label="Correo electrónico"
                                    name="email"
                                    errors={errors.email}
                                    required={true}
                                />

                                <InputSelect
                                    control={control}
                                    label="Rol del Usuario"
                                    name="rol"
                                    options={rolesOptions}
                                    errors={errors.rol}
                                    required={true}
                                />

                                <div className="alert alert-info py-2 mt-3">
                                    <small><i className="bi bi-info-circle me-2"></i>La contraseña no se edita desde este formulario.</small>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => nav("/users")}
                                    >
                                        Cancelar
                                    </button>
                                    <ButtonPrimary
                                        label="Actualizar Usuario"
                                        onClick={handleSubmit(submitData)}
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

export default EditUserScreen;