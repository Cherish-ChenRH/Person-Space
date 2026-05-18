const articles = [
  {
    id: "cloudflare-pages",
    title: "Cloudflare Pages 部署链路：从 Git 到域名",
    category: "部署运维",
    date: "2026-05-19",
    summary: "梳理静态站部署、自定义域名、DNS、缓存头和常见 502/代理问题的排查顺序。",
    tags: ["Cloudflare", "Pages", "DNS", "Deploy"],
    content: [
      "部署静态站的关键不是把页面传上去，而是确认 GitHub、Pages 构建、边缘网络、DNS、HTTPS 和浏览器代理这条链路每一段都可验证。",
      "最小检查顺序：先访问 pages.dev 默认域名，再查自定义域名 DNS，最后看浏览器 Network 里的 Remote Address。如果 Remote Address 是 127.0.0.1，优先排查本机代理。",
      "Cloudflare Pages 的零构建项目可以使用根目录作为输出目录，同时用 _headers 固化安全头和缓存策略。"
    ],
    checklist: ["pages.dev 返回 200", "自定义域名已加入 Pages Custom domains", "DNS 记录已代理或按需灰云测试", "浏览器代理没有劫持域名"]
  },
  {
    id: "frontend-system",
    title: "前端工程不是会写页面，而是能维持秩序",
    category: "Web 前端",
    date: "2026-05-18",
    summary: "从结构、状态、样式、性能和可访问性五个维度建立前端工程判断框架。",
    tags: ["HTML", "CSS", "JavaScript", "Frontend"],
    content: [
      "页面能显示只是起点。真正的前端工程要回答：结构是否可维护，状态是否可追踪，样式是否可扩展，性能是否可度量，可访问性是否被尊重。",
      "小站点不必一开始引入重框架，但应该先把数据、渲染、交互和样式边界分开。这样后续接入 CMS、搜索索引或评论系统时不会推倒重来。",
      "成何体统的前端标准是：看得清、改得动、坏了能定位。"
    ],
    checklist: ["语义化 HTML", "响应式布局", "脚本无阻塞加载", "关键交互可键盘操作"]
  },
  {
    id: "fuzzy-search",
    title: "站内检索：先做可解释的模糊匹配",
    category: "工程方法",
    date: "2026-05-17",
    summary: "不用一上来引入搜索服务，先用本地索引完成标题、摘要、标签和分类的近似匹配。",
    tags: ["Search", "Index", "UX"],
    content: [
      "个人技术站早期内容量不大，本地模糊检索足够有效。重点是把标题、摘要、标签、分类合并成可检索文本，并给连续命中更高分。",
      "当文章规模增长到数百篇，再考虑 Pagefind、Algolia 或自建索引。过早引入服务会增加维护成本。",
      "检索结果应该保留分类筛选，因为用户经常不是只找一个词，而是在一个知识域内缩小范围。"
    ],
    checklist: ["支持大小写无关", "支持非连续字符命中", "保留分类过滤", "无结果时给出明确反馈"]
  },
  {
    id: "algorithm-notes",
    title: "算法学习的体统：模板、反例、复杂度",
    category: "计算机基础",
    date: "2026-05-16",
    summary: "算法笔记不只记录答案，更要记录适用条件、反例和复杂度边界。",
    tags: ["Algorithm", "Data Structure", "Review"],
    content: [
      "刷题如果只保留代码，很快会变成重复劳动。高质量算法笔记应该包含题型识别、模板、反例、复杂度和错因。",
      "例如滑动窗口不是两个指针的机械移动，而是维护一个随边界变化仍然成立的不变量。",
      "每道错题至少写清楚：错在边界、状态定义、贪心假设，还是复杂度判断。"
    ],
    checklist: ["题型识别", "关键不变量", "边界反例", "时间和空间复杂度"]
  },
  {
    id: "debugging",
    title: "问题排查：别猜，先建立证据链",
    category: "工程方法",
    date: "2026-05-15",
    summary: "从现象、路径、日志、最小复现和回滚策略建立可执行的 Debug 流程。",
    tags: ["Debug", "Network", "Operations"],
    content: [
      "Debug 的第一原则是停止脑补。先确认现象是否稳定，再拆路径：客户端、代理、DNS、CDN、源站、应用、数据。",
      "每一步只验证一个假设，并记录命令、结果和下一步。这样不会在复杂链路里来回跳。",
      "当问题影响线上访问时，修复动作必须和回滚动作一起设计。"
    ],
    checklist: ["复现条件", "链路拆分", "单变量验证", "回滚方案"]
  }
];

