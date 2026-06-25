/**
 * Block Editor Module — The core editing engine.
 * Handles block creation, editing, deletion, drag-and-drop, slash commands, and toolbar.
 */

import { generateId } from './storage.js';
import { t, tLang } from './i18n.js';

/**
 * Sanitizes HTML content using native DOMParser.
 * Only allows a whitelist of styling tags: b, i, u, strong, em, a, br, span.
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const allowedTags = ['B', 'I', 'U', 'STRONG', 'EM', 'A', 'BR', 'SPAN'];
  
  const sanitizeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }
    
    if (node.nodeType === Node.ELEMENT_NODE && allowedTags.includes(node.tagName)) {
      const cleanEl = document.createElement(node.tagName.toLowerCase());
      
      if (node.tagName === 'A') {
        const href = node.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#'))) {
          cleanEl.setAttribute('href', href);
          cleanEl.setAttribute('target', '_blank');
          cleanEl.setAttribute('rel', 'noopener noreferrer');
        }
      }
      
      const style = node.getAttribute('style');
      if (style && !/url|expression|javascript/i.test(style)) {
        cleanEl.setAttribute('style', style);
      }
      
      for (const child of node.childNodes) {
        cleanEl.appendChild(sanitizeNode(child));
      }
      return cleanEl;
    }
    
    const fragment = document.createDocumentFragment();
    for (const child of node.childNodes) {
      fragment.appendChild(sanitizeNode(child));
    }
    return fragment;
  };
  
  const cleanBody = document.createElement('body');
  for (const child of doc.body.childNodes) {
    cleanBody.appendChild(sanitizeNode(child));
  }
  return cleanBody.innerHTML;
}

/**
 * Render inline Markdown syntax into HTML tags.
 * Supports bold (**), italic (* or _), code (`), strikeout (~~), and links ([text](url)).
 * @param {string} text
 * @returns {string}
 */
export function renderInlineMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}


const MAX_IMAGE_SIZE = 5 * 1024 * 1024;       // 5MB hard limit
const COMPRESS_THRESHOLD = 500 * 1024;         // 500KB — compress above this
const COMPRESS_QUALITY = 0.7;
const COMPRESS_MAX_WIDTH = 1600;

/**
 * Process an image file: reject if too large, compress if above threshold.
 * @param {File} file
 * @returns {Promise<{dataUrl: string, compressed: boolean} | {error: string}>}
 */
