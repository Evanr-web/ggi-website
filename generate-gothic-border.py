#!/usr/bin/env python3
"""Generate a precise Gothic Revival border tile SVG.
Three-band design: rosette frieze / quatrefoil medallion / rosette frieze.
Designed to tile horizontally via background-repeat: repeat-x."""

import math

# === DIMENSIONS (units) ===
BAR = 3            # bar/divider thickness
CELL_LG = 80       # quatrefoil cell interior (square)
CELL_SM = 26       # rosette cell interior (square) — 3 fit across one CELL_LG
DIV_SM = (CELL_LG - 3 * CELL_SM) / 2  # divider between rosette cells

TILE_W = CELL_LG + BAR  # repeat width
TILE_H = BAR + CELL_SM + BAR + CELL_LG + BAR + CELL_SM + BAR

GOLD = "#b89a47"
WHITE = "#ffffff"


def rosette_svg(cx, cy, size):
    """6-petal rosette: white petals on gold, gold center dot."""
    r_petal = size * 0.17
    d_petal = size * 0.26
    r_center = size * 0.13
    parts = []
    for i in range(6):
        angle = math.pi / 2 + i * math.pi / 3
        px = cx + d_petal * math.cos(angle)
        py = cy - d_petal * math.sin(angle)
        parts.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{r_petal:.1f}" fill="{WHITE}"/>')
    parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r_center:.1f}" fill="{GOLD}"/>')
    return "\n    ".join(parts)


def quatrefoil_path(cx, cy, R):
    """Quatrefoil: 4 lobes at cardinal directions. Returns SVG path string."""
    R_lobe = R * 0.42
    D = R * 0.58  # distance from center to lobe center

    lobes = [
        (cx, cy - D),   # top
        (cx + D, cy),   # right
        (cx, cy + D),   # bottom
        (cx - D, cy),   # left
    ]

    # Find outer intersection points between adjacent lobe circles
    cusps = []
    for i in range(4):
        x1, y1 = lobes[i]
        x2, y2 = lobes[(i + 1) % 4]
        dx, dy = x2 - x1, y2 - y1
        d = math.sqrt(dx * dx + dy * dy)
        a = d / 2
        if R_lobe * R_lobe - a * a < 0:
            # Circles don't intersect — increase lobe size
            h = 0
        else:
            h = math.sqrt(R_lobe * R_lobe - a * a)
        mx = x1 + a * dx / d
        my = y1 + a * dy / d
        px, py = -dy / d, dx / d
        p1 = (mx + h * px, my + h * py)
        p2 = (mx - h * px, my - h * py)
        # Choose outer point (farther from center)
        d1 = math.sqrt((p1[0] - cx) ** 2 + (p1[1] - cy) ** 2)
        d2 = math.sqrt((p2[0] - cx) ** 2 + (p2[1] - cy) ** 2)
        cusps.append(p1 if d1 > d2 else p2)

    # Build path: large arc on each lobe from cusp to cusp
    d = f"M {cusps[3][0]:.2f},{cusps[3][1]:.2f} "
    for i in range(4):
        end = cusps[i]
        d += f"A {R_lobe:.2f},{R_lobe:.2f} 0 1,1 {end[0]:.2f},{end[1]:.2f} "
    d += "Z"
    return d


def generate():
    y_top = BAR  # top rosette band start
    y_qf = BAR + CELL_SM + BAR  # quatrefoil band start
    y_bot = BAR + CELL_SM + BAR + CELL_LG + BAR  # bottom rosette band start

    qcx = CELL_LG / 2
    qcy = y_qf + CELL_LG / 2
    R_enc = CELL_LG * 0.45

    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TILE_W} {TILE_H}">')

    # Full gold background
    lines.append(f'<rect width="{TILE_W}" height="{TILE_H}" fill="{GOLD}"/>')

    # --- TOP ROSETTE BAND: 3 rosettes ---
    for i in range(3):
        x_off = i * (CELL_SM + DIV_SM)
        rcx = x_off + CELL_SM / 2
        rcy = y_top + CELL_SM / 2
        lines.append(rosette_svg(rcx, rcy, CELL_SM))

    # --- BOTTOM ROSETTE BAND: 3 rosettes ---
    for i in range(3):
        x_off = i * (CELL_SM + DIV_SM)
        rcx = x_off + CELL_SM / 2
        rcy = y_bot + CELL_SM / 2
        lines.append(rosette_svg(rcx, rcy, CELL_SM))

    # --- QUATREFOIL BAND ---
    # White cell interior
    lines.append(f'<rect x="0" y="{y_qf}" width="{CELL_LG}" height="{CELL_LG}" fill="{WHITE}"/>')

    # Gold spandrels (square minus circle) using evenodd fill
    lines.append(
        f'<path d="M0,{y_qf} h{CELL_LG} v{CELL_LG} h-{CELL_LG}Z '
        f'M{qcx + R_enc:.1f},{qcy:.1f} '
        f'A{R_enc:.1f},{R_enc:.1f} 0 1,0 {qcx - R_enc:.1f},{qcy:.1f} '
        f'A{R_enc:.1f},{R_enc:.1f} 0 1,0 {qcx + R_enc:.1f},{qcy:.1f}Z" '
        f'fill="{GOLD}" fill-rule="evenodd"/>'
    )

    # Circle outline
    lines.append(f'<circle cx="{qcx:.1f}" cy="{qcy:.1f}" r="{R_enc:.1f}" fill="none" stroke="{GOLD}" stroke-width="1.5"/>')

    # Gold quatrefoil shape (fills the lobes with gold, then we'll overlay white)
    qf = quatrefoil_path(qcx, qcy, R_enc)

    # The area between circle and quatrefoil lobes should be gold (it already is from spandrels)
    # The quatrefoil interior should be white
    # So: draw quatrefoil filled white
    lines.append(f'<path d="{qf}" fill="{WHITE}" stroke="{GOLD}" stroke-width="1.2"/>')

    # Inner rosette at center
    inner_r = R_enc * 0.28
    lines.append(f'<circle cx="{qcx:.1f}" cy="{qcy:.1f}" r="{inner_r:.1f}" fill="{GOLD}"/>')
    lines.append(rosette_svg(qcx, qcy, inner_r * 2.2))

    # --- DIVIDER BARS ---
    # Right vertical bar (for tiling)
    lines.append(f'<rect x="{CELL_LG}" y="0" width="{BAR}" height="{TILE_H}" fill="{GOLD}"/>')

    # Horizontal bars are implicit (gold background shows through)
    # But add subtle inner lines for rosette cell divisions
    for i in range(1, 3):
        x = i * (CELL_SM + DIV_SM) - DIV_SM / 2
        # Top band vertical dividers
        lines.append(f'<rect x="{x:.1f}" y="{y_top}" width="{DIV_SM:.1f}" height="{CELL_SM}" fill="{GOLD}"/>')
        # Bottom band vertical dividers
        lines.append(f'<rect x="{x:.1f}" y="{y_bot}" width="{DIV_SM:.1f}" height="{CELL_SM}" fill="{GOLD}"/>')

    lines.append('</svg>')
    return "\n".join(lines)


if __name__ == "__main__":
    svg = generate()
    out = "public/images/gothic-border-tile.svg"
    with open(out, "w") as f:
        f.write(svg)
    print(f"Generated {out} — {TILE_W}x{TILE_H} tile")
