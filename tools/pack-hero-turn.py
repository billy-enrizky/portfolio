"""Crop the OpenBrowser mark to a square, or pack rendered frames into the sprite sheet.

Crop:  uv run --with pillow python tools/pack-hero-turn.py crop LOGO_PNG SQUARE_PNG
Pack:  uv run --with pillow python tools/pack-hero-turn.py pack FRAMES_DIR SPRITE_WEBP
"""
import logging
import sys
from pathlib import Path

from PIL import Image

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("hero-turn")
COLS, ROWS, CELL = 6, 4, 360


def crop(logo_path: Path, out_path: Path) -> None:
    image = Image.open(logo_path).convert("RGBA")
    box = image.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    mark = image.crop(box)
    side = max(mark.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
    square.resize((1024, 1024), Image.LANCZOS).save(out_path)
    log.info("wrote %s from alpha box %s", out_path, box)


def pack(frames_dir: Path, out_path: Path) -> None:
    sheet = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
    for i in range(COLS * ROWS):
        frame = Image.open(frames_dir / f"f{i:02d}.png").convert("RGBA").resize((CELL, CELL), Image.LANCZOS)
        sheet.paste(frame, ((i % COLS) * CELL, (i // COLS) * CELL))
    sheet.save(out_path, "WEBP", quality=86, method=6)
    log.info("wrote %s, %d bytes, %s", out_path, out_path.stat().st_size, sheet.size)


if __name__ == "__main__":
    mode, source, target = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
    {"crop": crop, "pack": pack}[mode](source, target)
