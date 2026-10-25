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
    'DG-MOBILE-DIAGNOSTIC.md', 'RENDER_DEPLOY.md', 'AUTOBAC-DEPLOY.md', 'AUTOBAC-V3.1-DEPLOY.md', 'AUTOBAC-V3.2-DEPLOY.md', 'AUTOBAC-V3.2.2-DEPLOY.md', 'AUTOBAC-V3.2.3-DEPLOY.md', 'AUTOBAC-V3.2.4-DEPLOY.md', 'AUTOBAC-V3.2.5-DEPLOY.md', 'AUTOBAC-V3.2.6-DEPLOY.md', 'AUTOBAC-V3.2.7-DEPLOY.md', 'AUTOBAC-V3.2.8-DEPLOY.md', 'AUTOBAC-V3.2.9-DEPLOY.md', 'AUTOBAC-V3.2.10-DEPLOY.md', 'AUTOBAC-V3.2.11-DEPLOY.md', 'AUTOBAC-V3.2.12-DEPLOY.md', 'AUTOBAC-V3.2.13-DEPLOY.md', 'AUTOBAC-V3.2.14-DEPLOY.md', 'LICENSE', 'README.md',
    'tailwind.config.js', 'theme.config.js', 'theme.config.d.ts', 'global.css',
    'nativewind-env.d.ts', 'expo-env.d.ts', 'drizzle.config.ts', 'eslint.config.js',
}
root_files.add('AUTOBAC-V3.2.15-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.16-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.17-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.18-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.19-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.20-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.21-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.22-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.23-DEPLOY.md')
root_files |= {'AUTOBAC-V3.2.24-DEPLOY.md', 'LATEST-BASELINE.json'}
root_files.add('AUTOBAC-V3.2.25-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.26-DEPLOY.md')
root_files.add('AUTOBAC-V3.2.27-DEPLOY.md')
source_dirs = {'app', 'components', 'lib', 'server', 'shared', 'constants', 'hooks', 'scripts', 'drizzle'}
validated_tests = {'user-presence.test.ts','user-presence-client.test.ts','admin-simple-records.test.ts','dg-risk-inputs.test.ts','dg-settings-records.test.ts','dg-settings-recorder.test.ts','dg-preflight-risk.test.ts','dg-risk-acknowledgements.test.ts','dg-usage-history.test.ts','dg-bet-summary.test.ts','dg-homescreen.test.ts','dg-session-timer.test.ts','dg-only-release.test.ts','page-zoom-lock.test.ts','mt-foreground-navigation.test.ts','dg-mobile-v329.test.ts','dg-operation-capture.test.ts','poker-and-access.test.ts','dg-mobile-native.test.ts','dg-mobile-installer.test.ts','game-layout-mode.test.ts','mobile-launch.test.ts','dg-official-turnover.test.ts','mt-official-turnover.test.ts','doubling-staking.test.ts','mt-game-proxy.test.ts','mt-frame-installer.test.ts','dg-frame-installer.test.ts','mt-dg-rules.test.ts','mt-recommendation-adapter.test.ts','mt-road-feed.test.ts','dg-singlepage.test.ts','dg-panel-data.test.ts','dg-limit-check.test.ts','dg-risk-limits.test.ts','dg-table-selection.test.ts'}
validated_tests |= {'dg-manual-ledger.test.ts', 'dg-poker-tracker.test.ts'}
validated_tests |= {'dg-card-frame.test.ts', 'dg-poker-real-data.test.ts', 'poker-strategy-isolation.test.ts'}
validated_tests |= {'dg-manual-receipt-evidence.test.ts'}
source_extensions = {'.ts', '.tsx', '.js', '.cjs', '.mjs', '.css', '.sql', '.md', '.py', '.sh'}
validated_tests |= {'dg-usage-recorder.test.ts', 'dg-usage-records.test.ts', 'admin-audit-reader.test.ts'}
required_source_data = {'lib/sa-table-labels.json'}
asset_dirs = {'assets', 'public'}
rejected_extensions = {'.log', '.har', '.db', '.sqlite', '.sqlite3', '.pem', '.key', '.p12', '.pfx'}
rejected_parts = {'node_modules', '.git', '.expo', 'dist', 'web-dist', '__pycache__', 'data', 'upload', 'profiles', 'browser-profile'}
rejected_names = {'public/dg-singlepage-console.js', 'DG-LOGIN-ONLY-README.md'}

