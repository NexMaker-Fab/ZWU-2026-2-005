# TeamFlow Wiki — Complete Replication Package

> 一个轻量级、类 Notion 风格的团队协作 Wiki — 纯前端实现,中英双语,可一键部署至 GitHub Pages。
> 项目地址:https://github.com/NexMaker-Fab/ZWU-2026-2-005
> 部署地址:https://nexmaker-fab.github.io/ZWU-2026-2-005/

---

## 📋 目录

1. [项目元信息](#1-项目元信息)
2. [技术栈与依赖](#2-技术栈与依赖)
3. [目录结构](#3-目录结构)
4. [架构与数据模型](#4-架构与数据模型)
5. [关键设计决策](#5-关键设计决策)
6. [复刻步骤](#6-复刻步骤)
7. [本地运行与部署](#7-本地运行与部署)
8. [源码(完整)](#8-源码完整)
9. [已知问题与注意事项](#9-已知问题与注意事项)
10. [复刻优先级建议](#10-复刻优先级建议)

---

## 1. 项目元信息

| 项 | 值 |
|---|---|
| **名称** | TeamFlow Wiki |
| **版本** | v1.2 |
| **作者** | ZWU-2026 Group 2 Team 5(Xiping Chen / Purple Zhou / Xiaoyuan Zhang) |
| **协议** | MIT |
| **仓库** | NexMaker-Fab/ZWU-2026-2-005 |
| **代码量** | ~200 KB(22 个源文件,7 个 JS / 2 个 CSS / 3 个 HTML / 1 个 JSON) |
| **测试** | 9 个测试用例(集成 + 单元),零依赖 |

---

## 2. 技术栈与依赖

**零运行时依赖。** 全部使用浏览器原生 API + ES Modules。

| 类别 | 选型 |
|---|---|
| 前端框架 | **Vanilla JS(无框架)** |
| 模块系统 | **ES Modules** (<script type="module">) |
| 样式 | 纯 CSS 3(CSS Variables + Flexbox + Grid + ackdrop-filter) |
| 字体 | Google Fonts: Inter, Outfit(CDN 加载) |
| 数据存储 | localStorage(主)+ data/content.json(初始/导出) |
| 远端同步 | GitHub REST Contents API(纯 etch,无 SDK) |
| 部署 | GitHub Pages + GitHub Actions(官方模板) |
| 测试 | 自研 mini Jest-like 框架(	ests/assert.js 96 行) |
| 浏览器目标 | 现代浏览器(Chrome/Edge/Safari/Firefox 最新 2 版) |

**外部资源(CDN)**:
- https://fonts.googleapis.com — Inter / Outfit
- https://fonts.gstatic.com — 字体文件
- https://api.github.com — 同步 API

**CSP 限制**(在 pp.html / landing.html 中声明):
\\\
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://api.github.com;
\\\

---

## 3. 目录结构

\\\
ZWU-2026-2-005/
├── index.html                  # 14 行,自动重定向到 landing.html
├── app.html                    # 398 行,主应用 HTML 骨架
├── landing.html                # 254 行,产品介绍/着陆页
├── README.md                   # 6.3 KB,用户文档
├── LICENSE                     # MIT
├── community-web-dev-SKILL.md  # 7 KB,开发方法论
│
├── css/
│   ├── style.css               # 2066 行(~45 KB),主应用设计系统
│   └── landing.css             # 816 行(~18 KB),着陆页样式
│
├── js/
│   ├── app.js                  # 1366 行(~49 KB),主应用编排器
│   ├── editor.js               # 783 行(~25 KB),块编辑器引擎
│   ├── i18n.js                 # 438 行(~25 KB),中英翻译字典
│   ├── pages.js                # 388 行(~13 KB),侧边栏树管理
│   ├── landing.js              # 276 行(~9 KB),着陆页交互
│   ├── github.js               # 103 行(~3 KB),GitHub Contents API
│   └── storage.js              # 115 行(~3 KB),数据加载/导出
│
├── data/
│   └── content.json            # 182 行(~5 KB),默认页面内容
│
├── tests/
│   ├── runner.html             # 145 行,测试运行器 UI
│   ├── runner.css              # 252 行,测试运行器样式
│   ├── assert.js               # 96 行,Jest-like 测试框架
│   └── specs/
│       ├── editor.spec.js      # 7 测试 — 块编辑器
│       ├── i18n.spec.js        # 2 测试 — 翻译完整性
│       └── storage.spec.js     # 4 测试 — 数据持久化
│
├── .github/
│   └── workflows/
│       └── static.yml          # 43 行,GitHub Pages 部署
│
├── .gitignore
├── .workbuddy/                 # (被 gitignore)
└── dogfood-output/             # (被 gitignore)
\\\

**总文件**:22 个源文件(排除 .git/.workbuddy/dogfood-output)

---

## 4. 架构与数据模型

### 4.1 三页架构

\\\
index.html (重定向)
   ↓
landing.html (产品介绍/展示)
   ↓ 点击"进入项目"
app.html (主应用 — Notion 风格编辑器)
   ↓
data/content.json (页面内容) ← → GitHub API (云同步)
   ↓
localStorage (本地缓存)
\\\

### 4.2 数据模型 (data/content.json)

\\\json
{
  "site": {
    "name": "TeamFlow Wiki",
    "theme": "light"
  },
  "pages": [
    {
      "id": "welcome",
      "title": "Welcome",
      "icon": "👋",
      "lang": "en",
      "author": "Zhang San",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "favorite": false,
      "parentId": null,
      "blocks": [
        {
          "id": "b1xxxxxx",
          "type": "heading | paragraph | image | divider",
          "level": 1,                          // heading only
          "content": "...",                   // heading/paragraph
          "src": "data:...",                  // image only
          "caption": "..."                    // image only
        }
      ]
    }
  ],
  "trash": [],   // 软删除的页面(3 天后自动清除)
  "team": []     // 团队成员列表
}
\\\

**块类型支持**(共 4 种):

| 类型 | 数据字段 | 渲染方式 |
|---|---|---|
| paragraph | content | <div contenteditable> |
| heading | level (1-3) + content | <div contenteditable> + CSS data-level |
| image | src + caption | <img> + 可编辑 caption |
| divider | (无) | <hr> |

### 4.3 模块依赖图

\\\
┌──────────────┐
│   app.js     │  ← 入口,编排一切
└──────┬───────┘
       │ imports
       ├─→ storage.js   (loadContent / saveToLocalStorage / exportAsJson)
       ├─→ editor.js    (BlockEditor + processImageFile)
       ├─→ pages.js     (PageManager)
       ├─→ github.js    (getGitHubSettings / saveToGitHub)
       └─→ i18n.js      (t / tLang / applyTranslations)
                              ↑
                              └── pages.js / editor.js 也直接 import i18n
\\\

### 4.4 localStorage 键

| Key | 内容 |
|---|---|
| 	eamflow_content | 完整数据 JSON(自动保存) |
| 	eamflow_theme | 'light' / 'dark' |
| 	eamflow_lang | 'en' / 'zh' |
| 	eamflow_github | {owner, repo, branch, token} |
| 	eamflow_username | 显示名 |
| 	eamflow_expanded_pages | [id, id, ...] 侧边栏展开状态 |
| 	eamflow_sidebar_width | 侧边栏宽度(像素) |

---

## 5. 关键设计决策

### 5.1 为什么不用框架?

- **零构建**:克隆即用,适合 GitHub Pages 静态部署
- **ES Modules 替代打包**:浏览器原生支持,代码即部署
- **教学价值**:代码本身就是教材,适合开源贡献

### 5.2 双页分离 (landing.html + app.html)

- landing.html 独立的产品介绍页,有自己的样式和 JS
- pp.html 才是主应用,需 localStorage + DOM 元素
- index.html 仅做 0 秒跳转

### 5.3 块编辑器设计

- **数据结构**:locks: [{id, type, content, ...}] 纯 JSON
- **DOM 结构**:每个块是一个 <div class="block">,内部 <div class="block-content" contenteditable>
- **斜杠命令**:在空行输入 / 弹出菜单,改变 	ype 而非内容
- **拖拽**:HTML5 Drag API,视觉指示器(drag-over-top / drag-over-bottom)
- **图片处理**:> 5MB 拒绝 / > 500KB Canvas 压缩到 1600px 宽 JPEG quality 0.7

### 5.4 国际化 (i18n) 设计

- **触发方式**:data-i18n / data-i18n-placeholder / data-i18n-title 三个 data 属性
- **动态应用**:pplyTranslations() 扫描所有元素并替换
- **跨模块通信**:pplyTranslations() 末尾 dispatchEvent('language-changed'),各模块监听
- **笔记语言锁定**:每个 page.lang 字段记录创建时的语言,	Lang(key, lang) 用于显示该页内的"无标题"等占位符,不受全局切换影响

### 5.5 GitHub 同步

- **认证**:Personal Access Token(PAT),存 localStorage
- **API**:PUT /repos/{owner}/{repo}/contents/data/content.json
- **SHA 处理**:先 GET 拿 SHA 再 PUT(更新现有文件必需)
- **Base64 编码**:toa(unescape(encodeURIComponent(json))) — 处理 UTF-8 中文
- **错误**:返回 {success, message},UI 用 toast 显示

### 5.6 软删除 / 回收站

- 删除移入 data.trash,添加 deletedAt / deletedBy
- 启动时 _purgExpiredTrash() 自动清除 3 天前的项
- 还原时回到原 parentId(若父页已删则提升为根)

---

## 6. 复刻步骤

### Step 1: 创建项目骨架

\\\ash
mkdir my-wiki && cd my-wiki
# 创建以下目录:
mkdir -p css js data tests/specs .github/workflows
\\\

### Step 2: 按以下顺序复制源文件

| 顺序 | 文件 | 优先级 | 说明 |
|---|---|---|---|
| 1 | index.html | 必须 | 14 行重定向 |
| 2 | js/i18n.js | 必须 | 其他模块依赖它 |
| 3 | js/storage.js | 必须 | 工具函数 |
| 4 | js/github.js | 必须 | API 封装 |
| 5 | js/editor.js | 必须 | 核心编辑器 |
| 6 | js/pages.js | 必须 | 侧边栏管理 |
| 7 | js/app.js | 必须 | 入口 |
| 8 | pp.html | 必须 | 主页面 |
| 9 | css/style.css | 必须 | 主样式 |
| 10 | data/content.json | 必须 | 初始内容 |
| 11 | landing.html | 推荐 | 着陆页 |
| 12 | css/landing.css | 推荐 | 着陆页样式 |
| 13 | js/landing.js | 推荐 | 着陆页 JS |
| 14 | 	ests/* | 可选 | 测试套件 |
| 15 | .github/workflows/static.yml | 推荐 | 自动部署 |

### Step 3: 修改品牌信息(可选)

- pp.html line 26:<span class="sidebar-title" id="site-name">TeamFlow Wiki</span> → 你的产品名
- data/content.json line 3:"name": "TeamFlow Wiki" → 你的产品名
- landing.html line 29:<span class="brand-title">TeamFlow Wiki</span> → 你的产品名
- index.html line 6:<title>Redirecting to TeamFlow Wiki...</title> → 你的产品名
- pp.html line 7:emoji favicon 📝 可改
- landing.html line 7:emoji favicon 🚀 可改

### Step 4: 修改 i18n 字典

打开 js/i18n.js,找到 export const translations = { en: {...}, zh: {...} },修改所有字符串为你自己的品牌术语。

### Step 5: 测试运行

\\\ash
npx serve . -l 3000
# 浏览器打开 http://localhost:3000
\\\

**功能验收清单**:
- [ ] 落地页动画正常(粒子背景)
- [ ] 点击"进入项目"跳转 pp.html
- [ ] 首次进入弹出 welcome 模态,输入名字后进入
- [ ] 在空行输入 / 弹出斜杠菜单
- [ ] 创建 2 个页面,删除一个,应进入回收站
- [ ] 切换 EN/中,所有 UI 文字更新
- [ ] 切换浅色/深色,所有颜色更新
- [ ] 拖拽侧边栏页面,排序生效
- [ ] 配置 GitHub token 后点"同步到 GitHub",文件出现在仓库

### Step 6: 部署

\\\ash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<你的仓库>.git
git push -u origin main
# 在 GitHub 仓库 → Settings → Pages → Source: GitHub Actions
\\\

---

## 7. 本地运行与部署

### 7.1 本地开发

**前置要求**:任何静态文件服务器。

\\\ash
# 选项 1: 使用 npx
npx serve . -l 3000

# 选项 2: 使用 Python
python -m http.server 3000

# 选项 3: 使用 VS Code Live Server 扩展
\\\

> ⚠️ **必须用 HTTP 服务器,不能 ile:// 打开**。因为用了 ES Modules,ile:// 协议下跨文件 import 会被浏览器 CORS 阻止。

### 7.2 部署到 GitHub Pages

1. 把代码推送到 GitHub 仓库
2. **Settings** → **Pages** → **Source**: GitHub Actions
3. 推送到 main 分支即触发 .github/workflows/static.yml
4. 等待 ~30s,访问 https://<用户名>.github.io/<仓库名>/

---

## 8. 源码(完整)

> 所有源码按文件原貌提供。章节标题以 ## 8.X 开头,代码块以语言标注 (html/css/js/json/yaml)。


### 8.1 `index.html` (14 lines, redirect to landing.html)

**File**: `index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=landing.html">
  <title>Redirecting to TeamFlow Wiki...</title>
  <script>
    window.location.replace("landing.html");
  </script>
</head>
<body>
  <p>正在跳转至介绍页面，若没有自动跳转请 <a href="landing.html">点击此处</a>。</p>
</body>
</html>

```


### 8.2 `app.html` (398 lines, main app HTML skeleton)

**File**: `app.html`

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TeamFlow Wiki — Collaborative Team Wiki</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>">
  <meta name="description" content="A lightweight Notion-like wiki for team collaboration. Edit content directly in the browser and save to GitHub.">
  <meta name="keywords" content="wiki, collaboration, team, notion, editor, github">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com;">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css?v=20260413">
</head>
<body>


  <!-- Sidebar Overlay (mobile) -->
  <div class="sidebar-overlay" id="sidebar-overlay"></div>

  <!-- ===== SIDEBAR ===== -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">T</div>
      <span class="sidebar-title" id="site-name">TeamFlow Wiki</span>
      <button class="sidebar-collapse-btn" id="sidebar-collapse-btn" data-i18n-title="sidebar.toggle" title="Toggle sidebar">◀</button>
    </div>

    <div class="sidebar-search">
      <div class="sidebar-search-wrapper">
        <input type="text" class="sidebar-search-input" id="page-search" data-i18n-placeholder="search.placeholder" placeholder="Search pages...">
        <button class="sidebar-search-clear" id="search-clear-btn" data-i18n-title="search.clear" title="Clear">✕</button>
      </div>
    </div>

    <div class="sidebar-quick-actions">
      <button class="sidebar-quick-btn" id="quick-add-page-btn">
        <span>+</span>
        <span data-i18n="sidebar.quick.new">新页面</span>
      </button>
      <button class="sidebar-quick-btn" id="quick-import-btn">
        <span>📁</span>
        <span data-i18n="sidebar.quick.import">导入</span>
      </button>
    </div>

    <div class="sidebar-section-label">
      <span data-i18n="sidebar.favorites">收藏页面</span>
      <button class="btn-icon btn-sm" id="add-fav-btn" title="+">+</button>
    </div>

    <nav class="sidebar-pages sidebar-pages-favorites" id="fav-page-list">
      <!-- Favorite pages populated by JS -->
    </nav>

    <div class="sidebar-section-label">
      <span data-i18n="sidebar.pages">所有页面</span>
      <button class="btn-icon btn-sm" id="add-page-btn" data-i18n-title="sidebar.new_page" title="New page">+</button>
    </div>

    <nav class="sidebar-pages" id="page-list">
      <!-- Pages populated by JS -->
    </nav>



    <div class="sidebar-footer">
      <button type="button" class="sidebar-user-info" id="sidebar-user-btn">
        <div class="sidebar-user-avatar" id="sidebar-user-avatar">?</div>
        <div class="sidebar-user-details">
          <span class="sidebar-user-name" id="sidebar-user-name">Anonymous</span>
          <span class="sidebar-user-role" id="sidebar-user-role" data-i18n="sidebar.role">管理员</span>
        </div>
      </button>
      <div class="sidebar-footer-icons">
        <button class="sidebar-icon-btn" id="theme-toggle-btn" data-i18n-title="sidebar.theme.toggle" title="Toggle theme">
          <span id="theme-icon">🌙</span>
        </button>
        <button class="sidebar-icon-btn" id="settings-btn" data-i18n-title="sidebar.settings.tooltip" title="Settings">
          <span>⚙️</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- ===== SIDEBAR RESIZE HANDLE ===== -->
  <div class="sidebar-resize-handle" id="sidebar-resize-handle"></div>

  <!-- ===== MAIN CONTENT ===== -->
  <main class="main-content" id="main-content">

    <!-- Topbar -->
    <div class="topbar">
      <div class="topbar-left">
        <button class="topbar-menu-btn" id="topbar-menu-btn" data-i18n-title="topbar.menu" title="Menu">☰</button>
        <div class="topbar-breadcrumb" id="breadcrumb">
          <span class="breadcrumb-link" id="breadcrumb-root">TeamFlow</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-link breadcrumb-current" id="breadcrumb-page">Welcome</span>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="btn btn-secondary btn-sm" id="save-local-btn">
          <span>💾</span>
          <span class="btn-label" data-i18n="save.local">Save to Local</span>
        </button>
        <button class="btn btn-primary btn-sm" id="save-github-btn">
          <span>🔄</span>
          <span class="btn-label" data-i18n="save.github">Save to GitHub</span>
        </button>
      </div>
    </div>

    <!-- Editor Area -->
    <div class="editor-container" id="editor-container">
      <div class="editor-wrapper">
        <!-- Page Header -->
        <div class="page-header">
          <div class="page-header-top" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="page-icon-display" id="page-icon-display" role="button" tabindex="0"
                 data-i18n-title="editor.change_icon" title="Change icon">👋</div>
            <button class="btn-icon favorite-btn" id="favorite-toggle-btn" style="font-size: var(--text-2xl); cursor: pointer;" title="Favorite">☆</button>
          </div>
          <div class="page-title" id="page-title" contenteditable="true" data-placeholder="Untitled" role="textbox" aria-label="Page title">Welcome</div>
        </div>

        <!-- Page Meta (author + date) -->
        <div class="page-meta" id="page-meta">
          <span class="page-meta-author" id="page-meta-author"></span>
          <span class="page-meta-sep">·</span>
          <span class="page-meta-date" id="page-meta-date"></span>
        </div>

        <!-- Block Editor -->
        <div class="editor" id="editor" role="document">
          <!-- Blocks rendered by JS -->
        </div>
      </div>
    </div>

    <!-- Settings View (secondary page) -->
    <div class="settings-view" id="settings-view" style="display:none">
      <div class="settings-layout">
        <nav class="settings-nav">
          <div class="settings-nav-header">
            <button class="settings-back-btn" id="settings-back-btn">← <span data-i18n="settings.back">返回</span></button>
            <h3 data-i18n="settings.title">设置</h3>
          </div>
          <button class="settings-nav-item active" data-tab="sync">
            <span class="settings-nav-icon">🔄</span>
            <span data-i18n="settings.tab.sync">同步配置</span>
          </button>
          <button class="settings-nav-item" data-tab="trash">
            <span class="settings-nav-icon">🗑️</span>
            <span data-i18n="settings.tab.trash">回收站</span>
            <span class="trash-count-badge" id="trash-count-badge" style="display:none"></span>
          </button>
          <button class="settings-nav-item" data-tab="preferences">
            <span class="settings-nav-icon">🎨</span>
            <span data-i18n="settings.tab.preferences">偏好设置</span>
          </button>
          <button class="settings-nav-item" data-tab="team">
            <span class="settings-nav-icon">👥</span>
            <span data-i18n="settings.tab.team">团队</span>
          </button>
        </nav>
        <div class="settings-panel">
          <!-- Sync Config -->
          <div class="settings-section active" data-section="sync">
            <h2 data-i18n="settings.tab.sync">同步配置</h2>
            <p class="settings-section-desc" data-i18n="settings.sync.desc">配置 GitHub 仓库信息，将内容同步至远端仓库。</p>
            <div class="settings-form">
              <div class="form-group">
                <label class="form-label" for="settings-username" data-i18n="settings.username">显示名称</label>
                <input type="text" class="form-input" id="settings-username" data-i18n-placeholder="settings.username.placeholder" placeholder="e.g. Zhang San">
                <p class="form-hint" data-i18n="settings.username.hint">新建页面时会作为作者显示。</p>
              </div>
              <div class="form-group">
                <label class="form-label" for="github-owner" data-i18n="settings.owner">仓库所有者</label>
                <input type="text" class="form-input" id="github-owner" placeholder="e.g. NexMaker-Fab">
                <p class="form-hint" data-i18n="settings.owner.hint">您的 GitHub 用户名或组织名</p>
              </div>
              <div class="form-group">
                <label class="form-label" for="github-repo" data-i18n="settings.repo">仓库名称</label>
                <input type="text" class="form-input" id="github-repo" placeholder="e.g. ZWU-2026-2-005">
                <p class="form-hint" data-i18n="settings.repo.hint">存储内容的 Github 仓库名</p>
              </div>
              <div class="form-group">
                <label class="form-label" for="github-branch" data-i18n="settings.branch">分支</label>
                <input type="text" class="form-input" id="github-branch" placeholder="main" value="main">
              </div>
              <div class="form-group">
                <label class="form-label" for="github-token" data-i18n="settings.token">GitHub Token</label>
                <input type="password" class="form-input" id="github-token" placeholder="ghp_xxxxxxxxxxxx">
                <p class="form-hint" data-i18n="settings.token.hint">⚠️ Token 代表该仓库完整权限。</p>
              </div>
              <button class="btn btn-primary" id="settings-save-btn" data-i18n="settings.save">保存设置</button>
            </div>
          </div>
          <!-- Trash -->
          <div class="settings-section" data-section="trash">
            <h2 data-i18n="settings.tab.trash">回收站</h2>
            <p class="settings-section-desc" data-i18n="trash.hint">页面删除后在此保留 3 天，超期后自动清除。</p>
            <div class="trash-list" id="trash-list"></div>
          </div>
          <!-- Preferences -->
          <div class="settings-section" data-section="preferences">
            <h2 data-i18n="settings.tab.preferences">偏好设置</h2>
            <div class="pref-group">
              <h4 data-i18n="pref.theme.title">主题</h4>
              <div class="pref-cards">
                <button class="pref-card" data-theme-choice="light">
                  <span class="pref-card-icon">☀️</span>
                  <span data-i18n="pref.theme.light">浅色模式</span>
                </button>
                <button class="pref-card" data-theme-choice="dark">
                  <span class="pref-card-icon">🌙</span>
                  <span data-i18n="pref.theme.dark">深色模式</span>
                </button>
              </div>
            </div>
            <div class="pref-group">
              <h4 data-i18n="pref.lang.title">语言</h4>
              <div class="pref-cards">
                <button class="pref-card" data-lang-choice="zh">
                  <span class="pref-card-icon">🇨🇳</span>
                  <span data-i18n="pref.lang.zh">中文</span>
                </button>
                <button class="pref-card" data-lang-choice="en">
                  <span class="pref-card-icon">🇺🇸</span>
                  <span data-i18n="pref.lang.en">English</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Team -->
          <div class="settings-section" data-section="team">
            <h2 data-i18n="settings.tab.team">团队</h2>
            <p class="settings-section-desc" data-i18n="team.desc">管理团队成员，成员信息将同步至 GitHub。</p>
            <div class="team-add-form" id="team-add-form">
              <input type="text" class="form-input" id="team-name-input" data-i18n-placeholder="team.name.placeholder" placeholder="姓名">
              <input type="text" class="form-input" id="team-role-input" data-i18n-placeholder="team.role.placeholder" placeholder="角色，如 开发者">
              <button class="btn btn-primary btn-sm" id="team-add-btn" data-i18n="team.add">添加</button>
            </div>
            <div class="team-list" id="team-list"></div>
          </div>
        </div>
      </div>
    </div>


    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-bar-left">
        <span class="status-dot"></span>
        <span class="save-status" id="save-status" data-i18n="save.status.ready">Ready</span>
        <span class="status-sep">·</span>
        <span class="page-count" id="page-count">共 0 个页面</span>
      </div>
      <div class="status-bar-right">
        <span class="last-saved" id="last-saved"></span>
      </div>
    </div>
  </main>

  <!-- ===== FLOATING TOOLBAR ===== -->
  <div class="floating-toolbar" id="floating-toolbar" role="toolbar" aria-label="Formatting toolbar">
    <button class="btn-icon" data-command="bold" data-i18n-title="toolbar.bold" title="Bold (Ctrl+B)"><b>B</b></button>
    <button class="btn-icon" data-command="italic" data-i18n-title="toolbar.italic" title="Italic (Ctrl+I)"><i>I</i></button>
    <button class="btn-icon" data-command="underline" data-i18n-title="toolbar.underline" title="Underline (Ctrl+U)"><u>U</u></button>
    <div class="divider"></div>
    <button class="btn-icon" data-command="heading1" data-i18n-title="toolbar.h1" title="Heading 1">H1</button>
    <button class="btn-icon" data-command="heading2" data-i18n-title="toolbar.h2" title="Heading 2">H2</button>
    <button class="btn-icon" data-command="heading3" data-i18n-title="toolbar.h3" title="Heading 3">H3</button>
    <button class="btn-icon" data-command="paragraph" data-i18n-title="toolbar.p" title="Paragraph">¶</button>
  </div>

  <!-- ===== SLASH COMMAND MENU ===== -->
  <div class="slash-menu" id="slash-menu" role="listbox" aria-label="Block type menu">
    <div class="slash-menu-label" data-i18n="menu.title">Basic Blocks</div>
    <div class="slash-menu-item" data-type="paragraph" role="option">
      <div class="slash-menu-item-icon">📝</div>
      <div class="slash-menu-item-info">
        <div class="slash-menu-item-name" data-i18n="menu.text">Text</div>
        <div class="slash-menu-item-desc" data-i18n="menu.text.desc">Plain text paragraph</div>
      </div>
    </div>
    <div class="slash-menu-item" data-type="heading1" role="option">
      <div class="slash-menu-item-icon">H1</div>
      <div class="slash-menu-item-info">
        <div class="slash-menu-item-name" data-i18n="menu.h1">Heading 1</div>
        <div class="slash-menu-item-desc" data-i18n="menu.h1.desc">Large section heading</div>
      </div>
    </div>
    <div class="slash-menu-item" data-type="heading2" role="option">
      <div class="slash-menu-item-icon">H2</div>
      <div class="slash-menu-item-info">
        <div class="slash-menu-item-name" data-i18n="menu.h2">Heading 2</div>
        <div class="slash-menu-item-desc" data-i18n="menu.h2.desc">Medium section heading</div>
      </div>
    </div>
    <div class="slash-menu-item" data-type="heading3" role="option">
      <div class="slash-menu-item-icon">H3</div>
      <div class="slash-menu-item-info">
        <div class="slash-menu-item-name" data-i18n="menu.h3">Heading 3</div>
        <div class="slash-menu-item-desc" data-i18n="menu.h3.desc">Small section heading</div>
      </div>
    </div>
    <div class="slash-menu-item" data-type="image" role="option">
      <div class="slash-menu-item-icon">🖼️</div>
      <div class="slash-menu-item-info">
        <div class="slash-menu-item-name" data-i18n="menu.image">Image</div>
        <div class="slash-menu-item-desc" data-i18n="menu.image.desc">Upload or embed an image</div>
      </div>
    </div>
    <div class="slash-menu-item" data-type="divider" role="option">
      <div class="slash-menu-item-icon">—</div>
      <div class="slash-menu-item-info">
        <div class="slash-menu-item-name" data-i18n="menu.divider">Divider</div>
        <div class="slash-menu-item-desc" data-i18n="menu.divider.desc">Horizontal line separator</div>
      </div>
    </div>
  </div>



  <!-- ===== ICON PICKER ===== -->
  <div class="icon-picker" id="icon-picker">
    <!-- Populated by JS -->
  </div>

  <!-- ===== DELETE CONFIRM MODAL ===== -->
  <div class="modal-overlay" id="delete-confirm-modal">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h2 class="modal-title">🗑️ <span id="delete-modal-title" data-i18n="trash.confirm.title">删除页面</span></h2>
        <button class="modal-close" id="delete-modal-close-btn">×</button>
      </div>
      <div class="modal-body">
        <p id="delete-modal-desc" class="delete-modal-desc"></p>
        <div class="delete-modal-meta" id="delete-modal-meta"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="delete-modal-cancel-btn" data-i18n="trash.confirm.cancel">取消</button>
        <button class="btn btn-danger" id="delete-modal-confirm-btn" data-i18n="trash.confirm.ok">移至回收站</button>
      </div>
    </div>
  </div>

  <!-- ===== WELCOME MODAL (first-time setup) ===== -->
  <div class="modal-overlay" id="welcome-modal">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h2 class="modal-title" data-i18n="welcome.title">👋 Welcome to TeamFlow Wiki</h2>
      </div>
      <div class="modal-body">
        <p class="form-hint" style="margin-bottom:16px" data-i18n="welcome.desc">Please enter your display name so your teammates can identify your contributions.</p>
        <div class="form-group">
          <label class="form-label" for="welcome-username" data-i18n="welcome.label">Your Name</label>
          <input type="text" class="form-input" id="welcome-username" data-i18n-placeholder="welcome.placeholder" placeholder="e.g. Zhang San" autofocus>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="welcome-confirm-btn" data-i18n="welcome.confirm">Get Started</button>
      </div>
    </div>
  </div>

  <!-- ===== TOAST CONTAINER ===== -->
  <div class="toast-container" id="toast-container"></div>

  <!-- TOKEN SECURITY CONFIRM MODAL -->
  <div class="modal-overlay" id="token-security-modal">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h2 class="modal-title">🔐 安全提示</h2>
      </div>
      <div class="modal-body">
        <p>您的 GitHub Token 将保存在浏览器本地存储中，下次打开时自动加载。</p>
        <p style="margin-top:12px;font-size:0.88em;opacity:0.65;line-height:1.6">
          ⚠️ 请勿在公共或他人设备上保存 Token。如需清除，请前往浏览器开发者工具 → Application → Local Storage，删除 <code>teamflow_github</code> 条目。
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="token-security-cancel-btn">取消，不保存</button>
        <button class="btn btn-primary" id="token-security-confirm-btn">我已知晓，保存</button>
      </div>
    </div>
  </div>

  <!-- Import file input (hidden) -->
  <input type="file" id="import-file-input" accept=".json,.md,image/*" style="display:none">

  <!-- ===== SCRIPTS ===== -->
  <script type="module" src="js/app.js"></script>
</body>
</html>

```


### 8.3 `landing.html` (254 lines, product landing page)

**File**: `landing.html`

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TeamFlow Wiki — Presentation</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">
  <meta name="description" content="Welcome to TeamFlow Wiki. A lightweight modular collaboration knowledge base.">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com;">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/landing.css">
</head>
<body>

  <!-- Dynamic Interaction Background -->
  <canvas class="landing-canvas" id="landing-canvas"></canvas>

  <!-- Ambient Light Orbs -->
  <div class="ambient-orb orb-1"></div>
  <div class="ambient-orb orb-2"></div>
  <div class="ambient-orb orb-3"></div>

  <!-- Header Navigation -->
  <header class="landing-header">
    <div class="brand">
      <span class="brand-logo">🚀</span>
      <span class="brand-title">TeamFlow Wiki</span>
    </div>
    <div class="header-actions">
      <!-- Theme Switch Button -->
      <button class="icon-btn" id="theme-toggle-btn" title="Toggle Theme">
        <span id="theme-icon">🌙</span>
      </button>
      <!-- Language Selection -->
      <button class="lang-toggle-btn" id="lang-toggle-btn">
        <span class="lang-icon">🌐</span>
        <span id="lang-label">English / 中文</span>
      </button>
    </div>
  </header>

  <!-- Main Container -->
  <div class="landing-container">
    
    <!-- Hero Block -->
    <section class="hero-section">
      <div class="badge-wrapper">
        <span class="version-badge" data-i18n="landing.badge">✨ TeamFlow Wiki v1.2</span>
      </div>
      <h1 class="hero-title-shimmer">TeamFlow Wiki</h1>
      <p class="hero-subtitle" data-i18n="landing.subtitle">为现代开发团队打造的轻量级、卡片模块化协作知识库</p>
      
      <div class="action-buttons">
        <a href="app.html" class="btn btn-primary btn-glow" id="enter-project-btn">
          <span class="btn-icon">⚡</span>
          <span data-i18n="landing.action.enter">进入项目</span>
        </a>
        <a href="app.html?open=settings" class="btn btn-secondary" id="configure-sync-btn">
          <span class="btn-icon">⚙️</span>
          <span data-i18n="landing.action.settings">配置同步</span>
        </a>
      </div>
    </section>

    <!-- Content Grid -->
    <div class="content-grid">
      
      <!-- Card: Team Members -->
      <div class="info-card glass-card team-card">
        <div class="card-header">
          <span class="card-icon">👥</span>
          <h3 data-i18n="landing.team.title">项目构建成员</h3>
        </div>
        <p class="card-description" data-i18n="landing.team.desc">感谢为 TeamFlow Wiki 项目付出心血的开发与设计小组成员：</p>
        
        <div class="team-grid">
          <div class="team-member">
            <div class="avatar avatar-purple">X</div>
            <div class="member-detail">
              <span class="member-name">Xiping Chen</span>
              <span class="member-role" data-i18n="landing.team.role.lead">项目负责人 / 核心开发</span>
            </div>
          </div>
          
          <div class="team-member">
            <div class="avatar avatar-blue">P</div>
            <div class="member-detail">
              <span class="member-name">Purple Zhou</span>
              <span class="member-role" data-i18n="landing.team.role.frontend">前端架构师</span>
            </div>
          </div>
          
          <div class="team-member">
            <div class="avatar avatar-green">X</div>
            <div class="member-detail">
              <span class="member-name">Xiaoyuan Zhang</span>
              <span class="member-role" data-i18n="landing.team.role.designer">UI / 交互设计师</span>
            </div>
          </div>
          
          <div class="team-member">
            <div class="avatar avatar-orange">X</div>
            <div class="member-detail">
              <span class="member-name">Xiping Chen</span>
              <span class="member-role" data-i18n="landing.team.role.ai">AI 配对程序员</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Steps Guide -->
      <div class="info-card glass-card guide-card">
        <div class="card-header">
          <span class="card-icon">📖</span>
          <h3 data-i18n="landing.guide.title">使用指南</h3>
        </div>
        <p class="card-description" data-i18n="landing.guide.desc">快速掌握 TeamFlow Wiki 的核心协作工作流：</p>
        
        <div class="guide-steps">
          <div class="step-item">
            <div class="step-badge">1</div>
            <div class="step-info">
              <h4 data-i18n="landing.guide.step1.title">模块化块级编辑</h4>
              <p data-i18n="landing.guide.step1.desc">点击任意文本块即可直接编辑，按 Enter 键换行。每一行都是独立积木，可自由修改。</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-badge">2</div>
            <div class="step-info">
              <h4 data-i18n="landing.guide.step2.title">斜杠命令 (Slash Command)</h4>
              <p data-i18n="landing.guide.step2.desc">在新行输入 / 即可呼出快捷菜单，一键插入标题、分隔线、图片或普通段落。</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-badge">3</div>
            <div class="step-info">
              <h4 data-i18n="landing.guide.step3.title">拖拽手柄排序</h4>
              <p data-i18n="landing.guide.step3.desc">悬停于每一行左侧可显现 ⠿ 手柄，长按即可上下拖拽块重新排布内容顺序。</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-badge">4</div>
            <div class="step-info">
              <h4 data-i18n="landing.guide.step4.title">GitHub 自动云同步</h4>
              <p data-i18n="landing.guide.step4.desc">在设置 (⚙️) 中输入 GitHub Token 及仓库信息后，即可免安装 Git，一键向远端推送更新。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Sync Configuration Guide -->
      <div class="info-card glass-card sync-guide-card">
        <div class="card-header">
          <span class="card-icon">🔄</span>
          <h3 data-i18n="landing.sync_guide.title">云端协作配置向导</h3>
        </div>
        <p class="card-description" data-i18n="landing.sync_guide.desc">只需 3 步，即可在团队中建立共同的 GitHub 云端数据同步闭环，实现免安装协同：</p>
        
        <div class="sync-steps-grid">
          <div class="sync-step-item">
            <div class="sync-step-badge">1</div>
            <div class="sync-step-info">
              <h4 data-i18n="landing.sync_guide.step1.title">1. 共同建库</h4>
              <p data-i18n="landing.sync_guide.step1.desc">团队主导者在 GitHub 上新建仓库（推荐初始化 README.md），并在 Settings -> Collaborators 中将团队成员添加为协作者（私有库必须），使大家获得写入权限。</p>
            </div>
          </div>
          
          <div class="sync-step-item">
            <div class="sync-step-badge">2</div>
            <div class="sync-step-info">
              <h4 data-i18n="landing.sync_guide.step2.title">2. 创建 Access Token</h4>
              <p data-i18n="landing.sync_guide.step2.desc">每个成员在个人 GitHub 设置中生成 Token。Classic 令牌需勾选 repo 权限；Fine-grained 令牌需授予该仓库 Contents 属性的 Read and write 读写权限。</p>
            </div>
          </div>
          
          <div class="sync-step-item">
            <div class="sync-step-badge">3</div>
            <div class="sync-step-info">
              <h4 data-i18n="landing.sync_guide.step3.title">3. 同步配置与提交</h4>
              <p data-i18n="landing.sync_guide.step3.desc">进入 Wiki 点击 ⚙️ 设置，填入相同的 Owner、Repo 与个人的 Token 保存。点击顶部“同步到 GitHub”，即可推送本地修改并实时拉取同步，完成闭环！</p>
            </div>
          </div>
        </div>

        <!-- Troubleshooting Accordion -->
        <div class="troubleshooting-section">
          <h4 class="section-subtitle">
            <span class="card-icon" style="font-size: 1.1rem; margin-right: 2px;">⚠️</span>
            <span data-i18n="landing.sync_guide.trouble.title">常见错误与故障排查</span>
          </h4>
          <div class="accordion-container">
            <div class="accordion-item">
              <button class="accordion-header">
                <span class="error-badge">404</span>
                <span data-i18n="landing.sync_guide.err404.title">GitHub API Error: Not Found (404 错误)</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-content">
                <p data-i18n="landing.sync_guide.err404.desc"><strong>可能原因：</strong>仓库所有者 (Owner) 或仓库名称 (Repo) 拼写错误；或者 Token 没有访问该仓库的权限；或者协作者尚未接受仓库的合作邀请。<br><strong>解决方案：</strong>仔细核对 Owner 和 Repo 拼写；检查 Token 作用范围是否包含该仓库；协作者需先访问 <code>https://github.com/用户名/仓库名/invitations</code> 接受邀请。</p>
              </div>
            </div>
            
            <div class="accordion-item">
              <button class="accordion-header">
                <span class="error-badge">401</span>
                <span data-i18n="landing.sync_guide.err401.title">GitHub API Error: Bad credentials (401 错误)</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-content">
                <p data-i18n="landing.sync_guide.err401.desc"><strong>可能原因：</strong>输入的 Personal Access Token（个人访问令牌）不正确、已失效或已过期。<br><strong>解决方案：</strong>前往 GitHub 开发者设置重新生成 Token，复制并完整填入，确保没有复制多余的空格或换行符。</p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span class="error-badge">403</span>
                <span data-i18n="landing.sync_guide.err403.title">GitHub API Error: Write access denied / Blocked by branch protection (403 错误)</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-content">
                <p data-i18n="landing.sync_guide.err403.desc"><strong>可能原因：</strong>Token 校验成功但没有写入权限（Classic 令牌未勾选 repo，或 Fine-grained 令牌未在 Contents 中赋予 Read and write）；或者主分支设置了分支保护规则，阻止了直接推送。<br><strong>解决方案：</strong>在 GitHub 修改该 Token 的权限，确保选中 repo 写入或 Contents 读写；或在仓库设置中暂时调整分支保护规则。</p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span class="error-badge">Network</span>
                <span data-i18n="landing.sync_guide.errnet.title">SSL / Connection Timeout / 网络连接失败</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-content">
                <p data-i18n="landing.sync_guide.errnet.desc"><strong>可能原因：</strong>本地网络访问 GitHub API 失败或超时；或者是 SSL 证书验证在部分本地中继代理中出错。<br><strong>解决方案：</strong>检查本地网络。如果使用了代理客户端，请确保其处于全局/规则代理状态并能正常连通 <code>api.github.com</code>；或参考文档调整 BepInEx/代理配置文件。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Page Footer -->
    <footer class="landing-footer">
      <p class="footer-text">Made by ZWU-2026-2-005 2026</p>
    </footer>
  </div>

  <script type="module" src="js/landing.js"></script>
</body>
</html>

```


### 8.4 `css/style.css` (2066 lines, main design system)

**File**: `css/style.css`

```css
/* ============================================================
   TeamFlow Wiki — Design System & Styles
   ============================================================ */

/* ===== CSS VARIABLES ===== */
:root {
  /* Colors — Light Theme */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F7F6F3;
  --bg-tertiary: #EFEFEF;
  --bg-hover: rgba(55, 53, 47, 0.04);
  --bg-active: rgba(55, 53, 47, 0.08);
  --bg-overlay: rgba(15, 15, 15, 0.6);

  --text-primary: #37352F;
  --text-secondary: #9B9A97;
  --text-placeholder: #C0BFBC;
  --text-inverse: #FFFFFF;

  --border-color: #E9E9E7;
  --border-hover: #D3D1CB;

  --accent: #2EAADC;
  --accent-light: rgba(46, 170, 220, 0.1);
  --accent-hover: #228FB8;

  --success: #4DAA57;
  --success-light: rgba(77, 170, 87, 0.1);
  --warning: #E9A211;
  --warning-light: rgba(233, 162, 17, 0.1);
  --error: #EB5757;
  --error-light: rgba(235, 87, 87, 0.1);

  /* Spacing Scale */
  --space-2xs: 2px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;
  --space-4xl: 64px;

  /* Typography */
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-content: 'Inter', Georgia, 'Times New Roman', serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 1.875rem;
  --text-3xl: 2.5rem;

  --leading-tight: 1.3;
  --leading-normal: 1.6;
  --leading-relaxed: 1.8;

  /* Layout */
  --sidebar-width: 260px;
  --editor-max-width: 900px;
  --topbar-height: 48px;

  /* Borders */
  --radius-xs: 3px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.16);

  /* Transitions */
  --transition-fast: 100ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 320ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== DARK THEME ===== */
[data-theme="dark"] {
  --bg-primary: #191919;
  --bg-secondary: #202020;
  --bg-tertiary: #2F2F2F;
  --bg-hover: rgba(255, 255, 255, 0.04);
  --bg-active: rgba(255, 255, 255, 0.08);
  --bg-overlay: rgba(0, 0, 0, 0.7);

  --text-primary: #E3E3E1;
  --text-secondary: #9B9A97;
  --text-placeholder: #5A5A5A;
  --text-inverse: #191919;

  --border-color: #373737;
  --border-hover: #4A4A4A;

  --accent: #529CCA;
  --accent-light: rgba(82, 156, 202, 0.15);
  --accent-hover: #6BB0D8;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.6);
}

/* ===== RESET & BASE ===== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-ui);
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: var(--leading-normal);
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  transition: background var(--transition-slow), color var(--transition-slow);
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

img { max-width: 100%; height: auto; display: block; }

button {
  font-family: var(--font-ui);
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
  font-size: inherit;
}

::selection {
  background: var(--accent-light);
  color: var(--accent);
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }

/* ===== SIDEBAR ===== */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  will-change: width;
  transition: transform var(--transition-slow), background var(--transition-slow),
              width 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity var(--transition-fast);
  z-index: 100;
  position: relative;
  overflow: hidden;
}

/* Disable width transition during drag to prevent lag */
.sidebar.resizing {
  transition: transform var(--transition-slow), background var(--transition-slow), opacity var(--transition-fast);
}

.sidebar.collapsed {
  width: 0;
  border-right: none;
  opacity: 0;
  pointer-events: none;
}

.sidebar-header {
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
  min-height: var(--topbar-height);
}

.sidebar-logo {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--accent), #7B61FF);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-collapse-btn {
  margin-left: auto;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  font-size: var(--text-base);
}

.sidebar-collapse-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-search {
  padding: var(--space-sm) var(--space-lg);
}

.sidebar-search-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  padding: 0 var(--space-xs) 0 0;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.sidebar-search-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.sidebar-search-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-ui);
  outline: none;
}

.sidebar-search-input::placeholder { color: var(--text-placeholder); }

.sidebar-search-clear {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  color: var(--text-placeholder);
  font-size: 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  border: none;
  background: none;
}
.sidebar-search-clear:hover {
  background: var(--bg-active);
  color: var(--text-primary);
}

/* Quick action buttons */
.sidebar-quick-actions {
  display: flex;
  gap: var(--space-xs);
  padding: 0 var(--space-lg) var(--space-sm);
}

.sidebar-quick-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-quick-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.sidebar-section-label {
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-pages {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-sm);
}

.sidebar-pages-favorites {
  flex: none;
  max-height: 120px;
  min-height: 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-xs);
}

.page-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  padding-left: calc(var(--space-md) + var(--nest-level, 0) * 16px);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  user-select: none;
  position: relative;
}

.page-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.page-item.active {
  background: var(--bg-active);
  color: var(--text-primary);
  font-weight: 500;
}

.page-item.drag-over-top {
  border-top: 2px solid var(--accent);
}
.page-item.drag-over-bottom {
  border-bottom: 2px solid var(--accent);
}
.page-item.drag-over-inner {
  background: var(--bg-active);
  box-shadow: inset 0 0 0 1px var(--accent);
}
.page-item.dragging {
  opacity: 0.4;
}

/* Chevron toggle for parent pages */
.page-item-toggle {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: var(--text-placeholder);
  border-radius: var(--radius-xs);
  flex-shrink: 0;
  transition: transform 0.15s ease, color var(--transition-fast);
  cursor: pointer;
}
.page-item-toggle:hover { color: var(--text-primary); background: var(--bg-hover); }
.page-item-toggle.expanded { transform: rotate(90deg); }

.page-item-icon {
  font-size: var(--text-base);
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.page-item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions container (add-child + delete) */
.page-item-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.page-item:hover .page-item-actions { opacity: 1; }

.page-item-add-child {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  cursor: pointer;
  border: none;
  background: none;
}
.page-item-add-child:hover { background: var(--bg-active); color: var(--text-primary); }

.page-item-delete {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  cursor: pointer;
  border: none;
  background: none;
}
.page-item-delete:hover { background: var(--error-light); color: var(--error); }

.sidebar-add-page {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  margin: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.sidebar-add-page:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.sidebar-user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}
.sidebar-user-info:hover {
  background: var(--bg-hover);
}

.sidebar-user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar-user-role {
  font-size: var(--text-xs);
  color: var(--text-placeholder);
  line-height: 1.2;
}

.sidebar-footer-icons {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.sidebar-icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-base);
  transition: all var(--transition-fast);
  border: none;
  background: none;
  cursor: pointer;
}
.sidebar-icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  min-width: 0;
}

/* ===== TOPBAR ===== */
.topbar {
  height: var(--topbar-height);
  padding: 0 var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-primary);
  transition: background var(--transition-slow);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.topbar-menu-btn {
  display: none;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.sidebar.collapsed ~ .main-content .topbar-menu-btn {
  display: flex;
}

.topbar-menu-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.topbar-breadcrumb {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  overflow: hidden;
}

.breadcrumb-link {
  cursor: pointer;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
  white-space: nowrap;
}
.breadcrumb-link:hover {
  color: var(--text-primary);
  text-decoration: underline;
}

.breadcrumb-sep {
  color: var(--text-placeholder);
  flex-shrink: 0;
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
  cursor: default;
}
.breadcrumb-current:hover {
  text-decoration: none;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: var(--accent);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.btn-ghost {
  color: var(--text-secondary);
  padding: var(--space-sm);
}

.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.btn-icon:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-xs);
}

/* ===== EDITOR CONTAINER ===== */
.editor-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3xl) var(--space-xl);
}

.editor-wrapper {
  max-width: var(--editor-max-width);
  margin: 0 auto;
}

/* ===== PAGE HEADER ===== */
.page-header {
  margin-bottom: var(--space-2xl);
}

.page-icon-btn {
  font-size: var(--text-3xl);
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  display: inline-block;
  line-height: 1;
}

.page-icon-btn:hover { background: var(--bg-hover); }

.page-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  border: none;
  outline: none;
  width: 100%;
  line-height: var(--leading-tight);
  padding: var(--space-xs) 0;
  background: transparent;
  caret-color: var(--accent);
}

