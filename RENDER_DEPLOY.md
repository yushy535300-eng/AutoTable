# AutoBac v3.2.14：分程式在線與使用紀錄部署

詳細說明：[AUTOBAC-V3.2.14-DEPLOY.md](./AUTOBAC-V3.2.14-DEPLOY.md)。本版仍只有DG，MT入口及正式代理停用，原始碼保留供日後重接。

1. 先停止新增下注，核對平台正式待結算，備份原GitHub專案。
2. 解壓完整網站ZIP，內容更新到原GitHub根目錄，不只上傳ZIP、不多一層資料夾。確認 `tsconfig.json`、`global.css`、`metro.config.js`、`tailwind.config.js`、`package.json` 及原鎖檔完整提交。
3. Render保留原Docker Web Service與 `Dockerfile Path=./Dockerfile`，使用原Dockerfile預設啟動時Docker Command留空。
4. 原環境變數、資料庫及白名單保留，`TZ_WHITELIST_ENABLED=true`。不用加入Render金鑰或代理設定。
5. 提交及部署後核對 `/api/health` 正常、`/autobac-version.json` 為 `3.2.14-per-app-online-usage-records` 且platforms只有DG。
6. 依原白名單重新登入DG；面板初始停止。一般使用者勾選風險聲明後，管理員在 `/admin` 對應帳號的「使用紀錄 → 免責確認」可查看逐筆時間、版本及完整聲明。

新紀錄使用原PostgreSQL，自動新增獨立表和索引，需要原DB帳號具備建表權限，不用清空資料庫或改白名單備註。未成功保存時前台會顯示未同步；不新增下注門檻、不補造部署前的紀錄。

若原服務使用Native Node：

```text
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

建置仍清理舊 `public/mt-*.js`／`public/mt-*.json` 公開產物，不刪MT原始碼或DG檔案。本次未代部署、寫正式資料庫或修改Render服務。既有資料庫DNS或連線錯誤需另外核對，新增紀錄並非DNS修復。

已選定AUTO主畫面圖示及名称維持不變。若仍見舊圖，移除手機舊捷徑後從Safari／Chrome重新加入；伺服器不能強制替換OS既有捷徑快取。

本次平注止損／止盈不預填，沒有2,600下限，使用者可自填較小正整數。馬丁只有止損最低2,600，可自填更高金額，不固定2,600。各配注方式保留自己的停止金額草稿。

三個網站分別部署各自更新包，沿用原共用白名單資料庫。連線統計使用獨立暫存表，無需VPN、代理或跨站傳送密碼。聖甲之心僅登入UI固定TZ，OFA实际帳號識別保留。

更新後三站的 `/admin-version.json` 都應顯示3.2.14；不要只確認Deploy成功卻仍使用舊commit。新次使用時間與已结算本次損益由AutoBac用戶端回報，不從免責勾選反推；舊資料未回傳就保持未回傳。
