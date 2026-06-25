import { applyTranslations, getLang, setLang } from './i18n.js';
import { loadContent } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme
  initTheme();

  // Initialize Language
  initLanguage();

  // Initialize Canvas Particle Background
  initParticleBackground();

  // Initialize Troubleshooting Accordion
  initAccordions();

  // Load and Render Portal Showcase (Dynamic CMS data)
  initPortalShowcase();

  // Initialize Developer Onboarding Collapsible
  initOnboardingCollapsible();
});

// ─── Theme Management ──────────────────────────────
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Read saved theme or default to dark (matching modern premium look)
  let savedTheme = localStorage.getItem('teamflow_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('teamflow_theme', nextTheme);
    updateThemeIcon(nextTheme);
    
    // Dispatch custom event to let other UI components know if needed
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: nextTheme }));
  });
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// ─── Language Management ───────────────────────────
function initLanguage() {
  const langBtn = document.getElementById('lang-toggle-btn');
  
  // Update translation on load
  updateLanguageLabel();
  applyTranslations();

  langBtn?.addEventListener('click', () => {
    const currentLang = getLang();
    const nextLang = currentLang === 'en' ? 'zh' : 'en';
    
    setLang(nextLang);
    updateLanguageLabel();
    applyTranslations();
    window.dispatchEvent(new CustomEvent('language-changed', { detail: nextLang }));
  });
}

function updateLanguageLabel() {
  const label = document.getElementById('lang-label');
  if (label) {
    // Show current state and toggle choice
    label.textContent = getLang() === 'en' ? '中文' : 'English';
  }
}

