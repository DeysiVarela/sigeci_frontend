import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useParams, useNavigate } from "react-router";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";

const ArticleViewScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useFetch();
    const handlerApp = HandlerApp();

    const [article, setArticle] = useState();

    useEffect(() => {
        handlerApp.setLoader(true)
        api.get(`article/${id}`)
        .then(res => {
            if(res.success){
                setArticle(res.data);
            }
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
            handlerApp.setLoader(false);
        });
    }, []);

    if (article === null) {
        return (
            <div className="container-fluid p-3 p-md-4">
                <div className="alert alert-warning shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                        <span>No se encontró ningún artículo con el identificador <strong>#{id}</strong>.</span>
                    </div>
                    <ButtonSecondary label="Volver al Listado" onClick={() => navigate("/article")} />
                </div>
            </div>
        );
    }

    return (
        article && (
            <div className="container-fluid p-3 p-md-4">
                {/* Header de Navegación y Acciones */}
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 pb-3 border-bottom gap-3">
                    <div className="d-flex align-items-center gap-3 w-100 w-md-auto">
                        <button
                            className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "38px", height: "38px" }}
                            onClick={() => navigate("/article")}
                            title="Volver"
                        >
                            <i className="bi bi-arrow-left fs-5"></i>
                        </button>
                        <div className="text-truncate">
                            <h3 className="fw-bold mb-0 text-dark text-truncate">{article.article_subject} - #{article.article_id}</h3>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 w-100 w-md-auto justify-content-end flex-wrap">
                        <ButtonSecondary
                            label="Volver al Listado"
                            onClick={() => navigate("/article")}
                            className="flex-grow-1 flex-md-grow-0"
                        />
                        <ButtonPrimary
                            label="Editar Artículo"
                            onClick={() => navigate(`/article/edit/${article.article_id}`)}
                            className="flex-grow-1 flex-md-grow-0"
                        />
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <Card title="Metadatos y Registro" outline outlineColor="info">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item px-0 py-3">
                                <span className="text-muted fw-semibold d-block mb-1">Archivo PDF:</span>
                                {article.article_attached_url ? (
                                    <a
                                        href={article.article_attached_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="small text-decoration-none d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-file-earmark-pdf text-danger"></i>
                                        <span>{`${article.article_subject}.pdf (V${article.article_attached_version})`}</span>
                                    </a>
                                ) : (
                                    <span className="text-muted small">Sin archivo adjunto</span>
                                )}
                            </li>
                        </ul>

                        <div className="mt-4 pt-3 border-top">
                            <small className="text-muted d-block mb-2 fw-semibold">Acciones Rápidas:</small>
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-2 py-2"
                                    onClick={() => window.print()}
                                >
                                    <i className="bi bi-printer"></i>
                                    <span>Imprimir / Exportar Ficha</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    );
};

export default ArticleViewScreen;
