# Deploy — clicksense

The `clicksense` repo itself has **two** deploy surfaces.

## 1. clicksense demo site (this repo's public face)

**Live URL:** https://andyed.github.io/clicksense/
**Source branch:** `main`, path `/`
**Deploy trigger:** **Auto on push to main** via GH Actions
(`.github/workflows/pages.yml`).
**Deploy command:** Automatic. Workflow uploads the `experiments/` directory as
the Pages artifact (not the repo root — note path).
**Build command:** None — static HTML served directly from `experiments/`.

### Minimal-change protocol

Edit the HTML / JS under `experiments/peripheral/` or `experiments/stroop/`.
Commit, push. Workflow redeploys within ~1-2 min.

## 2. clicksense library (the `dist/clicksense.js` artifact consumed by
    every other MBP property)

**"Deploy" here means: build the library, then copy the built artifact into
every consuming repo.**

Source: `src/clicksense.js`
Build: `node build.js` → produces `dist/clicksense.js` (IIFE), `dist/clicksense.mjs` (ESM), etc.
Consumers: see `DEPLOYMENTS.md` for the per-consumer copy path (as of
2026-04-23 this doc lists stale PostHog project mappings — fix separately).

### Update procedure (per DEPLOYMENTS.md)

1. Make changes in `src/clicksense.js`
2. `node build.js`
3. Copy `dist/clicksense.js` to each active installation's JS directory
   (paths in `DEPLOYMENTS.md`)
4. Rebuild / redeploy each consuming project per its own `DEPLOY.md`
5. Update `DEPLOYMENTS.md` with the date

### Verification

```bash
# After updating a consumer, verify the served copy matches:
curl -s https://<consumer-url>/<path>/clicksense.js | head -1 | md5
md5 -q dist/clicksense.js
# The two should match.
```

## PostHog

This repo's own demo writes to **clicksense-stroop project (361486)**. It
shares the project with `reading_doppler` — intentional, complementary
reading-research demos.
