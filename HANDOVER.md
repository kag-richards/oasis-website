# Oasis Women Center — website

11ty + Decap CMS + GitHub Pages, forked from `dcdc-static-cms-starter`.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # outputs to _site/
```

## Pages

Every page is an `.njk` template, and every page uses the same look, The Plan.

| URL | Source | Layout |
|---|---|---|
| `/` | `src/content/pages/index.njk`, words and prices in `src/content/_data/plan.json` | `layouts/plan.njk` |
| `/about/` | `src/content/pages/about.njk` | `layouts/page.njk` |
| `/founder/` | `src/content/pages/founder.njk` | `layouts/page.njk` |
| `/programs/` | `src/content/pages/programs.njk` | `layouts/page.njk` |
| `/give/` | `src/content/pages/give.njk` | `layouts/page.njk` |
| `/contact/` | `src/content/pages/contact.njk` | `layouts/page.njk` |
| `/blog/` | `src/content/pages/news.njk` (and any post in `src/content/blog/`) | `layouts/page.njk` |

`layouts/page.njk` builds the top of every inner page (the headline, one sentence, a photograph opening from the gold
line) from the page's front matter, then sets the page's own sections underneath. The front matter fields it reads:
`hero_heading`, `hero_accent` (the words set in gold italics), `hero_subtext`, `eyebrow`, `hero_note` (a few handwritten
words), `hero_image`, `hero_alt` (describe the photo for screen readers), `hero_pos` (which part of the photo to keep when
it is cropped), `hero_tag` (a caption on the photo), and `hero_donate` (adds a Donate now button; the value is the label
used in donation tracking).

## Design direction

The Plan: one house shown two ways on a gold line, a pencil drawing (where Oasis is today) and the real home. Paper
ground, deep pine, and one gold accent that means one thing: funded. Newsreader for headlines, Figtree for text, and a
handwriting face for Keisha's own words.

The home page is the page that moves: scrolling turns the drawing into the home. The inner pages rest. Each opens once
(the gold line draws and the photograph opens out from it), then every section settles in as you reach it. Nothing on
them pins or runs continuously, so they stay light on older phones and laptops.

Accessibility: `:focus-visible` rings sitewide, a skip link, semantic landmarks with `aria-labelledby`, the current page
marked in the menu with `aria-current`, decorative images with empty alt text, full `prefers-reduced-motion` support, and
reveal animations gated behind a `.js` class with a 2.5 second failsafe so **no content can ever be trapped hidden** if
scripts fail.

## Brand

The palette lives in `src/assets/plan.css` under `:root`. Change it once there and it propagates. Do not hardcode hex
values in templates.

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F6ECDF` | page ground (the line drawings carry this color in the file, so they only sit on paper) |
| `--sand` | `#EFE1CF` | alternate band |
| `--rose` | `#F3E2D8` | soft band |
| `--pine` | `#173A33` | headlines, dark bands |
| `--ink` | `#1F2623` | body text |
| `--muted` | `#5B655F` | secondary text |
| `--gold` | `#D9993B` | the gold line, funded items, giving buttons |
| `--gold-deep` | `#9C6618` | gold text where contrast matters |
| `--gold-light` | `#F5C877` | gold on dark bands |

Type: Newsreader (headlines), Figtree (body), Covered By Your Grace (her handwriting), all via Google Fonts.

## Logo files

`src/assets/images/`

- `logo-lockup.svg` — horizontal lockup, nav and light backgrounds
- `logo-lockup-reversed.svg` — cream, for teal and dark backgrounds
- `logo-mark.svg` — mark only, with rays
- `logo-mark-reversed.svg` — mark only, cream
- `favicon.svg` / `favicon.png` — simplified, rays removed so it survives 16px
- `apple-touch-icon.png` — 180x180
- `og-card.png` — 1200x630 social preview

Hand-authored SVG, so no vectorization step is needed. **Before sending the
lockup to a sign shop, embroiderer, or print vendor, outline the type in
Illustrator.** The SVG currently uses live text with a Lora/Georgia fallback
stack, which will substitute fonts on machines without Lora.

## What the CMS edits, and what it does not

The pages are layout-heavy `.njk` templates, so the CMS folder collections (pinned to `extension: "md"`) skip them, and
the **Pages** collection in `/admin/` lists nothing. What Keisha edits in `/admin/` is structured data:

- **Homepage**, then **The Plan (every line of the house)**: the home page's words, the six lines and their prices, the
  funded state, and the "We are here" stage. These also feed the six drawings on the Ways to Give page, so a change in
  one place shows in both.
