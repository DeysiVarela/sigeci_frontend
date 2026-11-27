import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import InputSelect from "../../components/inputs/InputSelect";
import InputMultiSelect from "../../components/inputs/InputMultiSelect";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";

const STATUS_OPTIONS = [
    { value: "true", label: "Activo" },
    { value: "false", label: "Inactivo" },
];

const UserFormScreen = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const handlerApp = HandlerApp();
    const api = useFetch();
    const { app } = useContext(AppContext);

    const [rolesOptions, setRolesOptions] = useState([]);
    const [original, setOriginal] = useState(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        getValues,
        trigger,
    } = useForm({ mode: "onChange" });

    const passwordValue = watch("user_password");
    useEffect(() => {
        if (!id && getValues("confirm_password")) {
            trigger("confirm_password");
        }
    }, [id, passwordValue, getValues, trigger]);

    useEffect(() => {
        handlerApp.setLoader(true);
        const requests = [api.get("profiles/")];
        if (id) {
            requests.push(api.get(`users/${id}/`));
        }

        Promise.all(requests)
        .then(([profileRes, userRes]) => {
            if (profileRes.success) {
                setRolesOptions(
                    profileRes.data.map((p) => ({
                        value: String(p.profile_id),
                        label: p.profile_name,
                    }))
                );
            } else {
                handlerApp.showError(profileRes.message);
            }

            if (id && userRes) {
                if (!userRes.success) {
                    handlerApp.showError(userRes.message);
                    nav("/users");
                    return;
                }
                const user = userRes.data;
                const profileIds = Array.isArray(user.profiles)
                    ? user.profiles.map((p) => p.profile_id).sort()
                    : [];
                setOriginal({ profiles: profileIds, user_active: user.user_active });

                reset({
                    user_name: user.user_name,
                    user_lastname: user.user_lastname,
                    user_email: user.user_email,
                    profiles: Array.isArray(user.profiles)
                        ? user.profiles.map((p) => String(p.profile_id))
                        : [],
                    user_active: String(user.user_active),
                });
            }
        })
        .catch((err) => {
            handlerApp.showError(err.message);
            if (id) nav("/users");
        })
        .finally(() => {
            handlerApp.setLoader(false);
        });
    }, [id, reset, nav]);

    const submitData = async (data) => {
        handlerApp.setLoader(true);
        try {
            let res;
            if (Boolean(id)) {
                const payload = {
                    user_name: data.user_name.trim(),
                    user_lastname: data.user_lastname.trim(),
                    user_email: data.user_email.trim().toLowerCase(),
                };

                if (app?.permissions?.["users"]?.includes("update")) {
                    const newProfiles = data.profiles.map(Number).sort();
                    if (JSON.stringify(newProfiles) !== JSON.stringify(original?.profiles)) {
                        payload.profiles = newProfiles;
                    }

                    const newActive = data.user_active === "true";
                    if (newActive !== original?.user_active) {
                        payload.user_active = newActive;
                    }
                }

                res = await api.patch(`users/${id}/`, payload);
            } else {
                res = await api.post("users/", {
                    user_name: data.user_name.trim(),
                    user_lastname: data.user_lastname.trim(),
                    user_email: data.user_email.trim().toLowerCase(),
                    user_password: data.user_password,
                    profiles: data.profiles.map(Number),
                });
            }

            handlerApp.setLoader(false);
            if (res.success) {
                await handlerApp.showOk(res.message);
                reset();
                nav("/users");
            } else {
                handlerApp.showError(res.message);
            }
        } catch (err) {
            handlerApp.setLoader(false);
            handlerApp.showError(err.message);
        }
    };

    return (
        <div className="container-fluid pt-4">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <ButtonSecondary
                            onClick={() => nav("/users")}
                            className="btn-sm"
                        >
                            <i className="bi bi-arrow-left me-1" />Volver
                        </ButtonSecondary>
                    </div>
                    <Card
                        title={id ? `Editar Usuario #${id}` : "Crear Usuario"}
                        outline
                        outlineColor="primary"
                    >
                        <form onSubmit={handleSubmit(submitData)}>
                            <div className="row">
                                <div className="col-md-6">
                                    <InputText
                                        control={control}
                                        label="Nombre"
                                        name="user_name"
                                        errors={errors.user_name}
                                        required={true}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <InputText
                                        control={control}
                                        label="Apellido"
                                        name="user_lastname"
                                        errors={errors.user_lastname}
                                        required={true}
                                    />
                                </div>
                            </div>

                            <InputEmail
                                control={control}
                                label="Correo electrónico"
                                name="user_email"
                                errors={errors.user_email}
                                required={true}
                            />

                            {!id && (
                                <>
                                    <InputPassword
                                        control={control}
                                        label="Contraseña"
                                        name="user_password"
                                        placeholder="Mínimo 8 caracteres"
                                        errors={errors.user_password}
                                        required={true}
                                    />

                                    <InputPassword
                                        control={control}
                                        label="Confirmar contraseña"
                                        name="confirm_password"
                                        placeholder="Repite la contraseña"
                                        errors={errors.confirm_password}
                                        required={true}
                                        rules={{
                                            minLength: { value: 0, message: "" },
                                            pattern: { value: /^[\s\S]*$/, message: "" },
                                            validate: (value) =>
                                                value === getValues("user_password") || "Las contraseñas no coinciden",
                                        }}
                                    />
                                </>
                            )}

                            {(!id || app?.permissions?.["users"]?.includes("update")) && (
                                <InputMultiSelect
                                    control={control}
                                    label="Perfiles del Usuario"
                                    name="profiles"
                                    options={rolesOptions}
                                    errors={errors.profiles}
                                    required={true}
                                />
                            )}

                            {Boolean(id) && app?.permissions?.["users"]?.includes("update") && (
                                <InputSelect
                                    control={control}
                                    label="Estado de la cuenta"
                                    name="user_active"
                                    options={STATUS_OPTIONS}
                                    errors={errors.user_active}
                                    required={true}
                                />
                            )}

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <ButtonSecondary
                                    label="Cancelar"
                                    onClick={() => nav("/users")}
                                />
                                <ButtonPrimary
                                    label={id ? "Actualizar Usuario" : "Guardar Usuario"}
                                    type="submit"
                                />
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserFormScreen;
