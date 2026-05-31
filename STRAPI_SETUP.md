# Strapi CMS Setup

The frontend shell works without Strapi. When `VITE_STRAPI_URL` is set, it hydrates editable content from Strapi. The about video falls back to a bundled local video if the API is unavailable. Projects and client logos show an honest unavailable state because those collections do not have bundled static content.

## Environment

Create `.env` from `.env.example`:

```env
VITE_STRAPI_URL=http://localhost:1337
```

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
- `/api/project-brands?populate[coverImage]=true&populate[items][populate][image]=true&sort=order:asc&pagination[pageSize]=100`
- `/api/client-logos?populate=logo&sort=order:asc&pagination[pageSize]=100`

For a public landing page, expose only these content types with public `find` permissions. Avoid relying on a private API token in the browser.

The landing page intentionally caps each collection at 100 entries. If either collection needs to grow beyond that, add an explicit product decision for pagination or a larger capped query instead of relying on Strapi defaults.

## How Projects Render

- `All` tab shows only the first image from brands where `showInAll` is enabled.
- Category tabs show brand/folder cards first.
- Clicking a folder opens the images in that brand's `items`.
- `category` must match one of the existing tab ids: `btl`, `events`, `branding`, `print`.
- `slug` and `category` are required rendering contracts. The frontend skips malformed records rather than deriving behavior from labels.

## How Client Logos Render

- Add one `client-logo` entry per client.
- Upload the logo into the `logo` media field.
- Use `order` to control marquee order.
- The frontend duplicates the logo row automatically for the infinite marquee loop.
