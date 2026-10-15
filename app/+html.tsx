import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';
import { PAGE_VIEWPORT_CONTENT } from '../shared/page-zoom-lock';

export default function RootHtml({ children }: PropsWithChildren) {
  return <html lang="zh-Hant">
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content={PAGE_VIEWPORT_CONTENT} />
      <meta name="application-name" content="百家自動下注" />
      <meta name="apple-mobile-web-app-title" content="百家自動下注" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <link rel="apple-touch-icon" sizes="180x180" href="/autobac-auto-v329-180.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/autobac-auto-v329-32.png" />
      <link rel="manifest" href="/manifest-v329.webmanifest" />
      <ScrollViewStyleReset />
    </head>
    <body>{children}</body>
  </html>;
}
