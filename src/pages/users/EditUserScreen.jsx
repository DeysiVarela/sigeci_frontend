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
import Swal from "sweetalert2";

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

  useEffect(() => {
    Promise.all([getUser(id), listProfiles()])
      .then(([u, profiles]) => {
        setRolesOptions(
          profiles.map((p) => ({ value: String(p.id), label: p.name })),
        );
        reset({
          nombre: u.name,
          apellido: u.lastname,
          email: u.email,
          rol: String(u.profile),
        });
      })
      .catch((e) =>
        Swal.fire({ title: "Error", text: e.message, icon: "error" }),
      )
      .finally(() => setIsLoadingData(false));
  }, [id, reset]);

const submitData = async (data) => {
    handlerApp.setLoader(true);
    try {
        await updateUser(id, {
            name: data.nombre.trim(),
            lastname: data.apellido.trim(),
            email: data.email.trim(),
            profile: Number(data.rol),
        });

        handlerApp.setLoader(false); 

        await Swal.fire({ title: "¡Actualizado!", text: "Usuario actualizado exitosamente", icon: "success" });
        nav("/users");
    } catch (e) {
        handlerApp.setLoader(false);
        Swal.fire({ title: "No se pudo actualizar", text: e.message, icon: "error" });
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
