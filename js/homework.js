import { applyTranslations, getLang, setLang } from './i18n.js';
import { BlockEditor } from './editor.js';
import { loadContent, saveToLocalStorage } from './storage.js';

// Default mock content to seed if no localStorage data exists
const defaultHomeworkData = {
  "project-manage": {
    title: "项目管理 / Project Manage",
    icon: "📅",
    blocks: [
      { id: "h1_1", type: "heading", level: 1, content: "项目管理与开发规划" },
      { id: "h1_2", type: "paragraph", content: "这一章我们学习了如何使用 Git 和 Markdown 管理项目进度，并搭建了基础的静态展示页面。项目管理的核心是任务拆解、时间节点控制与团队协作同步。" },
      { id: "h1_3", type: "divider" },
      { id: "h1_4", type: "heading", level: 2, content: "📌 核心知识点与工具" },
      { id: "h1_5", type: "bullet-list", content: "<strong>Git 版本控制</strong>：分支合并、冲突解决与代码库维护流程。" },
      { id: "h1_6", type: "bullet-list", content: "<strong>Markdown 规范</strong>：编写清晰的项目 README.md 说明文档和变更日志。" },
      { id: "h1_7", type: "bullet-list", content: "<strong>敏捷看板管理</strong>：利用 Github Projects 拆解任务和控制开发进度。" },
      { id: "h1_8", type: "heading", level: 2, content: "🛠️ 个人/小组成果" },
      { id: "h1_9", type: "paragraph", content: "我们在本项目中将原先的 TeamFlow Wiki 全面重构为团队作业的博客，并将原项目代码整理到 <code>archive/teamflow-wiki</code> 分支保存，主分支致力于当前重构的维护。" }
    ]
  },
  "cad-design": {
    title: "CAD设计 / CAD Design",
    icon: "📐",
    blocks: [
      { id: "h2_1", type: "heading", level: 1, content: "三维模型与 CAD 设计" },
      { id: "h2_2", type: "paragraph", content: "本章学习如何利用三维建模软件（如 Fusion 360 或 SolidWorks）进行硬件结构和外观设计。CAD 设计是硬件原型开发的第一步。" },
      { id: "h2_3", type: "divider" },
      { id: "h2_4", type: "heading", level: 2, content: "📌 核心技术细节" },
      { id: "h2_5", type: "bullet-list", content: "<strong>草图绘制与约束</strong>：通过几何约束与尺寸标注确保模型的尺寸参数化。" },
      { id: "h2_6", type: "bullet-list", content: "<strong>特征建模</strong>：利用拉伸、旋转、扫掠、放样及倒角创建实体。" },
      { id: "h2_7", type: "bullet-list", content: "<strong>装配体干涉分析</strong>：将多个零件组合，模拟真实装配并解决结构干涉问题。" },
      { id: "h2_8", type: "heading", level: 2, content: "🛠️ 实作笔记" },
      { id: "h2_9", type: "paragraph", content: "为我们的 Arduino 情感机器人建模了可动的头部与传感器卡槽，确保超声波和红外传感器能够紧密固定且外观极具未来感。" }
    ]
  },
  "3d-printer": {
    title: "3D打印 / 3D Printer",
    icon: "🖨️",
    blocks: [
      { id: "h3_1", type: "heading", level: 1, content: "3D 打印与原型制造" },
      { id: "h3_2", type: "paragraph", content: "将 CAD 导出的 STL 文件放入切片软件（如 Cura 或 PrusaSlicer），配置打印参数并在 FDM 打印机上完成实体化。" },
      { id: "h3_3", type: "divider" },
      { id: "h3_4", type: "heading", level: 2, content: "📌 切片核心参数" },
      { id: "h3_5", type: "bullet-list", content: "<strong>层高与填充率</strong>：0.2mm 层高与 15% 填充是兼顾速度与强度的常用搭配。" },
      { id: "h3_6", type: "bullet-list", content: "<strong>支撑与附着</strong>：为悬空角度大于 45 度的悬臂结构生成支撑，选用 Brim 防止边缘翘边。" },
      { id: "h3_7", type: "bullet-list", content: "<strong>后处理打磨</strong>：拆除支撑，用细砂纸打磨表面，最后涂刷防护蜡或补土喷漆。" },
      { id: "h3_8", type: "heading", level: 2, content: "🛠️ 实体打样展示" },
      { id: "h3_9", type: "paragraph", content: "成功完成了情感机器人的第一版底座打样，选用白色的 PLA 耗材，打印时长共 4.5 小时，无层纹错位或拉丝问题。" }
    ]
  },
  "arduino-app": {
    title: "Arduino应用 / Arduino Application",
    icon: "🤖",
    blocks: [
      { id: "h4_1", type: "heading", level: 1, content: "Arduino 传感器编程" },
      { id: "h4_2", type: "paragraph", content: "使用 Arduino C/C++ 语言进行硬件底层编程。实现温度传感器（DHT11）、心率传感器（MAX30102）以及伺服电机的联合控制。" },
      { id: "h4_3", type: "divider" },
      { id: "h4_4", type: "heading", level: 2, content: "📌 底层通信与控制" },
      { id: "h4_5", type: "bullet-list", content: "<strong>GPIO 数字控制</strong>：用于控制警示 LED 灯与伺服电机舵机角度的输出。" },
      { id: "h4_6", type: "bullet-list", content: "<strong>I2C 串行通信</strong>：通过 Wire 库读取 MAX30102 的心率与血氧数据。" },
      { id: "h4_7", type: "bullet-list", content: "<strong>模拟读取（ADC）</strong>：从光敏电阻或滑阻读取模拟电压并转换为环境光度值。" },
      { id: "h4_8", type: "heading", level: 2, content: "🛠️ 示例代码块" },
      { id: "h4_9", type: "code", content: "void loop() {\n  int heartVal = analogRead(A0);\n  if (heartVal > threshold) {\n    servo.write(90); // 眨眼/转头动作\n    digitalWrite(LED_PIN, HIGH);\n  }\n  delay(20);\n}" }
    ]
  },
  "iot-interaction": {
    title: "IOT/Interaction",
    icon: "🌐",
    blocks: [
      { id: "h5_1", type: "heading", level: 1, content: "物联网连接与实时交互" },
      { id: "h5_2", type: "paragraph", content: "通过 ESP32 单片机的 Wi-Fi 芯片将数据连接上网，使用 MQTT 协议推送实时数值到 Web 前端展示看板上。" },
      { id: "h5_3", type: "divider" },
      { id: "h5_4", type: "heading", level: 2, content: "📌 协议与实时展示" },
      { id: "h5_5", type: "bullet-list", content: "<strong>MQTT 消息代理</strong>：低开销发布/订阅模式，实时转发传感器数据。" },
      { id: "h5_6", type: "bullet-list", content: "<strong>WebSocket 通信</strong>：保证 Web 浏览器能够低延迟接收来自硬件的数据推送。" },
      { id: "h5_7", type: "bullet-list", content: "<strong>Canvas 图表绘制</strong>：使用 HTML5 Canvas 绘制实时运动轨迹与传感器波动曲线。" },
      { id: "h5_8", type: "heading", level: 2, content: "🛠️ 网络调试" },
      { id: "h5_9", type: "paragraph", content: "成功在本地部署了轻量级 Web 服务器，并在最终项目（project.html）中完成了机器人的动态表情 Canvas 驱动验证。" }
    ]
  },
  "material-tool": {
    title: "Material/tool",
    icon: "🛠️",
    blocks: [
      { id: "h6_1", type: "heading", level: 1, content: "材料特性与硬件制作工具" },
      { id: "h6_2", type: "paragraph", content: "深入了解电子制作中常用的加工工具和紧固技术。安全、规范地使用这些设备是做出高质量原型的关键。" },
      { id: "h6_3", type: "divider" },
      { id: "h6_4", type: "heading", level: 2, content: "📌 常用工具指南" },
      { id: "h6_5", type: "bullet-list", content: "<strong>电烙铁焊接</strong>：锡丝饱满呈火山状，焊点无虚焊；注意防静电和通风。" },
      { id: "h6_6", type: "bullet-list", content: "<strong>激光切割</strong>：绘制 2D 矢量图（DXF），设定切割速度和功率加工亚克力底板。" },
      { id: "h6_7", type: "bullet-list", content: "<strong>数字万用表</strong>：测量通路阻值和供电轨电压，防范短路毁坏主板。" },
      { id: "h6_8", type: "heading", level: 2, content: "🛠️ 焊接工艺记录" },
      { id: "h6_9", type: "paragraph", content: "为机器人的主板接口部分焊接了排针排母，做好了充足的绝缘保护，线束收纳规整，降低接触不良的故障率。" }
    ]
  }
};

