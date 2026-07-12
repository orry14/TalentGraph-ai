<USER_REQUEST>
# TalentGraph — Real SaaS UI Redesign Prompt

## Why the current UI reads as "AI-made"

The screenshot shows the exact pattern that reads as generic AI-generated design: near-black background, neon-blue glassmorphism borders, glowing accent rings, stat cards showing broken `0` / `0%` / `0 yrs` states with no empty-state handling. This is a real, recognized default — dark "mission control" dashboards with glass borders are what most AI design tools reach for when given a "dashboard" brief, regardless of the actual product. Zoho, Google Workspace, Linear, and Salesforce Lightning look nothing like this: they're light-mode-first, information-dense, low-drama, and every pixel earns its place because real people use these tools for eight hours a day, not for a 30-second demo screenshot.

The fix isn't "less neon" — it's rebuilding from a real enterprise product design system: functional density, restrained color used for meaning not decoration, and a UI that gets out of the way of the data.

---

## Design tokens — build this system first, before touching any page

**Palette** — light-mode-first (matches Zoho/Google/Linear convention for productivity tools), one confident brand color, status colors reserved strictly for status:
```
--surface-page:      #F6F7F9   /* app background — soft neutral, not white, not black */
--surface-card:       #FFFFFF   /* cards, panels, table containers */
--surface-sunken:     #F0F1F4   /* table headers, input backgrounds, code/mono blocks */
--surface-sidebar:    #FFFFFF   /* sidebar — same as card, NOT dark, this is the biggest single change */
--border:             #E3E5EA   /* default 1px hairline border, everywhere */
--border-strong:      #C9CCD4   /* hover/focus emphasis */

--text-primary:       #14161A   /* headings, primary content */
--text-secondary:     #565B66   /* supporting text, labels */
--text-muted:         #8A8F9C   /* placeholders, timestamps, disabled */

--brand:              #2954E0   /* primary actions, active nav, links — used sparingly */
--brand-hover:        #1E42B8
--brand-tint:         #EBF0FE   /* light brand backgrounds — active nav pill, selected rows */

--ai-accent:          #6D5EF0   /* reserved exclusively for AI-generated/AI-suggested content — badges, "Sparkles" icons, regenerate actions */
--ai-tint:            #F1EFFE

--success:            #167A52
--success-tint:       #E7F5EE
--warning:             #B76E00
--warning-tint:        #FCF1E0
--danger:              #C0342A
--danger-tint:          #FBEBE9
```

**Palette rule:** `--brand` blue means "you can click this / this is active." `--ai-accent` violet means "AI generated or suggested this" — used consistently on every Sparkles-icon feature (regenerate roadmap, AI recommendations, promotion readiness, semantic search results) so users learn the visual language: violet = AI made a judgment call, blue = a normal action, green/amber/red = status only, never decoration. This distinction is the signature system for the whole redesign — do not use violet for anything that isn't literally AI-generated.

**Type**:
- UI/body: **Inter** — every label, table cell, button, nav item. This is a working tool used all day; legibility at 13-14px density matters more than personality.
- Data/mono: **IBM Plex Mono** — audit log IDs, timestamps, ₹/$ figures, employee IDs, anything tabular where digit alignment matters.
- Do not add a separate "display" serif or slab face — Zoho/Google-tier enterprise tools use one type family with a disciplined weight scale (400/500/600), not a personality font. Restraint here is the point.

**Radius & elevation** — the opposite of glassmorphism:
```
--radius-sm: 6px;   /* buttons, inputs, badges */
--radius-md: 10px;  /* cards, panels */
--shadow-card: 0 1px 2px rgba(20,22,26,0.04), 0 1px 1px rgba(20,22,26,0.03);  /* barely-there, functional only */
```
No glass blur, no glow, no gradient borders, no neon strokes anywhere in the rebuild. Borders are solid 1px `--border`. Elevation is a near-invisible shadow, not a light effect.

**Signature element**: the **Verification & Confidence badge system** — small, consistent pill badges used everywhere the platform makes a judgment or claim: `AI suggested` (violet), `Verified` (green, for GitHub-verified skills), `Live` (blue, for real-time data), `Beta` (grey). This is quiet, functional, and repeats across every page — exactly the kind of small disciplined signature a real enterprise product has, instead of one big glowing hero moment. Consistency across 10 pages is more convincing to a buyer than drama on one page.

---

## The prompt

