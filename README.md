# identidad-web

Interfaz de **identidad.juarezcampos.net**: la pantalla donde los usuarios de Juarez Campos inician sesión una sola vez (SSO) para entrar a ISTQB y a los demás sistemas.

Angular 21. Toda la lógica vive en la API de identidad (Laravel + Passport, repositorio `RomeoSoft22/identidad`); esta app solo muestra las pantallas.

## Páginas

| Ruta | Para qué |
|---|---|
| `/authorize?client_id=…&redirect_uri=…&state=…&code_challenge=…` | Adonde redirige cada sistema. Pide login si no hay sesión, muestra "sin acceso" si el usuario no está matriculado, o vuelve al sistema con el código. |
| `/login` | Entrada directa. Si ya hay sesión, muestra la cuenta y permite cerrarla. |
| `/logout?post_logout_redirect_uri=…` | Cierra la sesión en todos los sistemas y vuelve al sistema si su URL está registrada. |

## Cómo habla con la API

- Mismo dominio, bajo `/api`: la cookie de sesión SSO es HttpOnly y de primera parte.
- Protección CSRF: Laravel deja la cookie `XSRF-TOKEN` y Angular la reenvía en `X-XSRF-TOKEN` (configurado en `app.config.ts`).
- Endpoints usados: `GET /api/sesion`, `POST /api/login`, `POST /api/logout`, `GET /api/authorize`.

## Desarrollo

Requiere la API de identidad corriendo en `http://127.0.0.1:8001` (`php artisan serve --port=8001`).

```bash
npm install
npm start
```

Abre `http://localhost:4300`. `proxy.conf.json` envía `/api` a la API.

En la API, `IDENTIDAD_ISSUER=http://localhost:4300`. En cada sistema cliente, `IDENTIDAD_URL=http://localhost:4300` y `IDENTIDAD_API_URL=http://127.0.0.1:8001/api`.

## Producción

```bash
npm run build
```

Publica `dist/identidad-web/browser` como raíz de `identidad.juarezcampos.net` y haz que `/api` llegue a `public/index.php` de la API (ver `public/.htaccess`). En la API: `IDENTIDAD_ISSUER=https://identidad.juarezcampos.net` e `IDENTIDAD_API_URL=https://identidad.juarezcampos.net/api`.
