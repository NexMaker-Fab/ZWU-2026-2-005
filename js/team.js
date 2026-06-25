import { applyTranslations, getLang, setLang } from './i18n.js';
import { loadContent } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initParticleBackground();
  initTeamPage();
});

// ─── Theme Management ──────────────────────────────
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  let savedTheme = localStorage.getItem('teamflow_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('teamflow_theme', nextTheme);
    updateThemeIcon(nextTheme);
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
  
  const mouse = { x: null, y: null, radius: 150 };

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
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

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
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    update() {
      if (this.x < 0 || this.x > window.innerWidth) this.vx = -this.vx;
      if (this.y < 0 || this.y > window.innerHeight) this.vy = -this.vy;
      this.x += this.vx;
      this.y += this.vy;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 0.6;
          this.y += (dy / dist) * force * 0.6;
          this.radius = this.baseRadius * 1.5;
        } else {
          if (this.radius > this.baseRadius) this.radius -= 0.1;
        }
      }
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  function drawConnections() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.18;
          ctx.strokeStyle = isDark ? `rgba(99, 102, 241, ${alpha})` : `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      if (mouse.x !== null && mouse.y !== null) {
        const mDist = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
        if (mDist < mouse.radius) {
          const alpha = (1 - mDist / mouse.radius) * 0.25;
          ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${alpha})` : `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animationFrameId = requestAnimationFrame(animate);
  }
  animate();
}

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
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ─── Team Loading ──────────────────────────────────
async function initTeamPage() {
  const teamGrid = document.getElementById('team-showcase-grid');
  if (!teamGrid) return;

  try {
    const contentData = await loadContent();
    const pages = contentData.pages || [];
    const members = pages.filter(p => p.parentId === 'root-team');

    teamGrid.innerHTML = '';
    if (members.length === 0) {
      teamGrid.innerHTML = `<div class="empty-placeholder">No team members registered yet.</div>`;
      return;
    }

    members.forEach(member => {
      const card = document.createElement('div');
      card.className = 'info-card glass-card team-member-card';
      card.style.cursor = 'pointer';

      const icon = member.icon || '🧑‍💻';
      
      // Find role details
      let roleText = 'Team Member';
      const headingBlock = (member.blocks || []).find(b => b.type === 'heading');
      if (headingBlock) {
        const parts = headingBlock.content.split(/[—:]/);
        roleText = parts.length > 1 ? parts[1].trim() : headingBlock.content.trim();
      }

      // Find first paragraph block
      let summary = 'No description available.';
      const pBlock = (member.blocks || []).find(b => b.type === 'paragraph' && b.content.trim() !== '');
      if (pBlock) {
        const content = pBlock.content.replace(/<[^>]+>/g, '').trim();
        summary = content.length > 120 ? content.substring(0, 117) + '...' : content;
      }

      card.innerHTML = `
        <div class="team-member-header">
          <div class="member-avatar" style="background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%); display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:1.4rem;">${icon}</div>
          <div class="member-meta">
            <h3 class="member-name">${member.title || 'Anonymous'}</h3>
            <span class="member-role">${roleText}</span>
          </div>
        </div>
        <p class="member-summary" style="margin-top:12px; font-size:0.85rem; color:var(--text-muted); line-height:1.5;">${summary}</p>
        <div class="member-card-footer" style="margin-top:16px; font-size:0.85rem; font-weight:600; color:var(--accent-primary);">
          <span class="read-more-text">Visit Personal Site →</span>
        </div>
      `;

      card.addEventListener('click', () => {
        let folderName = member.id.replace('member-', '').toLowerCase();
        if (!member.id.startsWith('member-')) {
          folderName = (member.title || '').replace(/\s+/g, '').toLowerCase();
        }
        window.open(`members/${folderName}/index.html`, '_blank');
      });

      teamGrid.appendChild(card);
    });

    applyCardHoverEffects('.team-member-card');
    window.addEventListener('theme-changed', () => applyCardHoverEffects('.team-member-card'));

  } catch (error) {
    console.error('Error loading team page:', error);
    teamGrid.innerHTML = `<div class="error-placeholder">Failed to load content.</div>`;
  }
}
