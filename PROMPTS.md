# Antigravity prompts — copy one stage at a time

## Before you paste anything

1. Copy `AGENTS.md` to your **repo root** (same folder as `package.json`).
2. Copy the `reference/` folder to your **repo root** too.
3. Confirm your `tokens.css` is in the styles folder (or let Stage 1 create it).

**File formats that work:** `.md`, `.txt`, `.css`, `.json`, `.png`, `.jpg`, `.svg`, `.pdf`.
**Does not work:** `.mp4`, `.mov`, `.webm`, `.fig`, `.psd`. That is why the screen
recording has been converted into the five PNG stills in `reference/`.

Attach the PNGs using the attach/paste control in the prompt box **in addition to**
mentioning their paths in the text. Paths alone sometimes get skimmed; attached
images always get looked at.

Run the stages **in order**, one at a time. Do not paste all six at once — long
combined prompts are exactly why the first attempt came out generic.

---

## Stage 1 — Set up the design system

> Read `AGENTS.md` in the repo root end to end before doing anything. It is binding.
>
> Attached are five reference screenshots from `reference/`. Study `01`, `02`, `03`
> and `04` — that is the visual density and colour-coding I want. `05` is marked
> EXCLUDE: that right-hand SERVICES sidebar must **not** exist in our build.
>
> Do not write any page markup yet. In this stage only:
>
> 1. Create `src/styles/tokens.css` with every colour, radius, spacing, shadow and
>    type token from `AGENTS.md` §4–§5 as CSS custom properties on `:root`.
> 2. Add the Google Fonts link for Plus Jakarta Sans, Noto Sans, Noto Sans Devanagari
>    and IBM Plex Mono to the document head. Verify in DevTools that all four
>    actually load — do not assume.
> 3. Create `src/styles/base.css`: reset, `.band` (full-bleed) and `.container`
>    (`min(100% - 2*var(--gutter), 1560px)`) utilities, focus-visible ring,
>    `prefers-reduced-motion` block, and the 12-column grid.
> 4. Build `src/routes/styleguide` — a page that renders the whole token set:
>    type scale specimen, all six category card triplets, every button variant,
>    form fields in all states, focus rings.
>
> Then stop and show me the styleguide. Do not start the homepage until I approve it.

---

## Stage 2 — Shell: utility bar, masthead, footer

> Build the page shell only, using the tokens from Stage 1. No page content yet.
>
> - Utility bar: thin `--brand-600` strip. Language switch (English / हिन्दी),
>   text-size controls A− A A+, high-contrast toggle, skip-to-content link that is
>   visually hidden until focused.
> - Masthead: white, `--border` bottom hairline. Logo lockup left, portal name in
>   Hindi above English, app store badges right. Sticky on scroll with the masthead
>   collapsing to 64px height, 200ms.
> - Footer: `--bg-sunken` band, four link columns, copyright line, accessibility
>   statement link, last-updated date.
>
> All three are full-bleed bands with the wide inner container. Sentence case
> everywhere. No uppercase labels.

---

## Stage 3 — Priority notice band + Forms band

> This is the heart of the page. Match the density in `reference/01` and `reference/02`.
>
> **Priority notice band (rose category):** "Special Intensive Revision (SIR) — 2026"
> with three primary actions: fill enumeration form, search your name in last SIR,
> submit document against notice issued. Full-bleed rose tint, three actions stacked
> full-width on mobile, inline on desktop.
>
> **Forms band:** the colour-coded card grid, two cards per row on desktop, one on
> mobile. Cards to build:
>
> | Card | Category colour |
> |---|---|
> | New voter registration (Form 6) | Pink |
> | New voter registration – NRI (Form 6A) | Cyan |
> | Deletion (Form 7) | Rose |
> | Correction of entries (Form 8) | Green |
> | Form M — migrant electors, special polling station | Amber |
> | Form 12C — migrant electors, postal ballot | Violet |
>
> Card anatomy is fixed: 40px circular icon well in the category tint, title,
> one-sentence description, then an action row with at most one filled button plus
> text links (Download, Guidelines). Every card in a row must be equal height —
> use grid, not flex hacks.
>
> The band header bar ("Forms") is the `--r-xl` `--brand-600` slab from the reference.
> This is where the one signature animation lives — see `AGENTS.md` §6. Implement
> it exactly: header bar wipes left→right 520ms, then cards stagger in at 40ms
> intervals. Once only, first band only, and disabled under reduced motion.

