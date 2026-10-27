# SIGECI frontend

Frontend React con Vite, AdminLTE 4, Bootstrap 5 y React Router.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Instalación y desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en la URL que indique Vite, normalmente
`http://localhost:5173`.

## Configuración local

Copia `.env-example` a `.env` y configura la URL del backend y la clave
pública de reCAPTCHA v2:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_RECAPTCHA_SITE_KEY=tu-clave-publica
```

La clave secreta de reCAPTCHA debe permanecer en el backend. El frontend solo
usa la clave pública para renderizar el widget y envía el token junto con las
credenciales a `POST /api/auth/login`.

## Rutas base

- `/login`: inicio de sesión.
- `/forgot-password`: recuperación de contraseña.
- `/reset-pin`: restablecimiento con PIN.
- `/home`: dashboard.
- `/article`: artículos.
- `/users`: usuarios.

Las rutas se administran con React Router y la navegación ocurre sin recargar
la aplicación. Las rutas no reconocidas muestran una vista 404 controlada.

## Compilación y previsualización

```bash
npm run lint
npm run build
npm run preview
```

La navegación se administra con React Router y la configuración específica del
entorno se gestiona mediante variables Vite. No se incluyen secretos ni
credenciales en el código del cliente.
