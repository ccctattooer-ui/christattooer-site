# Chris Tattooer — site

Static site built with [Eleventy](https://www.11ty.dev/), hosted on Cloudflare (a Worker named `christattooer` serving the built site as static assets) at https://christattooer.com. Domain registered at Squarespace, DNS on Cloudflare. Everything a visitor sees is generated from plain files in this repo. Edit them in the admin at **/admin/** (username + password) or straight in the files; either way the change is a commit and Cloudflare rebuilds the site.

## Editing in the admin

Go to https://christattooer.com/admin/ and log in.

Two screens are not part of the CMS and are reached from the **Shortcuts** dock in the
corner of the admin (or directly, same username and password):

| Screen | What it does | Where it lives |
| --- | --- | --- |
| Flash quick edit (`/admin/prices/`) | one grid of every flash design with editable name, category, size, hours, price, Ready and notes, filtered by category chip or search; per-row Save or Save-all commits the changed files in one commit. New drawings and deletions still happen in Flash designs. | `functions/admin/api/flash.js`, `src/admin/prices/` |
| Guestbook (`/admin/guestbook/`) | approve, hide or delete what visitors signed, waiting ones bucketed first | `functions/admin/api/guestbook.js`, `src/admin/guestbook/` |

Everything else is a section in the CMS sidebar. They are grouped, in this order, with a
line between each bucket:

**Tattoo work — the day-to-day**

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| Flash designs | every design: name, category, drawing, size, price, hours, Ready/Claimed, notes. "New" uploads a new design. | `content/flash/FL-###.json` + `assets/flash/web/` |
| Catalog order | drag-and-drop order of the flash catalog; anything not listed goes last in SKU order | `src/_data/order.json` |
| Healed & recent work | photos on /work/, titles, featured, hidden | `content/work/*.json` + `assets/tattoos/` |

**Pages and their wording**

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| Home page | how-to box, headings, custom card, recent-work strip, on/off switches | `src/_data/home.json` |
| Landing page (TV) | channel number, screen label, welcome text, captions, button, boot messages, on/off | `src/_data/landing.json` |
| Booking page | the three routes, form placeholders, thank-you page | `src/_data/booking.json` |
| About & Aftercare | the two written pages (Markdown) | `src/about.md`, `src/aftercare.md` |
| Guestbook page | the wording on /guestbook/ (entries themselves are approved at /admin/guestbook/) | `src/_data/guestbookPage.json` |
| Wrong address page | the 404 page: heading, opening line, and where to send people | `src/_data/notFound.json` |

**ParlorOS departments**

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| Departments | desktop icons, blurbs, status, SpaceCraft photos | `content/departments/*.json` |
| Paintings | the collage board: one draggable list, each row = title, photo, kind (flash sheet / painting), hidden | `content/paintings.json` + `assets/paintings/` |
| Game montages | the YouTube playlist in the Gamer Zone, one draggable list | `content/videos.json` |
| Gamer Zone wording | the writing around the games section: window names, buttons, the arcade blurb | `src/_data/gamesWords.json` |

**SpaceCraft**

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| SpaceCraft genetics | every plant on the star chart: kind, mother, father (dropdowns), run, flagship, terps, notes, seedfinder link | `content/genetics/*.json` |
| Breeding runs | the six runs: the male that carried each one, the dates, the story. Feeds the "THE RUN" tab and the filters on the bred-in-house board. | `src/_data/runs.json` |
| Scrapped crosses | the wording around the recycle bin on the SpaceCraft desktop | `src/_data/bin.json` |
| SpaceCraft wording | the writing around the plant section: intro, footnote, roster heading, chart hint, button labels | `src/_data/spacecraftWords.json` |

**Extras, each with its own switch**

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| Sticker hunt & coupon | the six hidden stickers (name, hiding place, hint, colour, artwork) and the coupon (amount, minimum, how long it lasts, small print) | `src/_data/stickers.json`, `src/_data/coupon.json` |
| Shop helper | the skull that pops up: whether it shows, where, how long it waits, and every line it says | `src/_data/helper.json` |
| Fun stuff | every playful extra with an on/off switch each: roadworks, screensaver, Konami code, footer buttons, machine pointer, clock wallpaper, view-source note | `src/_data/eggs.json` |

**Setup**

| Admin section | What it changes | Where it lives |
| --- | --- | --- |
| Look & colors | brand colors for both looks, grid columns, collage tilt / tape / piece size | `src/_data/theme.json` |
| Site settings | name, hours, books status, shop address, Instagram, Square link, minimum, deposit, the share picture and the Google opening hours | `src/_data/site.json` |

The buckets, the order and the little icon on each section all come from `src/admin/config.yml`
— `icon:` is a [Material Symbols](https://fonts.google.com/icons) name, and `- divider: true`
draws the line between buckets.

The landing page (`/`) is the ParlorOS "TV" intro; the flash catalog lives at `/flash/`. The intro montage is built by `python tools/build_intro.py` from the clips and photos in `AboutMe/` (raw, not in git): edit the cut list at the top of that script, run it, commit `assets/intro/`. Visitors who already clicked through in the current browser session skip straight to `/flash/`.

Clicking any drawing in the flash catalog opens it in a close-up window, and clicking it again closes it — two clicks, no zoom step in between. ADD TO REQUEST in that window presses the card's own button rather than adding anything itself.

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
| Screensaver | Your drawings bounce around the ParlorOS desktop after a spell of no activity (default 60s). Seven designs spread across the catalog, picked by the `spread` filter so the page doesn't ship every design's path. It stays away entirely while a window with a video in it is open, so it can't cut across a montage nobody is touching the mouse during. |
| Konami code | ↑↑↓↓←→←→BA anywhere turns the walls gold and shows a note you can edit. Ignores keystrokes aimed at a form field. |
| Footer buttons | Five 88×31 buttons drawn in CSS, including your own for other people to link to. The "books open" one blinks, unless reduced motion is on. |
| Machine pointer | A tattoo machine as the mouse pointer, rotary on links. Mouse only. |
| Clock wallpaper | Warms the desktop at dawn and dusk, darkens it after midnight. Only ever a tint *over* the colour in Look & colors, so your palette still wins. |
| View-source note | An ASCII skull and a hello in the page source. Invisible on the page. |
| Shop news ticker | A scrolling strip across the top of every page. Empty the text in the admin and the strip disappears. |
| Spin the wheel | A button above the flash catalog opens a prize wheel of your designs. Claimed ones are left out, and it reshuffles between spins so everything can still come up. |
| Sketch pad | A fold-away drawing pad on the booking form. |
| Boot screen | A fake computer start-up on the landing page, counting up everything on the site from the real numbers. Once per visitor ever; any key skips it; never shown to anyone who asked for reduced motion. Its whole pace comes off one **Speed** field, so halving that halves the lot. |
| Sparkle trail | Sparkles follow the mouse. **Ships off** — visitors switch it on themselves in the footer and their choice sticks. |
| Draggable icons | Shove the department icons around the desktop; they stay where they were left. Mouse and big screens only, with TIDY UP in the taskbar to reset. |
| Webring | Prev / random / next buttons in the footer for a ring you've joined. Hidden until you fill the addresses in. |

### The wheel and the sketch pad

Both live on the pages that earn money, so both are deliberately out of the way: the wheel is behind a button and opens in a dialog, and the pad is folded shut until someone opens it. Neither loads anywhere else — `wheel.js` ships only with `/flash/` and `pad.js` only with `/book/`.

The wheel reads the flash cards already on the page rather than shipping its own copy of the catalog, skips anything marked Claimed, and **ADD IT TO MY REQUEST presses the matching card's own button** — so the booking drawer behaves exactly as it always does, with no second code path to keep in step.

The sketch pad hands its drawing to a hidden file input named `reference`, the same name the photo picker uses. Since `functions/api/book.js` loops over every field with that name, the drawing arrives as just another attachment and **the booking handler needed no changes at all**. A pad nobody drew on attaches nothing.

### The shop helper

A skull turns up in the corner after a quiet moment with one line from **Shop helper**. Press *another* to hear the rest, or *go away* — and go away means it. That's remembered in the visitor's browser for good, because the fastest way to make a mascot hateful is to let it come back. Escape closes it for now without remembering.

It shows on the desktop pages only by default, which keeps the booking pages clear; "Where it turns up" can move it to the catalog side or everywhere.

### The sticker hunt and the coupon

Six stickers hide one per department — Flash, Work, Paintings, Games, SpaceCraft, Store. Each sits at low opacity until you hover or tab onto it: findable if you're looking, invisible if you aren't, and always a real button so a keyboard can reach it. Finding one shows a running count; the footer carries the tally on every page. `/stickers/` is the sheet, and the sixth sticker unlocks a printable coupon.

Progress and the coupon live in the visitor's own browser. **There is deliberately no server in this.** It can be copied, re-printed and shared, and that is the intended behaviour — a hundred printed coupons means a hundred people booking tattoos, and the minimum spend covers the setup either way.

The coupon carries a code with its own issue date in it (`CT50-260912-A7F`), the issue and expiry dates spelled out, and a print stylesheet so only the coupon comes out of the printer. Write `{amount}`, `{min}` or `{days}` anywhere in the small print and the real numbers are filled in from the fields, so the terms can never disagree with the offer.

Each sticker's artwork is a 256×256 PNG in `assets/icons/`. Leave the Artwork field empty and a plain stand-in is drawn instead, so the hunt works before the art exists.

### Scrapped crosses

Any plant in **SpaceCraft genetics** can be ticked **Scrapped**, with a one-line reason. The wording around the bin — its button, window name, heading and intro — is under **Scrapped crosses (the bin)**. A scrapped plant leaves the roster and the star chart, stops counting towards the total, and turns up in the **recycle.bin** window on the SpaceCraft desktop instead — so "51 crosses made here" stays true while the ones that didn't work out are still on show. Three are in there now, out of the breeding log.

## The guestbook and the visitor counter

These two are the only things on the site that need a database. **It is not switched on yet** — see below.

**Nothing a visitor writes ever appears on its own.** Signatures land unapproved and stay invisible until you approve them at **/admin/guestbook/** (same username and password as the rest of the admin; there's a Shortcuts dock for it in the corner of the admin). Approve, hide or delete in bulk. On top of that: a honeypot, hard length caps, and one signature per address per hour. Addresses are stored only as a salted hash — enough to rate-limit, useless for anything else.

The counter counts *visits*, not page views: the page only adds one on the first page of a browser session, so someone reading through six departments counts once. Anything that doesn't run JavaScript never reaches it.

### Switching the database on

Everything is written and shipped, but the binding in `wrangler.jsonc` is **deliberately commented out**: a `database_id` that doesn't exist makes the Cloudflare deploy fail, which would stop the whole site updating. While it's off, `/api/hits` and `/api/guestbook` answer "not connected", the counter stays hidden and the guestbook page says it isn't open yet. Nothing breaks.

To turn it on, once:

```
npx wrangler d1 create christattooer
npx wrangler d1 execute christattooer --remote --file=migrations/0001_init.sql
```

Then paste the id the first command prints into the commented block in `wrangler.jsonc`, uncomment it, and push. Optionally set a `GUESTBOOK_SALT` secret (`npx wrangler secret put GUESTBOOK_SALT --name christattooer`) so the address hashes are unique to this site.

For local work, `--local` instead of `--remote` sets up the copy `npx wrangler dev` uses.

## Icons

The artwork comes off two sheets Chris generated, kept in `docs/icon-sheets/` — in the repo, but
out of `assets/` so their 4.6 MB never ships. `python tools/split_icons.py <out>` cuts them into
individual transparent PNGs: background is flooded in from the sheet border so the whites *inside*
an icon (the skull, the calendar, the folded shirts) survive, and each caption is clipped off.
The cell boxes in that script were measured off those exact files, so a regenerated sheet means
re-checking the numbers.

Sheet 1 is the working set — bold and high contrast, which is why it holds up shrunk to 56px and
16px. Sheet 2 is the same subjects in a holographic palette; it goes muddy small, so it is only
used for stickers, where the art is shown big.

Every window on the site carries a 16px icon at the left of its title bar, the way Windows 95 did — `win-txt`, `win-chart`, `win-roster`, `win-dossier`, `win-gallery`, `win-bin`, `win-video`, `win-form` and `win-arcade`, all off the small grid on sheet 1.

Each icon ships at two sizes: `-128.png` for the 56px desktop icons and `-32.png` for the 16px
menubar strip. Both are rendered with `image-rendering: pixelated` so the downscale stays crisp.
Departments point at their own `-128.png` in the admin, and the menubar swaps in the `-32` for it.

## Everything visitors read is editable

There is no user-facing copy left hardcoded in a template or a script. If a visitor can read it,
it is in a JSON file under `src/_data/` and has a field in the admin — the wheel's intro and its
result kicker, the sketch pad's notes, the sticker toasts, the guestbook's replies, the boot
screen's lines, the 88x31 button text, the 404 page and the SpaceCraft writing.

A few fields take **tokens**, so numbers can never drift out of step with the site:

| Token | Fills in with | Used in |
| --- | --- | --- |
| `{amount}` `{min}` `{days}` | the coupon's amount, minimum and length | coupon small print, sticker page intro |
| `{flash}` `{work}` `{paintings}` `{crosses}` `{videos}` `{books}` | the live counts | the boot screen's lines |
| `{outside}` `{n}` `{runs}` | outside plants, crosses, runs | the SpaceCraft wording |

Two more conventions worth knowing: a `|` in the 88x31 button text becomes a line break, and
leaving the Books or Made-in button empty falls back to Site settings so they never go stale.

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

The basket shows each picked design with its drawing, SKU, size and price, and a rough total —
in the drawer, and again as a panel on the booking page under **What you're asking for**, so nobody
sends a request without seeing exactly what is on it. Every row has a plain **Remove**.

Prices and names are looked up by SKU at render time, never stored in the saved pick: a price
changed in the admin can therefore never show up stale in a basket somebody left open last month.
The shop minimum is applied per design rather than to the basket as a whole, since that is how it
actually works, and anything with no listed price (custom work) is counted separately as "quoted
after a chat" rather than silently as zero.

## Layout

```
content/            one JSON file per flash design, work photo, department; paintings.json + videos.json are ordered lists
src/
  _data/            site.json, home.json, booking.json, theme.json + loaders (flash.js, work.js, …)
  _includes/layouts/
    catalog.njk     white catalog frame (tattoo pages)
    os.njk          ParlorOS desktop frame (other departments)
    page.njk        About / Aftercare wrapper
  admin/            Sveltia CMS (index.html + config.yml) + the Shortcuts dock
  admin/admin.css   the shell shared by the two custom admin screens
  intro.njk         landing page (CRT TV + montage) at /
  index.njk         flash catalog at /flash/
  404.njk           the page a wrong address lands on
  sitemap.njk       /sitemap.xml, robots.njk -> /robots.txt
  _includes/partials/meta.njk   canonical + share-preview tags + LocalBusiness JSON-LD
  _includes/partials/           signature.njk (view-source note), badges.njk (footer buttons),
                                helper.njk (the skull), news.njk (the ticker),
                                sticker-spot.njk (one hidden sticker)
  stickers.njk      the sticker sheet and the printable coupon at /stickers/
  js/wheel.js       the prize wheel, loaded by /flash/ only
  js/pad.js         the sketch pad, loaded by /book/ only
  guestbook.njk     /guestbook/ + js/guestbook.js
  admin/guestbook/  the moderation screen (custom page, not part of the CMS)
  admin/prices/     the flash quick-edit grid (custom page, not part of the CMS)
migrations/         the D1 schema, run once with wrangler
  js/eggs.js        every easter egg, switched in the admin (src/_data/eggs.json)
  work.njk          all photos + lightbox
  book.njk          booking
  department.njk    one page per department (paintings collage, games, store, spacecraft)
functions/          server routes: admin/auth.js (login), admin/api/flash.js (price sheet),
                    admin/api/guestbook.js (moderation), api/book.js (booking email),
                    api/guestbook.js, api/hits.js
worker/index.js     Worker entry: routes those three paths, serves everything else from _site
wrangler.jsonc      Cloudflare Worker config (assets dir, build command)
assets/             web-ready images that ship with the site
tools/              image converters
```
