# AGENTS.md

`sonner-sv` is a Svelte 5 port of [Sonner](https://github.com/emilkowalski/sonner). The goal is parity: same behaviour, styles, animations and API as upstream, adapted to Svelte idioms (snippets instead of JSX, `class` instead of `className`, string styles).

## Commands

pnpm only (`packageManager` is pinned in `package.json`).

```bash
pnpm install
pnpm dev      # demo site on localhost:5173, test page on /test
pnpm check    # svelte-check
pnpm lint     # prettier --check
pnpm format   # prettier --write
pnpm build    # demo site into build/, package into dist/
pnpm test     # Playwright (Chromium and WebKit), needs `pnpm exec playwright install chromium webkit` once
```

CI (`.github/workflows/ci.yml`) runs check, lint, build and test on every PR. Run all four before pushing.

## Layout

- `src/lib/`: the package. `index.ts` is the public entry; `state.ts` holds the `toast()` API and the toast store; `Toaster.svelte` and `Toast.svelte` render; `styles.css` is upstream's CSS.
- `src/site/` and `src/routes/+page.svelte`: the demo site, deployed to GitHub Pages by `pages.yml`.
- `src/routes/test/`: the page Playwright drives, configured through the query string.
- `tests/`: Playwright specs.
- `docs/API.md`: the full API reference. Update it when the public API changes.

## Conventions

- Match upstream Sonner first. When behaviour differs on purpose, say why in a comment and list it under "Differences from the React version" in `docs/API.md`.
- Svelte 5 runes only, TypeScript everywhere.
- Fix bugs with a Playwright test in `tests/basic.spec.ts` that fails without the fix.
- Comments explain a non-obvious why (browser quirks, timing, upstream parity). Don't narrate what the code does.
- Don't edit the `release` branch. CI rebuilds it from `main` on every push.
- The README is for humans and stays short. Reference material goes in `docs/`.
