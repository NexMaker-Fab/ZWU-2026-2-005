import { applyTranslations, getLang, setLang } from './i18n.js';

let activeMood = "happy";
let currentTheme = "dark";

// ─── Robot Dashboard Global State ────────────────
let curDist = 100;
let curSound = 150;
let lastActiveTime = Date.now();
const LONELY_TIMEOUT = 10000; // 10s
const MAX_HISTORY = 40;
let hrHistory = new Array(MAX_HISTORY).fill(150);
let tempHistory = new Array(MAX_HISTORY).fill(100);
let isMqttConnected = false;

function init() {
  initTheme();
  initLanguage();
  initParticleBackground();
  initRobotDashboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

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
  initSliders();
  startFaceSimulator();
  startSensorSimulation();
  startConsoleSimulation();
  
  // Initial calculation
  evaluateStateFromSensors(false);
}

function initSliders() {
  const sliderDist = document.getElementById('slider-dist');
  const sliderSound = document.getElementById('slider-sound');
  const sliderDistVal = document.getElementById('slider-dist-val');
  const sliderSoundVal = document.getElementById('slider-sound-val');

  if (sliderDist && sliderSound) {
    curDist = parseInt(sliderDist.value);
    curSound = parseInt(sliderSound.value);

    sliderDist.addEventListener('input', (e) => {
      curDist = parseInt(e.target.value);
      if (sliderDistVal) sliderDistVal.textContent = `${curDist} cm`;
      lastActiveTime = Date.now(); // reset lonely timer
      evaluateStateFromSensors(true);
    });

    sliderSound.addEventListener('input', (e) => {
      curSound = parseInt(e.target.value);
      if (sliderSoundVal) sliderSoundVal.textContent = `${curSound}`;
      lastActiveTime = Date.now(); // reset lonely timer
      evaluateStateFromSensors(true);
    });
  }
}

function evaluateStateFromSensors(logEvent = true) {
  if (isMqttConnected) return; // Skip local simulation calculation if physical board is linked
  const NEAR = 45;
  const FAR = 80;
  const LOUD = 400;
  const QUIET = 200;

  let targetMood = activeMood;

  if (curDist < NEAR) {
    if (curSound > LOUD) targetMood = "excited";
    else targetMood = "happy";
  }
  else if (curDist > FAR) {
    if (curSound > QUIET) {
      targetMood = "calm";
    } else {
      targetMood = "sad";
    }
  }
  else { // NEAR <= dist <= FAR
    if (curSound > QUIET) {
      targetMood = "smile";
    } else {
      targetMood = "calm";
    }
  }

  // Lonely timeout
  const now = Date.now();
  if (now - lastActiveTime > LONELY_TIMEOUT && curSound < QUIET) {
    targetMood = "sad";
  }

  if (targetMood !== activeMood) {
    const oldMood = activeMood;
    activeMood = targetMood;
    updateMoodUI(targetMood);
    if (logEvent) {
      logToConsole(`[STATE MACHINE] Transition: ${oldMood.toUpperCase()} -> ${targetMood.toUpperCase()} (Dist: ${curDist}cm, Sound: ${curSound})`, "success");
    }
  }
}

function updateMoodUI(mood) {
  const badge = document.getElementById('robot-mood-badge');
  if (badge) badge.textContent = mood.toUpperCase();

  const buttons = document.querySelectorAll('.mood-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-mood') === mood) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary', 'active');
    } else {
      btn.classList.remove('btn-primary', 'active');
      btn.classList.add('btn-secondary');
    }
  });

  // Sync stability telemetry widget text
  const stabValEl = document.getElementById('stability-value');
  if (stabValEl) {
    stabValEl.textContent = mood.toUpperCase();
  }
}

