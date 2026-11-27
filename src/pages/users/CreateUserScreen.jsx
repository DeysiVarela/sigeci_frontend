import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useContext, useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import InputMultiSelect from "../../components/inputs/InputMultiSelect";

const CreateUserScreen = () => {
  const nav = useNavigate();
  const handlerApp = HandlerApp();
  const api = useFetch();
  const { app } = useContext(AppContext);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [profilesError, setProfilesError] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
    trigger,
  } = useForm({
    mode: "onChange", // Valida mientras escribes o sales del campo
  });

  // Si se cambia la contraseña después de llenar la confirmación, se vuelve a comparar
  const passwordValue = watch("password");
  useEffect(() => {
    if (getValues("confirmPassword")) trigger("confirmPassword");
  }, [passwordValue, getValues, trigger]);

  // Los roles salen del backend para que los ids coincidan
  useEffect(() => {
    api.get("profiles/")
      .then((res) => {
        const profiles = Array.isArray(res) ? res : res?.results || [];
        setRolesOptions(
          profiles.map((p) => ({ value: String(p.id), label: p.name })),
        );
      })
      .catch(() => setProfilesError(true));
  }, []);

  // Solo quien tenga el permiso user.create puede crear usuarios
  useEffect(() => {
    if (app?.permissions && !app.permissions?.["user"]?.includes("create")) {
      nav("/users");
    }
  }, [app?.permissions, nav]);


  const submitData = async (data) => {
    handlerApp.setLoader(true);
    try {
      await api.post("users/", {
        name: data.nombre.trim(),
        lastname: data.apellido.trim(),
        email: data.email.trim(),
        password: data.password,
        profiles: data.roles.map(Number),
      });

      // Apagamos el loader ANTES de mostrar el modal
      handlerApp.setLoader(false);

      await handlerApp.showOk("El usuario se registró correctamente.");

      reset();
      nav("/users");
    } catch (err) {
      handlerApp.setLoader(false);
      handlerApp.showError(err?.message || err?.detail || "No se pudo crear el usuario.");
    }
  };

  return (
    <div className="container-fluid pt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card title="Crear Nuevo Usuario">
            {profilesError && (
              <div className="alert alert-warning py-2" role="alert">
                No se pudieron cargar los roles. Recarga la página para
                intentarlo de nuevo.
              </div>
            )}
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

              {/* Confirmación: debe coincidir con la contraseña para poder guardar.
                  Solo se valida la coincidencia; la fortaleza ya se exige en "Contraseña". */}
              <InputPassword
                control={control}
                label="Confirmar contraseña"
                name="confirmPassword"
                placeholder="Repite la contraseña"
                errors={errors.confirmPassword}
                required={true}
                rules={{
                  minLength: { value: 0, message: "" },
                  pattern: { value: /^[\s\S]*$/, message: "" },
                  validate: (value) =>
                    value === getValues("password") || "Las contraseñas no coinciden",
                }}
              />

              <InputMultiSelect
                  control={control}
                  label="Roles del Usuario"
                  name="roles" 
                  options={rolesOptions}
                  errors={errors.roles}
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