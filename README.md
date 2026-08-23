# 🎤 My Concert Builder

给 ITZY / LE SSERAFIM 自己编排一场演唱会，并记录你看过的真实演唱会。

**在线访问（GitHub Pages）**：`https://wangyy992.github.io/concert/`

## 功能

- **🎫 编排模式**：按专辑浏览完整曲库（含日专日单与 2025/2026 回归），选 Intro、分任意个 Part、给每首歌标「花车 / 巡场 / 饭撒·小舞台 / 普通舞台」、选 Outro。
- **点即播**：每首歌内嵌官方试听片段（约 16 秒），点 ▶ 在页面内直接播放，「连播整场」按顺序自动串播。没试听的歌可点 📁 上传本地音频。
- **📖 观演记录模式**：记录看过的演唱会——团 / 巡演 / 日期 / 城市 / 场馆 / 评分 / 感想 + 当晚实际曲目单，可「▶ 播放这场」。
- **导出**：Apple Music 逐首直达链接；或「歌手 - 歌名」列表配合 TuneMyMusic / Soundiiz **自动在 AM / 网易云建歌单**。含存档 JSON 导入/导出。
- 所有数据存在浏览器本地（localStorage），私有、刷新不丢。

## 文件

- `index.html` — 完整单文件应用（曲库/封面/试听片段已内嵌），GitHub Pages 首页。
- `concert-online.template.html` — `index.html` 的源模板（数据用占位符），配合 `build/` 生成。
- `build/` — 从 Apple iTunes 接口自动构建曲库数据的脚本，见 `build/README.md`。
- `local-youtube.html` + `data.js` / `styles.css` / `app.js` — 早期版本，用 YouTube 内嵌播放**整首歌**，适合本地运行。

## 开启 GitHub Pages（一次性）

仓库 **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `/ (root)` → Save**。
稍等一两分钟，站点即在 `https://wangyy992.github.io/concert/` 上线。
