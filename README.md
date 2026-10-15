# AutoBac／百家工程師 v3.2.6：DG專用版

依要求暫時移除MT，只保留DG入口。原娛樂城登入、白名單、資料庫、`/admin`、固定頂部列及已可用DG手機原生V3.2.9核心保留。詳細更新與部署：[AUTOBAC-V3.2.6-DEPLOY.md](./AUTOBAC-V3.2.6-DEPLOY.md)。歷史DG／MT文件僅供參考，不代表本版啟用MT。

登入後只顯示DG，根頁不會取得MT授權或安裝MT面板。正式後端停用MT代理；舊MT API及公開脚本回傳410 `mt_disabled`。MT原始碼保留供日後重新接回，但正式建置只建立DG，也會清理舊版MT公開產物。

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Node22／pnpm9.12.0。先停止新增下注並核對平台正式待結算注單，再更新原GitHub根目錄。Render沿用原Docker Web Service與 `./Dockerfile`。所有環境變數、資料庫及白名單保留，`TZ_WHITELIST_ENABLED=true`；不需Render金鑰、代理帳密或VPN設定。

部署後核對 `/api/health` 正常、`/autobac-version.json` 的版本為 `3.2.6-dg-only` 且platforms只有DG。原白名單登入後進入DG，不需Console，面板初始停止。

DG單桌平注／馬丁1→3→7→15／倍投1→2→4→8；3、5及所有已載入桌固定平注。官方今日及近7日有效流水維持正式平台口徑，不以工具下注額替代。原生接受、正式結算、防重送、停止及混合人工下注歸屬保護保留。本版只移除MT，不改DG下注核心，也不保證獲利。

沒有替你更新正式Render服務、修改資料庫或解除之前的資料庫DNS錯誤。匿名離線回歸不是新一輪真機下注驗證，原專案既有全域型別與部分桌面水合警告仍有界線，詳見本版部署說明。

完整包不包含Render金鑰、真實帳密、Token、Cookie、HAR、資料庫、代理帳密或使用者流程檔。