```
Completely re-skin the TalentGraph frontend from the current dark neon-glassmorphism "mission control" theme into a light, dense, functional enterprise SaaS design system in the style of Zoho One / Google Workspace admin console / Linear. React 18 + TypeScript + Vite + Tailwind CSS, existing component structure in client/src/components, client/src/pages, client/src/context.

Step 1 — Tokens
Implement this exact design token system as Tailwind config extensions + CSS custom properties in a new globals.css, replacing all current dark-theme slate/glow variables:

[paste the full "Design tokens" block above verbatim]

Delete all glassmorphism utility classes currently used by GlassCard (blur, glow border, gradient border) — GlassCard becomes a plain card: --surface-card background, 1px --border, --radius-md, --shadow-card. Rename it internally if useful but keep the same prop interface so you don't have to touch every page that imports it — this should be primarily a token/style change, not a full component rewrite, to keep the change manageable.

Step 2 — Global layout (client/src/components/Layout.tsx)
- Sidebar: change from dark to --surface-sidebar (white), with a 1px right border (--border) instead of a glow edge. Logo stays top-left, but drop any glow/gradient treatment on the logo mark — a clean flat icon in --brand.
- Nav items: default state is --text-secondary on transparent; active state is --brand-tint background with --brand text and a 2px left border in --brand (a "pill" or "tab" indicator, not a glow) — this is the single active-state pattern for the whole app, use it consistently.
- Make the sidebar collapsible (addresses documented improvement #3) — a toggle at the bottom that shrinks to icon-only width, tooltip on hover for labels.
- Top bar: white/--surface-card background, 1px bottom border, page title in --text-primary 18px/600, keep the Org Capability Index widget but rebuild it as a small precise numeric chip with a thin radial ring (not a glowing dashed circle) — think a Linear-style small stat pill, not a hero gauge.
- Platform status indicator ("Platform Core Online"): small dot + text in --text-muted, remove any pulsing glow animation — a simple solid green dot with a subtle 2s opacity pulse is enough, nothing more.

Step 3 — Dashboard page (client/src/pages/Dashboard)
- Fix the core broken state shown in the current screenshot first: every stat card showing 0/0%/0yrs with no loading or empty-state handling is a real bug, not just a style issue — implement a proper loading skeleton (grey pulse blocks) while data fetches, and a genuine empty state ("No employees yet — add your first team member") if the org truly has zero data, rather than showing bare zeros as if they're real numbers.
- Rebuild the 4 KPI stat cards: --surface-card, 1px border, --radius-md, no glow icon backgrounds — icon in a small 32px --surface-sunken circle, label in --text-secondary 12px uppercase letterspaced, value in --text-primary 28px/600 (IBM Plex Mono for the number itself if it's numeric).
- Rebuild the three forecast charts (Attrition Risk, Skill Decay, Bench Utilization) using Recharts with the new palette: line/area strokes in --brand or --ai-accent depending on whether it's a raw metric or an AI forecast (forecasts get --ai-accent, tagged with an "AI forecast" badge per the signature system), fills at 8-10% opacity, grid lines in --border, no gradient fills.
- Executive Command Center header block: remove the gradient/glow treatment entirely, make it a plain card with the title, subtitle, export buttons (outline style, --border, --text-secondary, hover --surface-sunken), and the department query search bar (--surface-sunken background, no border, focus ring in --brand).

Step 4 — Employee Workspace
- Left directory list: implement virtual scrolling (documented problem — could load hundreds of cards) using react-window or similar, add pagination as a fallback if virtual scroll isn't quick to add.
- Employee cards in the directory: flat list rows (not glass cards) with 1px bottom border between rows, hover state --surface-sunken, selected state --brand-tint with a left --brand border bar.
- Skills mapping grid on the detail view: skill chips using --surface-sunken background normally, and the `Verified` green badge (per signature system) specifically on GitHub-verified skills — this makes the verification concept from earlier feature discussions visually real in the UI now.
- AI Promotion Readiness gauge and Career Simulator trigger: tag both clearly with the `AI suggested` violet badge convention — these are judgment calls the AI is making, the badge system exists specifically for moments like this.

Step 5 — Recruitment page
- Break the large 18-field campaign creation form into accordion steps as documented (Job details / Criteria / Workflow) — this was already flagged as cluttered, fix it as part of this pass since you're touching the page anyway.
- KPI banner cards: same stat card treatment as Dashboard Step 3, for consistency.
- Candidate match score displays: use --ai-accent violet for AI match percentage specifically (it's an AI judgment), plain --text-primary for factual fields (experience, source).

Step 6 — Projects, Staffing Engine, Skill Gap Analysis
- Projects: rebuild the health/budget/skills tabs with flat card sections, radar chart in --brand with a --border grid (no neon glow radar), and implement the documented fix for radar charts breaking on small team sizes — show a clean "add team members to see skill coverage" empty state instead of a broken chart.
- Staffing Engine: fix the documented slider-normalization problem (sliders should auto-balance to sum to 100%, not require manual math) — this is a real UX bug to fix during the rebuild, not just restyle around it. Style sliders with a --surface-sunken track and --brand thumb, no glow.
- Skill Gap Analysis: comparison progress bars in --brand (current) vs --text-muted dashed line (target), add hover tooltips showing exact percentages (documented gap), external hiring suggestions get the `AI suggested` badge.

Step 7 — Talent Network (Neo4j graph)
- Keep the force-directed graph but restyle nodes/edges to the new palette: node fill by category using --brand/--ai-accent/--success/--warning tints (not neon), edge lines in --border-strong, no glow/particle effects.
- Add the documented zoom in/out/reset controls as a simple button cluster (bottom-right, --surface-card background, --border) overlaying the canvas.
- SPOF table: standard data table styling (see Step 9), critical/medium/low severity as --danger/--warning/--text-muted badges, not colored glow rows.

Step 8 — Command Center (real-time telemetry)
- This page can keep more visual energy than the rest of the app (it's explicitly a live-monitoring view) but drop the neon glow entirely in favor of the new palette: live gauge in --brand with a clean thin arc, alerts feed as flat bordered cards with a colored left-edge bar (--danger/--warning/--brand by severity) instead of glowing borders, sliding in with a simple 150ms translateY on new entries (addresses the documented "feed jumps" problem via consistent Framer Motion layout transitions).
- Fix the documented fluid-width graph sizing problem — wrap the force graph in a responsive container that recalculates on resize.

Step 9 — Tables (Audit Logs, and the standard table pattern for the whole app)
Establish one consistent table style used everywhere (Audit Logs, Project Directory, SPOF list, Automation Schedules):
- Header row: --surface-sunken background, --text-secondary 12px/600 uppercase labels, sortable columns get a subtle chevron icon.
- Body rows: --surface-card background, 1px --border between rows (not full grid lines), hover --surface-sunken.
- Numeric/data columns right-aligned, text columns left-aligned (documented convention to enforce).
- Audit log metadata: implement the documented collapsible accordion row for raw JSON instead of letting it overflow the table width.
- Zebra striping optional and subtle (--surface-page on alternate rows) only if row density is high enough to need it — don't default to it everywhere.

Step 10 — Forms & modals
- All modals: --surface-card, --radius-md, --shadow-card (a slightly larger shadow than cards for elevation), no dark overlay glow — a simple rgba(20,22,26,0.4) backdrop.
- Every form input: --surface-sunken background, 1px --border, --radius-sm, focus state = --brand border + light --brand-tint focus ring (2px), no glow.
- Add the documented missing <label> elements to every form field across the app — this is both an accessibility fix and part of making the forms read as a real product, not a prototype.
- Buttons: solid --brand primary buttons (per documented convention — standardize primary as solid, not the current gradient), outline secondary buttons (--border, --text-secondary), and destructive actions in --danger, solid only, used sparingly (delete confirmations).

Step 11 — Global consistency pass
- Standardize all icon usage on Lucide React only, one stroke width, sized 16-20px inline — remove any inconsistent icon sourcing.
- Enforce the documented 12px minimum body font size, WCAG AA contrast for all text/background pairs (verify --text-secondary and --text-muted specifically against --surface-page and --surface-card — a common failure point when moving from dark to light mode).
- Standardize spacing on a consistent rem scale — audit and replace any hardcoded pixel margins/paddings site-wide.
- Standardize date format (DD-MM-YYYY per documentation) and currency formatting (support ₹ as primary, configurable) everywhere numbers/dates appear.

Step 12 — Verification pass
Take screenshots of: Dashboard (compare directly against the current broken-zero-state screenshot to confirm the fix), Employee Workspace directory + detail view, the Recruitment campaign form in its new accordion-step layout, a data table (Audit Logs), Talent Network graph, and the sidebar in both expanded and collapsed states. Confirm: zero remaining glow/blur/gradient-border effects anywhere in the codebase, the AI-accent violet appears only on genuinely AI-generated content, all text passes contrast checks against its background, and the whole app would not look out of place next to an actual Zoho or Google Workspace admin screen if shown side by side.

Do not touch backend services, API contracts, RBAC/audit logic, or the Neo4j/Supabase data layer — this is a frontend visual and UX rebuild only, working within the existing component and routing structure documented in PROJECT_UI_DOCUMENTATION.md.
```

