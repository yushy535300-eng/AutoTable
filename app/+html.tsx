import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';
import { PAGE_VIEWPORT_CONTENT } from '../shared/page-zoom-lock';

export default function RootHtml({ children }: PropsWithChildren) {
  return <html lang="zh-Hant">
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content={PAGE_VIEWPORT_CONTENT} />
      <ScrollViewStyleReset />
    </head>
    <body>{children}</body>
  </html>;
}
