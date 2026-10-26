import { useParams, useNavigate } from "react-router";
import { useMemo } from "react";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { MOCK_ARTICLES } from "./mockArticles";

const ArticleViewScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = useMemo(() => {
        const stored = localStorage.getItem("sigeci_articles");
        const list = stored ? JSON.parse(stored) : MOCK_ARTICLES;
        return list.find(a => String(a.id) === String(id)) || null;
    }, [id]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "Publicado":
                return <Badge type="Success" text="Publicado" pill />;
            case "En Revisión":
                return <Badge type="Warning" text="En Revisión" pill />;
            case "Borrador":
                return <Badge type="Secondary" text="Borrador" pill />;
            default:
                return <Badge type="Info" text={status} pill />;
        }
    };

    if (!article) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-warning shadow-sm d-flex align-items-center justify-content-between">
                    <div>
                        <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
                        No se encontró ningún artículo con el identificador <strong>#{id}</strong>.
                    </div>
                    <ButtonSecondary label="Volver al Listado" onClick={() => navigate("/article")} />
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            {/* Header de Navegación y Acciones */}
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
                            Detalles del Artículo #{article.id}
                        </span>
                        <h3 className="fw-bold mb-0 text-dark">{article.title}</h3>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <ButtonSecondary
                        label="Volver al Listado"
                        onClick={() => navigate("/article")}
                    />
                    <ButtonPrimary
                        label="Editar Artículo"
                        onClick={() => navigate(`/article/edit/${article.id}`)}
                    />
                </div>
            </div>

            <div className="row g-4">
                {/* Columna Principal: Contenido del artículo */}
                <div className="col-lg-8">
                    <Card title="Contenido de la Publicación" outline outlineColor="primary">
                        <div className="p-2">
                            <div className="alert alert-light border mb-4">
                                <h6 className="fw-bold text-dark mb-1">
                                    <i className="bi bi-quote me-1 text-primary"></i>
                                    Resumen / Abstract
                                </h6>
                                <p className="text-secondary mb-0 fst-italic">
                                    {article.summary}
                                </p>
                            </div>

                            <h5 className="fw-bold text-dark mb-3">Cuerpo del Documento</h5>
                            <div className="text-secondary lh-lg" style={{ whiteSpace: "pre-line", fontSize: "1.05rem" }}>
                                {article.content}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Columna Lateral: Metadatos e Información */}
                <div className="col-lg-4">
                    <Card title="Metadatos y Registro" outline outlineColor="info">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Estado de Publicación:</span>
                                <span>{getStatusBadge(article.status)}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Autor Principal:</span>
                                <span className="fw-bold text-dark">{article.author}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Categoría / Línea:</span>
                                <span className="badge bg-light text-primary border">{article.category}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Fecha de Publicación:</span>
                                <span className="text-dark">{article.publishedAt}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Lecturas / Visitas:</span>
                                <span className="badge bg-secondary-subtle text-dark">
                                    <i className="bi bi-eye me-1"></i>
                                    {article.views || 0} lecturas
                                </span>
                            </li>
                        </ul>

                        <div className="mt-4 pt-3 border-top">
                            <small className="text-muted d-block mb-2">Acciones Rápidas:</small>
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => navigate(`/article/edit/${article.id}`)}
                                >
                                    <i className="bi bi-pencil-square"></i>
                                    <span>Modificar Información</span>
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-2"
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
        </div>
    );
};

export default ArticleViewScreen;