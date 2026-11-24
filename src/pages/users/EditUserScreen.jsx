import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputSelect from "../../components/inputs/InputSelect";
import InputMultiSelect from "../../components/inputs/InputMultiSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import { getUser, updateUser, listProfiles, getMe } from "../../api/users";
import { isManager, canEditUser } from "../../utils/userAccess";
import { getErrorMessage } from "../../utils/apiError";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

// Se guarda la clave de traducción; el texto se genera dentro del componente con t()
const STATUS_OPTIONS = [
  { value: "true", labelKey: "userScreen.status.active" },
  { value: "false", labelKey: "userScreen.status.inactive" },
];

const EditUserScreen = () => {
  const nav = useNavigate();
  const { id } = useParams(); // Obtenemos el ID de la URL
  const handlerApp = HandlerApp();
  const { t, i18n } = useTranslation();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [manager, setManager] = useState(false);
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
    let denied = false;

    Promise.all([getUser(id), listProfiles(), getMe()])
      .then(([user, profileRes, me]) => {
        if (cancelled) return;

        if (!canEditUser(me, id, user)) {
          denied = true;
          Swal.fire({
            title: i18n.t("userForm.edit.noPermissionTitle"),
            text: i18n.t("userForm.edit.noPermissionText"),
            icon: "warning",
          }).then(() => nav("/users"));
          return;
        }

        setManager(isManager(me));

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
        Swal.fire({
          title: i18n.t("userForm.edit.loadErrorTitle"),
          text: getErrorMessage(err, i18n.t("userForm.edit.loadError")),
          icon: "error",
        }).then(() => nav("/users"));
      })
      .finally(() => {
        if (!cancelled && !denied) setIsLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reset, nav, i18n]);

  const submitData = async (data) => {
    handlerApp.setLoader(true);
    try {
      const payload = {
        name: data.nombre.trim(),
        lastname: data.apellido.trim(),
        email: data.email.trim(),
      };

      // Rol y estado solo los envía un gestor, y solo si cambiaron
      if (manager) {
        const newProfiles = data.roles.map(Number).sort();
        if (JSON.stringify(newProfiles) !== JSON.stringify(original?.profiles)) {
          payload.profiles = newProfiles;
        }

        const newActive = data.estado === "true";
        if (newActive !== original?.active) payload.active = newActive;
      }

      await updateUser(id, payload);

      // Apagamos el loader ANTES de mostrar el modal
      handlerApp.setLoader(false);

      await Swal.fire({
        title: t("userForm.edit.successTitle"),
        text: t("userForm.edit.successText"),
        icon: "success",
        confirmButtonText: t("userForm.ok"),
      });
      nav("/users");
    } catch (err) {
      handlerApp.setLoader(false); // También apagamos si hay error
      Swal.fire({
        title: t("userForm.edit.errorTitle"),
        text: getErrorMessage(err, t("userForm.edit.errorText")),
        icon: "error",
        confirmButtonText: t("userForm.ok"),
      });
    }
  };

  return (
    <div className="container-fluid pt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card title={t("userForm.edit.title")}>
            {isLoadingData ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t("userForm.edit.loadingShort")}</span>
                </div>
                <p className="mt-2 text-muted">{t("userForm.edit.loading")}</p>
              </div>
            ) : (
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

                <InputEmail
                  control={control}
                  label={t("userForm.fields.email")}
                  name="email"
                  errors={errors.email}
                  required={true}
                />

                {manager && (
                  <>

                    <InputMultiSelect
                      control={control}
                      label={t("userForm.fields.roles")}
                      name="roles"
                      options={rolesOptions}
                      errors={errors.roles}
                      required={true}
                    />



                    {/* NUEVO: Restauramos el InputSelect para el Estado */}
                    <InputSelect
                      control={control}
                      label={t("userForm.fields.status")}
                      name="estado"
                      options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                      errors={errors.estado}
                      required={true}
                    />
                  </>
                )}

                <div className="alert alert-info py-2 mt-3">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    {t("userForm.edit.passwordNote")}
                  </small>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => nav("/users")}
                  >
                    {t("userForm.cancel")}
                  </button>
                  <ButtonPrimary
                    label={t("userForm.edit.save")}
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