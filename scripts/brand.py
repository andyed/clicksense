#!/usr/bin/env python3
"""ClickSense visual identity generator.

Family-consistent with the mindbendingpixels sub-family of
scientifically-driven page-interaction data collection systems:

  approach-retreat:  AOI + three outcome paths (click / deferred / rejected)
  reading-doppler:   viewport frame + paragraphs colored by band (top / mid / bot)
  clicksense:        target + cursor approach + mousedown-mouseup hold bar

All three share: near-black BG (10, 10, 12), 8:1-minimum text palette,
Helvetica wordmark, 1200x630 OG, behavioral-model-as-brand-glyph. What
differs is the glyph — because the behavioral model differs.

ClickSense's novel signal is the mousedown-to-mouseup HOLD duration
(50-120ms typical, Edmonds 2016). Approach dynamics (velocity,
deceleration, corrections, pause) are the context. The glyph renders
both: a click target, a cursor approaching along a decelerating path
with a pre-click pause marker, and a horizontal hold-duration bar
beneath the target.

Generates:
  - favicon (32x32, 128x128, 512x512) + .ico
  - wordmark logo (1400x280)
  - social header (1200x630, OG image standard)
  - brand mark alone (512x512 transparent PNG)

All text verified >=8:1 contrast.

Usage: python3 scripts/brand.py
"""
import os
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).parent.parent / "assets/brand"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# --- Palette ---
# BG + text hierarchy identical to approach-retreat and reading-doppler
# (family substrate). HOLD uses Scrutinizer's canonical cyan accent
# (#50b4c8 = (80, 180, 200)) — grounded in the peripheral-color work:
# red-green (L-M) opponency collapses by ~20° eccentricity, but the S-cone
# pathway (blue-yellow) persists to 40-50°, and cyan sits near the
# photopic luminance peak. So the HOLD bar reads at any eccentricity,
# including the parafoveal zone it occupies when the eye fixates the
# target ring above it — the glyph's composition is self-demonstrating.
# See scrutinizer-repo/drafts/peripheral-color-draft.html.
BG          = (10, 10, 12)
TARGET      = (110, 175, 255)  # blue — the click target (matches AR's AOI_BORDER / RD's VIEWPORT)
HOLD        = (80, 180, 200)   # Scrutinizer cyan — mousedown-mouseup duration, peripherally-legible
CURSOR      = (228, 228, 216)  # cursor arrow — uses TEXT color for max contrast
PAUSE       = (220, 170, 50)   # amber — pre-click deceleration pause (matches AR's DEFERRED)
TRAIL       = (180, 180, 175)  # approach path — matches AR's APPROACH
TEXT        = (228, 228, 216)  # primary — 15.4:1
BRIGHT      = (210, 210, 200)  # tagline — ~13:1
BRIGHT_DIM  = (188, 188, 178)  # attribution — ~10:1
SUBTEXT     = (170, 170, 165)  # UI chrome — 8.5:1


def luminance(rgb):
    r, g, b = [c / 255.0 for c in rgb]
    r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
    g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
    b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg, bg):
    l1, l2 = luminance(fg), luminance(bg)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)


print("=== Contrast check (target 8:1+) ===")
for name, color in [
    ("TARGET",     TARGET),
    ("HOLD",       HOLD),
    ("CURSOR",     CURSOR),
    ("PAUSE",      PAUSE),
    ("TRAIL",      TRAIL),
    ("TEXT",       TEXT),
    ("BRIGHT",     BRIGHT),
    ("BRIGHT_DIM", BRIGHT_DIM),
    ("SUBTEXT",    SUBTEXT),
]:
    r = contrast_ratio(color, BG)
    status = "OK " if r >= 8.0 else "FAIL"
    print(f"  [{status}] {name:11s} {r:5.1f}:1")
print()


FONT_PATHS = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/SFCompact.ttf',
    '/Library/Fonts/Arial Bold.ttf',
]
FONT_PATH = next((f for f in FONT_PATHS if os.path.exists(f)), None)


def font(size, weight='regular'):
    if not FONT_PATH:
        return ImageFont.load_default()
    if FONT_PATH.endswith('.ttc'):
        idx = {'regular': 0, 'bold': 1, 'light': 2}.get(weight, 0)
        return ImageFont.truetype(FONT_PATH, size, index=idx)
    return ImageFont.truetype(FONT_PATH, size)


