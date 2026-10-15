import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AUTOBAC_BRAND as brand, openBrandLink } from '@/lib/autobac-brand';

export type GamePlatform = 'MT' | 'DG';
export type GameLayout = 'compatible' | 'native' | 'desktop';

export function AutoBacPlatformChoice({ onChoose, onLogout }: { onChoose: (platform: GamePlatform, layout?: GameLayout) => void; onLogout: () => void }) {
  const { width, height } = useWindowDimensions();
  const mobile = width < 680;
  const short = height < 520;
  const webBackdrop = Platform.OS === 'web'
    ? ({ backgroundImage: 'radial-gradient(circle at 14% 7%, rgba(197, 160, 91, 0.10), transparent 28%), radial-gradient(circle at 90% 58%, rgba(68, 154, 206, 0.11), transparent 30%), linear-gradient(145deg, #081016 0%, #0b1620 52%, #081016 100%)' } as any)
    : undefined;

  return <ScrollView style={s.page} contentContainerStyle={[s.content, mobile && s.mobileContent, short && s.shortContent]}>
    <View pointerEvents="none" style={[s.ambient, webBackdrop]} />
    <View pointerEvents="none" style={s.goldGlow} />
    <View pointerEvents="none" style={s.blueGlow} />

    <View style={[s.top, mobile && s.topMobile, short && s.topShort]}>
      <View style={s.wordmark}>
        <View style={s.mark}><Text style={s.markText}>AB</Text></View>
        <View>
          <Text style={s.brand}>{brand.name}</Text>
          <Text style={s.subBrand}>{brand.chineseName}</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="登出"
        onPress={onLogout}
        hitSlop={8}
        style={(state: any) => [s.logout, state.hovered && s.controlHover, state.focused && s.controlFocus, state.pressed && s.controlPressed]}
      >
        <MaterialIcons name="logout" size={17} color="#bac8d1" />
        <Text style={s.logoutText}>登出</Text>
      </Pressable>
    </View>

    {!short ? <View style={s.loginState} accessibilityLabel="登入完成">
      <MaterialIcons name="check-circle" size={15} color="#83b8d8" />
      <Text style={s.loginStateText}>登入完成</Text>
      <View style={s.stateDivider} />
      <Text style={s.loginStateHint}>進入 DG 以繼續</Text>
    </View> : null}

    <View style={[s.heading, mobile && s.headingMobile, short && s.headingShort]}>
      <Text style={s.eyebrow}>AUTOBAC · PLATFORM ACCESS</Text>
      <Text style={s.title}>進入 DG 平台</Text>
      <Text style={s.subtitle}>{short ? '進入 DG，使用百家工程師操作面板。' : '進入 DG，使用百家工程師操作面板。\n載入後初始停止，確認後才開始。'}</Text>
    </View>

    {!short ? <View style={[s.sharedInfo, mobile && s.sharedInfoMobile]}>
      <View style={s.infoIcon}><MaterialIcons name="tune" size={16} color="#a9c9db" /></View>
      <Text style={s.sharedInfoText}>單桌平注馬丁倍投／多桌平注及官方流水</Text>
    </View> : null}

    <View style={[s.cards, mobile && s.cardsMobile, short && !mobile && s.cardsShort]}>
      {(['DG'] as GamePlatform[]).map(target => {
        const dg = target === 'DG';
        const accent = dg ? '#d9bb79' : '#8ec8e8';
        return <Pressable
          key={target}
          testID={dg ? 'choose-dg' : 'choose-mt'}
          accessibilityRole="button"
          accessibilityLabel={`選擇 ${target} 真人平台`}
          accessibilityHint={`選擇後進入 ${target} 的操作面板`}
          onPress={() => onChoose(target)}
          style={(state: any) => [
            s.card,
            dg ? s.dgCard : s.mtCard,
            mobile && s.cardMobile,
            short && !mobile && s.cardShort,
            state.hovered && (dg ? s.dgCardHover : s.mtCardHover),
            state.focused && (dg ? s.dgCardFocus : s.mtCardFocus),
            state.pressed && s.cardPressed,
          ]}
        >
          <View style={[s.cardAccent, { backgroundColor: accent }]} />
          <View style={s.cardTop}>
            <Text style={[s.platformTag, dg ? s.gold : s.blue]}>{dg ? 'DG · DREAM GAMING' : 'MT · LIVE PLATFORM'}</Text>
            <MaterialIcons name="north-east" size={18} color={accent} />
          </View>

          <View style={[s.cardIdentity, mobile && s.cardIdentityMobile]}>
            <View
              testID={`platform-logo-${target.toLowerCase()}`}
              accessibilityLabel={`${target} 平台縮寫`}
              style={[s.monogram, dg ? s.dgMonogram : s.mtMonogram, mobile && s.monogramMobile, short && s.monogramShort]}
            >
              <Text style={[s.monogramText, dg ? s.gold : s.blue, mobile && s.monogramTextMobile]}>{target}</Text>
              <View style={[s.monogramRule, { backgroundColor: accent }]} />
            </View>
            <View style={[s.identityCopy, mobile && s.identityCopyMobile]}>
              <Text style={[s.cardTitle, mobile && s.cardTitleMobile]}>{target} 真人平台</Text>
              <Text style={[s.cardDescription, mobile && s.cardDescriptionMobile]}>{short ? '選擇後進入操作面板' : dg ? '專注清晰的單桌操作與策略設定。' : '選擇後開啟 MT 對應的操作面板。'}</Text>
            </View>
          </View>

          <View style={[s.cardBottom, mobile && s.cardBottomMobile, short && s.cardBottomShort]}>
            <Text style={[s.enter, dg ? s.gold : s.blue]}>選擇 {target}</Text>
            <View style={[s.ctaArrow, { borderColor: `${accent}55`, backgroundColor: `${accent}14` }]}>
              <MaterialIcons name="arrow-forward" size={18} color={accent} />
            </View>
          </View>
        </Pressable>;
      })}
    </View>

    {!short ? <View style={[s.support, mobile && s.supportMobile]}>
      <Text style={s.supportText}>需要協助？請聯絡百家工程師</Text>
      <View style={s.supportLinks}>
        <Pressable accessibilityRole="link" accessibilityLabel="透過 LINE 聯絡" onPress={() => openBrandLink('line')} style={(state: any) => [s.supportLink, state.hovered && s.supportLinkHover, state.focused && s.controlFocus, state.pressed && s.controlPressed]}>
          <Text style={s.link}>LINE 聯絡</Text>
        </Pressable>
        <View style={s.linkDot} />
        <Pressable accessibilityRole="link" accessibilityLabel="前往 Threads" onPress={() => openBrandLink('threads')} style={(state: any) => [s.supportLink, state.hovered && s.supportLinkHover, state.focused && s.controlFocus, state.pressed && s.controlPressed]}>
          <Text style={s.link}>Threads {brand.threadsHandle}</Text>
        </Pressable>
      </View>
    </View> : null}
  </ScrollView>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#081016' },
  content: { flexGrow: 1, position: 'relative', overflow: 'hidden', paddingHorizontal: 28, paddingVertical: 30, alignItems: 'center', justifyContent: 'center' },
  mobileContent: { paddingHorizontal: 16, paddingVertical: 16, justifyContent: 'flex-start' },
  shortContent: { paddingVertical: 12, justifyContent: 'flex-start' },
  ambient: { ...StyleSheet.absoluteFillObject, backgroundColor: '#081016' },
  goldGlow: { position: 'absolute', width: 420, height: 420, borderRadius: 220, backgroundColor: '#b9904a', opacity: 0.035, top: -215, left: -145 },
  blueGlow: { position: 'absolute', width: 460, height: 460, borderRadius: 230, backgroundColor: '#3e9bc7', opacity: 0.04, right: -250, bottom: -205 },

  top: { width: '100%', maxWidth: 1040, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  topMobile: { marginBottom: 18 },
  topShort: { marginBottom: 10 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 38, height: 38, borderWidth: 1, borderColor: '#9d7b42', borderRadius: 12, backgroundColor: '#11191f', alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 13, fontWeight: '800', color: '#e3c98e', letterSpacing: 0.2 },
  brand: { fontSize: 18, lineHeight: 21, fontWeight: '700', color: '#f0f3f4', letterSpacing: -0.35 },
  subBrand: { fontSize: 11, lineHeight: 15, color: '#92a9b7', marginTop: 1 },
  logout: { minHeight: 44, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#253744', backgroundColor: '#0c171f', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  logoutText: { fontSize: 13, fontWeight: '600', color: '#c1cdd4' },

  loginState: { minHeight: 28, paddingHorizontal: 10, borderWidth: 1, borderColor: '#274251', borderRadius: 999, backgroundColor: '#0c1a22', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  loginStateText: { fontSize: 11, fontWeight: '700', color: '#b9d8e9' },
  stateDivider: { width: 1, height: 12, backgroundColor: '#37505d', marginHorizontal: 2 },
  loginStateHint: { fontSize: 11, color: '#8da5b3' },
  heading: { alignItems: 'center', marginBottom: 16 },
  headingMobile: { marginBottom: 13 },
  headingShort: { marginBottom: 11 },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '700', letterSpacing: 1.8, color: '#8ba6b7' },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '800', color: '#f5f7f8', marginTop: 7, letterSpacing: -0.8 },
  subtitle: { maxWidth: 460, fontSize: 14, lineHeight: 21, textAlign: 'center', color: '#aebfc9', marginTop: 7 },

  sharedInfo: { width: '100%', maxWidth: 1040, minHeight: 44, marginBottom: 14, borderWidth: 1, borderColor: '#1d3442', borderRadius: 14, backgroundColor: '#0d1921', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  sharedInfoMobile: { justifyContent: 'flex-start', paddingHorizontal: 12, marginBottom: 12 },
  infoIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#18303d', alignItems: 'center', justifyContent: 'center' },
  sharedInfoText: { fontSize: 12, lineHeight: 18, fontWeight: '600', color: '#c2d2da', flexShrink: 1 },

  cards: { width: '100%', maxWidth: 560, flexDirection: 'row', gap: 18 },
  cardsMobile: { flexDirection: 'column', gap: 12 },
  cardsShort: { maxWidth: 850, gap: 14 },
  card: { flex: 1, minWidth: 0, minHeight: 326, overflow: 'hidden', position: 'relative', borderWidth: 1, borderRadius: 20, padding: 24, justifyContent: 'space-between', shadowColor: '#000000', shadowOpacity: 0.26, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  dgCard: { backgroundColor: '#15191b', borderColor: '#5b4b2e' },
  mtCard: { backgroundColor: '#0d202b', borderColor: '#28536a' },
  cardMobile: { width: '100%', minHeight: 192, padding: 15, borderRadius: 17 },
  cardShort: { minHeight: 218, padding: 17 },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.9 },
  dgCardHover: { borderColor: '#b08d4d', backgroundColor: '#1a1d1c', transform: [{ translateY: -2 }], shadowOpacity: 0.38 },
  mtCardHover: { borderColor: '#5d9ec0', backgroundColor: '#102630', transform: [{ translateY: -2 }], shadowOpacity: 0.38 },
  dgCardFocus: { borderColor: '#e2c17f', shadowColor: '#d4af68', shadowOpacity: 0.42, shadowRadius: 16, elevation: 7 },
  mtCardFocus: { borderColor: '#a9ddf5', shadowColor: '#75c3e9', shadowOpacity: 0.42, shadowRadius: 16, elevation: 7 },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.988 }] },
  cardTop: { minHeight: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  platformTag: { fontSize: 10, lineHeight: 14, letterSpacing: 0.9, fontWeight: '800', flexShrink: 1 },
  gold: { color: '#e3c98e' },
  blue: { color: '#a6d8f3' },
  cardIdentity: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 13, paddingVertical: 12 },
  cardIdentityMobile: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 14, paddingVertical: 8 },
  monogram: { width: 72, height: 72, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dgMonogram: { backgroundColor: '#24241f', borderColor: '#79663f' },
  mtMonogram: { backgroundColor: '#123142', borderColor: '#397495' },
  monogramMobile: { width: 66, height: 66, borderRadius: 16, flexShrink: 0 },
  monogramShort: { width: 58, height: 58, borderRadius: 14 },
  monogramText: { fontSize: 30, lineHeight: 33, fontWeight: '900', letterSpacing: -1.5 },
  monogramTextMobile: { fontSize: 27, lineHeight: 30 },
  monogramRule: { width: 20, height: 2, borderRadius: 2, marginTop: 2 },
  identityCopy: { alignItems: 'center' },
  identityCopyMobile: { alignItems: 'flex-start', flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#f0f4f5', textAlign: 'center', letterSpacing: -0.2 },
  cardTitleMobile: { fontSize: 17, lineHeight: 22, textAlign: 'left' },
  cardDescription: { maxWidth: 330, fontSize: 12, lineHeight: 18, color: '#acbec8', marginTop: 5, textAlign: 'center' },
  cardDescriptionMobile: { fontSize: 12, lineHeight: 17, textAlign: 'left', marginTop: 3 },
  cardBottom: { minHeight: 44, paddingTop: 11, borderTopWidth: 1, borderTopColor: '#ffffff16', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardBottomMobile: { paddingTop: 8 },
  cardBottomShort: { minHeight: 40, paddingTop: 7 },
  enter: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  ctaArrow: { width: 34, height: 34, borderWidth: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  support: { alignItems: 'center', gap: 6, marginTop: 16 },
  supportMobile: { marginTop: 14 },
  supportText: { fontSize: 11, lineHeight: 16, color: '#7f98a7' },
  supportLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  supportLink: { minHeight: 44, paddingHorizontal: 9, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  supportLinkHover: { backgroundColor: '#ffffff0b' },
  linkDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#587687' },
  link: { fontSize: 12, fontWeight: '700', color: '#a9ccdf' },
  controlHover: { backgroundColor: '#14232d', borderColor: '#3d5969' },
  controlFocus: { borderColor: '#b7ddeb', shadowColor: '#87bed8', shadowOpacity: 0.42, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  controlPressed: { opacity: 0.76, transform: [{ scale: 0.97 }] },
});
