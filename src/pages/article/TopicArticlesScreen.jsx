import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";
import Card from "../../components/cards/Card";

// --- Componente de tarjeta arrastrable ---
const SortableArticle = ({ id, article, authorLabel }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "15px",
        marginBottom: "10px",
        backgroundColor: isDragging ? "#e9ecef" : "#ffffff",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        cursor: "grab",
        display: "flex",
        alignItems: "center",
        boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
        zIndex: isDragging ? 999 : 1,
        position: "relative"
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <i className="bi bi-grip-vertical me-3 text-muted fs-4"></i>
            <div>
                <h6 className="mb-1 fw-bold text-dark">{article.article_subject}</h6>
                <small className="text-muted">
                    <i className="bi bi-hash"></i>{article.article_id} |
                    <i className="bi bi-person ms-2"></i> {authorLabel}: {article.article_created_by_name || article.article_created_by || "N/A"}
                </small>
            </div>
        </div>
    );
};

// --- Componente Principal ---
const TopicArticlesScreen = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const api = useFetch();
    const { app } = useContext(AppContext);

    const activeProfile = String(app?.profile || localStorage.getItem("profile") || "").toUpperCase();
    const isAuthorOnly = activeProfile === "3" || activeProfile === "AUTHOR";

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

    useEffect(() => {
        if (isAuthorOnly) {
            navigate("/article", { replace: true });
            return;
        }

        setLoading(true);
        setError("");
        api.get(`article/topics/${topicId}/articles/`)
            .then((res) => {
                setArticles(res?.data || []);
                setLoading(false);
            })
            .catch(() => {
                setError(t("topicArticlesScreen.loadError"));
                setLoading(false);
            });
    }, [topicId, isAuthorOnly]);

    if (isAuthorOnly) {
        return null;
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = articles.findIndex((a) => a.article_id === active.id);
            const newIndex = articles.findIndex((a) => a.article_id === over.id);
            const newOrder = arrayMove(articles, oldIndex, newIndex);
            setArticles(newOrder);

            const orderedIds = newOrder.map((a) => a.article_id);
            try {
                await api.post("article/reorder/", { ordered_ids: orderedIds });
            } catch (err) {
                console.error("Error al guardar el orden", err);
                alert(t("topicArticlesScreen.reorderError"));
            }
        }
    };

    return (
        <div className="container-fluid pt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="bi bi-list-task text-primary me-2"></i>
                        {t("topicArticlesScreen.title")}
                    </h2>
                    <p className="text-muted mb-0">
                        {t("topicArticlesScreen.description")}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-1"></i> {t("topicArticlesScreen.back")}
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">{t("topicArticlesScreen.loading")}</p>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-8 mx-auto">
                        <Card title={t("topicArticlesScreen.cardTitle")}>
                            {articles.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="bi bi-inbox fs-1"></i>
                                    <p>{t("topicArticlesScreen.empty")}</p>
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={articles.map((a) => a.article_id)} strategy={verticalListSortingStrategy}>
                                        <div className="p-2">
                                            {articles.map((article) => (
                                                <SortableArticle
                                                    key={article.article_id}
                                                    id={article.article_id}
                                                    article={article}
                                                    authorLabel={t("topicArticlesScreen.authorId")}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicArticlesScreen;