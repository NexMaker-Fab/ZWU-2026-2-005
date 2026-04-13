## 问题描述

首次打开页面弹出"Welcome to TeamFlow Wiki"对话框后，在输入用户名并点击 Get Started 按钮时，弹窗**无法关闭**。弹窗持续覆盖整个界面，导致下方所有功能（新建页面、主题切换、设置等）完全无法操作。

## 复现步骤

1. 清空浏览器 localStorage，或在新标签页首次访问网站
2. 在 Your Name 输入框中填写名称
3. 点击 Get Started 按钮
4. **观察**：弹窗没有关闭，页面被永久遮盖

## 预期行为

点击 Get Started 后弹窗应关闭，用户进入正常编辑界面。

## 根因分析

`app.js` 中 `_showWelcomeModal()` 的逻辑：

```js
document.getElementById('welcome-confirm-btn').addEventListener('click', () => {
  const nameInput = document.getElementById('welcome-username');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;  // 此处直接返回，没有关闭弹窗
  }
  ...
});
```

当某些输入方式未触发原生 `input` 事件时，`.value` 可能读取为空字符串，导致进入 `if (!name)` 分支永久阻塞。更重要的是：**弹窗没有关闭（×）按钮**，用户一旦遇到问题无法跳过。

## 建议修复

1. 给欢迎弹窗增加一个 × 关闭按钮，允许用户跳过（设置匿名身份）
2. 使用 `nameInput.addEventListener('input', ...)` 实时同步值

## 严重程度

**Critical** — 阻塞首次使用的全部功能

## 测试时间

2026-04-13，测试环境：本地 http://localhost:8765
