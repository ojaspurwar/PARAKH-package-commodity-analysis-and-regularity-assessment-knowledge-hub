# AGENTS.md — PARAKH portal design specification

Binding for every UI file in this repo. Read fully before writing any UI code.

**Do not modify any backend file, API route, schema, controller or model.** The
backend is complete. This is a frontend rebuild only. If a change appears to
require a backend edit, stop and say so instead of doing it.

Reference screenshots are in `/reference/`. Open them before you build:
- `01-header-and-sir-block.png` — masthead, indigo slab header, priority block
- `02-form-cards-grid.png` — the card grid, card anatomy, action rows
- `03-form-m-12c-and-banner.png` — lower cards and the full-width banner
- `04-updates-and-about.png` — secondary bands
- `05-EXCLUDE-do-not-build-this-column.png` — the right sidebar we are **not** building

---

## 1. The product

PARAKH is a Legal Metrology enforcement portal. An officer captures a packaged
retail product; the system extracts declared label information and checks it
against the Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6 mandatory
declarations, Rule 7 principal display panel and font sizing, net quantity, MRP,
unit sale price, country of origin, consumer care details.

Sections: field scanner, supervisor overview, products repository, online
products, statutory documents.

Users are trained government inspectors on laptops and mid-range Android phones,
often in a market with patchy network. They know what the tool does. They need
speed and a record that survives challenge.

---

## 2. Design target

Reproduce the visual language of `voters.eci.gov.in` (ECINET Citizen Service
Portal) — a Government of India citizen portal. Specifically:

- Indigo slab section headers with rounded top corners
- Pastel-tinted cards with saturated same-hue borders and circular icon wells
- Colour used as category coding, never as decoration
- Bilingual masthead with a national emblem lockup
- High information density; no whitespace-heavy marketing layout
- **No hero section anywhere.** The ECI homepage opens straight into content.
  So does ours.

We are not copying ECI's page content, only its visual system.

---

## 3. Defects in the current build — remove all of these

The existing UI is competent but generic. Each item is a specific defect.

1. **Marketing heroes on internal pages.** "Inspect with confidence. / Record
   what matters." and "Bring the shelf / to your desk." Delete every hero. Pages
   open with a slab header and content.
2. **Second headline line in a different colour.** Amber on one page, green on
   another. Headlines are one colour.
3. **Tracked-out uppercase mono eyebrows.** "FIELD DESK", "CAPTURE DESK",
   "LOCAL REGISTER", "SUPERVISOR CONSOLE / TODAY", "EVIDENCE STREAM",
   "ENFORCEMENT SIGNAL", "ONLINE MARKETPLACE DESK", "01 / SOURCE". Delete all.
4. **Numbered markers** ("01 / SOURCE") on content that is not a sequence.
5. **Middle-dot meta strings.** "JAIPUR • 04 SEPT 2026", "Electrical goods ·
   New Delhi Central District". Use labelled fields instead.
6. **Arrow glyphs in text.** "Open supervisor view →", "New scan ↗". ECI uses a
   small outbound-arrow *icon element* after link text. Use that, never the
   character inside the string.
7. **Uniform SaaS cards.** Everything is an identical white rounded card with the
   same grey shadow. In ECI, cards are defined by tint and border, and lists are
   not cards at all.
