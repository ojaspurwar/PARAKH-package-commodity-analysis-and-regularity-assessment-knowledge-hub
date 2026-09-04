# STAGE 0 — Bootstrap prompt (paste this once, first)

Paste everything below the line into Antigravity as your very first message.
It tells the agent to write the rules files to disk itself, so nothing depends
on you transferring files across AnyDesk.

After it finishes, run Stage 1 onwards from `PROMPTS.md` as normal.

---

Before you do anything else: create two files in this repo, with exactly the
content given below. Do not summarise, abbreviate, reformat or "improve" them —
copy them verbatim. Do not modify any backend, API route, schema or server file
at any point in this project; the backend is finished and this is a frontend
rebuild only.

Once both files exist, read `AGENTS.md` back from disk end to end, confirm you
have it, and then stop and wait. Do not write any page markup in this step.

---

## File 1 — create at repo root: `AGENTS.md`

````markdown
# AGENTS.md — Frontend Design Rules (read before writing any UI code)

These rules are binding for every UI file in this repo. The backend is already
finished; do not modify API contracts, routes, schemas, or server code. This is a
**frontend / UI-UX rebuild only**.

Reference screenshots live in `/reference/`. Look at them before you build.

---

## 1. What we are building

A **citizen-facing electoral services portal**. Visual language is inspired by
`voters.eci.gov.in` (ECINET Citizen Service Portal) — a dense, high-trust,
colour-coded government service directory. It must feel official and calm, not
like a startup landing page.

Audience: ordinary Indian citizens, many on low-end Android phones, many not
fluent in English, many over 50. Clarity beats cleverness every time.

---

## 2. Hard exclusions — do not build these

- **No right-hand "SERVICES" sidebar.** See `/reference/05-EXCLUDE-do-not-build-this-column.png`.
  The reference site has a two-column split (FORMS left / SERVICES right). We use
  a **single-column, full-width flow only.** Every service that lived in that
  sidebar becomes a normal section further down the page instead.
- No hero with a stock photo of a crowd or a flag.
- No dark mode toggle unless explicitly asked for.
- No chatbot bubble, no floating action button.
- No carousel/slider for primary content.

---

## 3. Layout: full-bleed bands, wide container

**Do not** wrap the whole page in a narrow `max-w-5xl mx-auto` with big empty
white margins on both sides. That is the default we are rejecting.

Instead:

- Every section is a **full-bleed band**: its background colour runs edge to edge,
  100vw, no gutters.
- Inside each band, content sits in a **wide** container:
  `width: min(100% - 2 * var(--gutter), 1560px); margin-inline: auto;`
  with `--gutter: clamp(20px, 4vw, 72px);`
- Bands alternate background tint so the page reads as stacked slabs, not as one
  white sheet with floating cards.
- Card grids: 12-column grid, `gap: 20px`. Form cards are 6 columns on desktop
  (two-up), 12 on tablet and below.
- Body copy inside a card is capped at ~68 characters per line. The container is
  wide; the *text* is not.

Breakpoints: `480 / 768 / 1024 / 1280 / 1600`.

---

## 4. Typography — use exactly these families

Load from Google Fonts. **Do not substitute.**

| Role | Family | Weights |
|---|---|---|
| Headings, section bars, buttons, card titles | **Plus Jakarta Sans** | 500, 600, 700, 800 |
| Body, labels, helper text, tables | **Noto Sans** | 400, 500, 600, 700 |
| All Hindi / Devanagari text | **Noto Sans Devanagari** | 400, 600, 700 |
| Identifiers only: EPIC numbers, application reference IDs, form numbers | **IBM Plex Mono** | 500 |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
```

**Banned typefaces** (these are the "basic default" look we are replacing):
Inter, Poppins, Montserrat, Open Sans, Lato, Raleway, Nunito, bare `system-ui`,
Arial, Helvetica as a primary face.

IBM Plex Mono is for **actual alphanumeric identifiers only** — never for small
caps labels, never for eyebrow text, never for section headers.

### Type scale (1.250 major third, 16px base)

| Token | Size / line-height | Usage |
|---|---|---|
| `--fs-display` | `clamp(32px, 3.2vw, 44px) / 1.15` | Page title |
| `--fs-h1` | `31px / 1.2` | Band heading |
| `--fs-h2` | `25px / 1.25` | Sub-band heading |
| `--fs-h3` | `20px / 1.3` | Card title |
| `--fs-body` | `16px / 1.6` | Default |
| `--fs-sm` | `14px / 1.5` | Helper, meta |
| `--fs-xs` | `13px / 1.45` | Legal, footnote |

Headings: `font-weight: 700`, `letter-spacing: -0.015em`.
Body: `font-weight: 400`, `letter-spacing: 0`.

### Typographic bans

- No `text-transform: uppercase` on labels or eyebrows.
- No accenting a single word of a headline in a different colour or italic.
- No `→` glyph appended to button or link text. Use a real icon element, or nothing.
- No `A · B · C` middle-dot meta strings.
- Sentence case for every button, heading, and label. Not Title Case, not ALL CAPS.
  The exception is the band header word itself (e.g. "Forms"), which is sentence case too.

---

## 5. Colour — sampled from the reference site

```
Brand
--brand-700  #3D2A93   pressed / dark bar
--brand-600  #5138B8   primary band header, primary button   ← the signature colour
--brand-100  #E7E2FA   brand tint background
--brand-050  #F3F0FD

Surface
--bg-page    #FAFAFA   base page
--bg-band    #FFFFFF   alternating band
--bg-sunken  #F1F1F4   footer / sunken band
--border     #E2E2E7   hairline

Text
--text       #1E1F24
--text-muted #55565E
--text-invert #FFFFFF
--link       #253E81
--link-hover #1447E6

Status
--success    #2E7D0E
--success-cta #32BB49
--warning    #B26A00
--danger     #C62430
--info       #176F73
```

### Category card palette (the ECI "colour-coded card" idea, cleaned up)

Each service category gets a `{tint background, saturated border, deep action colour}`
triplet. Use these six and no others. Never invent a seventh.

| Category | Tint bg | Border | Action / button |
|---|---|---|---|
| Rose — SIR / urgent notices | `#FADFE4` | `#A03441` | `#C62430` |
| Pink — new registration | `#F8DFF5` | `#C462AD` | `#80376C` |
| Cyan — overseas / NRI | `#E5F7FB` | `#46AAC1` | `#14618C` |
| Green — corrections & appeals | `#DFFEC5` | `#4CA320` | `#2E7D0E` |
| Amber — migrant / special forms | `#FBE0C4` | `#C9750F` | `#8A4C05` |
| Violet — downloads & records | `#EFE6FE` | `#7C4DD1` | `#4B2FA0` |

Rules:
- Tint is the card background. Border is `1.5px solid`. Action colour is the
  filled button *and* the icon colour.
- Colour encodes **category**, not decoration. Two cards of the same category are
  the same colour. Never randomise.
- Every colour pairing must clear WCAG AA (4.5:1) for body text on tint.
- No gradients anywhere except the single band header bar (a flat
  `--brand-600` is also acceptable and preferred).
- No `rgba(0,0,0,0.1)` drop shadow under every card. Cards are defined by border
  + tint, not by shadow.

### Radii & elevation

```
--r-sm  6px    inputs, chips, small buttons
--r-md  10px   buttons, form fields
--r-lg  14px   cards
--r-xl  18px   band header bar, feature blocks
```
Do not use one radius for everything. Shadows: only two levels, both subtle —
`--sh-1: 0 1px 2px rgba(30,31,36,.06)` and
`--sh-2: 0 8px 24px rgba(61,42,147,.10)` (hover / open menus only).

### Spacing scale

`4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96` px. Nothing else.
Band vertical padding: `clamp(48px, 6vw, 96px)`.

---

## 6. Motion — restrained, one signature moment

The site should feel alive but must not read as AI-generated. That means **one**
orchestrated moment, not a fade-and-slide on every section.

**The one signature moment:** on first paint, the band header bar draws in — it
wipes from left to right (`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`,
520ms, `cubic-bezier(.22,.61,.36,1)`), and the cards beneath it settle in with a
40ms stagger, 12px rise, opacity 0→1, 380ms. This happens **once**, on the
first band only. Subsequent bands appear normally on scroll with no entrance
animation.

Everything else is **response motion** — it only fires from a user action:

- Card hover: border colour deepens one step, `translateY(-2px)`, 160ms ease-out.
  No scale, no shadow bloom.
- Button press: `scale(.98)`, 90ms.
- Accordion / dropdown: height + opacity, 220ms.
- Form field focus: 2px `--brand-600` ring, 120ms.
- Page/route change: 180ms cross-fade only.

Hard rules:
- Wrap everything in `@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition-duration: .01ms !important; } }`
- No parallax. No scroll-jacking. No animated gradient blobs. No marquee except a
  single genuine notice ticker if the content is real notices (pause on hover, and
  it must be keyboard-reachable).
- No counting-up number animations.

---

## 7. Content structure (single column, top to bottom)

1. **Utility bar** — thin `--brand-600` strip: language switch (English / हिन्दी),
   text-size A− A A+, high-contrast toggle, skip-to-content link.
