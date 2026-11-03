import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import InputSelect from "../../components/inputs/InputSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import { createUser, listProfiles } from "../../api/users";
import { getErrorMessage } from "../../utils/apiError";
import Swal from "sweetalert2";

const CreateUserScreen = () => {
  const nav = useNavigate();
  const handlerApp = HandlerApp();
  const [rolesOptions, setRolesOptions] = useState([]);
  const [profilesError, setProfilesError] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange", // Valida mientras escribes o sales del campo
  });

  // Los roles salen del backend para que los ids coincidan
  useEffect(() => {
    listProfiles()
      .then((res) => {
        const profiles = Array.isArray(res) ? res : res?.results || [];
        setRolesOptions(
          profiles.map((p) => ({ value: String(p.id), label: p.name })),
        );
      })
      .catch(() => setProfilesError(true));
  }, []);

  const submitData = async (data) => {
    handlerApp.setLoader(true);
    try {
      await createUser({
        name: data.nombre.trim(),
        lastname: data.apellido.trim(),
        email: data.email.trim(),
        password: data.password,
        profile: Number(data.rol),
      });

      // Apagamos el loader ANTES de mostrar el modal
      handlerApp.setLoader(false);

      await Swal.fire({
        title: "¡Usuario creado!",
        text: "El usuario se registró correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      reset();
      nav("/users");
    } catch (err) {
      handlerApp.setLoader(false); // También apagamos si hay error
      Swal.fire({
        title: "No se pudo crear el usuario",
        text: getErrorMessage(err, "No se pudo crear el usuario."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
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