# AutoBac／百家工程師 v3.2.4

**完整 DG／MT 網站更新包**，保留原娛樂城登入、白名單、資料庫、`/admin`、固定頂部列、DG手機原生V3.2.9引擎與兩平台共用控制面板。

本次修正 MT 原廠 WebSocket 網域推導、同源手機多台導航、WAV 資源與首次文件導航標頭；新增手機固定viewport與輸入16px防自動放大。

**MT 有效授權入口的上游訪問限制尚未證明解除。**本版是已確認程式接線修正版，不是「真機MT全部可用」保證；限制頁仍停止且不安裝下注面板。詳見 [本次部署說明](./AUTOBAC-V3.2.4-DEPLOY.md)。歷史版本說明僅供參考。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Node.js 22／pnpm 9.12。保留原環境變數、資料庫與白名單；`TZ_WHITELIST_ENABLED=true`。Render原Docker Web Service：`Dockerfile Path=./Dockerfile`，Docker Command留空。

先停止並核對待結算注單再更新。部署後核對 `/api/health` 與 `/autobac-version.json` 的 **`3.2.4-mt-transport-zoom`**。重新依原白名單登入後選DG或MT，不需Console，初始保持停止。此次沒有代部署。

單桌平注／馬丁1→3→7→15／倍投1→2→4→8；3／5／所有已載入桌固定平注。原生接受、結算、防重送、止盈止損與混合人工下注歸屬保護保留。官方流水未知顯示待同步，不拿工具下注總额替代。

策略名稱ChatGPT／Gemini等沿用原本地算法，不是真正模型API；奇偶／V38需完整實際牌張。未知builder、缺資料或無法核對正式接受／結算不冒充成功，不保證獲利。

離線回歸不等於真實MT登入／下注或iOS真機縮放已驗證。包內有完整原碼、匿名測試及必要資源，無Render金鑰、帳密、Token、Cookie、HAR、資料庫或使用者流程檔。金鑰不需要放進網站。
