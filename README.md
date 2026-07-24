# cache

a moodboard tool that pastes, drags, and styles like you actually think — no figma detour required.

## running it

```bash
npm install
npm run dev
```

then open http://localhost:3000

## what's in here

- `app/layout.js` — loads Pixelify Sans (display) + IBM Plex Mono (everything else) via `next/font/google`, no external `@import` or flash of unstyled text
- `app/page.js` — renders the board
- `components/CacheBoard.jsx` — the whole tool: paste-to-add, drag, resize, per-piece styling (fill, corner radius, rotation, opacity, layer order), canvas background, PNG export, and a shareable link
- `components/CacheBoard.module.css` — all the styling, as plain CSS Modules (no Tailwind)
- `app/globals.css` — tailwind + the `.fg-brand` class for the display face

## vocabulary

Every tool in this space names its unit of work differently — Figma has files, Are.na has
channels, Notion has pages, Cosmos has clusters. Cache's naming:

| generic term                | cache's word |
| --------------------------- | ------------ |
| board / canvas              | **patch**    |
| folder (a group of patches) | **stash**    |
| saved / saved to database   | **cached**   |

A patch is the single infinite canvas — what `CacheBoard.jsx` renders. A stash is the
organizational layer above it (a folder of patches) — not built in this starter; see the
roadmap below. "Cached" replaces "saved" everywhere in the UI: the share-link toast reads
"cached — link copied," and the exported file is just `patch.png`, no product name needed
since it's already sitting in your downloads folder next to the app that made it.

## positioning

Pinterest is for discovery. Are.na is for archives. Cosmos is for collecting. Milanote is for planning.
Figma/FigJam is for collaboration.

**cache is a browser window that becomes a personal visual thinking space.**
Not a board you build toward a finished state — a room you keep walking back into. Open it, hit
paste, it's already there.

## tech stack (planned — this starter uses hand-rolled canvas logic as a proof of concept)

**Frontend:** Next.js, React, TypeScript. Styling is plain CSS Modules (`CacheBoard.module.css`)
— no Tailwind, no build-time class generation. Next.js supports CSS Modules natively with zero
config, so there's no PostCSS/Tailwind toolchain to maintain.

**Canvas:** [tldraw](https://tldraw.dev) — infinite canvas SDK with pan/zoom/select/resize/rotate/
undo built in. Define custom shape types for image, embed, color, and text cards, and layer the
existing style panel on top of tldraw's shape/selection events instead of hand-rolling drag and
resize math (which is what `CacheBoard.jsx` currently does, for a dependency-free demo).

**Database:** Supabase (Postgres + Storage) — bundles DB, file storage, and auth in one project,
which matters most for shipping v1 fast without wiring together three separate services. It's vanilla
Postgres underneath, so nothing's locked in if this needs to move to Neon + Drizzle later for more
schema control.

**Storage:** Supabase Storage (S3-compatible underneath; Cloudflare R2 is the fallback if storage
needs move off Supabase specifically)

**Auth:** Better Auth over Clerk — this app's core UX is "no account required, optional save later"
via a guest board id + edit token (see below). Better Auth lives in the same Postgres as everything
else, so "upgrade this guest board to my account" is a plain database write. Clerk ships faster but
fits a more auth-first product, and bills per monthly active user.

**Link unfurling:** one `/api/unfurl` route. Check the pasted URL against known patterns first
(YouTube oEmbed, Spotify oEmbed, GitHub's REST API — all CORS-friendly and callable straight from
the browser with zero backend), and fall back to server-side `og:image` / `og:title` scraping for
anything else. Instagram is worth flagging now: their thumbnails are locked down without official
API access/business verification, so plan for a plain link card there rather than promising a
thumbnail.

## case study

`/case-study` is a full write-up of the build — the problem framing, the competitive landscape, the
naming decisions (patches/stashes/cached), the visual direction's actual evolution (including the two
passes that got rejected before the current one), three real bugs with root causes, and the AGPL catch.
Reuses the exact same design tokens and signature motifs (the corner tag, the bracket selection marks)
as the tool itself, so the write-up and the product read as one coherent thing rather than a separate
marketing page bolted on afterward. Two spots are marked as screenshot placeholders — drop in real
captures of the running app once it's deployed.

## known limits of this starter (the real v2 list)

- **the download button now offers two formats.** PNG is the flat visual snapshot (what it always
  did). HTML exports a single self-contained file where link cards stay real `<a href>` tags and
  file cards stay real openable/downloadable links — genuinely functional, not just a picture of a
  document icon. No backend involved; everything (images, files, link previews) is inlined as data
  URLs in the one HTML file, so it's fully portable but can get large fast with big attachments —
  same size caveat as the share link, just landing in a downloaded file instead of a URL.