.page-title:empty::before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
}

/* ===== BLOCK EDITOR ===== */
.editor {
  min-height: 300px;
  position: relative;
}

.block {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: var(--space-2xs) 0;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.block:hover { background: var(--bg-hover); }

.block-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
  padding-top: var(--space-2xs);
  margin-left: -52px;
  width: 52px;
}

.block:hover .block-controls { opacity: 1; }

.block-handle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  cursor: grab;
  color: var(--text-placeholder);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  user-select: none;
}

.block-handle:hover {
  background: var(--bg-active);
  color: var(--text-secondary);
}

.block-handle:active { cursor: grabbing; }

.block-add-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  color: var(--text-placeholder);
  font-size: var(--text-lg);
  transition: all var(--transition-fast);
  font-weight: 300;
}

.block-add-btn:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.block-body {
  flex: 1;
  min-width: 0;
}

/* Block Content Styles */
.block-content {
  outline: none;
  word-break: break-word;
  white-space: pre-wrap;
  caret-color: var(--accent);
  padding: var(--space-2xs) var(--space-xs);
  border-radius: var(--radius-xs);
  transition: background var(--transition-fast);
}

.block-content:focus {
  background: transparent;
}

.block-content:empty::before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
  pointer-events: none;
}

/* Heading styles */
.block-content[data-type="heading"][data-level="1"] {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  margin-top: var(--space-lg);
}