8. **Big-number stat cards** ("5 / Records in repository", "40% / Compliance
   rate"). Five records is not a statistic. Show the work queue.
9. **Dark navy sidebar with amber accent.** Replaced by the masthead and indigo
   nav bar in section 6.

---

## 4. Typography

One text family plus one mono. Noto Sans is the Government of India standard
face, is what the reference portal renders in, and carries a full Devanagari
sibling so the Hindi toggle never falls back.

| Role | Family | Weights |
|---|---|---|
| All headings, UI, body, labels | **Noto Sans** | 400, 500, 600, 700 |
| Hindi | **Noto Sans Devanagari** | 400, 600, 700 |
| Identifiers and measured values only | **IBM Plex Mono** | 400, 500 |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Banned:** Inter, Poppins, Montserrat, Open Sans, Lato, Nunito, Raleway, bare
`system-ui`, Arial, Helvetica as a primary face.

**Mono is permitted only for:** LM record codes (`LM-861635`), batch and lot
numbers, declared and measured quantities (`500 g`), prices (`₹ 249.00`),
Rule 7 font-height measurements, and timestamps. Always with
`font-variant-numeric: tabular-nums`.

**Mono is banned for:** eyebrows, section labels, button text, nav items, badges,
prose. This is the most frequent misuse in the current build.

### Type scale (16px base)

| Token | Size / line-height | Use |
|---|---|---|
| `--fs-slab` | `20px / 1.3` | Text inside an indigo slab header |
| `--fs-h1` | `26px / 1.25` | Page title |
| `--fs-h2` | `20px / 1.3` | Section heading |
| `--fs-h3` | `16px / 1.4` | Card title |
| `--fs-body` | `15px / 1.6` | Default |
| `--fs-sm` | `14px / 1.5` | Field labels, table cells |
| `--fs-xs` | `12px / 1.45` | Rule citations, footnotes |

Headings 600, `letter-spacing: -0.008em`. Slab header text 600, white, no
letter-spacing. Sentence case everywhere except proper nouns, rule citations and
the `LM-` prefix.

Prose capped at 68 characters. Statutory text in the documents section may run to
78 with extra leading, since it is read continuously.

### Banned typographic treatments

- `text-transform: uppercase` on any label, eyebrow or button.
- Any single word or line of a headline in a different colour or italic.
- `→` or `↗` characters inside link or button strings.
- `A · B · C` middle-dot meta strings.

---

## 5. Colour — sampled from the reference portal

```
Institutional
--indigo-700  #3D2A93   pressed states
--indigo-600  #5138B8   slab headers, nav bar, utility strip, primary button
--indigo-100  #E7E2FA
--indigo-050  #F3F0FD

Surface
--bg-page     #FAFAFA
--bg-panel    #FFFFFF
--bg-sunken   #F1F1F4
--border      #E2E2E7

Text
--text        #1E1F24
--text-muted  #55565E
--link        #253E81
--link-hover  #1447E6
```

### The six category triplets — {tint, border, action}

Every card, badge and status in the app draws from these six and no others.
Never invent a seventh, never randomise, never use one for decoration.

| Category | Meaning in PARAKH | Tint | Border | Action |
|---|---|---|---|---|
| Rose | Violation, enforcement action, urgent | `#FADFE4` | `#A03441` | `#C62430` |
| Green | Compliant, verified, passed check | `#DFFEC5` | `#4CA320` | `#2E7D0E` |
| Amber | Needs review, pending, incomplete | `#FBE0C4` | `#C9750F` | `#8A4C05` |
| Cyan | Field capture, scanning, live tools | `#E5F7FB` | `#46AAC1` | `#14618C` |
| Violet | Repository, records, exports, downloads | `#EFE6FE` | `#7C4DD1` | `#4B2FA0` |
| Pink | Statutory reference, rules, help | `#F8DFF5` | `#C462AD` | `#80376C` |

Rules:
- Tint is the card background. Border is `1.5px solid`. Action colour is both the
  filled button and the icon inside the icon well.
- Compliance status is never colour alone. Always colour plus glyph plus word:
  a check and "Compliant", a cross and "Violation", a dot and "Needs review".
- Every tint must clear 4.5:1 against `--text`.
- No gradients. No coloured shadows. No decorative tints.
- The old amber `#F5C13D` is gone. Amber now means one thing: needs review.

### Radius, elevation, spacing

```
--r-sm  6px    badges, chips, pill buttons, inputs
--r-md 10px    cards, priority blocks, banners
--r-lg 14px    slab headers (top corners only) and the panel that follows them
```
Two shadow levels only: `--sh-1: 0 1px 2px rgba(30,31,36,.06)` on the white panel,
`--sh-2: 0 8px 24px rgba(61,42,147,.10)` on popovers and the verdict panel.
Cards get **no** shadow — they are defined by tint plus border. Table rows get no
shadow either; they are separated by `--border` rules.

Spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 56, 72`. Nothing else.

---

## 6. Layout — replace the sidebar with the ECI portal shell

Delete the dark navy sidebar. The page becomes a stack of full-bleed bands, which
is what makes a site read as a government portal.

**Every band runs edge to edge at 100vw.** Inside each band, content sits in
`width: min(100% - 2 * var(--gutter), 1560px); margin-inline: auto;` with
`--gutter: clamp(16px, 3vw, 56px)`. There must be no permanent white gutter
flanking the whole page.

Top to bottom:

1. **Utility strip** — 28px, `--indigo-600`, full bleed. Right-aligned: skip to
   content (visible on focus), text size A− A A+, high contrast toggle, language
   toggle (English / हिन्दी).
2. **Masthead** — 76px, white, `--border` bottom hairline. Left: national emblem
   plus the PARAKH mark, then a vertical rule, then the portal name in Devanagari
   above English ("वैध मापविज्ञान प्रवर्तन पोर्टल" / "Legal Metrology Enforcement
   Portal"). Right: officer identity and district.
3. **Navigation bar** — 48px, `--indigo-600`, full bleed, sticky on scroll. Six
   items in sentence case: Field scanner, Supervisor view, Products repository,
   Online products, Statutory documents, Reports. Active item carries a 3px white
   bottom rule and a `--indigo-700` fill. Collapses to a hamburger drawer below
   860px.
4. **Content bands** — one or more per page, each opening with a slab header.
5. **Footer** — `--bg-sunken` band, four link columns, ministry attribution,
   accessibility statement, last-updated date.

Grids are 12-column with a 16px gutter. Card grids are two-up on desktop and
one-up below 860px. Detail views split 8/4 — evidence left, verdict right.

---

## 7. Component specifications

Match the reference screenshots. Measurements are exact.

### Slab header

Full width of its container. `--indigo-600` background, `border-radius: 14px 14px
0 0`, height 54px, `padding-inline: 24px`, white text at `--fs-slab`, weight 600,
vertically centred, left aligned. It sits flush on top of a white panel with
`border-radius: 0 0 14px 14px`, `--sh-1`, and 16px internal padding.

Each page has one slab header naming that page's function.

### Priority block

Used for the highest-urgency item on a page. Category tint background, `1.5px`
category border, `--r-md`, 20px padding. A 56px circular icon well at top left
(white fill, `1.5px` category ring, category-coloured glyph). Title at `--fs-h3`.
Then up to three primary actions, each full width of the block's inner column,
46px tall, `--r-sm`, white 600-weight label, stacked with 8px gaps and centred.

### Category card

Tint background, `1.5px` category border, `--r-md`, 20px padding, no shadow.
Anatomy in fixed order:

1. 56px circular icon well, top left — white fill, `1.5px` category ring,
   category-coloured glyph inside.
2. Title, `--fs-h3`, weight 600.
3. Description, `--fs-body`, `--text-muted`, one or two lines, never more.
4. Action row: at most one filled pill button (category action colour, `--r-sm`,
   32px tall, 14px horizontal padding, white 500-weight label, small outbound
   icon element after the label) plus plain text links in `--link` at `--fs-sm`,
   each with a leading icon (download glyph for downloads, outbound glyph for
   external).

Cards in the same row are equal height — use CSS grid, never flex hacks.

### Data table

Lists of records are tables, not cards. `--bg-panel`, `--border` row rules,
`--bg-sunken` header row, `--fs-sm`, 40px row height, no shadow, no radius on
rows. Numeric and identifier columns use mono with tabular figures and are right
aligned. The status column uses a category badge: category tint, `1.5px` category
border, `--r-sm`, glyph plus word. Row hover fills `--indigo-050`.

### Wide banner

Full width of the panel, category tint, `1.5px` category border, `--r-md`, 56px
tall, icon left, single-line label, action on the right. An optional `New` badge
in `--r-sm` rose sits pinned to the top-right corner. Use sparingly — at most one
per page.

### Verdict panel — the most important component

When a package is checked, this is the result. Build it carefully.

1. **Status band** — full panel width, category tint and border for the overall
   verdict, the status word at `--fs-h2`, and the count of failed checks.
2. **Declaration checklist** — one row per Rule 6 requirement: identity,
   manufacturer/packer/importer, country of origin, net quantity, date marking,
   retail sale price, unit sale price, consumer care. Each row shows the
   requirement name, the value found on the package, a status badge, and the rule
   citation at `--fs-xs`. Failed rows sort to the top; passed rows collapse into
   one expandable "6 checks passed" summary.
3. **Rule 7 font-size check** — a measured comparison, not another card with two
   numbers. Show the required minimum height for the net-quantity band beside the
   measured height, in mono, with a real scale bar drawn to proportion. **This is
   the one place in the entire app where a bold custom visual is justified.**
   Spend the design effort here and nowhere else.
4. **Evidence** — the captured image with the principal display panel outlined,
   and a timestamp in mono.
5. **Actions** — record the finding, flag for review, export the evidence sheet.

---

## 8. Motion

One signature moment, and it belongs to the verdict. Motion answers the officer's
action; it is not a page-load performance.

**The signature:** when a check resolves, the verdict status band fills from left
to right over 420ms `cubic-bezier(.22,.61,.36,1)`, then failed checklist rows
stagger in at 45ms intervals with a 6px rise. Passed rows appear without
animation. Fires once per check, on the verdict only.

Response motion elsewhere:
- Card hover: border darkens one step, `translateY(-2px)`, 160ms. No scale, no
  shadow bloom.
- Table row hover: background fill only, 120ms.
- Button press: `scale(.985)`, 90ms.
- Accordion, drawer, popover: height and opacity, 200ms.
- Focus: 2px `--indigo-600` ring, `outline-offset: 2px`, instant.
- Scanning: one indeterminate progress rule in the cyan action colour. No
  spinner, no pulsing card, no skeleton shimmer everywhere.
- Route change: 150ms cross-fade of the content bands only. Masthead and nav
  never animate.

Banned: entrance animations on page sections, scroll-triggered reveals, parallax,
counting-up numbers, animated gradients, hover lift on every card.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

---

## 9. Copy

- Active voice, sentence case, no marketing tone, no exclamation marks.
- Buttons name the outcome: "Record finding", "Flag for review", "Export evidence
  sheet". Never "Submit", never "Get started".
- An action keeps its name through the flow: "Record finding" produces "Finding
  recorded".
- Cite the rule wherever a verdict is stated, so the officer can defend it:
  "Net quantity declaration missing [Rule 6(1)(c)]".
- Errors say what happened and what to do next, and do not apologise. "Label text
  unreadable at this resolution. Recapture with the panel filling the frame."
- Empty states invite action: "No inspections recorded today. Scan a package to
  begin."
- Every English string has a Hindi counterpart in the i18n file. The toggle must
  switch statutory terms correctly, not just chrome.

---

## 10. Accessibility floor

- Visible focus ring on every interactive element. Never `outline: none` without
  a replacement.
- Semantic landmarks, one `h1` per page, no skipped heading levels.
- Status never carried by colour alone.
- Targets minimum 44×44px; used one-handed in the field.
- Works at 200% zoom and 320px width with no clipping or horizontal scroll.
- The scan flow is completable by keyboard alone, with a file-upload fallback for
  when the camera is unavailable.

---

## 11. Self-check before claiming done

- [ ] Zero heroes. Every page opens with a slab header.
- [ ] The dark navy sidebar is gone; masthead plus indigo nav bar in place.
- [ ] Bands are full-bleed. No permanent white gutter flanking the page.
- [ ] Grep `text-transform: uppercase` and `letter-spacing: 0.1em` — justify
      every remaining hit.
- [ ] Grep for `→` and `↗` inside strings — zero hits in button or link text.
- [ ] Grep `#F5C13D` — zero hits.
- [ ] No headline has one line or word in a different colour.
- [ ] No middle-dot meta strings.
- [ ] Mono only on identifiers, quantities, prices, measurements, timestamps.
- [ ] Noto Sans is actually loading — DevTools Network → Font, not the CSS file.
- [ ] Every card colour maps to a category in section 5, not to visual variety.
- [ ] Exactly one entrance animation in the app, on the verdict panel.
- [ ] Reduced-motion query present and working.
- [ ] Keyboard-only pass on the full scan-to-record flow.
- [ ] 320px viewport: no horizontal scroll, nav drawer works.
- [ ] Screenshot the field scanner and a resolved verdict at 1600px, place them
      beside `reference/02-form-cards-grid.png`, and critique honestly against
      sections 2 and 3 before saying it is finished.
