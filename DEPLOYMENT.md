# Deploying INAD to Yegara Host

The website consists of two packages:

- `inad-content-manager-fixed.zip`: WordPress plugin for editable website content
- `inad-yegara-deploy-fixed.zip`: compiled static website for `public_html`

WordPress is installed at `/cms`, and the website reads from its public,
read-only endpoint at `/cms/wp-json/inad/v1/content`. Content changes do not
require rebuilding or uploading the website again.

## 1. Install the WordPress plugin

1. Sign in at `https://your-domain/cms/wp-admin`.
2. Open **Plugins → Add New Plugin → Upload Plugin**.
3. Upload `inad-content-manager-fixed.zip`.
4. Click **Install Now**, then **Activate Plugin**.
5. Confirm that **INAD Content** appears in the dashboard menu.

## 2. Add content

- **INAD Content → Projects:** add each project brand. Set its category, cover
  image, gallery images, labels, order, and whether it appears under All Work.
- **INAD Content → Client Logos:** add each client and set its Logo Image.
- **INAD Content → About Video:** upload or select the About video.

Only published projects and logos appear on the public website. Verify the API
by opening:

```text
https://your-domain/cms/wp-json/inad/v1/content
```

It should return JSON containing `about`, `projectBrands`, and `clientLogos`.

## 3. Upload the website

1. Open Yegara **cPanel → File Manager → public_html**.
2. Back up the existing files before replacing them.
3. Keep the `cms` directory. It contains the WordPress installation.
4. Remove Yegara's default/old root `index.html` if present.
5. Upload `inad-yegara-deploy-fixed.zip` into `public_html` and extract it there.
6. Confirm `index.html`, `assets`, `background`, `fonts`, and the other generated
   files are directly in `public_html`, alongside the existing `cms` directory.
7. Enable Yegara's SSL certificate and test the HTTPS website.

Do not upload the source `src`, `node_modules`, `wordpress-plugin`, or
`cms/strapi` directories to `public_html`.

## 4. Production checks

- `/cms/wp-json/inad/v1/content` returns JSON.
- Projects and logos appear after publishing them in WordPress.
- The About video loads after selecting it in WordPress.
- Navigation and the mobile menu work.
- The contact form sends a real test message.
- `/privacy-policy.html`, `/terms-of-service.html`, `/robots.txt`, and
  `/sitemap.xml` load correctly.

## Updating later

Ordinary content changes happen entirely in WordPress and appear automatically.
Rebuild and replace the static package only when website code, styling, or
layout changes.