.block-content[data-type="heading"][data-level="2"] {
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: var(--leading-tight);
  margin-top: var(--space-md);
}

.block-content[data-type="heading"][data-level="3"] {
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: var(--leading-tight);
  margin-top: var(--space-sm);
}

/* Paragraph */
.block-content[data-type="paragraph"] {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

/* Divider */
.block-divider {
  padding: var(--space-md) 0;
}

.block-divider hr {
  border: none;
  border-top: 1px solid var(--border-color);
}

/* Image block */
.block-image {
  padding: var(--space-sm) 0;
}

.block-image img {
  border-radius: var(--radius-md);
  max-width: 100%;
  cursor: pointer;
  transition: box-shadow var(--transition-normal);
}

.block-image img:hover {
  box-shadow: var(--shadow-md);
}

.block-image .image-caption {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-sm) 0;
  outline: none;
  caret-color: var(--accent);
}

.block-image .image-caption:empty::before {
  content: 'Write a caption...';
  color: var(--text-placeholder);
}

/* Image upload placeholder */
.image-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-3xl) var(--space-xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--bg-hover);
}

.image-upload-area:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}

.image-upload-icon {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-sm);
}

.image-upload-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.image-upload-input { display: none; }

.image-url-input {
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  width: 80%;
  max-width: 400px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-ui);
  outline: none;
  transition: border-color var(--transition-fast);
}

.image-url-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

/* Block delete button */
.block-delete-btn {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  color: var(--text-placeholder);
  font-size: var(--text-sm);
  opacity: 0;
  transition: all var(--transition-fast);
}

.block:hover .block-delete-btn { opacity: 1; }
.block-delete-btn:hover { background: var(--error-light); color: var(--error); }

/* End-of-editor add button */
.editor-add-block {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-sm);
  color: var(--text-placeholder);
  font-size: var(--text-sm);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  margin-top: var(--space-sm);
  margin-left: -4px;
}

.editor-add-block:hover {
  color: var(--text-secondary);
  background: var(--bg-hover);
}

.editor-add-block-icon {
  width: 24px;
  height: 24px;
  border: 1.5px solid currentColor;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: 300;
}

/* ===== DRAG & DROP ===== */
.block.dragging {
  opacity: 0.4;
}

.block.drag-over-top {
  border-top: 2px solid var(--accent);
}

.block.drag-over-bottom {
  border-bottom: 2px solid var(--accent);
}

/* ===== FLOATING TOOLBAR ===== */
.floating-toolbar {
  position: fixed;
  display: none;
  align-items: center;
  gap: var(--space-2xs);
  padding: var(--space-xs);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  animation: toolbar-appear 150ms ease;
}

.floating-toolbar.visible { display: flex; }

.floating-toolbar .btn-icon {
  width: 28px;
  height: 28px;
  font-size: var(--text-sm);
}

.floating-toolbar .divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 var(--space-2xs);
}

@keyframes toolbar-appear {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== SLASH COMMAND MENU ===== */
.slash-menu {
  position: fixed;
  display: none;
  flex-direction: column;
  width: 280px;
  max-height: 320px;
  overflow-y: auto;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  padding: var(--space-xs);
  animation: slash-appear 150ms ease;
}

.slash-menu.visible { display: flex; }

.slash-menu-label {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.slash-menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.slash-menu-item:hover,
.slash-menu-item.active {
  background: var(--bg-hover);
}

.slash-menu-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.slash-menu-item-info {
  flex: 1;
  min-width: 0;
}

.slash-menu-item-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.slash-menu-item-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

@keyframes slash-appear {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: overlay-appear 200ms ease;
}

.modal-overlay.visible { display: flex; }

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 480px;
  animation: modal-appear 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.modal-header {
  padding: var(--space-xl);
  padding-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-lg);
  transition: all var(--transition-fast);
}

.modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }

.modal-body {
  padding: var(--space-xl);
}

.modal-footer {
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

@keyframes overlay-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-appear {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Form elements inside modal */
.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--space-sm);
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-family: var(--font-ui);
  color: var(--text-primary);
  background: var(--bg-primary);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.form-input::placeholder { color: var(--text-placeholder); }

.form-hint {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-xs);
}
/* ===== SETTINGS VIEW (SECONDARY PAGE) ===== */
.settings-view {
  flex: 1;
  overflow: hidden;
}

.settings-layout {
  display: flex;
  height: 100%;
}

.settings-nav {
  width: 220px;
  min-width: 220px;
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  padding: var(--space-sm);
  gap: 2px;
}

.settings-nav-header {
  padding: var(--space-md) var(--space-md) var(--space-lg);
}

.settings-nav-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-top: var(--space-sm);
}

.settings-back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  border: none;
  background: none;
  color: var(--accent);
  font-size: var(--text-sm);
  font-family: var(--font-ui);
  cursor: pointer;
  padding: var(--space-xs) 0;
  transition: opacity var(--transition-fast);
}
.settings-back-btn:hover { opacity: 0.7; }

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  width: 100%;
  position: relative;
}

.settings-nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.settings-nav-item.active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.settings-nav-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.settings-panel {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2xl) var(--space-3xl);
}

.settings-section {
  display: none;
  max-width: 600px;
  animation: settingsFadeIn 0.2s ease;
}

.settings-section.active {
  display: block;
}

@keyframes settingsFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-section h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.settings-section-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.settings-form .btn-primary {
  align-self: flex-start;
  margin-top: var(--space-sm);
}

/* Preference Cards */
.pref-group {
  margin-bottom: var(--space-xl);
}

.pref-group h4 {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.pref-cards {
  display: flex;
  gap: var(--space-md);
}

.pref-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl) var(--space-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pref-card:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.pref-card.active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.pref-card-icon {
  font-size: 28px;
}

/* Team Management */
.team-add-form {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  align-items: center;
}

.team-add-form .form-input {
  flex: 1;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.team-member-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  transition: border-color var(--transition-fast);
}

.team-member-row:hover {
  border-color: var(--accent-light);
}

.team-member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7B61FF, var(--accent));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.team-member-info {
  flex: 1;
  min-width: 0;
}

.team-member-name {
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.team-member-role {
  font-size: var(--text-xs);
  color: var(--text-placeholder);
}

.team-member-remove {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  color: var(--text-placeholder);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.team-member-remove:hover {
  background: var(--danger-bg, #fee);
  color: var(--danger, #e53e3e);
}

.team-empty {
  text-align: center;
  color: var(--text-placeholder);
  font-size: var(--text-sm);
  padding: var(--space-2xl);
}

/* Mobile settings */
@media (max-width: 768px) {
  .settings-layout { flex-direction: column; }
  .settings-nav {
    width: 100%;
    min-width: auto;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding: var(--space-sm);
    gap: var(--space-xs);
  }
  .settings-nav-header { display: none; }
  .settings-nav-item {
    flex-shrink: 0;
    white-space: nowrap;
    padding: var(--space-sm) var(--space-md);
  }
  .settings-panel { padding: var(--space-xl) var(--space-lg); }
  .pref-cards { flex-direction: column; }
  .team-add-form { flex-wrap: wrap; }
}

/* ===== TOAST ===== */
.toast-container {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  z-index: 3000;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  pointer-events: auto;
  animation: toast-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  max-width: 360px;
}

.toast.toast-out {
  animation: toast-out 200ms ease forwards;
}

.toast-icon { font-size: var(--text-base); flex-shrink: 0; }
.toast-success .toast-icon { color: var(--success); }
.toast-error .toast-icon { color: var(--error); }
.toast-warning .toast-icon { color: var(--warning); }
.toast-info .toast-icon { color: var(--accent); }

.toast-message { flex: 1; }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(24px) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toast-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(24px); }
}

/* ===== STATUS BAR ===== */
.status-bar {
  padding: var(--space-sm) var(--space-xl);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-primary);
  flex-shrink: 0;
  transition: background var(--transition-slow);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.status-bar-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  flex-shrink: 0;
}

.status-sep {
  color: var(--text-placeholder);
}

.status-bar-right {
  font-size: var(--text-xs);
  color: var(--text-placeholder);
}

/* ===== LOADING SPINNER ===== */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: var(--space-4xl) var(--space-xl);
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.empty-state-desc {
  font-size: var(--text-sm);
  margin-bottom: var(--space-xl);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
  }

  .sidebar.open { transform: translateX(0); }

  .topbar-menu-btn { display: flex; }

  .editor-container { padding: var(--space-xl) var(--space-lg); }

  .block-controls { margin-left: -36px; width: 36px; }

  .page-title { font-size: var(--text-2xl); }

  .status-bar { padding: var(--space-sm) var(--space-lg); }

  .toast-container {
    bottom: var(--space-lg);
    right: var(--space-lg);
    left: var(--space-lg);
  }

  .toast { max-width: 100%; }
}

@media (max-width: 480px) {
  .editor-container { padding: var(--space-lg) var(--space-md); }

  .page-title { font-size: var(--text-xl); }

  .block-content[data-type="heading"][data-level="1"] { font-size: var(--text-2xl); }
  .block-content[data-type="heading"][data-level="2"] { font-size: var(--text-xl); }
  .block-content[data-type="heading"][data-level="3"] { font-size: var(--text-lg); }

  .topbar { padding: 0 var(--space-lg); }

  .topbar-actions .btn-label { display: none; }
}

/* ===== UTILITY ===== */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ===== SIDEBAR OVERLAY (mobile) ===== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: 99;
  display: none;
}

.sidebar-overlay.visible { display: block; }

/* ===== ICON PICKER (simple emoji grid) ===== */
.icon-picker {
  position: absolute;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-sm);
  display: none;
  flex-wrap: wrap;
  gap: var(--space-xs);
  width: 240px;
  z-index: 500;
}

.icon-picker.visible { display: flex; }

.icon-picker-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-size: var(--text-lg);
  transition: background var(--transition-fast);
}

.icon-picker-item:hover { background: var(--bg-hover); }

/* ===== FOCUS RING (Accessibility) ===== */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.block-content:focus-visible {
  outline: none;
}

/* ===== PAGE META (Author + Date) ===== */
.page-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -4px 0 20px 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  min-height: 20px;
}

.page-meta-author {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.page-meta-author::before {
  content: '👤';
  font-size: 12px;
}

.page-meta-sep {
  color: var(--text-placeholder);
}

.page-meta-date {
  color: var(--text-secondary);
}

.page-meta:empty,
.page-meta[data-hidden] {
  display: none;
}

/* ===== MODAL SM (Welcome dialog) ===== */
.modal-sm {
  max-width: 420px;
  width: 90%;
}

/* ===== USER AVATAR IN SIDEBAR FOOTER ===== */
.sidebar-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7B61FF, var(--accent));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.sidebar-user-name {
  font-weight: 500;
  font-size: var(--text-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  line-height: 1.3;
}

/* ===== DANGER BUTTON ===== */
.btn-danger {
  background: var(--error);
  color: white;
  border: none;
}
.btn-danger:hover {
  background: #c94040;
  color: white;
}

/* ===== SIDEBAR TRASH BUTTON ===== */
.sidebar-trash-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% - 24px);
  margin: 0 12px 4px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  text-align: left;
}
.sidebar-trash-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.sidebar-trash-btn.active {
  background: var(--bg-active);
  color: var(--text-primary);
}

.trash-count-badge {
  margin-left: auto;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 0 6px;
  min-width: 18px;
  text-align: center;
  line-height: 18px;
}

/* ===== TRASH VIEW ===== */
.trash-view {
  flex: 1;
  overflow-y: auto;
  padding: 48px 64px;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}

.trash-view-header {
  margin-bottom: 32px;
}
.trash-view-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.trash-view-hint {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.trash-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trash-empty {
  text-align: center;
  padding: 64px 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}
.trash-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.trash-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: box-shadow var(--transition-fast);
}
.trash-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.trash-item-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.trash-item-info {
  flex: 1;
  min-width: 0;
}
.trash-item-title {
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.trash-item-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 4px;
}
.trash-item-days {
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--warning-light);
  color: var(--warning);
  flex-shrink: 0;
}
.trash-item-days.expiring {
  background: var(--error-light);
  color: var(--error);
}
.trash-item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ===== DELETE MODAL META ===== */
.delete-modal-desc {
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: var(--text-sm);
  line-height: 1.6;
}
.delete-modal-meta {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.delete-modal-meta strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* ===== SIDEBAR RESIZE HANDLE ===== */
.sidebar-resize-handle {
  width: 5px;
  background: transparent;
  cursor: col-resize;
  flex-shrink: 0;
  position: relative;
  z-index: 50;
  transition: background 0.2s;
}
.sidebar-resize-handle:hover,
.sidebar-resize-handle.dragging {
  background: var(--accent);
}

/* ===== PAGE ICON DISPLAY (clickable in page header) ===== */
.page-icon-display {
  font-size: 2.5rem;
  line-height: 1;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
  border-radius: var(--radius-md);
  padding: 4px 6px;
  transition: background var(--transition-fast), transform 0.15s;
  display: inline-block;
}
.page-icon-display:hover {
  background: var(--bg-hover);
  transform: scale(1.08);
}

/* ===== BRAND CURSOR & AESTHETICS ===== */
#site-name:hover,
#breadcrumb-root:hover {
  cursor: pointer;
  color: var(--accent);
  text-decoration: underline;
}

```


### 8.5 `css/landing.css` (816 lines, landing page styles)

**File**: `css/landing.css`

```css
/* ============================================================
   TeamFlow Wiki — Landing Page Premium CSS Styles
   ============================================================ */

/* CSS Variables for Landing Page */
:root {
  --bg-landing: #0d0e15;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --accent-primary: #3b82f6;
  --accent-glow: rgba(59, 130, 246, 0.5);
  --accent-secondary: #8b5cf6;
  --accent-tertiary: #ec4899;
  --border-glass: rgba(255, 255, 255, 0.08);
  --bg-glass: rgba(15, 22, 42, 0.45);
  --shadow-premium: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  
  --font-display: 'Outfit', 'Inter', -apple-system, sans-serif;
  --font-text: 'Inter', -apple-system, sans-serif;
  
  --radius-card: 16px;
  --radius-btn: 10px;
}

[data-theme="light"] {
  --bg-landing: #f8fafc;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --accent-primary: #2563eb;
  --accent-glow: rgba(37, 99, 235, 0.25);
  --accent-secondary: #7c3aed;
  --accent-tertiary: #db2777;
  --border-glass: rgba(15, 23, 42, 0.08);
  --bg-glass: rgba(255, 255, 255, 0.55);
  --shadow-premium: 0 10px 30px -10px rgba(15, 23, 42, 0.08);
}

/* Reset & Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-landing);
  color: var(--text-main);
  font-family: var(--font-text);
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* Canvas Interactive Background */
.landing-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
}

/* Decorative Ambient Floating Orbs */
.ambient-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.35;
  pointer-events: none;
  mix-blend-mode: screen;
}

[data-theme="light"] .ambient-orb {
  opacity: 0.15;
  mix-blend-mode: multiply;
  filter: blur(100px);
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--accent-primary) 0%, rgba(59, 130, 246, 0) 70%);
  top: -150px;
  left: -150px;
  animation: floatOrb 25s infinite ease-in-out alternate;
}

.orb-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-secondary) 0%, rgba(139, 92, 246, 0) 70%);
  bottom: -200px;
  right: -100px;
  animation: floatOrb 30s infinite ease-in-out alternate-reverse;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--accent-tertiary) 0%, rgba(236, 72, 153, 0) 70%);
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: floatOrb 20s infinite ease-in-out alternate 3s;
}

@keyframes floatOrb {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, 80px) scale(1.1); }
  100% { transform: translate(-30px, -40px) scale(0.9); }
}

/* Header Navbar */
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  z-index: 10;
  background: rgba(var(--bg-landing), 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-glass);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  font-size: 1.5rem;
  animation: logoWobble 4s infinite ease-in-out;
}

@keyframes logoWobble {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(10deg) scale(1.1); }
}

.brand-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Header Buttons styling */
.icon-btn {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.icon-btn:hover {
  transform: scale(1.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-glow);
}

.lang-toggle-btn {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  padding: 8px 16px;
  border-radius: var(--radius-btn);
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-toggle-btn:hover {
  transform: translateY(-1px);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 15px var(--accent-glow);
}

/* Main Container Layout */
.landing-container {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 120px 20px 60px;
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: heroReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes heroReveal {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.badge-wrapper {
  margin-bottom: 5px;
}

.version-badge {
  display: inline-block;
  padding: 6px 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--accent-primary);
  box-shadow: var(--shadow-premium);
}

.hero-title-shimmer {
  font-family: var(--font-display);
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -2px;
  background: linear-gradient(135deg, var(--text-main) 0%, var(--accent-primary) 50%, var(--accent-secondary) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmerSweep 6s linear infinite;
}

@keyframes shimmerSweep {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 200% center; }
}

.hero-subtitle {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 620px;
  margin: 0 auto;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--radius-btn);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 20px var(--accent-glow);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px var(--accent-glow);
}

.btn-primary:active {
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  color: var(--text-main);
  backdrop-filter: blur(8px);
}

.btn-secondary:hover {
  transform: translateY(-3px);
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-premium);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  animation: gridReveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  opacity: 0;
}

@keyframes gridReveal {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 820px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .hero-title-shimmer {
    font-size: 2.75rem;
  }
}

/* Premium Glassmorphic Cards */
.glass-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: var(--radius-card);
  padding: 30px;
  box-shadow: var(--shadow-premium);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
              border-color 0.3s ease, 
              box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.06),
    transparent
  );
  transition: 0.6s;
  pointer-events: none;
}

.glass-card:hover {
  transform: translateY(-8px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.4), 
              0 0 15px rgba(59, 130, 246, 0.1);
}

[data-theme="light"] .glass-card:hover {
  box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.08);
}

.glass-card:hover::before {
  left: 150%;
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 1.5rem;
}

.card-header h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.card-description {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

/* Team Grid Styles */
.team-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 480px) {
  .team-grid {
    grid-template-columns: 1fr;
  }
}

.team-member {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.02);
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

[data-theme="light"] .team-member {
  background: rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(0, 0, 0, 0.01);
}

.team-member:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

