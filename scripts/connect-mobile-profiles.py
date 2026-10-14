#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'app/index.tsx';s=p.read_text()
def replace(a,b):
 global s
 if a not in s:raise RuntimeError(a[:100])
 s=s.replace(a,b,1)
replace("import { detectGameDevice } from '@/lib/game-device';", "import { detectGameDevice, type GameDevice } from '@/lib/game-device';")
replace("type GamePlatform } from '@/components/autobac-platform-choice';", "type GamePlatform, type GameLayout } from '@/components/autobac-platform-choice';")
replace('preserveDgFrameLedger }', 'preserveDgFrameLedger, exportDgFrameMobilePublicSources }')
replace("const [selected, setSelected] = useState<GamePlatform | null>(null);", "const [selected, setSelected] = useState<GamePlatform | null>(null);\n  const [gameDevice, setGameDevice] = useState<GameDevice>('Desktop');")
replace('new Map<GamePlatform, { sessionId: string;', 'new Map<string, { sessionId: string;')
replace('async (current: Auth, target: GamePlatform) => {', 'async (current: Auth, target: GamePlatform, device: GameDevice) => {')
replace('let cache = launchCache.current.get(target);', 'const cacheKey = `${target}:${device}`;\n      let cache = launchCache.current.get(cacheKey);')
replace('        const device = detectGameDevice();\n', '')
replace('launchCache.current.set(target, cache);', 'launchCache.current.set(cacheKey, cache);')
replace('if (launchCache.current.get(target)?.promise === promise) launchCache.current.delete(target);', 'if (launchCache.current.get(cacheKey)?.promise === promise) launchCache.current.delete(cacheKey);')
replace('void launch(auth, selected); }, [auth, selected, launch]', 'void launch(auth, selected, gameDevice); }, [auth, selected, gameDevice, launch]')
replace('    let attempts = 0;\n    const tick =', "    let attempts = 0, hallAttempts = 0;\n    const mode = gameDevice === 'Mobile' && /^\\/ddnewwap\\//.test(gameUrl) ? 'mobile' : 'desktop';\n    const tick =")
replace('const hall = ensureDgMultiHall(frame);', 'const hall = ensureDgMultiHall(frame, mode);')
replace("setMessage(hall === 'requested' ? '正在自動切到 DG 多桌廳…' : '等待 DG 原生多桌入口…');", "setMessage(hall === 'requested' ? '正在自動切到 DG 多桌廳…' : mode === 'mobile' ? '等待核對 DG 原生手機多桌引擎，尚未安裝下注面板…' : '等待 DG 原生多桌入口…');\n        hallAttempts++;\n        if (mode === 'mobile' && (hall === 'unavailable' || hallAttempts >= 60)) setError('DG 原生手機引擎尚未完成版本核對；沒有下注。請返回選平台改用「建議相容」，或匯出手機腳本清單供後續核對。');")
replace("if (hall === 'unavailable') setError('未能確認 DG 多桌廳入口，尚未開始下注；請核對平台版本或重連。');", "if (hall === 'unavailable' && mode === 'desktop') setError('未能確認 DG 多桌廳入口，尚未開始下注；請核對平台版本或重連。');")
replace('const outcome = installDgFramePanel(frame);', 'const outcome = installDgFramePanel(frame, mode);')
replace('}, [auth, gameUrl, authInvalid, selected]);', '}, [auth, gameUrl, authInvalid, selected, gameDevice]);')
replace('void launch(auth, selected);\n  }', 'void launch(auth, selected, gameDevice);\n  }')
replace("if (!selected) return <AutoBacPlatformChoice onChoose={(target) => { if (!authInvalid) { setSelected(target); setDeparture(null); } }} onLogout={() => signOut()} />;", "if (!selected) return <AutoBacPlatformChoice onChoose={(target, layout: GameLayout = 'compatible') => { if (!authInvalid) {\n    const detected = detectGameDevice();\n    const device: GameDevice = layout === 'native' ? 'Mobile' : layout === 'desktop' || target === 'DG' ? 'Desktop' : detected;\n    setGameDevice(device); setSelected(target); setDeparture(null);\n  } }} onLogout={() => signOut()} />;")
replace("ensureDgMultiHall(frameRef.current); },", "ensureDgMultiHall(frameRef.current, gameDevice === 'Mobile' && /^\\/ddnewwap\\//.test(gameUrl) ? 'mobile' : 'desktop'); },")
replace("  const mt = selected === 'MT';", "  function exportMobileSourceList() {\n    const data = exportDgFrameMobilePublicSources(frameRef.current);\n    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});\n    const url = URL.createObjectURL(blob), node = document.createElement('a');\n    node.href = url; node.download = 'DG-mobile-script-list.json'; node.click();\n    setTimeout(() => URL.revokeObjectURL(url), 1000);\n  }\n  const mt = selected === 'MT';")
replace("{error ? <View style={s.errorBox}>", "{selected === 'DG' && gameDevice === 'Mobile' && !installed && gameUrl ? <View style={[s.mtStatus,{bottom:46}]}><Pressable onPress={exportMobileSourceList}><Text style={s.toolText}>匯出 DG 手機腳本清單（不含憑證）</Text></Pressable></View> : null}\n      {error ? <View style={s.errorBox}>")
p.write_text(s)
p=root/'components/autobac-platform-choice.tsx';s=p.read_text()
s=s.replace("import { Pressable,", "import { useState } from 'react';\nimport { Pressable,",1)
s=s.replace("export type GamePlatform = 'MT' | 'DG';", "export type GamePlatform = 'MT' | 'DG';\nexport type GameLayout = 'compatible' | 'native' | 'desktop';",1)
s=s.replace('onChoose: (platform: GamePlatform) => void;', 'onChoose: (platform: GamePlatform, layout?: GameLayout) => void;',1)
s=s.replace('  const short = height < 480;', "  const short = height < 480;\n  const [layout,setLayout] = useState<GameLayout>('compatible');",1)
s=s.replace("onPress={() => onChoose(target)}", "onPress={() => onChoose(target,layout)}",1)
s=s.replace('    <View style={[s.cards, short && s.cardsShort]}>', '''    <View style={s.layoutBlock}>
      <View style={s.layoutRow}>{([
        ['compatible','建議相容'], ['native','原生手機'], ['desktop','電腦版'],
      ] as [GameLayout,string][]).map(([value,label])=><Pressable key={value} testID={`layout-${value}`} accessibilityRole="radio" accessibilityState={{checked:layout===value}} onPress={()=>setLayout(value)} style={[s.layoutOption,layout===value&&s.layoutSelected]}><Text style={s.layoutText}>{label}</Text></Pressable>)}</View>
      <Text style={s.layoutHint}>{layout==='native'?'原生手機：MT已接線；DG手機引擎待核對，未核對前不安裝下注面板。':layout==='compatible'?'建議相容：手機MT使用原生版，DG使用已可用的電腦相容版。':'電腦版：兩平台都使用Desktop授權與既有電腦流程。'}</Text>
    </View>
    <View style={[s.cards, short && s.cardsShort]}>''',1)
s=s.replace('  page: { flex: 1,', "  layoutBlock: {width:'100%',maxWidth:760,marginBottom:18}, layoutRow:{flexDirection:'row',gap:8},layoutOption:{flex:1,paddingVertical:10,borderRadius:8,borderWidth:1,borderColor:'#294859',backgroundColor:'#10202c',alignItems:'center'},layoutSelected:{borderColor:'#83bda9',backgroundColor:'#203c36'},layoutText:{color:'#d8e8e3',fontSize:11,fontWeight:'600'},layoutHint:{fontSize:10,lineHeight:17,color:'#9cb3bd',marginTop:8,textAlign:'center'},\n  page: { flex: 1,",1)
p.write_text(s)
print('Profile-aware launch and explicit compatibility UI connected')
