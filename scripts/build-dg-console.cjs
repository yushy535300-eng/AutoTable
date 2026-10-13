const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'lib/legacy-platform-screen.tsx'), 'utf8');
const slice = (a,b) => app.slice(app.indexOf(a), app.indexOf(b,app.indexOf(a)));
const source = `// 自原始 legacy-platform-screen.tsx 抽取；本地策略，未呼叫任何 AI API。\nimport { buildDerivedRoad, buildAskRoad } from './road-render';\ntype Result = '莊' | '閒' | '和';\ntype AiProvider = 'chatgpt' | 'gemini' | 'grok' | 'meta' | 'combined' | 'road';\ntype TableData = {results:Result[]};\n${slice('const AI_PROVIDER_OPTIONS:', 'const RADAR_PREDICT_OPTIONS:')}\n${slice('type PatternInfo =', 'function strategyAmount(')}\nexport {localProviderDecision, providerAnalysisText, getPatternInfo, AI_PROVIDER_OPTIONS};\n`;
fs.writeFileSync(path.join(root,'lib/dg-original-ai.ts'),source);
esbuild.buildSync({entryPoints:[path.join(root,'lib/dg-console-entry.ts')],outfile:path.join(root,'public/dg-direct-bet-console.js'),bundle:true,format:'iife',target:'es2022',platform:'browser',legalComments:'none',banner:{js:'/*\n'+fs.readFileSync(path.join(root,'assets/dg-strategies/LICENSE-Lobe-Icons'),'utf8')+'*/\n/* DG 單頁多桌直接訊息下注；僅在 DG 同源頁面執行。不點擊按鈕；初始為停止。 */'}});
const js=fs.readFileSync(path.join(root,'public/dg-direct-bet-console.js'),'utf8');
fs.writeFileSync(path.join(root,'lib/dg-console-source.ts'),'// 自 scripts/build-dg-console.cjs 產生\nexport const DG_CONSOLE_SOURCE = '+JSON.stringify(js)+';\n');
// 產出保留於專案 public，不使用特定電腦的絕對路徑。
console.log('DG console generated:',js.length,'characters');
