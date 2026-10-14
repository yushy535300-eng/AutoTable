import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { AUTOBAC_BRAND as brand, openBrandLink } from '@/lib/autobac-brand';
import type { GamePlatform } from './autobac-platform-choice';

type HeaderProps = { platform: GamePlatform; installed: boolean; disabled?: boolean; onReconnect: () => void; onLogout: () => void; onSelectPlatform: () => void; onDiagnostics?: () => void; onRecord?: () => void; recording?: boolean };

export function AutoBacGameHeader({ platform, installed, disabled, onReconnect, onLogout, onSelectPlatform, onDiagnostics, onRecord, recording }: HeaderProps) {
  const { width } = useWindowDimensions();
  const [collapsed, setCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const small = width < 850;
  useEffect(() => {
    if (!helpOpen || typeof window === 'undefined') return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setHelpOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [helpOpen]);
  return <>
    <View testID="autobac-game-header" style={[s.header, small && s.headerMobile, collapsed && s.headerCollapsed]}>
      <View style={[s.identity, small && s.identityMobile]}>
        <View style={[s.mark, collapsed && s.markSmall]}><Text style={s.markText}>AB</Text></View>
        <View><Text style={s.kicker}>{small ? (installed ? `${platform} · 面板已載入` : (platform === 'MT' ? 'MT · 原生平台' : 'DG · 正在載入')) : 'BACCARAT AUTOMATION'}</Text><View style={s.titleRow}><Text style={s.title}>{brand.name}</Text><Text style={s.chinese}>{brand.chineseName}</Text></View></View>
        {!collapsed ? <Pressable testID="header-threads" accessibilityRole="link" accessibilityLabel="Threads MT工程師 @uss0857" onPress={() => openBrandLink('threads')} style={({ pressed }) => [s.signature, pressed && s.pressed]}><FontAwesome6 name="threads" size={17} color="#ded7be" /><View><Text style={s.creator}>{brand.creatorName}</Text><Text style={s.handle}>{brand.threadsHandle}</Text></View></Pressable> : null}
        {small || collapsed ? <Pressable testID="header-collapse-mobile" accessibilityRole="button" accessibilityLabel={collapsed ? '展開頂部資訊' : '收起頂部資訊'} onPress={() => setCollapsed(v => !v)} style={s.collapse}><MaterialIcons name={collapsed ? 'expand-more' : 'remove'} size={18} color="#d2c9b0" /></Pressable> : null}
      </View>
      {!collapsed ? <View style={[s.actions, small && s.actionsMobile]}>
        {!small ? <View style={s.status}><View style={[s.dot, { backgroundColor: installed ? '#91b99e' : '#b29c65' }]} /><Text style={s.statusText}>{platform === 'MT' ? 'MT 原生平台' : (installed ? 'DG 面板已載入' : 'DG 正在載入')}</Text></View> : null}
        <HeaderButton testID="header-line" label="LINE" icon="chat-bubble-outline" green onPress={() => openBrandLink('line')} />
        <HeaderButton testID="header-register" label="註冊" icon="person-add-alt" onPress={() => openBrandLink('register')} />
        <HeaderButton testID="header-help" label="說明" icon="help-outline" onPress={() => setHelpOpen(true)} />
        <HeaderButton testID="header-platform" label="平台" icon="apps" disabled={disabled} onPress={onSelectPlatform} />
        <HeaderButton testID="header-reconnect" label="重連" icon="sync" disabled={disabled} onPress={onReconnect} />
        {onDiagnostics ? <HeaderButton testID="header-diagnostics" label="診斷" icon="download" onPress={onDiagnostics} /> : null}
        {onRecord ? <HeaderButton testID="header-record" label={recording?'結束記錄':'記錄流程'} icon={recording?'save-alt':'radio-button-checked'} disabled={disabled&&!recording} onPress={onRecord} /> : null}
        <HeaderButton testID="header-logout" label="登出" icon="logout" onPress={onLogout} />
        {!small ? <Pressable testID="header-collapse" accessibilityRole="button" accessibilityLabel="收起頂部資訊" style={s.collapse} onPress={() => setCollapsed(true)}><MaterialIcons name="remove" size={18} color="#d2c9b0" /></Pressable> : null}
      </View> : null}
    </View>
    <Modal transparent visible={helpOpen} animationType="fade" onRequestClose={() => setHelpOpen(false)}>
      <View style={s.backdrop}>
        <View accessibilityViewIsModal testID="autobac-help" style={s.helpCard}>
          <View style={s.helpTop}><View><Text style={s.helpEyebrow}>AUTOBAC GUIDE</Text><Text style={s.helpTitle}>自動下注使用說明</Text></View><Pressable accessibilityRole="button" accessibilityLabel="關閉使用說明" onPress={() => setHelpOpen(false)} style={s.close}><MaterialIcons name="close" size={21} color="#ccceb9" /></Pressable></View>
          <ScrollView style={{ maxHeight: 420 }}>
            <HelpSection number="01" title="登入後，先設定" text="登入成功後選擇 MT 或 DG。面板初始停止；須確認原生遊戲、桌卡、餘額與策略資料已接通，再設定策略與金額。面板出現不代表已送單成功；未就緒時可按頂部診斷匯出安全資料。" />
            <HelpSection number="02" title="配注與桌數" text="兩平台單桌可以選平注、馬丁或倍投；3 桌、5 桌及所有已載入桌固定平注。單桌升階必須等正式結算，和局不升階。" />
            <HelpSection number="03" title="你確認後，才開始" text="點開始並完成風險確認後才自動下注。停止只停止新增下注，不會取消平台已接受的注單；送出後請核對接受狀態與正式結算。" />
            <HelpSection number="04" title="紀錄與風控" text="可在面板查看下注紀錄、結算與損益，設定止盈止損。小窗、迷你模式和頂部資訊收合只是顯示切換，不會重新登入或重載 DG。" />
            <View style={s.warning}><Text style={s.warningText}>自動下注不保證獲利；策略名稱使用原本地分析邏輯，不代表已呼叫外部 AI。所有操作風險由使用者自行評估與承擔。</Text></View>
          </ScrollView>
          <View style={s.helpContacts}><Pressable onPress={() => openBrandLink('threads')}><Text style={s.helpLink}>Threads {brand.threadsHandle} ↗</Text></Pressable><Pressable onPress={() => openBrandLink('line')}><Text style={s.helpLink}>LINE 聯絡 ↗</Text></Pressable></View>
        </View>
      </View>
    </Modal>
  </>;
}

function HeaderButton({ label, icon, onPress, green, disabled, testID }: { label: string; icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void; green?: boolean; disabled?: boolean; testID: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, green && s.lineButton, pressed && s.pressed, disabled && s.disabled]}><MaterialIcons name={icon} size={15} color={green ? '#d6eee0' : '#e5decb'} /><Text style={s.buttonText}>{label}</Text></Pressable>;
}
function HelpSection({ number, title, text }: { number: string; title: string; text: string }) {
  return <View style={s.helpSection}><Text style={s.number}>{number}</Text><View style={{ flex: 1 }}><Text style={s.sectionTitle}>{title}</Text><Text style={s.sectionText}>{text}</Text></View></View>;
}
const s = StyleSheet.create({
  header: { backgroundColor: '#171b16', borderBottomWidth: 1, borderBottomColor: '#655a3c', paddingHorizontal: 18, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  headerMobile: { paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'column', alignItems: 'stretch', gap: 9 },
  headerCollapsed: { paddingVertical: 6 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  identityMobile: { gap: 9 },
  mark: { width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: '#8f8053', backgroundColor: '#302d21', justifyContent: 'center', alignItems: 'center' },
  markSmall: { width: 29, height: 29 },
  markText: { color: '#d7c699', fontSize: 14, fontWeight: '700', letterSpacing: -0.5 },
  kicker: { color: '#9a956f', fontSize: 7, letterSpacing: 1.3, marginBottom: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#f3f2e6', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  chinese: { color: '#c5c5ac', fontSize: 10 },
  signature: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 13, borderLeftWidth: 1, borderLeftColor: '#404134', marginLeft: 5 },
  creator: { color: '#c6c5b2', fontSize: 9 },
  handle: { color: '#aaa582', fontSize: 10, marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionsMobile: { flexWrap: 'wrap', justifyContent: 'flex-end', gap: 5 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 7 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { color: '#a8ac95', fontSize: 9 },
  button: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: '#454b3e', backgroundColor: '#252d23', borderRadius: 7 },
  lineButton: { backgroundColor: '#284636', borderColor: '#447457' },
  buttonText: { color: '#e8e4d3', fontSize: 10, fontWeight: '600' },
  collapse: { minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(5,10,7,0.74)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  helpCard: { width: '100%', maxWidth: 510, maxHeight: '90%', backgroundColor: '#1b251d', borderWidth: 1, borderColor: '#536047', borderRadius: 18, padding: 24 },
  helpTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  helpEyebrow: { color: '#aebf9f', fontSize: 9, letterSpacing: 1.5 },
  helpTitle: { color: '#f0f2e5', fontSize: 21, fontWeight: '700', marginTop: 7 },
  close: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  helpSection: { flexDirection: 'row', gap: 14, paddingVertical: 17, borderTopWidth: 1, borderTopColor: '#354332' },
  number: { color: '#9eaf8b', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: '#e4ead8', fontSize: 14, fontWeight: '600' },
  sectionText: { color: '#a9b59e', fontSize: 12, lineHeight: 21, marginTop: 7 },
  warning: { padding: 13, backgroundColor: '#353522', borderRadius: 9, marginTop: 2 },
  warningText: { color: '#c4bd92', fontSize: 11, lineHeight: 20 },
  helpContacts: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  helpLink: { color: '#bcd4ad', fontSize: 11 },
});
