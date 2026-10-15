import { AutoBacLogo } from './autobac-logo';
import { useEffect, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AUTOBAC_BRAND as brand, openBrandLink } from '@/lib/autobac-brand';
import type { GamePlatform } from './autobac-platform-choice';

type HeaderProps = {
  platform: GamePlatform;
  installed: boolean;
  disabled?: boolean;
  onReconnect: () => void;
  onLogout: () => void;
  onSelectPlatform: () => void;
  onDiagnostics?: () => void;
  onRecord?: () => void;
  recording?: boolean;
};

export function AutoBacGameHeader({ platform, installed, disabled, onReconnect, onLogout, onSelectPlatform, onDiagnostics, onRecord, recording }: HeaderProps) {
  const { width } = useWindowDimensions();
  const [helpOpen, setHelpOpen] = useState(false);
  const small = width < 850;
  useEffect(() => {
    if (!helpOpen || typeof window === 'undefined') return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setHelpOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [helpOpen]);
  function runHelpTool(action: () => void) {
    setHelpOpen(false);
    action();
  }
  return <>
    <View testID="autobac-game-header" style={[s.header, small && s.headerMobile, Platform.OS === 'web' && { position: 'sticky' as any, top: 0 }]}>
      <View style={[s.identity, small && s.identityMobile]}>
        <AutoBacLogo testID="autobac-header-logo" style={[s.mark, small && s.markMobile]} />
        <View style={s.brandCopy}>
          <View style={s.titleRow}><Text numberOfLines={1} style={[s.title, small && s.titleMobile]}>{brand.name}</Text>{!small ? <Text style={s.chinese}>{brand.chineseName}</Text> : null}</View>
          <View style={s.status} accessibilityLabel={`${platform} · ${installed ? '面板已載入' : '正在載入'}${recording ? ' · 記錄中' : ''}`}>
            <View style={[s.dot, { backgroundColor: recording ? '#d9b378' : installed ? '#91b99e' : '#b29c65' }]} />
            <Text numberOfLines={1} style={s.statusText}>{platform}{recording ? ' · 記錄中' : !small ? (installed ? ' · 面板已載入' : ' · 正在載入') : ''}</Text>
          </View>
        </View>
      </View>
      <View testID="autobac-header-actions" style={[s.actions, small && s.actionsMobile]}>
        <Pressable testID="header-line" accessibilityRole="link" accessibilityLabel="LINE 聯絡" onPress={() => openBrandLink('line')} style={({ pressed }) => [s.button, s.headerButton, small && s.buttonMobile, { paddingVertical: 1 }, pressed && s.pressed]}><Image source={require('../assets/images/line-official.png')} style={{ width: small ? 40 : 32, height: small ? 40 : 32 }} resizeMode="contain" /></Pressable>
        <HeaderButton testID="header-platform" label="平台" icon="apps" compact={small} disabled={disabled} onPress={onSelectPlatform} />
        <HeaderButton testID="header-reconnect" label="重連" icon="sync" compact={small} disabled={disabled} onPress={onReconnect} />
        <HeaderButton testID="header-help" label="說明" icon="help-outline" compact={small} onPress={() => setHelpOpen(true)} />
        <HeaderButton testID="header-logout" label="登出" icon="logout" compact={small} onPress={onLogout} />
      </View>
    </View>
    <Modal transparent visible={helpOpen} animationType="fade" onRequestClose={() => setHelpOpen(false)}>
      <View style={s.backdrop}>
        <View accessibilityViewIsModal testID="autobac-help" style={[s.helpCard, small && s.helpCardMobile]}>
          <View style={s.helpTop}><View><Text style={s.helpEyebrow}>AUTOBAC GUIDE</Text><Text style={s.helpTitle}>自動下注使用說明</Text></View><Pressable accessibilityRole="button" accessibilityLabel="關閉使用說明" onPress={() => setHelpOpen(false)} style={s.close}><MaterialIcons name="close" size={21} color="#ccceb9" /></Pressable></View>
          <ScrollView style={s.helpScroll} contentContainerStyle={{ paddingBottom: 2 }}>
            <HelpSection number="01" title="登入後，先設定" text="登入成功後進入 DG。面板初始停止；須確認原生遊戲、桌卡、餘額與策略資料已接通，再設定策略與金額。面板出現不代表已送單成功；未就緒可使用下方工具匯出安全診斷。" />
            <HelpSection number="02" title="配注與桌數" text="DG 單桌可以選平注、馬丁或倍投；3 桌、5 桌及所有已載入桌固定平注。單桌升階必須等正式結算，和局不升階。" />
            <HelpSection number="03" title="你確認後，才開始" text="點開始並完成風險確認後才自動下注。停止只停止新增下注，不會取消平台已接受的注單；送出後請核對接受狀態與正式結算。" />
            <HelpSection number="04" title="紀錄與風控" text="可在面板查看下注紀錄、結算與損益，設定止盈止損。頂部常用按鈕固定顯示；開關說明只影響說明視窗，不會重新登入、重載遊戲或改變下注狀態。" />
            <View style={s.warning}><Text style={s.warningText}>自動下注不保證獲利；策略名稱使用原本地分析邏輯，不代表已呼叫外部 AI。所有操作風險由使用者自行評估與承擔。</Text></View>
          </ScrollView>
          {onDiagnostics || onRecord ? <View style={s.helpTools}>
            <Text style={s.toolsLabel}>問題排查工具</Text>
            <View style={s.toolActions}>
              {onDiagnostics ? <HeaderButton testID="header-diagnostics" label="匯出診斷" icon="download" onPress={() => runHelpTool(onDiagnostics)} /> : null}
              {onRecord ? <HeaderButton testID="header-record" label={recording ? '結束記錄' : '記錄流程'} icon={recording ? 'save-alt' : 'radio-button-checked'} disabled={disabled && !recording} onPress={() => runHelpTool(onRecord)} /> : null}
            </View>
            <Text style={s.toolsNote}>記錄流程會停止工具自動下注；結束後不會自行恢復。</Text>
          </View> : null}
          <View style={s.helpContacts}>
            <Pressable testID="header-threads" accessibilityRole="link" accessibilityLabel={`Threads ${brand.creatorName} ${brand.threadsHandle}`} onPress={() => openBrandLink('threads')} style={s.contact}><Text style={s.helpLink}>Threads {brand.threadsHandle} ↗</Text></Pressable>
            <Pressable testID="help-line" accessibilityRole="link" accessibilityLabel="LINE 聯絡" onPress={() => openBrandLink('line')} style={s.contact}><Text style={s.helpLink}>LINE 聯絡 ↗</Text></Pressable>
            <Pressable testID="header-register" accessibilityRole="link" accessibilityLabel="註冊" onPress={() => openBrandLink('register')} style={s.contact}><Text style={s.helpLink}>註冊 ↗</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </>;
}

function HeaderButton({ label, icon, onPress, compact, disabled, testID }: { label: string; icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void; compact?: boolean; disabled?: boolean; testID: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, ['header-platform','header-reconnect','header-help','header-logout'].includes(testID) && s.headerButton, compact && s.buttonMobile, pressed && s.pressed, disabled && s.disabled]}><MaterialIcons name={icon} size={compact ? 16 : 15} color="#e5decb" /><Text numberOfLines={1} style={[s.buttonText, compact && s.buttonTextMobile]}>{label}</Text></Pressable>;
}
function HelpSection({ number, title, text }: { number: string; title: string; text: string }) {
  return <View style={s.helpSection}><Text style={s.number}>{number}</Text><View style={{ flex: 1 }}><Text style={s.sectionTitle}>{title}</Text><Text style={s.sectionText}>{text}</Text></View></View>;
}
const s = StyleSheet.create({
  header: { height: 56, minHeight: 56, flexShrink: 0, zIndex: 20, backgroundColor: '#171b16', borderBottomWidth: 1, borderBottomColor: '#655a3c', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  headerMobile: { paddingHorizontal: 8, gap: 6 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, minWidth: 0 },
  identityMobile: { gap: 6 },
  brandCopy: { flexShrink: 1, minWidth: 0 },
  mark: { width: 32, height: 32, flexShrink: 0, borderRadius: 8, borderWidth: 1, borderColor: '#8f8053', backgroundColor: '#302d21', justifyContent: 'center', alignItems: 'center' },
  markMobile: { width: 27, height: 27, borderRadius: 7 },
  markText: { color: '#d7c699', fontSize: 14, fontWeight: '700', letterSpacing: -0.5 },
  markTextMobile: { fontSize: 11 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#f3f2e6', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  titleMobile: { fontSize: 13 },
  chinese: { color: '#c5c5ac', fontSize: 10 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2, flexShrink: 0 },
  statusText: { color: '#a8ac95', fontSize: 9 },
  actions: { flexDirection: 'row', alignItems: 'center', flexShrink: 0, flexWrap: 'nowrap', gap: 6 },
  actionsMobile: { gap: 3 },
  button: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: '#454b3e', backgroundColor: '#252d23', borderRadius: 7 },
  headerButton: { width: 64, height: 40, paddingHorizontal: 2, flexShrink: 0 },
  buttonMobile: { width: 44, height: 44, minHeight: 44, flexDirection: 'column', gap: 2, paddingHorizontal: 2, paddingVertical: 3 },
  buttonText: { color: '#e8e4d3', fontSize: 11, fontWeight: '600' },
  buttonTextMobile: { fontSize: 10 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(5,10,7,0.74)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  helpCard: { width: '100%', maxWidth: 510, maxHeight: '90%', backgroundColor: '#1b251d', borderWidth: 1, borderColor: '#536047', borderRadius: 16, padding: 22, flexShrink: 1 },
  helpCardMobile: { padding: 14 },
  helpTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexShrink: 0 },
  helpEyebrow: { color: '#aebf9f', fontSize: 9, letterSpacing: 1.5 },
  helpTitle: { color: '#f0f2e5', fontSize: 19, fontWeight: '700', marginTop: 6 },
  close: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  helpScroll: { maxHeight: 360, flexShrink: 1 },
  helpSection: { flexDirection: 'row', gap: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#354332' },
  number: { color: '#9eaf8b', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: '#e4ead8', fontSize: 14, fontWeight: '600' },
  sectionText: { color: '#a9b59e', fontSize: 12, lineHeight: 20, marginTop: 6 },
  warning: { padding: 11, backgroundColor: '#353522', borderRadius: 8, marginTop: 2 },
  warningText: { color: '#c4bd92', fontSize: 11, lineHeight: 19 },
  helpTools: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#354332', gap: 8, flexShrink: 0 },
  toolsLabel: { color: '#becbb0', fontSize: 11, fontWeight: '600' },
  toolActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toolsNote: { color: '#a9b59e', fontSize: 10, lineHeight: 16 },
  helpContacts: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexShrink: 0 },
  contact: { minHeight: 32, justifyContent: 'center' },
  helpLink: { color: '#bcd4ad', fontSize: 11 },
});
