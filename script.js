const paths = [
  {
    id: "frontend",
    title: "前端基础与工程化",
    description: "HTML、CSS、JavaScript、浏览器机制、构建工具和部署流程。",
    meta: "8 周",
    progress: 35
  },
  {
    id: "backend",
    title: "后端与 API 设计",
    description: "HTTP、数据库、认证、接口规范和服务端部署实践。",
    meta: "10 周",
    progress: 20
  },
  {
    id: "algorithm",
    title: "数据结构与算法",
    description: "数组、链表、树、图、动态规划和复杂度分析。",
    meta: "长期",
    progress: 18
  },
  {
    id: "english",
    title: "技术英语与写作",
    description: "阅读英文文档，输出技术笔记，训练清晰表达。",
    meta: "持续",
    progress: 42
  }
];

const notes = [
  {
    title: "Cloudflare Pages 静态部署清单",
    category: "部署",
    summary: "记录域名绑定、构建输出目录、缓存、404 页面和上线检查项。",
    tags: ["Cloudflare", "Pages", "DNS"]
  },
  {
    title: "CSS 布局复盘：Grid 与 Flex",
    category: "前端",
    summary: "用真实页面拆解什么时候使用二维网格，什么时候使用一维弹性布局。",
    tags: ["CSS", "Layout"]
  },
  {
    title: "JavaScript 异步模型",
    category: "前端",
    summary: "整理调用栈、任务队列、Promise 和浏览器事件循环的关系。",
    tags: ["JavaScript", "Browser"]
  },
  {
    title: "算法错题：滑动窗口",
    category: "算法",
    summary: "总结窗口边界移动条件、常见模板和容易漏掉的终止条件。",
    tags: ["Algorithm", "Template"]
  },
  {
    title: "项目复盘模板",
    category: "复盘",
    summary: "从目标、约束、方案、结果、偏差和下一步六个维度复盘项目。",
    tags: ["Review", "Output"]
  },
  {
    title: "读书笔记：系统化学习",
    category: "读书",
    summary: "把输入、加工、输出和反馈设计成闭环，而不是只收集资料。",
    tags: ["Book", "Learning"]
  }
];

const state = {
  activeCategory: "全部",
  query: ""
};

const pathGrid = document.querySelector("#pathGrid");
const noteGrid = document.querySelector("#noteGrid");
const filters = document.querySelector("#filters");
const searchInput = document.querySelector("#searchInput");

function getCompletedPaths() {
  return JSON.parse(localStorage.getItem("completedPaths") || "[]");
}

function setCompletedPaths(ids) {
  localStorage.setItem("completedPaths", JSON.stringify(ids));
}

function renderPaths() {
  const completed = getCompletedPaths();

  pathGrid.innerHTML = paths.map((path) => {
    const done = completed.includes(path.id);
    const progress = done ? 100 : path.progress;

    return `
      <article class="path-card reveal ${done ? "done" : ""}" data-path="${path.id}" tabindex="0" role="button" aria-pressed="${done}">
        <p class="path-meta">${path.meta}</p>
        <h3>${path.title}</h3>
        <p>${path.description}</p>
        <div class="progress" aria-label="${path.title} 进度 ${progress}%">
          <span style="width: ${progress}%"></span>
        </div>
        <strong>${done ? "已完成" : `${progress}%`}</strong>
      </article>
    `;
  }).join("");
}

function renderFilters() {
  const categories = ["全部", ...new Set(notes.map((note) => note.category))];

  filters.innerHTML = categories.map((category) => `
    <button class="filter ${category === state.activeCategory ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");
}

function renderNotes() {
  const query = state.query.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    const inCategory = state.activeCategory === "全部" || note.category === state.activeCategory;
    const haystack = `${note.title} ${note.category} ${note.summary} ${note.tags.join(" ")}`.toLowerCase();
    return inCategory && (!query || haystack.includes(query));
  });

  noteGrid.innerHTML = visibleNotes.length
    ? visibleNotes.map((note) => `
      <article class="note-card reveal">
        <p class="path-meta">${note.category}</p>
        <h3>${note.title}</h3>
        <p>${note.summary}</p>
        <div class="note-tags">${note.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      </article>
    `).join("")
    : `<p class="empty">没有匹配的笔记。可以换一个关键词，或后续把新笔记加入 <code>script.js</code>。</p>`;
}

pathGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-path]");
  if (!card) return;
  togglePath(card.dataset.path);
});

pathGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-path]");
  if (!card) return;
  event.preventDefault();
  togglePath(card.dataset.path);
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  renderFilters();
  renderNotes();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderNotes();
});

function togglePath(id) {
  const completed = getCompletedPaths();
  const next = completed.includes(id)
    ? completed.filter((item) => item !== id)
    : [...completed, id];

  setCompletedPaths(next);
  renderPaths();
}

document.querySelector("#year").textContent = new Date().getFullYear();
renderPaths();
renderFilters();
renderNotes();
