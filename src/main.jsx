import { createRoot } from 'react-dom/client'
import './index.css'
import './theme/css/adminlte.css'
import './theme/css/dashboard.css'
import { RouterProvider } from 'react-router'
import router from './routes/router.jsx'

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