[data-theme="light"] .team-member:hover {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.03);
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.avatar-purple { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); }
.avatar-blue { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
.avatar-green { background: linear-gradient(135deg, #10b981 0%, #047857 100%); }
.avatar-orange { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }

.member-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.member-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.member-role {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 2px;
}

/* Guide Steps Styles */
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.step-item {
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 12px;
}

.step-item:hover {
  background: rgba(255, 255, 255, 0.03);
  transform: translateX(4px);
}

[data-theme="light"] .step-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.step-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-top: 2px;
  box-shadow: 0 4px 10px var(--accent-glow);
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-info h4 {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 3px;
}

.step-info p {
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Sync Configuration Guide Card styling */
.sync-guide-card {
  grid-column: span 2;
}

.sync-steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;
  margin-top: 10px;
}

.sync-step-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 24px 20px;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

[data-theme="light"] .sync-step-item {
  background: rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.sync-step-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--accent-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.08);
}

[data-theme="light"] .sync-step-item:hover {
  background: rgba(0, 0, 0, 0.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.sync-step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px var(--accent-glow);
  transition: all 0.3s ease;
}

.sync-step-item:hover .sync-step-badge {
  transform: scale(1.1) rotate(360deg);
  box-shadow: 0 4px 18px var(--accent-primary);
}

.sync-step-info h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.sync-step-item:hover .sync-step-info h4 {
  color: var(--accent-primary);
}

.sync-step-info p {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.6;
}

/* Arrow indicators between steps */
.sync-step-item:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: var(--text-muted);
  opacity: 0.3;
  pointer-events: none;
  font-family: monospace;
}

/* Responsive adjustments */
@media (max-width: 820px) {
  .sync-guide-card {
    grid-column: span 1;
  }
  .sync-steps-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .sync-step-item:not(:last-child)::after {
    content: '↓';
    right: auto;
    bottom: -16px;
    left: 50%;
    top: auto;
    transform: translateX(-50%);
  }
}

/* Troubleshooting Section */
.troubleshooting-section {
  margin-top: 40px;
  border-top: 1px solid var(--border-glass);
  padding-top: 30px;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.accordion-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.accordion-item {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid var(--border-glass);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

[data-theme="light"] .accordion-item {
  background: rgba(0, 0, 0, 0.005);
}

.accordion-item.active {
  border-color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.02);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.03);
}

[data-theme="light"] .accordion-item.active {
  background: rgba(37, 99, 235, 0.01);
}

.accordion-header {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.9rem;
  gap: 12px;
  transition: all 0.2s ease;
}

.accordion-header:hover {
  background: rgba(255, 255, 255, 0.02);
}

[data-theme="light"] .accordion-header:hover {
  background: rgba(0, 0, 0, 0.01);
}

.error-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: monospace;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  flex-shrink: 0;
}

.accordion-icon {
  font-size: 1.2rem;
  color: var(--text-muted);
  font-family: monospace;
  font-weight: normal;
  flex-shrink: 0;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion-content p {
  padding: 0 20px 20px 20px;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.accordion-content p strong {
  color: var(--text-main);
}

.guide-link {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px dashed var(--accent-primary);
  transition: all 0.2s ease;
}

.guide-link:hover {
  color: var(--accent-secondary);
  border-bottom-color: var(--accent-secondary);
  text-shadow: 0 0 8px var(--accent-glow);
}

/* Footer Section */
.landing-footer {
  text-align: center;
  padding: 40px 0 20px;
  border-top: 1px solid var(--border-glass);
  margin-top: 20px;
}

.footer-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.65;
}

```


### 8.6 `data/content.json` (default content, 2 sample pages)

**File**: `data/content.json`

```json
{
  "site": {
    "name": "TeamFlow Wiki",
    "theme": "light"
  },
  "pages": [
    {
      "id": "welcome",
      "title": "Welcome",
      "icon": "👋",
      "blocks": [
        {
          "id": "w1",
          "type": "heading",
          "level": 1,
          "content": "Welcome to TeamFlow"
        },
        {
          "id": "w2",
          "type": "paragraph",
          "content": "TeamFlow is a lightweight collaborative wiki that lets your team edit content directly in the browser. Click any text to start editing — it's that simple."
        },
        {
          "id": "w3",
          "type": "divider"
        },
        {
          "id": "w4",
          "type": "heading",
          "level": 2,
          "content": "✨ Features"
        },
        {
          "id": "w5",
          "type": "paragraph",
          "content": "📝 Inline Editing — Click any text and start typing to edit"
        },
        {
          "id": "w6",
          "type": "paragraph",
          "content": "🧱 Block-based — Add headings, paragraphs, images, and dividers"
        },
        {
          "id": "w7",
          "type": "paragraph",
          "content": "⚡ Slash Commands — Type / to quickly insert new block types"
        },
        {
          "id": "w8",
          "type": "paragraph",
          "content": "🖼️ Image Support — Upload images or paste URLs"
        },
        {
          "id": "w9",
          "type": "paragraph",
          "content": "💾 Save to GitHub — Commit changes directly from the browser"
        },
        {
          "id": "w10",
          "type": "paragraph",
          "content": "🌙 Dark Mode — Toggle between light and dark themes"
        },
        {
          "id": "w11",
          "type": "divider"
        },
        {
          "id": "w12",
          "type": "heading",
          "level": 2,
          "content": "🚀 Quick Start"
        },
        {
          "id": "w13",
          "type": "paragraph",
          "content": "1. Click on any text block to edit it"
        },
        {
          "id": "w14",
          "type": "paragraph",
          "content": "2. Use the + button or type / to add new blocks"
        },
        {
          "id": "w15",
          "type": "paragraph",
          "content": "3. Drag blocks using the ⠿ handle to reorder them"
        },
        {
          "id": "w16",
          "type": "paragraph",
          "content": "4. Click 'Save to Local' to download your content, or configure GitHub to save directly to your repository"
        }
      ]
    },
    {
      "id": "guide",
      "title": "User Guide",
      "icon": "📖",
      "blocks": [
        {
          "id": "g1",
          "type": "heading",
          "level": 1,
          "content": "User Guide"
        },
        {
          "id": "g2",
          "type": "paragraph",
          "content": "This guide covers all the features available in TeamFlow Wiki."
        },
        {
          "id": "g3",
          "type": "divider"
        },
        {
          "id": "g4",
          "type": "heading",
          "level": 2,
          "content": "Block Types"
        },
        {
          "id": "g5",
          "type": "paragraph",
          "content": "TeamFlow supports several block types that you can mix and match to create rich content:"
        },
        {
          "id": "g6",
          "type": "heading",
          "level": 3,
          "content": "Text Blocks"
        },
        {
          "id": "g7",
          "type": "paragraph",
          "content": "Heading 1/2/3 — Use headings to organize your content hierarchy. Paragraph — Standard text blocks for your main content."
        },
        {
          "id": "g8",
          "type": "heading",
          "level": 3,
          "content": "Media Blocks"
        },
        {
          "id": "g9",
          "type": "paragraph",
          "content": "Image — Add images by uploading files or pasting URLs. Each image can have an optional caption."
        },
        {
          "id": "g10",
          "type": "heading",
          "level": 3,
          "content": "Layout Blocks"
        },
        {
          "id": "g11",
          "type": "paragraph",
          "content": "Divider — A horizontal line to visually separate sections of content."
        },
        {
          "id": "g12",
          "type": "divider"
        },
        {
          "id": "g13",
          "type": "heading",
          "level": 2,
          "content": "Saving Your Work"
        },
        {
          "id": "g14",
          "type": "paragraph",
          "content": "Save to Local — Downloads a content.json file to your computer. Replace the existing file in the data/ folder to update the site."
        },
        {
          "id": "g15",
          "type": "paragraph",
          "content": "Save to GitHub — Configure your GitHub access token in Settings (⚙️) to commit changes directly to your repository."
        }
      ]
    }
  ]
}

```


### 8.7 `js/storage.js` (data layer, 115 lines)

**File**: `js/storage.js`

```javascript
/**
 * Storage Module — Manages content data loading, saving, and export.
 */

const STORAGE_KEY = 'teamflow_content';
const DATA_PATH = 'data/content.json';

/** Default empty content structure */
function createDefaultContent() {
  return {
    site: { name: 'TeamFlow Wiki', theme: 'light' },
    pages: [{
      id: generateId(),
      title: 'Untitled',
      icon: '📄',
      blocks: [{
        id: generateId(),
        type: 'heading',
        level: 1,
        content: 'Untitled Page'
      }, {
        id: generateId(),
        type: 'paragraph',
        content: 'Start typing here...'
      }]
    }]
  };
}

/** Generate a short unique ID */
export function generateId() {
  return 'b' + Math.random().toString(36).substring(2, 9);
}

/**
 * Load content from localStorage first, then fall back to content.json
 */
export async function loadContent() {
  // Try localStorage first (for unsaved edits)
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed to parse cached content:', e);
    }
  }

  // Fetch from data/content.json
  try {
    const resp = await fetch(DATA_PATH);
    if (resp.ok) {
      const data = await resp.json();
      // Cache for next time
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch content.json:', e);
  }

  // Return default content as last resort
  return createDefaultContent();
}

/**
 * Save content to localStorage (auto-save)
 */
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

/**
 * Export content as a JSON file download
 */
export function exportAsJson(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clear cached content from localStorage
 */
export function clearCache() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get the theme preference
 */
export function getTheme() {
  return localStorage.getItem('teamflow_theme') || 'light';
}

/**
 * Save theme preference
 */
export function setTheme(theme) {
  localStorage.setItem('teamflow_theme', theme);
}

```


### 8.8 `js/i18n.js` (i18n, 438 lines, en+zh dictionary)

**File**: `js/i18n.js`

```javascript
/**
 * Internationalization (i18n) Module
 */

export const translations = {
  en: {
    // Sidebar
    'search.placeholder': 'Search pages...',
    'sidebar.pages': 'Pages',
    'sidebar.add_subpage': 'Add sub-page',
    'sidebar.theme.dark': 'Dark',
    'sidebar.theme.light': 'Light',
    'sidebar.settings': 'Settings',

    // Editor & Toolbar
    'editor.add.block': 'Add a block',
    'save.local': 'Save to Local',
    'save.github': 'Save to GitHub',
    'save.status.ready': 'Ready',
    'save.status.unsaved': 'Unsaved changes...',
    'save.status.saving': 'Saving to GitHub...',
    'save.status.saved': 'Saved to GitHub ✓',
    'save.status.failed': 'Save failed',
    'save.status.autosaved': 'Auto-saved locally',

    // Modal
    'settings.title': 'Settings',
    'settings.owner': 'Repository Owner',
    'settings.owner.hint': 'GitHub username or organization name',
    'settings.repo': 'Repository Name',
    'settings.repo.hint': 'The repository where your content is stored',
    'settings.branch': 'Branch',
    'settings.token': 'GitHub Personal Access Token',
    'settings.token.hint': '⚠️ Token represents full access. Stored in localStorage. Needs \'repo\' scope.',
    'settings.cancel': 'Cancel',
    'settings.save': 'Save Settings',

    // Slash menu
    'menu.title': 'Basic Blocks',
    'menu.text': 'Text',
    'menu.text.desc': 'Plain text paragraph',
    'menu.h1': 'Heading 1',
    'menu.h1.desc': 'Large section heading',
    'menu.h2': 'Heading 2',
    'menu.h2.desc': 'Medium section heading',
    'menu.h3': 'Heading 3',
    'menu.h3.desc': 'Small section heading',
    'menu.image': 'Image',
    'menu.image.desc': 'Upload or embed an image',
    'menu.divider': 'Divider',
    'menu.divider.desc': 'Horizontal line separator',

    // Placeholders
    'placeholder.page': 'Untitled',
    'placeholder.heading': 'Heading ',
    'placeholder.paragraph': 'Type \'/\' for commands...',
    'placeholder.caption': 'Write a caption...',
    'placeholder.image.upload': 'Click to upload an image or paste a URL below',
    'placeholder.image.url': 'Paste image URL and press Enter',

    // JS alerts / Toasts
    'toast.saved.local': 'Content downloaded as content.json',
    'toast.github.needs.config': 'Please configure GitHub settings first',
    'toast.settings.saved': 'GitHub settings saved',
    'toast.confirm.delete': 'Delete "{title}"?',
    'toast.delete_page': 'Delete page',
    'toast.import.success': '✅ Import successful',
    'toast.import.failed': 'Import failed: {message}',

    // Tooltips
    'sidebar.toggle': 'Toggle sidebar',
    'sidebar.new_page': 'New page',
    'sidebar.theme.toggle': 'Toggle theme',
    'sidebar.settings.tooltip': 'Settings',
    'topbar.menu': 'Menu',
    'editor.change_icon': 'Change icon',
    'toolbar.bold': 'Bold (Ctrl+B)',
    'toolbar.italic': 'Italic (Ctrl+I)',
    'toolbar.underline': 'Underline (Ctrl+U)',
    'toolbar.h1': 'Heading 1',
    'toolbar.h2': 'Heading 2',
    'toolbar.h3': 'Heading 3',
    'toolbar.p': 'Paragraph',

    // Misc

    // Author / Identity
    'welcome.title': '👋 Welcome to TeamFlow Wiki',
    'welcome.desc': 'Please enter your display name so your teammates can identify your contributions.',
    'welcome.label': 'Your Name',
    'welcome.placeholder': 'e.g. Zhang San',
    'welcome.confirm': 'Get Started',
    'landing.badge': '✨ TeamFlow Wiki v1.2',
    'landing.subtitle': 'A lightweight, modular, collaborative knowledge base designed for modern development teams.',
    'landing.action.enter': 'Enter Wiki',
    'landing.action.settings': 'Configure Sync',
    'landing.team.title': 'Project Contributors',
    'landing.team.desc': 'Special thanks to the development and design team members of TeamFlow Wiki:',
    'landing.team.role.lead': 'Project Lead / Core Developer',
    'landing.team.role.frontend': 'Frontend Architect',
    'landing.team.role.designer': 'UI / UX Designer',
    'landing.team.role.ai': 'AI Pair Programmer',
    'landing.guide.title': 'Usage Guide',
    'landing.guide.desc': 'Quickly master the core collaborative workflow of TeamFlow Wiki:',
    'landing.guide.step1.title': 'Block-based Editing',
    'landing.guide.step1.desc': 'Click any text block to edit directly, press Enter to create a new line. Every block is an independent element.',
    'landing.guide.step2.title': 'Slash Commands',
    'landing.guide.step2.desc': 'Type / at the start of a line to bring up the command menu and quickly insert headings, dividers, images, or paragraphs.',
    'landing.guide.step3.title': 'Drag-and-Drop Reordering',
    'landing.guide.step3.desc': 'Hover over any block to reveal the ⠿ handle. Click and drag to reorder blocks.',
    'landing.guide.step4.title': 'GitHub Cloud Sync',
    'landing.guide.step4.desc': 'Configure your GitHub Token and repository in settings (⚙️) to save and sync changes directly.',
    'landing.sync_guide.title': 'Cloud Collaboration Guide',
    'landing.sync_guide.desc': 'Establish a shared GitHub cloud sync loop in just 3 steps to achieve serverless team collaboration:',
    'landing.sync_guide.step1.title': '1. Create Repository',
    'landing.sync_guide.step1.desc': 'The team owner visits <a href="https://github.com/new" target="_blank" class="guide-link">github.com/new</a> to create a new repository. Next, go to <strong>Settings</strong> -> <strong>Collaborators</strong> -> click <strong>Add people</strong> to invite teammates. Members <strong>must</strong> accept the invitation in their email or GitHub notifications to get write permissions.',
    'landing.sync_guide.step2.title': '2. Generate Access Token',
    'landing.sync_guide.step2.desc': 'Each member clicks their avatar -> <strong>Settings</strong> -> <strong>Developer settings</strong> -> <strong>Personal access tokens</strong>:<br>• Recommended: <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" class="guide-link">Fine-grained tokens</a>. Select the target repo, under <strong>Repository permissions</strong> -> <strong>Contents</strong>, select <strong>Read and write</strong>.<br>• Alternative: <a href="https://github.com/settings/tokens/new" target="_blank" class="guide-link">Tokens (classic)</a>. Check the main <strong>repo</strong> scope box.',
    'landing.sync_guide.step3.title': '3. Sync Configuration',
    'landing.sync_guide.step3.desc': 'Click "Enter Wiki", and click ⚙️ <strong>Settings</strong> -> <strong>Sync Config</strong>:<br>• Enter the shared <strong>Owner</strong> (username or org) and <strong>Repo</strong> (repository name).<br>• Enter your personal <strong>Access Token</strong>.<br>• Click <strong>Save Settings</strong>. Finally, click <strong>Save to GitHub</strong> on the top bar to push edits and pull updates instantly!',
    'landing.sync_guide.trouble.title': 'Troubleshooting & Error Guide',
    'landing.sync_guide.err404.title': 'GitHub API Error: Not Found (404)',
    'landing.sync_guide.err404.desc': '<strong>Possible Causes:</strong> Repository name or owner is misspelled, the token does not have access to this repository, or the collaborator has not accepted the repository invitation.<br><strong>Solution:</strong> Verify Owner/Repo spelling; ensure the token scope is valid; collaborators must visit <code>https://github.com/Owner/Repo/invitations</code> to accept the invitation.',
    'landing.sync_guide.err401.title': 'GitHub API Error: Bad credentials (401)',
    'landing.sync_guide.err401.desc': '<strong>Possible Causes:</strong> The Personal Access Token is incorrect, invalid, or has expired.<br><strong>Solution:</strong> Go to Developer Settings, delete the old token, generate a new one, copy it completely, and paste it back into Wiki settings (ensuring no extra whitespace).',
    'landing.sync_guide.err403.title': 'GitHub API Error: Write access denied / Blocked by branch protection (403)',
    'landing.sync_guide.err403.desc': '<strong>Possible Causes:</strong> The token is valid but has no write permissions (Classic token missing <code>repo</code> checkbox, or Fine-grained token missing <code>Contents: Read and write</code>); or the repository\'s main branch has branch protection rules preventing direct pushing.<br><strong>Solution:</strong> Edit token permissions on GitHub; or check the repository settings to adjust branch protection rules temporarily.',
    'landing.sync_guide.errnet.title': 'SSL / Connection Timeout / Network Connect Failure',
    'landing.sync_guide.errnet.desc': '<strong>Possible Causes:</strong> Direct connection to the GitHub API failed or timed out in your local network environment, or SSL handshake failed through some proxy middlewares.<br><strong>Solution:</strong> Check your local network. If using a proxy client, make sure it is in global mode or has rule exceptions for <code>api.github.com</code>; or toggle proxy settings in your local translator proxy settings.',
    'settings.username': 'Display Name',
    'settings.username.placeholder': 'e.g. Zhang San',
    'settings.username.hint': 'Shown as author when you create pages.',
    'page.meta.created_by': 'Created by {author}',
    'page.meta.on': 'on',
    'page.meta.anonymous': 'Anonymous',

    // Trash / Recycle Bin
    'trash.title': 'Trash',
    'trash.hint': 'Deleted pages are kept here for 3 days, then permanently removed.',
    'trash.empty': 'Trash is empty',
    'trash.empty.hint': 'Deleted pages will appear here.',
    'trash.confirm.title': 'Move to Trash?',
    'trash.confirm.desc': 'This page will be moved to the Trash and automatically deleted after 3 days.',
    'trash.confirm.cancel': 'Cancel',
    'trash.confirm.ok': 'Move to Trash',
    'trash.restore': 'Restore',
    'trash.delete.forever': 'Delete Forever',
    'trash.days.left': '{n} day(s) left',
    'trash.by': 'Deleted by {author}',
    'trash.on': '·',
    'trash.forever.confirm': 'Permanently delete "{title}"? This cannot be undone.',

    // Sidebar layout
    'sidebar.favorites': 'Favorites',
    'sidebar.quick.new': 'New Page',
    'sidebar.quick.import': 'Import',
    'sidebar.role': 'Admin',
    'search.clear': 'Clear',
    'status.pages': '{n} pages',
    'status.last_saved': 'Last saved: {time}',
    'status.last_saved.just': 'just now',
    'status.last_saved.min': '{n} min ago',
    'status.last_saved.hour': '{n} hr ago',

    // Settings page
    'settings.back': 'Back',
    'settings.tab.sync': 'Sync Config',
    'settings.tab.trash': 'Trash',
    'settings.tab.preferences': 'Preferences',
    'settings.tab.team': 'Team',
    'settings.sync.desc': 'Configure GitHub repository to sync your content to a remote repo.',
    'pref.theme.title': 'Theme',
    'pref.theme.light': 'Light Mode',
    'pref.theme.dark': 'Dark Mode',
    'pref.lang.title': 'Language',
    'pref.lang.zh': '中文',
    'pref.lang.en': 'English',
    'team.desc': 'Manage team members. Member info will be synced to GitHub.',
    'team.add': 'Add',
    'team.name.placeholder': 'Name',
    'team.role.placeholder': 'Role, e.g. Developer',
    'team.role.default': 'Member',
    'team.remove': 'Remove',
    'team.empty': 'No team members yet. Add one above.',

    // Nested pages
    'toast.subpage_created': 'Sub-page created',

    // Image size
    'toast.image.too_large': 'Image is too large (max 5MB). Please use a smaller image or paste a URL instead.',
    'toast.image.compressed': 'Image was compressed to save space.'
  },
  zh: {
    // Sidebar
    'search.placeholder': '搜索页面...',
    'sidebar.pages': '所有页面',
    'sidebar.add_subpage': '添加子页面',
    'sidebar.theme.dark': '深色',
    'sidebar.theme.light': '浅色',
    'sidebar.settings': '设置',

    // Editor & Toolbar
    'editor.add.block': '添加下级块',
    'save.local': '保存到本地',
    'save.github': '同步到 GitHub',
    'save.status.ready': '就绪',
    'save.status.unsaved': '有未保存的更改...',
    'save.status.saving': '正在向 GitHub 同步...',
    'save.status.saved': '已同步至 GitHub ✓',
    'save.status.failed': '同步失败',
    'save.status.autosaved': '已自动保存到本地',

    // Modal
    'settings.title': '设置',
    'settings.owner': '仓库所有者 (Owner)',
    'settings.owner.hint': '您的 GitHub 用户名或组织名',
    'settings.repo': '仓库名称 (Repo)',
    'settings.repo.hint': '存储内容的 Github 仓库名',
    'settings.branch': '分支 (Branch)',
    'settings.token': 'GitHub 个人访问令牌 (PAT)',
    'settings.token.hint': '⚠️ Token 代表该仓库完整权限。已升级为保存在本地(localStorage)中长期生效。需要包含 \'repo\' 权限。',
    'settings.cancel': '取消',
    'settings.save': '保存设置',

    // Slash menu
    'menu.title': '基础块',
    'menu.text': '文本',
    'menu.text.desc': '纯文本段落',
    'menu.h1': '标题 1',
    'menu.h1.desc': '一级大标题',
    'menu.h2': '标题 2',
    'menu.h2.desc': '二级中标题',
    'menu.h3': '标题 3',
    'menu.h3.desc': '三级小标题',
    'menu.image': '图片',
    'menu.image.desc': '上传或嵌入网络图片',
    'menu.divider': '分隔线',
    'menu.divider.desc': '横向分隔线',

    // Placeholders
    'placeholder.page': '无标题',
    'placeholder.heading': '标题 ',
    'placeholder.paragraph': '输入 \'/\' 唤出命令菜单...',
    'placeholder.caption': '写一点图片描述...',
    'placeholder.image.upload': '点击上传图片，或在下方输入链接',
    'placeholder.image.url': '输入图片链接并按回车 (Enter)',

    // JS alerts / Toasts
    'toast.saved.local': '内容已下载为 content.json',
    'toast.github.needs.config': '请先完成 GitHub 同步设置',
    'toast.settings.saved': 'GitHub 配置已保存',
    'toast.confirm.delete': '确定要删除 "{title}" 吗？',
    'toast.delete_page': '删除页面',
    'toast.import.success': '✅ 导入成功',
    'toast.import.failed': '导入失败: {message}',

    // Tooltips
    'sidebar.toggle': '收起/展开侧边栏',
    'sidebar.new_page': '新建页面',
    'sidebar.theme.toggle': '切换主题',
    'sidebar.settings.tooltip': '设置',
    'topbar.menu': '菜单',
    'editor.change_icon': '更换图标',
    'toolbar.bold': '加粗 (Ctrl+B)',
    'toolbar.italic': '斜体 (Ctrl+I)',
    'toolbar.underline': '下划线 (Ctrl+U)',
    'toolbar.h1': '一级标题',
    'toolbar.h2': '二级标题',
    'toolbar.h3': '三级标题',
    'toolbar.p': '正文',

    // Misc

    // Author / Identity
    'welcome.title': '👋 欢迎使用 TeamFlow Wiki',
    'welcome.desc': '请输入您的显示名称，方便队友们识别您的贡献。',
    'welcome.label': '您的姓名',
    'welcome.placeholder': '例如 张三',
    'welcome.confirm': '开始使用',
    'landing.badge': '✨ TeamFlow Wiki v1.2',
    'landing.subtitle': '为现代开发团队打造的轻量级、卡片模块化协作知识库',
    'landing.action.enter': '进入项目',
    'landing.action.settings': '配置同步',
    'landing.team.title': '项目构建成员',
    'landing.team.desc': '感谢为 TeamFlow Wiki 项目付出心血的开发与设计小组成员：',
    'landing.team.role.lead': '项目负责人 / 核心开发',
    'landing.team.role.frontend': '前端架构师',
    'landing.team.role.designer': 'UI / 交互设计师',
    'landing.team.role.ai': 'AI 配对程序员',
    'landing.guide.title': '使用指南',
    'landing.guide.desc': '快速掌握 TeamFlow Wiki 的核心协作工作流：',
    'landing.guide.step1.title': '模块化块级编辑',
    'landing.guide.step1.desc': '点击任意文本块即可直接编辑，按 Enter 键换行。每一行都是独立积木，可自由修改。',
    'landing.guide.step2.title': '斜杠命令 (Slash Command)',
    'landing.guide.step2.desc': '在新行输入 / 即可呼出快捷菜单，一键插入标题、分隔线、图片或普通段落。',
    'landing.guide.step3.title': '拖拽手柄排序',
    'landing.guide.step3.desc': '悬停于每一行侧可显现 ⠿ 手柄，长按即可上下拖拽块重新排布内容顺序。',
    'landing.guide.step4.title': 'GitHub 自动云同步',
    'landing.guide.step4.desc': '在设置 (⚙️) 中输入 GitHub Token 及仓库信息后，即可免安装 Git，一键向远端推送更新。',
    'landing.sync_guide.title': '云端协作配置向导',
    'landing.sync_guide.desc': '只需 3 步，即可在团队中建立共同的 GitHub 云端数据同步闭环，实现免安装协同：',
    'landing.sync_guide.step1.title': '1. 共同建库',
    'landing.sync_guide.step1.desc': '团队主导者访问 <a href="https://github.com/new" target="_blank" class="guide-link">github.com/new</a> 创建新仓库。接着在仓库页面进入 <strong>Settings</strong> -> <strong>Collaborators</strong> -> 点击 <strong>Add people</strong> 邀请团队成员。成员<strong>必须</strong>在邮箱或 GitHub 消息通知中接受邀请，才能获得写权限。',
    'landing.sync_guide.step2.title': '2. 创建 Access Token',
    'landing.sync_guide.step2.desc': '每个成员点击 GitHub 右上角头像 -> <strong>Settings</strong> -> 左下角 <strong>Developer settings</strong> -> <strong>Personal access tokens</strong>：<br>• 推荐：<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" class="guide-link">Fine-grained tokens (细粒度令牌)</a>。选择对应的仓库，在 <strong>Repository permissions</strong> -> <strong>Contents</strong> 中赋予 <strong>Read and write</strong> 读写权限。<br>• 备选：<a href="https://github.com/settings/tokens/new" target="_blank" class="guide-link">Tokens (classic)</a>。勾选最上方的 <strong>repo</strong> 权限框。',
    'landing.sync_guide.step3.title': '3. 同步配置与提交',
    'landing.sync_guide.step3.desc': '点击右上角“进入项目”，在侧边栏或右上角点击 ⚙️ <strong>设置</strong> -> <strong>同步配置</strong>：<br>• 填入共同的 <strong>Owner</strong> (用户名/组织名) 和 <strong>Repo</strong> (仓库名)。<br>• 填入个人的 <strong>Personal Access Token</strong> 令牌。<br>• 点击 <strong>保存设置</strong>。随后在编辑页面右上角点击 <strong>同步到 GitHub</strong>，即可向远端推送更新并拉取同步，完成闭环！',
    'landing.sync_guide.trouble.title': '常见错误与故障排查',
    'landing.sync_guide.err404.title': 'GitHub API Error: Not Found (404 错误)',
    'landing.sync_guide.err404.desc': '<strong>可能原因：</strong>仓库所有者 (Owner) 或仓库名称 (Repo) 拼写错误；或者 Token 没有访问该仓库的权限；或者协作者尚未接受仓库的合作邀请。<br><strong>解决方案：</strong>仔细核对 Owner 和 Repo 拼写；检查 Token 作用范围是否包含该仓库；协作者需先访问 <code>https://github.com/用户名/仓库名/invitations</code> 接受邀请。',
    'landing.sync_guide.err401.title': 'GitHub API Error: Bad credentials (401 错误)',
    'landing.sync_guide.err401.desc': '<strong>可能原因：</strong>输入的 Personal Access Token（个人访问令牌）不正确、已失效或已过期。<br><strong>解决方案：</strong>前往 GitHub 开发者设置重新生成 Token，复制并完整填入，确保没有复制多余的空格或换行符。',
    'landing.sync_guide.err403.title': 'GitHub API Error: Write access denied / Blocked by branch protection (403 错误)',
    'landing.sync_guide.err403.desc': '<strong>可能原因：</strong>Token 校验成功但没有写入权限（Classic 令牌未勾选 repo，或 Fine-grained 令牌未在 Contents 中赋予 Read and write）；或者主分支设置了分支保护规则，阻止了直接推送。<br><strong>解决方案：</strong>在 GitHub 修改该 Token 的权限，确保选中 repo 写入或 Contents 读写；或在仓库设置中暂时调整分支保护规则。',
    'landing.sync_guide.errnet.title': 'SSL / Connection Timeout / 网络连接失败',
    'landing.sync_guide.errnet.desc': '<strong>可能原因：</strong>本地网络访问 GitHub API 失败或超时；或者是 SSL 证书验证在部分本地中继代理中出错。<br><strong>解决方案：</strong>检查本地网络。如果使用了代理客户端，请确保其处于全局/规则代理状态并能正常连通 <code>api.github.com</code>；或参考文档调整 BepInEx/代理配置文件。',
    'settings.username': '显示名称',
    'settings.username.placeholder': '例如 张三',
    'settings.username.hint': '新建页面时会作为作者显示。',
    'page.meta.created_by': '由 {author} 创建',
    'page.meta.on': '于',
    'page.meta.anonymous': '匿名用户',

    // Trash / Recycle Bin
    'trash.title': '回收站',
    'trash.hint': '页面删除后在此保留 3 天，超期后自动清除。',
    'trash.empty': '回收站为空',
    'trash.empty.hint': '删除的页面将在此显示。',
    'trash.confirm.title': '移至回收站？',
    'trash.confirm.desc': '该页面将被移入回收站，3 天后自动永久删除。',
    'trash.confirm.cancel': '取消',
    'trash.confirm.ok': '移至回收站',
    'trash.restore': '还原',
    'trash.delete.forever': '永久删除',
    'trash.days.left': '还剩 {n} 天',
    'trash.by': '由 {author} 删除',
    'trash.on': '·',
    'trash.forever.confirm': '永久删除“{title}”？此操作不可撤销。',

    // Sidebar layout
    'sidebar.favorites': '收藏页面',
    'sidebar.quick.new': '新页面',
    'sidebar.quick.import': '导入',
    'sidebar.role': '管理员',
    'search.clear': '清除',
    'status.pages': '共 {n} 个页面',
    'status.last_saved': '最后保存: {time}',
    'status.last_saved.just': '刚刚',
    'status.last_saved.min': '{n} 分钟前',
    'status.last_saved.hour': '{n} 小时前',

    // Settings page
    'settings.back': '返回',
    'settings.tab.sync': '同步配置',
    'settings.tab.trash': '回收站',
    'settings.tab.preferences': '偏好设置',
    'settings.tab.team': '团队',
    'settings.sync.desc': '配置 GitHub 仓库信息，将内容同步至远端仓库。',
    'pref.theme.title': '主题',
    'pref.theme.light': '浅色模式',
    'pref.theme.dark': '深色模式',
    'pref.lang.title': '语言',
    'pref.lang.zh': '中文',
    'pref.lang.en': 'English',
    'team.desc': '管理团队成员，成员信息将同步至 GitHub。',
    'team.add': '添加',
    'team.name.placeholder': '姓名',
    'team.role.placeholder': '角色，如 开发者',
    'team.role.default': '成员',
    'team.remove': '移除',
    'team.empty': '还没有团队成员，在上方添加。',

    // Nested pages
    'toast.subpage_created': '子页面已创建',

    // Image size
    'toast.image.too_large': '图片过大（上限5MB），请压缩后再上传或粘贴图片链接。',
    'toast.image.compressed': '图片已自动压缩以节省存储空间。'
  }
};

let currentLang = localStorage.getItem('teamflow_lang') || 'en';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('teamflow_lang', lang);
    applyTranslations();
  }
}

