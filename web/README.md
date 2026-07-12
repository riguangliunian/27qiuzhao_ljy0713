# 秋招投递网页版本

这个目录可以直接发布到 GitHub Pages。

- `index.html`：网页入口
- `app.js` / `styles.css`：前端逻辑和样式
- `data/jobs.json`：公开岗位数据

个人投递状态、流程、备注、修改历史保存在当前浏览器的 `localStorage`。更新 `data/jobs.json` 不会覆盖这些本地记录。

## 本机生成数据

全量刷新会用腾讯文档当前抓到的所有秋招/提前批岗位重建公开数据：

```powershell
cd C:\Users\27260\Downloads\MAI-UI-main
.\autumn-recruit-miniapp\scripts\update_from_export.ps1
powershell -ExecutionPolicy Bypass -File "C:\Users\27260\Downloads\MAI-UI-main\autumn-recruit-miniapp\scripts\export_web_data.ps1"
```

每日增量更新会读取表格里最新的 `更新时间`，再取“今天”和“最新更新时间”之间的闭区间公司数据，追加/更新到本地数据库，不删除旧岗位：

```powershell
cd C:\Users\27260\Downloads\MAI-UI-main
powershell -ExecutionPolicy Bypass -File "C:\Users\27260\Downloads\MAI-UI-main\autumn-recruit-miniapp\scripts\update_daily.ps1"
```

然后把 `autumn-recruit-miniapp/web` 发布到 GitHub Pages。

## 关于每日更新

GitHub Pages 只是静态网站，不能自己运行爬虫。每日更新需要：

- 在你的电脑或服务器定时运行同步脚本，然后把 `web/data/jobs.json` push 到 GitHub。
- 或者用 GitHub Actions 定时更新，但腾讯文档登录态/cookie 过期时仍需要人工重新授权。

本机浏览器里的修改记录会长期保留在同一浏览器里。换电脑、换浏览器、清理浏览器数据都会丢失本地记录；需要跨设备保存时，请用页面里的“导出记录/导入记录”，或者后续接一个云数据库。