- **links now unfurl into real cards.** Paste a URL (or use the link button) and it lands
  immediately as a placeholder card, then `app/api/unfurl/route.js` — a small server-side route —
  fetches the page and extracts `og:title` / `og:description` / `og:image` to enrich it. This route
  runs server-side specifically to dodge the browser's CORS restrictions on fetching arbitrary pages;
  it uses regex-based tag extraction, which is fine for a starter but fragile against malformed HTML —
  swap in a real HTML parser (e.g. `cheerio`) if this needs to be more robust. Each card has an explicit
  "open ↗" button rather than making the whole card clickable, so opening a link doesn't fight with
  dragging it.
- **files (PDFs, docs, anything) work the same way as images** — stored inline as a base64 data URL,
  no backend needed to add or open them. **The real limit is share links:** a PDF of any real size
  will blow past what's practical to encode into a URL hash (already flagged above for background
  images — this makes it much more likely to actually bite). A multi-page PDF shared this way may
  simply produce a broken/truncated link. This is the clearest signal yet that "real" sharing needs
  actual file storage (Supabase Storage / Cloudflare R2) with the board referencing a URL rather than
  embedding bytes — everything else about the guest-edit-token sharing model stays the same once
  that swap happens.
- **link preview images are loaded with `crossOrigin="anonymous"`** for canvas export safety — if the
  source site doesn't allow CORS on its preview image, the export just falls back to a blank card
  background rather than failing (or breaking the whole PNG export via a tainted canvas).

- **⚠️ `@imgly/background-removal` (used for the "remove background" button) is AGPL-3.0 licensed.**
  This is worth resolving before shipping anything commercial — AGPL generally requires that if the
  app runs as a network-accessible service, the app's own source has to be made available under AGPL
  too, unless a commercial license is purchased from IMG.LY (they sell one specifically for this).
  This isn't legal advice, just a flag: worth a real read of the license or a quick conversation with
  a lawyer before this goes further than a personal prototype. If AGPL doesn't work for the business,
  alternatives are a paid IMG.LY commercial license, or swapping in a client-side segmentation model
  under a more permissive license (e.g. a Hugging Face Transformers.js pipeline with a compatible
  model, though matting quality varies more by model than this library's purpose-built one).
- **background removal runs entirely client-side** — a WASM/ONNX model loads in the browser (via
  `import("@imgly/background-removal")`, code-split so it doesn't bloat the initial bundle) and
  processes the image locally. First use in a session will be slower while the model downloads;
  subsequent removals in the same session are faster.
- **the original image is kept** as `originalSrc` on the element once background removal runs once,
  so "restore original" is always available without needing undo. Worth knowing: this roughly doubles
  that image's payload size in the share-link hash, compounding the size caveat already noted above.

- **undo is in-memory only** — cmd/ctrl+z or the undo button steps back through a 50-entry history
  held in a ref; it resets on page reload. Persisting undo history isn't usually worth it once
  real save/cache exists — reloading a saved patch is the natural reset point.
- **delete works via the trash icon in the style panel or the Delete/Backspace key** once something's
  selected (guarded so it doesn't fire while you're actively typing in a text card or an input).
- **pasted/dropped pieces land on a cascading diagonal offset** instead of dead-center, so repeated
  pastes don't stack exactly on top of each other. If you want the last-pasted piece back where you
  started, undo is the fastest way there.

- **no stashes yet** — this starter is a single patch with no organizational layer above it.
  a `stashes` table (id, name, owner) with a `patch_id -> stash_id` foreign key is the natural
  shape once patches need grouping.
- **background images make the share-link hash very long.** The URL-hash sharing trick already had
  a size ceiling; a background image (base64-encoded) makes that much more likely to matter. This is
  the clearest sign it's time to move share-links to a real `boards` table + short id (see above)
  rather than pushing the hash approach further.
- **share link has no backend.** it packs the whole board into the URL hash as base64 JSON, so it
  round-trips with zero infrastructure but the link gets long and won't survive across
  devices/browsers cleanly. swap in: a `boards` table, a random board id + a separate edit-token,
  and the link becomes `/b/{id}`. same no-account-required UX, real persistence.
- **no accounts yet** — the guest-edit-token pattern above is what makes "save it later" possible
  without forcing signup up front.
- **no auto-unfurling yet** — pasting a URL currently creates a plain text card; the `/api/unfurl`
  route above is what turns a GitHub/YouTube/Spotify/generic link into a real preview card.
- **connections/flows between pieces** were intentionally left out of this pass — good v2 candidate
  once the core paste → style → export loop is validated with real use.
- **image storage** is currently inline as base64 in the JSON — fine for a single board, move to
  Supabase Storage once boards need to be shareable at any real size.
- clipboard-paste of images is unreliable on mobile Safari — the image button in the toolbar is the
  dependable path there. dropping a folder (not pasting — clipboard can't carry folders) is the
  right affordance for "all images in this folder appear at once."

## deploying

this is a stock Next.js app, so `vercel deploy` from the project root works with zero config.