export function t(key, params = {}) {
  return tLang(key, currentLang, params);
}

export function tLang(key, lang, params = {}) {
  let text = translations[lang]?.[key] || translations['en']?.[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

// Automatically apply translations to HTML items with data-i18n attribute
export function applyTranslations() {
  // Update texts
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (el.tagName === 'INPUT') {
      el.setAttribute('placeholder', t(key));
    } else {
      el.setAttribute('data-placeholder', t(key));
    }
  });

  // Update titles (tooltips)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });

  // Dispatch event so JS instances can update generated UI
  window.dispatchEvent(new CustomEvent('language-changed', { detail: currentLang }));
}

export function toggleLanguage() {
  setLang(currentLang === 'en' ? 'zh' : 'en');
}

```


### 8.9 `js/editor.js` (block editor engine, 783 lines)

**File**: `js/editor.js`

```javascript
/**
 * Block Editor Module — The core editing engine.
 * Handles block creation, editing, deletion, drag-and-drop, slash commands, and toolbar.
 */

import { generateId } from './storage.js';
import { t, tLang } from './i18n.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;       // 5MB hard limit
const COMPRESS_THRESHOLD = 500 * 1024;         // 500KB — compress above this
const COMPRESS_QUALITY = 0.7;
const COMPRESS_MAX_WIDTH = 1600;

/**
 * Process an image file: reject if too large, compress if above threshold.
 * @param {File} file
 * @returns {Promise<{dataUrl: string, compressed: boolean} | {error: string}>}
 */
export function processImageFile(file) {
  return new Promise((resolve) => {
    if (file.size > MAX_IMAGE_SIZE) {
      resolve({ error: t('toast.image.too_large') });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;

      if (file.size <= COMPRESS_THRESHOLD) {
        resolve({ dataUrl, compressed: false });
        return;
      }

      // Compress via canvas
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, COMPRESS_MAX_WIDTH / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', COMPRESS_QUALITY);
        resolve({ dataUrl: compressed, compressed: true });
      };
      img.onerror = () => resolve({ dataUrl, compressed: false }); // fallback
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export class BlockEditor {
  constructor({ editorEl, slashMenuEl, floatingToolbarEl, onUpdate }) {
    this.editorEl = editorEl;
    this.slashMenuEl = slashMenuEl;
    this.toolbarEl = floatingToolbarEl;
    this.onUpdate = onUpdate || (() => {});
    this.blocks = [];
    this.activeBlockId = null;
    this.slashMenuTarget = null;
    this.draggedBlockId = null;

    this._bindEvents();
  }

  // ─── Public API ───────────────────────────────

  /** Load blocks and render */
  load(blocks, lang = 'en') {
    this.blocks = blocks || [];
    this.pageLang = lang;
    this.render();
  }

  /** Get current blocks data */
  getData() {
    // Sync any contenteditable changes to data before returning
    this._syncAllBlocks();
    return [...this.blocks];
  }

  /** Render all blocks to DOM */
  render() {
    this.editorEl.innerHTML = '';
    this.blocks.forEach((block, index) => {
      const el = this._createBlockEl(block, index);
      this.editorEl.appendChild(el);
    });
  }

  // ─── Block Creation ───────────────────────────

  /** Create a new block data object */
  createBlock(type, extraData = {}) {
    const block = { id: generateId(), type, ...extraData };
    switch (type) {
      case 'heading':
        block.level = extraData.level || 1;
        block.content = extraData.content || '';
        break;
      case 'paragraph':
        block.content = extraData.content || '';
        break;
      case 'image':
        block.src = extraData.src || '';
        block.caption = extraData.caption || '';
        break;
      case 'divider':
        break;
    }
    return block;
  }

  /** Add a block after a given block ID, or at the end */
  addBlockAfter(afterId, type, extraData = {}) {
    const block = this.createBlock(type, extraData);
    if (afterId) {
      const idx = this.blocks.findIndex(b => b.id === afterId);
      this.blocks.splice(idx + 1, 0, block);
    } else {
      this.blocks.push(block);
    }
    this.render();
    this.onUpdate();

    // Focus the new block
    requestAnimationFrame(() => {
      const newEl = this.editorEl.querySelector(`[data-id="${block.id}"] .block-content`);
      if (newEl && newEl.contentEditable === 'true') {
        newEl.focus();
      }
    });
    return block;
  }

  /** Delete a block by ID */
  deleteBlock(id) {
    if (this.blocks.length <= 1) return; // Keep at least one block
    const idx = this.blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    this.blocks.splice(idx, 1);
    this.render();
    this.onUpdate();
  }

  /** Change block type */
  changeBlockType(id, newType, level) {
    const block = this.blocks.find(b => b.id === id);
    if (!block) return;

    // Sync content first
    this._syncBlock(id);

    block.type = newType;
    if (newType === 'heading') {
      block.level = level || 1;
    } else {
      delete block.level;
    }

    if (newType === 'divider') {
      delete block.content;
    }

    if (newType === 'image') {
      block.src = '';
      block.caption = '';
      delete block.content;
    }

    this.render();
    this.onUpdate();

    // Focus the changed block
    requestAnimationFrame(() => {
      const el = this.editorEl.querySelector(`[data-id="${id}"] .block-content`);
      if (el && el.contentEditable === 'true') {
        el.focus();
      }
    });
  }

  // ─── DOM Element Creation ─────────────────────

  _createBlockEl(block, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'block';
    wrapper.dataset.id = block.id;
    wrapper.dataset.type = block.type;
    wrapper.draggable = true;

    // Controls container (handle + add button)
    const controls = document.createElement('div');
    controls.className = 'block-controls';

    const addBtn = document.createElement('button');
    addBtn.className = 'block-add-btn';
    addBtn.innerHTML = '+';
    addBtn.title = t('editor.add_block_below');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.addBlockAfter(block.id, 'paragraph');
    });

    const handle = document.createElement('div');
    handle.className = 'block-handle';
    handle.innerHTML = '⠿';
    handle.title = 'Drag to reorder';

    controls.appendChild(addBtn);
    controls.appendChild(handle);

    // Body
    const body = document.createElement('div');
    body.className = 'block-body';

    const content = this._createContentEl(block);
    body.appendChild(content);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'block-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete block';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteBlock(block.id);
    });

    wrapper.appendChild(controls);
    wrapper.appendChild(body);
    wrapper.appendChild(deleteBtn);

    return wrapper;
  }

  _createContentEl(block) {
    switch (block.type) {
      case 'heading': {
        const el = document.createElement('div');
        el.className = 'block-content';
        el.contentEditable = 'true';
        el.dataset.type = 'heading';
        el.dataset.level = block.level || 1;
        el.dataset.placeholder = t('placeholder.heading') + (block.level || 1);
        el.textContent = block.content || '';
        return el;
      }
      case 'paragraph': {
        const el = document.createElement('div');
        el.className = 'block-content';
        el.contentEditable = 'true';
        el.dataset.type = 'paragraph';
        el.dataset.placeholder = t('placeholder.paragraph');
        el.textContent = block.content || '';
        return el;
      }
      case 'image': {
        const wrap = document.createElement('div');
        wrap.className = 'block-image';
        if (block.src) {
          const img = document.createElement('img');
          img.src = block.src;
          img.alt = block.caption || 'Image';
          img.loading = 'lazy';
          wrap.appendChild(img);

          const caption = document.createElement('div');
          caption.className = 'image-caption';
          caption.contentEditable = 'true';
          caption.textContent = block.caption || '';
          caption.dataset.placeholder = t('placeholder.caption');
          caption.addEventListener('input', () => {
            block.caption = caption.textContent;
            this.onUpdate();
          });
          wrap.appendChild(caption);
        } else {
          const upload = this._createImageUpload(block);
          wrap.appendChild(upload);
        }
        return wrap;
      }
      case 'divider': {
        const wrap = document.createElement('div');
        wrap.className = 'block-divider';
        wrap.innerHTML = '<hr>';
        return wrap;
      }
      default: {
        const el = document.createElement('div');
        el.className = 'block-content';
        el.contentEditable = 'true';
        el.dataset.type = 'paragraph';
        el.textContent = block.content || '';
        return el;
      }
    }
  }

  _createImageUpload(block) {
    const area = document.createElement('div');
    area.className = 'image-upload-area';

    area.innerHTML = `
      <div class="image-upload-icon">🖼️</div>
      <div class="image-upload-text">${t('placeholder.image.upload')}</div>
      <input type="file" class="image-upload-input" accept="image/*">
      <input type="text" class="image-url-input" placeholder="${t('placeholder.image.url')}">
    `;

    const fileInput = area.querySelector('.image-upload-input');
    const urlInput = area.querySelector('.image-url-input');

    // Click area to trigger file upload
    area.addEventListener('click', (e) => {
      if (e.target !== urlInput) {
        fileInput.click();
      }
    });

    // Handle file upload — validate size & compress
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const result = await processImageFile(file);
      if (result.error) {
        // Show error via a temporary inline message
        alert(result.error);
        return;
      }
      block.src = result.dataUrl;
      this.render();
      this.onUpdate();
    });

    // Handle URL input
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (url) {
          block.src = url;
          this.render();
          this.onUpdate();
        }
      }
    });

    // Stop propagation on URL input clicks
    urlInput.addEventListener('click', (e) => e.stopPropagation());

    return area;
  }

  // ─── Event Binding ────────────────────────────

  _bindEvents() {
    window.addEventListener('language-changed', () => {
      this.render();
    });

    // Input handler — debounced auto-save
    let saveTimer = null;
    this.editorEl.addEventListener('input', (e) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        this._syncAllBlocks();
        this.onUpdate();
      }, 500);
    });

    // Keydown handler — slash commands, enter, backspace
    this.editorEl.addEventListener('keydown', (e) => {
      this._handleKeydown(e);
    });

    // Click outside slash menu or toolbar to close
    document.addEventListener('click', (e) => {
      if (!this.slashMenuEl.contains(e.target)) {
        this._hideSlashMenu();
      }
      if (!this.toolbarEl.contains(e.target)) {
        this._hideToolbar();
      }
    });

    // Selection change — show/hide floating toolbar
    document.addEventListener('selectionchange', () => {
      this._handleSelectionChange();
    });

    // Slash menu item clicks — use mousedown to fire before the document click handler
    this.slashMenuEl.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.slash-menu-item');
      if (!item) return;
      e.preventDefault(); // Prevent blur and document click from firing first
      e.stopPropagation();
      const type = item.dataset.type;
      this._executeSlashCommand(type);
    });

    // Keyboard navigation within slash menu
    document.addEventListener('keydown', (e) => {
      if (!this._isSlashMenuVisible()) return;

      const items = Array.from(this.slashMenuEl.querySelectorAll('.slash-menu-item'));
      if (items.length === 0) return;

      const activeIdx = items.findIndex(i => i.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const nextIdx = (activeIdx + 1) % items.length;
        items.forEach(i => i.classList.remove('active'));
        items[nextIdx].classList.add('active');
        items[nextIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const prevIdx = activeIdx <= 0 ? items.length - 1 : activeIdx - 1;
        items.forEach(i => i.classList.remove('active'));
        items[prevIdx].classList.add('active');
        items[prevIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const activeItem = items[activeIdx >= 0 ? activeIdx : 0];
        if (activeItem) {
          this._executeSlashCommand(activeItem.dataset.type);
        }
      } else if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(e.key, 10) - 1;
        if (index < items.length) {
          this._executeSlashCommand(items[index].dataset.type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this._hideSlashMenu();
      }
    });

    // Floating toolbar button clicks
    this.toolbarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-command]');
      if (!btn) return;
      this._executeToolbarCommand(btn.dataset.command);
    });

    // Drag and drop
    this.editorEl.addEventListener('dragstart', (e) => this._onDragStart(e));
    this.editorEl.addEventListener('dragover', (e) => this._onDragOver(e));
    this.editorEl.addEventListener('dragleave', (e) => this._onDragLeave(e));
    this.editorEl.addEventListener('drop', (e) => this._onDrop(e));
    this.editorEl.addEventListener('dragend', (e) => this._onDragEnd(e));
  }

  // ─── Keyboard Handling ────────────────────────

  _handleKeydown(e) {
    const blockEl = e.target.closest('.block');
    if (!blockEl) return;
    const blockId = blockEl.dataset.id;

    // Slash command detection — trigger on '/' at the start of empty block
    if (e.key === '/' && e.target.textContent === '') {
      e.preventDefault();
      this.slashMenuTarget = blockId;
      this._showSlashMenu(e.target);
      return; // Don't process further to avoid conflicts
    }

    // If slash menu is visible, let the dedicated slash menu keyboard handler deal with it
    // MUST be checked before Enter/Arrow handling to prevent creating new blocks
    if (this._isSlashMenuVisible()) {
      return;
    }

    // Enter — create new block below
    if (e.key === 'Enter' && !e.shiftKey) {
      const type = blockEl.dataset.type;
      if (type === 'divider') return;

      e.preventDefault();
      this._syncBlock(blockId);
      this.addBlockAfter(blockId, 'paragraph');
    }

    // Backspace on empty block — delete it
    if (e.key === 'Backspace') {
      const content = e.target.textContent;
      if (content === '' && this.blocks.length > 1) {
        e.preventDefault();
        // Focus previous block
        const idx = this.blocks.findIndex(b => b.id === blockId);
        if (idx > 0) {
          const prevId = this.blocks[idx - 1].id;
          this.deleteBlock(blockId);
          requestAnimationFrame(() => {
            const prevEl = this.editorEl.querySelector(`[data-id="${prevId}"] .block-content`);
            if (prevEl) {
              prevEl.focus();
              // Move cursor to end
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(prevEl);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          });
        }
      }
    }

    // Escape — close menus
    if (e.key === 'Escape') {
      this._hideSlashMenu();
      this._hideToolbar();
    }

    // Arrow navigation between blocks
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;

      const idx = this.blocks.findIndex(b => b.id === blockId);
      let targetIdx = -1;

      if (e.key === 'ArrowUp') {
        const range = sel.getRangeAt(0);
        // Check if cursor is at start of block
        if (range.startOffset === 0 && idx > 0) {
          targetIdx = idx - 1;
        }
      } else {
        const text = e.target.textContent || '';
        const range = sel.getRangeAt(0);
        if (range.endOffset >= text.length && idx < this.blocks.length - 1) {
          targetIdx = idx + 1;
        }
      }

      if (targetIdx >= 0) {
        e.preventDefault();
        const targetId = this.blocks[targetIdx].id;
        const targetEl = this.editorEl.querySelector(`[data-id="${targetId}"] .block-content`);
        if (targetEl && targetEl.contentEditable === 'true') {
          targetEl.focus();
        }
      }
    }
  }

  // ─── Slash Command Menu ───────────────────────

  _isSlashMenuVisible() {
    return this.slashMenuEl.classList.contains('visible');
  }

  _showSlashMenu(anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    this.slashMenuEl.style.top = `${rect.bottom + 4}px`;
    this.slashMenuEl.style.left = `${rect.left}px`;
    this.slashMenuEl.classList.add('visible');

    // Highlight first item
    const items = this.slashMenuEl.querySelectorAll('.slash-menu-item');
    items.forEach(i => i.classList.remove('active'));
    if (items[0]) items[0].classList.add('active');
  }

  _hideSlashMenu() {
    this.slashMenuEl.classList.remove('visible');
    this.slashMenuTarget = null;
  }

  _executeSlashCommand(type) {
    // IMPORTANT: Save the target block ID BEFORE hiding the menu,
    // because _hideSlashMenu sets slashMenuTarget to null.
    const blockId = this.slashMenuTarget;
    this._hideSlashMenu();
    if (!blockId) return;

    switch (type) {
      case 'paragraph':
        this.changeBlockType(blockId, 'paragraph');
        break;
      case 'heading1':
        this.changeBlockType(blockId, 'heading', 1);
        break;
      case 'heading2':
        this.changeBlockType(blockId, 'heading', 2);
        break;
      case 'heading3':
        this.changeBlockType(blockId, 'heading', 3);
        break;
      case 'image':
        this.changeBlockType(blockId, 'image');
        break;
      case 'divider':
        this.changeBlockType(blockId, 'divider');
        break;
    }
  }

  // ─── Floating Toolbar ─────────────────────────

  _handleSelectionChange() {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      this._hideToolbar();
      return;
    }

    // Check if selection is within editor
    const range = sel.getRangeAt(0);
    const block = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer.closest('.block')
      : range.commonAncestorContainer.parentElement?.closest('.block');

    if (!block || !this.editorEl.contains(block)) {
      this._hideToolbar();
      return;
    }

    const text = sel.toString().trim();
    if (text.length === 0) {
      this._hideToolbar();
      return;
    }

    // Position toolbar above selection
    const rect = range.getBoundingClientRect();
    const tbWidth = 280; // approximate toolbar width
    this.toolbarEl.style.top = `${rect.top - 44}px`;
    this.toolbarEl.style.left = `${Math.max(8, rect.left + rect.width / 2 - tbWidth / 2)}px`;
    this.toolbarEl.classList.add('visible');
  }

  _hideToolbar() {
    this.toolbarEl.classList.remove('visible');
  }

  _executeToolbarCommand(command) {
    switch (command) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'paragraph': {
        // Change block type of the currently focused block
        const sel = window.getSelection();
        if (!sel.rangeCount) break;
        const blockEl = sel.getRangeAt(0).commonAncestorContainer.nodeType === 1
          ? sel.getRangeAt(0).commonAncestorContainer.closest('.block')
          : sel.getRangeAt(0).commonAncestorContainer.parentElement?.closest('.block');
        if (blockEl) {
          const id = blockEl.dataset.id;
          if (command === 'paragraph') {
            this.changeBlockType(id, 'paragraph');
          } else {
            this.changeBlockType(id, 'heading', parseInt(command.replace('heading', '')));
          }
        }
        break;
      }
    }
    this._hideToolbar();
  }

  // ─── Drag & Drop ──────────────────────────────

  _onDragStart(e) {
    const blockEl = e.target.closest('.block');
    if (!blockEl) return;

    this.draggedBlockId = blockEl.dataset.id;
    blockEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockEl.dataset.id);
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const blockEl = e.target.closest('.block');
    if (!blockEl || blockEl.dataset.id === this.draggedBlockId) return;

    // Determine if we're on the top or bottom half
    const rect = blockEl.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    // Clear all drag indicators
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    if (e.clientY < midY) {
      blockEl.classList.add('drag-over-top');
    } else {
      blockEl.classList.add('drag-over-bottom');
    }
  }

  _onDragLeave(e) {
    const blockEl = e.target.closest('.block');
    if (blockEl) {
      blockEl.classList.remove('drag-over-top', 'drag-over-bottom');
    }
  }

  _onDrop(e) {
    e.preventDefault();
    const targetEl = e.target.closest('.block');
    if (!targetEl || !this.draggedBlockId) return;

    const targetId = targetEl.dataset.id;
    if (targetId === this.draggedBlockId) return;

    // Determine position (above or below)
    const rect = targetEl.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;

    // Move block in data
    const dragIdx = this.blocks.findIndex(b => b.id === this.draggedBlockId);
    const [draggedBlock] = this.blocks.splice(dragIdx, 1);

    let targetIdx = this.blocks.findIndex(b => b.id === targetId);
    if (!insertBefore) targetIdx += 1;

    this.blocks.splice(targetIdx, 0, draggedBlock);

    // Clean up and re-render
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
    });

    this.render();
    this.onUpdate();
  }

  _onDragEnd(e) {
    this.draggedBlockId = null;
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
    });
  }

  // ─── Data Sync ────────────────────────────────

  /** Sync all visible blocks' content from DOM to data */
  _syncAllBlocks() {
    this.blocks.forEach(block => this._syncBlock(block.id));
  }

  /** Sync a single block's content from DOM to data */
  _syncBlock(id) {
    const block = this.blocks.find(b => b.id === id);
    if (!block) return;

    const el = this.editorEl.querySelector(`[data-id="${id}"] .block-content`);
    if (!el) return;

    if (block.type === 'heading' || block.type === 'paragraph') {
      block.content = el.textContent || '';
    }
  }
}

```


### 8.10 `js/pages.js` (sidebar page manager, 388 lines)

**File**: `js/pages.js`

```javascript
import { t, tLang } from './i18n.js';

export class PageManager {
  constructor({ pageListEl, favListEl, onPageSelect, onPageAdd, onPageDelete, onSubPageAdd, onFavoriteToggle, onReorder }) {
    this.pageListEl = pageListEl;
    this.favListEl = favListEl;
    this.onPageSelect = onPageSelect || (() => {});
    this.onPageAdd = onPageAdd || (() => {});
    this.onPageDelete = onPageDelete || (() => {});
    this.onSubPageAdd = onSubPageAdd || (() => {});
    this.onFavoriteToggle = onFavoriteToggle || (() => {});
    this.onReorder = onReorder || (() => {});
    this.pages = [];
    this.activePageId = null;
    this.searchTerm = '';
    this.draggedPageId = null;

    // Load expanded state from localStorage
    try {
      this._expandedIds = new Set(JSON.parse(localStorage.getItem('teamflow_expanded_pages') || '[]'));
    } catch {
      this._expandedIds = new Set();
    }

    window.addEventListener('language-changed', () => {
      this.render();
    });
  }

  /** Load pages data and render list */
  load(pages, activeId) {
    this.pages = pages || [];
    this.activePageId = activeId || (pages[0]?.id || null);
    this.render();
  }

  /** Get the active page data */
  getActivePage() {
    return this.pages.find(p => p.id === this.activePageId) || null;
  }

  /** Set active page */
  setActive(pageId) {
    this.onPageSelect(pageId);
    this.activePageId = pageId;

    // Auto-expand parent chain so the selected page is visible
    this._expandAncestors(pageId);

    this.render();
  }

  /** Filter pages by search */
  search(term) {
    this.searchTerm = term.toLowerCase();
    this.render();
  }

  /** Check if a page has children */
  _hasChildren(pageId) {
    return this.pages.some(p => p.parentId === pageId);
  }

  /** Get children of a page */
  _getChildren(parentId) {
    return this.pages.filter(p => p.parentId === parentId);
  }

  /** Get ancestor chain (from root to parent) */
  getAncestors(pageId) {
    const ancestors = [];
    let current = this.pages.find(p => p.id === pageId);
    while (current && current.parentId) {
      const parent = this.pages.find(p => p.id === current.parentId);
      if (!parent) break;
      ancestors.unshift(parent);
      current = parent;
    }
    return ancestors;
  }

  /** Toggle expand/collapse of a page in the sidebar */
  _toggleExpand(pageId) {
    if (this._expandedIds.has(pageId)) {
      this._expandedIds.delete(pageId);
    } else {
      this._expandedIds.add(pageId);
    }
    this._saveExpandedState();
    this.render();
  }

  /** Expand all ancestors so a page is visible */
  _expandAncestors(pageId) {
    let current = this.pages.find(p => p.id === pageId);
    while (current && current.parentId) {
      this._expandedIds.add(current.parentId);
      current = this.pages.find(p => p.id === current.parentId);
    }
    this._saveExpandedState();
  }

  /** Persist expanded state */
  _saveExpandedState() {
    localStorage.setItem('teamflow_expanded_pages', JSON.stringify([...this._expandedIds]));
  }

  /** Render the page list */
  render() {
    this.pageListEl.innerHTML = '';

    if (this.searchTerm) {
      // Flat search mode: show all matching pages regardless of nesting
      this._renderFlatSearch();
    } else {
      // Tree mode: render recursively from root
      this._renderTree(null, 0);
    }

    this.renderFavorites();
  }