export function processImageFile(file) {
  return new Promise((resolve) => {
    if (file.size > MAX_IMAGE_SIZE) {
      resolve({ error: t('toast.image.too_large') });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;

      if (file.size <= COMPRESS_THRESHOLD) {
        resolve({ dataUrl, compressed: false });
        return;
      }

      // Compress via canvas
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, COMPRESS_MAX_WIDTH / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', COMPRESS_QUALITY);
        resolve({ dataUrl: compressed, compressed: true });
      };
      img.onerror = () => resolve({ dataUrl, compressed: false }); // fallback
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export class BlockEditor {
  constructor({ editorEl, slashMenuEl, floatingToolbarEl, onUpdate }) {
    this.editorEl = editorEl;
    this.slashMenuEl = slashMenuEl;
    this.toolbarEl = floatingToolbarEl;
    this.onUpdate = onUpdate || (() => {});
    this.blocks = [];
    this.activeBlockId = null;
    this.slashMenuTarget = null;
    this.draggedBlockId = null;
    this.undoManager = new UndoManager(this);

    this._bindEvents();
  }

  // ─── Public API ───────────────────────────────

  /** Load blocks and render */
  load(blocks, lang = 'en') {
    this.blocks = blocks || [];
    this.pageLang = lang;
    this.render();
    this.undoManager.clear();
    this.undoManager.saveState();
  }

  /** Get current blocks data */
  getData() {
    // Sync any contenteditable changes to data before returning
    this._syncAllBlocks();
    return [...this.blocks];
  }

  /** Render all blocks to DOM */
  render() {
    this.editorEl.innerHTML = '';
    this.blocks.forEach((block, index) => {
      const el = this._createBlockEl(block, index);
      this.editorEl.appendChild(el);
    });
  }

  // ─── Block Creation ───────────────────────────

  /** Create a new block data object */
  createBlock(type, extraData = {}) {
    const block = { id: generateId(), type, ...extraData };
    switch (type) {
      case 'heading':
        block.level = extraData.level || 1;
        block.content = extraData.content || '';
        break;
      case 'paragraph':
      case 'quote':
      case 'code':
      case 'bullet-list':
        block.content = extraData.content || '';
        break;
      case 'todo':
        block.content = extraData.content || '';
        block.checked = !!extraData.checked;
        break;
      case 'image':
        block.src = extraData.src || '';
        block.caption = extraData.caption || '';
        break;
      case 'divider':
        break;
    }
    return block;
  }

  // ─── DOM Helpers (Incremental Updates) ─────────

  _getBlockEl(id) {
    return this.editorEl.querySelector(`[data-id="${id}"]`);
  }

  _removeDomBlock(blockId) {
    const el = this._getBlockEl(blockId);
    if (el) el.remove();
  }

  _insertDomBlockAfter(afterId, block) {
    const index = this.blocks.findIndex(b => b.id === block.id);
    const newEl = this._createBlockEl(block, index);
    if (afterId) {
      const afterEl = this._getBlockEl(afterId);
      if (afterEl) {
        afterEl.after(newEl);
        return;
      }
    }
    this.editorEl.appendChild(newEl);
  }

  _replaceDomBlock(block) {
    const oldEl = this._getBlockEl(block.id);
    if (oldEl) {
      const index = this.blocks.findIndex(b => b.id === block.id);
      const newEl = this._createBlockEl(block, index);
      oldEl.replaceWith(newEl);
    }
  }

  /** Add a block after a given block ID, or at the end */
  addBlockAfter(afterId, type, extraData = {}) {
    const block = this.createBlock(type, extraData);
    if (afterId) {
      const idx = this.blocks.findIndex(b => b.id === afterId);
      this.blocks.splice(idx + 1, 0, block);
    } else {
      this.blocks.push(block);
    }
    this._insertDomBlockAfter(afterId, block);
    this.onUpdate();
    this.undoManager.saveState();

    // Focus the new block
    requestAnimationFrame(() => {
      const newEl = this.editorEl.querySelector(`[data-id="${block.id}"] .block-content`);
      if (newEl && newEl.contentEditable === 'true') {
        newEl.focus();
      }
    });
    return block;
  }

  /** Delete a block by ID */
  deleteBlock(id) {
    if (this.blocks.length <= 1) return; // Keep at least one block
    const idx = this.blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    this.blocks.splice(idx, 1);
    this._removeDomBlock(id);
    this.onUpdate();
    this.undoManager.saveState();
  }

  /** Change block type */
  changeBlockType(id, newType, level) {
    const block = this.blocks.find(b => b.id === id);
    if (!block) return;

    // Sync content first
    this._syncBlock(id);

    block.type = newType;
    if (newType === 'heading') {
      block.level = level || 1;
    } else {
      delete block.level;
    }

    if (newType === 'divider') {
      delete block.content;
    }

    if (newType === 'image') {
      block.src = '';
      block.caption = '';
      delete block.content;
    }

    this._replaceDomBlock(block);
    this.onUpdate();
    this.undoManager.saveState();

    // Focus the changed block
    requestAnimationFrame(() => {
      const el = this.editorEl.querySelector(`[data-id="${id}"] .block-content, [data-id="${id}"] .image-caption`);
      if (el && el.contentEditable === 'true') {
        el.focus();
      }
    });
  }

  // ─── DOM Element Creation ─────────────────────

  _createBlockEl(block, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'block';
    wrapper.dataset.id = block.id;
    wrapper.dataset.type = block.type;

    // Controls container (handle + add button)
    const controls = document.createElement('div');
    controls.className = 'block-controls';

    const addBtn = document.createElement('button');
    addBtn.className = 'block-add-btn';
    addBtn.innerHTML = '+';
    addBtn.title = t('editor.add_block_below');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.addBlockAfter(block.id, 'paragraph');
    });

    const handle = document.createElement('div');
    handle.className = 'block-handle';
    handle.innerHTML = '⠿';
    handle.title = 'Drag to reorder';
    handle.draggable = true;

    controls.appendChild(addBtn);
    controls.appendChild(handle);

    // Body
    const body = document.createElement('div');
    body.className = 'block-body';

    const content = this._createContentEl(block);
    body.appendChild(content);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'block-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete block';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteBlock(block.id);
    });

    wrapper.appendChild(controls);
    wrapper.appendChild(body);
    wrapper.appendChild(deleteBtn);

    return wrapper;
  }

  _createContentEl(block) {
    switch (block.type) {
      case 'heading': {
        const el = document.createElement('div');
        el.className = 'block-content';
        el.contentEditable = 'true';
        el.dataset.type = 'heading';
        el.dataset.level = block.level || 1;
        el.dataset.placeholder = t('placeholder.heading') + (block.level || 1);
        el.innerHTML = sanitizeHtml(renderInlineMarkdown(block.content || ''));
        return el;
      }
      case 'paragraph': {
        const el = document.createElement('div');
        el.className = 'block-content';
        el.contentEditable = 'true';
        el.dataset.type = 'paragraph';
        el.dataset.placeholder = t('placeholder.paragraph');
        el.innerHTML = sanitizeHtml(renderInlineMarkdown(block.content || ''));
        return el;
      }
      case 'quote': {
        const el = document.createElement('blockquote');
        el.className = 'block-content block-quote';
        el.contentEditable = 'true';
        el.dataset.type = 'quote';
        el.dataset.placeholder = t('placeholder.quote') || 'Quote';
        el.innerHTML = sanitizeHtml(renderInlineMarkdown(block.content || ''));
        return el;
      }
      case 'code': {
        const wrap = document.createElement('div');
        wrap.className = 'block-code-container';
        const el = document.createElement('pre');
        el.className = 'block-content block-code';
        el.contentEditable = 'true';
        el.dataset.type = 'code';
        el.dataset.placeholder = t('placeholder.code') || '// Write code here...';
        el.textContent = block.content || '';
        wrap.appendChild(el);
        return wrap;
      }
      case 'bullet-list': {
        const wrap = document.createElement('div');
        wrap.className = 'block-bullet-container';
        const bullet = document.createElement('span');
        bullet.className = 'bullet-point';
        bullet.innerHTML = '•';
        const el = document.createElement('div');
        el.className = 'block-content bullet-text';
        el.contentEditable = 'true';
        el.dataset.type = 'bullet-list';
        el.dataset.placeholder = t('placeholder.bullet') || 'List';
        el.innerHTML = sanitizeHtml(renderInlineMarkdown(block.content || ''));
        wrap.appendChild(bullet);
        wrap.appendChild(el);
        return wrap;
      }
      case 'todo': {
        const wrap = document.createElement('div');
        wrap.className = 'block-todo-container';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = !!block.checked;
        
        const el = document.createElement('div');
        el.className = 'block-content todo-text';
        el.contentEditable = 'true';
        el.dataset.type = 'todo';
        el.dataset.placeholder = t('placeholder.todo') || 'To-do';
        el.innerHTML = sanitizeHtml(renderInlineMarkdown(block.content || ''));
        if (block.checked) {
          el.classList.add('checked');
        }
        
        checkbox.addEventListener('change', () => {
          block.checked = checkbox.checked;
          if (checkbox.checked) {
            el.classList.add('checked');
          } else {
            el.classList.remove('checked');
          }
          this.onUpdate();
          this.undoManager.saveState();
        });
        
        wrap.appendChild(checkbox);
        wrap.appendChild(el);
        return wrap;
      }
      case 'image': {
        const wrap = document.createElement('div');
        wrap.className = 'block-image';
        if (block.src) {
          const img = document.createElement('img');
          img.src = block.src;
          img.alt = block.caption || 'Image';
          img.loading = 'lazy';
          wrap.appendChild(img);

          const caption = document.createElement('div');
          caption.className = 'image-caption';
          caption.contentEditable = 'true';
          caption.textContent = block.caption || '';
          caption.dataset.placeholder = t('placeholder.caption');
          caption.addEventListener('input', () => {
            block.caption = caption.textContent;
            this.onUpdate();
          });
          wrap.appendChild(caption);
        } else {
          const upload = this._createImageUpload(block);
          wrap.appendChild(upload);
        }
        return wrap;
      }
      case 'divider': {
        const wrap = document.createElement('div');
        wrap.className = 'block-divider';
        wrap.innerHTML = '<hr>';
        return wrap;
      }
      default: {
        const el = document.createElement('div');
        el.className = 'block-content';
        el.contentEditable = 'true';
        el.dataset.type = 'paragraph';
        el.innerHTML = sanitizeHtml(renderInlineMarkdown(block.content || ''));
        return el;
      }
    }
  }

  _createImageUpload(block) {
    const area = document.createElement('div');
    area.className = 'image-upload-area';

    area.innerHTML = `
      <div class="image-upload-icon">🖼️</div>
      <div class="image-upload-text">${t('placeholder.image.upload')}</div>
      <input type="file" class="image-upload-input" accept="image/*">
      <input type="text" class="image-url-input" placeholder="${t('placeholder.image.url')}">
    `;

    const fileInput = area.querySelector('.image-upload-input');
    const urlInput = area.querySelector('.image-url-input');

    // Click area to trigger file upload
    area.addEventListener('click', (e) => {
      if (e.target !== urlInput) {
        fileInput.click();
      }
    });

    // Handle file upload — validate size & compress
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const result = await processImageFile(file);
      if (result.error) {
        // Show error via a temporary inline message
        alert(result.error);
        return;
      }
      block.src = result.dataUrl;
      this._replaceDomBlock(block);
      this.onUpdate();
    });

    // Handle URL input
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (url) {
          block.src = url;
          this._replaceDomBlock(block);
          this.onUpdate();
        }
      }
    });

    // Stop propagation on URL input clicks
    urlInput.addEventListener('click', (e) => e.stopPropagation());

    return area;
  }

  // ─── Event Binding ────────────────────────────

  _bindEvents() {
    window.addEventListener('language-changed', () => {
      this.render();
    });

    // Input handler — debounced auto-save + slash command filtering + undo manager state save
    let saveTimer = null;
    this.editorEl.addEventListener('input', (e) => {
      // Slash menu filtering
      if (this._isSlashMenuVisible() && this.slashMenuTarget) {
        const contentEl = e.target.closest('.block-content');
        if (contentEl) {
          const offset = this._getCursorOffset(contentEl);
          if (offset <= this.slashTriggerOffset) {
            this._hideSlashMenu();
          } else {
            const text = contentEl.textContent || '';
            const query = text.substring(this.slashTriggerOffset + 1, offset);
            this._filterSlashMenu(query);
          }
        }
      }

      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        this._syncAllBlocks();
        this.onUpdate();
        this.undoManager.saveState(); // Save state on typing pause
      }, 500);
    });

    // Keydown handler — slash commands, enter, backspace
    this.editorEl.addEventListener('keydown', (e) => {
      this._handleKeydown(e);
    });

    // Click outside slash menu or toolbar to close
    document.addEventListener('click', (e) => {
      if (!this.slashMenuEl.contains(e.target)) {
        this._hideSlashMenu();
      }
      if (!this.toolbarEl.contains(e.target)) {
        this._hideToolbar();
      }
    });

    // Click on editor blank area to edit
    this.editorEl.addEventListener('click', (e) => {
      if (e.target === this.editorEl) {
        if (this.blocks.length === 0) {
          this.addBlockAfter(null, 'paragraph');
        } else {
          const lastBlock = this.blocks[this.blocks.length - 1];
          const lastEl = this.editorEl.querySelector(`[data-id="${lastBlock.id}"] .block-content, [data-id="${lastBlock.id}"] .image-caption`);
          if (lastEl && lastEl.contentEditable === 'true') {
            lastEl.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(lastEl);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            this.addBlockAfter(lastBlock.id, 'paragraph');
          }
        }
      }
    });

    // Selection change — show/hide floating toolbar
    document.addEventListener('selectionchange', () => {
      this._handleSelectionChange();
    });

    // Slash menu item clicks — use mousedown to fire before the document click handler
    this.slashMenuEl.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.slash-menu-item');
      if (!item) return;
      e.preventDefault(); // Prevent blur and document click from firing first
      e.stopPropagation();
      const type = item.dataset.type;
      this._executeSlashCommand(type);
    });

    // Keyboard navigation within slash menu (only visible items)
    document.addEventListener('keydown', (e) => {
      if (!this._isSlashMenuVisible()) return;

      const items = Array.from(this.slashMenuEl.querySelectorAll('.slash-menu-item'))
        .filter(i => i.style.display !== 'none');
      if (items.length === 0) return;

      const activeIdx = items.findIndex(i => i.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const nextIdx = (activeIdx + 1) % items.length;
        items.forEach(i => i.classList.remove('active'));
        items[nextIdx].classList.add('active');
        items[nextIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const prevIdx = activeIdx <= 0 ? items.length - 1 : activeIdx - 1;
        items.forEach(i => i.classList.remove('active'));
        items[prevIdx].classList.add('active');
        items[prevIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const activeItem = items[activeIdx >= 0 ? activeIdx : 0];
        if (activeItem) {
          this._executeSlashCommand(activeItem.dataset.type);
        }
      } else if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(e.key, 10) - 1;
        if (index < items.length) {
          this._executeSlashCommand(items[index].dataset.type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this._hideSlashMenu();
      }
    });

    // Global Undo / Redo key bindings
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          this.undoManager.redo();
        } else {
          e.preventDefault();
          this.undoManager.undo();
        }
      } else if (isCmdOrCtrl && e.key === 'y') {
        e.preventDefault();
        this.undoManager.redo();
      }
    });

    // Floating toolbar button clicks
    this.toolbarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-command]');
      if (!btn) return;
      this._executeToolbarCommand(btn.dataset.command);
    });

    // Drag and drop
    this.editorEl.addEventListener('dragstart', (e) => this._onDragStart(e));
    this.editorEl.addEventListener('dragover', (e) => this._onDragOver(e));
    this.editorEl.addEventListener('dragleave', (e) => this._onDragLeave(e));
    this.editorEl.addEventListener('drop', (e) => this._onDrop(e));
    this.editorEl.addEventListener('dragend', (e) => this._onDragEnd(e));
  }

  // ─── Keyboard Handling ────────────────────────

  _handleKeydown(e) {
    const blockEl = e.target.closest('.block');
    if (!blockEl) return;
    const blockId = blockEl.dataset.id;

    // Slash command detection — trigger on '/' at start of block or after space
    if (e.key === '/') {
      const contentEl = e.target.closest('.block-content');
      if (contentEl) {
        const offset = this._getCursorOffset(contentEl);
        const text = contentEl.textContent || '';
        const beforeCursor = text.substring(0, offset);
        
        if (offset === 0 || /\s$/.test(beforeCursor)) {
          this.slashTriggerOffset = offset;
          this.slashMenuTarget = blockId;
          requestAnimationFrame(() => {
            this._showSlashMenu(contentEl);
          });
        }
      }
    }

    // Space — Markdown shortcuts / auto-formatting
    if (e.key === ' ') {
      const contentEl = e.target.closest('.block-content');
      if (contentEl) {
        const text = contentEl.textContent || '';
        const offset = this._getCursorOffset(contentEl);
        const prefix = text.substring(0, offset);

        if (prefix === '#') {
          e.preventDefault();
          contentEl.textContent = text.substring(offset);
          this.changeBlockType(blockId, 'heading', 1);
        } else if (prefix === '##') {
          e.preventDefault();
          contentEl.textContent = text.substring(offset);
          this.changeBlockType(blockId, 'heading', 2);
        } else if (prefix === '###') {
          e.preventDefault();
          contentEl.textContent = text.substring(offset);
          this.changeBlockType(blockId, 'heading', 3);
        } else if (prefix === '>') {
          e.preventDefault();
          contentEl.textContent = text.substring(offset);
          this.changeBlockType(blockId, 'quote');
        } else if (prefix === '```') {
          e.preventDefault();
          contentEl.textContent = text.substring(offset);
          this.changeBlockType(blockId, 'code');
        } else if (prefix === '-' || prefix === '*') {
          e.preventDefault();
          contentEl.textContent = text.substring(offset);
          this.changeBlockType(blockId, 'bullet-list');
        } else if (prefix === '[]') {
          e.preventDefault();
          contentEl.textContent = text.substring(offset);
          this.changeBlockType(blockId, 'todo');
        } else if (prefix === '---') {
          e.preventDefault();
          this.changeBlockType(blockId, 'divider');
        }
      }
    }

    // If slash menu is visible, let the dedicated slash menu keyboard handler deal with it
    // MUST be checked before Enter/Arrow handling to prevent creating new blocks
    if (this._isSlashMenuVisible()) {
      return;
    }

    // Enter — split block at cursor position (HTML-aware via Range extraction)
    if (e.key === 'Enter' && !e.shiftKey) {
      const type = blockEl.dataset.type;
      if (type === 'divider') return;

      e.preventDefault();
      const contentEl = e.target.closest('.block-content');
      if (!contentEl) return;

      // Special check: if text is '---', convert to divider instead of splitting
      const text = contentEl.textContent || '';
      if (text.trim() === '---') {
        this.changeBlockType(blockId, 'divider');
        return;
      }

      this._syncBlock(blockId);

      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);

      // Create a range from cursor to end of the block content
      const tailRange = document.createRange();
      tailRange.setStart(range.startContainer, range.startOffset);
      tailRange.setEnd(contentEl, contentEl.childNodes.length);

      // Extract the content after the cursor
      const fragment = tailRange.extractContents();
      const container = document.createElement('div');
      container.appendChild(fragment);

      const textBefore = contentEl.innerHTML;
      const textAfter = container.innerHTML;

      // Update current block data and DOM
      const block = this.blocks.find(b => b.id === blockId);
      if (block) {
        // Special case: if code block, keep plain text
        if (block.type === 'code') {
          block.content = contentEl.textContent || '';
        } else {
          block.content = sanitizeHtml(textBefore);
          contentEl.innerHTML = block.content;
        }
      }

      // Create new paragraph with text after cursor
      this.addBlockAfter(blockId, 'paragraph', { content: sanitizeHtml(textAfter) });
    }

    // Backspace — merge with previous block when cursor is at start
    if (e.key === 'Backspace') {
      const contentEl = e.target.closest('.block-content');
      if (!contentEl) return;

      const offset = this._getCursorOffset(contentEl);

      if (offset === 0 && this.blocks.length > 1) {
        const idx = this.blocks.findIndex(b => b.id === blockId);
        if (idx <= 0) return;

        const prevBlock = this.blocks[idx - 1];
        const currentBlock = this.blocks[idx];
        const textTypes = ['heading', 'paragraph', 'quote', 'bullet-list', 'todo', 'code'];

        // If both are text blocks, merge content
        if (textTypes.includes(prevBlock.type) && textTypes.includes(currentBlock.type)) {
          e.preventDefault();

          // Get the plain-text merge point Y character offset before appending
          const prevEl = this.editorEl.querySelector(`[data-id="${prevBlock.id}"] .block-content`);
          const mergePoint = prevEl ? prevEl.textContent.length : 0;

          // Sync both to get latest content
          this._syncBlock(prevBlock.id);
          this._syncBlock(currentBlock.id);

          if (prevBlock.type === 'code' || currentBlock.type === 'code') {
            prevBlock.content = (prevBlock.content || '') + (currentBlock.content || '');
            if (prevEl) {
              prevEl.textContent = prevBlock.content;
            }
          } else {
            prevBlock.content = sanitizeHtml((prevBlock.content || '') + (currentBlock.content || ''));
            if (prevEl) {
              prevEl.innerHTML = prevBlock.content;
            }
          }

          // Remove current block from data and DOM
          this.blocks.splice(idx, 1);
          this._removeDomBlock(blockId);
          this.onUpdate();
          this.undoManager.saveState();

          // Place cursor at merge point
          requestAnimationFrame(() => {
            this._setCursorAt(prevBlock.id, mergePoint);
          });
        } else if ((currentBlock.content || '') === '' || currentBlock.type === 'divider') {
          // Current block is empty or is a divider — just delete it
          e.preventDefault();
          const prevId = prevBlock.id;
          this.blocks.splice(idx, 1);
          this._removeDomBlock(blockId);
          this.onUpdate();
          this.undoManager.saveState();
          requestAnimationFrame(() => {
            const prevEl = this.editorEl.querySelector(`[data-id="${prevId}"] .block-content`);
            if (prevEl && prevEl.contentEditable === 'true') {
              prevEl.focus();
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(prevEl);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          });
        }
      }
    }

    // Escape — close menus
    if (e.key === 'Escape') {
      this._hideSlashMenu();
      this._hideToolbar();
    }

    // Arrow navigation between blocks (visual multi-line checks)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;

      const idx = this.blocks.findIndex(b => b.id === blockId);
      const range = sel.getRangeAt(0);
      const cursorRect = range.getBoundingClientRect();
      const contentEl = e.target.closest('.block-content');
      
      if (contentEl) {
        const contentRect = contentEl.getBoundingClientRect();
        const style = window.getComputedStyle(contentEl);
        const lineHeight = parseFloat(style.lineHeight) || 24;
        const hasValidCursorRect = cursorRect && cursorRect.height > 0;
        
        let targetIdx = -1;

        if (e.key === 'ArrowUp') {
          const isAtFirstLine = hasValidCursorRect 
            ? (cursorRect.top - contentRect.top < lineHeight * 1.2) 
            : (range.startOffset === 0);
          if (isAtFirstLine && idx > 0) {
            targetIdx = idx - 1;
          }
        } else {
          const textLength = contentEl.textContent.length;
          const isAtLastLine = hasValidCursorRect 
            ? (contentRect.bottom - cursorRect.bottom < lineHeight * 1.2) 
            : (range.endOffset >= textLength);
          if (isAtLastLine && idx < this.blocks.length - 1) {
            targetIdx = idx + 1;
          }
        }

        if (targetIdx >= 0) {
          e.preventDefault();
          let step = e.key === 'ArrowUp' ? -1 : 1;
          let currIdx = targetIdx;
          
          while (currIdx >= 0 && currIdx < this.blocks.length) {
            const targetId = this.blocks[currIdx].id;
            const targetEl = this.editorEl.querySelector(`[data-id="${targetId}"] .block-content, [data-id="${targetId}"] .image-caption`);
            if (targetEl && targetEl.contentEditable === 'true') {
              targetEl.focus();
              break;
            }
            currIdx += step;
          }
        }
      }
    }
  }

  // ─── Slash Command Menu ───────────────────────

  _isSlashMenuVisible() {
    return this.slashMenuEl.classList.contains('visible');
  }

  _showSlashMenu(anchorEl) {
    const sel = window.getSelection();
    let rect = null;
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      rect = range.getBoundingClientRect();
    }
    
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      rect = anchorEl.getBoundingClientRect();
    }

    const menuWidth = 280;
    const menuHeight = 320;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + 4;
    let left = rect.left;

    // Check bottom boundary
    if (top + menuHeight > viewportHeight) {
      top = rect.top - menuHeight - 4;
    }

    // Check right boundary
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 8;
    }

    top = Math.max(8, top);
    left = Math.max(8, left);

    this.slashMenuEl.style.top = `${top}px`;
    this.slashMenuEl.style.left = `${left}px`;
    this.slashMenuEl.classList.add('visible');

    // Reset visibility of all items
    this._filterSlashMenu('');
  }

  _hideSlashMenu() {
    this.slashMenuEl.classList.remove('visible');
    this.slashMenuTarget = null;
    this.slashTriggerOffset = undefined;
  }

  _filterSlashMenu(query) {
    query = query.toLowerCase().trim();
    const items = this.slashMenuEl.querySelectorAll('.slash-menu-item');
    let hasVisible = false;
    let firstVisibleItem = null;

    items.forEach(item => {
      const nameEl = item.querySelector('.slash-menu-item-name');
      const descEl = item.querySelector('.slash-menu-item-desc');
      const name = nameEl ? nameEl.textContent.toLowerCase() : '';
      const desc = descEl ? descEl.textContent.toLowerCase() : '';
      const type = item.dataset.type.toLowerCase();

      if (name.includes(query) || desc.includes(query) || type.includes(query)) {
        item.style.display = 'flex';
        hasVisible = true;
        item.classList.remove('active');
        if (!firstVisibleItem) {
          firstVisibleItem = item;
        }
      } else {
        item.style.display = 'none';
        item.classList.remove('active');
      }
    });

    if (firstVisibleItem) {
      firstVisibleItem.classList.add('active');
    }

    const labelEl = this.slashMenuEl.querySelector('.slash-menu-label');
    if (labelEl) {
      labelEl.style.display = hasVisible ? 'block' : 'none';
    }
  }

  _executeSlashCommand(type) {
    // IMPORTANT: Save the target block ID BEFORE hiding the menu,
    // because _hideSlashMenu sets slashMenuTarget to null.
    const blockId = this.slashMenuTarget;
    const contentEl = this.editorEl.querySelector(`[data-id="${blockId}"] .block-content`);
    let queryLength = 0;
    if (contentEl && this.slashTriggerOffset !== undefined) {
      const text = contentEl.textContent || '';
      const offset = this._getCursorOffset(contentEl);
      queryLength = Math.max(0, offset - this.slashTriggerOffset);
    }

    this._hideSlashMenu();
    if (!blockId) return;

    // Delete the slash command text from DOM
    if (contentEl && this.slashTriggerOffset !== undefined) {
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        
        let startNode = null;
        let startOffset = 0;
        let remaining = this.slashTriggerOffset;
        const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, null);
        let node = walker.nextNode();
        while (node) {
          if (remaining <= node.textContent.length) {
            startNode = node;
            startOffset = remaining;
            break;
          }
          remaining -= node.textContent.length;
          node = walker.nextNode();
        }

        if (startNode) {
          const endNode = sel.rangeCount ? sel.getRangeAt(0).startContainer : startNode;
          const endOffset = sel.rangeCount ? sel.getRangeAt(0).startOffset : startOffset + queryLength;
          
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
          range.deleteContents();
        }
      } catch (err) {
        console.error('Error removing slash command text:', err);
      }
    }

    this._syncBlock(blockId);

    switch (type) {
      case 'paragraph':
        this.changeBlockType(blockId, 'paragraph');
        break;
      case 'heading1':
        this.changeBlockType(blockId, 'heading', 1);
        break;
      case 'heading2':
        this.changeBlockType(blockId, 'heading', 2);
        break;
      case 'heading3':
        this.changeBlockType(blockId, 'heading', 3);
        break;
      case 'quote':
        this.changeBlockType(blockId, 'quote');
        break;
      case 'code':
        this.changeBlockType(blockId, 'code');
        break;
      case 'bullet-list':
        this.changeBlockType(blockId, 'bullet-list');
        break;
      case 'todo':
        this.changeBlockType(blockId, 'todo');
        break;
      case 'image':
        this.changeBlockType(blockId, 'image');
        break;
      case 'divider':
        this.changeBlockType(blockId, 'divider');
        break;
    }
  }

  // ─── Floating Toolbar ─────────────────────────

  _handleSelectionChange() {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      clearTimeout(this._toolbarDebounce);
      this._hideToolbar();
      return;
    }

    clearTimeout(this._toolbarDebounce);
    this._toolbarDebounce = setTimeout(() => {
      this._updateToolbarPosition();
    }, 150);
  }

  _updateToolbarPosition() {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      this._hideToolbar();
      return;
    }

    const range = sel.getRangeAt(0);
    const block = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer.closest('.block')
      : range.commonAncestorContainer.parentElement?.closest('.block');

    if (!block || !this.editorEl.contains(block)) {
      this._hideToolbar();
      return;
    }

    const text = sel.toString().trim();
    if (text.length === 0) {
      this._hideToolbar();
      return;
    }

    const rect = range.getBoundingClientRect();
    const tbWidth = 280; // approximate toolbar width
    const tbHeight = 44; // toolbar height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.top - tbHeight - 8;
    let left = rect.left + rect.width / 2 - tbWidth / 2;

    // Boundary check: if not enough space above, position below
    if (top < 8) {
      top = rect.bottom + 8;
    }

    // Horizontal boundary check
    if (left < 8) left = 8;
    if (left + tbWidth > viewportWidth - 8) {
      left = viewportWidth - tbWidth - 8;
    }

    this.toolbarEl.style.top = `${top}px`;
    this.toolbarEl.style.left = `${left}px`;
    this.toolbarEl.classList.add('visible');
  }

  _hideToolbar() {
    this.toolbarEl.classList.remove('visible');
  }

  _executeToolbarCommand(command) {
    switch (command) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'paragraph': {
        // Change block type of the currently focused block
        const sel = window.getSelection();
        if (!sel.rangeCount) break;
        const blockEl = sel.getRangeAt(0).commonAncestorContainer.nodeType === 1
          ? sel.getRangeAt(0).commonAncestorContainer.closest('.block')
          : sel.getRangeAt(0).commonAncestorContainer.parentElement?.closest('.block');
        if (blockEl) {
          const id = blockEl.dataset.id;
          if (command === 'paragraph') {
            this.changeBlockType(id, 'paragraph');
          } else {
            this.changeBlockType(id, 'heading', parseInt(command.replace('heading', '')));
          }
        }
        break;
      }
    }

    // Immediately sync block content and trigger onUpdate for bold/italic/underline formatting
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const blockEl = sel.getRangeAt(0).commonAncestorContainer.nodeType === 1
        ? sel.getRangeAt(0).commonAncestorContainer.closest('.block')
        : sel.getRangeAt(0).commonAncestorContainer.parentElement?.closest('.block');
      if (blockEl) {
        this._syncBlock(blockEl.dataset.id);
        this.onUpdate();
        this.undoManager.saveState();
      }
    }

    this._hideToolbar();
  }

  // ─── Drag & Drop ──────────────────────────────

  _onDragStart(e) {
    // Only allow drag from the handle, not from contenteditable areas
    if (!e.target.closest('.block-handle')) {
      e.preventDefault();
      return;
    }
    const blockEl = e.target.closest('.block');
    if (!blockEl) return;

    this.draggedBlockId = blockEl.dataset.id;
    blockEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockEl.dataset.id);
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const blockEl = e.target.closest('.block');
    if (!blockEl || blockEl.dataset.id === this.draggedBlockId) return;

    // Determine if we're on the top or bottom half
    const rect = blockEl.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    // Clear all drag indicators
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    if (e.clientY < midY) {
      blockEl.classList.add('drag-over-top');
    } else {
      blockEl.classList.add('drag-over-bottom');
    }
  }

  _onDragLeave(e) {
    const blockEl = e.target.closest('.block');
    if (blockEl) {
      blockEl.classList.remove('drag-over-top', 'drag-over-bottom');
    }
  }

  _onDrop(e) {
    e.preventDefault();
    const targetEl = e.target.closest('.block');
    if (!targetEl || !this.draggedBlockId) return;

    const targetId = targetEl.dataset.id;
    if (targetId === this.draggedBlockId) return;

    // Determine position (above or below)
    const rect = targetEl.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;

    // Move block in data
    const dragIdx = this.blocks.findIndex(b => b.id === this.draggedBlockId);
    const [draggedBlock] = this.blocks.splice(dragIdx, 1);

    let targetIdx = this.blocks.findIndex(b => b.id === targetId);
    if (!insertBefore) targetIdx += 1;

    this.blocks.splice(targetIdx, 0, draggedBlock);

    // Clean up drag classes
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
    });

    // Incrementally move DOM element if target is inside the DOM tree
    const dragEl = this._getBlockEl(this.draggedBlockId);
    if (dragEl && targetEl.parentNode) {
      if (insertBefore) {
        targetEl.before(dragEl);
      } else {
        targetEl.after(dragEl);
      }
    }

    this.onUpdate();
    this.undoManager.saveState();
  }

  _onDragEnd(e) {
    this.draggedBlockId = null;
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
    });
  }

  // ─── Cursor Utilities ──────────────────────────

  /** Get cursor offset (character count) within a contenteditable element */
  _getCursorOffset(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return 0;
    const range = sel.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  }

  /** Set cursor at a specific character offset within a block's content element */
  _setCursorAt(blockId, offset) {
    const el = this.editorEl.querySelector(`[data-id="${blockId}"] .block-content`);
    if (!el) return;
    el.focus();

    const sel = window.getSelection();
    const range = document.createRange();

    // Walk text nodes to find the correct position
    let remaining = offset;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();

    while (node) {
      if (remaining <= node.textContent.length) {
        range.setStart(node, remaining);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= node.textContent.length;
      node = walker.nextNode();
    }

    // Fallback: place cursor at end
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ─── Data Sync ────────────────────────────────

  /** Sync all visible blocks' content from DOM to data */
  _syncAllBlocks() {
    this.blocks.forEach(block => this._syncBlock(block.id));
  }

  /** Sync a single block's content from DOM to data */
  _syncBlock(id) {
    const block = this.blocks.find(b => b.id === id);
    if (!block) return;

    const el = this.editorEl.querySelector(`[data-id="${id}"] .block-content`);
    if (!el) return;

    if (block.type === 'heading' || block.type === 'paragraph') {
      block.content = sanitizeHtml(el.innerHTML || '');
    }
  }
}
