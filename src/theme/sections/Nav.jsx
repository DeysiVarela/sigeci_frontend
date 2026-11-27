import { Link } from "react-router";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../../context/AppContext";

/**
 * NO MODIFICAR, ESTO YA ESTA ESTABLE. (LOS MENU DEBEN AGREGARSE POR DATABASE)
 * En translate colocar traducciones de los menus.
 */
const Nav = ({ onCloseSidebar }) => {
  const { app } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      {/* Sidebar Brand */}
      <div className="sidebar-brand d-flex align-items-center justify-content-between px-3">
        <Link to="/home" className="brand-link" onClick={onCloseSidebar}>
          <span className="brand-text fw-light">{import.meta.env.VITE_PROJECT_NAME}</span>
        </Link>
        <button
          type="button"
          className="btn btn-link text-light d-lg-none p-1"
          onClick={onCloseSidebar}
          aria-label="Cerrar menú"
        >
          <i className="bi bi-x-lg fs-5"></i>
        </button>
      </div>
      {/* Sidebar Wrapper */}
      <div className="sidebar-wrapper">
        <nav className="mt-2 container-menu" aria-label="Main navigation">
          {
            app?.menu?.length > 0 ?
            <ul
              className="nav sidebar-menu menu-list"
              data-lte-toggle="treeview"
              data-accordion="false"
              id="navigation"
            >
              { app?.menu?.filter(p => p.profile_action_visibility).sort((a, b) => a.profile_action_order - b.profile_action_order).map((menu, i) => (
                <li className="nav-item" key={i}>
                  <Link to={menu.profile_action_action} className="nav-link" onClick={onCloseSidebar}>
                    <i className={`nav-icon bi ${menu.profile_action_icon}`}></i>
                    <p>{t(menu.profile_action_title)}</p>
                  </Link>
                </li>
              ))}
            </ul>
            :
            (app?.menu === null || app?.menu?.length === 0) && <p className="nav-link text-center text-muted">No hay permisos</p>
          }
          {
            app?.menu !== undefined &&
            <ul
              className="nav sidebar-menu menu-list-2"
              data-lte-toggle="treeview"
              data-accordion="false"
              id="navigation"
            >
              <li className="nav-item">
                <Link to="/components" className="nav-link" onClick={onCloseSidebar}>
                  <i className="nav-icon bi bi-gear"></i>
                  <p>{t("Components")}</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/settings" className="nav-link" onClick={onCloseSidebar}>
                  <i className="nav-icon bi bi-gear"></i>
                  <p>{t("setting")}</p>
                </Link>
              </li>
            </ul>
          }
        </nav>
      </div>
    </aside>
  );
};

export default Nav;