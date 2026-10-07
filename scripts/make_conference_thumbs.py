#!/usr/bin/env python3
"""Make small thumbnails for the Conference Trips cards.

For every trip in _conferences/, each photo listed in `highlights:` gets a
480px copy in images/conferences/<trip>/thumbs/. The cards use the thumbnail
when it exists and fall back to the full photo otherwise. Thumbnails of photos
no longer in `highlights:` are removed.

Run from the repository root after changing highlights:
    python3 scripts/make_conference_thumbs.py
"""
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MAX_SIZE = 480

for trip in sorted((ROOT / "_conferences").glob("*.md")):
    match = re.search(r"^highlights:\s*\[(.*?)\]", trip.read_text(encoding="utf-8"), re.M)
    highlights = [h.strip().strip("'\"") for h in match.group(1).split(",") if h.strip()] if match else []
    photo_dir = ROOT / "images" / "conferences" / trip.stem
    thumb_dir = photo_dir / "thumbs"

    for name in highlights:
        src, dst = photo_dir / name, thumb_dir / name
        if not src.exists():
            print(f"  missing photo: {trip.stem}/{name}")
            continue
        if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
            continue
        thumb_dir.mkdir(exist_ok=True)
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            im.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
            im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
        print(f"  made {trip.stem}/thumbs/{name} ({dst.stat().st_size // 1024} KB)")

    if thumb_dir.exists():
        for old in thumb_dir.iterdir():
            if old.name not in highlights:
                old.unlink()
                print(f"  removed {trip.stem}/thumbs/{old.name}")
        if not any(thumb_dir.iterdir()):
            thumb_dir.rmdir()
