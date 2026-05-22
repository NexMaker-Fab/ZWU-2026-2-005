import { t, tLang } from './i18n.js';

export class PageManager {
  constructor({ pageListEl, onPageSelect, onPageAdd, onPageDelete, onSubPageAdd }) {
    this.pageListEl = pageListEl;
    this.onPageSelect = onPageSelect || (() => {});
    this.onPageAdd = onPageAdd || (() => {});
    this.onPageDelete = onPageDelete || (() => {});
    this.onSubPageAdd = onSubPageAdd || (() => {});
    this.pages = [];
    this.activePageId = null;
    this.searchTerm = '';

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

    return item;
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