2. **Masthead** — logo lockup left, Hindi + English portal name, app store badges
   right. White, `--border` bottom hairline.
3. **Priority notice band** — the SIR-2026 block. Rose category. Three primary
   actions stacked on mobile, inline on desktop.
4. **Forms band** — the colour-coded card grid, two-up. This is the heart of the page.
5. **Services band** — everything that was in the excluded right sidebar, laid out
   as a full-width grid: download electoral roll, track application status, e-EPIC
   download, search your name, book a call with BLO, submit appeal, register complaint.
6. **Updates band** — elections, results, reports.
7. **About & help band** — about ECI, FAQs, contact, external links.
8. **Footer** — sunken band, four link columns, copyright, accessibility statement.

Every card follows the same anatomy:
`icon (40px, circular tint well) · title · one-sentence description · action row`.
The action row holds at most one filled button plus text links.

---

## 8. Copy rules

- Active voice. Buttons say what happens: "Fill Form 6", not "Submit".
- An action keeps its name across the whole flow. "Fill Form 6" → confirmation
  reads "Form 6 filled".
- Describe, don't sell. "Get a digital copy of your voter ID card", not
  "Seamlessly access your credentials".
- Errors state what happened and what to do next. They do not apologise.
- Empty states are an invitation to act, not a mood.
- Keep every English string mirrored in Hindi in the i18n file.

---

## 9. Accessibility floor (non-negotiable)

- Visible keyboard focus ring on every interactive element (`2px solid --brand-600`,
  `outline-offset: 2px`). Never `outline: none` without a replacement.
- Semantic landmarks: `header`, `nav`, `main`, `footer`, one `h1` per page,
  no heading levels skipped.
- All icons decorative → `aria-hidden="true"`; meaningful icons get labels.
- Target size minimum 44×44px.
- Colour is never the only carrier of meaning — pair it with a label or icon.
- Test at 200% browser zoom and at 320px width; nothing may clip or overlap.

---

## 10. Self-check before you say you are done

Run through this list and fix anything that fails:

- [ ] No right-hand services sidebar anywhere.
- [ ] Bands are full-bleed; no permanent white gutters flanking the whole page.
- [ ] Plus Jakarta Sans + Noto Sans are actually loading (check DevTools, not just the CSS).
- [ ] Zero uppercase labels, zero `→` in button text, zero single-word headline accents.
- [ ] Exactly one entrance animation sequence on the page, on first band only.
- [ ] Every card colour maps to a category from the table, not to visual variety.
- [ ] Reduced-motion query present and working.
- [ ] Keyboard-only pass: can reach and operate every control, focus always visible.
- [ ] 320px viewport: no horizontal scroll.
- [ ] Take a screenshot of the result and compare it side by side with
      `/reference/02-form-cards-grid.png`. If the density and colour-coding do not
      read as clearly as the reference, tighten it.
````

---

## File 2 — create at: `src/styles/tokens.css`

(If this project uses a different styles directory, put it there instead and
tell me the path you used.)

````css
/* tokens.css — drop into src/styles/ and import first.
   Palette sampled from voters.eci.gov.in reference capture. */

