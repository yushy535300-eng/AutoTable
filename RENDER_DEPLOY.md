# AutoBac v3.2.6：DG專用版部署

詳細說明：[AUTOBAC-V3.2.6-DEPLOY.md](./AUTOBAC-V3.2.6-DEPLOY.md)。本版只提供DG，MT入口及正式代理已停用，原始碼保留供日後重接。

1. 先停止新增下注，核對平台正式待結算注單，備份原GitHub專案。
2. 解壓完整網站ZIP，內容更新到原GitHub根目錄，不只上傳ZIP、不多一層資料夾。
3. Render保留原Docker Web Service與 `Dockerfile Path=./Dockerfile`，使用原Dockerfile預設啟動時Docker Command留空。
4. 原環境變數、資料庫及白名單保留，`TZ_WHITELIST_ENABLED=true`。不用加Render金鑰或代理設定。
5. 提交及部署後核對 `/api/health` 正常、`/autobac-version.json` 為 `3.2.6-dg-only` 且platforms只有DG。
6. 關閉已核對完成的舊遊戲頁，依原白名單重新登入進入DG；面板初始停止，不需Console。

若原服務使用Native Node：

```text
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

建置會清除舊 `public/mt-*.js`／`public/mt-*.json` 公開產物，不刪除MT原始碼或任何DG檔案。舊MT入口／API／腳本回410 `mt_disabled`，不再代理到MT。

本次未代部署或修改Render服務。資料庫若仍有DNS或連線錯誤，需另外核對原資料庫設定；移除MT並非該問題的修復。
