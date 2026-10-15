# AutoBac v3.2.6：DG專用版

依要求暫時拔掉MT，本版只提供DG。保留AutoBac／百家工程師品牌、原娛樂城登入、白名單、資料庫、管理入口與固定頂部列；MT原始碼保留供日後重新整合，但不在本版運行。

## 本次變更

登入後只顯示DG卡片，沒有MT選項或MT錯誤畫面。根頁不再取得MT授權、開啟MT iframe或安裝MT面板。原MT後端代理不註冊，舊 `/api/mt/*`、`/mt-game/*` 及MT公開JavaScript連結回傳HTTP410與 `mt_disabled`，不向MT轉送請求。正常 `pnpm build` 只建置DG，不再自動建置MT執行檔；完整包不包含 `public/mt-*` 公開腳本。建置前也會清理舊MT公開JavaScript／JSON產物，因此覆蓋原專案時不需手動找殘留檔。

DG手機／電腦、原生多桌、面板、單桌平注／馬丁／倍投、多桌固定平注、官方流水、停止、同局防重送、混合人工下注與待結算離開保護均保留。本次不修改DG下注引擎、限額規則或官方報表讀取邏輯。官方資料缺失仍待同步，不自行改成本工具估算額。

## 更新步驟

先停止新增下注，核對平台正式待確認／待結算注單；更新或關閉頁面不會取消平台已接受的下注。

1. 備份原GitHub專案，解壓本版完整網站ZIP。
2. 將解壓內容更新到原GitHub根目錄，不只上傳ZIP，也不多套一層資料夾。
3. Render保留原Docker Web Service，`Dockerfile Path=./Dockerfile`，Docker Command維持原設定（使用原Dockerfile預設啟動時留空）。
4. 保留原全部環境變數、資料庫及白名單；`TZ_WHITELIST_ENABLED=true`。不用加Render API金鑰或代理設定，不刪資料庫。
5. 依原流程提交及部署。核對 `/api/health` 回正常，`/autobac-version.json` 的版本為 `3.2.6-dg-only`、`platforms` 只有 `DG`。
6. 關閉已核對完成的舊遊戲頁，重新依原白名單登入，進入DG。面板初始停止，需要你明確開始及風險確認。

若直接在Node環境執行：

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

仍使用Node22及pnpm9.12.0。健康檢查為 `/api/health`。

## 日後重新接回MT

`lib/mt-*`、`server/mt-game-proxy.ts`、`scripts/build-mt-click-console.cjs` 及匿名測試保留，`build:mt` 單獨指令也留著。但只執行它不會重新啟用MT；必須同時重新接上入口／後端並驗證正式授權、來源及完整流程，不能把舊403問題當作已解決。

本版不建立VPN、不改出口IP、不購買任何節點，也未替你修改正式Render服務。

## 驗證與界線

交付時以正式建置、DG專用入口／停用路由、DG手機原生完整流程及匿名手機網站回歸核對。MT停用路由測試會真正啟動本機HTTP伺服器，確認旧MT請求不落入靜態頁且DG路由正常。

DG核心來源與生產bundle會與本次移除前備份逐位元核對，確保沒有為移除MT更改下注引擎。離線測試不等於新的真實下注驗證；沒有連正式帳號、修改正式資料庫或代替使用者下注。

原專案仍有既有TypeScript全域型別／部分桌面水合警告，不能宣稱全專案型別全通過。之前貼出的資料庫DNS／連線問題也不是拔掉MT就能保證解決；部署若仍有該問題，須依原資料庫設定另行排查。

包內不含真實帳密、Token、Cookie、HAR、資料庫、使用者流程檔、代理帳密或Render金鑰。
