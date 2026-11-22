import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getArticlesByTopic, reorderArticles } from "../../api/articles";
import Card from "../../components/cards/Card";

// --- Componente de tarjeta arrastrable ---
const SortableArticle = ({ id, article }) => {
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
                    <i className="bi bi-person ms-2"></i> Autor ID: {article.article_created_by || "N/A"}
                </small>
            </div>
        </div>
    );
};

// --- Componente Principal ---
const TopicArticlesScreen = () => {
    const { topicId } = useParams(); // Obtiene el ID del tópico desde la URL
    const navigate = useNavigate();
    
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 5 }, // Evita que se arrastre al hacer clic
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

    useEffect(() => {
        setLoading(true);
        getArticlesByTopic(topicId)
            .then((res) => {
                setArticles(res.data || []);
                setLoading(false);
            })
            .catch((err) => {
                setError("No se pudieron cargar los artículos.");
                setLoading(false);
            });
    }, [topicId]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            // 1. Reordenar visualmente
            const oldIndex = articles.findIndex((a) => a.article_id === active.id);
            const newIndex = articles.findIndex((a) => a.article_id === over.id);
            const newOrder = arrayMove(articles, oldIndex, newIndex);
            setArticles(newOrder);

            // 2. Enviar al backend
            const orderedIds = newOrder.map((a) => a.article_id);
            try {
                await reorderArticles(orderedIds);
            } catch (err) {
                console.error("Error al guardar el orden", err);
                // Opcional: Revertir en caso de error
                alert("No se pudo guardar el nuevo orden. Revisa tu conexión.");
            }
        }
    };

    return (
        <div className="container-fluid pt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="bi bi-list-task text-primary me-2"></i>
                        Organizar Artículos del Tópico
                    </h2>
                    <p className="text-muted mb-0">
                        Arrastra y suelta las tarjetas para definir el orden de presentación.
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-1"></i> Volver
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Cargando artículos...</p>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-8 mx-auto">
                        <Card title="Lista de Artículos (Arrastrables)">
                            {articles.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="bi bi-inbox fs-1"></i>
                                    <p>No hay artículos en este tópico todavía.</p>
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={articles.map((a) => a.article_id)} strategy={verticalListSortingStrategy}>
                                        <div className="p-2">
                                            {articles.map((article) => (
                                                <SortableArticle key={article.article_id} id={article.article_id} article={article} />
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