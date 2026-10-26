import { useState } from 'react'
import { Bell, BookOpenText, ChevronDown, CircleHelp, Clock3, Menu, MoreHorizontal, Settings2 } from 'lucide-react'
import PropTypes from 'prop-types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isDashboardRoute, navigation, secondaryRoutes } from '../../config/routes.js'

function AdminLayout({ children, query = '', onQueryChange }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const activeLabel = navigation.find((item) => item.path === pathname)?.label
    || secondaryRoutes[pathname]?.title
    || 'Página no encontrada'

  const goTo = (path) => {
    navigate(path)
    setMobileNavOpen(false)
  }

  return (
    <div className="app-wrapper app-shell">
      <aside className={`app-sidebar sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`} data-bs-theme="dark">
        <Link className="brand" to="/dashboard" aria-label="SIGECI, inicio">
          <span className="brand-mark"><BookOpenText size={21} strokeWidth={1.8} /></span>
          <span className="brand-copy"><strong>SIGECI</strong><small>Gestión científica</small></span>
        </Link>

        <div className="conference-picker">
          <span className="conference-kicker">CONFERENCIA ACTIVA</span>
          <button className="conference-select" type="button">
            <span><strong>Encuentro 2026</strong><small>Universidad del Valle</small></span>
            <ChevronDown size={16} />
          </button>
        </div>

        <nav className="primary-nav" aria-label="Navegación principal">
          <span className="nav-label">ESPACIO DE TRABAJO</span>
          {navigation.map(({ label, icon: Icon, count, path }) => (
            <button
              className={`nav-link ${(isDashboardRoute(pathname) && path === '/dashboard') || pathname === path ? 'nav-link-active' : ''}`}
              key={label}
              onClick={() => goTo(path)}
              type="button"
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {count && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon"><Clock3 size={16} /></span>
            <div><strong>Convocatoria abierta</strong><small>Cierra el 18 de octubre</small></div>
          </div>
          <button className="nav-link" type="button" onClick={() => goTo('/configuracion')}>
            <Settings2 size={18} strokeWidth={1.8} /><span>Configuración</span>
          </button>
          <button className="nav-link" type="button" onClick={() => goTo('/ayuda')}>
            <CircleHelp size={18} strokeWidth={1.8} /><span>Centro de ayuda</span>
          </button>
          <div className="profile-row">
            <span className="profile-avatar">DV</span>
            <span className="profile-copy"><strong>Deisy Varela</strong><small>Coordinación</small></span>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <main className="app-main main-area">
        <header className="app-header topbar">
          <button
            className="icon-button menu-button"
            type="button"
            aria-label="Abrir navegación"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs"><span>Encuentro 2026</span><span className="crumb-divider">/</span><strong>{activeLabel}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <span className="sr-only">Buscar artículos</span>
              <input
                aria-label="Buscar artículos"
                placeholder="Buscar artículos..."
                value={query}
                onChange={(event) => onQueryChange?.(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                type="button"
                aria-label="Notificaciones"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((show) => !show)}
              >
                <Bell size={19} /><span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <div className="popover-title"><strong>Notificaciones</strong><span>2 nuevas</span></div>
                  <p><span className="notification-marker" /> Hay 8 artículos pendientes de asignación.</p>
                  <p><span className="notification-marker marker-yellow" /> La convocatoria cierra en 20 días.</p>
                </div>
              )}
            </div>
            <span className="topbar-avatar" aria-label="Perfil de Deisy Varela">DV</span>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>

      {mobileNavOpen && <button className="mobile-scrim" type="button" aria-label="Cerrar navegación" onClick={() => setMobileNavOpen(false)} />}
    </div>
  )
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  query: PropTypes.string,
  onQueryChange: PropTypes.func,
}

export default AdminLayout
