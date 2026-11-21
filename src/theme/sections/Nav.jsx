import { Link } from "react-router";
import { canViewUsers } from "../../utils/userAccess";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const Nav = ({ me }) => {

  const { app } = useContext(AppContext);

  console.log(app?.permissions?.length, "a")

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
        <nav className="mt-2" aria-label="Main navigation">
          {/* {
            app?.permissions?.length > 0 ?
            <>
              Empty State
            </>
            :
            <ul
              className="nav sidebar-menu flex-column"
              data-lte-toggle="treeview"
              data-accordion="false"
              id="navigation"
            >
              { 
                app?.permissions?.map(menu =>{
                  if (menu.profile_action_visibility){

                  return  <li className="nav-item">
                      <Link to="/users" className="nav-link">
                        <i className="nav-icon bi bi-people"></i>
                        <p>Usuarios</p>
                      </Link>
                    </li>
                  }
                })
              }
            </ul>
          } */}
          
          <ul
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

            <li className="nav-header">GESTIÓN</li>
            <li className="nav-item">
              <Link to="/article" className="nav-link">
                <i className="nav-icon bi bi-file-earmark-text"></i>
                <p>Artículos</p>
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
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Nav;