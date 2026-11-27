import './config/i18n'
import './index.css'
import './theme/css/adminlte.css'
import './theme/css/dashboard.css'
import router from './routes/router.jsx'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AppContextProvider } from './context/AppContext.jsx'
import { LoaderContextProvider } from './context/LoaderContext.jsx'

createRoot(document.getElementById('root')).render(
  <AppContextProvider>
    <LoaderContextProvider>
      <RouterProvider router={router} />
    </LoaderContextProvider>
  </AppContextProvider>
)