:root {
  /* ---- Type ---- */
  --font-heading: "Plus Jakarta Sans", "Noto Sans", sans-serif;
  --font-body:    "Noto Sans", "Noto Sans Devanagari", sans-serif;
  --font-hi:      "Noto Sans Devanagari", "Noto Sans", sans-serif;
  --font-id:      "IBM Plex Mono", ui-monospace, monospace; /* EPIC / ref numbers ONLY */

  --fs-display: clamp(32px, 3.2vw, 44px);
  --fs-h1: 31px;
  --fs-h2: 25px;
  --fs-h3: 20px;
  --fs-body: 16px;
  --fs-sm: 14px;
  --fs-xs: 13px;

  --lh-tight: 1.15;
  --lh-heading: 1.25;
  --lh-body: 1.6;
  --ls-heading: -0.015em;

  /* ---- Brand ---- */
  --brand-700: #3D2A93;
  --brand-600: #5138B8;
  --brand-100: #E7E2FA;
  --brand-050: #F3F0FD;

  /* ---- Surface ---- */
  --bg-page:   #FAFAFA;
  --bg-band:   #FFFFFF;
  --bg-sunken: #F1F1F4;
  --border:    #E2E2E7;

  /* ---- Text ---- */
  --text:        #1E1F24;
  --text-muted:  #55565E;
  --text-invert: #FFFFFF;
  --link:        #253E81;
  --link-hover:  #1447E6;

  /* ---- Status ---- */
  --success:     #2E7D0E;
  --success-cta: #32BB49;
  --warning:     #B26A00;
  --danger:      #C62430;
  --info:        #176F73;

  /* ---- Category triplets: {tint, border, action} ---- */
  --cat-rose-bg:   #FADFE4;  --cat-rose-br:   #A03441;  --cat-rose-ac:   #C62430;
  --cat-pink-bg:   #F8DFF5;  --cat-pink-br:   #C462AD;  --cat-pink-ac:   #80376C;
  --cat-cyan-bg:   #E5F7FB;  --cat-cyan-br:   #46AAC1;  --cat-cyan-ac:   #14618C;
  --cat-green-bg:  #DFFEC5;  --cat-green-br:  #4CA320;  --cat-green-ac:  #2E7D0E;
  --cat-amber-bg:  #FBE0C4;  --cat-amber-br:  #C9750F;  --cat-amber-ac:  #8A4C05;
  --cat-violet-bg: #EFE6FE;  --cat-violet-br: #7C4DD1;  --cat-violet-ac: #4B2FA0;

  /* ---- Radius ---- */
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;
  --r-xl: 18px;

  /* ---- Elevation (only two levels) ---- */
  --sh-1: 0 1px 2px rgba(30, 31, 36, .06);
  --sh-2: 0 8px 24px rgba(61, 42, 147, .10);

  /* ---- Spacing ---- */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 24px; --s-7: 32px; --s-8: 40px;
  --s-9: 56px; --s-10: 72px; --s-11: 96px;

  /* ---- Layout ---- */
  --gutter: clamp(20px, 4vw, 72px);
  --container: 1560px;
  --band-y: clamp(48px, 6vw, 96px);

  /* ---- Motion ---- */
  --ease-out: cubic-bezier(.22, .61, .36, 1);
  --t-fast: 120ms;
  --t-base: 180ms;
  --t-slow: 380ms;
}

/* Full-bleed band + wide inner container. This is the layout rule that
   replaces the narrow centred column with white gutters. */
.band {
  width: 100%;
  padding-block: var(--band-y);
  background: var(--bg-page);
}
.band--alt    { background: var(--bg-band); }
.band--sunken { background: var(--bg-sunken); }

.container {
  width: min(100% - 2 * var(--gutter), var(--container));
  margin-inline: auto;
}

/* Grid */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--s-5);
}

/* Focus */
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--brand-600);
  outline-offset: 2px;
  border-radius: var(--r-sm);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
````

---

## Reference: what the source design looks like

I am also placing screenshots in `/reference/`. Look at them. If they are not
there yet, ask me for them before starting Stage 1 — do not build from this
description alone if images are available.

The source is `voters.eci.gov.in`, the ECINET Citizen Service Portal. Its
structure, top to bottom:

- A thin violet strip across the very top, social icons right-aligned.
- A white masthead: logo lockup left, portal name in Hindi above English,
  Google Play and App Store badges right, hairline bottom border.
- Below that the page splits into two columns: a wide left column headed
  "FORMS" and a narrow right column headed "SERVICES". **We are deleting that
  right column.** Everything in it becomes a full-width band lower down our page.
- Each column opens with a solid violet slab as its header — rounded top
  corners, white sentence-case label, roughly 56px tall.
- Inside the FORMS column, first is a priority block for "Special Intensive
  Revision (SIR) – 2026": rose tint background, crimson 1.5px border, a circular
  icon well at top left, then three full-width action buttons stacked and
  centred — green, teal, violet — each around 48px tall.
- Then a two-up card grid. Every card is: pastel tint background, saturated
  1.5px border in a deeper shade of the same hue, ~10px radius, a 48px white
  circular icon well at top left with a thin coloured ring, a bold title, a
  one-or-two-line grey description, and an action row holding filled pill
  buttons plus plain text links ("Download" with a download glyph,
  "Guidelines" with an outbound glyph). Cards in a row are equal height.
- Colour is category coding, not decoration — registration is pink, NRI is
  cyan, deletion is rose, corrections are green, migrant forms are amber,
  downloads are violet.
- The grid ends with a full-width pale green banner carrying a single download
  link and a small red "New" badge pinned top right.
- Below the columns: an "Updates" panel (pale green, wide) and an "About"
  panel (pale pink, narrow).

The source renders in a plain humanist grotesque. We are **not** copying its
typography — use Plus Jakarta Sans and Noto Sans as specified in `AGENTS.md` §4.

What we are taking from the source: the information density, the six-colour
category system, the slab section headers, and the card anatomy. What we are
leaving behind: the two-column split, the narrow centred layout, and the
generic type.
