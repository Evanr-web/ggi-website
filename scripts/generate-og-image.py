#!/usr/bin/env python3
"""
Generate branded OG images (1200×630) for GGI library items.

Usage:
    python3 scripts/generate-og-image.py <background-image> <title> [output-path]

Examples:
    python3 scripts/generate-og-image.py public/images/art/parliament-hill-ottawa.jpg \
        "FINE Gathering in Ottawa and National Prayer Breakfast"

    python3 scripts/generate-og-image.py public/images/events/finances-placeholder.jpg \
        "Master Your Money, Serve Your Vocation" \
        output/og-personal-finances.jpg

If output-path is omitted, saves to output/og-<slugified-title>.jpg

Design:
    - Background: source image cropped to 1200×630, with navy overlay (65% opacity)
    - Title: Georgia Bold, white, centered, auto-sized to fit
    - Divider: gold horizontal rule below title
    - Subtitle: "Gregory the Great Institute" in gold small caps
    - Seal: GGI seal in bottom-right corner (subtle, 30% opacity)
"""

import os
import sys
import re
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# --- Config ---
OG_WIDTH = 1200
OG_HEIGHT = 630
NAVY = (14, 51, 82)        # #0e3352
GOLD = (184, 154, 71)      # #b89a47
WHITE = (255, 255, 255)
OVERLAY_OPACITY = 0.65
SEAL_OPACITY = 0.55

# Fonts (macOS paths)
FONT_TITLE = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
FONT_SUBTITLE = "/System/Library/Fonts/Supplemental/Georgia.ttf"

# Branding
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
SEAL_PATH = PROJECT_ROOT / "public" / "images" / "branding" / "ggi-seal.png"
OUTPUT_DIR = PROJECT_ROOT / "output"


def slugify(text: str) -> str:
    """Simple slugifier for filenames."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text[:60].strip('-')


def wrap_title(title: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Word-wrap title to fit within max_width pixels."""
    words = title.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = font.getbbox(test_line)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)

    return lines


def find_best_font_size(title: str, max_width: int, max_height: int) -> tuple:
    """Find the largest font size that fits the title in the given area."""
    for size in range(56, 24, -2):
        font = ImageFont.truetype(FONT_TITLE, size)
        lines = wrap_title(title, font, max_width)

        # Calculate total text height
        line_height = int(size * 1.3)
        total_height = line_height * len(lines)

        if total_height <= max_height and len(lines) <= 5:
            return font, lines, line_height, size

    # Fallback to smallest
    font = ImageFont.truetype(FONT_TITLE, 24)
    lines = wrap_title(title, font, max_width)
    return font, lines, int(24 * 1.3), 24


def generate_og_image(bg_path: str, title: str, output_path: str = None):
    """Generate a branded OG image."""

    # --- Load and crop background ---
    bg = Image.open(bg_path).convert("RGB")

    # Crop to 1200×630 aspect ratio from center
    bg_ratio = bg.width / bg.height
    target_ratio = OG_WIDTH / OG_HEIGHT

    if bg_ratio > target_ratio:
        # Too wide — crop sides
        new_width = int(bg.height * target_ratio)
        left = (bg.width - new_width) // 2
        bg = bg.crop((left, 0, left + new_width, bg.height))
    else:
        # Too tall — crop top/bottom
        new_height = int(bg.width / target_ratio)
        top = (bg.height - new_height) // 3  # bias toward top third
        bg = bg.crop((0, top, bg.width, top + new_height))

    bg = bg.resize((OG_WIDTH, OG_HEIGHT), Image.LANCZOS)

    # Slight blur to push background back
    bg = bg.filter(ImageFilter.GaussianBlur(radius=2))

    # Darken slightly
    enhancer = ImageEnhance.Brightness(bg)
    bg = enhancer.enhance(0.7)

    # --- Navy overlay ---
    overlay = Image.new("RGBA", (OG_WIDTH, OG_HEIGHT), (*NAVY, int(255 * OVERLAY_OPACITY)))
    bg = bg.convert("RGBA")
    bg = Image.alpha_composite(bg, overlay)

    draw = ImageDraw.Draw(bg)

    # --- Title ---
    padding_x = 100
    max_text_width = OG_WIDTH - (padding_x * 2)
    max_text_height = 300

    font, lines, line_height, font_size = find_best_font_size(title, max_text_width, max_text_height)

    # Calculate vertical position (centered in upper 2/3)
    total_text_height = line_height * len(lines)
    title_y_start = (OG_HEIGHT - total_text_height) // 2 - 40

    for i, line in enumerate(lines):
        bbox = font.getbbox(line)
        text_width = bbox[2] - bbox[0]
        x = (OG_WIDTH - text_width) // 2
        y = title_y_start + (i * line_height)
        draw.text((x, y), line, fill=WHITE, font=font)

    # --- Gold divider ---
    divider_y = title_y_start + total_text_height + 20
    divider_width = min(200, max_text_width // 3)
    divider_x = (OG_WIDTH - divider_width) // 2
    draw.rectangle(
        [divider_x, divider_y, divider_x + divider_width, divider_y + 2],
        fill=GOLD
    )

    # --- Subtitle ---
    subtitle_font = ImageFont.truetype(FONT_SUBTITLE, 18)
    subtitle = "GREGORY THE GREAT INSTITUTE"
    bbox = subtitle_font.getbbox(subtitle)
    subtitle_width = bbox[2] - bbox[0]
    subtitle_x = (OG_WIDTH - subtitle_width) // 2
    subtitle_y = divider_y + 18
    draw.text((subtitle_x, subtitle_y), subtitle, fill=GOLD, font=subtitle_font)

    # --- Seal (bottom-right, subtle) ---
    if SEAL_PATH.exists():
        seal = Image.open(SEAL_PATH).convert("RGBA")
        seal_size = 100
        seal = seal.resize((seal_size, seal_size), Image.LANCZOS)

        # Apply opacity
        alpha = seal.split()[3]
        alpha = alpha.point(lambda p: int(p * SEAL_OPACITY))
        seal.putalpha(alpha)

        seal_x = OG_WIDTH - seal_size - 30
        seal_y = OG_HEIGHT - seal_size - 25
        bg.paste(seal, (seal_x, seal_y), seal)

    # --- Save ---
    bg = bg.convert("RGB")

    if output_path is None:
        OUTPUT_DIR.mkdir(exist_ok=True)
        slug = slugify(title)
        output_path = str(OUTPUT_DIR / f"og-{slug}.jpg")

    # Ensure output directory exists
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    bg.save(output_path, "JPEG", quality=90, optimize=True)
    file_size = os.path.getsize(output_path)
    print(f"✅ Generated: {output_path} ({file_size // 1024}KB)")
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 generate-og-image.py <background-image> <title> [output-path]")
        sys.exit(1)

    bg_path = sys.argv[1]
    title = sys.argv[2]
    output = sys.argv[3] if len(sys.argv) > 3 else None

    if not os.path.exists(bg_path):
        print(f"❌ Background image not found: {bg_path}")
        sys.exit(1)

    generate_og_image(bg_path, title, output)
