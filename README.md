# 个人学习实验室

这是一个面向 Cloudflare Pages 的零构建静态个人学习网站，用于展示学习路线、笔记、项目和复盘模板。

## 本地预览

直接打开 `index.html` 即可预览，也可以用任意静态服务器：

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

- 页面结构在 `index.html`
- 视觉样式在 `styles.css`
- 学习路线和笔记数据在 `script.js`
- 安全响应头在 `_headers`
- 404 页面在 `404.html`
