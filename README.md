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
| Shop helper | the skull that pops up: whether it shows, where, how long it waits, and every line it says | `src/_data/helper.json` |
| Fun stuff | every playful extra with an on/off switch each: roadworks, screensaver, Konami code, footer buttons, machine pointer, clock wallpaper, view-source note | `src/_data/eggs.json` |
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

`/spacecraft/` opens on **bred-in-house.exe**: the complete roster of all 51 crosses, numbered 01–51 and grouped by the run that made them, with each run headed by the male that carried it. Flagships sort to the top of their run. Filter by run or flagship, or search by name, parent or smell. The star chart is one click away rather than the first thing seen, because on its own it reads as a library of other people's genetics — 174 of the 225 plants on it are outside stock, kept so every cross can be traced back to a landrace. The chart's **MINE ONLY** button pushes those into the background.

Tapping any plant opens a tabbed readout:

- **DOSSIER** — photo, parents, status, and the smells split into chips; tap one to find everything else on the chart that shares it.
- **LINEAGE** — the ancestry tree, one branch opened at a time, down to the landraces.
- **THE RUN** — the male that carried the run, the dates, and the sister crosses made alongside it (SpaceCraft crosses only).
- **WHAT IT MADE** — what the plant went on to parent, and how far downstream it reaches.

Outside plants get the same readout minus the run tab, and are labelled as outside genetics.

The roster reads off `content/genetics/*.json`, so a new cross appears as soon as its file exists. Two fields are worth filling in for every cross, because the list shows them: **terps** (the line under each name — 24 of the 51 have one so far) and **status** (the pill on the right: released, testing, seeding, stock, new, unreleased).

## The fun stuff

Everything playful lives behind one switch each in **Fun stuff**, and one script: `src/js/eggs.js` (under 5 KB, deferred, loaded on the catalog and desktop pages). Turning something off in the admin makes it vanish — nothing is hardcoded on.

Three house rules it sticks to, worth keeping if you add more:

- **Nothing moves until it's invited.** The screensaver waits for real idle; nothing autoplays; nothing makes noise.
- **Anything animated stops for `prefers-reduced-motion`**, and anything needing room (the screensaver) checks for a desktop-sized screen and a mouse first.
- **The money pages stay clean.** Flash, Work and Book carry at most one playful thing each, and nothing that crowds the Add-to-request and Send-request buttons.

What's in there now:

| | What it does |
| --- | --- |
| Roadworks | Barricade, digger and scrolling sign on any department whose Status still says soon / later / under construction. Change the status and it retires itself — no code change. |
| Screensaver | Your drawings bounce around the ParlorOS desktop after a spell of no activity (default 60s). Seven designs spread across the catalog, picked by the `spread` filter so the page doesn't ship all 71 paths. |
| Konami code | ↑↑↓↓←→←→BA anywhere turns the walls gold and shows a note you can edit. Ignores keystrokes aimed at a form field. |
| Footer buttons | Five 88×31 buttons drawn in CSS, including your own for other people to link to. The "books open" one blinks, unless reduced motion is on. |
| Machine pointer | A tattoo machine as the mouse pointer, rotary on links. Mouse only. |
| Clock wallpaper | Warms the desktop at dawn and dusk, darkens it after midnight. Only ever a tint *over* the colour in Look & colors, so your palette still wins. |
| View-source note | An ASCII skull and a hello in the page source. Invisible on the page. |
| Shop news ticker | A scrolling strip across the top of every page. Empty the text in the admin and the strip disappears. |

### The shop helper

A skull turns up in the corner after a quiet moment with one line from **Shop helper**. Press *another* to hear the rest, or *go away* — and go away means it. That's remembered in the visitor's browser for good, because the fastest way to make a mascot hateful is to let it come back. Escape closes it for now without remembering.

It shows on the desktop pages only by default, which keeps the booking pages clear; "Where it turns up" can move it to the catalog side or everywhere.

### Scrapped crosses

Any plant in **SpaceCraft genetics** can be ticked **Scrapped**, with a one-line reason. A scrapped plant leaves the roster and the star chart, stops counting towards the total, and turns up in the **recycle.bin** window on the SpaceCraft desktop instead — so "51 crosses made here" stays true while the ones that didn't work out are still on show. Three are in there now, out of the breeding log.

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
  _includes/partials/           signature.njk (view-source note), badges.njk (footer buttons),
                                helper.njk (the skull), news.njk (the ticker)
  js/eggs.js        every easter egg, switched in the admin (src/_data/eggs.json)
  work.njk          all photos + lightbox
  book.njk          booking
  department.njk    one page per department (paintings collage, games, store, spacecraft)
functions/          server routes: admin/auth.js (login), admin/api/flash.js (price sheet), api/book.js (booking email)
worker/index.js     Worker entry: routes those three paths, serves everything else from _site
wrangler.jsonc      Cloudflare Worker config (assets dir, build command)
assets/             web-ready images that ship with the site
tools/              image converters
```
