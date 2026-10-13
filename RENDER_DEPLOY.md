# 百家工程師：部署後自己登入

## 建議：更新原本的 Render 服務

這樣保留原網址、白名單資料庫與環境變數，無須把帳密交給任何人。

1. 先備份原 GitHub 專案。解壓「完整網站.zip」，將裡面的檔案放到原 GitHub 專案根目錄；`Dockerfile`、`package.json` 與 `pnpm-lock.yaml` 應在根目錄，不要只上傳 zip。
2. 在 **原 Render Web Service** 確認部署的是該 GitHub 專案與分支。
3. 若原服務使用 Docker，保持 **Dockerfile Path = `./Dockerfile`**，Docker Command 留空，沿用 Dockerfile 的啟動命令。不需要另外設定 Build Command。
4. 保留原環境變數及白名單資料庫：

| 名稱 | 設定 |
| --- | --- |
| `DATABASE_URL` | 原本的 PostgreSQL 連線網址；不要換成空資料庫或公開到 GitHub。 |
| `TZ_WHITELIST_ENABLED` | `true`。不需要先關閉白名單測試登入。 |
| `ADMIN_PASSWORD` | 保留原管理頁密碼。 |
| `PORT` | 由 Render 提供，不必自行修改。 |
| 其他既有設定 | 保留原值。 |

5. 使用 **Manual Deploy → Deploy latest commit** 部署更新；待服務顯示 Live。
6. 打開 `https://原本網址/api/health`，應回傳 `ok: true`。這只是後端健康檢查，不代表帳戶登入成功。
7. 打開原網站網址，用自己的娛樂城帳號／密碼登入；成功後直接顯示 DG，遊戲載入後自動裝入百家工程師面板。**不再需要 Console。**

> 一般使用者網站只有「登入 → DG」；不再顯示多平台主頁。登入後不自動開始下注，須在面板點開始並完成風險確認。

## 若原服務使用 Native Node

可保留原服務类型與已安裝的 Chromium 設定。使用：

```text
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

Dockerfile 會處理 Chromium 的系統相依，若原 Native 環境缺少這些相依，請依原部署方式處理；不要把瀏覽器路徑設為本機 Windows 路徑。

## 不要做的事

- 不要刪除原 PostgreSQL 或白名單。
- 不要把 `TZ_WHITELIST_ENABLED` 改為 `false`。
- 不要把 `.env`、Cookie、登入 Token 或帳密上傳 GitHub。
- 不要只部署成 Render Static Site；此程式需要原 Node 後端。
- 不要使用新的來源網址假設娛樂城一定允許登入；原綁定環境最適合此次更新。

## 第一次自己測試

1. 登入後确认 DG 正常載入。
2. 確認百家工程師面板初始「停止」。
3. 確認 **1 桌**可選馬丁或平注；**3／5／所有桌**固定平注不可更改。
4. 使用自己的測試环境檢查下注接受與結算；不要把「已送出」當成「平台已接受」。

## 驗證狀態

交付前已執行程式生產建置與離線回歸，真正白名單帳戶登入由你部署後操作；沒有繞過授權，也沒有使用你的帳密。完整說明請見 `DG-LOGIN-ONLY-README.md`。