  /** Render favorites list */
  renderFavorites() {
    if (!this.favListEl) return;
    this.favListEl.innerHTML = '';

    const favPages = this.pages.filter(p => p.favorite === true);
    favPages.forEach(page => {
      const item = document.createElement('div');
      item.className = `page-item${page.id === this.activePageId ? ' active' : ''}`;
      item.dataset.id = page.id;
      item.style.setProperty('--nest-level', 0);

      // Chevron toggle placeholder (for alignment)
      const toggle = document.createElement('span');
      toggle.className = 'page-item-toggle';
      item.appendChild(toggle);

      // Icon
      const icon = document.createElement('span');
      icon.className = 'page-item-icon';
      icon.textContent = page.icon || '📄';
      item.appendChild(icon);

      // Name
      const name = document.createElement('span');
      name.className = 'page-item-name';
      name.textContent = page.title || tLang('placeholder.page', page.lang || 'en');
      item.appendChild(name);

      // Remove from favorites button
      const actions = document.createElement('span');
      actions.className = 'page-item-actions';

      const removeFavBtn = document.createElement('button');
      removeFavBtn.className = 'page-item-delete';
      removeFavBtn.innerHTML = '★';
      removeFavBtn.title = t('sidebar.favorites');
      removeFavBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onFavoriteToggle(page.id, false);
      });
      actions.appendChild(removeFavBtn);
      item.appendChild(actions);

      // Click to select
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.page-item-delete')) {
          this.setActive(page.id);
        }
      });

      this.favListEl.appendChild(item);
    });
  }

  /** Render flat search results */
  _renderFlatSearch() {
    const filtered = this.pages.filter(p =>
      p.title && p.title.toLowerCase().includes(this.searchTerm)
    );

    filtered.forEach(page => {
      const item = this._createPageItem(page, 0);
      this.pageListEl.appendChild(item);
    });
  }

  /** Recursively render tree */
  _renderTree(parentId, level) {
    const children = this.pages.filter(p => (p.parentId || null) === parentId);

    children.forEach(page => {
      const hasChildren = this._hasChildren(page.id);
      const isExpanded = this._expandedIds.has(page.id);

      const item = this._createPageItem(page, level, hasChildren, isExpanded);
      this.pageListEl.appendChild(item);

      // Render children if expanded
      if (hasChildren && isExpanded) {
        this._renderTree(page.id, level + 1);
      }
    });
  }

  /** Create a single page item element */
  _createPageItem(page, level, hasChildren = false, isExpanded = false) {
    const item = document.createElement('div');
    item.className = `page-item${page.id === this.activePageId ? ' active' : ''}`;
    item.dataset.id = page.id;
    item.style.setProperty('--nest-level', level);

    // Chevron toggle for parent pages
    const toggle = document.createElement('span');
    toggle.className = 'page-item-toggle';
    if (hasChildren) {
      toggle.textContent = '▶';
      if (isExpanded) toggle.classList.add('expanded');
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleExpand(page.id);
      });
    }
    item.appendChild(toggle);

    // Icon
    const icon = document.createElement('span');
    icon.className = 'page-item-icon';
    icon.textContent = page.icon || '📄';
    item.appendChild(icon);

    // Name
    const name = document.createElement('span');
    name.className = 'page-item-name';
    name.textContent = page.title || tLang('placeholder.page', page.lang || 'en');
    item.appendChild(name);

    // Actions container (add sub-page + delete)
    const actions = document.createElement('span');
    actions.className = 'page-item-actions';

    // Add sub-page button
    const addChildBtn = document.createElement('button');
    addChildBtn.className = 'page-item-add-child';
    addChildBtn.innerHTML = '+';
    addChildBtn.title = t('sidebar.add_subpage');
    addChildBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onSubPageAdd(page.id);
    });
    actions.appendChild(addChildBtn);

    // Delete button (don't allow deleting the last root page if it's the only page)
    if (this.pages.length > 1) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'page-item-delete';
      deleteBtn.innerHTML = '×';
      deleteBtn.title = t('toast.delete_page');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onPageDelete(page.id);
      });
      actions.appendChild(deleteBtn);
    }

    item.appendChild(actions);

    // Click to select page
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.page-item-delete') && !e.target.closest('.page-item-add-child') && !e.target.closest('.page-item-toggle')) {
        this.setActive(page.id);
      }
    });

    // Drag-and-drop event listeners
    item.draggable = true;

    item.addEventListener('dragstart', (e) => {
      if (e.target.closest('.page-item-delete') || e.target.closest('.page-item-add-child') || e.target.closest('.page-item-toggle')) {
        e.preventDefault();
        return;
      }
      this.draggedPageId = page.id;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', page.id);
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!this.draggedPageId || this.draggedPageId === page.id) return;
      if (this._isDescendant(this.draggedPageId, page.id)) return;

      const rect = item.getBoundingClientRect();
      const relativeY = (e.clientY - rect.top) / rect.height;

      // Clear all drag indicators on list
      this.pageListEl.querySelectorAll('.page-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inner');
      });

      if (relativeY < 0.3) {
        item.classList.add('drag-over-top');
      } else if (relativeY > 0.7) {
        item.classList.add('drag-over-bottom');
      } else {
        item.classList.add('drag-over-inner');
      }
      e.dataTransfer.dropEffect = 'move';
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inner');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!this.draggedPageId || this.draggedPageId === page.id) return;
      if (this._isDescendant(this.draggedPageId, page.id)) return;

      const rect = item.getBoundingClientRect();
      const relativeY = (e.clientY - rect.top) / rect.height;

      // Find drag source and target index in pages array
      const dragIdx = this.pages.findIndex(p => p.id === this.draggedPageId);
      const draggedPage = this.pages[dragIdx];

      // Remove from old position
      this.pages.splice(dragIdx, 1);

      if (relativeY < 0.3) {
        // Move before target (same parent)
        draggedPage.parentId = page.parentId;
        let targetIdx = this.pages.findIndex(p => p.id === page.id);
        this.pages.splice(targetIdx, 0, draggedPage);
      } else if (relativeY > 0.7) {
        // Move after target (same parent)
        draggedPage.parentId = page.parentId;
        let targetIdx = this.pages.findIndex(p => p.id === page.id);
        this.pages.splice(targetIdx + 1, 0, draggedPage);
      } else {
        // Move inside target (as child)
        draggedPage.parentId = page.id;
        this._expandedIds.add(page.id);
        this._saveExpandedState();
        let targetIdx = this.pages.findIndex(p => p.id === page.id);
        this.pages.splice(targetIdx + 1, 0, draggedPage);
      }

      this.pageListEl.querySelectorAll('.page-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inner', 'dragging');
      });

      this.draggedPageId = null;
      this.render();
      this.onReorder();
    });

    item.addEventListener('dragend', () => {
      this.draggedPageId = null;
      this.pageListEl.querySelectorAll('.page-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inner', 'dragging');
      });
    });

    return item;
  }

  _isDescendant(parentPageId, childPageId) {
    let current = this.pages.find(p => p.id === childPageId);
    while (current && current.parentId) {
      if (current.parentId === parentPageId) return true;
      current = this.pages.find(p => p.id === current.parentId);
    }
    return false;
  }

  /** Update a page's title/icon */
  updatePage(pageId, updates) {
    const page = this.pages.find(p => p.id === pageId);
    if (page) {
      Object.assign(page, updates);
      this.render();
    }
  }
}

```


### 8.11 `js/github.js` (GitHub Contents API, 103 lines)

**File**: `js/github.js`

```javascript
/**
 * GitHub Module — Manages GitHub API integration for saving content to a repository.
 */

const GITHUB_SETTINGS_KEY = 'teamflow_github';

/**
 * Get saved GitHub settings from localStorage
 */
export function getGitHubSettings() {
  const saved = localStorage.getItem(GITHUB_SETTINGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) { /* ignore */ }
  }

  return { owner: '', repo: '', branch: 'main', token: '' };
}

/**
 * Save GitHub settings (now stores config AND token locally)
 */
export function saveGitHubSettings(settings) {
  localStorage.setItem(GITHUB_SETTINGS_KEY, JSON.stringify(settings));
}


/**
 * Check if GitHub is configured (has token + repo info)
 */
export function isGitHubConfigured() {
  const s = getGitHubSettings();
  return !!(s.owner && s.repo && s.token);
}

/**
 * Save content.json to GitHub repository via the Contents API
 * @param {Object} data - The content data to save
 * @returns {Object} - { success: boolean, message: string }
 */
export async function saveToGitHub(data) {
  const settings = getGitHubSettings();

  if (!settings.owner || !settings.repo || !settings.token) {
    return { success: false, message: 'GitHub settings incomplete. Please configure in Settings.' };
  }

  const filePath = 'data/content.json';
  const apiUrl = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${filePath}`;

  try {
    // First, get the current file to obtain its SHA (required for updating)
    let sha = null;
    try {
      const getResp = await fetch(apiUrl + `?ref=${settings.branch}`, {
        headers: {
          'Authorization': `Bearer ${settings.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getResp.ok) {
        const fileData = await getResp.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File might not exist yet, that's OK
    }

    // Encode content to base64
    const content = JSON.stringify(data, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(content)));

    // Create or update the file
    const putBody = {
      message: `Update content via TeamFlow Wiki [${new Date().toLocaleString()}]`,
      content: encoded,
      branch: settings.branch
    };
    if (sha) {
      putBody.sha = sha;
    }

    const putResp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${settings.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });

    if (putResp.ok) {
      return { success: true, message: 'Content saved to GitHub successfully!' };
    } else {
      const err = await putResp.json();
      return { success: false, message: `GitHub API error: ${err.message || putResp.statusText}` };
    }
  } catch (e) {
    return { success: false, message: `Network error: ${e.message}` };
  }
}

```


### 8.12 `js/landing.js` (landing page interactions, 276 lines)

**File**: `js/landing.js`

```javascript
import { applyTranslations, getLang, setLang } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme
  initTheme();

  // Initialize Language
  initLanguage();

  // Initialize Canvas Particle Background
  initParticleBackground();

  // Initialize 3D Card Hover Effects
  initCardInteractivity();

  // Initialize Troubleshooting Accordion
  initAccordions();
});

// ─── Theme Management ──────────────────────────────
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Read saved theme or default to dark (matching modern premium look)
  let savedTheme = localStorage.getItem('teamflow_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('teamflow_theme', nextTheme);
    updateThemeIcon(nextTheme);
  });
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// ─── Language Management ───────────────────────────
function initLanguage() {
  const langBtn = document.getElementById('lang-toggle-btn');
  
  // Update translation on load
  updateLanguageLabel();
  applyTranslations();

  langBtn?.addEventListener('click', () => {
    const currentLang = getLang();
    const nextLang = currentLang === 'en' ? 'zh' : 'en';
    
    setLang(nextLang);
    updateLanguageLabel();
  });
}

function updateLanguageLabel() {
  const label = document.getElementById('lang-label');
  if (label) {
    // Show current state and toggle choice
    label.textContent = getLang() === 'en' ? '中文' : 'English';
  }
}

