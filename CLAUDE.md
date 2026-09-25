# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Two-page static résumé site for 钱晨 (上海应用技术大学 · 智能技术学部 · 铁道交通系 讲师): `index.html` (the résumé) and `works.html` (成果展示 — detailed write-ups of deployed agent deliverables). No build step, no framework, no package manager — hand-written HTML/CSS/JS only. Published publicly via GitHub Pages:

- Live: https://dickwxyz.github.io/resume/
- Repo: `dickwxyz/resume` (Pages serves the repo root of `main`)

The deployed page contains personal data (name, phone, email, photo) and is publicly indexed. Treat the repo as public.

## Commands

```bash
# Preview
open index.html                    # simplest — all assets are relative paths
python3 -m http.server 8000        # use when you need a real origin (clipboard API, etc.)

# Deploy (push == deploy; Pages rebuilds in ~1–2 min)
git add . && git commit -m "..." && git push origin main

# Verify live
curl -s -o /dev/null -w "%{http_code}\n" https://dickwxyz.github.io/resume/
```

`gh` CLI is installed and authenticated as `dickwxyz`; `gh auth setup-git` is already configured for HTTPS pushes.

## File layout

- `index.html` — the résumé. **All résumé content is hardcoded here** (projects, publications, courses, awards, team, contact) — there is no data file, CMS, or templating layer. Content edits mean editing HTML.
- `works.html` — 成果展示 page for deployed deliverables. Same design language, shares `styles.css` and `script.js`. Each deliverable is an `<article class="work-card hover-card" id="…">` block (left: copy + `在线体验` CTA; right: `.work-cover`); the `id` is what `index.html#projects` cards deep-link to via `.timeline-work-link`. To add a deliverable, copy an existing `<article>` block — no CSS or JS changes needed. Nav links here point back to `index.html#…` (cross-page), so no nav item is ever `.active` on this page.
- `styles.css` — the only stylesheet, shared by both pages. One comment-delimited block per page section, ordered to match the HTML (`====== 英雄区 ======`, `====== 教授课程 ======`, `====== 成果展示页 ======`, …). To restyle a section, jump to its block.
- `script.js` — one vanilla-JS IIFE, behaviors numbered 1–14, no dependencies. Shared by both pages.
- `pic/` — image assets (hero portrait `证件照.jpg`; screenshots for works.html go in `pic/works/`).
- `resources/` — local working documents (`.docx`, checklists). Gitignored; not part of the site.

## Architecture notes

**Design tokens.** Every color lives in `:root` in `styles.css`: `--ink`/`--ink-soft`/`--ink-light`, `--gold`/`--jade`/`--azure`/`--rose` plus `-soft`/`-light` variants, and `--gradient-ink`/`--gradient-gold`. Sections are themed through these (e.g. publication type badges use `--jade`/`--azure`/`--rose`); extend the token set rather than hardcoding hex.

**script.js ↔ DOM contract.** The script silently no-ops if its hooks are missing, so new markup must keep these names:

- `.hover-card` — scroll-reveal. JS auto-adds this class to a fixed selector list (`.timeline-item, .stat-card, .research-card, .course-card, .paper-item, .award-item, .contact-card, .recruit-box`) and then reveals via IntersectionObserver. Any *other* card type must carry `hover-card` in its HTML to animate.
- `.stat-num[data-count="N"]` — count-up animation; the HTML text is a placeholder `0`, so the rendered number comes from the attribute.
- `#bgCanvas`, `#backTop`, `#navToggle`, `#navLinks` — required IDs for background particles, back-to-top, and the mobile menu. **Every page must include all four** — `script.js` has no null guards and throws on the first missing one, killing all interactivity on that page.
- `.hero-portrait` / `.hero-text` / `.deco-leaf` — mouse-parallax targets, gated on `(pointer: fine)`.
- `.team-avatar` — colored via an inline custom property, e.g. `style="--tc: #4a8c7c"`.

**Responsive.** Two breakpoints only: `960px` (nav collapses to a hamburger, hero goes single-column, the alternating timeline goes single-sided) and `640px` (phone: single-column grids, tighter padding). Multi-column grids elsewhere use `repeat(auto-fit, minmax(…))` and need no extra rules.

**Fonts.** Google Fonts CDN (`Noto Serif SC` for headings/`--serif`, `Inter` for body) with system fallbacks. On networks where Google Fonts is blocked the page degrades to local `Songti SC`/`PingFang SC` — acceptable, not a bug.

**Asset paths.** Images are referenced relatively (e.g. the hero portrait `pic/证件照.jpg` in `index.html`). Moving an image requires updating the reference in the same commit — check with `grep -rn "\.jpg" *.html` after moving files.

## Repo conventions

- `.gitignore` excludes local-only working files (`.DS_Store`, `说明.docx`, `个人简历.docx`, `个人简历修改清单.md`, `.claude/`). Keep personal/working documents out of this public repo; add new ones to `.gitignore` rather than committing them.
- Commit messages are short English imperatives (`Update resume site content`).
