# WordPress CMS Setup

The production website reads editable content from WordPress installed at
`/cms`. The custom plugin source is in `wordpress-plugin/inad-content-manager`,
and the uploadable plugin package is `inad-content-manager.zip`.

The plugin exposes a public read-only endpoint:

```text
/cms/wp-json/inad/v1/content
```

The frontend uses that same-origin path by default. Set `VITE_CMS_API_URL` only
if WordPress is hosted at a different path or domain.

Content editors use the **INAD Content** dashboard menu to manage:

- Project brands, categories, covers, and galleries
- Client logos
- The About video

Only published projects and logos are returned by the endpoint. WordPress login
credentials and write operations are never exposed to the frontend.

The old `cms/strapi` directory is retained only as legacy source and is not used
or uploaded in the WordPress deployment.