// ─── Canvas Particle Background ────────────────────
function initParticleBackground() {
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  let particles = [];
  const particleCount = 75;
  const connectionDistance = 110;
  
  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  // Adjust canvas size for high-DPI screens
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.baseRadius = Math.random() * 2 + 1;
      this.radius = this.baseRadius;
    }

    draw() {
      // Choose particle color depending on light/dark mode
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    update() {
      // Bounce off walls
      if (this.x < 0 || this.x > window.innerWidth) this.vx = -this.vx;
      if (this.y < 0 || this.y > window.innerHeight) this.vy = -this.vy;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Mouse Attraction/Interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          // Attract particles slightly towards mouse
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 0.6;
          this.y += (dy / dist) * force * 0.6;
          this.radius = this.baseRadius * 1.5;
        } else {
          if (this.radius > this.baseRadius) {
            this.radius -= 0.1;
          }
        }
      }
    }
  }

  // Generate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Draw lines between nearby particles
  function drawConnections() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.18;
          ctx.strokeStyle = isDark 
            ? `rgba(99, 102, 241, ${alpha})` // Indigo tint in dark mode
            : `rgba(37, 99, 235, ${alpha})`;  // Blue tint in light mode
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      // Draw connections to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const mDist = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
        if (mDist < mouse.radius) {
          const alpha = (1 - mDist / mouse.radius) * 0.25;
          ctx.strokeStyle = isDark 
            ? `rgba(139, 92, 246, ${alpha})` // Purple tint
            : `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

// ─── 3D Card Interactivity ─────────────────────────
function initCardInteractivity() {
  const cards = document.querySelectorAll('.glass-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside element
      const y = e.clientY - rect.top;  // y coordinate inside element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate tilt degrees (max 6deg)
      const tiltX = ((y - centerY) / centerY) * -5;
      const tiltY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─── Troubleshooting Accordion ─────────────────────
function initAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const icon = header.querySelector('.accordion-icon');
      
      const isOpen = item.classList.contains('active');
      
      // Close other items
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-content').style.maxHeight = null;
        otherItem.querySelector('.accordion-icon').textContent = '+';
      });
      
      if (!isOpen) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.textContent = '−';
      }
    });
  });
}

```


### 8.13 `js/app.js` (main app orchestrator, 1366 lines)

**File**: `js/app.js`

```javascript
/**
 * App Module — Main orchestrator. Wires together all modules and DOM elements.
 */

import { loadContent, saveToLocalStorage, exportAsJson, generateId, getTheme, setTheme } from './storage.js';
import { BlockEditor } from './editor.js';
import { PageManager } from './pages.js';
import { getGitHubSettings, saveGitHubSettings, isGitHubConfigured, saveToGitHub } from './github.js';
import { applyTranslations, toggleLanguage, t, tLang, getLang, setLang } from './i18n.js';

class App {
  constructor() {
    this.data = null;
    this.editor = null;
    this.pageManager = null;
    this.saveDebounceTimer = null;
  }

  async init() {
    // Load data
    this.data = await loadContent();

    // Apply default language
    applyTranslations();

    // Apply saved theme
    this._initTheme();

    // Ensure trash array exists and auto-purge expired items
    if (!this.data.trash) this.data.trash = [];
    this._purgExpiredTrash();

    // Initialize editor
    this.editor = new BlockEditor({
      editorEl: document.getElementById('editor'),
      slashMenuEl: document.getElementById('slash-menu'),
      floatingToolbarEl: document.getElementById('floating-toolbar'),
      onUpdate: () => this._onContentUpdate()
    });

    // Initialize page manager
    this.pageManager = new PageManager({
      pageListEl: document.getElementById('page-list'),
      favListEl: document.getElementById('fav-page-list'),
      onPageSelect: (pageId) => this._switchPage(pageId),
      onPageAdd: () => {},
      onPageDelete: (pageId) => this._deletePage(pageId),
      onSubPageAdd: (parentId) => this._addPage(parentId),
      onFavoriteToggle: (pageId, isFav) => this._togglePageFavorite(pageId, isFav),
      onReorder: () => this._onContentUpdate()
    });

    // Load pages
    const firstPageId = this.data.pages[0]?.id;
    this.pageManager.load(this.data.pages, firstPageId);
    this._loadPage(firstPageId);

    // Bind all UI events
    this._bindUIEvents();

    // Load GitHub settings into form
    this._loadGitHubSettings();

    // Check URL parameters to see if we should open settings on load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open') === 'settings') {
      this._showSettingsView('sync');
    }

    // Set site name
    const siteName = document.getElementById('site-name');
    if (siteName && this.data.site?.name) {
      siteName.textContent = this.data.site.name;
    }

    // Update save status
    this._setSaveStatus(t('save.status.ready'));

    // Init user identity
    this._initUser();

    // Re-render trash list when language changes (keeps empty text in sync)
    window.addEventListener('language-changed', () => {
      const settingsView = document.getElementById('settings-view');
      const isTrashActive = document.querySelector('.settings-section[data-section="trash"]')?.classList.contains('active');
      if (settingsView && settingsView.style.display !== 'none' && isTrashActive) {
        this._renderTrashList();
      }
      // Also update sidebar user anonymous label if no name set
      this._updateTrashBadge();
      this._updatePageCount();
      this._refreshLastSavedDisplay();
    });

    // Update trash badge on load
    this._updateTrashBadge();
    this._updatePageCount();
    // Refresh last-saved display every 30s
    setInterval(() => this._refreshLastSavedDisplay(), 30000);
  }

  // ─── Page Management ──────────────────────────

  _loadPage(pageId) {
    const page = this.data.pages.find(p => p.id === pageId);
    if (!page) return;

    // Update page header
    const titleEl = document.getElementById('page-title');
    titleEl.textContent = page.title || '';

    // Update icon display in page header
    const iconDisplay = document.getElementById('page-icon-display');
    if (iconDisplay) iconDisplay.textContent = page.icon || '📄';

    // Update favorite toggle button state
    this._updateFavoriteButton(page);

    // Update breadcrumb with ancestor chain
    this._updateBreadcrumb(page);

    // Hide settings view if open
    const settingsView = document.getElementById('settings-view');
    if (settingsView && settingsView.style.display !== 'none') {
      settingsView.style.display = 'none';
      document.getElementById('editor-container').style.display = '';
    }

    // Update page meta (author + date)
    this._updatePageMeta(page);

    // Load blocks into editor
    this.editor.load(page.blocks || [], page.lang || 'en');
  }

  _updateBreadcrumb(page) {
    const breadcrumb = document.getElementById('breadcrumb');
    // Keep only the root link
    const root = document.getElementById('breadcrumb-root');
    breadcrumb.innerHTML = '';
    breadcrumb.appendChild(root);

    // Build ancestor chain
    const ancestors = this.pageManager.getAncestors(page.id);

    // Render ancestor links
    ancestors.forEach(ancestor => {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb-sep';
      sep.textContent = '/';
      breadcrumb.appendChild(sep);

      const link = document.createElement('span');
      link.className = 'breadcrumb-link';
      link.textContent = ancestor.title || tLang('placeholder.page', ancestor.lang || 'en');
      link.addEventListener('click', () => {
        this.pageManager.setActive(ancestor.id);
      });
      breadcrumb.appendChild(link);
    });

    // Current page (not clickable)
    const sep = document.createElement('span');
    sep.className = 'breadcrumb-sep';
    sep.textContent = '/';
    breadcrumb.appendChild(sep);

    const current = document.createElement('span');
    current.className = 'breadcrumb-link breadcrumb-current';
    current.id = 'breadcrumb-page';
    current.textContent = page.title || tLang('placeholder.page', page.lang || 'en');
    breadcrumb.appendChild(current);
  }

  _switchPage(pageId) {
    // NOTE: _syncCurrentPage() is intentionally NOT called here.
    // pages.js setActive() calls onPageSelect (this function) BEFORE updating
    // activePageId, so _syncCurrentPage has already saved the old page correctly
    // at the call site in _addPage / _loadPage / etc.
    // Calling it again here would overwrite the NEW page with old editor content.

    // Save current page before switching (only called from direct sources, not setActive)
    // We check: if activePageId is still the OLD page, sync it first
    if (this.pageManager.activePageId !== pageId) {
      this._syncCurrentPage();
    }

    // Load new page
    this._loadPage(pageId);
    this.pageManager.activePageId = pageId;
    this.pageManager.render();
    // Exit settings view if open
    const settingsView = document.getElementById('settings-view');
    if (settingsView && settingsView.style.display !== 'none') {
      this._exitSettingsView();
    }
  }

  _getNextPageTitle(lang) {
    const prefix = lang === 'zh' ? '新页面' : 'New Page';
    const usedNums = new Set(
      this.data.pages
        .map(p => p.title)
        .filter(t => t && t.startsWith(prefix + ' '))
        .map(t => parseInt(t.replace(prefix + ' ', ''), 10))
        .filter(n => !isNaN(n))
    );
    let n = 1;
    while (usedNums.has(n)) n++;
    return `${prefix} ${n}`;
  }

  _addPage(parentId = null) {
    const lang = getLang();
    const now = new Date().toISOString();
    const title = this._getNextPageTitle(lang);
    const newPage = {
      id: generateId(),
      parentId: parentId || null,
      title,
      icon: '📄',
      lang: lang,
      author: this._getUsername(),
      createdAt: now,
      updatedAt: now,
      blocks: [{
        id: generateId(),
        type: 'paragraph',
        content: ''
      }]
    };

    this.data.pages.push(newPage);
    this.pageManager.load(this.data.pages, newPage.id);
    this._loadPage(newPage.id);
    this._onContentUpdate();

    if (parentId) {
      this._showToast('success', t('toast.subpage_created'));
    }

    // Focus page title
    requestAnimationFrame(() => {
      const titleEl = document.getElementById('page-title');
      titleEl.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(titleEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }

  /** Recursively get all descendant pages */
  _getDescendants(pageId) {
    const children = this.data.pages.filter(p => p.parentId === pageId);
    return children.flatMap(c => [c, ...this._getDescendants(c.id)]);
  }

  _deletePage(pageId) {
    // Show custom confirmation modal instead of window.confirm
    this._showDeleteConfirmModal(pageId);
  }

  _doMoveToTrash(pageId) {
    const idx = this.data.pages.findIndex(p => p.id === pageId);
    if (idx === -1 || this.data.pages.length <= 1) return;

    // Sync active page if not the one being deleted
    const activeId = this.pageManager.activePageId;
    if (activeId !== pageId) {
      this._syncCurrentPage();
    }

    // Collect the page + all descendants for cascading delete
    const descendants = this._getDescendants(pageId);
    const allToDelete = [this.data.pages[idx], ...descendants];
    const allToDeleteIds = new Set(allToDelete.map(p => p.id));

    // Remove from pages array
    this.data.pages = this.data.pages.filter(p => !allToDeleteIds.has(p.id));

    // Move all to trash with metadata
    const now = new Date().toISOString();
    const deletedBy = this._getUsername();
    if (!this.data.trash) this.data.trash = [];
    allToDelete.forEach(page => {
      page.deletedAt = now;
      page.deletedBy = deletedBy;
      this.data.trash.unshift(page);
    });

    // Update trash badge
    this._updateTrashBadge();

    // Switch to next page — check if active page was part of deleted subtree
    let nextActiveId = activeId;
    if (allToDeleteIds.has(activeId)) {
      nextActiveId = this.data.pages[0]?.id;
    }
    // Hide settings view if open
    const settingsView = document.getElementById('settings-view');
    if (settingsView && settingsView.style.display !== 'none') {
      settingsView.style.display = 'none';
      document.getElementById('editor-container').style.display = '';
    }
    this.pageManager.load(this.data.pages, nextActiveId);
    this._loadPage(nextActiveId);
    this._onContentUpdate();

    this._showToast('success', t('trash.confirm.ok'));
  }

  _togglePageFavorite(pageId, isFav) {
    const page = this.data.pages.find(p => p.id === pageId);
    if (!page) return;
    page.favorite = isFav !== undefined ? isFav : !page.favorite;
    this._onContentUpdate();
    this.pageManager.render();
    this._updateFavoriteButton(page);
  }

  _updateFavoriteButton(page) {
    const favBtn = document.getElementById('favorite-toggle-btn');
    if (favBtn) {
      favBtn.textContent = page.favorite ? '★' : '☆';
      favBtn.classList.toggle('active', !!page.favorite);
    }
  }

  _syncCurrentPage() {
    const page = this.pageManager.getActivePage();
    if (!page) return;

    // Sync blocks from editor
    page.blocks = this.editor.getData();

    // Sync title
    const titleEl = document.getElementById('page-title');
    page.title = titleEl.textContent || tLang('placeholder.page', page.lang || 'en');

    // Sync icon from page header display
    const iconDisplay = document.getElementById('page-icon-display');
    page.icon = iconDisplay ? iconDisplay.textContent.trim() : '📄';

    // Update sidebar
    this.pageManager.render();
  }

  // ─── Content Update & Save ────────────────────

  _onContentUpdate() {
    this._setSaveStatus(t('save.status.unsaved'));

    clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
      this._syncCurrentPage();
      saveToLocalStorage(this.data);
      this._setSaveStatus(t('save.status.autosaved'));
      this._updateLastSaved();
      this._updatePageCount();
    }, 1000);
  }

  async _saveToLocal() {
    this._syncCurrentPage();
    exportAsJson(this.data);
    this._showToast('success', t('toast.saved.local'));
  }

  async _saveToGitHub() {
    if (!isGitHubConfigured()) {
      this._showSettingsModal();
      this._showToast('warning', t('toast.github.needs.config'));
      return;
    }

    this._syncCurrentPage();
    this._setSaveStatus(t('save.status.saving'));

    const result = await saveToGitHub(this.data);

    if (result.success) {
      this._setSaveStatus(t('save.status.saved'));
      this._showToast('success', t('toast.settings.saved'));
    } else {
      this._setSaveStatus(t('save.status.failed'));
      this._showToast('error', result.message);
    }
  }

  _setSaveStatus(text) {
    const el = document.getElementById('save-status');
    if (el) el.textContent = text;
  }

  _updatePageCount() {
    const el = document.getElementById('page-count');
    if (el) {
      const n = this.data.pages?.length || 0;
      el.textContent = t('status.pages', { n });
    }
  }

  _updateLastSaved() {
    this._lastSavedAt = Date.now();
    this._refreshLastSavedDisplay();
  }

  _refreshLastSavedDisplay() {
    const el = document.getElementById('last-saved');
    if (!el || !this._lastSavedAt) return;
    const diff = Math.floor((Date.now() - this._lastSavedAt) / 1000);
    let timeStr;
    if (diff < 60) {
      timeStr = t('status.last_saved.just');
    } else if (diff < 3600) {
      timeStr = t('status.last_saved.min', { n: Math.floor(diff / 60) });
    } else {
      timeStr = t('status.last_saved.hour', { n: Math.floor(diff / 3600) });
    }
    el.textContent = t('status.last_saved', { time: timeStr });
  }

  // ─── Trash / Recycle Bin ──────────────────────

  _purgExpiredTrash() {
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const before = this.data.trash.length;
    this.data.trash = this.data.trash.filter(p => {
      return now - new Date(p.deletedAt).getTime() < THREE_DAYS;
    });
    if (this.data.trash.length !== before) {
      saveToLocalStorage(this.data);
    }
  }

  _updateTrashBadge() {
    const badge = document.getElementById('trash-count-badge');
    const count = this.data.trash?.length || 0;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  _showDeleteConfirmModal(pageId) {
    const page = this.data.pages.find(p => p.id === pageId);
    if (!page) return;

    const modal = document.getElementById('delete-confirm-modal');
    const descEl = document.getElementById('delete-modal-desc');
    const metaEl = document.getElementById('delete-modal-meta');

    descEl.textContent = t('trash.confirm.desc');

    const author = page.author ? `<strong>${page.author}</strong>` : `<em>${t('page.meta.anonymous')}</em>`;
    const date = page.createdAt
      ? new Date(page.createdAt).toLocaleDateString(page.lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'long' })
      : '';
    metaEl.innerHTML = `
      <div style="margin-bottom:4px"><strong>${page.title || t('placeholder.page')}</strong></div>
      <div>${t('page.meta.created_by').replace('{author}', page.author || t('page.meta.anonymous'))}
      ${date ? `${t('page.meta.on')} ${date}` : ''}</div>
    `;

    modal.classList.add('visible');
    applyTranslations();

    // Wire confirm
    const confirmBtn = document.getElementById('delete-modal-confirm-btn');
    const cancelBtn = document.getElementById('delete-modal-cancel-btn');
    const closeBtn = document.getElementById('delete-modal-close-btn');

    const doClose = () => modal.classList.remove('visible');
    const doConfirm = () => { doClose(); this._doMoveToTrash(pageId); };

    // Replace event listeners (clone to avoid double-binding)
    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    const newClose = closeBtn.cloneNode(true);
    confirmBtn.replaceWith(newConfirm);
    cancelBtn.replaceWith(newCancel);
    closeBtn.replaceWith(newClose);

    newConfirm.addEventListener('click', doConfirm);
    newCancel.addEventListener('click', doClose);
    newClose.addEventListener('click', doClose);
    modal.addEventListener('click', (e) => { if (e.target === modal) doClose(); }, { once: true });
  }

  _showSettingsView(tab) {
    document.getElementById('editor-container').style.display = 'none';
    document.getElementById('settings-view').style.display = '';
    // Update breadcrumb
    document.getElementById('breadcrumb-page').textContent = t('settings.title');
    this.pageManager.render(); // deselect page
    this._loadGitHubSettings();
    this._renderTrashList();
    this._updatePrefCards();
    this._renderTeamList();
    if (tab) this._switchSettingsTab(tab);
  }

  _exitSettingsView() {
    document.getElementById('editor-container').style.display = '';
    document.getElementById('settings-view').style.display = 'none';
    // Restore breadcrumb
    const activeId = this.pageManager?.activePageId;
    if (activeId) {
      const page = this.data.pages.find(p => p.id === activeId);
      if (page) document.getElementById('breadcrumb-page').textContent = page.title || t('placeholder.page');
    }
  }

  _switchSettingsTab(tabName) {
    document.querySelectorAll('.settings-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.settings-section').forEach(sec => {
      sec.classList.toggle('active', sec.dataset.section === tabName);
    });
    if (tabName === 'trash') this._renderTrashList();
    if (tabName === 'team') this._renderTeamList();
    if (tabName === 'preferences') this._updatePrefCards();
  }

  _updatePrefCards() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    document.querySelectorAll('[data-theme-choice]').forEach(card => {
      card.classList.toggle('active', card.dataset.themeChoice === theme);
    });
    const lang = getLang();
    document.querySelectorAll('[data-lang-choice]').forEach(card => {
      card.classList.toggle('active', card.dataset.langChoice === lang);
    });
  }

  _renderTrashList() {
    const listEl = document.getElementById('trash-list');
    listEl.innerHTML = '';
    const trash = this.data.trash || [];

    if (trash.length === 0) {
      listEl.innerHTML = `
        <div class="trash-empty">
          <div class="trash-empty-icon">🗑️</div>
          <div>${t('trash.empty')}</div>
          <div style="font-size:0.85em;margin-top:8px;opacity:0.7">${t('trash.empty.hint')}</div>
        </div>
      `;
      return;
    }

    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    trash.forEach(page => {
      const deletedMs = new Date(page.deletedAt).getTime();
      const daysLeft = Math.ceil((THREE_DAYS_MS - (now - deletedMs)) / 86400000);
      const expiring = daysLeft <= 1;

      const deletedDate = new Date(page.deletedAt).toLocaleDateString(
        page.lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium' }
      );

      const item = document.createElement('div');
      item.className = 'trash-item';
      item.innerHTML = `
        <div class="trash-item-icon">${page.icon || '📄'}</div>
        <div class="trash-item-info">
          <div class="trash-item-title">${page.title || t('placeholder.page')}</div>
          <div class="trash-item-meta">
            ${page.deletedBy ? t('trash.by').replace('{author}', page.deletedBy) + ' ' : ''}
            ${t('trash.on')} ${deletedDate}
          </div>
        </div>
        <div class="trash-item-days${expiring ? ' expiring' : ''}">
          ${t('trash.days.left').replace('{n}', daysLeft)}
        </div>
        <div class="trash-item-actions">
          <button class="btn btn-secondary btn-sm" data-action="restore">${t('trash.restore')}</button>
          <button class="btn btn-danger btn-sm" data-action="delete-forever">${t('trash.delete.forever')}</button>
        </div>
      `;

      item.querySelector('[data-action="restore"]').addEventListener('click', () => {
        this._restoreFromTrash(page.id);
      });
      item.querySelector('[data-action="delete-forever"]').addEventListener('click', () => {
        const msg = t('trash.forever.confirm').replace('{title}', page.title || t('placeholder.page'));
        if (window.confirm(msg)) {
          this._deleteForever(page.id);
        }
      });

      listEl.appendChild(item);
    });
  }

  _restoreFromTrash(pageId) {
    const idx = this.data.trash.findIndex(p => p.id === pageId);
    if (idx === -1) return;
    const [page] = this.data.trash.splice(idx, 1);
    delete page.deletedAt;
    delete page.deletedBy;

    if (page.parentId && !this.data.pages.some(p => p.id === page.parentId)) {
      page.parentId = null;
    }

    this.data.pages.push(page);
    this._updateTrashBadge();
    this.pageManager.load(this.data.pages, page.id);
    this._exitSettingsView();
    this._loadPage(page.id);
    this._onContentUpdate();
    this._showToast('success', `📄 ${page.title || t('placeholder.page')}`);
  }

  _deleteForever(pageId) {
    this.data.trash = this.data.trash.filter(p => p.id !== pageId);
    this._updateTrashBadge();
    this._renderTrashList();
    this._onContentUpdate();
  }

  // ─── Sidebar ────────────────────────────────────

  _initTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    this._updateThemeUI(theme);
  }

  _toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    this._updateThemeUI(next);

    // Also update data
    if (this.data?.site) {
      this.data.site.theme = next;
    }
  }

  _updateThemeUI(theme) {
    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (label) {
      label.setAttribute('data-i18n', theme === 'dark' ? 'sidebar.theme.light' : 'sidebar.theme.dark');
      label.textContent = theme === 'dark' ? t('sidebar.theme.light') : t('sidebar.theme.dark');
    }
  }

  // ─── Icon Picker ──────────────────────────────

  _toggleIconPicker() {
    const picker = document.getElementById('icon-picker');
    if (picker.classList.contains('visible')) {
      picker.classList.remove('visible');
      return;
    }

    const icons = ['📄', '📝', '📖', '🎯', '🚀', '💡', '🔧', '📊', '🎨', '🌟',
      '👋', '🏠', '📚', '⭐', '🎮', '🎵', '📸', '🌍', '❤️', '🔥',
      '💻', '📱', '🎥', '🍕', '🌈', '🦄', '🐱', '🌸', '⚡', '🔮'];

    picker.innerHTML = '';
    icons.forEach(emoji => {
      const item = document.createElement('button');
      item.className = 'icon-picker-item';
      item.textContent = emoji;
      item.addEventListener('click', () => {
        const iconDisplay = document.getElementById('page-icon-display');
        if (iconDisplay) iconDisplay.textContent = emoji;
        picker.classList.remove('visible');
        this._onContentUpdate();
      });
      picker.appendChild(item);
    });

    // Position picker below the page icon in the header
    const iconEl = document.getElementById('page-icon-display');
    const rect = iconEl.getBoundingClientRect();
    picker.style.top = `${rect.bottom + 6}px`;
    picker.style.left = `${rect.left}px`;
    picker.style.right = 'auto';
    picker.classList.add('visible');
  }

  // ─── Settings View ─────────────────────────

  _showSettingsModal() {
    // Redirect to settings view (backward compatibility)
    this._showSettingsView('sync');
  }

  _loadGitHubSettings() {
    const settings = getGitHubSettings();
    const ownerEl = document.getElementById('github-owner');
    const repoEl = document.getElementById('github-repo');
    const branchEl = document.getElementById('github-branch');
    const tokenEl = document.getElementById('github-token');
    const usernameEl = document.getElementById('settings-username');
    if (ownerEl) ownerEl.value = settings.owner || '';
    if (repoEl) repoEl.value = settings.repo || '';
    if (branchEl) branchEl.value = settings.branch || 'main';
    if (tokenEl) tokenEl.value = settings.token || '';
    if (usernameEl) usernameEl.value = this._getUsername();
  }

  _onSettingsSaveClick() {
    const username = document.getElementById('settings-username').value.trim();
    if (username) {
      localStorage.setItem('teamflow_username', username);
      this._updateSidebarUser();
    }

    const token = document.getElementById('github-token').value.trim();
    if (token) {
      document.getElementById('token-security-modal').classList.add('visible');
    } else {
      this._continueSavingGitHubSettings();
    }
  }

  _continueSavingGitHubSettings() {
    const settings = {
      owner: document.getElementById('github-owner').value.trim(),
      repo: document.getElementById('github-repo').value.trim(),
      branch: document.getElementById('github-branch').value.trim() || 'main',
      token: document.getElementById('github-token').value.trim()
    };
    saveGitHubSettings(settings);
    document.getElementById('token-security-modal').classList.remove('visible');
    this._showToast('success', t('toast.settings.saved', 'Settings saved!'));
  }

  // ─── Team Management ──────────────────────

  _getTeam() {
    if (!this.data.team) this.data.team = [];
    return this.data.team;
  }

  _addTeamMember(name, role) {
    if (!name) return;
    if (!this.data.team) this.data.team = [];
    this.data.team.push({ id: Date.now().toString(36), name, role: role || '' });
    saveToLocalStorage(this.data);
    this._renderTeamList();
    const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const safeName = name.replace(/[&<>"']/g, c => escapeMap[c]);
    this._showToast('success', `👥 ${safeName}`);
  }

  _removeTeamMember(id) {
    if (!this.data.team) return;
    this.data.team = this.data.team.filter(m => m.id !== id);
    saveToLocalStorage(this.data);
    this._renderTeamList();
  }

  _renderTeamList() {
    const listEl = document.getElementById('team-list');
    if (!listEl) return;
    const team = this._getTeam();

    if (team.length === 0) {
      listEl.innerHTML = `<div class="team-empty">${t('team.empty')}</div>`;
      return;
    }

    listEl.innerHTML = '';
    team.forEach(member => {
      const row = document.createElement('div');
      row.className = 'team-member-row';

      // Sanitize: use textContent instead of innerHTML to prevent XSS
      const initial = member.name ? member.name[0].toUpperCase() : '?';

      const avatar = document.createElement('div');
      avatar.className = 'team-member-avatar';
      avatar.textContent = initial;

      const info = document.createElement('div');
      info.className = 'team-member-info';

      const nameEl = document.createElement('div');
      nameEl.className = 'team-member-name';
      nameEl.textContent = member.name;

      const roleEl = document.createElement('div');
      roleEl.className = 'team-member-role';
      roleEl.textContent = member.role || t('team.role.default');

      info.appendChild(nameEl);
      info.appendChild(roleEl);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'team-member-remove';
      removeBtn.title = t('team.remove');
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', () => {
        this._removeTeamMember(member.id);
      });

      row.appendChild(avatar);
      row.appendChild(info);
      row.appendChild(removeBtn);
      listEl.appendChild(row);
    });
  }

  // ─── Toast Notifications ──────────────────────

  _showToast(type, message) {
    const container = document.getElementById('toast-container');

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  // ─── User Identity ────────────────────────────

  _getUsername() {
    return localStorage.getItem('teamflow_username') || '';
  }

  _initUser() {
    const username = this._getUsername();
    if (!username) {
      // First-time: show welcome modal
      this._showWelcomeModal();
    } else {
      this._updateSidebarUser();
    }
  }

  _showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.add('visible');
    // Re-apply translations so placeholder is correct
    applyTranslations();

    document.getElementById('welcome-confirm-btn').addEventListener('click', () => {
      const nameInput = document.getElementById('welcome-username');
      nameInput.dispatchEvent(new Event('input')); // dispatch event to trigger input listeners (e.g. autofill)
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return;
      }
      localStorage.setItem('teamflow_username', name);
      modal.classList.remove('visible');
      this._updateSidebarUser();
      this._showToast('success', `👋 ${name}`);
    });

    // Allow Enter to confirm
    document.getElementById('welcome-username').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('welcome-confirm-btn').click();
    });
  }

  _updateSidebarUser() {
    const username = this._getUsername();
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const userBtn = document.getElementById('sidebar-user-btn');

    if (avatarEl) {
      avatarEl.textContent = username ? username[0].toUpperCase() : '?';
    }
    if (nameEl) {
      nameEl.textContent = username || t('page.meta.anonymous');
    }
    // Ensure click to open settings
    if (userBtn && !userBtn._bound) {
      userBtn.addEventListener('click', () => this._showSettingsModal());
      userBtn._bound = true;
    }
  }

  _updatePageMeta(page) {
    const authorEl = document.getElementById('page-meta-author');
    const dateEl = document.getElementById('page-meta-date');
    const sepEl = document.querySelector('.page-meta-sep');

    if (!page.author && !page.createdAt) {
      // Legacy page: hide meta row
      authorEl.textContent = '';
      dateEl.textContent = '';
      if (sepEl) sepEl.style.display = 'none';
      return;
    }

    if (sepEl) sepEl.style.display = '';
    authorEl.textContent = page.author || t('page.meta.anonymous');

    if (page.createdAt) {
      const d = new Date(page.createdAt);
      const lang = page.lang || 'en';
      const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
      dateEl.textContent = d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } else {
      dateEl.textContent = '';
    }
  }

  _toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (window.innerWidth <= 768) {
      // Mobile: use open class + overlay
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    } else {
      const isCollapsed = sidebar.classList.contains('collapsed');
      if (isCollapsed) {
        // Expanding: restore saved width first, then remove collapsed class
        const savedWidth = localStorage.getItem('teamflow_sidebar_width');
        if (savedWidth) {
          sidebar.style.width = savedWidth + 'px';
        } else {
          sidebar.style.width = ''; // fall back to CSS variable default
        }
        sidebar.classList.remove('collapsed');
      } else {
        // Collapsing: clear inline width so CSS class can set width: 0
        sidebar.style.width = '';
        sidebar.classList.add('collapsed');
      }
    }
  }

  // ─── UI Event Binding ─────────────────────────

  _bindUIEvents() {
    // Site Name and Breadcrumb Root click to return to landing page
    document.getElementById('site-name')?.addEventListener('click', () => {
      window.location.href = 'landing.html';
    });

    document.getElementById('breadcrumb-root')?.addEventListener('click', () => {
      window.location.href = 'landing.html';
    });

    // Save buttons
    document.getElementById('save-local-btn').addEventListener('click', () => this._saveToLocal());
    document.getElementById('save-github-btn').addEventListener('click', () => this._saveToGitHub());

    // Theme toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', () => this._toggleTheme());

    // Add page
    document.getElementById('add-page-btn').addEventListener('click', () => this._addPage());

    // Favorite toggle button in page header
    document.getElementById('favorite-toggle-btn')?.addEventListener('click', () => {
      const page = this.pageManager.getActivePage();
      if (page) {
        this._togglePageFavorite(page.id);
      }
    });

    // Add to favorites button in sidebar header
    document.getElementById('add-fav-btn')?.addEventListener('click', () => {
      const page = this.pageManager.getActivePage();
      if (page) {
        this._togglePageFavorite(page.id, true);
      }
    });



    // Quick add page button
    document.getElementById('quick-add-page-btn')?.addEventListener('click', () => this._addPage());

    // Quick import button
    document.getElementById('quick-import-btn')?.addEventListener('click', () => {
      document.getElementById('import-file-input')?.click();
    });

    // Import file handler
    document.getElementById('import-file-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fileName = file.name;
      const isJson = fileName.toLowerCase().endsWith('.json');
      const isMd = fileName.toLowerCase().endsWith('.md');
      const isImage = file.type.startsWith('image/');

      const parseMarkdownToBlocks = (text) => {
        const lines = text.split(/\r?\n/);
        const blocks = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('# ')) {
            blocks.push({
              id: generateId(),
              type: 'heading',
              level: 1,
              content: trimmed.substring(2).trim()
            });
          } else if (trimmed.startsWith('## ')) {
            blocks.push({
              id: generateId(),
              type: 'heading',
              level: 2,
              content: trimmed.substring(3).trim()
            });
          } else if (trimmed.startsWith('### ')) {
            blocks.push({
              id: generateId(),
              type: 'heading',
              level: 3,
              content: trimmed.substring(4).trim()
            });
          } else if (trimmed === '---') {
            blocks.push({
              id: generateId(),
              type: 'divider'
            });
          } else {
            const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
              blocks.push({
                id: generateId(),
                type: 'image',
                src: imgMatch[2],
                caption: imgMatch[1]
              });
            } else {
              blocks.push({
                id: generateId(),
                type: 'paragraph',
                content: trimmed
              });
            }
          }
        }
        if (blocks.length === 0) {
          blocks.push({
            id: generateId(),
            type: 'paragraph',
            content: ''
          });
        }
        return blocks;
      };

      const reader = new FileReader();

      if (isJson) {
        reader.onload = (ev) => {
          try {
            const imported = JSON.parse(ev.target.result);
            if (!imported || !Array.isArray(imported.pages) || imported.pages.length === 0) {
              throw new Error('Invalid import file: missing or empty pages array');
            }
            imported.trash = Array.isArray(imported.trash) ? imported.trash : [];
            imported.team = Array.isArray(imported.team) ? imported.team : [];

            this.data = imported;
            const firstPageId = this.data.pages[0].id;
            this.pageManager.load(this.data.pages, firstPageId);
            this._loadPage(firstPageId);
            saveToLocalStorage(this.data);
            this._updatePageCount();
            this._updateTrashBadge();
            this._showToast('success', t('toast.import.success'));
          } catch (err) {
            this._showToast('error', t('toast.import.failed', { message: err.message }));
          }
        };
        reader.readAsText(file);
      } else if (isMd) {
        reader.onload = (ev) => {
          try {
            const text = ev.target.result;
            const blocks = parseMarkdownToBlocks(text);
            const title = file.name.replace(/\.md$/i, '') || 'Untitled Markdown';
            const now = new Date().toISOString();
            const newPage = {
              id: generateId(),
              parentId: null,
              title,
              icon: '📄',
              lang: getLang(),
              author: this._getUsername(),
              createdAt: now,
              updatedAt: now,
              blocks: blocks
            };
            this.data.pages.push(newPage);
            this.pageManager.load(this.data.pages, newPage.id);
            this._switchPage(newPage.id);
            saveToLocalStorage(this.data);
            this._updatePageCount();
            this._showToast('success', t('toast.import.success'));
          } catch (err) {
            this._showToast('error', t('toast.import.failed', { message: err.message }));
          }
        };
        reader.readAsText(file);
      } else if (isImage) {
        // Size check
        if (file.size > 5 * 1024 * 1024) {
          this._showToast('error', t('toast.image.too_large'));
          e.target.value = '';
          return;
        }
        reader.onload = (ev) => {
          try {
            const rawDataUrl = ev.target.result;

            const finalize = (dataUrl) => {
              const title = file.name.replace(/\.[^/.]+$/, "") || 'Untitled Image';
              const now = new Date().toISOString();
              const imageBlock = {
                id: generateId(),
                type: 'image',
                src: dataUrl,
                caption: title
              };
              const newPage = {
                id: generateId(),
                parentId: null,
                title,
                icon: '🖼️',
                lang: getLang(),
                author: this._getUsername(),
                createdAt: now,
                updatedAt: now,
                blocks: [
                  imageBlock,
                  {
                    id: generateId(),
                    type: 'paragraph',
                    content: ''
                  }
                ]
              };
              this.data.pages.push(newPage);
              this.pageManager.load(this.data.pages, newPage.id);
              this._switchPage(newPage.id);
              saveToLocalStorage(this.data);
              this._updatePageCount();
              this._showToast('success', t('toast.import.success'));
            };

            // Compress if above 500KB
            if (file.size > 500 * 1024) {
              const img = new Image();
              img.onload = () => {
                const scale = Math.min(1, 1600 / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                finalize(canvas.toDataURL('image/jpeg', 0.7));
                this._showToast('info', t('toast.image.compressed'));
              };
              img.onerror = () => finalize(rawDataUrl);
              img.src = rawDataUrl;
            } else {
              finalize(rawDataUrl);
            }
          } catch (err) {
            this._showToast('error', t('toast.import.failed', { message: err.message }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        this._showToast('error', 'Unsupported file type.');
      }
      e.target.value = '';
    });

    // Search clear button
    document.getElementById('search-clear-btn')?.addEventListener('click', () => {
      const searchInput = document.getElementById('page-search');
      if (searchInput) {
        searchInput.value = '';
        this.pageManager.search('');
      }
    });



    // Page title editing
    const titleEl = document.getElementById('page-title');
    titleEl.addEventListener('input', () => {
      this._onContentUpdate();
      const page = this.pageManager.getActivePage();
      const lang = page ? (page.lang || 'en') : 'en';
      document.getElementById('breadcrumb-page').textContent = titleEl.textContent || tLang('placeholder.page', lang);
    });
    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Focus first block
        const firstBlock = document.querySelector('#editor .block .block-content');
        if (firstBlock) firstBlock.focus();
      }
    });

    // Icon picker — triggered by clicking the page icon in the header
    document.getElementById('page-icon-display').addEventListener('click', () => this._toggleIconPicker());
    document.getElementById('page-icon-display').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleIconPicker(); }
    });

    // Settings view — nav tabs and back button
    document.getElementById('settings-btn').addEventListener('click', () => this._showSettingsView('sync'));
    document.getElementById('settings-back-btn')?.addEventListener('click', () => this._exitSettingsView());
    document.getElementById('settings-save-btn').addEventListener('click', () => this._onSettingsSaveClick());

    // Settings tab switching
    document.querySelectorAll('.settings-nav-item').forEach(btn => {
      btn.addEventListener('click', () => this._switchSettingsTab(btn.dataset.tab));
    });

    // Preference cards — theme
    document.querySelectorAll('[data-theme-choice]').forEach(card => {
      card.addEventListener('click', () => {
        const theme = card.dataset.themeChoice;
        document.documentElement.setAttribute('data-theme', theme);
        setTheme(theme);
        this._updateThemeUI(theme);
        this._updatePrefCards();
        if (this.data?.site) this.data.site.theme = theme;
      });
    });

    // Preference cards — language
    document.querySelectorAll('[data-lang-choice]').forEach(card => {
      card.addEventListener('click', () => {
        const lang = card.dataset.langChoice;
        localStorage.setItem('teamflow_lang', lang);
        setLang(lang);
        this._updatePrefCards();
      });
    });

    // Team add
    document.getElementById('team-add-btn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('team-name-input');
      const roleInput = document.getElementById('team-role-input');
      this._addTeamMember(nameInput.value.trim(), roleInput.value.trim());
      nameInput.value = '';
      roleInput.value = '';
    });

    // Token security modal
    document.getElementById('token-security-cancel-btn').addEventListener('click', () => {
      document.getElementById('token-security-modal').classList.remove('visible');
    });
    document.getElementById('token-security-confirm-btn').addEventListener('click', () => {
      this._continueSavingGitHubSettings();
    });

    // Sidebar toggle (mobile)
    document.getElementById('topbar-menu-btn').addEventListener('click', () => this._toggleSidebar());
    document.getElementById('sidebar-overlay').addEventListener('click', () => this._toggleSidebar());
    document.getElementById('sidebar-collapse-btn').addEventListener('click', () => this._toggleSidebar());

    // Page search
    document.getElementById('page-search').addEventListener('input', (e) => {
      this.pageManager.search(e.target.value);
    });

    // Close icon picker on outside click
    document.addEventListener('click', (e) => {
      const picker = document.getElementById('icon-picker');
      const iconEl = document.getElementById('page-icon-display');
      if (!picker.contains(e.target) && !iconEl.contains(e.target)) {
        picker.classList.remove('visible');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this._saveToLocal();
      }
    });

    // ─── Sidebar resize ───────────────────────────
    const resizeHandle = document.getElementById('sidebar-resize-handle');
    const sidebar = document.getElementById('sidebar');
    let isResizing = false, resizeStartX = 0, resizeStartWidth = 0;
    let rafPending = false;

    const savedWidth = localStorage.getItem('teamflow_sidebar_width');
    if (savedWidth && sidebar) sidebar.style.width = savedWidth + 'px';

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizeStartX = e.clientX;
      resizeStartWidth = sidebar.getBoundingClientRect().width;
      resizeHandle.classList.add('dragging');
      sidebar.classList.add('resizing');        // disable width transition while dragging
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isResizing || rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const w = Math.min(480, Math.max(160, resizeStartWidth + e.clientX - resizeStartX));
        sidebar.style.width = w + 'px';
      });
    });
    document.addEventListener('mouseup', () => {
      if (!isResizing) return;
      isResizing = false;
      rafPending = false;
      resizeHandle.classList.remove('dragging');
      sidebar.classList.remove('resizing');    // re-enable smooth transition
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('teamflow_sidebar_width', sidebar.getBoundingClientRect().width);
    });
  }
}

// ─── Bootstrap ──────────────────────────────────

const app = new App();
app.init().catch(err => {
  console.error('Failed to initialize TeamFlow:', err);
});

```


### 8.14 `tests/assert.js` (mini Jest-like test framework, 96 lines)

**File**: `tests/assert.js`

```javascript
export class AssertError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertError';
    this.expected = expected;
    this.actual = actual;
  }
}

export const expect = (actual) => ({
  toBe(expected) {
    if (actual !== expected) {
      throw new AssertError(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`, expected, actual);
    }
  },
  toEqual(expected) {
    const aStr = JSON.stringify(actual);
    const eStr = JSON.stringify(expected);
    if (aStr !== eStr) {
      throw new AssertError(`Expected equality:\n${eStr}\nbut got:\n${aStr}`, expected, actual);
    }
  },
  toThrow(expectedText) {
    let threw = false;
    let errorMsg = '';
    try {
      actual();
    } catch (e) {
      threw = true;
      errorMsg = e.message;
    }
    if (!threw) {
      throw new AssertError(`Expected function to throw, but it did not.`, 'Error thrown', 'No error');
    }
    if (expectedText && !errorMsg.includes(expectedText)) {
      throw new AssertError(`Expected error message to contain "${expectedText}", but got "${errorMsg}"`, expectedText, errorMsg);
    }
  },
  toBeNull() {
    if (actual !== null) {
      throw new AssertError(`Expected null but got ${JSON.stringify(actual)}`, null, actual);
    }
  },
  toBeTruthy() {
    if (!actual) {
      throw new AssertError(`Expected truthy value but got ${JSON.stringify(actual)}`, true, actual);
    }
  },
  toBeFalsy() {
    if (actual) {
      throw new AssertError(`Expected falsy value but got ${JSON.stringify(actual)}`, false, actual);
    }
  }
});