// ─── Canvas Particle Background ────────────────────
function initParticleBackground() {
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  let particles = [];
  const particleCount = 75;
  const connectionDistance = 110;
  
  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  // Adjust canvas size for high-DPI screens
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.baseRadius = Math.random() * 2 + 1;
      this.radius = this.baseRadius;
    }

    draw() {
      // Choose particle color depending on light/dark mode
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    update() {
      // Bounce off walls
      if (this.x < 0 || this.x > window.innerWidth) this.vx = -this.vx;
      if (this.y < 0 || this.y > window.innerHeight) this.vy = -this.vy;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Mouse Attraction/Interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          // Attract particles slightly towards mouse
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 0.6;
          this.y += (dy / dist) * force * 0.6;
          this.radius = this.baseRadius * 1.5;
        } else {
          if (this.radius > this.baseRadius) {
            this.radius -= 0.1;
          }
        }
      }
    }
  }

  // Generate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Draw lines between nearby particles
  function drawConnections() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.18;
          ctx.strokeStyle = isDark 
            ? `rgba(99, 102, 241, ${alpha})` // Indigo tint in dark mode
            : `rgba(37, 99, 235, ${alpha})`;  // Blue tint in light mode
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      // Draw connections to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const mDist = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
        if (mDist < mouse.radius) {
          const alpha = (1 - mDist / mouse.radius) * 0.25;
          ctx.strokeStyle = isDark 
            ? `rgba(139, 92, 246, ${alpha})` // Purple tint
            : `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

// ─── 3D Card Hover Interactivity Helper ────────────
function applyCardHoverEffects(selector) {
  const cards = document.querySelectorAll(selector);
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltX = ((y - centerY) / centerY) * -5;
      const tiltY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─── Troubleshooting Accordion ─────────────────────
function initAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const icon = header.querySelector('.accordion-icon');
      
      const isOpen = item.classList.contains('active');
      
      // Close other items
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-content').style.maxHeight = null;
        otherItem.querySelector('.accordion-icon').textContent = '+';
      });
      
      if (!isOpen) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.textContent = '−';
      }
    });
  });
}

// ─── Onboarding Collapsible Section ────────────────
function initOnboardingCollapsible() {
  const toggleBtn = document.getElementById('onboarding-toggle-btn');
  const content = document.getElementById('onboarding-content');
  const chevron = toggleBtn?.querySelector('.collapsible-chevron');

  toggleBtn?.addEventListener('click', () => {
    const isHidden = content.style.display === 'none';
    if (isHidden) {
      content.style.display = 'grid';
      toggleBtn.classList.add('active');
      if (chevron) chevron.textContent = '▲';
      // Smooth scroll to onboarding section
      setTimeout(() => {
        toggleBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      content.style.display = 'none';
      toggleBtn.classList.remove('active');
      if (chevron) chevron.textContent = '▼';
    }
  });
}

// ─── Dynamic CMS Showcase Loading ──────────────────
async function initPortalShowcase() {
  const container = document.getElementById('showcase-sections-container');

  try {
    const contentData = await loadContent();
    const pages = contentData.pages || [];

    if (!container) return;
    container.innerHTML = '';

    // Find all root-level pages except 'welcome'
    const rootCategories = pages.filter(p => p.parentId === null && p.id !== 'welcome');

    rootCategories.forEach(category => {
      // Filter out root pages with no children to avoid empty sections
      const subPages = pages.filter(p => p.parentId === category.id);
      if (subPages.length === 0) return;

      const section = document.createElement('section');
      section.className = 'portal-section';
      section.id = category.id;

      // Map root category IDs to their specific i18n keys if available
      let i18nKey = '';
      if (category.id === 'root-projects') i18nKey = 'landing.section.projects';
      else if (category.id === 'root-team') i18nKey = 'landing.section.team';
      else if (category.id === 'root-timeline') i18nKey = 'landing.section.timeline';

      const icon = category.icon || '📁';
      const title = category.title || 'Untitled';
      const titleSpan = i18nKey
        ? `<span data-i18n="${i18nKey}">${title}</span>`
        : `<span>${title}</span>`;

      section.innerHTML = `
        <h2 class="section-title">
          <span class="title-icon">${icon}</span>
          ${titleSpan}
        </h2>
        <div class="section-content-target"></div>
      `;

      container.appendChild(section);

      const targetContainer = section.querySelector('.section-content-target');
      const layout = category.layout || 'grid';

      // Route based on layout type
      if (layout === 'timeline') {
        targetContainer.className = 'timeline-wrapper';
        const innerTimeline = document.createElement('div');
        innerTimeline.className = 'timeline-container';
        targetContainer.appendChild(innerTimeline);
        renderTimelineList(subPages, innerTimeline);
      } else if (layout === 'list') {
        renderSimpleList(subPages, targetContainer);
      } else {
        // Grid (default)
        if (category.id === 'root-team') {
          targetContainer.className = 'team-showcase-grid';
          renderTeamList(subPages, targetContainer);
        } else {
          targetContainer.className = 'projects-grid';
          renderProjectsList(subPages, targetContainer);
        }
      }
    });

    // Translate dynamic elements
    applyTranslations();

    // Re-bind theme listener to redraw cards with updated colors if theme changes
    window.addEventListener('theme-changed', () => {
      applyCardHoverEffects('.glass-card');
      applyCardHoverEffects('.list-item-card');
    });

  } catch (error) {
    console.error('Error rendering portal showcase:', error);
    if (container) {
      container.innerHTML = `<div class="error-placeholder" style="text-align: center; padding: 40px; color: var(--text-secondary);">Failed to load content.</div>`;
    }
  }

  // Setup Reader Modal closing handlers
  initReaderModal();
}

/** Helper to extract a summary paragraph from page blocks */
function getPageSummary(page) {
  if (!page.blocks || page.blocks.length === 0) return 'No description available.';
  // Find first paragraph block
  const pBlock = page.blocks.find(b => b.type === 'paragraph' && b.content.trim() !== '');
  if (pBlock) {
    const content = pBlock.content.trim();
    return content.length > 120 ? content.substring(0, 117) + '...' : content;
  }
  return 'No description available.';
}

/** Render project cards */
function renderProjectsList(projects, container) {
  if (!container) return;
  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = `<div class="empty-placeholder">No projects posted yet. Click "管理后台" to add one!</div>`;
    return;
  }

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'info-card glass-card project-showcase-card';
    card.style.cursor = 'pointer';

    const icon = project.icon || '📄';
    const summary = getPageSummary(project);

    // Detect technical keywords for mock tag pills
    const tags = [];
    const allContentText = (project.blocks || []).map(b => b.content || '').join(' ').toLowerCase();
    if (allContentText.includes('il2cpp') || allContentText.includes('unity')) tags.push('Unity');
    if (allContentText.includes('ssl') || allContentText.includes('github')) tags.push('Web Security');
    if (allContentText.includes('canvas') || allContentText.includes('compress')) tags.push('Canvas');
    if (allContentText.includes('testing') || allContentText.includes('runner')) tags.push('Automation');
    if (tags.length === 0) tags.push('Team Wiki');

    const tagsHtml = tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');

    card.innerHTML = `
      <div class="card-header">
        <span class="card-icon">${icon}</span>
        <h3>${project.title || 'Untitled'}</h3>
      </div>
      <p class="card-description">${summary}</p>
      <div class="project-tags-area">
        ${tagsHtml}
      </div>
      <div class="project-card-footer">
        <span class="read-more-text">Browse Project →</span>
      </div>
    `;

    card.addEventListener('click', () => {
      openReaderModal(project);
    });

    container.appendChild(card);
  });

  applyCardHoverEffects('.project-showcase-card');
}

/** Render team member cards */
function renderTeamList(members, container) {
  if (!container) return;
  container.innerHTML = '';

  if (members.length === 0) {
    container.innerHTML = `<div class="empty-placeholder">No team members registered yet.</div>`;
    return;
  }

  members.forEach(member => {
    const card = document.createElement('div');
    card.className = 'info-card glass-card team-member-card';
    card.style.cursor = 'pointer';

    const icon = member.icon || '🧑‍💻';
    const summary = getPageSummary(member);

    // Find heading or first line for role details
    let roleText = 'Team Member';
    const headingBlock = (member.blocks || []).find(b => b.type === 'heading');
    if (headingBlock) {
      // Split by '—' or ':'
      const parts = headingBlock.content.split(/[—:]/);
      if (parts.length > 1) {
        roleText = parts[1].trim();
      } else {
        roleText = headingBlock.content.trim();
      }
    }

    card.innerHTML = `
      <div class="team-member-header">
        <div class="member-avatar">${icon}</div>
        <div class="member-meta">
          <h3 class="member-name">${member.title || 'Anonymous'}</h3>
          <span class="member-role">${roleText}</span>
        </div>
      </div>
      <p class="member-summary">${summary}</p>
      <div class="member-card-footer">
        <span class="read-more-text">View Contributions →</span>
      </div>
    `;

    card.addEventListener('click', () => {
      openReaderModal(member);
    });

    container.appendChild(card);
  });

  applyCardHoverEffects('.team-member-card');
}

/** Render project progress timeline */
function renderTimelineList(milestones, container) {
  if (!container) return;
  container.innerHTML = '';

  if (milestones.length === 0) {
    container.innerHTML = `<div class="empty-placeholder">No progress milestones recorded yet.</div>`;
    return;
  }

  // Parse YYYY-MM-DD from title and sort descending (newest first)
  const dateRegex = /^(\d{4}-\d{2}-\d{2})/;
  milestones.sort((a, b) => {
    const matchA = (a.title || '').match(dateRegex);
    const matchB = (b.title || '').match(dateRegex);
    const dateA = matchA ? matchA[1] : '0000-00-00';
    const dateB = matchB ? matchB[1] : '0000-00-00';
    return dateB.localeCompare(dateA); // Newest first
  });

  milestones.forEach((milestone, idx) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    const milestoneTitle = milestone.title || '';
    const match = milestoneTitle.match(dateRegex);
    const dateStr = match ? match[1] : 'Recent';
    let titleStr = milestoneTitle;
    if (match) {
      // Strip date from display title
      titleStr = milestoneTitle.substring(match[0].length).trim();
    }

    const icon = milestone.icon || '✨';
    const summary = getPageSummary(milestone);

    item.innerHTML = `
      <div class="timeline-dot-icon">${icon}</div>
      <div class="timeline-content glass-card">
        <div class="timeline-header">
          <span class="timeline-date">${dateStr}</span>
          <h4 class="timeline-title">${titleStr}</h4>
        </div>
        <p class="timeline-desc">${summary}</p>
        <div class="timeline-footer">
          <button class="timeline-details-btn">Details →</button>
        </div>
      </div>
    `;

    item.querySelector('.timeline-details-btn').addEventListener('click', () => {
      openReaderModal(milestone);
    });

    container.appendChild(item);
  });
}

/** Render simple list (vertical) */
function renderSimpleList(items, container) {
  if (!container) return;
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-placeholder">No items posted yet.</div>`;
    return;
  }

  const listContainer = document.createElement('div');
  listContainer.className = 'list-layout-container';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'list-item-card glass-card';
    card.style.cursor = 'pointer';

    const icon = item.icon || '📄';
    const summary = getPageSummary(item);

    card.innerHTML = `
      <div class="list-item-main" style="flex: 1;">
        <div class="list-item-header" style="display: flex; align-items: center; gap: 8px;">
          <span class="list-item-icon" style="font-size: 1.15rem; display: flex; align-items: center; justify-content: center;">${icon}</span>
          <h3 class="list-item-title" style="margin: 0; font-size: 1.05rem; font-weight: 600; color: var(--text-primary);">${item.title || 'Untitled'}</h3>
        </div>
        <p class="list-item-desc" style="margin: 6px 0 0 28px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${summary}</p>
      </div>
      <div class="list-item-action" style="font-size: 0.85rem; font-weight: 500; color: var(--accent-color); white-space: nowrap; margin-left: 16px; transition: transform 0.2s ease;">
        Browse →
      </div>
    `;

    card.addEventListener('click', () => {
      openReaderModal(item);
    });

    listContainer.appendChild(card);
  });

  container.appendChild(listContainer);
  applyCardHoverEffects('.list-item-card');
}

