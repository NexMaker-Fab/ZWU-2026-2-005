## 问题描述

进入回收站视图后，右侧浮动图标控件（page-props-panel）仍然显示在界面右侧。该控件用于更改当前页面的图标，但在回收站视图中没有"当前编辑页面"的概念，该控件在此场景下属于无效的界面噪音，影响视觉一致性。

## 复现步骤

1. 创建一个新页面
2. 点击该页面的 × 删除按钮，确认移入回收站
3. 点击侧边栏底部"回收站"按钮，进入回收站视图
4. **观察**：右侧仍然悬浮显示图标控件（显示当前图标按钮）

## 预期行为

进入回收站视图时，右侧图标控件应隐藏。

## 建议修复

在 `app.js` 的 `_showTrashView()` 函数中增加：

```js
document.getElementById('page-props-panel').style.display = 'none';
```

在 `_exitTrashView()` 函数中恢复：

```js
document.getElementById('page-props-panel').style.display = '';
```

## 严重程度

**Low** — 纯视觉问题，不影响功能

## 测试时间

2026-04-13，测试环境：本地 http://localhost:8765
