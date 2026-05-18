# 成何体统 · 计算机技术札记

这是一个部署在 Cloudflare Pages 的零构建静态计算机技术网站，主题为“成何体统”。站点用于沉淀计算机基础、Web 工程、部署运维、问题排查和工程复盘。

## 功能

- 页面目录导航
- 技术文章列表
- 分类筛选
- 模糊检索
- 文章详情阅读区
- 本地评论区
- 响应式布局
- Cloudflare Pages `_headers` 安全响应头

## 本地预览

```powershell
python -m http.server 8788
```

然后访问 `http://localhost:8788`。

## Cloudflare Pages 设置

- Framework preset: `None`
- Build command: 留空
- Build output directory: `/`
- Root directory: 仓库根目录

## 评论说明

站点已加入两层评论能力：

- 公开评论：使用 Utterances，基于 GitHub Issues。需要在 GitHub 安装 utterances app，并授权 `Cherish-ChenRH/Person-Space` 仓库。
- 本地备忘：使用浏览器 `localStorage`，只保存在当前访问者自己的浏览器里。

如果后续需要完全自建评论接口，可以升级到 Cloudflare Pages Functions + D1。
