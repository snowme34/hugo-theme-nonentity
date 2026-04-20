# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Nonentity is a Hugo theme. No build tooling, no Node.js, no compilation — all files are served directly by Hugo. Changes to `static/` and `layouts/` are immediately reflected.

## Development

```bash
# In a Hugo site that uses this theme
hugo server
hugo build
```

No linting, no test suite, no CI config exists in this repo.

## Architecture

### Layout

3-column CSS Grid: left sidebar (272px) | main content (1fr) | right sidebar (272px).

Responsive breakpoints:
- `>1180px`: full 3-column
- `≤1180px`: left sidebar collapses to 60px rail
- `≤860px`: right sidebar collapses to 52px rail
- `≤640px`: right sidebar hidden

### Templates (`layouts/`)

- `_default/baseof.html` — shell for all pages; defines `main` and `sidebar` blocks
- `_default/single.html` — individual posts/pages
- `_default/list.html` — archive and section lists; groups by year when `layout = "archive"`
- `_default/terms.html` — tag overview; embeds full post JSON for client-side filtering
- `_default/index.json.json` — generates `/index.json` search index at build time
- `page/about.html` — custom about page layout

### Static Assets

- `static/css/main.css` — single monolithic stylesheet; theming via CSS variables (`--bg`, `--panel`, `--border`, `--text`, etc.) overridden at `:root[data-color-scheme="dark"]`
- `static/js/main.js` — color scheme toggle (persisted to `localStorage` key `nonentity-color-scheme`), sidebar open/close, TOC scroll tracking
- `static/js/search.js` — lazy-loads `/index.json`, client-side full-text search
- `static/js/tag-filter.js` — AND/OR tag filtering with client-side pagination; data embedded as JSON in `terms.html`

All JS is vanilla, no frameworks.

### Icons

SVG icons live in `layouts/partials/icons/`. Custom icons can be passed as raw SVG strings via `iconSvg` in site config.

## Required Hugo Config

```toml
[markup.highlight]
  noClasses = false          # Required for syntax highlighting

[outputs]
  home = ["HTML", "JSON", "RSS"]  # Required for search index
```

## Key Config Params

`params.profile`, `params.socials`, `params.leftNavExtra`, `params.toc`, `params.comments.giscus`, `params.analytics.cloudflare` — see `example.hugo.toml` for the full reference.

Posts use `content/post/` section. Per-post front matter can override `toc` and set `excerpt`.

## Syntax Highlighting

Light mode uses GitHub theme; dark mode uses Dracula. Both require `noClasses = false` so Hugo emits CSS classes rather than inline styles.
