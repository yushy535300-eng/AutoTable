# AutoBac v3.2.4 部署

詳細說明：[AUTOBAC-V3.2.4-DEPLOY.md](./AUTOBAC-V3.2.4-DEPLOY.md)。本次修正MT傳輸接線與手機輸入防放大，**尚未證明MT上游限制解除**。

1. 先停止新增下注並核對待結算注單，備份GitHub原專案。
2. 解壓完整網站ZIP，將內容更新到原專案根目錄，不是只上傳ZIP，不多一層資料夾。
3. Render沿用原 **Docker Web Service**：`Dockerfile Path=./Dockerfile`，Docker Command留空。
4. 保留原資料庫和全部環境變數，`TZ_WHITELIST_ENABLED=true`；不要刪資料庫或關閉白名單。
5. 提交更新並部署，確認 `/api/health` 正常、`/autobac-version.json` 顯示 **`3.2.4-mt-transport-zoom`**。
6. 關閉舊遊戲頁，重新依原白名單登入選DG或MT。初始停止，不需Console。
7. MT若仍限制，由說明內匯出安全連線診斷；新版後端日誌 `[AutoBac MT entry]` 只記HTTP與限制狀態，無授權網址。

原服務若為Native Node，沿用：

```text
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

金鑰不需放進網站，不公開帳密、Token、Cookie、HAR、資料庫或使用者流程記錄。此次沒有代部署或修改Render服務。
