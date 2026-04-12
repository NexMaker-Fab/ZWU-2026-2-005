# TeamFlow Wiki 📝

<div align="center">

一个轻量级、类 Notion 风格的团队协作 Wiki — 纯前端实现，支持中英双语，可一键部署至 GitHub Pages。

**[🌐 在线体验](https://nexmaker-fab.github.io/ZWU-2026-2-005/)** · **[📋 提交 Issue](https://github.com/NexMaker-Fab/ZWU-2026-2-005/issues)** · **[🔀 查看 PR](https://github.com/NexMaker-Fab/ZWU-2026-2-005/pulls)**

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-brightgreen?logo=github)
![Language](https://img.shields.io/badge/language-Vanilla%20JS-yellow?logo=javascript)
![i18n](https://img.shields.io/badge/i18n-EN%20%2F%20中文-blue)
![License](https://img.shields.io/github/license/NexMaker-Fab/ZWU-2026-2-005)

</div>

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 📄 **多页面管理** | 侧边栏展示所有页面，支持新建、删除、搜索 |
| ✏️ **块级编辑器** | 支持标题（H1/H2/H3）、段落、图片、分割线等内容块 |
| 🌐 **中英双语切换** | 顶栏 EN/中 一键切换，所有 UI 文字实时同步 |
| 🔒 **语言锁定** | 笔记创建时自动锁定当时的界面语言，避免内容混乱 |
| 🖼️ **图片支持** | 支持本地上传（base64）或粘贴外链 URL |
| 🖱️ **拖拽排序** | 块之间可通过拖拽手柄自由排序 |
| 🎨 **深色/浅色主题** | 支持深色模式，偏好自动保存 |
| 💾 **本地自动保存** | 编辑后 1 秒自动保存至浏览器 `localStorage` |
| 📥 **导出 JSON** | 一键将全部内容下载为 `content.json` |
| ☁️ **同步至 GitHub** | 通过 GitHub Personal Access Token 将内容直接推送至仓库 |
| 📱 **响应式布局** | 移动端侧边栏以抽屉形式展开，桌面端可折叠 |

---

## 🚀 快速开始

### 直接使用（GitHub Pages）

访问已部署的在线地址：**https://nexmaker-fab.github.io/ZWU-2026-2-005/**

无需安装任何环境，打开即用。

---

### 本地运行

**前置要求：** 任意静态文件服务器（推荐 `serve`）

```bash
# 1. 克隆仓库
git clone https://github.com/NexMaker-Fab/ZWU-2026-2-005.git
cd ZWU-2026-2-005

# 2. 安装并启动本地服务器（二选一）
npx serve . -l 3000
# 或
python -m http.server 3000

# 3. 在浏览器打开
# http://localhost:3000
```

> ⚠️ 由于使用了 ES Modules，不能直接双击 `index.html` 打开，必须通过本地服务器访问。

---

## 📁 项目结构

```
ZWU-2026-2-005/
├── index.html          # 应用入口，包含完整 HTML 骨架
├── css/
│   └── style.css       # 全局样式（含深色模式、响应式布局）
├── js/
│   ├── app.js          # 主程序：初始化、模块协调、UI 事件绑定
│   ├── editor.js       # 块级编辑器：创建/删除/拖拽/斜杠命令
│   ├── pages.js        # 页面管理器：侧边栏列表渲染与交互
│   ├── i18n.js         # 国际化模块：EN/ZH 字典、t() / tLang()
│   ├── storage.js      # 数据层：localStorage 读写、JSON 导出
│   └── github.js       # GitHub API：PAT 鉴权、内容推送
├── data/
│   └── content.json    # 初始示例内容（页面数据）
└── .github/
    └── workflows/      # GitHub Actions 自动部署配置
```

---

## 🛠️ 核心模块说明

### `i18n.js` — 国际化系统

提供完整的中英双语支持，核心 API：

```js
import { t, tLang, getLang, toggleLanguage } from './i18n.js';

t('save.local')              // 当前语言下的翻译
tLang('placeholder.page', 'zh')  // 指定语言翻译（用于锁定某页面的语言）
getLang()                    // 获取当前语言 'en' | 'zh'
toggleLanguage()             // 切换语言并触发 'language-changed' 事件
```

HTML 中通过 `data-i18n` 属性即可自动绑定翻译：

```html
<span data-i18n="sidebar.pages">Pages</span>
<input data-i18n-placeholder="search.placeholder" placeholder="Search...">
<button data-i18n-title="toolbar.bold" title="Bold">B</button>
```

### `editor.js` — 块级编辑引擎

支持的块类型：

| 类型 | 触发方式 |
|------|---------|
| `paragraph` 段落 | 默认，或 `/` 菜单选择 |
| `heading` 标题（H1/H2/H3） | `/` 菜单选择，或浮动工具栏 |
| `image` 图片 | `/` 菜单选择，支持上传/URL |
| `divider` 分割线 | `/` 菜单选择 |

在编辑器中输入 `/` 即可唤出命令菜单，选中文字后出现浮动格式工具栏。

### GitHub 同步

1. 点击右下角 **⚙️ 设置**
2. 填入仓库信息（Owner / Repo / Branch）
3. 填入 [Personal Access Token](https://github.com/settings/tokens)（需勾选 `repo` 权限）
4. 点击 **同步到 GitHub** 即可将 `content.json` 推送至仓库

> ⚠️ Token 仅存储在当前页面 Session 中，关闭标签页即自动清除，不会泄露。

---

## 🌐 国际化支持

TeamFlow Wiki 内置完整的中英双语系统：

- 点击右上角 **EN/中** 按钮即可切换语言
- 语言偏好自动保存至 `localStorage`
- **笔记内容语言锁定**：笔记在哪个语言环境下创建，其内容相关的文字（如"无标题"占位符）就保持该语言，不受全局切换影响
- 编辑器占位符（"输入 '/' 唤出命令菜单..."）跟随全局语言实时变化

---

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request！

```bash
# Fork 并克隆
git clone https://github.com/你的用户名/ZWU-2026-2-005.git

# 创建功能分支
git checkout -b feature/your-feature-name

# 提交变更
git add .
git commit -m "feat: 描述你的功能"

# 推送并创建 PR
git push origin feature/your-feature-name
```

**Commit 格式规范（Conventional Commits）：**

| 前缀 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `docs:` | 文档更新 |
| `style:` | 样式调整（不影响逻辑） |
| `refactor:` | 代码重构 |
| `chore:` | 构建/工具链相关 |

---

## 📄 开源协议

本项目基于 [MIT License](./LICENSE) 开源。

---

<div align="center">

Made with ❤️ by **ZWU-2026 Group 2 Team 5**

</div>