function initMoodButtons() {
  const buttons = document.querySelectorAll('.mood-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      activeMood = mood;
      updateMoodUI(mood);
      
      // Update sliders to represent forced mood values
      const sliderDist = document.getElementById('slider-dist');
      const sliderSound = document.getElementById('slider-sound');
      const sliderDistVal = document.getElementById('slider-dist-val');
      const sliderSoundVal = document.getElementById('slider-sound-val');
      
      if (mood === "excited") {
        curDist = 20; curSound = 450;
      } else if (mood === "happy") {
        curDist = 30; curSound = 150;
      } else if (mood === "sad") {
        curDist = 120; curSound = 100;
      } else if (mood === "smile") {
        curDist = 60; curSound = 250;
      } else if (mood === "unhappy") {
        curDist = 60; curSound = 120;
      } else if (mood === "sleep") {
        curDist = 100; curSound = 50;
      } else { // calm
        curDist = 100; curSound = 250;
      }
      
      if (sliderDist) {
        sliderDist.value = curDist;
        if (sliderDistVal) sliderDistVal.textContent = `${curDist} cm`;
      }
      if (sliderSound) {
        sliderSound.value = curSound;
        if (sliderSoundVal) sliderSoundVal.textContent = `${curSound}`;
      }
      
      lastActiveTime = Date.now();
      logToConsole(`[USER OVERRIDE] Forced mood state to: ${mood.toUpperCase()} (Simulating Dist: ${curDist}cm, Sound: ${curSound})`, "info");
      syncMoodToPhysicsBoard(mood);
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
  
  let particles = [];

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

  function drawTeardrop(ctx, x, y, size) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI);
    ctx.lineTo(x, y - size * 1.5);
    ctx.closePath();
    ctx.fill();
  }

  function drawStar(ctx, x, y, size) {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size/3, y - size/3);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size/3, y + size/3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size/3, y + size/3);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x - size/3, y - size/3);
    ctx.closePath();
    ctx.fill();
  }

  function renderFaceLoop() {
    const time = Date.now();
    
    // Clear screen
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // OLED screen scanline grid effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.008)';
    for(let y=0; y < canvas.height; y+=3) {
      ctx.fillRect(0, y, canvas.width, 1.5);
    }

    // Eye base parameters
    const eyeY = 110 + Math.sin(time / 300) * 3; // Breathing float
    
    // Handle blinking logic (no blinking when excited or sad)
    if (time > nextBlink && activeMood !== "excited" && activeMood !== "sad") {
      isBlinking = true;
      blinkEndTime = time + 140;
      nextBlink = time + 4000 + Math.random() * 3000;
    }
    
    if (isBlinking && time > blinkEndTime) {
      isBlinking = false;
    }

    // Spawn mood particles
    if (activeMood === "sad" && Math.random() < 0.06) {
      // Spawn falling teardrop from left or right eye
      particles.push({
        type: 'Teardrop',
        x: Math.random() < 0.5 ? 130 : 270,
        y: eyeY + 5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: 1.5 + Math.random() * 0.8,
        alpha: 1.0,
        size: 3 + Math.random() * 3
      });
    } else if (activeMood === "excited" && Math.random() < 0.08) {
      // Spawn sparkling rising stars
      particles.push({
        type: 'Star',
        x: 80 + Math.random() * 240,
        y: 140,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -1.0 - Math.random() * 1.0,
        alpha: 1.0,
        size: 6 + Math.random() * 6
      });
    } else if (activeMood === "sleep" && Math.random() < 0.05) {
      // Spawn Zzz particles rising from the right side of the face
      particles.push({
        type: 'Zzz',
        x: 280 + Math.random() * 20,
        y: eyeY - 20,
        vx: 0.3 + Math.random() * 0.4,
        vy: -0.6 - Math.random() * 0.5,
        alpha: 1.0,
        size: 10 + Math.random() * 8
      });
    }

    // Update & draw particles
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.015;
      
      if (p.alpha <= 0) {
        particles.splice(idx, 1);
        return;
      }
      
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.type === 'Teardrop') {
        drawTeardrop(ctx, p.x, p.y, p.size);
      } else if (p.type === 'Star') {
        drawStar(ctx, p.x, p.y, p.size);
      } else if (p.type === 'Zzz') {
        ctx.fillStyle = '#a78bfa'; // light purple
        ctx.font = `bold ${p.size}px Outfit, sans-serif`;
        ctx.fillText("Z", p.x, p.y);
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
        case "calm":
          // Normal filled oval eyes
          ctx.beginPath();
          ctx.arc(130, eyeY, 14, 0, Math.PI * 2);
          ctx.arc(270, eyeY, 14, 0, Math.PI * 2);
          ctx.fill();
          break;

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
          
        case "smile":
          // Squinting closed smile (inverted V chevron)
          ctx.beginPath();
          ctx.moveTo(110, eyeY + 4); ctx.lineTo(130, eyeY - 6); ctx.lineTo(150, eyeY + 4);
          ctx.moveTo(250, eyeY + 4); ctx.lineTo(270, eyeY - 6); ctx.lineTo(290, eyeY + 4);
          ctx.stroke();
          break;
          
        case "unhappy":
          // Downward slanted angry/sad eyebrows/eyes
          ctx.beginPath();
          ctx.moveTo(115, eyeY - 8); ctx.lineTo(145, eyeY + 4);
          ctx.moveTo(285, eyeY - 8); ctx.lineTo(255, eyeY + 4);
          ctx.stroke();
          break;

        case "excited":
          // Big circular eyes with glowing pupils
          ctx.beginPath();
          ctx.arc(130, eyeY, 20, 0, Math.PI * 2);
          ctx.arc(270, eyeY, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(130, eyeY, 6, 0, Math.PI * 2);
          ctx.arc(270, eyeY, 6, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "sleep":
          // Sleep: always closed flat line slits for eyes
          ctx.beginPath();
          ctx.moveTo(110, eyeY); ctx.lineTo(150, eyeY);
          ctx.moveTo(250, eyeY); ctx.lineTo(290, eyeY);
          ctx.stroke();
          break;
      }
    }
    
    // Draw Mouth
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    if (activeMood === "happy" || activeMood === "smile") {
      ctx.arc(200, eyeY + 25, 12, 0, Math.PI, false); // Smile arc
      ctx.stroke();
    } else if (activeMood === "excited") {
      // Big gasping O shape mouth (filled)
      ctx.beginPath();
      ctx.arc(200, eyeY + 30, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.stroke();
    } else if (activeMood === "sad" || activeMood === "unhappy") {
      ctx.arc(200, eyeY + 38, 10, Math.PI, 0, false); // Frown arc
      ctx.stroke();
    } else if (activeMood === "sleep") {
      // Sleep: neutral flat mouth
      ctx.moveTo(190, eyeY + 30); ctx.lineTo(210, eyeY + 30);
      ctx.stroke();
    } else {
      // calm: neutral flat line mouth
      ctx.moveTo(190, eyeY + 30); ctx.lineTo(210, eyeY + 30);
      ctx.stroke();
    }

    requestAnimationFrame(renderFaceLoop);
  }

  renderFaceLoop();
}

