import { applyTranslations, getLang, setLang } from './i18n.js?v=1.2.2';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme
  initTheme();

  // Initialize Language
  initLanguage();

  // Initialize Canvas Particle Background
  initParticleBackground();

  // Initialize 3D Card Hover Effects
  initCardInteractivity();

  // Initialize Troubleshooting Accordion
  initAccordions();
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

// ─── 3D Card Interactivity ─────────────────────────
function initCardInteractivity() {
  const cards = document.querySelectorAll('.glass-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside element
      const y = e.clientY - rect.top;  // y coordinate inside element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate tilt degrees (max 6deg)
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
