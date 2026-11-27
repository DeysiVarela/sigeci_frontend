# Reglas Estrictas de Frontend para Agentes IA — SIGECI (`sigeci_frontend`)

Estas reglas son **obligatorias** para cualquier agente de IA que escriba o modifique código en `sigeci_frontend`. Ningún integrante ni agente debe introducir patrones distintos al estándar del proyecto.

## 1. Fuente Única de Verdad de Campos (`../sigeci_backend/deploy/schema.sql`)
1. **Revisión obligatoria:** Antes de construir formularios, tablas o vistas, **revisa `../sigeci_backend/deploy/schema.sql`** (y el endpoint correspondiente en `sigeci_backend`).
2. **Prohibido inventar nombres de campos:** Usa exactamente los nombres de columnas definidos en `schema.sql` (ej. `article_id`, `article_subject`, `article_description`, `topic_id`). Si crees que falta un campo en BD, **detente y pregunta al usuario**; si se aprueba, debe quedar documentado en `deploy/schema.sql`.

## 2. Prohibición Absoluta de Fallbacks (`||`, `??`) y Alias
1. **TERMINANTEMENTE PROHIBIDO** usar `||`, `??` o ternarios para aceptar múltiples nombres de un mismo campo del backend (ej. `res.token || res.access`, `row.topic_subject ?? row.topic_name`, `item.article_subject || item.title`).
2. El frontend debe exigir exactamente el nombre único definido por el backend (para autenticación, únicamente `token` y `refresh_token`; **prohibido** `access` o `refresh`).

## 3. Estándar de Módulos y Componentes (Referencia: `src/pages/article/`)
Todo módulo en `src/pages/<modulo>/` debe seguir exactamente la estructura y convenciones de `src/pages/article/`:
1. **Archivos del módulo:**
   - `<Modulo>Screen.jsx`: Listado con `DataTable` fluida (`grow` proporcional + `minWidth: 0` en `customStyles`, **prohibido fijar anchos en `px`**) y botones de acción con las clases globales `.table-actions`, `.btn-table-action`, `.btn-table-view`, `.btn-table-edit`, `.btn-table-delete`.
   - `<Modulo>FormScreen.jsx`: Crear y editar en el mismo componente usando `react-hook-form` y los inputs de `src/components/inputs/*`.
   - `<Modulo>ViewScreen.jsx`: Detalle del registro.
2. **Peticiones HTTP exclusivas con `useFetch`:**
   - Usar siempre `const api = useFetch()` (`src/hooks/useFetch.js`).
   - **PROHIBIDO** modificar `src/hooks/useFetch.js`.
   - **PROHIBIDO** crear carpetas `src/api/`, clientes `fetch()` o instancias `axios` adicionales.
3. **Permisos siempre Inline:**
   - Validar permisos directamente en la expresión JSX/condicional con `app?.permissions?.["<modulo>"]?.includes("<accion>")`.
   - **PROHIBIDO** guardar permisos en variables intermedias (`const canCreate = ...`, `const canUpdate = ...`) o crear helpers de permisos.
4. **Loader y Mensajes con `HandlerApp`:**
   - Usar únicamente `const handlerApp = HandlerApp()` (`src/utils/HandlerApp.jsx`):
     - `handlerApp.setLoader(true)` / `handlerApp.setLoader(false)`
     - `handlerApp.showOk(message)` y `handlerApp.showError(message)` (**un solo argumento `message`**, sin `title`).
   - **PROHIBIDO** usar `Swal.fire` directo para errores o mensajes de éxito simples, o crear utilidades como `getErrorMessage` / `apiError.js`.