- **Site Settings**: contact details, the donation link, and the organization's details, which appear in the footer and
  on the Contact and About pages.
- **Board and team**, and **News and updates**.

The words on About, Founder, Programs, Ways to Give and Contact live in their template files. Changing them is a code
change, which keeps the layouts from being broken by accident.

## Imagery

Six environmental photographs in `src/assets/images/photos/`, generated via
OpenAI `gpt-image-1` and converted to WebP. Total page weight for the whole
site is under 750KB.

**No people appear in any image, deliberately.** Fabricated photos of
"residents" on a real nonprofit's site would misrepresent beneficiaries who do
not exist yet. Architecture, interiors, and details only. Replace with real
photography once Keisha has it.

## Deliberate omissions

**No street address anywhere on the site.** This is a residential program and the
registered address is a private residence. City, state, ZIP, phone, email, and
EIN are published. The JSON-LD block in `base.njk` omits `streetAddress` for the
same reason, and the footer and contact page both say why.

**No impact statistics.** The organization is pre-house with zero residents. The
homepage fact strip describes the home being worked toward, and the copy states
plainly that no one has moved in yet. Do not swap these for outcome numbers until
there are real ones.

## Still to wire up

1. ~~GitHub repo~~ — done. `kag-richards/oasis-website`, **public** (a free account needs a public repo for Pages).
2. ~~Decap backend~~ — done. Points at `kag-richards/oasis-website`.
   **Update `backend.repo` if the repo is transferred.**
3. **Decap OAuth** via the Netlify proxy — outstanding. Login will not work
   until this exists.
4. **Keisha as repo collaborator** — outstanding. Without it Decap authenticates
   her and then silently fails to save.
5. ~~GitHub Pages~~ — live as a preview at `kag-richards.github.io/oasis-website/` since 2026-08-09. The custom
   domain file is deliberately left out of the preview build, so her real site is untouched until the DNS cutover.
6. **DNS at GoDaddy** — blocked on 2FA. Full change set, including the Google
   Workspace MX records that must survive, is in `../DNS-CUTOVER.md`.
5. **Stripe**: Keisha creates the account so payouts are in her name. Paste the
   checkout link into Site Settings > Donation Link in `/admin/`. Until then the
   give page falls back to an email link automatically.
6. **Photos**: only asset in hand is her LinkedIn headshot. Hero currently runs
   without a background image, which is fine, but a real photo would lift it.

## The Plan home page (built 2026-10-27)

The home page is one house shown two ways on a gold line: a pencil and watercolor drawing (where Oasis is today) and the
real home. Scrolling turns the drawing into the home, and every gift fills in a line.

**What Keisha edits, in `/admin/` under Homepage, then "The Plan (every line of the house)":**
- **Lines**: each piece of the house a donor can fund. Title, text, her handwritten words, a **Price**, and a **Funded**
  checkbox. Leave Price empty and the page shows "Price being quoted". Never enter a number that is not a real quote.
  Tick Funded when a line is paid for: it turns gold and the Fund button hides.
- **We are here**: the stage name on the gold line, and the "We are here" tick on one of the four phases. Move both as
  Oasis moves forward (for example: the lease signed).
- **Hero words**, the four phases, and the small print.

**Files**
- `src/_includes/layouts/plan.njk`, `src/assets/plan.css`, `src/assets/plan.js`: the page, its look and its motion.
- `src/assets/images/plan/`: the house drawing and photos, the six line drawings, and `frames/1280` and `frames/720`
  (96 frames each, taken from one 10 second video of the drawing becoming the home). To change the video, re-export 96
  frames at those two widths with the same numbering (`f001.webp` to `f096.webp`).
- The inner pages: `src/_includes/layouts/page.njk` (wraps `plan.njk`), `src/assets/plan-inner.css` and `plan-inner.js`. The
  contact form's script is `src/assets/plan-form.js`; it posts to the Oasis workspace and falls back to the email address.
- No longer used, safe to delete once the new pages are approved: `layouts/base.njk`, `layouts/home.njk`, `partials/`,
  `src/assets/site.css` and `src/assets/site.js`.

**Keep it fast.** The page does not run a frame loop, and it avoids full-screen blends, backdrop blurs and CSS variables
set on big containers, because those made scrolling stall on older laptops. Before adding an effect, scroll the page on a
slow machine. The frame images are the heaviest files (about 8 MB on a desktop); halving the frame count is the first
thing to try if the page needs to be lighter.

## Open questions for Keisha

See `../../CONFIRM-WITH-KEISHA.md`.