// ─── Reader Modal Display Engine ───────────────────
function initReaderModal() {
  const modal = document.getElementById('reader-modal');
  const closeBtn = document.getElementById('reader-modal-close-btn');

  closeBtn?.addEventListener('click', () => {
    closeReaderModal();
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeReaderModal();
    }
  });

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.style.display === 'flex') {
      closeReaderModal();
    }
  });
}

function openReaderModal(page) {
  const modal = document.getElementById('reader-modal');
  const iconEl = document.getElementById('reader-modal-icon');
  const titleEl = document.querySelector('.reader-modal-title');
  const bodyEl = document.getElementById('reader-modal-body');

  if (!modal || !bodyEl) return;

  iconEl.textContent = page.icon || '📄';
  titleEl.textContent = page.title;
  bodyEl.innerHTML = '';

  // Render blocks
  const blocks = page.blocks || [];
  if (blocks.length === 0) {
    bodyEl.innerHTML = `<p class="reader-paragraph text-empty">Empty page.</p>`;
  } else {
    blocks.forEach(block => {
      const el = compileBlockToHtml(block);
      if (el) bodyEl.appendChild(el);
    });
  }

  // Display modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Lock background scroll
  
  // Animation entrance trigger
  requestAnimationFrame(() => {
    modal.classList.add('visible');
  });
}

