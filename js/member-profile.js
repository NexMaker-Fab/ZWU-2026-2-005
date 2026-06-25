import { applyTranslations, getLang, setLang } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initParticleBackground();
  initTabs();
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

// ─── Tabs Switching ────────────────────────────────
function initTabs() {
  const buttons = document.querySelectorAll('.profile-nav-btn');
  const panes = document.querySelectorAll('.tab-pane');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) return;

      // Deactivate all
      buttons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      // Activate clicked
      btn.classList.add('active');
      const activePane = document.getElementById(tabId);
      if (activePane) activePane.classList.add('active');
    });
  });
}

// ─── Canvas Particle Background ────────────────────
function initParticleBackground() {
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let particles = [];
  const particleCount = 60;
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
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.baseRadius = Math.random() * 2 + 1;
      this.radius = this.baseRadius;
    }
    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(15, 23, 42, 0.1)';
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
          this.x += (dx / dist) * force * 0.5;
          this.y += (dy / dist) * force * 0.5;
          this.radius = this.baseRadius * 1.4;
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
          const alpha = (1 - dist / connectionDistance) * 0.15;
          ctx.strokeStyle = isDark ? `rgba(99, 102, 241, ${alpha})` : `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
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
