# Strapi CMS Setup

The frontend works without Strapi. When `VITE_STRAPI_URL` is set, it hydrates editable content from Strapi and falls back to the static HTML if the API is unavailable.

## Environment

Create `.env` from `.env.example`:

```env
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_TOKEN=
```

Use `VITE_STRAPI_TOKEN` only if your Strapi API is private.

## Content Types

### Single Type: `about-section`

The frontend reads only the `video` field from this single type. The About copy stays code-side in `src/sections/about.html`.

Fields:

- `video` Media, single video

### Collection Type: `project-brand`

Fields:

- `name` Text
- `slug` UID or Text
- `category` Enumeration: `btl`, `events`, `branding`, `print`
- `folderLabel` Text
- `brandLabel` Text
- `campaignTitle` Text
- `order` Number
- `showInAll` Boolean
- `coverImage` Media, single image
- `items` Repeatable component `project.project-image`

### Component: `project.project-image`

Fields:

- `title` Text
- `alt` Text
- `image` Media, single image

### Collection Type: `client-logo`

Fields:

- `name` Text
- `alt` Text
- `order` Number
- `logo` Media, single image

## Frontend API Requests

The frontend currently reads:

- `/api/about-section?populate=*`
- `/api/project-brands?populate[coverImage]=true&populate[items][populate][image]=true&sort=order:asc`
- `/api/client-logos?populate=logo&sort=order:asc`

## How Projects Render

- `All` tab shows only the first image from brands where `showInAll` is enabled.
- Category tabs show brand/folder cards first.
- Clicking a folder opens the images in that brand's `items`.
- `category` must match one of the existing tab ids: `btl`, `events`, `branding`, `print`.

## How Client Logos Render

- Add one `client-logo` entry per client.
- Upload the logo into the `logo` media field.
- Use `order` to control marquee order.
- The frontend duplicates the logo row automatically for the infinite marquee loop.
