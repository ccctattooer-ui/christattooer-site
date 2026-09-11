# Chris Tattooer — site

Static site built with [Eleventy](https://www.11ty.dev/), hosted on Cloudflare (a Worker named `christattooer` serving the built site as static assets) at https://christattooer.com. Domain registered at Squarespace, DNS on Cloudflare. Everything a visitor sees is generated from plain files in this repo. Edit them in the admin at **/admin/** (username + password) or straight in the files; either way the change is a commit and Cloudflare rebuilds the site.

## Editing in the admin

Go to https://christattooer.com/admin/ and log in. Sections:

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| Flash designs | every design: name, category, drawing, size, price, hours, Ready/Claimed, notes. "New" uploads a new design. | `content/flash/FL-###.json` + `assets/flash/web/` |
| Quick edit (/admin/prices/) | one grid of every flash design with editable name, category, size, hours, price, Ready and notes; per-row Save or Save-all commits the changed files in one commit. New drawings and deletions still happen in Flash designs. | `functions/admin/api/flash.js`, `src/admin/prices/` |
| Healed & recent work | photos on /work/, titles, featured, hidden | `content/work/*.json` + `assets/tattoos/` |
| Paintings | the collage board: one draggable list, each row = title, photo, kind (flash sheet / painting), hidden | `content/paintings.json` + `assets/paintings/` |
| Game montages | the YouTube playlist on /games/, one draggable list | `content/videos.json` |
| Flash order (drag to sort) | drag-and-drop order of the flash catalog; anything not listed goes last in SKU order | `src/_data/order.json` |
| Departments | desktop icons, blurbs, status, SpaceCraft photos | `content/departments/*.json` |
| Pages | About and Aftercare text (Markdown) | `src/about.md`, `src/aftercare.md` |
| Home page | how-to box, headings, custom card, recent-work strip, on/off switches | `src/_data/home.json` |
| Booking page | the three routes, form placeholders, thank-you page | `src/_data/booking.json` |
| Look & colors | brand colors for both looks, grid columns, collage tilt / tape / piece size | `src/_data/theme.json` |
| Site settings | name, hours, books status, shop, Instagram, Square link, minimum, deposit | `src/_data/site.json` |

Saving in the admin commits to GitHub; Cloudflare Workers Builds rebuilds and the live site updates a minute or two later (free plan: 3,000 build minutes a month, plenty).

Uploads are shrunk in the browser to 2000px WebP before they are committed. Thumbnails for every photo are generated at build time (`@11ty/eleventy-img`), so there are no thumbs folders to maintain.

## How the admin login works

The admin is [Sveltia CMS](https://sveltiacms.app/). It talks to the GitHub repo, but you never see GitHub: `functions/admin/auth.js` shows a username/password form and, on success, hands the CMS a repo-scoped GitHub token. These secrets live on the Worker (Cloudflare dashboard → Workers & Pages → christattooer → Settings → Variables and Secrets), or `npx wrangler secret put NAME --name christattooer`:

- `ADMIN_USER` — the username
- `ADMIN_PASSWORD_SHA256` — SHA-256 of the password (`python -c "import hashlib;print(hashlib.sha256(b'...').hexdigest())"`)
- `GITHUB_TOKEN` — a fine-grained GitHub token with Contents read/write on this repo only
- `RESEND_API_KEY` and `BOOKING_TO` — for the booking form emails (see Booking)

## Run it locally

```
npm install        # once
npm run dev        # http://localhost:8080, rebuilds as you edit
npm run build      # writes the finished site to _site/
```

## Adding photos by hand (instead of the admin)

1. Drop phone photos (HEIC or JPG) into `Tattoo_Images/`, paintings into `Paintings/`, plant photos into `Plant_Breeding_Images/`, scans into `Line_Drawing_Scans/`.
2. Run `npm run images` (tattoos + plants) or `python tools/convert_paintings.py` (paintings). They write web-sized JPEGs into `assets/`.
3. Add a JSON file per new photo in the matching `content/` folder (copy an existing one). The raw folders are ignored by git; only `assets/` ships.

## Booking

Three routes, all on `/book/`:

- **Request form** — posts to `/api/book` (`functions/api/book.js`), which emails you through [Resend](https://resend.com) with the reference photos attached, then shows /thanks/.
- **Square** — the link in Site settings.
- **Instagram DMs**.

Flash "Add to request" picks are remembered in the visitor's browser and included in the form as a `picks` field.

## Layout

```
content/            one JSON file per flash design, work photo, department; paintings.json + videos.json are ordered lists
src/
  _data/            site.json, home.json, booking.json, theme.json + loaders (flash.js, work.js, …)
  _includes/layouts/
    catalog.njk     white catalog frame (tattoo pages)
    os.njk          ParlorOS desktop frame (other departments)
    page.njk        About / Aftercare wrapper
  admin/            Sveltia CMS (index.html + config.yml)
  index.njk         flash catalog (home)
  work.njk          all photos + lightbox
  book.njk          booking
  department.njk    one page per department (paintings collage, games, store, spacecraft)
functions/          server routes: admin/auth.js (login), admin/api/flash.js (price sheet), api/book.js (booking email)
worker/index.js     Worker entry: routes those three paths, serves everything else from _site
wrangler.jsonc      Cloudflare Worker config (assets dir, build command)
assets/             web-ready images that ship with the site
tools/              image converters
```
