# 构建曲库数据

`build-all.cjs` 从 Apple iTunes 公共接口抓取 ITZY / LE SSERAFIM 的完整发行
（美区 + 日区合并、过滤 remix/伴奏/英文版/OST），下载官方试听片段并用
ffmpeg 转码为约 16 秒、32kbps 单声道，连同专辑封面一起输出为三个 JSON：
`lib.json` / `covers-data.json` / `previews-data.json`，再注入 `index.html`。

依赖：Node.js、`ffmpeg-static`（`npm i ffmpeg-static`）、`curl`。
运行：`T=16 BR=32k node build-all.cjs`
