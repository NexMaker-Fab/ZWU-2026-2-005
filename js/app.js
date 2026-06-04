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
      onPageSelect: (pageId) => this._switchPage(pageId),
      onPageAdd: () => {},
      onPageDelete: (pageId) => this._deletePage(pageId),
      onSubPageAdd: (parentId) => this._addPage(parentId)
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
        reader.onload = (ev) => {
          try {
            const dataUrl = ev.target.result;
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
