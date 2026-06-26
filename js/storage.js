/**
 * Storage Module — Manages content data loading, saving, and export.
 */

const STORAGE_KEY = 'teamflow_content';
const DATA_PATH = 'data/content.json';

/** Default empty content structure */
function createDefaultContent() {
  return {
    site: { name: '团队作业的博客', theme: 'light' },
    pages: [
      {
        id: 'welcome',
        title: '欢迎使用',
        icon: '👋',
        parentId: null,
        blocks: [
          { id: 'w1', type: 'heading', level: 1, content: '欢迎使用团队作业的博客' },
          { id: 'w2', type: 'paragraph', content: '这是一个专为团队项目进程展示和协作打造的门户网站后台。' }
        ]
      },
      {
        id: 'root-projects',
        title: '项目展示 / Projects Showcase',
        icon: '🚀',
        parentId: null,
        blocks: [{ id: 'rp1', type: 'paragraph', content: '在此新建子页面来展示完成的项目成果。' }]
      },
      {
        id: 'root-team',
        title: '团队成员 / Team Members',
        icon: '👥',
        parentId: null,
        blocks: [{ id: 'rt1', type: 'paragraph', content: '在此新建成员的独立子页面来更新团队分工。' }]
      },
      {
        id: 'root-timeline',
        title: '项目进程 / Timeline',
        icon: '📅',
        parentId: null,
        blocks: [{ id: 'rtl1', type: 'paragraph', content: '在此新建进程记录（如“2026-06-25 上线”）来丰富项目进展。' }]
      }
    ]
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
      const parsed = JSON.parse(cached);
      // Self-healing: if cache contains the deleted project, lacks the new pages, lacks Hkz, or Hkz is not first, force reload
      const hasBluePrince = parsed.pages?.some(p => p.id === 'project-blue-prince');
      const lacksArduino = !parsed.pages?.some(p => p.id === 'project-arduino');
      const lacksRootHomework = !parsed.pages?.some(p => p.id === 'root-homework');
      const lacksHkz = !parsed.pages?.some(p => p.id === 'member-hkz');
      const hkzIsNotFirst = parsed.pages?.filter(p => p.parentId === 'root-team')[0]?.id !== 'member-hkz';
      const hasOldHomework = parsed.pages?.some(p => p.id === 'homework-cad-design' && p.blocks?.some(b => b.content && b.content.includes('本章学习如何利用三维建模软件')));
      const hasAbsoluteImages = parsed.pages?.some(p => p.blocks?.some(b => b.type === 'image' && b.src && b.src.startsWith('/')));
      const hasMockHomework = parsed.pages?.some(p => 
        (p.id === 'homework-project-manage' || p.id === 'homework-arduino-app' || p.id === 'homework-iot-interaction') && 
        p.blocks && p.blocks.length < 20
      );
      const hasOldPurple = parsed.pages?.some(p => p.id === 'member-purple' && p.title && p.title.includes('周波'));
      const lacksProjectHistory = !parsed.pages?.some(p => p.id === 'homework-project-manage' && p.blocks?.some(b => b.content && b.content.includes('Commit: 2ef12e0')));
      const hasOld3DPrinter = parsed.pages?.some(p => p.id === 'homework-3d-printer' && p.blocks?.some(b => b.content && b.content.includes('本作业围绕')));
      const hasOldArduino = parsed.pages?.some(p => p.id === 'homework-arduino-app' && p.blocks?.some(b => b.content && b.content.includes('传感器编程 — 作业汇报')));
      if (hasBluePrince || lacksArduino || lacksRootHomework || lacksHkz || hkzIsNotFirst || hasOldHomework || hasAbsoluteImages || hasMockHomework || hasOldPurple || lacksProjectHistory || hasOld3DPrinter || hasOldArduino) {
        console.info('Stale cache detected, forcing reload from content.json');
        localStorage.removeItem(STORAGE_KEY);
      } else {
        return parsed;
      }
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

/**
 * Helper to convert HTML content back to standard Markdown syntax
 */
function convertHtmlToMarkdown(html) {
  if (!html) return '';
  let text = html;
  
  // Replace standard formatting tags
  text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  text = text.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$2~~');
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$2`');
  text = text.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Strip any remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities safely
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = text;
    return temp.textContent || temp.innerText || text;
  }
  return text;
}

/**
 * Export page content as a Markdown file download
 * @param {object} page
 */
export function exportPageAsMarkdown(page) {
  if (!page) return;
  
  let md = '';
  if (page.icon) {
    md += `# ${page.icon} ${page.title}\n\n`;
  } else {
    md += `# ${page.title}\n\n`;
  }

  page.blocks.forEach(block => {
    switch (block.type) {
      case 'heading': {
        const hashes = '#'.repeat(block.level || 1);
        md += `${hashes} ${convertHtmlToMarkdown(block.content)}\n\n`;
        break;
      }
      case 'paragraph': {
        md += `${convertHtmlToMarkdown(block.content)}\n\n`;
        break;
      }
      case 'quote': {
        md += `> ${convertHtmlToMarkdown(block.content)}\n\n`;
        break;
      }
      case 'code': {
        md += `\`\`\`\n${block.content || ''}\n\`\`\`\n\n`;
        break;
      }
      case 'bullet-list': {
        md += `- ${convertHtmlToMarkdown(block.content)}\n`;
        break;
      }
      case 'todo': {
        const checkbox = block.checked ? '[x]' : '[ ]';
        md += `- ${checkbox} ${convertHtmlToMarkdown(block.content)}\n`;
        break;
      }
      case 'image': {
        md += `![${block.caption || ''}](${block.src || ''})\n\n`;
        break;
      }
      case 'divider': {
        md += `---\n\n`;
        break;
      }
      default: {
        if (block.content) {
          md += `${convertHtmlToMarkdown(block.content)}\n\n`;
        }
        break;
      }
    }
  });

  md = md.trim() + '\n';

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const cleanTitle = (page.title || 'untitled').replace(/[/\\?%*:|"<>\s]/g, '_');
  a.download = `${cleanTitle}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
