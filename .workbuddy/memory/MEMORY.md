# MEMORY.md — TeamFlow Wiki 项目长期记忆

## 项目基本信息
- **项目名**：TeamFlow Wiki（仿 Notion 的团队协作知识库）
- **仓库**：NexMaker-Fab/ZWU-2026-2-005（GitHub）
- **技术栈**：纯静态 HTML/CSS/JS，ES Modules，无框架
- **文件结构**：index.html、css/style.css、js/（app.js、editor.js、github.js、i18n.js、pages.js、storage.js）

## 用户工作方式
- 使用 antigravity IDE 开发
- 通过自然语言提示词驱动 AI 修改代码，但对 HTML/JS 理解较浅
- 需要"提示词翻译官"角色：将交互意图转为精准技术指令（明确"改什么"+"不动什么"）

## 已知 Bug（截至 2026-04-13）
| Issue | 严重度 | 状态 |
|-------|--------|------|
| #3 欢迎弹窗确认无法关闭 | Critical | 开放 |
| #4 中文模式新建页面标题英文化 | Medium | 开放 |
| #5 回收站视图图标面板未隐藏 | Low | 开放 |

## 已修复
- 新建页面双标题问题（之前 blocks 数组含 heading1，已修复为只含空 paragraph）

## 技术债
- innerHTML 插入用户内容存在 XSS 风险（renderTrashList、showDeleteConfirmModal）
- localStorage 无 QuotaExceededError 保护
- generateId() 熵值不足，考虑换 crypto.randomUUID()
- _purgExpiredTrash 拼写错误（少一个 e）

## 产品方向决策
- GitHub 同步：团队多人使用场景，Token 存 localStorage（需安全确认弹窗）
- 计划增加自动同步开关（默认关闭）
- 首次使用引导：欢迎弹窗完成后自动引导配置 GitHub
