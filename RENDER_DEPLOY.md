# AutoBac DG／MT v3.2：部署後自行登入

完整步驟、本次修正及驗證限制請看 [AUTOBAC-V3.2-DEPLOY.md](./AUTOBAC-V3.2-DEPLOY.md)。

1. 備份原 GitHub 專案，解壓完整網站 ZIP，將內容放在專案根目錄，不要只上傳 ZIP。
2. 更新原 Render Web Service、原分支、原網址；不要改成 Static Site。
3. Docker 服務保持 `Dockerfile Path = ./Dockerfile`、Docker Command 留空。
4. 保留原 `DATABASE_URL`、`ADMIN_PASSWORD`、其他環境變數及原白名單；`TZ_WHITELIST_ENABLED` 保持 `true`。不要刪除資料庫。
5. 提交後部署最新 commit，待服務 Live。
6. 核對 `/api/health` 與 `/autobac-version.json` 顯示 `3.2`，完整重新整理網站，再用自己的帳號登入。
7. 登入後直接選 DG 或 MT，新版不再要求另外選版型。不需貼 Console，面板初始不自動下注。

若沿用 Native Node 服務：

```text
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

`pnpm build` 包含 DG、MT 引擎、網站與 Node 後端。不要公開 `.env`、帳密、Cookie、Token、HAR 或帳戶報告。

手機預設 MT 使用原生 Mobile 流程、DG 使用既有電腦相容引擎。**未知 DG 原生手機 builder 仍會阻擋；MT 特定 Render 部署的上游拒絕頁仍須實際核對，不能把健康檢查或面板存在當成平台授權成功。**本包已做離線流程驗證，但未替使用者登入或送出真實下注。
