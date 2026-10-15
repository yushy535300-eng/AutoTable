#!/usr/bin/env python3
"""Regenerate approved home icons with Pillow; outputs are committed deploy inputs."""
from pathlib import Path
import hashlib
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'assets/images/autobac-auto-master.png'
with Image.open(source) as opened:
    image = opened.convert('RGB')
assert image.size[0] == image.size[1], 'Approved square artwork must not be cropped'
for size in (32, 180, 192, 512):
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f'public/autobac-auto-v329-{size}.png', optimize=True)
image.resize((180, 180), Image.Resampling.LANCZOS).save(root / 'public/apple-touch-icon.png', optimize=True)
image.resize((512, 512), Image.Resampling.LANCZOS).save(root / 'assets/images/autobac-auto-v329.png', optimize=True)
for name, size in [('icon.png', 1024), ('favicon.png', 64), ('splash-icon.png', 512)]:
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / 'assets/images' / name, optimize=True)
image.resize((64, 64), Image.Resampling.LANCZOS).save(root / 'public/favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64)])
manifest = {
    'id': '/', 'name': '百家自動下注', 'short_name': '百家自動下注',
    'start_url': '/', 'scope': '/', 'display': 'standalone', 'lang': 'zh-Hant',
    'background_color': '#000000', 'theme_color': '#101816',
    'icons': [{'src': f'/autobac-auto-v329-{s}.png', 'sizes': f'{s}x{s}', 'type': 'image/png', 'purpose': 'any'} for s in (192,512)],
}
for name in ('manifest.webmanifest', 'manifest-v329.webmanifest'):
    (root / 'public' / name).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print('Approved AUTO source SHA256:', hashlib.sha256(source.read_bytes()).hexdigest())
print('Created iOS 180px, Android 192/512px, favicon, and application icon; original proportions preserved.')
