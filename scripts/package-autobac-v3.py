#!/usr/bin/env python3
"""Package the AutoBac source baseline without local credentials or account captures."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True, type=Path)
parser.add_argument('--base', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
root_files = {
    '.dockerignore', '.gitignore', 'Dockerfile', 'package.json', 'pnpm-lock.yaml',
    'app.config.ts', 'app.config.js', 'babel.config.js', 'metro.config.js',
    'tsconfig.json', 'start-production.sh', 'AUTOBAC-V3-DEPLOY.md',
    'RENDER_DEPLOY.md', 'AUTOBAC-DEPLOY.md', 'AUTOBAC-V3.1-DEPLOY.md', 'LICENSE', 'README.md',
    'tailwind.config.js', 'theme.config.js', 'theme.config.d.ts', 'global.css',
    'nativewind-env.d.ts', 'expo-env.d.ts', 'drizzle.config.ts', 'eslint.config.js',
}
source_dirs = {'app', 'components', 'lib', 'server', 'shared', 'constants', 'hooks', 'scripts', 'drizzle'}
validated_tests = {'dg-mobile-native.test.ts','dg-mobile-installer.test.ts','game-layout-mode.test.ts','mobile-launch.test.ts','dg-official-turnover.test.ts','mt-official-turnover.test.ts','doubling-staking.test.ts','mt-game-proxy.test.ts','mt-frame-installer.test.ts','dg-frame-installer.test.ts','mt-dg-rules.test.ts','mt-recommendation-adapter.test.ts','mt-road-feed.test.ts','dg-singlepage.test.ts','dg-panel-data.test.ts','dg-limit-check.test.ts','dg-risk-limits.test.ts','dg-table-selection.test.ts'}
source_extensions = {'.ts', '.tsx', '.js', '.cjs', '.mjs', '.css', '.sql', '.md', '.py', '.sh'}
required_source_data = {'lib/sa-table-labels.json'}
asset_dirs = {'assets', 'public'}
rejected_extensions = {'.log', '.har', '.db', '.sqlite', '.sqlite3', '.pem', '.key', '.p12', '.pfx'}
rejected_parts = {'node_modules', '.git', '.expo', 'dist', 'web-dist', '__pycache__', 'data', 'upload', 'profiles', 'browser-profile'}
rejected_names = {'public/dg-singlepage-console.js', 'DG-LOGIN-ONLY-README.md'}

def allowed(name: str) -> bool:
    path = Path(name)
    if name in rejected_names or path.is_absolute() or '..' in path.parts:
        return False
    if any(part in rejected_parts for part in path.parts):
        return False
    if path.name.startswith('.env') or path.suffix.lower() in rejected_extensions:
        return False
    if any(word in path.name.lower() for word in ['credential', 'cookie', 'private-key', 'session-config']):
        return False
    if name in root_files:
        return True
    if not path.parts:
        return False
    if path.parts[0] in asset_dirs:
        return path.suffix.lower() not in {'.zip', '.map'}
    if path.parts[0] in source_dirs:
        return path.suffix.lower() in source_extensions or name in required_source_data
    # Anonymous unit-test sources are part of this reviewable source package.
    if path.parts[0] == 'tests':
        return path.name in validated_tests or ('fixtures' in path.parts and path.name in {'mt-native-bet-observation.json', 'mt-bet-history-today.json'})
    return False

entries: dict[str, bytes] = {}
if args.base:
    with zipfile.ZipFile(args.base) as archive:
        for info in archive.infolist():
            if not info.is_dir() and allowed(info.filename):
                entries[info.filename] = archive.read(info)
for directory in source_dirs | asset_dirs | {'tests'}:
    folder = root / directory
    if folder.exists():
        for file in folder.rglob('*'):
            if file.is_file():
                name = file.relative_to(root).as_posix()
                if allowed(name):
                    entries[name] = file.read_bytes()
for name in root_files:
    file = root / name
    if file.is_file():
        entries[name] = file.read_bytes()

required = [
    'Dockerfile', 'package.json', 'pnpm-lock.yaml', 'app/index.tsx',
    'tailwind.config.js', 'theme.config.js', 'global.css', 'lib/sa-table-labels.json',
    'components/autobac-access.tsx', 'components/autobac-platform-choice.tsx',
    'lib/legacy-platform-screen.tsx', 'lib/dg-frame-installer.ts', 'lib/mt-frame-installer.ts',
    'lib/dg-console-entry.ts', 'lib/mt-click-console-entry.ts',
    'lib/dg-official-turnover.ts', 'lib/mt-official-turnover.ts',
    'scripts/mt-diagnostic-base.js', 'scripts/build-dg-console.cjs',
    'scripts/build-mt-click-console.cjs', 'server/_core/index.ts',
    'server/mt-game-proxy.ts', 'server/dg-game-proxy.ts',
    'public/dg-direct-bet-console.js', 'public/mt-native-click-console.js',
    'AUTOBAC-V3-DEPLOY.md', 'AUTOBAC-V3.1-DEPLOY.md', 'shared/mt-origins.ts', 'lib/game-device.ts',
]
for name in required:
    if not entries.get(name):
        raise SystemExit(f'Missing required deploy input: {name}')
package = json.loads(entries['package.json'])
if 'build:dg' not in package['scripts']['build'] or 'build:mt' not in package['scripts']['build']:
    raise SystemExit('Production build must include both platform engines')
manifest = {'version': 'AutoBac-3.1', 'files': {name: hashlib.sha256(data).hexdigest() for name, data in sorted(entries.items())}}
entries['AUTOBAC-MANIFEST.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
args.output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    for name, content in sorted(entries.items()):
        archive.writestr(name, content)
with zipfile.ZipFile(args.output) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist()) == len(set(archive.namelist()))
    for name in required:
        assert archive.read(name) == entries[name]
print(args.output.resolve())
print(f'{len(entries)} complete files; {args.output.stat().st_size} bytes')
