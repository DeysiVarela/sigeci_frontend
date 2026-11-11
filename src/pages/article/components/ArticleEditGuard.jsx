import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import ButtonSecondary from "../../../components/buttons/ButtonSecondary";
import { MOCK_ARTICLES } from "../mockArticles";
import { canEditArticle } from "../utils/permissions";
import { useCurrentUser } from "../hooks/useCurrentUser";

// Protege la ruta /article/edit/:id.
// ProtectedRoute solo exige sesión; este guardián además exige permiso de edición
// sobre ESE artículo (canEditArticle: autor dueño y artículo no deshabilitado).
// Si no lo tiene, muestra un aviso en lugar del formulario.
// TODO(back): reemplazar MOCK_ARTICLES por GET /articles/:id. El back también debe
// rechazar ediciones no autorizadas: este guardián es solo de interfaz.
const ArticleEditGuard = ({ children }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useCurrentUser();

    const article = useMemo(() => MOCK_ARTICLES.find((a) => String(a.id) === String(id)) || null, [id]);

    if (!article || !canEditArticle(user, article)) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-warning shadow-sm d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    <div>
                        <i className="bi bi-shield-lock me-2 fs-5" aria-hidden="true"></i>
                        {article
                            ? "No tienes permisos para editar este artículo."
                            : <>No se encontró ningún artículo con el identificador <strong>#{id}</strong>.</>}
                    </div>
                    <ButtonSecondary label="Volver al catálogo" onClick={() => navigate("/article")} />
                </div>
            </div>
        );
    }

    return children;
};

export default ArticleEditGuard;