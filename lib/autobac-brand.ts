import { Linking, Platform } from 'react-native';

/** Existing owner contact information; never derive these links from an account token. */
export const AUTOBAC_BRAND = {
  name: 'AutoBac',
  chineseName: '百家工程師',
  description: '百家樂自動下注',
  creatorName: 'MT工程師',
  threadsHandle: '@uss0857',
  threadsUrl: 'https://www.threads.com/@uss0857?igshid=NTc4MTIwNjQ2YQ==',
  lineUrl: 'https://line.me/ti/p/k2pkYGXGL3',
  registerUrl: 'https://shy9453.tz6868.cc',
} as const;

export function openBrandLink(kind: 'threads' | 'line' | 'register') {
  const url = kind === 'threads' ? AUTOBAC_BRAND.threadsUrl : kind === 'line' ? AUTOBAC_BRAND.lineUrl : AUTOBAC_BRAND.registerUrl;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    void Linking.openURL(url).catch(() => undefined);
  }
}
