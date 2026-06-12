import { describe, it, expect } from '../assert.js';
import { BlockEditor, processImageFile } from '../../js/editor.js';

function createTestEditor(options = {}) {
  return new BlockEditor({
    editorEl: document.createElement('div'),
    slashMenuEl: document.createElement('div'),
    floatingToolbarEl: document.createElement('div'),
    ...options
  });
}

describe('BlockEditor Engine', () => {
  it('should initialize correctly with empty blocks', () => {
    let updated = false;
    const editor = createTestEditor({
      onUpdate: () => { updated = true; }
    });

    expect(editor.blocks.length).toBe(0);
    expect(editor.editorEl.children.length).toBe(0);
  });

  it('should support loading and retrieving blocks', () => {
    const editor = createTestEditor();

    const initialBlocks = [
      { id: 'b1', type: 'paragraph', content: 'Hello' },
      { id: 'b2', type: 'heading', level: 2, content: 'Title' }
    ];

    editor.load(initialBlocks);
    expect(editor.blocks.length).toBe(2);
    expect(editor.editorEl.children.length).toBe(2);

    const retrieved = editor.getData();
    expect(retrieved.length).toBe(2);
    expect(retrieved[0].content).toBe('Hello');
  });

  it('should support adding and deleting blocks', () => {
    let updated = false;
    const editor = createTestEditor({
      onUpdate: () => { updated = true; }
    });

    const b1 = editor.addBlockAfter(null, 'paragraph', { content: 'First' });
    expect(editor.blocks.length).toBe(1);
    expect(updated).toBeTruthy();

    updated = false;
    const b2 = editor.addBlockAfter(b1.id, 'heading', { content: 'Second', level: 2 });
    expect(editor.blocks.length).toBe(2);
    expect(editor.blocks[1].id).toBe(b2.id);
    expect(updated).toBeTruthy();

    updated = false;
    // Delete b1
    editor.deleteBlock(b1.id);
    expect(editor.blocks.length).toBe(1);
    expect(editor.blocks[0].id).toBe(b2.id);
    expect(updated).toBeTruthy();
  });

  it('should prevent deleting the last block', () => {
    const editor = createTestEditor();
    editor.addBlockAfter(null, 'paragraph', { content: 'Only block' });
    
    expect(editor.blocks.length).toBe(1);
    editor.deleteBlock(editor.blocks[0].id);
    // Should NOT delete if length is <= 1
    expect(editor.blocks.length).toBe(1);
  });

  it('should support changing block types', () => {
    const editor = createTestEditor();
    const b = editor.addBlockAfter(null, 'paragraph', { content: 'Convert me' });

    editor.changeBlockType(b.id, 'heading', 3);
    expect(editor.blocks[0].type).toBe('heading');
    expect(editor.blocks[0].level).toBe(3);

    editor.changeBlockType(b.id, 'paragraph');
    expect(editor.blocks[0].type).toBe('paragraph');
    expect(editor.blocks[0].level).toBe(undefined);
  });

  it('should support reordering blocks via mock drag and drop', () => {
    const editor = createTestEditor();

    const b1 = editor.addBlockAfter(null, 'paragraph', { content: 'Block 1' });
    const b2 = editor.addBlockAfter(b1.id, 'paragraph', { content: 'Block 2' });

    expect(editor.blocks[0].id).toBe(b1.id);
    expect(editor.blocks[1].id).toBe(b2.id);

    // Simulate dragging b1 and dropping it below b2
    editor.draggedBlockId = b1.id;

    const dummyTargetEl = document.createElement('div');
    dummyTargetEl.className = 'block';
    dummyTargetEl.dataset.id = b2.id;
    // Mock getBoundingClientRect
    dummyTargetEl.getBoundingClientRect = () => ({
      top: 100,
      height: 40
    });

    const mockDropEvent = {
      preventDefault: () => {},
      target: dummyTargetEl,
      clientY: 130 // Below midpoint (100 + 40/2 = 120) -> insertAfter
    };

    editor._onDrop(mockDropEvent);

    // Now b2 should be first, and b1 should be second
    expect(editor.blocks[0].id).toBe(b2.id);
    expect(editor.blocks[1].id).toBe(b1.id);
  });

  it('should reject files exceeding MAX_IMAGE_SIZE (5MB)', async () => {
    // Generate a mock File object exceeding 5MB
    const largeBlob = new Blob([new Uint8Array(5.5 * 1024 * 1024)]);
    const largeFile = new File([largeBlob], 'too_large.png', { type: 'image/png' });

    const result = await processImageFile(largeFile);
    expect(result.error).toBeTruthy();
    expect(result.dataUrl).toBeFalsy();
  });
});
