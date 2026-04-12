/**
 * Storage Module — Manages content data loading, saving, and export.
 */

const STORAGE_KEY = 'teamflow_content';
const DATA_PATH = 'data/content.json';

/** Default empty content structure */
function createDefaultContent() {
  return {
    site: { name: 'TeamFlow Wiki', theme: 'light' },
    pages: [{
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
        content: 'Start typing here...'
      }]
    }]
  };
}

/** Generate a short unique ID */
export function generateId() {
  return 'b' + Math.random().toString(36).substring(2, 9);
}

/**
 * Load content from localStorage first, then fall back to content.json
 */
export async function loadContent() {
  // Try localStorage first (for unsaved edits)
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed to parse cached content:', e);
    }
  }

  // Fetch from data/content.json
  try {
    const resp = await fetch(DATA_PATH);
    if (resp.ok) {
      const data = await resp.json();
      // Cache for next time
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch content.json:', e);
  }

  // Return default content as last resort
  return createDefaultContent();
}

/**
 * Save content to localStorage (auto-save)
 */
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

/**
 * Export content as a JSON file download
 */
export function exportAsJson(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clear cached content from localStorage
 */
export function clearCache() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get the theme preference
 */
export function getTheme() {
  return localStorage.getItem('teamflow_theme') || 'light';
}

/**
 * Save theme preference
 */
export function setTheme(theme) {
  localStorage.setItem('teamflow_theme', theme);
}
