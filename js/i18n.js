/**
 * Internationalization (i18n) Module
 */

const translations = {
  en: {
    // Sidebar
    'search.placeholder': 'Search pages...',
    'sidebar.pages': 'Pages',
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
    'settings.token.hint': '⚠️ Token is stored in session only and cleared when you close the tab. Needs \'repo\' scope.',
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
    'btn.undo': 'Undo (Ctrl+Z)',
    'editor.add_block_below': 'Add block below'
  },
  zh: {
    // Sidebar
    'search.placeholder': '搜索页面...',
    'sidebar.pages': '所有页面',
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
    'settings.title': '设置 GitHub',
    'settings.owner': '仓库所有者 (Owner)',
    'settings.owner.hint': '您的 GitHub 用户名或组织名',
    'settings.repo': '仓库名称 (Repo)',
    'settings.repo.hint': '存储内容的 Github 仓库名',
    'settings.branch': '分支 (Branch)',
    'settings.token': 'GitHub 个人访问令牌 (PAT)',
    'settings.token.hint': '⚠️ Token 仅存放在当前会话(Session)中，关闭标签页即焚。需要包含 \'repo\' 权限。',
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
    'btn.undo': '撤销 (Ctrl+Z)',
    'editor.add_block_below': '在下方添加块'
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
    el.textContent = t(key);
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
