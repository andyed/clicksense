# ClickSense TODO

## Analysis & Methodology

- [ ] **Trajectory shape classification**: ClickSense currently captures temporal dynamics (velocity, deceleration, corrections) but not trajectory types. Adding shape classification (straight, curved, change-of-mind) would give both the temporal-dynamics and type-based views described in Wulff et al. (2025). Options: implement `mt_cluster`-style k-means on trajectory shapes in JS, or export mousetrap-compatible data format and classify in R.
- [ ] **mousetrap-compatible export**: Output ClickSense approach data in a format mousetrap-Web can import. This gives access to the full R analysis pipeline (mt_measures, mt_cluster, mt_map) without reimplementing it. See `docs/wulff-kieslich-2025-mousetrap-tutorial.pdf` for format specs.
- [ ] **Sample entropy metric**: Add spatiotemporal disorder measure to approach dynamics. Currently not captured. Wulff et al. show it correlates moderately (r=.50-.54) with curvature indices but provides distinct signal about processing fluency.

## Logo & Branding

- [ ] Generate logo candidates with Nano Banana 2 using prompts below
- [ ] Pick winner, refine if needed
- [ ] Export favicon.ico (16x16 + 32x32), favicon.svg, apple-touch-icon.png (180x180), og-image.png (1200x630)
- [ ] Wire favicon + OG tags into demo/docs page
- [ ] Set GitHub repo social preview

### Logo Prompts (Nano Banana 2)

**Identity**: Click confidence measurement library. Motor behavior, cursor dynamics, scientific instrument. Indigo-cyan gradient (`#4f46e5` → `#22d3ee`), dark slate background.

#### Approach 1: Cursor with Confidence Ring

```
Minimal logo on dark slate (#0f172a) background. A simple arrow cursor icon with a
circular confidence ring around it — the ring is a gradient from indigo (#4f46e5) to
cyan (#22d3ee), suggesting measurement precision. The cursor is white. Clean vector
style, no text, no shadows. Geometric, must read clearly at 16x16 favicon size.
```

#### Approach 2: Click Waveform Pulse

```
Minimal logo on dark slate (#0f172a) background. A single sharp peak/pulse waveform
shape — like a mousedown→mouseup timing signal — rendered as a clean line in an
indigo-to-cyan (#4f46e5 → #22d3ee) gradient. The pulse rises sharply and decays,
suggesting a single decisive click event captured in time. No text, no shadows.
Vector style, works at 16px.
```

#### Approach 3: Approach Dynamics Trail

```
Minimal logo on dark slate (#0f172a) background. A curved dotted trail (suggesting
mouse cursor approach path) that terminates in a solid circle (the click target).
The trail dots fade from indigo (#4f46e5) to cyan (#22d3ee) as they approach the
target. The target circle is bright cyan. No text, no arrows, no shadows. Abstract
and geometric. Must work at 16x16 favicon scale.
```

### Head Tags (once assets ready)

```html
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta property="og:image" content="og-image.png">
```

## From Master Backlog (2026-03-25)

- [ ] **Add `approach_linearity` metric**: Ratio of straight-line distance to total path distance (0-1). Computed from velocity ring buffer at harvest. Strengthens uncertain-click classifier (currently uses `approach_corrections` as proxy).
- [ ] **Native app long-term baselines**: Persistent per-user profiles in native storage open up calibrated confidence scoring -- each user's own baseline as reference frame. See `i2lab/clicksense/` for commercial roadmap.