---

## Stage 4 — Services band (the replacement for the excluded sidebar)

> Everything that lived in the right-hand SERVICES sidebar of the reference site
> now becomes a **full-width band** here. Do not recreate the sidebar.
>
> Cards, three per row on desktop, two on tablet, one on mobile:
> download electoral roll · track application status · e-EPIC download ·
> search your name in the voter list · book a call with your BLO ·
> submit an appeal · register a complaint or share a suggestion.
>
> Same card anatomy and same six-colour category system as Stage 3 — reuse the
> component, do not fork it. Assign colours by meaning: downloads and records →
> violet, corrections and appeals → green, urgent → rose.
>
> No entrance animation on this band. Hover response only.

---

## Stage 5 — Updates, about, and help

> Two remaining bands.
>
> **Updates band:** elections (current, future, past candidate information) and
> election results (current results, past results, statistical reports). Wide
> two-up layout inside the container.
>
> **About & help band:** about the Commission (three or four sentences, then a
> "Read more" link), FAQs, contact, and outbound links. Alternate the band
> background to `--bg-band` so it separates from Updates.
>
> Keep the copy plain and factual. No marketing tone, no exclamation marks.

---

## Stage 6 — Wire up, harden, self-critique

> 1. Connect every card action to the existing backend routes. Do not change any
>    API contract, schema or server file — the backend is finished.
> 2. Loading, empty and error states for every data-backed view. Errors say what
>    happened and what to do next; they do not apologise.
> 3. Run the full checklist in `AGENTS.md` §10 and fix every failure.
> 4. Screenshot the finished homepage at 1600px, 1024px, 768px and 320px. Compare
>    the 1600px shot against `reference/02-form-cards-grid.png`.
> 5. Then critique your own work honestly against these five questions and fix what
>    you find:
>    - Does any part of this look like a generic AI-generated SaaS page?
>    - Is there a permanent white gutter down both sides of the whole page? (There
>      must not be.)
>    - Are there more entrance animations than the one signature moment?
>    - Is any card colour decorative rather than category-coded?
>    - Are Plus Jakarta Sans and Noto Sans genuinely rendering, or has it silently
>      fallen back to a system font?

---

## Fix-up prompts, if it drifts

**If it comes back looking generic again:**

> This still reads as a default AI-generated page. Specifically diagnose which of
> these is happening and fix each one: identical rounded cards with the same radius
> and the same grey shadow; uppercase eyebrow labels; a `→` in button text; one
> word of a headline accented in a different colour; fade-and-slide entrance on
> every section. Re-read `AGENTS.md` §4 and §6 and correct.

**If it narrows the layout again:**

> The page is centred in a narrow column with dead white space on both sides. Change
> it: every section background must run full-bleed to 100vw, and the inner container
> must be `min(100% - 2*var(--gutter), 1560px)` with `--gutter: clamp(20px, 4vw, 72px)`.
> Body text inside cards stays capped near 68 characters, but the layout itself uses
> the full screen.

**If the fonts fell back:**

> The fonts are not loading. Open DevTools → Network → Font and confirm. Then fix the
> Google Fonts link and make sure the `font-family` declarations name
> `"Plus Jakarta Sans"` for headings and `"Noto Sans"` for body, with
> `"Noto Sans Devanagari"` in the stack for Hindi. Remove any Inter, Poppins,
> Montserrat or bare `system-ui` that has crept in.