const homeworkKeys = [
  "project-manage",
  "cad-design",
  "3d-printer",
  "arduino-app",
  "iot-interaction",
  "material-tool"
];

let activeHomeworkId = "project-manage";
let homeworkData = {};
let editor = null;
let saveTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initParticleBackground();
  initHomeworkWorkspace();
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

// ─── Homework Workspace Logic ─────────────────────
async function initHomeworkWorkspace() {
  await loadHomeworkData();
  renderSidebarList();
  initBlockEditor();
  loadHomeworkIntoEditor(activeHomeworkId);
  setupEditorListeners();
}

let mainContentData = null;

async function loadHomeworkData() {
  mainContentData = await loadContent();
  const pages = mainContentData.pages || [];

  // Find if root-homework exists, if not create it
  let rootHwPage = pages.find(p => p.id === 'root-homework');
  if (!rootHwPage) {
    rootHwPage = {
      id: "root-homework",
      title: "平时作业 / Homework",
      icon: "📝",
      parentId: null,
      blocks: [
        { id: "rhw1", type: "heading", level: 2, content: "平时作业分类" },
        { id: "rhw2", type: "paragraph", content: "在此根分类下的所有子页面即代表平时的各个作业模块内容。" }
      ]
    };
    pages.push(rootHwPage);
  }

  homeworkData = {};
  homeworkKeys.forEach(k => {
    const pageId = `homework-${k}`;
    let hwPage = pages.find(p => p.id === pageId);

    if (!hwPage) {
      const def = defaultHomeworkData[k];
      hwPage = {
        id: pageId,
        title: def.title,
        icon: def.icon,
        parentId: 'root-homework',
        blocks: JSON.parse(JSON.stringify(def.blocks))
      };
      pages.push(hwPage);
    }
    homeworkData[k] = hwPage;
  });

  saveHomeworkData();
}