def draw_cursor_arrow(draw, tip_x, tip_y, size, color, outline=None):
    """Draw a classic NW-pointing cursor arrow with its tip at (tip_x, tip_y)."""
    s = size
    # Classic cursor pointer shape (tip at top-left, stem trailing down-right)
    pts = [
        (tip_x, tip_y),
        (tip_x + int(s * 0.55), tip_y + int(s * 0.75)),
        (tip_x + int(s * 0.28), tip_y + int(s * 0.75)),
        (tip_x + int(s * 0.45), tip_y + int(s * 1.10)),
        (tip_x + int(s * 0.32), tip_y + int(s * 1.17)),
        (tip_x + int(s * 0.18), tip_y + int(s * 0.82)),
        (tip_x - int(s * 0.02), tip_y + int(s * 1.00)),
    ]
    if outline is not None:
        draw.polygon(pts, fill=color, outline=outline)
    else:
        draw.polygon(pts, fill=color)


def _dashed_curve(draw, pts, color, dash=6, gap=4, width=2):
    """Render a polyline as alternating dashes. Assumes dense points (bezier sampled)."""
    on = True
    accum = 0.0
    for i in range(len(pts) - 1):
        x0, y0 = pts[i]
        x1, y1 = pts[i + 1]
        seg_len = math.hypot(x1 - x0, y1 - y0)
        if seg_len == 0:
            continue
        if on:
            draw.line([(x0, y0), (x1, y1)], fill=color, width=width)
        accum += seg_len
        threshold = dash if on else gap
        if accum >= threshold:
            on = not on
            accum = 0.0


