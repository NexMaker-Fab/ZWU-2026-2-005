import { applyTranslations, getLang, setLang } from './i18n.js';

let activeMood = "happy";
let currentTheme = "dark";

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initParticleBackground();
  initRobotDashboard();
});

// ─── Theme Management ──────────────────────────────
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  let savedTheme = localStorage.getItem('teamflow_theme') || 'dark';
  currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let nextTheme = theme === 'dark' ? 'light' : 'dark';
    currentTheme = nextTheme;
    
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
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(15, 23, 42, 0.15)';
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

// ─── Robot Dashboard Logic ────────────────────────
function initRobotDashboard() {
  initMoodButtons();
  startFaceSimulator();
  startSensorSimulation();
  startConsoleSimulation();
}

function initMoodButtons() {
  const buttons = document.querySelectorAll('.mood-btn');
  const badge = document.getElementById('robot-mood-badge');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary', 'active');
      
      const mood = btn.getAttribute('data-mood');
      activeMood = mood;
      if (badge) {
        badge.textContent = mood;
      }
      
      logToConsole(`[COMMAND] Emotion state updated to: ${mood.toUpperCase()}`, "info");
    });
  });
}

// ─── Canvas OLED Face Simulator ──────────────────
function startFaceSimulator() {
  const canvas = document.getElementById('robot-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let startTime = Date.now();
  let nextBlink = startTime + 3000 + Math.random() * 2000;
  let isBlinking = false;
  let blinkEndTime = 0;
  
  let particles = []; // Floating Zs or Hearts

  function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const d = size;
    ctx.moveTo(x, y - d / 4);
    ctx.bezierCurveTo(x - d/2, y - d, x - d, y - d/2, x - d, y);
    ctx.bezierCurveTo(x - d, y + d/2, x - d/2, y + d, x, y + d * 1.2);
    ctx.bezierCurveTo(x + d/2, y + d, x + d, y + d/2, x + d, y);
    ctx.bezierCurveTo(x + d, y - d/2, x + d/2, y - d, x, y - d/4);
    ctx.closePath();
    ctx.fillStyle = '#ec4899';
    ctx.fill();
  }

  function renderFaceLoop() {
    const time = Date.now();
    const elapsed = time - startTime;
    
    // Clear screen
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // OLED screen grid effect (subtle vertical/horizontal scanlines)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.008)';
    for(let y=0; y < canvas.height; y+=3) {
      ctx.fillRect(0, y, canvas.width, 1.5);
    }

    // Eye base parameters
    const eyeY = 110 + Math.sin(time / 300) * 3; // Breathing float
    
    // Handle blinking logic
    if (time > nextBlink && activeMood !== "sleeping") {
      isBlinking = true;
      blinkEndTime = time + 140; // Blink duration 140ms
      nextBlink = time + 4000 + Math.random() * 3000;
    }
    
    if (isBlinking && time > blinkEndTime) {
      isBlinking = false;
    }

    // Spawn mood particles
    if (activeMood === "sleeping" && Math.random() < 0.02) {
      // Spawn a Z
      particles.push({
        type: 'Z',
        x: 280,
        y: 80,
        vx: 0.4 + Math.random() * 0.3,
        vy: -0.5 - Math.random() * 0.5,
        alpha: 1.0,
        size: 12 + Math.random() * 6
      });
    } else if (activeMood === "love" && Math.random() < 0.04) {
      // Spawn a tiny heart
      particles.push({
        type: 'Heart',
        x: 100 + Math.random() * 200,
        y: 130,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.6 - Math.random() * 0.4,
        alpha: 1.0,
        size: 6 + Math.random() * 6
      });
    }

    // Update & draw particles
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.01;
      
      if (p.alpha <= 0) {
        particles.splice(idx, 1);
        return;
      }
      
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.type === 'Z') {
        ctx.fillStyle = '#06b6d4';
        ctx.font = `bold ${p.size}px 'Fira Code', monospace`;
        ctx.fillText("Z", p.x, p.y);
      } else {
        drawHeart(ctx, p.x, p.y, p.size);
      }
      ctx.restore();
    });

    // Draw eyes
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.fillStyle = '#38bdf8';

    if (isBlinking) {
      // Blinking: draw flat line slits
      ctx.beginPath();
      ctx.moveTo(110, eyeY); ctx.lineTo(150, eyeY);
      ctx.moveTo(250, eyeY); ctx.lineTo(290, eyeY);
      ctx.stroke();
    } else {
      switch (activeMood) {
        case "happy":
          // Curved smiling eyes (inverted U)
          ctx.beginPath();
          ctx.arc(130, eyeY + 5, 20, Math.PI, 0, false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(270, eyeY + 5, 20, Math.PI, 0, false);
          ctx.stroke();
          break;
          
        case "sad":
          // Sad downturned eyes (U shape)
          ctx.beginPath();
          ctx.arc(130, eyeY - 8, 20, 0, Math.PI, false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(270, eyeY - 8, 20, 0, Math.PI, false);
          ctx.stroke();
          break;
          
        case "sleeping":
          // Horizontal sleepy slits (flashing slightly)
          ctx.beginPath();
          ctx.moveTo(110, eyeY + 5); ctx.lineTo(150, eyeY + 5);
          ctx.moveTo(250, eyeY + 5); ctx.lineTo(290, eyeY + 5);
          ctx.stroke();
          break;
          
        case "love":
          // Big pink glowing hearts!
          drawHeart(ctx, 130, eyeY, 18);
          drawHeart(ctx, 270, eyeY, 18);
          break;
      }
    }
    
    // Draw subtle mouth
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (activeMood === "happy" || activeMood === "love") {
      ctx.arc(200, eyeY + 25, 12, 0, Math.PI, false); // Smile
    } else if (activeMood === "sad") {
      ctx.arc(200, eyeY + 38, 10, Math.PI, 0, false); // Frown
    } else {
      ctx.moveTo(190, eyeY + 30); ctx.lineTo(210, eyeY + 30); // Sleep straight mouth
    }
    ctx.stroke();

    requestAnimationFrame(renderFaceLoop);
  }

  renderFaceLoop();
}

