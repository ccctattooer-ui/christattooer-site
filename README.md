# Chris Tattooer — site

Static site built with [Eleventy](https://www.11ty.dev/), hosted on Netlify at https://christattooer.com. Everything a visitor sees is generated from plain files in this repo. Edit them in the admin at **/admin/** (username + password) or straight in the files; either way the change is a commit and Netlify rebuilds the site.

## Editing in the admin

Go to https://christattooer.com/admin/ and log in. Sections:

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| Flash designs | every design: name, category, drawing, size, price, hours, Ready/Claimed, notes. "New" uploads a new design. | `content/flash/FL-###.json` + `assets/flash/web/` |
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

Saving in the admin commits to GitHub; the live site updates about a minute later.

Uploads are shrunk in the browser to 2000px WebP before they are committed. Thumbnails for every photo are generated at build time (`@11ty/eleventy-img`), so there are no thumbs folders to maintain.

## How the admin login works

The admin is [Sveltia CMS](https://sveltiacms.app/). It talks to the GitHub repo, but you never see GitHub: `netlify/functions/admin-auth.mjs` shows a username/password form and, on success, hands the CMS a repo-scoped GitHub token. Three Netlify environment variables make it work:

- `ADMIN_USER` — the username
- `ADMIN_PASSWORD_SHA256` — SHA-256 of the password (`python -c "import hashlib;print(hashlib.sha256(b'...').hexdigest())"`)
- `GITHUB_TOKEN` — a fine-grained GitHub token with Contents read/write on this repo only

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

- **Request form** — posts to Netlify Forms (`name="tattoo-request"`); notifications go to your email.
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
netlify/functions/  admin-auth.mjs (admin login)
assets/             web-ready images that ship with the site
tools/              image converters
```
