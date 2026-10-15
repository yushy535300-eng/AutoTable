import { Image, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

/** One approved artwork for access, platform choice, and the fixed game header. */
export function AutoBacLogo({ style, testID }: { style?: StyleProp<ViewStyle>; testID?: string }) {
  return <View style={[style, styles.clip]} testID={testID}>
    <Image source={require('../assets/images/autobac-auto-v329.png')}
      accessibilityLabel="百家自動下注 AUTO Logo"
      resizeMode="contain" style={styles.image} />
  </View>;
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', backgroundColor: '#000000' },
  image: { width: '100%', height: '100%' },
});
