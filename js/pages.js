import { t, tLang } from './i18n.js';

export class PageManager {
  constructor({ pageListEl, onPageSelect, onPageAdd, onPageDelete }) {
    this.pageListEl = pageListEl;
    this.onPageSelect = onPageSelect || (() => {});
    this.onPageAdd = onPageAdd || (() => {});
    this.onPageDelete = onPageDelete || (() => {});
    this.pages = [];
    this.activePageId = null;
    this.searchTerm = '';

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
    // IMPORTANT: call onPageSelect FIRST so _syncCurrentPage saves to the OLD page,
    // then update activePageId and re-render.
    this.onPageSelect(pageId);
    this.activePageId = pageId;
    this.render();
  }

  /** Filter pages by search */
  search(term) {
    this.searchTerm = term.toLowerCase();
    this.render();
  }

  /** Render the page list */
  render() {
    this.pageListEl.innerHTML = '';

    const filtered = this.searchTerm
      ? this.pages.filter(p => p.title.toLowerCase().includes(this.searchTerm))
      : this.pages;

    filtered.forEach(page => {
      const item = document.createElement('div');
      item.className = `page-item${page.id === this.activePageId ? ' active' : ''}`;
      item.dataset.id = page.id;

      const icon = document.createElement('span');
      icon.className = 'page-item-icon';
      icon.textContent = page.icon || '📄';

      const name = document.createElement('span');
      name.className = 'page-item-name';
      name.textContent = page.title || tLang('placeholder.page', page.lang || 'en');

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'page-item-delete';
      deleteBtn.innerHTML = '×';
      deleteBtn.title = t('toast.delete_page');

      item.appendChild(icon);
      item.appendChild(name);

      // Don't allow deleting the last page
      if (this.pages.length > 1) {
        item.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Confirmation is handled by app.js via custom modal
          this.onPageDelete(page.id);
        });
      }

      item.addEventListener('click', (e) => {
        // Only switch if not clicking the delete button
        if (!e.target.closest('.page-item-delete')) {
          this.setActive(page.id);
        }
      });

      this.pageListEl.appendChild(item);
    });
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
