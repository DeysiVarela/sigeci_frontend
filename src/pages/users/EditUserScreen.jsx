import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputSelect from "../../components/inputs/InputSelect";
import InputMultiSelect from "../../components/inputs/InputMultiSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";

const STATUS_OPTIONS = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

const EditUserScreen = () => {
  const nav = useNavigate();
  const { id } = useParams(); // Obtenemos el ID de la URL
  const handlerApp = HandlerApp();
  const api = useFetch();

  const { app } = useContext(AppContext);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [original, setOriginal] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.get(`users/${id}/`), api.get("profiles/")])
      .then(([user, profileRes]) => {
        if (cancelled) return;

        const userProfiles = user.profiles ? user.profiles.map(p => p.id).sort() : [];
        setOriginal({ profiles: userProfiles, active: user.active });

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
          roles: user.profiles ? user.profiles.map(p => String(p.id)) : [],
          estado: String(user.active),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        handlerApp.showError(err?.message || err?.detail || "No se pudo cargar el usuario.");
        nav("/users");
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
      const payload = {
        name: data.nombre.trim(),
        lastname: data.apellido.trim(),
        email: data.email.trim(),
      };

      // Rol y estado solo los envía un gestor, y solo si cambiaron
      if (app?.permissions?.["user"]?.includes("update")) {
        const newProfiles = data.roles.map(Number).sort();
        if (JSON.stringify(newProfiles) !== JSON.stringify(original?.profiles)) {
          payload.profiles = newProfiles;
        }

        const newActive = data.estado === "true";
        if (newActive !== original?.active) payload.active = newActive;
      }

      await api.patch(`users/${id}/`, payload);

      // Apagamos el loader ANTES de mostrar el modal
      handlerApp.setLoader(false);

      await handlerApp.showOk("Los datos del usuario se guardaron correctamente.");
      nav("/users");
    } catch (err) {
      handlerApp.setLoader(false);
      handlerApp.showError(err?.message || err?.detail || "No se pudo actualizar el usuario.");
    }
  };

  return (
    <div className="container-fluid pt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card title={`Editar Usuario`}>
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

                {app?.permissions?.["user"]?.includes("update") && (
                  <>

                    <InputMultiSelect
                      control={control}
                      label="Roles del Usuario"
                      name="roles"
                      options={rolesOptions}
                      errors={errors.roles}
                      required={true}
                    />



                    {/* NUEVO: Restauramos el InputSelect para el Estado */}
                    <InputSelect
                      control={control}
                      label="Estado de la cuenta"
                      name="estado"
                      options={STATUS_OPTIONS}
                      errors={errors.estado}
                      required={true}
                    />
                  </>
                )}

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