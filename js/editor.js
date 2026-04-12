/**
 * Block Editor Module — The core editing engine.
 * Handles block creation, editing, deletion, drag-and-drop, slash commands, and toolbar.
 */

import { generateId } from './storage.js';

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

    this._bindEvents();
  }

  // ─── Public API ───────────────────────────────

  /** Load blocks and render */
  load(blocks) {
    this.blocks = blocks || [];
    this.render();
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
        block.content = extraData.content || '';
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

  /** Add a block after a given block ID, or at the end */
  addBlockAfter(afterId, type, extraData = {}) {
    const block = this.createBlock(type, extraData);
    if (afterId) {
      const idx = this.blocks.findIndex(b => b.id === afterId);
      this.blocks.splice(idx + 1, 0, block);
    } else {
      this.blocks.push(block);
    }
    this.render();
    this.onUpdate();

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
    this.render();
    this.onUpdate();
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

    this.render();
    this.onUpdate();

    // Focus the changed block
    requestAnimationFrame(() => {
      const el = this.editorEl.querySelector(`[data-id="${id}"] .block-content`);
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
    wrapper.draggable = true;

    // Controls container (handle + add button)
    const controls = document.createElement('div');
    controls.className = 'block-controls';

    const addBtn = document.createElement('button');
    addBtn.className = 'block-add-btn';
    addBtn.innerHTML = '+';
    addBtn.title = 'Add block below';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.addBlockAfter(block.id, 'paragraph');
    });

    const handle = document.createElement('div');
    handle.className = 'block-handle';
    handle.innerHTML = '⠿';
    handle.title = 'Drag to reorder';

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
        el.dataset.placeholder = `Heading ${block.level || 1}`;
        el.textContent = block.content || '';
        return el;
      }
      case 'paragraph': {
        const el = document.createElement('div');
        el.className = 'block-content';
        el.contentEditable = 'true';
        el.dataset.type = 'paragraph';
        el.dataset.placeholder = "Type '/' for commands...";
        el.textContent = block.content || '';
        return el;
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
          caption.dataset.placeholder = 'Write a caption...';
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
        el.textContent = block.content || '';
        return el;
      }
    }
  }

  _createImageUpload(block) {
    const area = document.createElement('div');
    area.className = 'image-upload-area';

    area.innerHTML = `
      <div class="image-upload-icon">🖼️</div>
      <div class="image-upload-text">Click to upload an image or paste a URL below</div>
      <input type="file" class="image-upload-input" accept="image/*">
      <input type="text" class="image-url-input" placeholder="Paste image URL and press Enter">
    `;

    const fileInput = area.querySelector('.image-upload-input');
    const urlInput = area.querySelector('.image-url-input');

    // Click area to trigger file upload
    area.addEventListener('click', (e) => {
      if (e.target !== urlInput) {
        fileInput.click();
      }
    });

    // Handle file upload — convert to base64
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        block.src = ev.target.result;
        this.render();
        this.onUpdate();
      };
      reader.readAsDataURL(file);
    });

    // Handle URL input
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (url) {
          block.src = url;
          this.render();
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
    // Input handler — debounced auto-save
    let saveTimer = null;
    this.editorEl.addEventListener('input', (e) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        this._syncAllBlocks();
        this.onUpdate();
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

    // Selection change — show/hide floating toolbar
    document.addEventListener('selectionchange', () => {
      this._handleSelectionChange();
    });

    // Slash menu item clicks
    this.slashMenuEl.addEventListener('click', (e) => {
      const item = e.target.closest('.slash-menu-item');
      if (!item) return;
      const type = item.dataset.type;
      this._executeSlashCommand(type);
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

    // Enter — create new block below
    if (e.key === 'Enter' && !e.shiftKey) {
      const type = blockEl.dataset.type;
      if (type === 'divider') return;

      e.preventDefault();
      this._syncBlock(blockId);
      this.addBlockAfter(blockId, 'paragraph');
    }

    // Backspace on empty block — delete it
    if (e.key === 'Backspace') {
      const content = e.target.textContent;
      if (content === '' && this.blocks.length > 1) {
        e.preventDefault();
        // Focus previous block
        const idx = this.blocks.findIndex(b => b.id === blockId);
        if (idx > 0) {
          const prevId = this.blocks[idx - 1].id;
          this.deleteBlock(blockId);
          requestAnimationFrame(() => {
            const prevEl = this.editorEl.querySelector(`[data-id="${prevId}"] .block-content`);
            if (prevEl) {
              prevEl.focus();
              // Move cursor to end
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

    // Slash command detection
    if (e.key === '/' && e.target.textContent === '') {
      e.preventDefault();
      this.slashMenuTarget = blockId;
      this._showSlashMenu(e.target);
    }

    // Escape — close menus
    if (e.key === 'Escape') {
      this._hideSlashMenu();
      this._hideToolbar();
    }

    // Arrow navigation between blocks
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;

      const idx = this.blocks.findIndex(b => b.id === blockId);
      let targetIdx = -1;

      if (e.key === 'ArrowUp') {
        const range = sel.getRangeAt(0);
        // Check if cursor is at start of block
        if (range.startOffset === 0 && idx > 0) {
          targetIdx = idx - 1;
        }
      } else {
        const text = e.target.textContent || '';
        const range = sel.getRangeAt(0);
        if (range.endOffset >= text.length && idx < this.blocks.length - 1) {
          targetIdx = idx + 1;
        }
      }

      if (targetIdx >= 0) {
        e.preventDefault();
        const targetId = this.blocks[targetIdx].id;
        const targetEl = this.editorEl.querySelector(`[data-id="${targetId}"] .block-content`);
        if (targetEl && targetEl.contentEditable === 'true') {
          targetEl.focus();
        }
      }
    }
  }

  // ─── Slash Command Menu ───────────────────────

  _showSlashMenu(anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    this.slashMenuEl.style.top = `${rect.bottom + 4}px`;
    this.slashMenuEl.style.left = `${rect.left}px`;
    this.slashMenuEl.classList.add('visible');

    // Highlight first item
    const items = this.slashMenuEl.querySelectorAll('.slash-menu-item');
    items.forEach(i => i.classList.remove('active'));
    if (items[0]) items[0].classList.add('active');
  }

  _hideSlashMenu() {
    this.slashMenuEl.classList.remove('visible');
    this.slashMenuTarget = null;
  }

  _executeSlashCommand(type) {
    this._hideSlashMenu();
    if (!this.slashMenuTarget) return;

    const blockId = this.slashMenuTarget;
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
      this._hideToolbar();
      return;
    }

    // Check if selection is within editor
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

    // Position toolbar above selection
    const rect = range.getBoundingClientRect();
    const tbWidth = 280; // approximate toolbar width
    this.toolbarEl.style.top = `${rect.top - 44}px`;
    this.toolbarEl.style.left = `${Math.max(8, rect.left + rect.width / 2 - tbWidth / 2)}px`;
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
    this._hideToolbar();
  }

  // ─── Drag & Drop ──────────────────────────────

  _onDragStart(e) {
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

    // Clean up and re-render
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
    });

    this.render();
    this.onUpdate();
  }

  _onDragEnd(e) {
    this.draggedBlockId = null;
    this.editorEl.querySelectorAll('.block').forEach(b => {
      b.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
    });
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
      block.content = el.textContent || '';
    }
  }
}
