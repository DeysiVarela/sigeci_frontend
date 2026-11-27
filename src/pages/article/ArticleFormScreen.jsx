import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { uploadFile } from "../../utils/uploadFiles";
import { useNavigate, useParams } from "react-router";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import InputPdf from "../../components/inputs/InputPdf";
import InputText from "../../components/inputs/InputText";
import InputSelect from "../../components/inputs/InputSelect";
import InputTextArea from "../../components/inputs/InputTextArea";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";

const ArticleFormScreen = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const handlerApp = HandlerApp();
    const api = useFetch();
    const [topics, setTopics] = useState([]);
    const [currentArticle, setCurrentArticle] = useState(null);

    const { register,control,handleSubmit,formState: { errors },reset,} = useForm({ mode: "onChange"});

    useEffect(() => {
        if(id){
            getArticleById(id);
        }
    }, []);

    const getArticleById = async (id) => {
        try {
            const result = await api.get(`article/${id}`);
            if(result.success){
                setCurrentArticle(result.data);
                reset(result.data);
            }
        } catch (err) {
            handlerApp.showError(err.message);
        }
    };

    const submitData = async (data) => {
        handlerApp.setLoader(true);
        try {
            // Cargue de fichero
            const pdfFile = data.pdfFile?.[0];
            let articleAttachedUrl = null;
            if (pdfFile) {
                articleAttachedUrl = await uploadFile(api, pdfFile, "articles");
            }

            // datos de formulario + url de fichero cargado
            const payload = {
                ...data,
                ...(articleAttachedUrl ? { article_attached_url: articleAttachedUrl } : {}),
            };

            // peticion put o post.
            let result;
            if(Boolean(id)){
                result = await api.put(`article/${id}`, payload);
            }else{
                result = await api.post(`article`, payload);
            }

            if(result.sucess){
                handlerApp.showOk(result.message);
            }else{
                handlerApp.showError(result.message);
            }

            handlerApp.setLoader(false);

            reset();
            await nav("/article");
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
                            onClick={() => nav("/article")}
                            className="btn-sm"
                        >
                            <i className="bi bi-arrow-left me-1"/>Volver
                        </ButtonSecondary>
                    </div>
                    <Card title={ id ? `Editar Artículo #${id}` : "Crear Artículo"} outline outlineColor="primary">
                        <form onSubmit={handleSubmit(submitData)}>
                            <div className="row">
                                <div className="col-md-6">
                                    <InputText
                                        control={control}
                                        label="Título del Artículo"
                                        name="article_subject"
                                        errors={errors.article_subject}
                                        required={true}
                                        rules={{ minLength: 3 }}
                                        placeholder="Escribe el título del artículo"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <InputSelect
                                        control={control}
                                        label="Línea Temática"
                                        name="topic_id"
                                        options={topics}
                                        errors={errors.topic_id}
                                        required={true}
                                        placeholder="Selecciona una línea temática"
                                    />
                                </div>
                            </div>

                            <InputTextArea
                                control={control}
                                label="Descripción / Resumen"
                                name="article_description"
                                errors={errors.article_description}
                                required={false}
                                rows={3}
                                placeholder="Breve descripción o resumen del artículo"
                            />

                            <InputTextArea
                                control={control}
                                label="Contenido del Artículo"
                                name="article"
                                errors={errors.article}
                                required={true}
                                rows={5}
                                placeholder="Escribe el contenido principal del artículo"
                            />

                            {id && currentArticle?.article_attached_url && (
                                <div className="mb-3">
                                    <span className="small text-muted d-block mb-1">
                                        PDF actual (v{currentArticle.article_attached_version || "1.0"}):
                                    </span>
                                    <a
                                        href={currentArticle.article_attached_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="small text-decoration-none d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-file-earmark-pdf text-danger"></i>
                                        <span>Ver documento actual</span>
                                    </a>
                                </div>
                            )}

                            <InputPdf
                                name="pdfFile"
                                label={id ? "Reemplazar Documento PDF (opcional)" : "Documento PDF"}
                                register={register}
                                errors={errors}
                                maxSizeMB={20}
                                required={!id}
                            />

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <ButtonSecondary
                                    label="Cancelar"
                                    onClick={() => nav("/article")}
                                />
                                <ButtonPrimary
                                    type="submit"
                                    label={id ? "Guardar Cambios" : "Guardar Artículo"}
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
