import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import Card from "../../components/cards/Card";
import InputText from "../../components/inputs/InputText";
import InputSelect from "../../components/inputs/InputSelect";
import InputTextArea from "../../components/inputs/InputTextArea";
import InputPdf from "../../components/inputs/InputPdf";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import HandlerApp from "../../utils/HandlerApp";
import { useFetch } from "../../hooks/useFetch";
import { uploadFile } from "../../utils/uploadFiles";
import { getErrorMessage } from "../../utils/apiError";
import { useTranslation } from "react-i18next";

const ArticleFormScreen = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const nav = useNavigate();
    const { t } = useTranslation();
    const handlerApp = HandlerApp();
    const api = useFetch();
    const [topics, setTopics] = useState([]);
    const [currentArticle, setCurrentArticle] = useState(null);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
    });

    useEffect(() => {
        const loadData = async () => {
            handlerApp.setLoader(true);
            try {
                const topicsPromise = api.get("topic");
                const articlePromise = isEdit ? api.get(`article/${id}`) : Promise.resolve(null);
                const [topicsRes, articleRes] = await Promise.all([topicsPromise, articlePromise]);

                const list = Array.isArray(topicsRes?.data)
                    ? topicsRes.data
                    : Array.isArray(topicsRes)
                        ? topicsRes
                        : [];
                setTopics(
                    list.map((topic) => ({
                        value: String(topic.topic_id),
                        label: topic.topic_subject,
                    }))
                );

                if (isEdit && articleRes?.data) {
                    const art = articleRes.data;
                    setCurrentArticle(art);
                    setValue("article_subject", art.article_subject || "");
                    setValue("topic_id", art.topic_id ? String(art.topic_id) : "");
                    setValue("article_description", art.article_description || "");
                    setValue("article", art.article || "");
                }
            } catch (err) {
                if (isEdit) {
                    Swal.fire({
                        title: t("articleForm.alerts.errorTitle"),
                        text: getErrorMessage(err, t("articleForm.alerts.loadError")),
                        icon: "error",
                        confirmButtonText: t("articleForm.alerts.ok"),
                    });
                }
            } finally {
                handlerApp.setLoader(false);
            }
        };

        loadData();
    }, [id, isEdit, setValue]);

    const submitData = async (data) => {
        handlerApp.setLoader(true);
        try {
            const pdfFile = data.pdfFile?.[0];
            let articleAttachedUrl = null;
            if (pdfFile) {
                articleAttachedUrl = await uploadFile(api, pdfFile, "articles");
            }

            const payload = {
                article_subject: data.article_subject.trim(),
                topic_id: Number(data.topic_id),
                article_description: data.article_description?.trim() || "",
                article: data.article.trim(),
                ...(articleAttachedUrl ? { article_attached_url: articleAttachedUrl } : {}),
            };

            if (isEdit) {
                await api.put(`article/${id}/update`, payload);
            } else {
                await api.post("article/create", payload);
            }

            handlerApp.setLoader(false);

            await Swal.fire({
                title: isEdit ? t("articleForm.alerts.updatedTitle") : t("articleForm.alerts.createdTitle"),
                text: isEdit
                    ? t("articleForm.alerts.updatedText")
                    : t("articleForm.alerts.createdText"),
                icon: "success",
                confirmButtonText: t("articleForm.alerts.ok"),
            });

            reset();
            nav("/article");
        } catch (err) {
            handlerApp.setLoader(false);
            Swal.fire({
                title: isEdit ? t("articleForm.alerts.updateErrorTitle") : t("articleForm.alerts.createErrorTitle"),
                text: getErrorMessage(err, t("articleForm.alerts.saveError")),
                icon: "error",
                confirmButtonText: t("articleForm.alerts.ok"),
            });
        }
    };

    return (
        <div className="container-fluid pt-4">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <ButtonSecondary
                            onClick={() => nav("/article")}
                            className="btn-sm"
                        >
                            <i className="bi bi-arrow-left me-1"></i>
                            {t("articleForm.back")}
                        </ButtonSecondary>
                    </div>
                    <Card title={isEdit ? t("articleForm.editTitle", { id }) : t("articleForm.createTitle")} outline outlineColor="primary">
                        <form onSubmit={handleSubmit(submitData)}>
                            <div className="row">
                                <div className="col-md-6">
                                    <InputText
                                        control={control}
                                        label={t("articleForm.fields.subject")}
                                        name="article_subject"
                                        errors={errors.article_subject}
                                        required={true}
                                        rules={{ minLength: 3 }}
                                        placeholder={t("articleForm.fields.subjectPlaceholder")}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <InputSelect
                                        control={control}
                                        label={t("articleForm.fields.topic")}
                                        name="topic_id"
                                        options={topics}
                                        errors={errors.topic_id}
                                        required={true}
                                        placeholder={t("articleForm.fields.topicPlaceholder")}
                                    />
                                </div>
                            </div>

                            <InputTextArea
                                control={control}
                                label={t("articleForm.fields.description")}
                                name="article_description"
                                errors={errors.article_description}
                                required={false}
                                rows={3}
                                placeholder={t("articleForm.fields.descriptionPlaceholder")}
                            />

                            <InputTextArea
                                control={control}
                                label={t("articleForm.fields.content")}
                                name="article"
                                errors={errors.article}
                                required={true}
                                rows={5}
                                placeholder={t("articleForm.fields.contentPlaceholder")}
                            />

                            {isEdit && currentArticle?.article_attached_url && (
                                <div className="mb-3">
                                    <span className="small text-muted d-block mb-1">
                                        {t("articleForm.fields.currentPdf", { version: currentArticle.article_attached_version || "1.0" })}
                                    </span>
                                    <a
                                        href={currentArticle.article_attached_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="small text-decoration-none d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-file-earmark-pdf text-danger"></i>
                                        <span>{t("articleForm.fields.viewCurrentPdf")}</span>
                                    </a>
                                </div>
                            )}

                            <InputPdf
                                name="pdfFile"
                                label={isEdit ? t("articleForm.fields.replacePdf") : t("articleForm.fields.pdf")}
                                register={register}
                                errors={errors}
                                maxSizeMB={20}
                                required={!isEdit}
                            />

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <ButtonSecondary
                                    label={t("articleForm.buttons.cancel")}
                                    onClick={() => nav("/article")}
                                />
                                <ButtonPrimary
                                    type="submit"
                                    label={isEdit ? t("articleForm.buttons.saveChanges") : t("articleForm.buttons.saveArticle")}
                                />
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ArticleFormScreen;
