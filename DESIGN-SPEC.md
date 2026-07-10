# Handoff Spec: HYPERTOBI — full site design system

## Overview
Multi-service portfolio for a Swiss one-person business (Boschung Services): Hyperpizza (catering & workshops), Hyperfilm (analog film lab), Hyperfoto (prints), Hyperweb (websites), plus a retro Pizza Arcade. Design language: **"wrapping paper" neo-brutalism** — lime paper ground, crumple-textured display type, 2px ink borders, hard offset shadows, one playful 3D object per service page. Tone: handmade, loud, friendly. Everything the visitor can do funnels into either an Instagram DM (pizza/prints) or an email (film lab sign-up).

Live: https://hypertobi.vercel.app · Repo: DBS699/hypertobi (Vite vanilla-JS MPA, no framework)
Stack for implementation notes below: plain HTML + one shared CSS file (`site.css` here = `src/styles/main.css` in repo) + small JS modules (GSAP for motion, `@google/model-viewer` for 3D).

## Layout
- Content column: `max-width: 1160px`, side padding 40px (`.hero`, `.main`, `.container`).
- `.main` stacks sections with `gap: 40px`.
- Hero: `.hero-row` = flex, text column `flex: 1 1 0; min-width: min(100%, 480px)`, 3D slot `320×320px` fixed, bottom-aligned (`align-self: flex-end`), `gap: 32px`, wraps under ~850px effective width.
- Grids: `.grid-2/-3/-4` (equal columns, gaps 14–18px); home uses a 6-col `.tile-grid` with span-2/3/4 tiles.

## Design Tokens Used
| Token | Value | Usage |
|-------|-------|-------|
| `--paper` | #E3F0C4 | Page + nav background (lime; deliberate choice, was cream) |
| `--ink` | #201A17 | Text, 2px borders, default hard shadows |
| `--pizza` | #E8402A | Hyperpizza accent, logo letters, primary CTAs |
| `--film` | #8A63D2 | Hyperfilm accent (banner, buttons, shadows) |
| `--foto` | #E17BA4 | Hyperfoto accent |
| `--web` | #2E5BFF | Hyperweb accent |
| `--cream` | #F5EEE2 | Info boxes on white cards |
| `--muted` | #6B6157 | Secondary text |
| `--display` | Bricolage Grotesque 800 | All display type; tight tracking (−1 to −3px) |
| `--body` | Archivo 400/700 | Body copy 13–17px, labels |
| `--retro` | Press Start 2P | Arcade page only |

Non-token constants used throughout: border `2px solid var(--ink)`; radius 18px (cards), 14px (small cards/boxes), 999px (pills/chips); shadows `6px 6px 0` (cards, hover 9px), `3px 3px 0` (pills, hover `4px 4px 0` + translate(−1,−1)); crumple textures at `background-size: 520px` (display text `.tt--lg`) / 230px (small `.tt`) / 760px (tiles).
Textured type: `.tt` = `background-clip: text` with per-service crumple PNG. **Gotcha: the clip breaks on transformed child elements** — any per-letter animation must give each letter its own background copy with a `background-position` offset (see `initHeroWave`).

## Components
| Component | Variant | Notes |
|-----------|---------|-------|
| `.nav` | sticky | Lime bg, 2px bottom border; multicolor `.logo-letter` logo (per-letter ±6–8° hover rotation); links underline in service color on hover/active |
| `.pill` | default / colored / footer | White bg unless overridden; shadow via `--sh`; used as button AND link |
| `.tile` | pizza/film/foto/web | Home grid; crumple bg baked per color; peel-corner easter egg (drag to reveal photo) |
| `.card` | white / colored / `--hot` | 28px padding; `.pk-card--hot` = ink bg + yellow `.pk-flag` badge ("MOST BOOKED") |
| `.menu-card`, `.how-card`, `.quote-card` | — | Content cards on pizza page |
| `.faq details` | closed/open | Native accordion; `+`→`–` marker in service red |
| `.field` | text/select/textarea | Labels 12px bold; inputs cream bg, 2px ink border, focus border = page accent |
| `.compose-box` | — | Generated message `<pre>` + action pills (copy / mailto / IG) |
| `.model-slot` | ambient | 320×320, transparent; `<model-viewer>` poster→GLB; no border/badge |
| `.pf-card` | — | Portfolio mini-browser: chrome bar (3 dots + URL pill) + live iframe scaled from 1280px + meta row |
| Dev-run banner | — | Film page: `--film` bg card, big date, white slots counter box, CTA pill |
| `.sec-title` | — | Section headings as textured `.tt` type, clamp(30–44px) |
| Footer | — | Say-hi pill + made-by line + legal line "© 2026 Boschung Services … · Impressum" |

