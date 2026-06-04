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