function closeReaderModal() {
  const modal = document.getElementById('reader-modal');
  if (!modal) return;

  modal.classList.remove('visible');
  document.body.style.overflow = ''; // Restore background scroll

  // Hide after transition completes
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

/** Parses editor block object to corresponding DOM nodes */
function compileBlockToHtml(block) {
  switch (block.type) {
    case 'heading': {
      const heading = document.createElement(`h${block.level || 2}`);
      heading.className = `reader-heading h${block.level || 2}`;
      heading.textContent = block.content || '';
      return heading;
    }
    case 'paragraph': {
      const p = document.createElement('p');
      p.className = 'reader-paragraph';
      
      // Parse markdown-like bold/italic/underline links or HTML
      let html = block.content || '';
      p.innerHTML = html;
      return p;
    }
    case 'image': {
      const wrap = document.createElement('div');
      wrap.className = 'reader-image-wrap';
      if (block.src) {
        const img = document.createElement('img');
        img.src = block.src;
        img.alt = block.caption || 'Project Image';
        wrap.appendChild(img);
      }
      if (block.caption) {
        const cap = document.createElement('p');
        cap.className = 'reader-image-caption';
        cap.textContent = block.caption;
        wrap.appendChild(cap);
      }
      return wrap;
    }
    case 'divider': {
      const hr = document.createElement('hr');
      hr.className = 'reader-divider';
      return hr;
    }
    default:
      return null;
  }
}
