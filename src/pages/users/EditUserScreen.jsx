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
import { getUser, updateUser, listProfiles } from "../../api/users";
import { getErrorMessage } from "../../utils/apiError";

const STATUS_OPTIONS = [
    { value: "true", label: "Activo" },
    { value: "false", label: "Inactivo" },
];

const EditUserScreen = () => {
    const nav = useNavigate();
    const { id } = useParams();
    const handlerApp = HandlerApp();

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        mode: "onChange"
    });

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [profiles, setProfiles] = useState([]);

    // Carga el usuario y los roles; el formulario se muestra cuando ya están ambos
    useEffect(() => {
        let cancelled = false;
        setIsLoadingData(true);
        setLoadError("");

        Promise.all([getUser(id), listProfiles()])
            .then(([user, profileRes]) => {
                if (cancelled) return;
                setProfiles(Array.isArray(profileRes) ? profileRes : profileRes?.results || []);
                reset({
                    nombre: user.name,
                    apellido: user.lastname,
                    email: user.email,
                    rol: String(user.profile),
                    estado: String(user.active),
                });
            })
            .catch((err) => {
                if (!cancelled) setLoadError(getErrorMessage(err, "No se pudo cargar el usuario."));
            })
            .finally(() => {
                if (!cancelled) setIsLoadingData(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id, reset]);

    const rolesOptions = profiles.map((p) => ({ value: String(p.id), label: p.name }));

    const submitData = async (data) => {
        handlerApp.setLoader(true);
        let updated = false;
        let errorMessage = "";

        try {
            await updateUser(id, {
                name: data.nombre,
                lastname: data.apellido,
                email: data.email,
                profile: Number(data.rol),
                active: data.estado === "true",
            });
            updated = true;
        } catch (err) {
            errorMessage = getErrorMessage(err, "No se pudo actualizar el usuario.");
        } finally {
            handlerApp.setLoader(false);
        }

        if (!updated) {
            Swal.fire({
                title: "No se pudo actualizar",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Aceptar",
            });
            return;
        }

        await Swal.fire({
            title: "¡Actualizado!",
            text: "Los datos del usuario se guardaron correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
        });
        nav("/users");
    };

    const renderBody = () => {
        if (isLoadingData) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando datos...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando datos del usuario...</p>
                </div>
            );
        }

        if (loadError) {
            return (
                <div className="text-center py-4">
                    <div className="alert alert-danger" role="alert">{loadError}</div>
                    <button type="button" className="btn btn-secondary" onClick={() => nav("/users")}>
                        Volver al listado
                    </button>
                </div>
            );
        }

        return (
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

                <InputSelect
                    control={control}
                    label="Estado"
                    name="estado"
                    options={STATUS_OPTIONS}
                    errors={errors.estado}
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
        );
    };

    return (
        <div className="container-fluid pt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <Card title={`Editar Usuario (ID: ${id})`}>
                        {renderBody()}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditUserScreen;