// ─── Sensor Telemetry Simulation ──────────────────
function startSensorSimulation() {
  const hrValEl = document.getElementById('hr-value'); // Sound raw
  const tempValEl = document.getElementById('temp-value'); // Dist cm
  const stabValEl = document.getElementById('stability-value'); // Mood state text
  
  const hrCanvas = document.getElementById('hr-graph');
  const tempCanvas = document.getElementById('temp-graph');
  const stabCanvas = document.getElementById('stability-graph');

  if (!hrCanvas || !tempCanvas || !stabCanvas) return;

  const hrCtx = hrCanvas.getContext('2d');
  const tempCtx = tempCanvas.getContext('2d');
  const stabCtx = stabCanvas.getContext('2d');

  const maxHistory = MAX_HISTORY;
  let stabHistory = new Array(maxHistory).fill(1); // mapped mood states

  let timeVal = 0;

  function updateSensors() {
    timeVal += 0.1;
    
    // Auto fluctuate values slightly to look alive
    const soundNoise = (Math.random() - 0.5) * 12;
    const distNoise = (Math.random() - 0.5) * 1.5;

    // Read current slider inputs + minor noise
    const simSound = Math.max(50, Math.min(600, Math.floor(curSound + soundNoise)));
    const simDist = Math.max(5, Math.min(250, Math.floor(curDist + distNoise)));

    // Update labels
    if (hrValEl) hrValEl.textContent = simSound;
    if (tempValEl) tempValEl.textContent = simDist;
    if (stabValEl) stabValEl.textContent = activeMood.toUpperCase();

    // Sound wave drawing mapping
    hrHistory.push(simSound);
    if (hrHistory.length > maxHistory) hrHistory.shift();

    // Distance drawing mapping
    tempHistory.push(simDist);
    if (tempHistory.length > maxHistory) tempHistory.shift();

    // Map activeMood string to a step height on stability graph
    let moodInt = 1;
    if (activeMood === "calm") moodInt = 1;
    else if (activeMood === "happy") moodInt = 3;
    else if (activeMood === "sad") moodInt = 0.5;
    else if (activeMood === "smile") moodInt = 4;
    else if (activeMood === "unhappy") moodInt = 2;
    else if (activeMood === "excited") moodInt = 5;

    stabHistory.push(moodInt);
    if (stabHistory.length > maxHistory) stabHistory.shift();

    // Render graphs
    // Sound wave graph: range 0 - 650
    drawGraph(hrCtx, hrHistory, '#38bdf8', 0, 650, true);
    // Distance graph: range 0 - 260
    drawGraph(tempCtx, tempHistory, '#f59e0b', 0, 260, false);
    // Step response graph: range 0 - 6
    drawGraph(stabCtx, stabHistory, '#10b981', 0, 6, false);
    setTimeout(updateSensors, 100);
  }

  function drawGraph(ctx, history, color, minVal, maxVal, isAudioWave = false) {
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
      
      if (isAudioWave) {
        // Render sound level as a symmetric audio waveform around center line (y=30)
        const center = canvas.height / 2;
        const amplitude = ((val - minVal) / (maxVal - minVal)) * (canvas.height / 2.5);
        y = center + (i % 2 === 0 ? amplitude : -amplitude);
      } else {
        const ratio = (val - minVal) / (maxVal - minVal);
        y = canvas.height - (ratio * (canvas.height - 12) + 6);
      }
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();

    // Draw gradient fill below graph line (for distance and mood step graphs)
    if (!isAudioWave) {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, color === '#f59e0b' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)');
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
    { text: "Initializing I2C bus at 400kHz...", type: "info" },
    { text: "SSD1306 OLED screen found at I2C address 0x3C", type: "success" },
    { text: "HC-SR04 Trigger pin 9 (OUTPUT), Echo pin 10 (INPUT) initialized.", type: "success" },
    { text: "HS-S05B Sound Sensor ADC pin A0 online.", type: "success" },
    { text: "Calibrating sound sensor baseline noise level...", type: "info" },
    { text: "Calibration complete. Baseline noise: 148 RAW", type: "success" },
    { text: "State Machine Active. Lonely timer set: 10000ms", type: "info" },
    { text: "Entering loop: Current mood: CALM.", type: "success" }
  ];

  logs.forEach(log => logToConsole(log.text, log.type));

  const simulationEvents = [
    { text: "HC-SR04: Distance echo reading ok (中值滤波已启用)", type: "info" },
    { text: "HS-S05B: Sound peak threshold filter passed.", type: "info" },
    { text: "Min display time lock active (防抖状态锁中: 630ms)", type: "warn" },
    { text: "Arduino Uno R4 WiFi serial link ok.", type: "success" },
    { text: "Console loop heartbeat: ok.", type: "info" }
  ];

  function loop() {
    const delay = 6000 + Math.random() * 8000;
    setTimeout(() => {
      if (Math.random() < 0.3) {
        // print a dynamic sensor reading
        logToConsole(`[SENSOR] HC-SR04: ${curDist}cm | HS-S05B: ${curSound} RAW -> State: ${activeMood.toUpperCase()}`, "info");
      } else {
        const idx = Math.floor(Math.random() * simulationEvents.length);
        const ev = simulationEvents[idx];
        logToConsole(ev.text, ev.type);
      }
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

// ─── MQTT 广域网连接与控制 (Adafruit IO) ─────────
const MQTT_BROKER = "wss://io.adafruit.com:443/mqtt"; // 使用 Adafruit IO 加密 WebSockets 端口
let mqttClient = null;

function setSlidersDisabled(disabled) {
  const sliderDist = document.getElementById('slider-dist');
  const sliderSound = document.getElementById('slider-sound');
  if (sliderDist) {
    sliderDist.disabled = disabled;
    sliderDist.style.opacity = disabled ? "0.5" : "1";
    sliderDist.style.pointerEvents = disabled ? "none" : "auto";
  }
  if (sliderSound) {
    sliderSound.disabled = disabled;
    sliderSound.style.opacity = disabled ? "0.5" : "1";
    sliderSound.style.pointerEvents = disabled ? "none" : "auto";
  }
}

function initMqttForm() {
  const usernameInput = document.getElementById('mqtt-username');
  const keyInput = document.getElementById('mqtt-key');
  const connectBtn = document.getElementById('arduino-connect-btn');
  const statusSpan = document.getElementById('arduino-status');

  // 初始化默认状态为未成功连接，支持手动模拟
  isMqttConnected = false;
  if (statusSpan) {
    statusSpan.textContent = "🔴 未成功连接 / 保持手动模拟";
    statusSpan.style.color = "#ef4444";
  }
  setSlidersDisabled(false);

  // 从 LocalStorage 读取上次保存的凭证
  const savedUser = localStorage.getItem('aio_username') || "hkz";
  const savedKey = localStorage.getItem('aio_key') || "";
  if (usernameInput) usernameInput.value = savedUser;
  if (keyInput) keyInput.value = savedKey;

  connectBtn?.addEventListener('click', () => {
    if (typeof mqtt === 'undefined') {
      if (statusSpan) {
        statusSpan.textContent = "❌ 依赖库加载失败，请刷新";
        statusSpan.style.color = "#ef4444";
      }
      logToConsole("[MQTT ERROR] 错误：MQTT 依赖库加载失败！这通常是因为国内连接 unpkg.com 超时或被拦截。请多刷新几次网页，或者切换网络环境试一下！", "error");
      return;
    }

    const username = usernameInput.value.trim();
    const key = keyInput.value.trim();
    if (!username || !key) {
      logToConsole("[MQTT] 错误：用户名或 Active Key 不能为空！", "error");
      return;
    }

    // 保存凭证
    localStorage.setItem('aio_username', username);
    localStorage.setItem('aio_key', key);

    statusSpan.textContent = "🟡 连接中...";
    statusSpan.style.color = "#f59e0b";

    // 如果之前已经有连接，先断开它
    if (mqttClient) {
      try { mqttClient.end(); } catch(e) {}
    }

    // 建立加密 WebSocket 连接
    mqttClient = mqtt.connect(MQTT_BROKER, {
      username: username,
      password: key,
      clientId: 'web_client_' + Math.random().toString(16).substr(2, 8)
    });

    const topicSensors = `${username}/feeds/sensors`;

    mqttClient.on('connect', () => {
      isMqttConnected = true;
      statusSpan.textContent = "🟢 已成功连接 / 物理数据联动";
      statusSpan.style.color = "#10b981";
      setSlidersDisabled(true);
      logToConsole(`[MQTT] 成功连接至 Adafruit IO Broker，已切换为真机实时数据模式！`, "success");

      // 订阅机器人数据上报
      mqttClient.subscribe(topicSensors, (err) => {
        if (!err) {
          logToConsole(`[MQTT] 成功订阅主题: ${topicSensors}`, "success");
        } else {
          logToConsole(`[MQTT] 订阅失败: ${err.message}`, "error");
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      if (topic === topicSensors) {
        try {
          const data = JSON.parse(message.toString());
          // 当连接成功并且有数据回传时，对应的传感器数据和表情准确显示
          curDist = data.distance;
          curSound = data.sound;

          // 更新模拟滑块的值，直观显示当前回传的数据大小
          const sliderDist = document.getElementById('slider-dist');
          const sliderSound = document.getElementById('slider-sound');
          const sliderDistVal = document.getElementById('slider-dist-val');
          const sliderSoundVal = document.getElementById('slider-sound-val');
          
          if (sliderDist) sliderDist.value = curDist;
          if (sliderSound) sliderSound.value = curSound;
          if (sliderDistVal) sliderDistVal.textContent = `${curDist} cm`;
          if (sliderSoundVal) sliderSoundVal.textContent = `${curSound}`;

          // 更新网页显示
          const hrValEl = document.getElementById('hr-value');
          const tempValEl = document.getElementById('temp-value');
          if (hrValEl) hrValEl.textContent = curSound;
          if (tempValEl) tempValEl.textContent = curDist;

          // 保持折线图历史同步
          hrHistory.push(curSound);
          tempHistory.push(curDist);
          if (hrHistory.length > MAX_HISTORY) hrHistory.shift();
          if (tempHistory.length > MAX_HISTORY) tempHistory.shift();
          
          // 更新网页端的表情UI（用于跟随物理机器人的自动情绪）
          const moodsMap = ["calm", "happy", "sad", "smile", "unhappy", "excited", "sleep"];
          const moodStr = moodsMap[data.mood];
          if (moodStr && moodStr !== activeMood) {
            activeMood = moodStr;
            updateMoodUI(moodStr);
          }
        } catch (e) {
          console.warn("MQTT 消息解析错误: ", e);
        }
      }
    });

    mqttClient.on('error', (err) => {
      isMqttConnected = false;
      statusSpan.textContent = "🔴 未成功连接 / 保持手动模拟";
      statusSpan.style.color = "#ef4444";
      setSlidersDisabled(false);
      logToConsole(`[MQTT ERROR] 无法连接至 Broker，已回退为手动模拟模式`, "error");
    });

    mqttClient.on('close', () => {
      if (isMqttConnected) {
        isMqttConnected = false;
        statusSpan.textContent = "🔴 未成功连接 / 保持手动模拟";
        statusSpan.style.color = "#ef4444";
        setSlidersDisabled(false);
        logToConsole(`[MQTT] 与 Broker 的连接已断开，已回退为手动模拟模式`, "warning");
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMqttForm);
} else {
  initMqttForm();
}

// 修改原有的网页端情绪按钮逻辑，当网页强制改表情时，向板子下发指令
function syncMoodToPhysicsBoard(moodString) {
  if (!mqttClient || !mqttClient.connected) return;
  
  const username = document.getElementById('mqtt-username')?.value.trim() || "hkz";
  const topicCommand = `${username}/feeds/command`;

  const moodsMap = { "calm": 0, "happy": 1, "sad": 2, "smile": 3, "unhappy": 4, "excited": 5, "sleep": 6 };
  const moodVal = moodsMap[moodString];
  
  const payload = JSON.stringify({ val: moodVal });
  mqttClient.publish(topicCommand, payload, { qos: 0 }, (err) => {
    if (!err) {
      logToConsole(`[MQTT Sync] 成功发布指令 ${moodString.toUpperCase()} 到 Feed`, "info");
    } else {
      logToConsole(`[MQTT Sync Error] 发布指令失败: ${err.message}`, "error");
    }
  });
}
