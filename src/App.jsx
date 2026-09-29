import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpenText,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  UsersRound,
  X,
} from 'lucide-react'
import './App.css'

const initialSubmissions = [
  {
    id: 'SIG-0248',
    title: 'Modelos de aprendizaje para la gestión hídrica en zonas rurales',
    author: 'Mariana Torres',
    category: 'Ingeniería',
    submitted: 'Hoy, 09:42',
    status: 'En revisión',
    tone: 'review',
    initials: 'MT',
    color: 'coral',
  },
  {
    id: 'SIG-0247',
    title: 'Memoria colectiva y archivo digital en el suroccidente colombiano',
    author: 'Andrés Rojas',
    category: 'Ciencias sociales',
    submitted: 'Hoy, 08:16',
    status: 'Aprobado',
    tone: 'approved',
    initials: 'AR',
    color: 'blue',
  },
  {
    id: 'SIG-0246',
    title: 'Síntesis de nuevos materiales para almacenamiento energético',
    author: 'Valentina Pardo',
    category: 'Ciencias naturales',
    submitted: 'Ayer, 16:38',
    status: 'En revisión',
    tone: 'review',
    initials: 'VP',
    color: 'green',
  },
  {
    id: 'SIG-0245',
    title: 'Prácticas pedagógicas abiertas en educación superior',
    author: 'Samuel Muñoz',
    category: 'Educación',
    submitted: 'Ayer, 14:05',
    status: 'Cambios solicitados',
    tone: 'changes',
    initials: 'SM',
    color: 'yellow',
  },
]

const chartData = [
  { label: '1', value: 29 },
  { label: '3', value: 39 },
  { label: '5', value: 34 },
  { label: '7', value: 53 },
  { label: '9', value: 46 },
  { label: '11', value: 62 },
  { label: '13', value: 48 },
  { label: '15', value: 69 },
  { label: '17', value: 58 },
  { label: '19', value: 82 },
  { label: '21', value: 67 },
  { label: '23', value: 91 },
]

const navigation = [
  { label: 'Resumen', icon: LayoutDashboard },
  { label: 'Artículos', icon: FileText, count: '24' },
  { label: 'Agenda', icon: CalendarDays },
  { label: 'Participantes', icon: UsersRound },
]

