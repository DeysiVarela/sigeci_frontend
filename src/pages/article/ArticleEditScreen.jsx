import { useParams, useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import Card from "../../components/cards/Card";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import InputText from "../../components/inputs/InputText";
import InputPdf from "../../components/inputs/InputPdf";
import { MOCK_ARTICLES } from "./mockArticles";

const ArticleEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = useMemo(() => {
        const stored = localStorage.getItem("sigeci_articles");
        const list = stored ? JSON.parse(stored) : MOCK_ARTICLES;
        return list.find(a => String(a.id) === String(id)) || null;
    }, [id]);

    const {
        control,
        handleSubmit,
        setValue,
        register,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        const stored = localStorage.getItem("sigeci_articles");
        const list = stored ? JSON.parse(stored) : MOCK_ARTICLES;
        const found = list.find(a => String(a.id) === String(id));

        if (found) {
            setValue("title", found.title);
            setValue("author", found.author);
            setValue("category", found.category);
            setValue("status", found.status);
            setValue("summary", found.summary);
            setValue("content", found.content);
        }
    }, [id, setValue]);

    const onSubmit = (formData) => {
        const stored = localStorage.getItem("sigeci_articles");
        const list = stored ? JSON.parse(stored) : MOCK_ARTICLES;
        const { pdfFile, ...articleData } = formData;
        const selectedPdf = pdfFile?.[0];

        const updatedList = list.map(item =>
            String(item.id) === String(id)
                ? {
                    ...item,
                    ...articleData,
                    ...(selectedPdf && {
                        pdfFileName: selectedPdf.name,
                        pdfFileSize: selectedPdf.size
                    })
                }
                : item
        );

        localStorage.setItem("sigeci_articles", JSON.stringify(updatedList));

        // Redirigir al listado con mensaje de confirmación
        navigate("/article", {
            state: {
                type: "info",
                title: "¡Artículo Actualizado!",
                message: `Los cambios para "${formData.title}" (ID: #${id}) se guardaron exitosamente.`
            }
        });
    };

    if (!article) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-warning shadow-sm d-flex align-items-center justify-content-between">
                    <div>
                        <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
                        No se encontró ningún artículo para editar con el identificador <strong>#{id}</strong>.
                    </div>
                    <ButtonSecondary label="Volver al Listado" onClick={() => navigate("/article")} />
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            {/* Header de la Pantalla */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => navigate("/article")}
                        title="Volver"
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div>
                        <span className="text-muted small text-uppercase fw-semibold">
                            Edición de Contenido
                        </span>
                        <h3 className="fw-bold mb-0 text-dark">Editar Artículo #{id}</h3>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <ButtonSecondary
                        label="Cancelar"
                        onClick={() => navigate("/article")}
                    />
                    <ButtonPrimary
                        label="Guardar Cambios"
                        onClick={handleSubmit(onSubmit)}
                    />
                </div>
            </div>

            {/* Formulario Principal */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card title="Información y Contenido Principal" outline outlineColor="primary">
                            <InputText
                                control={control}
                                name="title"
                                label="Título del Artículo"
                                placeholder="Escribe el título de la publicación"
                                required
                                errors={errors.title}
                            />

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Resumen / Abstract</label>
                                <textarea
                                    className={`form-control ${errors.summary ? "is-invalid" : ""}`}
                                    rows="3"
                                    placeholder="Breve sinopsis o abstract del artículo..."
                                    {...register("summary", { required: "El resumen es requerido" })}
                                ></textarea>
                                {errors.summary && (
                                    <p className="small text-danger mt-1">⚠️ {errors.summary.message}</p>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Cuerpo / Texto del Artículo</label>
                                <textarea
                                    className={`form-control ${errors.content ? "is-invalid" : ""}`}
                                    rows="9"
                                    placeholder="Desarrollo completo de la investigación..."
                                    {...register("content", { required: "El contenido es requerido" })}
                                ></textarea>
                                {errors.content && (
                                    <p className="small text-danger mt-1">⚠️ {errors.content.message}</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="col-lg-4">
                        <Card title="Clasificación y Estado" outline outlineColor="warning">
                            <InputText
                                control={control}
                                name="author"
                                label="Autor / Investigador"
                                placeholder="Nombre completo del autor"
                                required
                                errors={errors.author}
                            />

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Categoría Científica</label>
                                <select className="form-select" {...register("category")}>
                                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                                    <option value="Ciberseguridad">Ciberseguridad</option>
                                    <option value="Educación">Educación</option>
                                    <option value="IoT & Hardware">IoT & Hardware</option>
                                    <option value="NLP">NLP</option>
                                    <option value="Biotecnología">Biotecnología</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Estado de Publicación</label>
                                <select className="form-select" {...register("status")}>
                                    <option value="Publicado">Publicado</option>
                                    <option value="En Revisión">En Revisión</option>
                                    <option value="Borrador">Borrador</option>
                                </select>
                            </div>

                            <InputPdf
                                register={register}
                                errors={errors}
                                name="pdfFile"
                                label="Artículo en PDF"
                            />

                            <div className="alert alert-info py-2 small mt-4 mb-0">
                                <i className="bi bi-info-circle me-1"></i> Al guardar los cambios, la información se actualizará de inmediato en el repositorio general.
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ArticleEditScreen;
