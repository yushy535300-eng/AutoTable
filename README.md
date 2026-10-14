# AutoBac／百家工程師 v3.2.2

**完整 DG／MT 網站更新包。**保留原登入、娛樂城白名單、資料庫及 `/admin`；登入後選 DG 或 MT。

本次以使用者手機流程與實際公開原廠 V3.2.9 bundle 修正 DG 手機多桌接線。手機真正用 `betBtnMan.confirmBtn/cancelBtn` 和管理器的 `betFlag`；不再因沿用 PC 欄位而排除所有桌卡。手機預設原生 Mobile，電腦維持 Desktop，未知原生 builder 仍阻擋。

完整部署、修正內容與驗證界線請讀 **[AUTOBAC-V3.2.2-DEPLOY.md](./AUTOBAC-V3.2.2-DEPLOY.md)**，簡要部署請讀 [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)。舊版本文件僅供歷史參考，請不要沿用舊版手機相容選單或診斷版步驟。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Node.js 22／pnpm 9。保留原環境變數；`TZ_WHITELIST_ENABLED=true`；不要刪除資料庫或關閉白名單。Docker Web Service：`Dockerfile Path=./Dockerfile`。

部署後核對 `/api/health`，以及 `/autobac-version.json` 的 **`3.2.2-dg-mobile-v329`**，再重新開啟網站。登入／面板安裝不自動下注，初始保持停止；不需 Console。

單桌可選平注、馬丁 1→3→7→15、倍投 1→2→4→8。3／5／所有已載入桌固定平注，各桌獨立推薦。正式接受與結算、防同局重送、止盈止損和人工混合下注歸屬保護保留。平台官方有效流水未知保持待同步，不用工具下注總額冒充。

ChatGPT／Gemini等策略名稱沿用原網站本地算法，不是真實模型API。奇偶與V38依完整實際牌張，缺資料不回退其他策略；V38為原四式，不是剩牌機率或獲利保證。

本次已接通原廠手機方法並有離線流程證據，**尚未在使用者部署真機驗證新版自動下注**。MT 同源代理的訪問限制仍未解除；不能把此 DG 更新當成 MT 已修好。沒有替使用者登入或下注，不保證獲利。

測試源碼與匿名公開方法夾具包含在部署包。沒有真實帳密、Token、HAR、資料庫或使用者流程檔。