function saveHomeworkData() {
  if (mainContentData) {
    saveToLocalStorage(mainContentData);
  }
}

function renderSidebarList() {
  const listEl = document.getElementById('homework-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  homeworkKeys.forEach(id => {
    const hw = homeworkData[id];
    const card = document.createElement('div');
    card.className = `homework-item-card ${id === activeHomeworkId ? 'active' : ''}`;
    card.setAttribute('data-id', id);
    
    // Find first paragraph or heading for description snippet
    let snippet = hw.title;
    const firstP = hw.blocks.find(b => b.type === 'paragraph' && b.content);
    if (firstP) {
      snippet = firstP.content.replace(/<[^>]+>/g, '');
    }

    card.innerHTML = `
      <div class="homework-item-icon">${hw.icon || '📝'}</div>
      <div class="homework-item-meta">
        <span class="homework-item-title">${hw.title.split(/[/:：]/)[0].trim()}</span>
        <span class="homework-item-desc">${snippet}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      if (activeHomeworkId === id) return;
      
      // Save current before switching
      saveCurrentHomeworkImmediate();

      activeHomeworkId = id;
      
      // Update active card class
      document.querySelectorAll('.homework-item-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      loadHomeworkIntoEditor(id);
    });

    listEl.appendChild(card);
  });
}

function initBlockEditor() {
  const editorEl = document.getElementById('editor');
  const slashMenuEl = document.getElementById('slash-menu');
  const floatingToolbarEl = document.getElementById('floating-toolbar');
  
  if (!editorEl) return;

  editor = new BlockEditor({
    editorEl,
    slashMenuEl,
    floatingToolbarEl,
    tocEl: document.getElementById('editor-toc'),
    onUpdate: () => {
      triggerAutosave();
    }
  });

  // Load emojis picker support on page icon display click
  const iconDisplay = document.getElementById('page-icon-display');
  const iconPicker = document.getElementById('icon-picker');
  
  iconDisplay?.addEventListener('click', (e) => {
    e.stopPropagation();
    renderIconPicker();
  });

  document.addEventListener('click', () => {
    iconPicker?.classList.remove('active');
  });
}

function loadHomeworkIntoEditor(id) {
  const hw = homeworkData[id];
  if (!hw) return;

  // Set breadcrumb
  const breadcrumbHw = document.getElementById('breadcrumb-current-homework');
  if (breadcrumbHw) {
    breadcrumbHw.textContent = hw.title.split(/[/:：]/)[0].trim();
  }

  // Set header details
  const iconDisplay = document.getElementById('page-icon-display');
  if (iconDisplay) {
    iconDisplay.textContent = hw.icon || '📝';
  }

  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = hw.title;
  }

  // Load into BlockEditor
  if (editor) {
    editor.load(hw.blocks, getLang());
  }
}

function setupEditorListeners() {
  const titleEl = document.getElementById('page-title');
  titleEl?.addEventListener('input', () => {
    triggerAutosave();
    
    // Update sidebar title immediately
    const cardTitle = document.querySelector(`.homework-item-card[data-id="${activeHomeworkId}"] .homework-item-title`);
    if (cardTitle) {
      cardTitle.textContent = titleEl.textContent.split(/[/:：]/)[0].trim();
    }
    const breadcrumbHw = document.getElementById('breadcrumb-current-homework');
    if (breadcrumbHw) {
      breadcrumbHw.textContent = titleEl.textContent.split(/[/:：]/)[0].trim();
    }
  });
}

function triggerAutosave() {
  const statusEl = document.getElementById('homework-save-status');
  if (statusEl) {
    statusEl.textContent = "Saving to cache...";
  }

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCurrentHomeworkImmediate();
  }, 1000);
}

function saveCurrentHomeworkImmediate() {
  const hw = homeworkData[activeHomeworkId];
  if (!hw) return;

  const titleEl = document.getElementById('page-title');
  const iconDisplay = document.getElementById('page-icon-display');

  if (titleEl) {
    hw.title = titleEl.textContent.trim() || "Untitled Assignment";
  }
  if (iconDisplay) {
    hw.icon = iconDisplay.textContent;
  }

  if (editor) {
    hw.blocks = editor.getData();
  }

  if (mainContentData) {
    const idx = mainContentData.pages.findIndex(p => p.id === hw.id);
    if (idx !== -1) {
      mainContentData.pages[idx] = hw;
    } else {
      mainContentData.pages.push(hw);
    }
  }

  saveHomeworkData();

  // Update snippet in sidebar card
  const cardSnippet = document.querySelector(`.homework-item-card[data-id="${activeHomeworkId}"] .homework-item-desc`);
  if (cardSnippet) {
    const firstP = hw.blocks.find(b => b.type === 'paragraph' && b.content);
    cardSnippet.textContent = firstP ? firstP.content.replace(/<[^>]+>/g, '') : hw.title;
  }

  const statusEl = document.getElementById('homework-save-status');
  if (statusEl) {
    statusEl.textContent = "Saved to local cache";
  }
}

// ─── Icon Picker Support ──────────────────────────
function renderIconPicker() {
  const picker = document.getElementById('icon-picker');
  if (!picker) return;

  const emojis = ['📝', '📅', '📐', '🖨️', '🤖', '🌐', '🛠️', '🧬', '📊', '🔌', '💻', '💡', '🚀', '🎨', '🔒', '📦'];
  picker.innerHTML = '';
  
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'icon-picker-item';
    btn.textContent = emoji;
    btn.style.cssText = "font-size: 1.5rem; padding: 6px; border-radius: 6px; cursor: pointer; transition: background 0.2s;";
    btn.addEventListener('mouseenter', () => btn.style.background = 'var(--bg-hover)');
    btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const iconDisplay = document.getElementById('page-icon-display');
      if (iconDisplay) {
        iconDisplay.textContent = emoji;
        
        // Update sidebar card icon
        const cardIcon = document.querySelector(`.homework-item-card[data-id="${activeHomeworkId}"] .homework-item-icon`);
        if (cardIcon) {
          cardIcon.textContent = emoji;
        }
        
        triggerAutosave();
      }
      picker.classList.remove('active');
    });
    
    picker.appendChild(btn);
  });

  // Position and show picker
  const rect = document.getElementById('page-icon-display').getBoundingClientRect();
  picker.style.top = `${rect.bottom + window.scrollY + 6}px`;
  picker.style.left = `${rect.left + window.scrollX}px`;
  picker.style.position = 'absolute';
  picker.style.zIndex = '1000';
  picker.style.display = 'grid';
  picker.style.gridTemplateColumns = 'repeat(4, 1fr)';
  picker.style.gap = '6px';
  picker.style.padding = '10px';
  picker.style.background = 'var(--bg-glass)';
  picker.style.border = '1px solid var(--border-glass)';
  picker.style.borderRadius = '12px';
  picker.style.backdropFilter = 'blur(20px)';
  
  picker.classList.add('active');
}
