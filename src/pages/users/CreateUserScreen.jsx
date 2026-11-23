import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import InputMultiSelect from "../../components/inputs/InputMultiSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import { createUser, listProfiles, getMe } from "../../api/users";
import { isManager } from "../../utils/userAccess";
import { getErrorMessage } from "../../utils/apiError";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const CreateUserScreen = () => {
  const nav = useNavigate();
  const handlerApp = HandlerApp();
  const { t } = useTranslation();
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
    listProfiles()
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
    getMe()
      .then((me) => {
        if (!isManager(me)) nav("/users");
      })
      .catch(() => nav("/users"));
  }, [nav]);


  const submitData = async (data) => {
    handlerApp.setLoader(true);
    try {
      await createUser({
        name: data.nombre.trim(),
        lastname: data.apellido.trim(),
        email: data.email.trim(),
        password: data.password,
        profiles: data.roles.map(Number),
      });

      // Apagamos el loader ANTES de mostrar el modal
      handlerApp.setLoader(false);

      await Swal.fire({
        title: t("userForm.create.successTitle"),
        text: t("userForm.create.successText"),
        icon: "success",
        confirmButtonText: t("userForm.ok"),
      });

      reset();
      nav("/users");
    } catch (err) {
      handlerApp.setLoader(false); // También apagamos si hay error
      Swal.fire({
        title: t("userForm.create.errorTitle"),
        text: getErrorMessage(err, t("userForm.create.errorText")),
        icon: "error",
        confirmButtonText: t("userForm.ok"),
      });
    }
  };

  return (
    <div className="container-fluid pt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card title={t("userForm.create.title")}>
            {profilesError && (
              <div className="alert alert-warning py-2" role="alert">
                {t("userForm.create.profilesError")}
              </div>
            )}
            <form>
              <div className="row">
                <div className="col-md-6">
                  <InputText
                    control={control}
                    label={t("userForm.fields.name")}
                    name="nombre"
                    errors={errors.nombre}
                    required={true}
                  />
                </div>
                <div className="col-md-6">
                  <InputText
                    control={control}
                    label={t("userForm.fields.lastname")}
                    name="apellido"
                    errors={errors.apellido}
                    required={true}
                  />
                </div>
              </div>

              {/* Usamos InputEmail que ya tiene la validación regex del template */}
              <InputEmail
                control={control}
                label={t("userForm.fields.email")}
                name="email"
                errors={errors.email}
                required={true}
              />

              {/* Usamos InputPassword que ya tiene la validación de contraseña fuerte */}
              <InputPassword
                control={control}
                label={t("userForm.fields.password")}
                name="password"
                placeholder={t("userForm.fields.passwordPlaceholder")}
                errors={errors.password}
                required={true}
              />

              {/* Confirmación: debe coincidir con la contraseña para poder guardar.
                  Solo se valida la coincidencia; la fortaleza ya se exige en "Contraseña". */}
              <InputPassword
                control={control}
                label={t("userForm.fields.confirmPassword")}
                name="confirmPassword"
                placeholder={t("userForm.fields.confirmPasswordPlaceholder")}
                errors={errors.confirmPassword}
                required={true}
                rules={{
                  minLength: { value: 0, message: "" },
                  pattern: { value: /^[\s\S]*$/, message: "" },
                  validate: (value) =>
                    value === getValues("password") || t("userForm.passwordsMismatch"),
                }}
              />

              <InputMultiSelect
                  control={control}
                  label={t("userForm.fields.roles")}
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
                  {t("userForm.cancel")}
                </button>
                <ButtonPrimary
                  label={t("userForm.create.save")}
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