def allowed(name: str) -> bool:
    path = Path(name)
    if name.startswith('public/mt-'):
        return False
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
        return path.name in validated_tests or ('fixtures' in path.parts and path.name in {'dg-mobile-v329-builders.cjs','dg-card-results-anonymous.json','mt-native-bet-observation.json', 'mt-bet-history-today.json'})
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
    "AUTOBAC-V3.2.27-DEPLOY.md", "tests/dg-manual-receipt-evidence.test.ts", "scripts/test-dg-manual-receipt-hold.cjs",
    "AUTOBAC-V3.2.26-DEPLOY.md", "lib/poker-hand.ts", "lib/parity-strategy.ts", "lib/four-formula-strategy.ts", "tests/poker-strategy-isolation.test.ts",
    "AUTOBAC-V3.2.25-DEPLOY.md", "shared/dg-card-frame.ts", "server/dg-card-bridge.ts", "tests/dg-card-frame.test.ts", "tests/dg-poker-real-data.test.ts", "tests/fixtures/dg-card-results-anonymous.json", "scripts/test-dg-passive-card-memory.cjs", "scripts/test-dg-card-bridge.cjs",
    "AUTOBAC-V3.2.24-DEPLOY.md", "LATEST-BASELINE.json", "tests/dg-poker-tracker.test.ts", "scripts/test-dg-poker-strategies.cjs",
    "AUTOBAC-V3.2.23-DEPLOY.md", "scripts/test-dg-initial-settings.cjs",
    "AUTOBAC-V3.2.22-DEPLOY.md", "scripts/test-dg-staking-switch.cjs",
    "AUTOBAC-V3.2.21-DEPLOY.md",
    "AUTOBAC-V3.2.20-DEPLOY.md", "public/admin-brand-v3220.css",
    "AUTOBAC-V3.2.19-DEPLOY.md", "public/admin-brand-v3219.css", "server/admin-online-page.ts",
    "AUTOBAC-V3.2.18-DEPLOY.md", "public/admin-brand-v3218.css", "scripts/test-presence-users-sql.cjs",
    "AUTOBAC-V3.2.17-DEPLOY.md", "lib/dg-manual-ledger.ts", "tests/dg-manual-ledger.test.ts", "scripts/test-dg-manual-combined.cjs", "scripts/test-dg-martingale-manual.cjs",
    "AUTOBAC-V3.2.15-DEPLOY.md", "public/admin-brand-v3215.css", "public/admin-brand-v3215/scarab.png", "public/admin-brand-v3215/autobac.png", "public/admin-brand-v3215/helper.png",
    "AUTOBAC-V3.2.14-DEPLOY.md", "public/admin-version.json",
    'shared/dg-usage-report.ts', 'lib/dg-usage-recorder.ts', 'server/dg-usage-records.ts', 'server/dg-usage-routes.ts', 'server/admin-audit-reader.ts',
    'tests/dg-usage-recorder.test.ts', 'tests/dg-usage-records.test.ts', 'tests/admin-audit-reader.test.ts', 'scripts/test-dg-usage-sql.cjs', 'scripts/test-admin-records-visual.cjs',
    "AUTOBAC-V3.2.13-DEPLOY.md", "server/user-presence.ts", "lib/user-presence-client.ts", "server/admin-record-view.ts", "tests/user-presence.test.ts", "tests/user-presence-client.test.ts", "tests/admin-simple-records.test.ts",
    'AUTOBAC-V3.2.11-DEPLOY.md', 'AUTOBAC-V3.2.12-DEPLOY.md', 'shared/dg-settings-snapshot.ts', 'lib/dg-settings-recorder.ts', 'server/dg-settings-records.ts', 'server/dg-settings-routes.ts', 'tests/dg-settings-records.test.ts', 'tests/dg-settings-recorder.test.ts', 'tests/dg-preflight-risk.test.ts', 'scripts/test-dg-risk-settings.cjs',
    'AUTOBAC-V3.2.10-DEPLOY.md', 'shared/dg-risk-statement.ts', 'lib/dg-risk-recorder.ts', 'server/risk-acknowledgements.ts', 'server/risk-acknowledgement-routes.ts', 'tests/dg-risk-acknowledgements.test.ts',
    "lib/dg-usage-history.ts", "tests/dg-usage-history.test.ts",
    "AUTOBAC-V3.2.9-DEPLOY.md", "components/autobac-logo.tsx", "assets/images/autobac-auto-master.png", "assets/images/autobac-auto-v329.png", "public/manifest-v329.webmanifest", "public/autobac-auto-v329-180.png", "public/autobac-auto-v329-192.png", "public/autobac-auto-v329-512.png", "public/autobac-auto-v329-32.png", "scripts/prepare-auto-icons.py",
    'AUTOBAC-V3.2.8-DEPLOY.md', 'lib/dg-bet-summary.ts', 'tests/dg-bet-summary.test.ts', 'scripts/test-dg-panel-text.cjs', 'assets/images/line-official.png', 'assets/LINE-LOGO-SOURCE.md',
    'public/manifest.webmanifest', 'tests/dg-homescreen.test.ts',
    'AUTOBAC-V3.2.7-DEPLOY.md', 'lib/dg-session-timer.ts', 'lib/dg-panel-touch-scroll.ts', 'tests/dg-session-timer.test.ts', 'scripts/test-dg-panel-usage.cjs',
    'AUTOBAC-V3.2.5-DEPLOY.md', 'tests/dg-official-turnover.test.ts',
    'AUTOBAC-V3.2.4-DEPLOY.md', 'shared/page-zoom-lock.ts', 'tests/page-zoom-lock.test.ts', 'tests/mt-foreground-navigation.test.ts', 'scripts/test-page-zoom-lock.cjs',
    'Dockerfile', 'package.json', 'pnpm-lock.yaml', 'app/index.tsx',
    'tailwind.config.js', 'theme.config.js', 'global.css', 'lib/sa-table-labels.json',
    'components/autobac-access.tsx', 'components/autobac-platform-choice.tsx',
    'lib/legacy-platform-screen.tsx', 'lib/dg-frame-installer.ts', 'lib/mt-frame-installer.ts',
    'lib/dg-console-entry.ts', 'lib/dg-operation-capture.ts', 'DG-MOBILE-DIAGNOSTIC.md', 'lib/mt-click-console-entry.ts',
    'lib/dg-official-turnover.ts', 'lib/mt-official-turnover.ts',
    'scripts/mt-diagnostic-base.js', 'scripts/build-dg-console.cjs',
    'scripts/build-mt-click-console.cjs', 'server/_core/index.ts',
    'server/mt-game-proxy.ts', 'server/dg-game-proxy.ts',
    'public/dg-direct-bet-console.js', 'server/mt-disabled.ts', 'scripts/prepare-dg-only.cjs', 'tests/dg-only-release.test.ts', 'AUTOBAC-V3.2.6-DEPLOY.md',
    'AUTOBAC-V3.2.3-DEPLOY.md','AUTOBAC-V3.2.2-DEPLOY.md','tests/dg-mobile-v329.test.ts','tests/fixtures/dg-mobile-v329-builders.cjs','scripts/test-dg-mobile-v329-complete.cjs','scripts/test-dg-mobile-site.cjs',
    'AUTOBAC-V3-DEPLOY.md', 'AUTOBAC-V3.1-DEPLOY.md', 'AUTOBAC-V3.2-DEPLOY.md', 'public/autobac-version.json', 'lib/dg-scene.ts', 'lib/dg-panel-mobile-layout.ts', 'lib/poker-strategies.ts', 'shared/mt-access-page.ts', 'shared/mt-origins.ts', 'lib/game-device.ts',
]
for name in required:
    if not entries.get(name):
        raise SystemExit(f'Missing required deploy input: {name}')
package = json.loads(entries['package.json'])
if 'build:dg' not in package['scripts']['build'] or 'build:mt' in package['scripts']['build']:
    raise SystemExit('DG-only production build must build DG and must not build MT')
manifest = {'version': 'AutoBac-' + json.loads(entries['public/autobac-version.json'])['version'], 'files': {name: hashlib.sha256(data).hexdigest() for name, data in sorted(entries.items())}}
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
