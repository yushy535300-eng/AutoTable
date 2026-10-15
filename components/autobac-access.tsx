import { createElement } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { AUTOBAC_BRAND as brand, openBrandLink } from '@/lib/autobac-brand';

type AccessProps = {
  username: string; password: string; showPassword: boolean; submitting: boolean; error: string; notice?: string;
  onUsername: (value: string) => void; onPassword: (value: string) => void; onTogglePassword: () => void; onSubmit: () => void;
};

/** Original 480px access-card geometry and information, restyled without adding marketing sections. */
export function AutoBacAccess(props: AccessProps) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const narrow = width < 360;
  return <View style={s.page}>
    {Platform.OS === 'web' ? createElement('video', {
      src: '/poker.mp4', autoPlay: true, muted: true, defaultMuted: true, playsInline: true, preload: 'auto', controls: false,
      disablePictureInPicture: true, 'aria-hidden': true,
      style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' },
      onEnded: (event: any) => {
        const video = event.currentTarget;
        const count = Number(video.dataset.plays || '0') + 1; video.dataset.plays = String(count);
        if (count < 2) { video.currentTime = 0; void video.play?.().catch?.(() => {}); }
      },
    }) : null}
    <View style={s.shade} pointerEvents="none" />
    <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View testID="autobac-access-card" style={s.card}>
        <View style={s.topline}><Text style={s.topText}>AUTOBAC · ACCESS</Text><View style={s.safe}><View style={s.safeDot} /><Text style={s.safeText}>安全驗證</Text></View></View>
        <View style={[s.hero, !desktop && s.heroMobile]}>
          <View style={[s.brand, !desktop && s.brandMobile, narrow && s.brandNarrow]}>
            <View style={[s.icon, !desktop && s.iconMobile, narrow && s.iconNarrow]}><Text style={s.iconText}>AB</Text></View>
            <View style={s.brandCopy}>
              {desktop ? <Text style={s.kicker}>REAL-TIME CONTROL ROOM</Text> : null}
              <Text testID="autobac-access-title" numberOfLines={1} style={[s.title, !desktop && s.titleMobile, narrow && s.titleNarrow]}>百家樂自動下注</Text>
              <Text style={[s.subtitle, !desktop && s.subtitleMobile]}>安全登入後進入 DG</Text>
            </View>
          </View>
          <View style={s.heroDivider} />
          <View style={[s.threadsCard, !desktop && s.threadsCardMobile]}>
            <View style={s.threadsHead}><View style={s.threadsLogo}><FontAwesome6 name="threads" size={24} color="#e8e9df" /></View><Text style={s.threadsLabel}>THREADS</Text></View>
            <Text style={s.threadsName}>{brand.creatorName}</Text><Text style={s.threadsAccount}>{brand.threadsHandle}</Text>
            <Pressable testID="access-threads" accessibilityRole="link" accessibilityLabel={`Threads 作者 ${brand.threadsHandle}`} onPress={() => openBrandLink('threads')} style={({ pressed }) => [s.follow, pressed && s.pressed]}><MaterialIcons name="add" size={16} color="#e4e4cd" /><Text style={s.followText}>FOLLOW</Text></Pressable>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.hintRow}><Text style={s.hint}>請輸入 TZ 帳號與密碼，驗證成功即可進入。</Text><Pressable accessibilityRole="link" onPress={() => openBrandLink('register')} style={({ pressed }) => [s.register, pressed && s.pressed]}><Text style={s.registerText}>註冊帳號</Text></Pressable></View>
        {props.notice ? <View style={s.notice}><Text style={s.noticeText}>{props.notice}</Text></View> : null}
        <Text style={s.label}>TZ 帳號</Text>
        <TextInput testID="autobac-username" accessibilityLabel="TZ 帳號" placeholder="輸入 TZ 帳號" placeholderTextColor="#6d7f78" autoCapitalize="none" autoCorrect={false} autoComplete="username" value={props.username} onChangeText={props.onUsername} style={s.input} />
        <Text style={s.label}>TZ 密碼</Text>
        <View style={s.passwordWrap}><TextInput testID="autobac-password" accessibilityLabel="TZ 密碼" placeholder="輸入密碼" placeholderTextColor="#6d7f78" autoCapitalize="none" autoCorrect={false} autoComplete="current-password" secureTextEntry={!props.showPassword} value={props.password} onChangeText={props.onPassword} onSubmitEditing={props.onSubmit} style={s.passwordInput} /><Pressable accessibilityRole="button" accessibilityLabel={props.showPassword ? '隱藏密碼' : '顯示密碼'} onPress={props.onTogglePassword} style={s.eye}><MaterialIcons name={props.showPassword ? 'visibility-off' : 'visibility'} size={19} color="#899d93" /></Pressable></View>
        <Pressable testID="autobac-login" accessibilityRole="button" accessibilityLabel="安全登入" onPress={props.onSubmit} disabled={props.submitting} style={({ pressed }) => [s.submit, pressed && s.pressed, props.submitting && s.disabled]}><MaterialIcons name="verified-user" size={18} color="#12281e" /><Text style={s.submitText}>{props.submitting ? '登入中…' : '安全登入'}</Text></Pressable>
        {props.error ? <Text accessibilityRole="alert" style={s.error}>{props.error}</Text> : null}
        <View style={s.footer}><View style={s.footerLeft}><MaterialIcons name="lock" size={11} color="#88968c" /><Text style={s.privacy}>密碼只會用於本次登入驗證</Text></View><Text style={s.footerDivider}>|</Text><Pressable accessibilityRole="link" accessibilityLabel="LINE 聯絡" onPress={() => openBrandLink('line')}><Text style={s.lineLink}>需要協助？LINE 聯絡</Text></Pressable></View>
      </View>
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#020A12' },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,10,18,.46)' },
  scroll: { flex: 1 }, content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: { width: '100%', maxWidth: 480, backgroundColor: 'rgba(7,31,44,.76)', borderWidth: 1, borderColor: 'rgba(82,151,177,.62)', borderRadius: 18, padding: 18, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, elevation: 14 },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  topText: { color: '#A9BED0', fontSize: 9, letterSpacing: 1.8, fontWeight: '700' },
  safe: { flexDirection: 'row', alignItems: 'center', gap: 4 }, safeDot: { width: 4, height: 4, borderRadius: 3, backgroundColor: '#39E0B0' }, safeText: { color: '#39E0B0', fontSize: 9, fontWeight: '800' },
  hero: { flexDirection: 'row', alignItems: 'stretch', width: '100%', marginBottom: 16, minHeight: 112 }, heroMobile: { minHeight: 88 },
  brand: { flex: 1.9, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 13, paddingLeft: 2, paddingRight: 12 },
  brandMobile: { flex: 1.35, gap: 8, paddingRight: 6, paddingLeft: 0 }, brandNarrow: { gap: 6, paddingRight: 4 }, brandCopy: { flexShrink: 1, minWidth: 0 },
  icon: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, borderColor: '#315D79', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,20,31,.34)', flexShrink: 0 }, iconMobile: { width: 40, height: 40, borderRadius: 10 }, iconNarrow: { width: 32, height: 32 }, iconText: { color: '#EAF8FF', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  kicker: { color: '#8DB4CE', fontSize: 10, letterSpacing: 1.5, fontWeight: '800' }, title: { color: '#F5F8FA', fontSize: 24, fontWeight: '900', marginTop: 5 }, titleMobile: { fontSize: 18, letterSpacing: -0.4, marginTop: 2 }, titleNarrow: { fontSize: 11 },
  subtitle: { color: '#91A7B8', fontSize: 11.5, marginTop: 4 }, subtitleMobile: { fontSize: 9.5, letterSpacing: -0.2 }, heroDivider: { width: 1, marginVertical: 7, backgroundColor: 'rgba(111,169,197,.25)' },
  threadsCard: { flex: 0.9, minWidth: 142, marginLeft: 13, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(108,177,205,.40)', backgroundColor: 'rgba(3,18,29,.32)', justifyContent: 'center' }, threadsCardMobile: { flex: 0.72, minWidth: 118, marginLeft: 6, paddingHorizontal: 8, paddingVertical: 7 },
  threadsHead: { flexDirection: 'row', alignItems: 'center', gap: 6 }, threadsLogo: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(224,243,255,.52)', backgroundColor: 'rgba(255,255,255,.07)', alignItems: 'center', justifyContent: 'center' }, threadsLabel: { color: '#A9C4D6', fontSize: 9, fontWeight: '900', letterSpacing: 1.35 },
  threadsName: { color: '#F5F9FC', fontSize: 17, fontWeight: '900', marginTop: 6 }, threadsAccount: { color: '#56D7D0', fontSize: 14, fontWeight: '900', marginTop: 1 },
  follow: { height: 34, marginTop: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(78,192,235,.65)', backgroundColor: 'rgba(23,128,180,.22)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }, followText: { color: '#EAF8FF', fontSize: 10, fontWeight: '900', letterSpacing: 1.15 },
  divider: { height: 1, backgroundColor: 'rgba(109,157,184,.32)', marginBottom: 20 }, hintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 11, flexWrap: 'nowrap' }, hint: { color: '#A7B8C5', fontSize: 11, flexShrink: 1, minWidth: 0 },
  register: { height: 28, paddingHorizontal: 11, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(66,185,245,.68)', backgroundColor: 'rgba(22,140,235,.16)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, registerText: { color: '#42B9F5', fontSize: 10, fontWeight: '900' },
  label: { color: '#B9C8D3', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  input: { height: 48, backgroundColor: 'rgba(2,17,28,.68)', borderRadius: 8, borderWidth: 1, borderColor: '#385B70', color: '#FFFFFF', paddingHorizontal: 14, fontSize: 14, marginBottom: 14 },
  passwordWrap: { height: 48, backgroundColor: 'rgba(2,17,28,.68)', borderRadius: 8, borderWidth: 1, borderColor: '#385B70', flexDirection: 'row', alignItems: 'center', marginBottom: 16 }, passwordInput: { flex: 1, minWidth: 0, height: '100%', color: '#FFFFFF', paddingHorizontal: 14, fontSize: 14 }, eye: { width: 46, height: '100%', alignItems: 'center', justifyContent: 'center' },
  submit: { height: 50, backgroundColor: '#168CEB', borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  footer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, flexWrap: 'wrap' }, footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 }, footerDivider: { color: 'rgba(145,171,188,.55)', fontSize: 10 }, privacy: { color: '#71899A', fontSize: 8.5, textAlign: 'center' }, lineLink: { color: '#42B9F5', fontSize: 10, fontWeight: '800', textAlign: 'center' },
  notice: { borderWidth: 1, borderColor: '#816b42', backgroundColor: '#353726', padding: 10, borderRadius: 8, marginBottom: 10 }, noticeText: { color: '#d9cba2', fontSize: 11, lineHeight: 18 },
  error: { color: '#e5a7a0', fontSize: 11, textAlign: 'center', marginTop: 10 }, pressed: { opacity: 0.72 }, disabled: { opacity: 0.55 },
});
