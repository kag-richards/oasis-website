# Oasis Women Center — website

11ty + Decap CMS + GitHub Pages, forked from `dcdc-static-cms-starter`.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # outputs to _site/
```

## Pages

| URL | Source |
|---|---|
| `/` | `src/content/pages/index.njk` |
| `/about/` | `src/content/pages/about.md` |
| `/programs/` | `src/content/pages/programs.md` |
| `/give/` | `src/content/pages/give.njk` |
| `/contact/` | `src/content/pages/contact.md` |
| `/blog/` | `src/content/pages/news.njk` |

## Design direction

Dark editorial base with layered gradients, an animated sunrise glow, and three
tiling water layers at the hero base. Modeled on the draftclicks.com system
(dark ground, gradient-heavy, `fade-in-up` scroll reveals, glass surfaces) and
translated into Oasis's warm palette. Not the APED template.

Type: **Fraunces** (serif display, gradient italic accents) and **Inter** (UI/body).

Interaction: IntersectionObserver scroll reveals, count-up statistics, an
animated campaign progress bar, hover lift with gradient top-accent on cards,
a scroll-aware glass nav.

Accessibility: `:focus-visible` rings sitewide, skip link, semantic landmarks
with `aria-labelledby`, `role="progressbar"` with live values, decorative SVG
marked `aria-hidden`, full `prefers-reduced-motion` support, and reveal
animations gated behind a `.js` class with a 2.5s failsafe so **no content can
ever be trapped at `opacity: 0`** if scripts fail.

## Brand

Palette lives in `src/assets/site.css` under `:root`. Change it once there and it
propagates. Do not hardcode hex values in templates.

| Token | Hex | Use |
|---|---|---|
| `--teal` | `#46686A` | headings, body emphasis, the mark |
| `--teal-deep` | `#2F4A4C` | footer |
| `--sage` | `#A2AD61` | eyebrows, card rules |
| `--sage-light` | `#BDCD6B` | pillar numbers |
| `--gold` | `#E8B15F` | the sun, primary buttons |
| `--gold-deep` | `#C6913F` | gold text where contrast matters |
| `--blue-soft` | `#BCD1E2` | quiet accents |
| `--cream` | `#FAF6EA` | page background |
| `--blush` | `#EFC4BB` | sparing warmth |

All nine sampled from the organization's original logo.

Type: Lora (serif headings), Source Sans 3 (body), both via Google Fonts.

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

## Why some pages are .njk and not .md

Home, Ways to Give, and News are `.njk`. They are layout-heavy, and running them
through markdown-it wrapped grid children in `<p>` tags, which silently broke the
two-column grids and produced invalid `<p><div>` nesting. About, Programs, and
Contact stay as `.md` because they are prose, which is what Keisha should be
editing anyway.

**CMS handled.** Folder collections are pinned to `extension: "md"`, so the
`.njk` pages are excluded automatically. The homepage is exposed instead as a
**file collection of structured fields** backed by `src/content/_data/home.json`
— badge, headline parts, opening paragraph, progress card, the four key numbers,
the five milestones, and the honesty note. Keisha edits words and numbers; the
layout is never an editable body, so she cannot delete a grid by accident.

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

1. ~~GitHub repo~~ — done. `kag-richards/oasis-website`, private.
2. ~~Decap backend~~ — done. Points at `kag-richards/oasis-website`.
   **Update `backend.repo` if the repo is transferred.**
3. **Decap OAuth** via the Netlify proxy — outstanding. Login will not work
   until this exists.
4. **Keisha as repo collaborator** — outstanding. Without it Decap authenticates
   her and then silently fails to save.
5. **GitHub Pages** — outstanding, and gated on Keisha approving the content.
   Enabling it publishes her EIN, phone, and organization name at a public URL.
   Pages on a free account also requires the repo to be public.
6. **DNS at GoDaddy** — blocked on 2FA. Full change set, including the Google
   Workspace MX records that must survive, is in `../DNS-CUTOVER.md`.
5. **Stripe**: Keisha creates the account so payouts are in her name. Paste the
   checkout link into Site Settings > Donation Link in `/admin/`. Until then the
   give page falls back to an email link automatically.
6. **Photos**: only asset in hand is her LinkedIn headshot. Hero currently runs
   without a background image, which is fine, but a real photo would lift it.

## Open questions for Keisha

See `../../CONFIRM-WITH-KEISHA.md`.
