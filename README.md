# 成何体统 · 个人学习路径

这是一个部署在 Cloudflare Pages 的零构建静态个人学习路径网站，主题为“成何体统”。站点保留博客式布局、最新文章、分类、检索和评论能力，但默认不预设与你无关的内容。

## 功能

- 学习路径展示
- 最新笔记列表
- 分类和标签自动统计
- 模糊检索
- 本地评论区
- Utterances 公开评论入口
- 响应式布局
- 自定义背景图 `assets/site-background.jpg`
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

## 内容维护

打开 `script.js`：

- 在 `learningPaths` 数组中添加学习路径。
- 在 `posts` 数组中添加学习笔记。
- 分类、最新文章、标签和检索结果会自动生成。

## 评论说明

站点已加入两层评论能力：

- 公开评论：使用 Utterances，基于 GitHub Issues。需要在 GitHub 安装 utterances app，并授权 `Cherish-ChenRH/Person-Space` 仓库。
- 本地备忘：使用浏览器 `localStorage`，只保存在当前访问者自己的浏览器里。

如果后续需要完全自建评论接口，可以升级到 Cloudflare Pages Functions + D1。