def draw_brand_glyph(draw, cx, cy, scale=1.0, show_hold_bar=True, show_approach=True, show_pause=True):
    """Draw the ClickSense brand glyph.

    Coordinate system: (cx, cy) is the center of the target ring.

    Composition (at scale=1):
      - TARGET RING: blue outlined circle, radius 28, border 3
      - TARGET INNER DOT: smaller filled concentric circle, radius 10
      - CURSOR ARROW approaching from upper right with tip landing at
        the NE quadrant of the target ring
      - APPROACH TRAIL: dashed decelerating curve leading the cursor in
      - PAUSE DOT: small amber dot along the trail ~40% from cursor start
        (the pre-click deceleration pause)
      - HOLD BAR: a horizontal cyan pill beneath the target representing
        the mousedown-mouseup duration. Tick brackets at both ends;
        subtle "down ... up" label space for larger sizes.
    """
    # === Target ring ===
    tgt_r_outer = int(28 * scale)
    tgt_r_inner = int(10 * scale)
    ring_w = max(2, int(3 * scale))

    # Slightly offset to give cursor + trail room to breathe on the right
    tx = cx - int(6 * scale)
    ty = cy - int(4 * scale)

    # Outer ring
    draw.ellipse(
        [tx - tgt_r_outer, ty - tgt_r_outer, tx + tgt_r_outer, ty + tgt_r_outer],
        outline=TARGET, width=ring_w,
    )
    # Inner dot
    draw.ellipse(
        [tx - tgt_r_inner, ty - tgt_r_inner, tx + tgt_r_inner, ty + tgt_r_inner],
        fill=TARGET,
    )

    # === Approach trail (bezier curve from upper-right into NE of target) ===
    if show_approach:
        start = (tx + int(88 * scale), ty - int(64 * scale))
        # Cursor tip sits just OUTSIDE the ring on the NE side
        end_approach = (
            tx + int(tgt_r_outer * 0.72),
            ty - int(tgt_r_outer * 0.72),
        )
        # Control points shape a decelerating arc (curves in toward the ring)
        c1 = (tx + int(72 * scale), ty - int(28 * scale))
        c2 = (tx + int(40 * scale), ty - int(34 * scale))
        steps = 36
        pts = []
        for i in range(steps + 1):
            t = i / steps
            # Cubic bezier
            u = 1 - t
            x = (u**3) * start[0] + 3 * (u**2) * t * c1[0] + 3 * u * (t**2) * c2[0] + (t**3) * end_approach[0]
            y = (u**3) * start[1] + 3 * (u**2) * t * c1[1] + 3 * u * (t**2) * c2[1] + (t**3) * end_approach[1]
            pts.append((x, y))
        _dashed_curve(
            draw, pts, TRAIL,
            dash=max(3, int(5 * scale)),
            gap=max(2, int(3 * scale)),
            width=max(1, int(2 * scale)),
        )

        # === Pause dot (along the trail, ~40% of the way in) ===
        if show_pause and scale >= 0.8:
            pause_idx = int(len(pts) * 0.42)
            px, py = pts[pause_idx]
            pdot_r = max(2, int(4 * scale))
            draw.ellipse(
                [px - pdot_r, py - pdot_r, px + pdot_r, py + pdot_r],
                fill=PAUSE,
            )

        # === Cursor arrow (tip just outside the target ring) ===
        cursor_size = int(22 * scale)
        # Position so the ARROW TIP (pts[0] of polygon) lands at start of trail
        cursor_tip_x = int(start[0])
        cursor_tip_y = int(start[1])
        draw_cursor_arrow(draw, cursor_tip_x, cursor_tip_y, cursor_size, CURSOR, outline=BG)

    # === Hold bar (mousedown-mouseup duration) ===
    if show_hold_bar and scale >= 0.7:
        bar_y = ty + tgt_r_outer + max(14, int(22 * scale))
        bar_w = int(92 * scale)
        bar_h = max(4, int(7 * scale))
        bar_l = tx - bar_w // 2
        bar_r = bar_l + bar_w
        # Bracket ticks at both ends — render as short vertical lines
        tick_h = max(6, int(11 * scale))
        tick_w = max(1, int(2 * scale))
        # Down bracket (left)
        draw.line(
            [(bar_l, bar_y - tick_h // 2), (bar_l, bar_y + tick_h // 2 + bar_h)],
            fill=TARGET, width=tick_w,
        )
        # Up bracket (right)
        draw.line(
            [(bar_r, bar_y - tick_h // 2), (bar_r, bar_y + tick_h // 2 + bar_h)],
            fill=TARGET, width=tick_w,
        )
        # Hold pill — slightly inset from brackets so brackets read as anchors
        pill_inset = max(2, int(3 * scale))
        pl = bar_l + pill_inset
        pr = bar_r - pill_inset
        radius = bar_h // 2
        try:
            draw.rounded_rectangle(
                [pl, bar_y, pr, bar_y + bar_h], radius=radius, fill=HOLD,
            )
        except AttributeError:
            draw.rectangle([pl, bar_y, pr, bar_y + bar_h], fill=HOLD)

    left = tx - int(40 * scale)
    right = tx + int(108 * scale)
    top = ty - int(78 * scale)
    bottom = ty + tgt_r_outer + int(38 * scale)
    return (left, top, right, bottom)


# === 1. Brand mark alone (512x512 transparent) ===
print("=== Brand mark (512x512 transparent) ===")
mark = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
draw = ImageDraw.Draw(mark)
draw_brand_glyph(draw, 256, 256, scale=2.4)
mark.save(OUT_DIR / "brand-mark.png")
print("  -> brand-mark.png")


# === 2. Favicons ===
print("=== Favicons (32, 128, 512) ===")
for size in [32, 128, 512]:
    fav = Image.new('RGB', (size, size), BG)
    draw = ImageDraw.Draw(fav)
    scale = size / 200
    # At 32px, the trail + cursor become illegible — render target + hold bar only.
    show_approach = size >= 128
    show_pause = size >= 128
    draw_brand_glyph(
        draw, size // 2, size // 2,
        scale=scale,
        show_hold_bar=True,
        show_approach=show_approach,
        show_pause=show_pause,
    )
    fav.save(OUT_DIR / f"favicon-{size}.png")
    print(f"  -> favicon-{size}.png")

fav32 = Image.open(OUT_DIR / "favicon-32.png")
fav32.save(OUT_DIR / "favicon.ico", format='ICO', sizes=[(32, 32)])
print("  -> favicon.ico")


# === 3. Wordmark logo (1400x280) ===
print("=== Wordmark (1400x280) ===")
W, H = 1400, 280
wordmark = Image.new('RGB', (W, H), BG)
draw = ImageDraw.Draw(wordmark)

glyph_cx = 230
glyph_cy = H // 2
draw_brand_glyph(draw, glyph_cx, glyph_cy, scale=1.5)

title_font = font(80, 'bold')
subtitle_font = font(28, 'regular')

title = "clicksense"
tagline = "click duration x approach dynamics"  # ASCII x renders on any font

title_x = 490
title_y = 82
draw.text((title_x, title_y), title, fill=TEXT, font=title_font)
bbox = draw.textbbox((title_x, title_y), title, font=title_font)
tagline_y = bbox[3] + 16
draw.text((title_x + 4, tagline_y), tagline, fill=SUBTEXT, font=subtitle_font)

wordmark.save(OUT_DIR / "wordmark.png")
print("  -> wordmark.png")


# === 4. Social header (1200x630 OG) ===
print("=== Social header (1200x630) ===")
W, H = 1200, 630
social = Image.new('RGB', (W, H), BG)
draw = ImageDraw.Draw(social)

GLYPH_SCALE = 2.1
GLYPH_CX = W // 2
GLYPH_CY = 210
draw_brand_glyph(draw, GLYPH_CX, GLYPH_CY, scale=GLYPH_SCALE)

# Legend under glyph — names the three visual elements
legend_y = 370
legend_font = font(24, 'regular')
swatch_size = 14
item_gap = 30

def _legend_item(draw, x, y, swatch_color, label, is_circle=False):
    if is_circle:
        draw.ellipse([x, y + 5, x + swatch_size, y + 5 + swatch_size], fill=swatch_color)
    else:
        radius = swatch_size // 2
        try:
            draw.rounded_rectangle([x, y + 5, x + swatch_size, y + 5 + swatch_size], radius=radius, fill=swatch_color)
        except AttributeError:
            draw.rectangle([x, y + 5, x + swatch_size, y + 5 + swatch_size], fill=swatch_color)
    draw.text((x + swatch_size + 8, y), label, fill=BRIGHT, font=legend_font)
    bbox = draw.textbbox((x + swatch_size + 8, y), label, font=legend_font)
    return bbox[2]

items = [
    (TARGET, "target",      True),
    (PAUSE,  "pause",       True),
    (HOLD,   "hold  (50-120 ms)", False),
]
# Pre-measure for centering
total_w = 0
for _, lbl, _ in items:
    bbox = draw.textbbox((0, 0), lbl, font=legend_font)
    total_w += swatch_size + 8 + (bbox[2] - bbox[0]) + item_gap
total_w -= item_gap

x = (W - total_w) // 2
for color, lbl, is_circle in items:
    end_x = _legend_item(draw, x, legend_y, color, lbl, is_circle=is_circle)
    x = end_x + item_gap

# Divider
DIVIDER_Y = 425
draw.line([(200, DIVIDER_Y), (W - 200, DIVIDER_Y)], fill=(40, 40, 45), width=1)

# Title block
title_font = font(84, 'bold')
subtitle_font = font(30, 'regular')
attribution_font = font(22, 'regular')

title = "clicksense"
tagline = "mousedown to mouseup, as a cognitive-load signal"
attribution = "part of mindbendingpixels  /  github.com/andyed/clicksense"

TITLE_Y = 460
bbox = draw.textbbox((0, 0), title, font=title_font)
title_w = bbox[2] - bbox[0]
title_h = bbox[3] - bbox[1]
draw.text(((W - title_w) // 2, TITLE_Y), title, fill=TEXT, font=title_font)

TAGLINE_Y = TITLE_Y + title_h + 14
bbox_s = draw.textbbox((0, 0), tagline, font=subtitle_font)
tag_w = bbox_s[2] - bbox_s[0]
draw.text(((W - tag_w) // 2, TAGLINE_Y), tagline, fill=BRIGHT, font=subtitle_font)

bbox_a = draw.textbbox((0, 0), attribution, font=attribution_font)
attr_w = bbox_a[2] - bbox_a[0]
draw.text(((W - attr_w) // 2, 597), attribution, fill=BRIGHT_DIM, font=attribution_font)

social.save(OUT_DIR / "social-header.png")
print("  -> social-header.png")

print()
print(f"All assets saved to {OUT_DIR}")