## States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| `.pill` | Hover | translate(−1,−1), shadow 3px→4px, 0.15s ease |
| `.tile-wrap` | Hover | translate(−3,−3), tile shadow 6→9px |
| `.logo-letter` | Hover | translateY(−4px) rotate(var(--rot)), 0.18s spring cubic-bezier(0.34,1.56,0.64,1) |
| `.pf-card` | Hover | translate(−3,−3), shadow → 9px in `--web` blue |
| FAQ `summary` | Open | Marker `+` → `–`; content 14.5px/1.65 |
| Lang toggle | Active | Ink bg pill, cream text (set via JS) |
| Forms | Submit | No backend: builds message → compose box appears with copy + (IG link \| mailto). Film form fills `mailto:boschungservices@gmail.com` with subject `Anmeldung Filmentwicklung — {Name}` |
| Slots counter | `slots_free ≤ 0` | `.devrun-slots--full` class hook (style TBD — currently only class toggled) |
| 3D models | Pointer move / scroll | `follow`: model turns toward cursor — target theta = rest − dx·40°, polar ±16°, lerp 0.08/frame, clamped |
| Pizza 3D | Always | Pure turntable 25°/s, `polar 60°`, **no camera-controls** (nothing can stop it) |

## Responsive Behavior
| Breakpoint | Changes |
|------------|---------|
| >1160px | Fixed 1160px column |
| ~850–1160px | Hero font scales 6.5vw; hero-row may wrap (slot drops below text) |
| ≤860px | `.menu-grid/.pk-grid/.quote-grid` → 1 col; `.how-grid` → 2 col; `.pf-grid` → 1 col |
| Any width / any language | **fitHeroH1()**: hero h1 spans are `white-space: nowrap`; JS shrinks h1 font in −2px steps (floor 24px) until the longest line fits — reruns on language switch and resize. Reason: DE/FR lines are much longer than EN |

## Edge Cases
- **CMS content offline**: all four loaders (`applyPhotos/PizzaPrices/FilmRun/Portfolio`) fetch `/content/*.json`; on failure the static HTML defaults remain — pages never break.
- **No WebGL**: ambient 3D slots fall back to the static poster PNG.
- **Long language strings**: hero fit (above); package/menu cards wrap naturally; nav wraps (`flex-wrap`).
- **Photo gallery count change** (CMS): loader clones/removes `.foto-frame`s to match JSON length.
- **Slots full**: counter shows 0/12, `--full` class available for styling; sign-up form stays open (Tobi confirms by reply).
- **Portfolio iframes**: `loading="lazy"`, `pointer-events: none`, `tabindex="-1"` — non-interactive previews; whole card is the link.

## Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Sub-page intro (brand letters) | Page load | y −34, rot −10 → 0, stagger 0.05 | 0.55s | back.out(1.7) |
| Sub-page intro (h1, sub, chips, cards) | Load / scroll into view | Rise + fade, cards also scale 0.98→1 | 0.4–0.65s | power3.out / back.out(1.3) |
| Home hero letter wave | Every 5s | Per-letter y −12 rot −5 → back, L→R stagger 0.03 | 0.26 + 0.45s | power2.out, back.out(2.4) |
| Camera "shot" (foto) | 1.6s after load | Fullscreen white flash: pre-flash 0.5 opacity 90ms → main 1.0 → fade | ~0.9s total | ease-in / 500ms ease-out |
| Computer wink (web) | ~2.3s after model load | Base-color texture swap to wink variant and back | 450ms | — |
| 3D follow | pointermove/scroll | Camera-orbit lerp toward cursor | continuous | lerp 0.08/frame |
| Pizza turntable | Always | auto-rotate | 25°/s | linear |
| Scroll progress bar | Scroll | scaleX 0→1, page-accent color, fixed top 4px | scrub 0.3 | none |
| **Safety net** | 3s after load | If intro timeline never advanced (hidden tab): kill + clearProps so nothing stays invisible | — | — |
| Reduced motion | `prefers-reduced-motion` | All intros, wave, follow, spin, flash skipped; content static | — | — |

## Accessibility Notes
- Language toggle = real `<button>`s; `document.documentElement.lang` updates on switch.
- FAQ uses native `<details>/<summary>` (keyboard + SR OK); custom marker only visual.
- `<model-viewer>` elements carry descriptive `alt`; portfolio iframes have `title` + `tabindex="-1"` (whole card is one focusable link).
- Forms: labels wrap inputs (`<label class="field">`), so click/focus association is implicit.
- Known gaps (candidates for the refinement pass): no skip-to-content link; focus styles are browser default (could be styled to match ink/offset language); flash overlay is purely decorative but not `aria-hidden` yet; arcade game is mouse/keyboard (WASD/Space) with no SR affordance — treated as an easter egg.

## Content sources (do not hardcode over these)
CMS-managed (Sveltia, committed JSON): gallery photos, pizza package prices, film dev-run date + slots, web portfolio list. Everything else is static i18n text (EN inline in markup, DE/FR/IT in `src/js/i18n.js` dict — every visible string needs all 4 languages).