const state = {
  activeCategory: "全部",
  query: "",
  selectedArticleId: articles[0].id
};

const articleList = document.querySelector("#articleList");
const reader = document.querySelector("#reader");
const filters = document.querySelector("#filters");
const searchInput = document.querySelector("#searchInput");
const commentForm = document.querySelector("#commentForm");
const commentName = document.querySelector("#commentName");
const commentBody = document.querySelector("#commentBody");
const commentList = document.querySelector("#commentList");

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function fuzzyScore(text, query) {
  const source = normalizeText(text);
  const target = normalizeText(query);
  if (!target) return 1;
  if (source.includes(target)) return 100 + target.length;

  let score = 0;
  let cursor = 0;
  let streak = 0;

  for (const char of target) {
    const index = source.indexOf(char, cursor);
    if (index === -1) return 0;
    streak = index === cursor ? streak + 1 : 1;
    score += 3 + streak;
    cursor = index + 1;
  }

  return score;
}

function articleSearchText(article) {
  return [
    article.title,
    article.category,
    article.summary,
    article.tags.join(" "),
    article.content.join(" ")
  ].join(" ");
}

function getVisibleArticles() {
  return articles
    .map((article) => ({
      article,
      score: fuzzyScore(articleSearchText(article), state.query)
    }))
    .filter(({ article, score }) => {
      const inCategory = state.activeCategory === "全部" || article.category === state.activeCategory;
      return inCategory && score > 0;
    })
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article);
}

function renderToc() {
  const toc = document.querySelector("#toc");
  const sections = [...document.querySelectorAll("[data-toc]")];
  toc.innerHTML = sections.map((section) => `
    <a href="#${section.id || "top"}">${section.dataset.toc}</a>
  `).join("");
}

function renderFilters() {
  const categories = ["全部", ...new Set(articles.map((article) => article.category))];
  filters.innerHTML = categories.map((category) => `
    <button class="filter ${category === state.activeCategory ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");
}

function renderArticles() {
  const visibleArticles = getVisibleArticles();
  if (!visibleArticles.some((article) => article.id === state.selectedArticleId)) {
    state.selectedArticleId = visibleArticles[0]?.id || null;
  }

  articleList.innerHTML = visibleArticles.length
    ? visibleArticles.map((article) => `
      <button class="article-card ${article.id === state.selectedArticleId ? "active" : ""}" type="button" data-article="${article.id}">
        <span class="article-meta">${article.category} · ${article.date}</span>
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
        <div class="tag-row">${article.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      </button>
    `).join("")
    : `<p class="empty">没有匹配的文章。可以减少关键词，或换一个分类继续检索。</p>`;

  renderReader();
  document.querySelector("#articleCount").textContent = String(articles.length);
}

function renderReader() {
  const article = articles.find((item) => item.id === state.selectedArticleId);
  if (!article) {
    reader.innerHTML = `<p class="empty">请选择一篇文章。</p>`;
    return;
  }

  reader.innerHTML = `
    <span class="article-meta">${article.category} · ${article.date}</span>
    <h3>${article.title}</h3>
    <p>${article.summary}</p>
    ${article.content.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    <h4>检查清单</h4>
    <ul>${article.checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
    <div class="tag-row">${article.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
  `;
}

function getComments() {
  return JSON.parse(localStorage.getItem("siteComments") || "[]");
}

function setComments(comments) {
  localStorage.setItem("siteComments", JSON.stringify(comments));
}

function renderComments() {
  const comments = getComments();
  commentList.innerHTML = comments.length
    ? comments.map((comment) => `
      <article class="comment-item">
        <div class="comment-meta">${comment.name} · ${comment.time}</div>
        <p>${escapeHtml(comment.body)}</p>
      </article>
    `).join("")
    : `<p class="empty">还没有本地评论。你可以先写一条，用来验证评论区交互。</p>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  renderFilters();
  renderArticles();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderArticles();
});

articleList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-article]");
  if (!card) return;
  state.selectedArticleId = card.dataset.article;
  renderArticles();
});

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = commentName.value.trim();
  const body = commentBody.value.trim();
  if (!name || !body) return;

  const comments = getComments();
  comments.unshift({
    name: escapeHtml(name),
    body,
    time: new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  setComments(comments.slice(0, 20));
  commentForm.reset();
  renderComments();
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderToc();
renderFilters();
renderArticles();
renderComments();
