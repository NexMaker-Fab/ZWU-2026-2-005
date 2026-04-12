/**
 * App Module — Main orchestrator. Wires together all modules and DOM elements.
 */

import { loadContent, saveToLocalStorage, exportAsJson, generateId, getTheme, setTheme } from './storage.js';
import { BlockEditor } from './editor.js';
import { PageManager } from './pages.js';
import { getGitHubSettings, saveGitHubSettings, isGitHubConfigured, saveToGitHub } from './github.js';

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

    // Apply saved theme
    this._initTheme();

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
      onPageSelect: (pageId) => this._switchPage(pageId),
      onPageAdd: () => {},
      onPageDelete: (pageId) => this._deletePage(pageId)
    });

    // Load pages
    const firstPageId = this.data.pages[0]?.id;
    this.pageManager.load(this.data.pages, firstPageId);
    this._loadPage(firstPageId);

    // Bind all UI events
    this._bindUIEvents();

    // Load GitHub settings into form
    this._loadGitHubSettings();

    // Set site name
    const siteName = document.getElementById('site-name');
    if (siteName && this.data.site?.name) {
      siteName.textContent = this.data.site.name;
    }

    // Update save status
    this._setSaveStatus('Ready');
  }

  // ─── Page Management ──────────────────────────

  _loadPage(pageId) {
    const page = this.data.pages.find(p => p.id === pageId);
    if (!page) return;

    // Update page header
    const titleEl = document.getElementById('page-title');
    titleEl.textContent = page.title || '';

    const iconBtn = document.getElementById('page-icon-btn');
    iconBtn.textContent = page.icon || '📄';

    // Update breadcrumb
    document.getElementById('breadcrumb-page').textContent = page.title || 'Untitled';

    // Load blocks into editor
    this.editor.load(page.blocks || []);
  }

  _switchPage(pageId) {
    // Save current page's blocks first
    this._syncCurrentPage();

    // Load new page
    this._loadPage(pageId);
    this.pageManager.activePageId = pageId;
    this.pageManager.render();
  }

  _addPage() {
    const newPage = {
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
        content: ''
      }]
    };

    this.data.pages.push(newPage);
    this.pageManager.load(this.data.pages, newPage.id);
    this._loadPage(newPage.id);
    this._onContentUpdate();

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

  _deletePage(pageId) {
    const idx = this.data.pages.findIndex(p => p.id === pageId);
    if (idx === -1 || this.data.pages.length <= 1) return;

    this.data.pages.splice(idx, 1);

    // Switch to first page
    const newActiveId = this.data.pages[0].id;
    this.pageManager.load(this.data.pages, newActiveId);
    this._loadPage(newActiveId);
    this._onContentUpdate();
  }

  _syncCurrentPage() {
    const page = this.pageManager.getActivePage();
    if (!page) return;

    // Sync blocks from editor
    page.blocks = this.editor.getData();

    // Sync title
    const titleEl = document.getElementById('page-title');
    page.title = titleEl.textContent || 'Untitled';

    // Sync icon
    const iconBtn = document.getElementById('page-icon-btn');
    page.icon = iconBtn.textContent || '📄';

    // Update sidebar
    this.pageManager.render();
  }

  // ─── Content Update & Save ────────────────────

  _onContentUpdate() {
    this._setSaveStatus('Unsaved changes...');

    clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
      this._syncCurrentPage();
      saveToLocalStorage(this.data);
      this._setSaveStatus('Auto-saved locally');
    }, 1000);
  }

  async _saveToLocal() {
    this._syncCurrentPage();
    exportAsJson(this.data);
    this._showToast('success', 'Content downloaded as content.json');
  }

  async _saveToGitHub() {
    if (!isGitHubConfigured()) {
      this._showSettingsModal();
      this._showToast('warning', 'Please configure GitHub settings first');
      return;
    }

    this._syncCurrentPage();
    this._setSaveStatus('Saving to GitHub...');

    const result = await saveToGitHub(this.data);

    if (result.success) {
      this._setSaveStatus('Saved to GitHub ✓');
      this._showToast('success', result.message);
    } else {
      this._setSaveStatus('Save failed');
      this._showToast('error', result.message);
    }
  }

  _setSaveStatus(text) {
    const el = document.getElementById('save-status');
    if (el) el.textContent = text;
  }

  // ─── Theme ────────────────────────────────────

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
    if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }

  // ─── Icon Picker ──────────────────────────────

  _toggleIconPicker() {
    const picker = document.getElementById('icon-picker');
    if (picker.classList.contains('visible')) {
      picker.classList.remove('visible');
      return;
    }

    // Populate icons
    const icons = ['📄', '📝', '📖', '🎯', '🚀', '💡', '🔧', '📊', '🎨', '🌟',
      '👋', '🏠', '📚', '⭐', '🎮', '🎵', '📸', '🌍', '❤️', '🔥',
      '💻', '📱', '🎬', '🍕', '🌈', '🦄', '🐱', '🌸', '⚡', '🔮'];

    picker.innerHTML = '';
    icons.forEach(emoji => {
      const item = document.createElement('button');
      item.className = 'icon-picker-item';
      item.textContent = emoji;
      item.addEventListener('click', () => {
        const iconBtn = document.getElementById('page-icon-btn');
        iconBtn.textContent = emoji;
        picker.classList.remove('visible');
        this._onContentUpdate();
      });
      picker.appendChild(item);
    });

    // Position below the icon button
    const iconBtn = document.getElementById('page-icon-btn');
    const rect = iconBtn.getBoundingClientRect();
    picker.style.top = `${rect.bottom + 4}px`;
    picker.style.left = `${rect.left}px`;
    picker.classList.add('visible');
  }

  // ─── Settings Modal ───────────────────────────

  _showSettingsModal() {
    document.getElementById('settings-modal').classList.add('visible');
  }

  _hideSettingsModal() {
    document.getElementById('settings-modal').classList.remove('visible');
  }

  _loadGitHubSettings() {
    const settings = getGitHubSettings();
    document.getElementById('github-owner').value = settings.owner || '';
    document.getElementById('github-repo').value = settings.repo || '';
    document.getElementById('github-branch').value = settings.branch || 'main';
    document.getElementById('github-token').value = settings.token || '';
  }

  _saveGitHubSettingsFromForm() {
    const settings = {
      owner: document.getElementById('github-owner').value.trim(),
      repo: document.getElementById('github-repo').value.trim(),
      branch: document.getElementById('github-branch').value.trim() || 'main',
      token: document.getElementById('github-token').value.trim()
    };
    saveGitHubSettings(settings);
    this._hideSettingsModal();
    this._showToast('success', 'GitHub settings saved');
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

  // ─── Sidebar ──────────────────────────────────

  _toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
  }

  // ─── UI Event Binding ─────────────────────────

  _bindUIEvents() {
    // Save buttons
    document.getElementById('save-local-btn').addEventListener('click', () => this._saveToLocal());
    document.getElementById('save-github-btn').addEventListener('click', () => this._saveToGitHub());

    // Theme toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', () => this._toggleTheme());

    // Add page
    document.getElementById('add-page-btn').addEventListener('click', () => this._addPage());

    // Add block at end
    document.getElementById('editor-add-block').addEventListener('click', () => {
      const page = this.pageManager.getActivePage();
      if (!page) return;
      const lastBlockId = page.blocks.length > 0 ? page.blocks[page.blocks.length - 1].id : null;
      this.editor.addBlockAfter(lastBlockId, 'paragraph');
    });

    // Page title editing
    const titleEl = document.getElementById('page-title');
    titleEl.addEventListener('input', () => {
      this._onContentUpdate();
      document.getElementById('breadcrumb-page').textContent = titleEl.textContent || 'Untitled';
    });
    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Focus first block
        const firstBlock = document.querySelector('#editor .block .block-content');
        if (firstBlock) firstBlock.focus();
      }
    });

    // Icon picker
    document.getElementById('page-icon-btn').addEventListener('click', () => this._toggleIconPicker());

    // Settings modal
    document.getElementById('settings-btn').addEventListener('click', () => this._showSettingsModal());
    document.getElementById('settings-close-btn').addEventListener('click', () => this._hideSettingsModal());
    document.getElementById('settings-cancel-btn').addEventListener('click', () => this._hideSettingsModal());
    document.getElementById('settings-save-btn').addEventListener('click', () => this._saveGitHubSettingsFromForm());

    // Close modal on overlay click
    document.getElementById('settings-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this._hideSettingsModal();
      }
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
      const iconBtn = document.getElementById('page-icon-btn');
      if (!picker.contains(e.target) && e.target !== iconBtn) {
        picker.classList.remove('visible');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+S to save locally
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this._saveToLocal();
      }
    });
  }
}

// ─── Bootstrap ──────────────────────────────────

const app = new App();
app.init().catch(err => {
  console.error('Failed to initialize TeamFlow:', err);
});