function App() {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [activeNav, setActiveNav] = useState('Resumen')
  const [period, setPeriod] = useState('30 días')
  const [query, setQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const filteredSubmissions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es')
    if (!normalizedQuery) return submissions

    return submissions.filter((submission) =>
      [submission.id, submission.title, submission.author, submission.category]
        .join(' ')
        .toLocaleLowerCase('es')
        .includes(normalizedQuery),
    )
  }, [query, submissions])

  function handleCreateSubmission(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get('title').trim()
    const author = formData.get('author').trim()
    const category = formData.get('category')

    setSubmissions((current) => [
      {
        id: `SIG-${String(249 + current.length - initialSubmissions.length).padStart(4, '0')}`,
        title,
        author,
        category,
        submitted: 'Ahora',
        status: 'En revisión',
        tone: 'review',
        initials: author
          .split(' ')
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase(),
        color: 'coral',
      },
      ...current,
    ])
    setShowForm(false)
    event.currentTarget.reset()
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#inicio" aria-label="SIGECI, inicio">
          <span className="brand-mark"><BookOpenText size={21} strokeWidth={1.8} /></span>
          <span className="brand-copy"><strong>SIGECI</strong><small>Gestión científica</small></span>
        </a>

        <div className="conference-picker">
          <span className="conference-kicker">CONFERENCIA ACTIVA</span>
          <button className="conference-select" type="button">
            <span><strong>Encuentro 2026</strong><small>Universidad del Valle</small></span>
            <ChevronDown size={16} />
          </button>
        </div>

        <nav className="primary-nav" aria-label="Navegación principal">
          <span className="nav-label">ESPACIO DE TRABAJO</span>
          {navigation.map(({ label, icon: Icon, count }) => (
            <button
              className={`nav-link ${activeNav === label ? 'nav-link-active' : ''}`}
              key={label}
              onClick={() => {
                setActiveNav(label)
                setMobileNavOpen(false)
              }}
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
          <button className="nav-link" type="button" onClick={() => setActiveNav('Configuración')}>
            <Settings2 size={18} strokeWidth={1.8} /><span>Configuración</span>
          </button>
          <button className="nav-link" type="button" onClick={() => setActiveNav('Ayuda')}>
            <CircleHelp size={18} strokeWidth={1.8} /><span>Centro de ayuda</span>
          </button>
          <div className="profile-row">
            <span className="profile-avatar">DV</span>
            <span className="profile-copy"><strong>Deisy Varela</strong><small>Coordinación</small></span>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            aria-label="Abrir navegación"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs"><span>Encuentro 2026</span><span className="crumb-divider">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Buscar artículos"
                placeholder="Buscar artículos..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" /> PANEL DE CONTROL <span className="eyebrow-line" /></div>
              <h1>Buenos días, Deisy<span className="title-period">.</span></h1>
              <p className="welcome-copy">Aquí tienes el pulso de tu conferencia esta semana.</p>
            </div>
            <button className="primary-button" type="button" onClick={() => setShowForm(true)}>
              <FilePlus2 size={17} /> Nuevo artículo
            </button>
          </section>

          <section className="stats-grid" aria-label="Resumen de la conferencia">
            <article className="stat-card stat-primary">
              <div className="stat-heading"><span>Total de artículos</span><span className="stat-icon icon-coral"><FileText size={17} /></span></div>
              <div className="stat-number-row"><strong>248</strong><span className="stat-change change-up"><ArrowUpRight size={14} /> 12.8%</span></div>
              <span className="stat-footnote">vs. convocatoria anterior</span>
              <div className="mini-bars" aria-hidden="true">{[31, 48, 38, 59, 47, 70, 55, 84, 67, 92, 72, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
            </article>
            <article className="stat-card">
              <div className="stat-heading"><span>En revisión</span><span className="stat-icon icon-yellow"><Clock3 size={17} /></span></div>
              <div className="stat-number-row"><strong>36</strong><span className="stat-change change-down"><ArrowDownRight size={14} /> 4.2%</span></div>
              <span className="stat-footnote">12 requieren asignación</span>
              <div className="stat-progress"><span style={{ width: '68%' }} /></div>
              <span className="progress-caption">68% del total recibido</span>
            </article>
            <article className="stat-card">
              <div className="stat-heading"><span>Participantes</span><span className="stat-icon icon-blue"><UsersRound size={17} /></span></div>
              <div className="stat-number-row"><strong>184</strong><span className="stat-change change-up"><ArrowUpRight size={14} /> 8.6%</span></div>
              <span className="stat-footnote">en 12 áreas académicas</span>
              <div className="participant-dots" aria-label="Participantes de distintas áreas"><i /><i /><i /><i /><i /><span>+179</span></div>
            </article>
            <article className="stat-card stat-deadline">
              <div className="stat-heading"><span>Próxima fecha clave</span><span className="stat-icon icon-green"><CalendarDays size={17} /></span></div>
              <div className="deadline-date"><strong>18</strong><span><b>OCT</b><small>2026</small></span></div>
              <span className="stat-footnote">Cierre de recepción de artículos</span>
              <div className="deadline-rule"><span>20 días restantes</span><span>Ver calendario <ArrowUpRight size={12} /></span></div>
            </article>
          </section>

          <section className="insights-grid">
            <article className="panel chart-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">ACTIVIDAD</span><h2>Recepción de artículos</h2></div>
                <div className="period-control" aria-label="Periodo del gráfico">
                  {['7 días', '30 días', 'Todo'].map((option) => <button className={period === option ? 'period-active' : ''} key={option} onClick={() => setPeriod(option)} type="button">{option}</button>)}
                </div>
              </div>
              <div className="chart-summary"><strong>{period === '7 días' ? '42' : period === 'Todo' ? '248' : '186'}</strong><span>artículos recibidos</span><span className="chart-trend"><ArrowUpRight size={14} /> 18% <small>este periodo</small></span></div>
              <div className="chart-area" role="img" aria-label={`Gráfico de recepción de artículos en los últimos ${period}`}>
                <div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                <div className="chart-plot">
                  <div className="chart-gridlines"><i /><i /><i /><i /><i /></div>
                  <div className="bar-series">{chartData.map((item, index) => <div className="bar-column" key={item.label}><span className={`chart-bar ${index === 11 ? 'bar-current' : ''}`} style={{ height: `${item.value}%` }} title={`${item.value} artículos`} /></div>)}</div>
                </div>
              </div>
              <div className="chart-x-labels"><span>1 sep</span><span>5 sep</span><span>10 sep</span><span>15 sep</span><span>20 sep</span><span>25 sep</span></div>
              <div className="chart-legend"><span><i /> Artículos recibidos</span><span className="legend-note">Actualizado hace 5 min</span></div>
            </article>

            <article className="panel focus-panel">
              <div className="panel-heading focus-heading"><div><span className="section-kicker">PARA HOY</span><h2>Enfoque del equipo</h2></div><button className="icon-button small-icon-button" type="button" aria-label="Más opciones"><MoreHorizontal size={19} /></button></div>
              <div className="focus-number"><strong>14</strong><span>tareas abiertas</span></div>
              <div className="focus-list">
                <button type="button" className="focus-item"><span className="focus-icon focus-coral"><FileText size={16} /></span><span className="focus-text"><strong>Asignar revisores</strong><small>8 artículos sin asignación</small></span><span className="focus-count">08</span></button>
                <button type="button" className="focus-item"><span className="focus-icon focus-yellow"><Clock3 size={16} /></span><span className="focus-text"><strong>Revisiones por vencer</strong><small>Vencen en las próximas 48 h</small></span><span className="focus-count count-warn">04</span></button>
                <button type="button" className="focus-item"><span className="focus-icon focus-blue"><Check size={16} /></span><span className="focus-text"><strong>Decisiones pendientes</strong><small>Esperan aprobación final</small></span><span className="focus-count">02</span></button>
              </div>
              <button className="text-action" type="button" onClick={() => setActiveNav('Artículos')}>Ver todas las tareas <ArrowUpRight size={14} /></button>
            </article>
          </section>

          <section className="panel submissions-panel">
            <div className="panel-heading submissions-heading">
              <div><span className="section-kicker">BANDEJA DE ENTRADA</span><h2>Artículos recientes <span className="heading-count">{filteredSubmissions.length}</span></h2></div>
              <button className="secondary-button" type="button" onClick={() => setActiveNav('Artículos')}>Ver todos <ArrowUpRight size={14} /></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ARTÍCULO</th><th>ÁREA</th><th>RECIBIDO</th><th>ESTADO</th><th><span className="sr-only">Opciones</span></th></tr></thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td><div className="article-cell"><span className={`author-avatar avatar-${submission.color}`}>{submission.initials}</span><span className="article-copy"><strong>{submission.title}</strong><small>{submission.id} <i /> {submission.author}</small></span></div></td>
                      <td><span className="category-label">{submission.category}</span></td>
                      <td className="received-cell">{submission.submitted}</td>
                      <td><span className={`status-pill status-${submission.tone}`}><i />{submission.status}</span></td>
                      <td><button className="icon-button row-menu" type="button" aria-label={`Opciones para ${submission.id}`}><MoreHorizontal size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSubmissions.length === 0 && <div className="empty-state">No encontramos artículos que coincidan con “{query}”.</div>}
            </div>
            <div className="table-footer"><span>Mostrando <strong>{filteredSubmissions.length}</strong> de <strong>{submissions.length}</strong> artículos recientes</span><button type="button" onClick={() => setActiveNav('Artículos')}>Ir a artículos <ArrowUpRight size={13} /></button></div>
          </section>

          <footer className="page-footer"><span>SIGECI <i /> Universidad del Valle</span><span>Datos de demostración <i /> Sin conexión al backend</span></footer>
        </div>
      </main>

      {mobileNavOpen && <button className="mobile-scrim" type="button" aria-label="Cerrar navegación" onClick={() => setMobileNavOpen(false)} />}

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}>
          <section className="submission-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading"><span className="modal-icon"><FilePlus2 size={19} /></span><button className="icon-button" type="button" aria-label="Cerrar formulario" onClick={() => setShowForm(false)}><X size={19} /></button></div>
            <span className="section-kicker">BANDEJA DE ENTRADA</span><h2 id="modal-title">Registrar artículo</h2><p>Agrega un envío de prueba a la bandeja local.</p>
            <form onSubmit={handleCreateSubmission}>
              <label>Título del artículo<input name="title" placeholder="Escribe el título" required maxLength="140" /></label>
              <label>Autor principal<input name="author" placeholder="Nombre y apellido" required maxLength="80" /></label>
              <label>Área académica<select name="category" defaultValue="Ingeniería"><option>Ingeniería</option><option>Ciencias sociales</option><option>Ciencias naturales</option><option>Educación</option><option>Artes y humanidades</option></select></label>
              <div className="form-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" type="submit"><FilePlus2 size={16} /> Registrar artículo</button></div>
            </form>
            <div className="mock-disclaimer">Se guardará solo en esta sesión. El backend aún no está conectado.</div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