---

## One honest note

This redesign fixes two different problems at once, and it's worth knowing which is which: the palette/token change is a pure aesthetic decision (light enterprise vs dark neon), but several items folded into the steps above — the broken 0% stat display, the non-normalizing sliders, the overflowing JSON metadata, the radar chart breaking on small teams — are real functional bugs your own documentation already flagged, not style preferences. Fixing them alongside the re-skin is efficient since you're touching the same components anyway, but don't let "make it look like Zoho" become the whole story you tell about this pass — a chunk of what will make it feel like a real product is that it stops showing broken zeros to a new user's first screen.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-07-13T00:22:10+05:30.

The user's current state is as follows:
Active Document: c:\Users\Acer\Downloads\antigvotu\PROJECT_UI_DOCUMENTATION.md (LANGUAGE_MARKDOWN)
Cursor is on line: 1
Other open documents:
- c:\Users\Acer\Downloads\antigvotu\client\src\pages\AuditLogs.tsx (LANGUAGE_TSX)
- c:\Users\Acer\Downloads\antigvotu\server\src\services\predictiveService.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\Acer\Downloads\antigvotu\server\src\db\seedData.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\Acer\Downloads\antigvotu\server\.env.example (LANGUAGE_UNSPECIFIED)
- c:\Users\Acer\Downloads\antigvotu\server\src\db\fairnessConsent.ts (LANGUAGE_TYPESCRIPT)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from Gemini 3.5 Flash (High) to Gemini 3.1 Pro (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>