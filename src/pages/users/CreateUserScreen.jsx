import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import InputSelect from "../../components/inputs/InputSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import Swal from "sweetalert2"; 

const CreateUserScreen = () => {
    const nav = useNavigate();
    const handlerApp = HandlerApp();

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        mode: "onChange" // <--- Esto valida mientras escribes o sales del campo
    });

    const submitData = () => {
        handlerApp.setLoader(true);
        

        setTimeout(() => {
            handlerApp.setLoader(false);
            
            // Usamos SweetAlert2 
            Swal.fire({
                title: '¡Éxito!',
                text: 'Usuario creado exitosamente (Simulación)',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                reset();
                nav("/users");
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
                    <Card title="Crear Nuevo Usuario">
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

                            {/* Usamos InputEmail que ya tiene la validación regex del template */}
                            <InputEmail
                                control={control}
                                label="Correo electrónico"
                                name="email"
                                errors={errors.email}
                                required={true}
                            />

                            {/* Usamos InputPassword que ya tiene la validación de contraseña fuerte */}
                            <InputPassword
                                control={control}
                                label="Contraseña"
                                name="password"
                                placeholder="Mínimo 8 caracteres"
                                errors={errors.password}
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

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => nav("/users")}
                                >
                                    Cancelar
                                </button>
                                <ButtonPrimary
                                    label="Guardar Usuario"
                                    onClick={handleSubmit(submitData)}
                                />
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreateUserScreen;