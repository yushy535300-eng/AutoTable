# AutoBac v3.2.2 部署

詳細步驟：[AUTOBAC-V3.2.2-DEPLOY.md](./AUTOBAC-V3.2.2-DEPLOY.md)。這是完整網站更新，不是 Console 或舊只讀診斷版。

1. 備份原 GitHub 專案，解壓網站 ZIP，把內容放在原專案根目錄，不要只上傳 ZIP。
2. 沿用原 Render **Docker Web Service**、分支與網址；`Dockerfile Path=./Dockerfile`，Docker Command 留空。
3. 保留原 `DATABASE_URL`、`ADMIN_PASSWORD` 及其他環境變數。`TZ_WHITELIST_ENABLED=true`，不要刪資料庫或停用白名單。
4. 提交程式，部署最新 commit，等服務完成部署。
5. 確認 `/api/health` 可用，`/autobac-version.json` 顯示 **`3.2.2-dg-mobile-v329`**。
6. 關閉舊遊戲頁，重新開啟網站、用原帳號登入、選 DG 或 MT。無版型選單，不需 Console；初始停止。

DG手機自動要求原生Mobile，僅允許已核對的V3.2.9原生多桌builder；電腦維持Desktop。未知版本、缺資料或未能核對接受／結算不自動送單／推進。MT代理訪問限制仍未解除，這次DG更新不代表MT已修好。

若原服務為Native Node，沿用原型態：

```text
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

禁止公開 `.env`、帳密、Token、Cookie、HAR、資料庫或使用者流程紀錄。離線回歸不等同真機自動下注已驗證。