// ─── Sensor Telemetry Simulation ──────────────────
function startSensorSimulation() {
  const hrValEl = document.getElementById('hr-value');
  const tempValEl = document.getElementById('temp-value');
  const stabValEl = document.getElementById('stability-value');
  
  // Graph canvases
  const hrCanvas = document.getElementById('hr-graph');
  const tempCanvas = document.getElementById('temp-graph');
  const stabCanvas = document.getElementById('stability-graph');

  if (!hrCanvas || !tempCanvas || !stabCanvas) return;

  const hrCtx = hrCanvas.getContext('2d');
  const tempCtx = tempCanvas.getContext('2d');
  const stabCtx = stabCanvas.getContext('2d');

  // History buffers
  const maxHistory = 40;
  let hrHistory = new Array(maxHistory).fill(40);
  let tempHistory = new Array(maxHistory).fill(30);
  let stabHistory = new Array(maxHistory).fill(50);

  let hrBeatTime = 0;
  let timeVal = 0;

  function updateSensors() {
    timeVal += 0.1;
    
    // 1. Temperature Calculation
    const targetTemp = activeMood === "sleeping" ? 36.4 : 36.8;
    const currentTemp = targetTemp + Math.sin(timeVal / 5) * 0.1 + (Math.random() - 0.5) * 0.05;
    if (tempValEl) tempValEl.textContent = currentTemp.toFixed(1);
    tempHistory.push(currentTemp);
    if (tempHistory.length > maxHistory) tempHistory.shift();

    // 2. Stability Calculation
    const baseStab = activeMood === "sleeping" ? 99.8 : (activeMood === "sad" ? 92.0 : 98.2);
    const currentStab = baseStab + (Math.random() - 0.5) * 0.6 - (Math.random() < 0.04 ? 8.0 : 0.0);
    const displayStab = Math.min(100, Math.max(0, currentStab));
    if (stabValEl) stabValEl.textContent = displayStab.toFixed(1);
    stabHistory.push(displayStab);
    if (stabHistory.length > maxHistory) stabHistory.shift();

    // 3. Heart Rate Calculation (ECG Simulation)
    let baseHR = 72;
    if (activeMood === "happy") baseHR = 80;
    if (activeMood === "love") baseHR = 92;
    if (activeMood === "sleeping") baseHR = 60;
    if (activeMood === "sad") baseHR = 65;
    
    if (hrValEl) {
      const displayHR = Math.floor(baseHR + Math.sin(timeVal) * 2 + (Math.random() - 0.5) * 2);
      hrValEl.textContent = displayHR;
    }

    // ECG Heart beat cycle simulation
    const cycleMs = (60 / baseHR) * 1000;
    const now = Date.now();
    const cycleElapsed = (now - hrBeatTime) % cycleMs;
    
    let ecgY = 30; // base flat line
    
    // ECG Waveform mapping
    if (cycleElapsed < 100) {
      ecgY = 30;
    } else if (cycleElapsed >= 100 && cycleElapsed < 180) {
      // P wave (small bump)
      const ratio = (cycleElapsed - 100) / 80;
      ecgY = 30 - Math.sin(ratio * Math.PI) * 4;
    } else if (cycleElapsed >= 180 && cycleElapsed < 220) {
      // Flat PR segment
      ecgY = 30;
    } else if (cycleElapsed >= 220 && cycleElapsed < 240) {
      // Q wave (dip)
      const ratio = (cycleElapsed - 220) / 20;
      ecgY = 30 + ratio * 6;
    } else if (cycleElapsed >= 240 && cycleElapsed < 270) {
      // R wave (huge spike)
      const ratio = (cycleElapsed - 240) / 30;
      ecgY = 36 - ratio * 42;
    } else if (cycleElapsed >= 270 && cycleElapsed < 300) {
      // S wave (deep dip)
      const ratio = (cycleElapsed - 270) / 30;
      ecgY = -6 + ratio * 46;
    } else if (cycleElapsed >= 300 && cycleElapsed < 330) {
      // Return to baseline
      const ratio = (cycleElapsed - 300) / 30;
      ecgY = 40 - ratio * 10;
    } else if (cycleElapsed >= 330 && cycleElapsed < 420) {
      // Flat ST
      ecgY = 30;
    } else if (cycleElapsed >= 420 && cycleElapsed < 520) {
      // T wave (medium bump)
      const ratio = (cycleElapsed - 420) / 100;
      ecgY = 30 - Math.sin(ratio * Math.PI) * 8;
    } else {
      // Baseline
      ecgY = 30;
    }

    hrHistory.push(ecgY);
    if (hrHistory.length > maxHistory) hrHistory.shift();

    // Render graphs
    drawGraph(hrCtx, hrHistory, '#f43f5e', 0, 60);
    drawGraph(tempCtx, tempHistory, '#f59e0b', 35.8, 37.8);
    drawGraph(stabCtx, stabHistory, '#10b981', 80, 101);

    setTimeout(updateSensors, 50); // High-frequency polling for smooth ECG scrolling
  }

  function drawGraph(ctx, history, color, minVal, maxVal) {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grids
    ctx.strokeStyle = currentTheme === "dark" ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += 15) {
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    const step = canvas.width / (maxHistory - 1);
    
    history.forEach((val, i) => {
      const x = i * step;
      let y;
      
      if (minVal === 0 && maxVal === 60) {
        // Special mapping for raw ECG values
        y = val;
      } else {
        // Normal scale mapping
        const ratio = (val - minVal) / (maxVal - minVal);
        y = canvas.height - (ratio * (canvas.height - 10) + 5);
      }
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();

    // Draw gradient fill below graph line (except for raw ECG)
    if (!(minVal === 0 && maxVal === 60)) {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, color.replace(')', ', 0.15)').replace('#', 'rgba(')); // rough conversion helper or hardcoded
      if (color === '#f59e0b') grad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      if (color === '#10b981') grad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.lineTo((history.length - 1) * step, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
  }

  updateSensors();
}

// ─── Arduino Console Log Simulation ──────────────
function startConsoleSimulation() {
  const consoleEl = document.getElementById('console-lines');
  if (!consoleEl) return;

  const logs = [
    { text: "Initializing I2C bus...", type: "info" },
    { text: "OLED display SSD1306 found at address 0x3C", type: "success" },
    { text: "DHT11 Temperature Sensor online.", type: "success" },
    { text: "MAX30102 Biometrics module online.", type: "success" },
    { text: "Calibrating MPU6050 Accelerometer (do not move)...", type: "info" },
    { text: "Calibration complete. Offset X: 0.02, Y: -0.04, Z: 0.98", type: "success" },
    { text: "BLE Advertising started. Device ID: ZWU-EmotionalRobot-005", type: "info" },
    { text: "Entering loop: Standby state: HAPPY.", type: "success" }
  ];

  logs.forEach(log => logToConsole(log.text, log.type));

  const simulationEvents = [
    { text: "BLE packet received: command [STATE_MOOD = SAD]", type: "info", triggerMood: "sad" },
    { text: "Servo motors X-axis offset set to -12 deg.", type: "info" },
    { text: "Temperature threshold warning: DHT11 reading 37.1 C.", type: "warn" },
    { text: "BLE packet received: command [STATE_MOOD = LOVING]", type: "info", triggerMood: "love" },
    { text: "Pulse wave detected. Heartrate peak reading: 92 BPM.", type: "success" },
    { text: "Stability alarm! Accel XYZ fluctuation > 0.3g.", type: "error" },
    { text: "Heading servo drift correction triggered.", type: "warn" },
    { text: "BLE packet received: command [STATE_MOOD = SLEEPING]", type: "info", triggerMood: "sleeping" },
    { text: "OLED brightness dimmed to 15% (energy save).", type: "info" }
  ];

  function loop() {
    const delay = 4000 + Math.random() * 5000;
    setTimeout(() => {
      const idx = Math.floor(Math.random() * simulationEvents.length);
      const ev = simulationEvents[idx];
      
      logToConsole(ev.text, ev.type);
      loop();
    }, delay);
  }
  loop();
}

function logToConsole(text, type = "info") {
  const consoleEl = document.getElementById('console-lines');
  if (!consoleEl) return;

  const date = new Date();
  const timeStr = date.toTimeString().split(' ')[0] + `.${String(date.getMilliseconds()).padStart(3, '0')}`;
  
  const line = document.createElement('div');
  line.className = `console-log-line ${type}`;
  line.innerHTML = `<span style="color: #64748b;">[${timeStr}]</span> ${text}`;
  
  consoleEl.appendChild(line);
  
  // Cap history at 100 lines
  while (consoleEl.children.length > 100) {
    consoleEl.removeChild(consoleEl.firstChild);
  }
  
  // Auto-scroll
  consoleEl.scrollTop = consoleEl.scrollHeight;
}
