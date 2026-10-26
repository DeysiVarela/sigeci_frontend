import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  UsersRound,
} from 'lucide-react'

export const navigation = [
  { label: 'Resumen', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Artículos', icon: FileText, count: '24', path: '/articulos' },
  { label: 'Agenda', icon: CalendarDays, path: '/agenda' },
  { label: 'Participantes', icon: UsersRound, path: '/participantes' },
]

export const secondaryRoutes = {
  '/configuracion': {
    title: 'Configuración',
    description: 'Administra las preferencias de tu espacio de trabajo.',
  },
  '/ayuda': {
    title: 'Centro de ayuda',
    description: 'Encuentra orientación para gestionar tu conferencia.',
  },
}

export const isDashboardRoute = (pathname) => pathname === '/' || pathname === '/dashboard'