export const suites = [];
let currentSuite = null;

export function describe(name, fn) {
  const suite = { name, specs: [] };
  suites.push(suite);
  currentSuite = suite;
  fn();
  currentSuite = null;
}

export function it(name, fn) {
  if (!currentSuite) {
    throw new Error('it() must be called inside describe()');
  }
  currentSuite.specs.push({ name, fn });
}

export async function runTests() {
  const results = [];
  for (const suite of suites) {
    const suiteResult = { name: suite.name, specs: [] };
    results.push(suiteResult);
    for (const spec of suite.specs) {
      try {
        await spec.fn();
        suiteResult.specs.push({ name: spec.name, status: 'pass' });
      } catch (err) {
        suiteResult.specs.push({
          name: spec.name,
          status: 'fail',
          message: err.message,
          stack: err.stack,
          expected: err.expected,
          actual: err.actual
        });
      }
    }
  }
  return results;
}

```


### 8.15 `tests/runner.html` (test runner UI, 145 lines)

**File**: `tests/runner.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TeamFlow Wiki — Automated Test Suites</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="runner.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="header-main">
        <h1>⚡ TeamFlow Wiki Test Runner</h1>
        <p class="subtitle">Vanilla JS Automated Integration & Unit Testing System</p>
      </div>
      <button class="run-btn" id="run-btn">Run Tests</button>
    </header>

    <div class="summary-cards">
      <div class="card card-total">
        <span class="card-num" id="stat-total">0</span>
        <span class="card-label">Total Tests</span>
      </div>
      <div class="card card-passed">
        <span class="card-num" id="stat-passed">0</span>
        <span class="card-label">Passed</span>
      </div>
      <div class="card card-failed">
        <span class="card-num" id="stat-failed">0</span>
        <span class="card-label">Failed</span>
      </div>
      <div class="card card-status">
        <span class="card-num" id="stat-percent">0%</span>
        <span class="card-label">Success Rate</span>
      </div>
    </div>

    <main class="test-results" id="test-results">
      <div class="loading-status">Click "Run Tests" to start testing...</div>
    </main>
  </div>

  <script type="module">
    import { runTests } from './assert.js';

    // Import specs to register them
    import './specs/i18n.spec.js';
    import './specs/storage.spec.js';
    import './specs/editor.spec.js';

    const runBtn = document.getElementById('run-btn');
    const resultsEl = document.getElementById('test-results');

    async function execute() {
      resultsEl.innerHTML = '<div class="loading-status">Running test suites...</div>';
      runBtn.disabled = true;

      // Small delay for loading state rendering
      await new Promise(r => setTimeout(r, 100));

      const startTime = performance.now();
      const results = await runTests();
      const endTime = performance.now();
      const elapsed = ((endTime - startTime) / 1000).toFixed(3);

      runBtn.disabled = false;
      resultsEl.innerHTML = '';

      let total = 0;
      let passed = 0;
      let failed = 0;

      results.forEach(suite => {
        const suiteEl = document.createElement('div');
        suiteEl.className = 'suite';

        const suiteHeader = document.createElement('div');
        suiteHeader.className = 'suite-header';
        suiteHeader.innerHTML = `<h3>📂 Suite: ${suite.name}</h3>`;
        suiteEl.appendChild(suiteHeader);

        const specsList = document.createElement('div');
        specsList.className = 'specs-list';

        suite.specs.forEach(spec => {
          total++;
          const specEl = document.createElement('div');
          specEl.className = `spec spec-${spec.status}`;

          const header = document.createElement('div');
          header.className = 'spec-header';

          const icon = spec.status === 'pass' ? '✅' : '❌';
          header.innerHTML = `
            <span class="spec-icon">${icon}</span>
            <span class="spec-name">${spec.name}</span>
            <span class="badge badge-${spec.status}">${spec.status.toUpperCase()}</span>
          `;
          specEl.appendChild(header);

          if (spec.status === 'pass') {
            passed++;
          } else {
            failed++;
            const details = document.createElement('div');
            details.className = 'spec-details';
            details.innerHTML = `
              <p class="error-msg"><strong>Error:</strong> ${spec.message}</p>
              ${spec.stack ? `<pre class="error-stack">${spec.stack}</pre>` : ''}
            `;
            specEl.appendChild(details);
          }

          specsList.appendChild(specEl);
        });

        suiteEl.appendChild(specsList);
        resultsEl.appendChild(suiteEl);
      });

      // Update statistics
      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-passed').textContent = passed;
      document.getElementById('stat-failed').textContent = failed;
      
      const percent = total > 0 ? Math.round((passed / total) * 100) : 0;
      const percentEl = document.getElementById('stat-percent');
      percentEl.textContent = `${percent}%`;

      const summaryFooter = document.createElement('div');
      summaryFooter.className = 'summary-footer';
      summaryFooter.textContent = `Completed ${total} tests in ${elapsed}s.`;
      resultsEl.appendChild(summaryFooter);
    }

    runBtn.addEventListener('click', execute);

    // Auto-run on load
    execute();
  </script>
</body>
</html>

```


### 8.16 `tests/runner.css` (test runner styles, 252 lines)

**File**: `tests/runner.css`

```css
/* Modern stylesheet for Test Runner Dashboard */
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-blue: #38bdf8;
  
  --color-pass: #10b981;
  --color-pass-bg: rgba(16, 185, 129, 0.1);
  --color-fail: #ef4444;
  --color-fail-bg: rgba(239, 68, 68, 0.1);
  
  --border-radius: 12px;
  --transition-normal: all 0.25s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, sans-serif;
  padding: 40px 20px;
  line-height: 1.6;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 24px;
}

.header h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.run-btn {
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  color: #fff;
  border: none;
  padding: 12px 28px;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
  transition: var(--transition-normal);
}

.run-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(56, 189, 248, 0.4);
}

.run-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  background-color: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: var(--transition-normal);
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.card-num {
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.card-label {
  color: var(--text-secondary);
  font-size: 0.88rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-total .card-num { color: #f8fafc; }
.card-passed .card-num { color: var(--color-pass); }
.card-failed .card-num { color: var(--color-fail); }
.card-status .card-num { color: #e879f9; }

/* Test results */
.loading-status {
  text-align: center;
  padding: 60px;
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-size: 1.1rem;
  border: 1px dashed rgba(255, 255, 255, 0.08);
}

.suite {
  background-color: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius);
  margin-bottom: 30px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.suite-header {
  background-color: rgba(255, 255, 255, 0.02);
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suite-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
}

.specs-list {
  padding: 10px 0;
}

.spec {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
}

.spec:last-child {
  border-bottom: none;
}

.spec-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spec-icon {
  font-size: 1.1rem;
}

.spec-name {
  flex: 1;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

.badge-pass {
  background-color: var(--color-pass-bg);
  color: var(--color-pass);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-fail {
  background-color: var(--color-fail-bg);
  color: var(--color-fail);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Fail details */
.spec-details {
  margin-top: 14px;
  margin-left: 28px;
  padding: 16px;
  background-color: rgba(239, 68, 68, 0.05);
  border-left: 3px solid var(--color-fail);
  border-radius: 4px;
}

.error-msg {
  color: #fca5a5;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.error-stack {
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 4px;
}

/* Footer info */
.summary-footer {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-top: 24px;
}

```


### 8.17 `tests/specs/editor.spec.js` (7 editor tests)

**File**: `tests/specs/editor.spec.js`

```javascript
import { describe, it, expect } from '../assert.js';
import { BlockEditor, processImageFile } from '../../js/editor.js';

function createTestEditor(options = {}) {
  return new BlockEditor({
    editorEl: document.createElement('div'),
    slashMenuEl: document.createElement('div'),
    floatingToolbarEl: document.createElement('div'),
    ...options
  });
}

describe('BlockEditor Engine', () => {
  it('should initialize correctly with empty blocks', () => {
    let updated = false;
    const editor = createTestEditor({
      onUpdate: () => { updated = true; }
    });

    expect(editor.blocks.length).toBe(0);
    expect(editor.editorEl.children.length).toBe(0);
  });

  it('should support loading and retrieving blocks', () => {
    const editor = createTestEditor();

    const initialBlocks = [
      { id: 'b1', type: 'paragraph', content: 'Hello' },
      { id: 'b2', type: 'heading', level: 2, content: 'Title' }
    ];

    editor.load(initialBlocks);
    expect(editor.blocks.length).toBe(2);
    expect(editor.editorEl.children.length).toBe(2);

    const retrieved = editor.getData();
    expect(retrieved.length).toBe(2);
    expect(retrieved[0].content).toBe('Hello');
  });

  it('should support adding and deleting blocks', () => {
    let updated = false;
    const editor = createTestEditor({
      onUpdate: () => { updated = true; }
    });

    const b1 = editor.addBlockAfter(null, 'paragraph', { content: 'First' });
    expect(editor.blocks.length).toBe(1);
    expect(updated).toBeTruthy();

    updated = false;
    const b2 = editor.addBlockAfter(b1.id, 'heading', { content: 'Second', level: 2 });
    expect(editor.blocks.length).toBe(2);
    expect(editor.blocks[1].id).toBe(b2.id);
    expect(updated).toBeTruthy();

    updated = false;
    // Delete b1
    editor.deleteBlock(b1.id);
    expect(editor.blocks.length).toBe(1);
    expect(editor.blocks[0].id).toBe(b2.id);
    expect(updated).toBeTruthy();
  });

  it('should prevent deleting the last block', () => {
    const editor = createTestEditor();
    editor.addBlockAfter(null, 'paragraph', { content: 'Only block' });
    
    expect(editor.blocks.length).toBe(1);
    editor.deleteBlock(editor.blocks[0].id);
    // Should NOT delete if length is <= 1
    expect(editor.blocks.length).toBe(1);
  });

  it('should support changing block types', () => {
    const editor = createTestEditor();
    const b = editor.addBlockAfter(null, 'paragraph', { content: 'Convert me' });

    editor.changeBlockType(b.id, 'heading', 3);
    expect(editor.blocks[0].type).toBe('heading');
    expect(editor.blocks[0].level).toBe(3);

    editor.changeBlockType(b.id, 'paragraph');
    expect(editor.blocks[0].type).toBe('paragraph');
    expect(editor.blocks[0].level).toBe(undefined);
  });

  it('should support reordering blocks via mock drag and drop', () => {
    const editor = createTestEditor();

    const b1 = editor.addBlockAfter(null, 'paragraph', { content: 'Block 1' });
    const b2 = editor.addBlockAfter(b1.id, 'paragraph', { content: 'Block 2' });

    expect(editor.blocks[0].id).toBe(b1.id);
    expect(editor.blocks[1].id).toBe(b2.id);

    // Simulate dragging b1 and dropping it below b2
    editor.draggedBlockId = b1.id;

    const dummyTargetEl = document.createElement('div');
    dummyTargetEl.className = 'block';
    dummyTargetEl.dataset.id = b2.id;
    // Mock getBoundingClientRect
    dummyTargetEl.getBoundingClientRect = () => ({
      top: 100,
      height: 40
    });

    const mockDropEvent = {
      preventDefault: () => {},
      target: dummyTargetEl,
      clientY: 130 // Below midpoint (100 + 40/2 = 120) -> insertAfter
    };

    editor._onDrop(mockDropEvent);

    // Now b2 should be first, and b1 should be second
    expect(editor.blocks[0].id).toBe(b2.id);
    expect(editor.blocks[1].id).toBe(b1.id);
  });

  it('should reject files exceeding MAX_IMAGE_SIZE (5MB)', async () => {
    // Generate a mock File object exceeding 5MB
    const largeBlob = new Blob([new Uint8Array(5.5 * 1024 * 1024)]);
    const largeFile = new File([largeBlob], 'too_large.png', { type: 'image/png' });

    const result = await processImageFile(largeFile);
    expect(result.error).toBeTruthy();
    expect(result.dataUrl).toBeFalsy();
  });
});

```


### 8.18 `tests/specs/i18n.spec.js` (2 i18n tests)

**File**: `tests/specs/i18n.spec.js`

```javascript
import { describe, it, expect } from '../assert.js';
import { translations } from '../../js/i18n.js';

describe('i18n completeness', () => {
  it('should have matching keys in en and zh', () => {
    const enKeys = Object.keys(translations.en).sort();
    const zhKeys = Object.keys(translations.zh).sort();

    // Check English to Chinese
    for (const key of enKeys) {
      if (!zhKeys.includes(key)) {
        throw new Error(`Translation key "${key}" is missing in "zh" locale`);
      }
    }

    // Check Chinese to English
    for (const key of zhKeys) {
      if (!enKeys.includes(key)) {
        throw new Error(`Translation key "${key}" is missing in "en" locale`);
      }
    }
  });

  it('should not have empty translation strings', () => {
    for (const lang of ['en', 'zh']) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(typeof value === 'string').toBeTruthy();
        if (value.trim().length === 0) {
          throw new Error(`Translation key "${key}" in "${lang}" is empty`);
        }
      }
    }
  });
});

```


### 8.19 `tests/specs/storage.spec.js` (4 storage tests)

**File**: `tests/specs/storage.spec.js`

```javascript
import { describe, it, expect } from '../assert.js';
import { loadContent, saveToLocalStorage, clearCache, getTheme, setTheme } from '../../js/storage.js';
import { getGitHubSettings, saveGitHubSettings } from '../../js/github.js';

describe('Storage Module', () => {
  it('should successfully save and load content from localStorage', () => {
    clearCache();
    
    const testData = {
      site: { name: 'Test Wiki', theme: 'dark' },
      pages: [{ id: 'p1', title: 'Test Page', blocks: [] }]
    };

    const saveSuccess = saveToLocalStorage(testData);
    expect(saveSuccess).toBeTruthy();

    const stored = JSON.parse(localStorage.getItem('teamflow_content'));
    expect(stored.site.name).toBe('Test Wiki');
    expect(stored.pages[0].title).toBe('Test Page');
  });

  it('should fallback to default or fetched content on corrupted cached JSON', async () => {
    // Write corrupted JSON into storage
    localStorage.setItem('teamflow_content', 'invalid-json-{');

    // loadContent should handle JSON.parse exception and fallback to fetching or default
    const content = await loadContent();
    expect(content).toBeTruthy();
    expect(typeof content.site).toBe('object');
    expect(Array.isArray(content.pages)).toBeTruthy();
  });

  it('should save and retrieve theme preferences', () => {
    localStorage.removeItem('teamflow_theme');
    
    expect(getTheme()).toBe('light'); // default

    setTheme('dark');
    expect(getTheme()).toBe('dark');

    setTheme('light');
    expect(getTheme()).toBe('light');
  });

  it('should save and load GitHub settings config + token inside teamflow_github', () => {
    localStorage.removeItem('teamflow_github');

    const defaults = getGitHubSettings();
    expect(defaults.owner).toBe('');
    expect(defaults.repo).toBe('');
    expect(defaults.branch).toBe('main');
    expect(defaults.token).toBe('');

    const newSettings = {
      owner: 'test-owner',
      repo: 'test-repo',
      branch: 'dev',
      token: 'ghp_secret123'
    };

    saveGitHubSettings(newSettings);

    const loaded = getGitHubSettings();
    expect(loaded.owner).toBe('test-owner');
    expect(loaded.repo).toBe('test-repo');
    expect(loaded.branch).toBe('dev');
    expect(loaded.token).toBe('ghp_secret123');
  });
});

```


### 8.20 `.github/workflows/static.yml` (GitHub Pages deploy, 43 lines)

**File**: `.github/workflows/static.yml`

```yaml
# Simple workflow for deploying static content to GitHub Pages
name: Deploy static content to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Single deploy job since we're just deploying
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Upload entire repository
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5

```


### 8.21 `.gitignore`

**File**: `.gitignore`

```
# TeamFlow Wiki gitignore
.workbuddy/
dogfood-output/
node_modules/
.DS_Store
Thumbs.db

```


### 8.22 `LICENSE` (MIT)

**File**: `LICENSE`

```
MIT License

Copyright (c) 2026 NexMaker-Fab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```


---

## 9. Known Issues & Quirks

These are observations from reading the source — preserve them or fix them deliberately.

### 9.1 Bug: i18n key mismatch in `editor.js`

**Line 201** of `js/editor.js` uses `t('editor.add_block_below')`, but the i18n dictionary in `js/i18n.js` defines the key as `'editor.add.block'` (with a dot, not underscore, and a "block" not "block_below"). The `t()` function returns the key itself when missing, so the tooltip shows literal "editor.add_block_below" instead of the translated text.

**Fix options**:
- Change the source to use the existing key: `t('editor.add.block')`
- Or add `'editor.add_block_below': 'Add block below'` to both `en` and `zh` dictionaries

### 9.2 `document.execCommand` is deprecated

`editor.js` uses `document.execCommand('bold' | 'italic' | 'underline')` in `_executeToolbarCommand`. These commands are deprecated in modern browsers but still work in practice. If you need long-term support, replace with the modern alternative: use `Selection.getRangeAt()` + `Range.surroundContents()` with custom `<b>`, `<i>`, `<u>` elements.

### 9.3 No data integrity check on import

`app.js` `_bindUIEvents()` import handler trusts the imported JSON's `pages` array but does not validate block structure. A malformed file could crash the editor. Add schema validation (e.g., with Zod or hand-written) before merging.

### 9.4 Image data lives in `content.json`

When you save a large image as a base64 data URL, the entire `content.json` bloats. This makes GitHub syncing slow and uses localStorage quota (~5–10 MB). Consider:
- Uploading to a separate image host (e.g., GitHub repo's `assets/` folder via Contents API)
- Using IndexedDB instead of localStorage for binary data
- Compressing more aggressively (lower quality / smaller max width)

### 9.5 No undo/redo

The current implementation has no undo stack. Every change is committed to `data` immediately. If you fork this, consider implementing a Command pattern or a simple snapshot-based undo.

### 9.6 GitHub sync overwrites without conflict detection

`saveToGitHub` always uses the latest local version. If two users edit the same file simultaneously, last-write-wins. To fix: compare `sha` from a recent `GET` before pushing, and prompt the user if there's a conflict.

### 9.7 No CSP for inline scripts in `app.html`

`style-src 'unsafe-inline'` is allowed because `index.html` line 7 has inline styles in the page header. This is intentional for prototyping. For a production deployment, consider moving inline styles to the CSS file and removing `'unsafe-inline'`.

---

## 10. Replication Priority Recommendations

If you're a coding agent replicating this project, here's the recommended build order to maximize early validation:

### Phase 1 — Skeleton (verify static page works) — ~30 min
1. Copy `index.html` (redirect)
2. Copy `app.html` (HTML structure only — JS will fail to load)
3. Copy `css/style.css` (don't worry if it doesn't fully work yet)
4. Copy `data/content.json` (so `loadContent()` doesn't fail)
5. **Test**: Open `app.html` — page should render with empty/broken JS state

### Phase 2 — Data & i18n (~30 min)
6. Copy `js/storage.js`
7. Copy `js/i18n.js` (verbatim — all 90 keys in both en and zh)
8. **Test**: Open browser console — `loadContent()` should return data; `t('save.local')` should return English

### Phase 3 — Core editor (~1 hour)
9. Copy `js/editor.js`
10. Copy `js/pages.js`
11. Copy `js/github.js`
12. Wire up `js/app.js` (import everything, initialize)
13. **Test**:
    - Click `app.html` (via redirect from index.html)
    - Welcome modal appears
    - Enter name → editor loads with `data/content.json` pages
    - Click a block, type text — should auto-save after 1s
    - Press `/` in an empty block — slash menu should appear
    - Drag a block to reorder — should work

### Phase 4 — Polish (~30 min)
14. Copy `js/landing.js`, `css/landing.css`, `landing.html`
15. Copy `tests/`
16. Copy `.github/workflows/static.yml`
17. **Test**:
    - Open `tests/runner.html` — should run 13 tests, all pass
    - Push to GitHub — should auto-deploy to Pages
    - Configure GitHub sync — should push `data/content.json` to your repo

### Phase 5 — Customize
18. Replace brand name in all 6 places (see Step 3 of Section 6)
19. Replace i18n dictionary with your own translations
20. Add custom block types (e.g., `todo`, `code`, `quote`) by extending `BlockEditor._createContentEl()` and `createBlock()`

---

## Appendix A: File Hashes (for verification)

If you want to verify a replicated file matches the source, use:

\`\`\`bash
# PowerShell:
Get-FileHash -Algorithm SHA256 -Path "js/app.js"

# Git Bash / WSL:
sha256sum js/app.js
\`\`\`

## Appendix B: How to Run the Tests

After copying `tests/`, open `tests/runner.html` in a browser (via the local server, not `file://`). It auto-runs and shows pass/fail counts.

Expected: 13 tests, 13 pass.

## Appendix C: Quick-Reference Public API

| Module | Exports | Purpose |
|---|---|---|
| `js/storage.js` | `generateId`, `loadContent`, `saveToLocalStorage`, `exportAsJson`, `clearCache`, `getTheme`, `setTheme` | Data I/O |
| `js/i18n.js` | `translations`, `getLang`, `setLang`, `t`, `tLang`, `applyTranslations`, `toggleLanguage` | i18n |
| `js/editor.js` | `BlockEditor` (class), `processImageFile` | Block editing engine |
| `js/pages.js` | `PageManager` (class) | Sidebar page list |
| `js/github.js` | `getGitHubSettings`, `saveGitHubSettings`, `isGitHubConfigured`, `saveToGitHub` | GitHub sync |
| `js/app.js` | (none — entry point) | App orchestrator |
| `js/landing.js` | (none — DOMContentLoaded) | Landing page |
| `tests/assert.js` | `expect`, `describe`, `it`, `runTests`, `AssertError`, `suites` | Test framework |

---

<div align="center">

**End of REPLICATE.md** — Generated for GPT-5.5 consumption.

Total source: 22 files / ~262 KB / 8,300+ lines.

Happy replicating! 🚀

</div>
