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
| SpaceCraft genetics | every plant on the star chart: kind, mother, father (dropdowns), run, flagship, terps, notes, seedfinder link | `content/genetics/*.json` |
| Breeding runs | the six runs: the male that carried each one, the dates, the story. Feeds the "THE RUN" tab and the filters on the bred-in-house board. | `src/_data/runs.json` |
| Departments | desktop icons, blurbs, status, SpaceCraft photos | `content/departments/*.json` |
| Pages | About and Aftercare text (Markdown) | `src/about.md`, `src/aftercare.md` |
| Home page | how-to box, headings, custom card, recent-work strip, on/off switches | `src/_data/home.json` |
| Landing page (TV) | channel number, screen label, welcome text, captions, button, boot messages, on/off | `src/_data/landing.json` |
| Booking page | the three routes, form placeholders, thank-you page | `src/_data/booking.json` |
| Look & colors | brand colors for both looks, grid columns, collage tilt / tape / piece size | `src/_data/theme.json` |
| Site settings | name, hours, books status, shop address, Instagram, Square link, minimum, deposit, the share picture and the Google opening hours | `src/_data/site.json` |

The landing page (`/`) is the ParlorOS "TV" intro; the flash catalog lives at `/flash/`. The intro montage is built by `python tools/build_intro.py` from the clips and photos in `AboutMe/` (raw, not in git): edit the cut list at the top of that script, run it, commit `assets/intro/`. Visitors who already clicked through in the current browser session skip straight to `/flash/`.

Saving in the admin commits to GitHub; Cloudflare Workers Builds rebuilds and the live site updates a minute or two later (free plan: 3,000 build minutes a month, plenty).

## Being found and being shared

Two things run off **Site settings** and are worth keeping filled in:

- **Share picture** — when anyone posts a link to the site on Instagram, in a DM or on Facebook, this is the photo that shows in the preview. A 1200px copy is generated at build time (`src/_data/og.js`), so just pick a good photo; no need to size it.
- **Domain, shop address and opening hours** — these become a `TattooParlor` record in the page source (`src/_data/schema.js`) that tells Google there is a tattoo shop at that address, which is what local "tattoo shop near me" searches read. Blank fields are left out rather than guessed: opening hours start empty on purpose, because whatever is typed there can end up shown in Google.

`/sitemap.xml` and `/robots.txt` are generated from the pages that exist, so new departments are listed automatically.

Uploads are shrunk in the browser to 2000px WebP before they are committed. Thumbnails for every photo are generated at build time (`@11ty/eleventy-img`), so there are no thumbs folders to maintain.

## The SpaceCraft department

`/spacecraft/` opens on **bred-in-house.exe**: a card for each of the 51 crosses, filterable by run or flagship. The star chart is one click away rather than the first thing seen, because on its own it reads as a library of other people's genetics — 174 of the 225 plants on it are outside stock, kept so every cross can be traced back to a landrace. The chart's **MINE ONLY** button pushes those into the background.

Tapping any plant opens a tabbed readout:

- **DOSSIER** — photo, parents, status, and the smells split into chips; tap one to find everything else on the chart that shares it.
- **LINEAGE** — the ancestry tree, one branch opened at a time, down to the landraces.
- **THE RUN** — the male that carried the run, the dates, and the sister crosses made alongside it (SpaceCraft crosses only).
- **WHAT IT MADE** — what the plant went on to parent, and how far downstream it reaches.

Outside plants get the same readout minus the run tab, and are labelled as outside genetics. A cross with no photo gets a generated star mark instead, so the board stays even.

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
  intro.njk         landing page (CRT TV + montage) at /
  index.njk         flash catalog at /flash/
  404.njk           the page a wrong address lands on
  sitemap.njk       /sitemap.xml, robots.njk -> /robots.txt
  _includes/partials/meta.njk   canonical + share-preview tags + LocalBusiness JSON-LD
  work.njk          all photos + lightbox
  book.njk          booking
  department.njk    one page per department (paintings collage, games, store, spacecraft)
functions/          server routes: admin/auth.js (login), admin/api/flash.js (price sheet), api/book.js (booking email)
worker/index.js     Worker entry: routes those three paths, serves everything else from _site
wrangler.jsonc      Cloudflare Worker config (assets dir, build command)
assets/             web-ready images that ship with the site
tools/              image converters
```
