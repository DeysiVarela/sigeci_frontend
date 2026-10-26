# SIGECI frontend

Frontend React con Vite, AdminLTE 4, Bootstrap 5 y React Router 7.

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

## Rutas base

- `/dashboard`: resumen de la conferencia.
- `/articulos`: bandeja de artículos.
- `/agenda`: agenda.
- `/participantes`: participantes.
- `/configuracion`: configuración.
- `/ayuda`: centro de ayuda.

Las rutas se administran con React Router y la navegación ocurre sin recargar
la aplicación. Las rutas no reconocidas muestran una vista 404 controlada.

## Compilación y previsualización

```bash
npm run lint
npm run build
npm run preview
```

La configuración específica del entorno se gestiona mediante Vite y no contiene
secretos ni credenciales en el código del cliente.
