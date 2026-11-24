import { Link } from "react-router";
import { canViewUsers, hasPermission } from "../../utils/userAccess";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useTranslation } from "react-i18next";

const Nav = ({ me }) => {

  const { t } = useTranslation();
  const { app } = useContext(AppContext);
  const menuUser = me?.permissions ? me : { ...me, permissions: app?.permissions };

  return (
    <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      {/* Sidebar Brand */}
      <div className="sidebar-brand">
        <Link to="/home" className="brand-link">
          <span className="brand-text fw-light">{import.meta.env.VITE_PROJECT_NAME}</span>
        </Link>
      </div>
      {/* Sidebar Wrapper */}
      <div className="sidebar-wrapper">
        <nav className="mt-2 container-menu" aria-label="Main navigation">
          <ul
            className="nav sidebar-menu menu-list"
            data-lte-toggle="treeview"
            data-accordion="false"
            id="navigation"
          >
            <li className="nav-item">
              <Link to="/home" className="nav-link">
                <i className="nav-icon bi bi-speedometer2"></i>
                <p>{t("dashboard")}</p>
              </Link>
            </li>
            {hasPermission(menuUser, "article", "view") && (
              <li className="nav-item">
                <Link to="/article" className="nav-link">
                  <i className="nav-icon bi bi-file-earmark-text"></i>
                  <p>{t("article")}</p>
                </Link>
              </li>
            )}
            {hasPermission(menuUser, "event", "view") && (
              <li className="nav-item">
                <Link to="/agenda" className="nav-link">
                  <i className="nav-icon bi bi-calendar3"></i>
                  <p>{t("agenda")}</p>
                </Link>
              </li>
            )}
            {hasPermission(menuUser, "evaluation", "view") && (
              <li className="nav-item">
                <Link to="/evaluations" className="nav-link">
                  <i className="nav-icon bi bi-clipboard2-check"></i>
                  <p>{t("evaluations")}</p>
                </Link>
              </li>
            )}
            {canViewUsers(menuUser) && (
              <li className="nav-item">
                <Link to="/users" className="nav-link">
                  <i className="nav-icon bi bi-people"></i>
                  <p>{t("users")}</p>
                </Link>
              </li>
            )}
          </ul>
          <ul
            className="nav sidebar-menu menu-list-2"
            data-lte-toggle="treeview"
            data-accordion="false"
            id="navigation"
          >
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <i className="nav-icon bi bi-gear"></i>
                <p>{t("setting")}</p>
              </Link>
            </li>
          </ul>
          
          {/* <ul
            className="nav sidebar-menu flex-column"
            data-lte-toggle="treeview"
            data-accordion="false"
            id="navigation"
          >
            <li className="nav-item">
              <Link to="/components" className="nav-link">
                <i className="nav-icon bi bi-palette"></i>
                <p>Componentes UI</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/home" className="nav-link">
                <i className="nav-icon bi bi-speedometer"></i>
                <p>Dashboard</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/agenda" className="nav-link">
                <i className="nav-icon bi bi-calendar3"></i>
                <p>Agenda general</p>
              </Link>
            </li>

            <li className="nav-header">GESTIÓN</li>
            <li className="nav-item">
              <Link to="/article" className="nav-link">
                <i className="nav-icon bi bi-file-earmark-text"></i>
                <p>Artículos</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/evaluations" className="nav-link">
                <i className="nav-icon bi bi-clipboard2-check"></i>
                <p>Mis evaluaciones</p>
              </Link>
            </li>
            {canViewUsers(me) && (
              <li className="nav-item">
                <Link to="/users" className="nav-link">
                  <i className="nav-icon bi bi-people"></i>
                  <p>Usuarios</p>
                </Link>
              </li>
            )}

            <li className="nav-header">SISTEMA</li>
            <li className="nav-item">
              <Link to="/settings" className="nav-link">
                <i className="nav-icon bi bi-gear"></i>
                <p>Configuración</p>
              </Link>
            </li>
          </ul> */}
        </nav>
      </div>
    </aside>
  );
};

export default Nav;