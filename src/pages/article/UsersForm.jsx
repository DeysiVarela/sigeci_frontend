import { HandlerApp } from "../../../utils/handlerApp";
import InputTextValidate from "../../../components/inputs/input/InputTextValidate";
import InputEmail from "../../../components/inputs/email/InputEmail";
import InputPhone from "../../../components/inputs/phone/InputPhone";
import InputSelect from "../../../components/inputs/InputSelect";
import BoldUploadImage from "../../../components/BoldUploadImage/BoldUploadImage";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { useFetch } from "../../../hooks/useFetch";
import { AppContext } from "../../../context/AppContext";

const UsersForm = ({ id, sendForm, setSendForm, dataForm, setDataForm, index, setIndex, maxIndexForm, setSendData, profiles }) => {
    const handlerApp = HandlerApp();
    const endpoint = "users";
    const [t] = useTranslation("global");
    const api = useFetch();

    const { register, control, handleSubmit, formState: { errors }, setValue } = useForm();

    const { app } = useContext(AppContext);

    const [nextIndex, setNextIndex] = useState(null);
    const [formEnabled, setFormEnabled] = useState(false);

    const [formData, setFormData] = useState({
        user_name: "",
        user_lastname: "",
        user_email: "",
        user_phone: "",
        user_profile_id: "",
        user_image: null,
        user_approved: false,
        user_active: true
    });

    useEffect(() => {
        if (Object.keys(dataForm).length > 0) {
            filterData(dataForm);
        } else {
            if (id) {
                sendRequest();
            }
        }
    }, []);

    useEffect(() => {
        setSendForm(prev => {
            return false;
        });
        setFormEnabled(true);
        if (sendForm !== false) {
            let result = sendForm.toString().split("|");
            verifyNavigation(result);
        }
    }, [sendForm]);

    useEffect(() => {
        if (nextIndex !== null && nextIndex !== undefined) {
            setNextIndex(null);
            setIndex(nextIndex);
        }
    }, [nextIndex]);

    const handleImages = (image) => {
        setFormData({
            ...formData,
            user_image: image
        });
        setValue("user_image", image);
    };

    const sendRequest = () => {
        handlerApp.setLoader(true);
        api.get(endpoint + "/" + id)
        .then(response => {
            if (response.success) {
                let data = response.data[0];
                if (data) {
                    filterData(data);
                }
                handlerApp.setLoader(false);
            } else {
                filterData([]);
                handlerApp.setLoader(false);
            }
        })
        .catch(error => {
            handlerApp.setLoader(false);
            handlerApp.handlerError(error);
        });
    };

    const filterData = (data) => {
        let form = handlerApp.filterDataForm(data, formData, setValue);
        setFormData(form);
    };

    const handleSubmitForm = (data) => {
        if (formEnabled) {
            setDataForFinalForm(data);
            if (index != maxIndexForm) {
                setSendForm(prev => {
                    return false;
                });
                setIndex(index + 1);
            } else {
                setSendData(handlerApp.randomNumber());
            }
        }
    };

    const setDataForFinalForm = (data) => {
        setDataForm({ ...data });
        return data;
    };

    const saveForm = async (data) => {
        setDataForFinalForm(data);
    };

    const sendFormBackend = async (data) => {
        setDataForFinalForm(data);
        setSendData(handlerApp.randomNumber());
    };

    const verifyNavigation = (result) => {
        if (result[0] === "TAB") {
            handleSubmit((data) => {
                saveForm(data);
                setNextIndex(parseInt(result[1]));
            })();
        } else if (result[0] === "SEND") {
            handleSubmit(sendFormBackend)();
        } else {
            handleSubmit(handleSubmitForm)();
        }
    };

    return (
        <div className="flex-1 p-4 sm:max-w-4xl mx-auto">
            {/* Contact Section */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 mb-4">
                <div className="flex items-center mb-4 space-x-2">
                    <i className="fas fa-users h-5 w-5 text-[var(--primary-container)]"></i>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t("users.modal.personal_info")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 flex justify-center mb-4">
                        <div className="circle-image">
                            <BoldUploadImage
                                handleImages={handleImages}
                                value={formData.user_image}
                                icon="fa-user"
                            />
                        </div>
                    </div>
                    <div className="w-full">
                        <InputTextValidate
                            label={t("users.modal.name")}
                            name="user_name"
                            errors={errors.user_name}
                            rules={{
                                required: true,
                                minLength: 2,
                                pattern: {
                                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                                }
                            }}
                            register={register}
                            control={control}
                        />
                    </div>
                    <div className="w-full">
                        <InputTextValidate
                            label={t("users.modal.lastname")}
                            name="user_lastname"
                            errors={errors.user_lastname}
                            rules={{
                                required: true,
                                minLength: 2,
                                pattern: {
                                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                                }
                            }}
                            register={register}
                            control={control}
                        />
                    </div>
                    <div className="w-full">
                        <InputEmail
                            label={t("users.modal.email")}
                            name="user_email"
                            errors={errors.user_email}
                            control={control}
                            required={true}
                        />
                    </div>
                    <div className="w-full">
                        <InputPhone
                            label={t("users.modal.phone")}
                            name="user_phone"
                            errors={errors.user_phone}
                            control={control}
                            required={false}
                        />
                    </div>
                    <div className="w-full">
                        <InputSelect
                            label={t("users.modal.profile")}
                            name="user_profile_id"
                            options={profiles?.map(p => ({ value: p.code, label: p.name })) || []}
                            control={control}
                            errors={errors.user_profile_id}
                            rules={{ required: true }}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UsersForm;
