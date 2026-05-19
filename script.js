// 在这里添加你的学习路径
const learningPaths = [];

// 在这里添加你的笔记。分类、标签云和检索都从这里自动生成。
// 每条笔记可选 cover 字段填入封面图路径（如 "assets/covers/note-001.jpg"）
const posts = [];

const pathList = document.querySelector("#pathList");
const postList = document.querySelector("#postList");
const latestPosts = document.querySelector("#latestPosts");
const categoryList = document.querySelector("#categoryList");
const tagCloud = document.querySelector("#tagCloud");
const searchPanel = document.querySelector("#searchPanel");
const searchTrigger = document.querySelector("#searchTrigger");
const closeSearch = document.querySelector("#closeSearch");
const searchInput = document.querySelector("#searchInput");
const searchResults = document.querySelector("#searchResults");
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

function postSearchText(post) {
  return [
    post.title,
    post.category,
    post.summary,
    (post.tags || []).join(" "),
    post.content || ""
  ].join(" ");
}

function pathSearchText(path) {
  return [
    path.title,
    path.status,
    path.next,
    path.description || ""
  ].join(" ");
}

function getCategoryCounts() {
  return posts.reduce((counts, post) => {
    counts[post.category] = (counts[post.category] || 0) + 1;
    return counts;
  }, {});
}

function getTags() {
  return [...new Set(posts.flatMap((post) => post.tags || []))];
}

// 根据封面图或分类生成不同的渐变色
const coverGradients = [
  "linear-gradient(135deg, #fce7f3, #ede9fe)",
  "linear-gradient(135deg, #e0f2fe, #ede9fe)",
  "linear-gradient(135deg, #f0fdf4, #dcfce7)",
  "linear-gradient(135deg, #fff7ed, #fce7f3)",
  "linear-gradient(135deg, #fdf4ff, #e0f2fe)",
  "linear-gradient(135deg, #ede9fe, #fce7f3)",
];

function coverGradientFor(index) {
  return coverGradients[index % coverGradients.length];
}

function renderPaths() {
  pathList.innerHTML = learningPaths.length
    ? learningPaths.map((path) => `
      <article class="learning-path">
        <div>
          <span>${path.status || "未开始"}</span>
          <h3>${path.title}</h3>
          <p>${path.description || ""}</p>
        </div>
        <div class="progress" aria-label="${path.title} 进度 ${path.progress || 0}%">
          <i style="width: ${path.progress || 0}%"></i>
        </div>
        <p class="next-step">下一步：${path.next || "待补充"}</p>
      </article>
    `).join("")
    : `<div class="empty-state">
      <h3>还没有学习路径</h3>
      <p>在 <code>script.js</code> 的 <code>learningPaths</code> 数组中添加你的路径。</p>
    </div>`;
}

function renderPosts() {
  postList.innerHTML = posts.length
    ? posts.map((post, index) => {
      const coverStyle = post.cover
        ? ""
        : `style="background: ${coverGradientFor(index)}"`;
      const coverContent = post.cover
        ? `<img src="${post.cover}" alt="${post.title}" loading="lazy">`
        : `<span class="post-cover-placeholder">${(post.category || "文")[0]}</span>`;
      return `
        <article class="post-card card" id="${post.id}">
          <div class="post-cover" ${coverStyle}>${coverContent}</div>
          <div class="post-body">
            <div class="post-meta">
              <span class="post-category-badge">${post.category || "未分类"}</span>
              <span>${post.date || "未设置日期"}</span>
            </div>
            <h3><a href="#${post.id}">${post.title}</a></h3>
            <p class="post-excerpt">${post.summary || ""}</p>
            <div class="tag-row">${(post.tags || []).map((tag) => `<span>${tag}</span>`).join("")}</div>
          </div>
        </article>
      `;
    }).join("")
    : `<article class="post-card card" style="padding: 22px 24px;">
      <div class="empty-state">
        <h3>还没有笔记</h3>
        <p>在 <code>script.js</code> 的 <code>posts</code> 数组中添加学习笔记。</p>
      </div>
    </article>`;
}

function renderSidebars() {
  latestPosts.innerHTML = posts.length
    ? posts.slice(0, 5).map((post) => `
      <div class="latest-item">
        <time>${post.date || "未设置日期"}</time>
        <a href="#${post.id}">${post.title}</a>
        <small>${post.category || "未分类"}</small>
      </div>
    `).join("")
    : `<p class="empty">暂无最新文章。</p>`;

  const counts = getCategoryCounts();
  categoryList.innerHTML = Object.keys(counts).length
    ? Object.entries(counts).map(([category, count]) => `
      <a href="#latest">
        ${category}
        <span>${count}</span>
      </a>
    `).join("")
    : `<p class="empty">暂无分类。</p>`;

  const tags = getTags();
  tagCloud.innerHTML = tags.length
    ? tags.map((tag) => `<span>${tag}</span>`).join("")
    : `<p class="empty">暂无标签。</p>`;

  document.querySelector("#postCount").textContent = String(posts.length);
  document.querySelector("#categoryCount").textContent = String(Object.keys(counts).length);
  document.querySelector("#tagCount").textContent = String(tags.length);
}

function getSearchItems() {
  return [
    ...learningPaths.map((path) => ({
      type: "学习路径",
      title: path.title,
      summary: path.next || path.description || "暂无说明",
      href: "#paths",
      text: pathSearchText(path)
    })),
    ...posts.map((post) => ({
      type: post.category || "笔记",
      title: post.title,
      summary: post.summary || "",
      href: `#${post.id}`,
      text: postSearchText(post)
    }))
  ];
}

function renderSearchResults() {
  const query = searchInput.value.trim();
  const items = getSearchItems()
    .map((item) => ({ item, score: fuzzyScore(item.text, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  searchResults.innerHTML = items.length
    ? items.map((item) => `
      <a class="search-result" href="${item.href}" data-search-result>
        <small>${item.type}</small>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
      </a>
    `).join("")
    : `<p class="empty">暂无可检索内容。添加路径或笔记后会自动出现在这里。</p>`;
}

function openSearch() {
  searchPanel.hidden = false;
  searchInput.value = "";
  renderSearchResults();
  searchInput.focus();
}

function closeSearchPanel() {
  searchPanel.hidden = true;
}

function getComments() {
  return JSON.parse(localStorage.getItem("siteComments") || "[]");
}

function setComments(comments) {
  localStorage.setItem("siteComments", JSON.stringify(comments));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderComments() {
  const comments = getComments();
  commentList.innerHTML = comments.length
    ? comments.map((comment) => `
      <article class="comment-item">
        <strong>${comment.name}</strong>
        <time>${comment.time}</time>
        <p>${escapeHtml(comment.body)}</p>
      </article>
    `).join("")
    : `<p class="empty">还没有本地备忘。</p>`;
}

searchTrigger.addEventListener("click", openSearch);
closeSearch.addEventListener("click", closeSearchPanel);
searchInput.addEventListener("input", renderSearchResults);

searchPanel.addEventListener("click", (event) => {
  if (event.target === searchPanel || event.target.closest("[data-search-result]")) {
    closeSearchPanel();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSearchPanel();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
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
renderPaths();
renderPosts();
renderSidebars();
renderSearchResults();
renderComments();
