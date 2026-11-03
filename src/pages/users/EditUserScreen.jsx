import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputSelect from "../../components/inputs/InputSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import { getUser, updateUser, listProfiles } from "../../api/users";
import { getErrorMessage } from "../../utils/apiError";
import Swal from "sweetalert2";

const STATUS_OPTIONS = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

const EditUserScreen = () => {
  const nav = useNavigate();
  const { id } = useParams(); // Obtenemos el ID de la URL
  const handlerApp = HandlerApp();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [rolesOptions, setRolesOptions] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange", // Valida mientras escribes
  });

  // Carga el usuario y los roles; el formulario se muestra cuando ya están ambos
  useEffect(() => {
    let cancelled = false;

    Promise.all([getUser(id), listProfiles()])
      .then(([user, profileRes]) => {
        if (cancelled) return;
        const profiles = Array.isArray(profileRes)
          ? profileRes
          : profileRes?.results || [];
        setRolesOptions(
          profiles.map((p) => ({ value: String(p.id), label: p.name })),
        );
        reset({
          nombre: user.name,
          apellido: user.lastname,
          email: user.email,
          rol: String(user.profile),
          estado: String(user.active),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        // Si el usuario no existe o falla la carga, avisamos y volvemos al listado
        Swal.fire({
          title: "Error",
          text: getErrorMessage(err, "No se pudo cargar el usuario."),
          icon: "error",
        }).then(() => nav("/users"));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reset, nav]);

  const submitData = async (data) => {
    handlerApp.setLoader(true);
    try {
      await updateUser(id, {
        name: data.nombre.trim(),
        lastname: data.apellido.trim(),
        email: data.email.trim(),
        profile: Number(data.rol),
        active: data.estado === "true",
      });

      // Apagamos el loader ANTES de mostrar el modal
      handlerApp.setLoader(false);

      await Swal.fire({
        title: "¡Actualizado!",
        text: "Los datos del usuario se guardaron correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      nav("/users");
    } catch (err) {
      handlerApp.setLoader(false); // También apagamos si hay error
      Swal.fire({
        title: "No se pudo actualizar",
        text: getErrorMessage(err, "No se pudo actualizar el usuario."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

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

                <InputSelect
                  control={control}
                  label="Estado"
                  name="estado"
                  options={STATUS_OPTIONS}
                  errors={errors.estado}
                  required={true}
                />

                <div className="alert alert-info py-2 mt-3">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>La contraseña no
                    se edita desde este formulario.
                  </small>
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