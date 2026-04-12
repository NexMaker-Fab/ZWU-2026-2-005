/**
 * App Module — Main orchestrator. Wires together all modules and DOM elements.
 */

import { loadContent, saveToLocalStorage, exportAsJson, generateId, getTheme, setTheme } from './storage.js';
import { BlockEditor } from './editor.js';
import { PageManager } from './pages.js';
import { getGitHubSettings, saveGitHubSettings, isGitHubConfigured, saveToGitHub } from './github.js';
import { applyTranslations, toggleLanguage, t, tLang, getLang } from './i18n.js';

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
    this._setSaveStatus(t('save.status.ready'));

    // Init user identity
    this._initUser();

    // Re-render trash list when language changes (keeps empty text in sync)
    window.addEventListener('language-changed', () => {
      const trashView = document.getElementById('trash-view');
      if (trashView && trashView.style.display !== 'none') {
        this._renderTrashList();
      }
      // Also update sidebar user anonymous label if no name set
      this._updateTrashBadge();
    });

    // Update trash badge on load
    this._updateTrashBadge();
  }

  // ─── Page Management ──────────────────────────

  _loadPage(pageId) {
    const page = this.data.pages.find(p => p.id === pageId);
    if (!page) return;

    // Update page header
    const titleEl = document.getElementById('page-title');
    titleEl.textContent = page.title || '';

    // Update icon display (header) and right panel preview
    const iconDisplay = document.getElementById('page-icon-display');
    const iconPreview = document.getElementById('page-icon-preview');
    if (iconDisplay) iconDisplay.textContent = page.icon || '📄';
    if (iconPreview) iconPreview.textContent = page.icon || '📄';

    // Update breadcrumb
    document.getElementById('breadcrumb-page').textContent = page.title || tLang('placeholder.page', page.lang || 'en');

    // Exit trash view if open
    this._exitTrashView();

    // Update page meta (author + date)
    this._updatePageMeta(page);

    // Load blocks into editor
    this.editor.load(page.blocks || [], page.lang || 'en');
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

  _addPage() {
    const lang = getLang();
    const now = new Date().toISOString();
    const title = this._getNextPageTitle(lang);
    const newPage = {
      id: generateId(),
      title,
      icon: '📄',
      lang: lang,
      author: this._getUsername(),
      createdAt: now,
      updatedAt: now,
      blocks: [{
        id: generateId(),
        type: 'heading',
        level: 1,
        content: title
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

    // Move page to trash with metadata
    const [page] = this.data.pages.splice(idx, 1);
    page.deletedAt = new Date().toISOString();
    page.deletedBy = this._getUsername();
    if (!this.data.trash) this.data.trash = [];
    this.data.trash.unshift(page);

    // Update trash badge
    this._updateTrashBadge();

    // Switch to next page or stay
    const nextActiveId = (activeId === pageId) ? this.data.pages[0].id : activeId;
    this._exitTrashView();
    this.pageManager.load(this.data.pages, nextActiveId);
    this._loadPage(nextActiveId);
    this._onContentUpdate();

    this._showToast('success', t('trash.confirm.ok'));
  }

  _syncCurrentPage() {
    const page = this.pageManager.getActivePage();
    if (!page) return;

    // Sync blocks from editor
    page.blocks = this.editor.getData();

    // Sync title
    const titleEl = document.getElementById('page-title');
    page.title = titleEl.textContent || tLang('placeholder.page', page.lang || 'en');

    // Sync icon from right panel preview
    const iconPreview = document.getElementById('page-icon-preview');
    page.icon = iconPreview ? iconPreview.textContent.trim() : '📄';

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

  _showTrashView() {
    document.getElementById('editor-container').style.display = 'none';
    document.getElementById('trash-view').style.display = 'flex';
    document.getElementById('sidebar-trash-btn').classList.add('active');
    this.pageManager.render(); // deselect page
    this._renderTrashList();
  }

  _exitTrashView() {
    document.getElementById('editor-container').style.display = '';
    document.getElementById('trash-view').style.display = 'none';
    document.getElementById('sidebar-trash-btn').classList.remove('active');
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
    this.data.pages.push(page);
    this._updateTrashBadge();
    this.pageManager.load(this.data.pages, page.id);
    this._exitTrashView();
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
        const iconPreview = document.getElementById('page-icon-preview');
        const iconDisplay = document.getElementById('page-icon-display');
        if (iconPreview) iconPreview.textContent = emoji;
        if (iconDisplay) iconDisplay.textContent = emoji;
        picker.classList.remove('visible');
        this._onContentUpdate();
      });
      picker.appendChild(item);
    });

    // Position to the left of the right panel button
    const iconBtn = document.getElementById('page-icon-btn');
    const rect = iconBtn.getBoundingClientRect();
    picker.style.top = `${Math.max(8, rect.top)}px`;
    picker.style.left = `${Math.max(8, rect.left - 220)}px`;
    picker.style.right = 'auto';
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
    // Load username into settings form
    document.getElementById('settings-username').value = this._getUsername();
  }

  _saveGitHubSettingsFromForm() {
    // Save username
    const username = document.getElementById('settings-username').value.trim();
    if (username) {
      localStorage.setItem('teamflow_username', username);
      this._updateSidebarUser();
    }
    const settings = {
      owner: document.getElementById('github-owner').value.trim(),
      repo: document.getElementById('github-repo').value.trim(),
      branch: document.getElementById('github-branch').value.trim() || 'main',
      token: document.getElementById('github-token').value.trim()
    };
    saveGitHubSettings(settings);
    this._hideSettingsModal();
    this._showToast('success', t('toast.settings.saved'));
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
    let userBtn = document.getElementById('sidebar-user-btn');

    if (!userBtn) {
      // Insert user widget into sidebar footer (before theme button)
      const footer = document.querySelector('.sidebar-footer');
      userBtn = document.createElement('button');
      userBtn.id = 'sidebar-user-btn';
      userBtn.className = 'sidebar-user';
      footer.insertBefore(userBtn, footer.firstChild);
      userBtn.addEventListener('click', () => this._showSettingsModal());
    }

    const initial = username ? username[0].toUpperCase() : '?';
    userBtn.innerHTML = `
      <div class="sidebar-user-avatar">${initial}</div>
      <span class="sidebar-user-name">${username || t('page.meta.anonymous')}</span>
      <span class="sidebar-user-edit">✏️</span>
    `;
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
      // Mobile behavior
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    } else {
      // Desktop behavior
      sidebar.classList.toggle('collapsed');
    }
  }

  // ─── UI Event Binding ─────────────────────────

  _bindUIEvents() {
    // Language toggle
    document.getElementById('lang-toggle-btn').addEventListener('click', () => toggleLanguage());

    // Save buttons
    document.getElementById('save-local-btn').addEventListener('click', () => this._saveToLocal());
    document.getElementById('save-github-btn').addEventListener('click', () => this._saveToGitHub());

    // Theme toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', () => this._toggleTheme());

    // Add page
    document.getElementById('add-page-btn').addEventListener('click', () => this._addPage());

    // Trash view
    document.getElementById('sidebar-trash-btn').addEventListener('click', () => this._showTrashView());

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
      if (!picker.contains(e.target) && !iconBtn.contains(e.target)) {
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

    const savedWidth = localStorage.getItem('teamflow_sidebar_width');
    if (savedWidth && sidebar) sidebar.style.width = savedWidth + 'px';

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizeStartX = e.clientX;
      resizeStartWidth = sidebar.getBoundingClientRect().width;
      resizeHandle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const w = Math.min(480, Math.max(160, resizeStartWidth + e.clientX - resizeStartX));
      sidebar.style.width = w + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (!isResizing) return;
      isResizing = false;
      resizeHandle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('teamflow_sidebar_width', sidebar.getBoundingClientRect().width);
    });

    // ─── Right panel drag ─────────────────────────
    const propsPanel = document.getElementById('page-props-panel');
    const propsHandle = document.getElementById('page-props-handle');
    let isDraggingPanel = false, panelOffsetX = 0, panelOffsetY = 0;

    propsHandle.addEventListener('mousedown', (e) => {
      isDraggingPanel = true;
      const rect = propsPanel.getBoundingClientRect();
      panelOffsetX = e.clientX - rect.left;
      panelOffsetY = e.clientY - rect.top;
      propsPanel.classList.add('dragging');
      propsPanel.style.transform = 'none';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDraggingPanel) return;
      const x = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - panelOffsetX));
      const y = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - panelOffsetY));
      propsPanel.style.left = x + 'px';
      propsPanel.style.top = y + 'px';
      propsPanel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => {
      if (!isDraggingPanel) return;
      isDraggingPanel = false;
      propsPanel.classList.remove('dragging');
      document.body.style.userSelect = '';
    });
  }
}

// ─── Bootstrap ──────────────────────────────────

const app = new App();
app.init().catch(err => {
  console.error('Failed to initialize TeamFlow:', err);
});
