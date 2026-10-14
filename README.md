# AutoBac｜百家工程師 v3.1

可部署的DG／MT完整網站專案。沿用原娛樂城登入、原白名單及資料庫，登入後選平台，再自動載入百家工程師面板；初始停止，確認風險後才開始。

- 手機「建議相容」：MT原生Mobile多台、DG電腦相容版。**DG原生手機引擎尚未完成，不宣稱與影片相同。**
- 單桌可選馬丁、倍投、平注；3／5／所有已載入桌固定平注。
- 兩平台官方今日／近7日有效流水、止盈止損、完整／迷你面板、防重送及正式接受／結算核對。

**部署請先閱讀 [AUTOBAC-V3.1-DEPLOY.md](AUTOBAC-V3.1-DEPLOY.md) 及 [RENDER_DEPLOY.md](RENDER_DEPLOY.md)。**

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Node.js 22／pnpm 9。Render沿用原Docker Web Service；保持原環境設定，解壓內容放GitHub專案根目錄，不要只上傳ZIP或單一Console檔。

原 `/admin`、`ADMIN_PASSWORD`、`TZ_WHITELIST_ENABLED=true` 及 `DATABASE_URL` 管理方式保留。請保留既有資料庫與授權，不要停用或刪除原白名單。

此包不含登入憑證、HAR、`.env`、瀏覽器工作階段或資料庫，也沒有代替使用者部署／登入／下注。離線測試及獨立建置不等於正式平台實機下注驗證。來源平台的Origin、Cookie、Token或IP限制仍由來源伺服器決定。
