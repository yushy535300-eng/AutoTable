# AutoBac DG／MT v3.1：部署後自行登入

完整步驟與本版限制請看 [AUTOBAC-V3.1-DEPLOY.md](AUTOBAC-V3.1-DEPLOY.md)。

1. 備份原 GitHub 專案，解壓完整網站 ZIP，將內容放在專案根目錄，不要只上傳 ZIP。
2. 更新原 Render Web Service、原分支、原網址；不要改成 Static Site。
3. Docker 服務保持 `Dockerfile Path = ./Dockerfile`、Docker Command 留空。
4. 保留原 `DATABASE_URL`、`ADMIN_PASSWORD`、其他環境變數及原白名單；`TZ_WHITELIST_ENABLED` 保持 `true`。
5. 提交後部署最新 commit，待服務 Live。
6. 核對 `/api/health`，再用自己的帳號登入。選「建議相容」及 DG／MT 大標誌，載入平台與完整面板；不需貼 Console，初始不自動下注。

若沿用 Native Node 服務：

```text
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

`pnpm build` 包含 DG、MT 引擎、網站與 Node 後端。不要公開 `.env`、帳密、Cookie、Token、HAR 或帳戶報告；不要刪白名單資料庫。

**手機建議模式：MT走已核對的原生Mobile多台流程，DG走電腦相容版。DG原生手機引擎尚未完成接線，不能宣稱與影片一樣。** 已有離線流程、官方流水及配注驗證，但仍需使用者在原白名單部署環境進行真機核對，未替使用者登入或實際下注。
