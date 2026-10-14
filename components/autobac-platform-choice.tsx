import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AUTOBAC_BRAND as brand, openBrandLink } from '@/lib/autobac-brand';

export type GamePlatform = 'MT' | 'DG';
export type GameLayout = 'compatible' | 'native' | 'desktop';
export function AutoBacPlatformChoice({ onChoose, onLogout }: { onChoose: (platform: GamePlatform, layout?: GameLayout) => void; onLogout: () => void }) {
  const { width, height } = useWindowDimensions();
  const mobile = width < 680;
  const short = height < 480;
  return <ScrollView style={s.page} contentContainerStyle={[s.content, mobile && s.mobileContent, short && s.shortContent]}>
    <View style={[s.top, mobile && s.topMobile]}>
      <View style={s.wordmark}><View style={s.mark}><Text style={s.markText}>AB</Text></View><View><Text style={s.brand}>{brand.name}</Text><Text style={s.subBrand}>{brand.chineseName}</Text></View></View>
      <Pressable accessibilityRole="button" onPress={onLogout} style={s.logout}><MaterialIcons name="logout" size={16} color="#afbfcb" /><Text style={s.logoutText}>登出</Text></Pressable>
    </View>
    <View style={[s.heading, mobile && s.headingMobile, short && s.headingShort]}>
      <Text style={s.eyebrow}>SELECT YOUR PLATFORM</Text>
      <Text style={s.title}>選擇遊戲平台</Text>
      <Text style={s.subtitle}>同一個帳號，選擇 DG 或 MT。{ '\n' }進入後載入面板，按開始並確認後才會下注。</Text>
    </View>
    <Text style={s.layoutHint}>自動辨識手機／電腦；選平台後自動取得授權，不需貼 Token。</Text>
    <View style={[s.cards, short && s.cardsShort]}>
      {(['DG', 'MT'] as GamePlatform[]).map(target => {
        const dg = target === 'DG';
        return <Pressable key={target} testID={dg ? 'choose-dg' : 'choose-mt'} accessibilityRole="button" accessibilityLabel={`進入 ${target}`} onPress={() => onChoose(target)} style={({ pressed }) => [s.card, dg ? s.dgCard : s.mtCard, mobile && s.cardMobile, short && s.cardShort, pressed && s.pressed]}>
          <View style={s.cardTop}><Text style={[s.platformTag, dg ? s.gold : s.blue]}>{dg ? 'DREAM GAMING' : 'MT LIVE'}</Text><MaterialIcons name="north-east" size={18} color={dg ? '#d3b985' : '#84bddd'} /></View>
          <View testID={`platform-logo-${target.toLowerCase()}`} accessibilityLabel={`${target} 平台標誌`} style={[s.logo, dg ? s.dgLogo : s.mtLogo, mobile && s.logoMobile, short && s.logoShort]}>
            <Text style={[s.logoText, dg ? s.gold : s.blue, mobile && s.logoTextMobile, short && s.logoTextShort]}>{target}</Text>
            <View style={[s.logoUnderline, { backgroundColor: dg ? '#d3b985' : '#84bddd' }]} />
          </View>
          <Text style={[s.cardTitle, mobile && s.cardTitleMobile]}>{target} 真人平台</Text>
          <Text style={[s.cardDescription, mobile && s.cardDescriptionMobile]}>{short ? '完整自動下注面板' : '完整版面板\n策略・配注・官方流水'}</Text>
          {!mobile && !short ? <View style={s.tags}><Text style={s.tag}>單桌三種配注</Text><Text style={s.tag}>多桌固定平注</Text></View> : null}
          <View style={[s.cardBottom, mobile && s.cardBottomMobile]}><Text style={[s.enter, dg ? s.gold : s.blue]}>進入 {target}</Text><MaterialIcons name="arrow-forward" size={19} color={dg ? '#d3b985' : '#84bddd'} /></View>
        </Pressable>;
      })}
    </View>
    <View style={[s.support, mobile && s.supportMobile]}><Text style={s.supportText}>沿用原娛樂城授權與白名單</Text><View style={s.supportLinks}><Pressable accessibilityRole="link" onPress={() => openBrandLink('line')} style={s.supportLink}><Text style={s.link}>LINE 聯絡</Text></Pressable><Pressable accessibilityRole="link" onPress={() => openBrandLink('threads')} style={s.supportLink}><Text style={s.link}>Threads {brand.threadsHandle}</Text></Pressable></View></View>
  </ScrollView>;
}
const s = StyleSheet.create({
  layoutHint:{fontSize:10,lineHeight:17,color:'#9cb3bd',marginBottom:18,textAlign:'center'},
  page: { flex: 1, backgroundColor: '#09131d' }, content: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 34, alignItems: 'center', justifyContent: 'center' }, mobileContent: { paddingHorizontal: 16, paddingVertical: 24 }, shortContent: { paddingVertical: 12 },
  top: { width: '100%', maxWidth: 760, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }, topMobile: { marginBottom: 26 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 10 }, mark: { width: 36, height: 36, borderWidth: 1, borderColor: '#2d526a', borderRadius: 10, backgroundColor: '#152936', alignItems: 'center', justifyContent: 'center' }, markText: { fontSize: 14, fontWeight: '800', color: '#9dc4d9', letterSpacing: -0.5 },
  brand: { fontSize: 22, fontWeight: '700', color: '#e8f0f5', letterSpacing: -0.6 }, subBrand: { fontSize: 10, color: '#91aabd', marginTop: 3 }, logout: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 12 }, logoutText: { fontSize: 12, color: '#afbfcb' },
  heading: { alignItems: 'center', marginBottom: 28 }, headingMobile: { marginBottom: 24 }, headingShort: { marginBottom: 15 }, eyebrow: { fontSize: 9, fontWeight: '600', letterSpacing: 2.2, color: '#6f95ae' }, title: { fontSize: 28, fontWeight: '700', color: '#f0f6f8', marginTop: 12 }, subtitle: { fontSize: 12, lineHeight: 21, textAlign: 'center', color: '#95acbc', marginTop: 10 },
  cards: { width: '100%', maxWidth: 760, flexDirection: 'row', gap: 18 }, cardsShort: { maxWidth: 590 },
  card: { flex: 1, minWidth: 0, borderRadius: 19, padding: 24, borderWidth: 1 }, dgCard: { backgroundColor: '#1b2228', borderColor: '#76613c' }, mtCard: { backgroundColor: '#142b3c', borderColor: '#345e7a' }, cardMobile: { padding: 14, borderRadius: 14 }, cardShort: { padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 }, platformTag: { fontSize: 9, letterSpacing: 0.5, fontWeight: '700', flexShrink: 1 }, gold: { color: '#e3c997' }, blue: { color: '#9acff1' },
  logo: { width: 140, height: 128, marginTop: 24, marginBottom: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', borderWidth: 1, borderRadius: 21 }, dgLogo: { backgroundColor: '#30312b', borderColor: '#706348' }, mtLogo: { backgroundColor: '#193b52', borderColor: '#407aa0' }, logoMobile: { width: 102, height: 100, marginTop: 20, marginBottom: 17, borderRadius: 16 }, logoShort: { width: 96, height: 76, marginTop: 8, marginBottom: 8 },
  logoText: { fontSize: 70, fontWeight: '800', letterSpacing: -4 }, logoTextMobile: { fontSize: 55, letterSpacing: -3 }, logoTextShort: { fontSize: 47 }, logoUnderline: { height: 3, width: 26, marginTop: -3, borderRadius: 3 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#edf3f5', textAlign: 'center' }, cardTitleMobile: { fontSize: 15 }, cardDescription: { fontSize: 12, lineHeight: 21, color: '#a7bac7', marginTop: 9, textAlign: 'center' }, cardDescriptionMobile: { fontSize: 10, lineHeight: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 19, marginBottom: 5 }, tag: { fontSize: 9, color: '#b8c8d2', backgroundColor: '#ffffff0b', borderRadius: 6, paddingVertical: 7, paddingHorizontal: 8 },
  cardBottom: { borderTopWidth: 1, borderTopColor: '#ffffff17', paddingTop: 17, marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 }, cardBottomMobile: { paddingTop: 14, marginTop: 16 }, enter: { fontSize: 13, fontWeight: '700' },
  support: { alignItems: 'center', gap: 8, marginTop: 27 }, supportMobile: { marginTop: 20 }, supportText: { fontSize: 10, color: '#6f8c9f' }, supportLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }, supportLink: { paddingVertical: 9, paddingHorizontal: 7 }, link: { fontSize: 11, color: '#95bad0', fontWeight: '500' }, pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
});
