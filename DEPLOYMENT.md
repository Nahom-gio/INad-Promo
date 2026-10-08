# Deployment

## Frontend on Vercel

Deploy the root Vite app to Vercel.

Vercel settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Environment variables:

```env
VITE_STRAPI_URL=https://your-strapi-domain.com
```

## Strapi Cloud

The production CMS is hosted on Strapi Cloud. Do not host Strapi itself on Vercel.

In Vercel, set:

```env
VITE_STRAPI_URL=https://your-strapi-cloud-domain
```

Strapi Cloud manages the hosted database and uploads storage. The local SQLite configuration remains suitable for local CMS development only.

## Strapi Public Permissions

In Strapi admin:

`Settings -> Users & Permissions Plugin -> Roles -> Public`

Enable `find` for:

- `about-section`
- `project-brand`
- `client-logo`

Keep the website content public-read only for just these content types. Do not ship a private Strapi API token in the browser for a public marketing site.

## Local URLs

Use:

- Frontend: `http://127.0.0.1:5173`
- Strapi Admin: `http://localhost:1337/admin`

If `localhost:5173` shows `426 Upgrade Required`, use `127.0.0.1:5173`.
