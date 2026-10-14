# AutoBac／百家工程師 v3.2

完整 DG／MT 雙平台網站。保留原娛樂城登入、白名單、資料庫與 `/admin`；登入後選擇平台，載入共用風格的前景控制面板。

**本次完整部署說明：[`AUTOBAC-V3.2-DEPLOY.md`](./AUTOBAC-V3.2-DEPLOY.md)。**

## 部署

將本包內容放在原 GitHub 專案根目錄。Render 保持原 Docker Web Service、`Dockerfile Path=./Dockerfile`，保留原授權、白名單與資料庫環境變數。原 `/admin`、`ADMIN_PASSWORD`、`TZ_WHITELIST_ENABLED=true` 及 `DATABASE_URL` 管理方式保留。不要刪除 Render 服務或資料庫，不要上傳 `.env`、帳密、Cookie、Token、完整 HAR 或資料庫。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Node.js 22／pnpm 9。部署完成後核對 `/api/health` 與 `/autobac-version.json`（本包版本 3.2），再完整重新整理網頁，使用原登入流程。

## 本次修正摘要

DG 原生控制物件與多桌場景搜尋、手機／迷你版尺寸、建置後算牌與奇偶選單、MT gs1 授權及 ti 參數、拒絕頁不掛載面板、MT 官方餘額接線、DG／MT 首次官方流水等待與更新操作已整合。原同局防重送、正式接受／結算、單桌平注／馬丁／倍投、多桌固定平注及停止保護均保留。新版不再要求另選版型。

## 使用界線

策略名稱中的 ChatGPT／Gemini 等為原網站本地算法，不是真實模型 API 呼叫。奇偶與 V38 使用完整實際牌張；V38 為原四式規則，不是剩牌機率或獲利保證。

測試為離線 DOM、合成 Socket 與攔截對外請求，沒有真實帳號或真實下注驗證。DG 未知原生手機 builder 仍阻擋；MT 特定 Render 部署能否取得真正遊戲，不能僅憑建置或面板存在宣稱成功。來源平台授權仍由來源伺服器決定。詳細行為、官方流水口徑與安全診斷方式請閱讀本次部署說明。
