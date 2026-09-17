
/* ====================================================
   SOMASHEKHAR ANAD — NEXGEN PORTFOLIO
   Ultra-Advanced JavaScript
   ==================================================== */

'use strict';

// ============ LOADER ============
class Loader {
  constructor() {
    this.el = document.getElementById('loader');
    this.bar = document.querySelector('.loader-bar');
    this.pct = document.querySelector('.loader-pct');
    this.run();
  }
  run() {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p > 100) p = 100;
      this.bar.style.width = p + '%';
      this.pct.textContent = Math.floor(p) + '%';
      if (p === 100) {
        clearInterval(iv);
        setTimeout(() => {
          this.el.classList.add('hide');
          document.body.style.overflow = 'auto';
          init();
        }, 600);
      }
    }, 80);
  }
}

// ============ CUSTOM MAGNETIC CURSOR ============
class Cursor {
  constructor() {
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');
    this.mx = 0; this.my = 0;
    this.rx = 0; this.ry = 0;
    this.bind();
    this.animate();
  }
  bind() {
    document.addEventListener('mousemove', e => {
      this.mx = e.clientX; this.my = e.clientY;
      this.dot.style.left = e.clientX + 'px';
      this.dot.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a,button,.btn,.nav-cta,.chip,.proj-card,.tl-card,.contact-card,.skill-card,.proto-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        this.ring.style.borderColor = 'var(--red)';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        this.ring.style.borderColor = 'rgba(103,100,246,.7)';
      });
    });
  }
  animate() {
    this.rx += (this.mx - this.rx) * 0.12;
    this.ry += (this.my - this.ry) * 0.12;
    this.ring.style.left = this.rx + 'px';
    this.ring.style.top = this.ry + 'px';
    requestAnimationFrame(() => this.animate());
  }
}

// ============ 3D PARTICLE SPHERE ============
class ParticleSphere {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.rotation = { x: 0, y: 0 };
    this.resize();
    this.create();
    this.bindEvents();
    this.animate();
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;
  }
  create() {
    this.particles = [];
    const N = 320, R = Math.min(this.canvas.width, this.canvas.height) * 0.28;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      this.particles.push({
        ox: Math.cos(theta) * r * R,
        oy: y * R,
        oz: Math.sin(theta) * r * R,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? [103, 100, 246] : [255, 0, 15]
      });
    }
    // Extra floating particles
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI * 2;
      const r = (Math.random() * 0.5 + 0.5) * Math.min(this.canvas.width, this.canvas.height) * 0.35;
      this.particles.push({
        ox: Math.sin(a) * Math.cos(b) * r,
        oy: Math.sin(b) * r,
        oz: Math.cos(a) * Math.cos(b) * r,
        size: Math.random() * 1.2 + 0.3,
        color: [0, 212, 255],
        free: true
      });
    }
  }
  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.create(); });
    document.addEventListener('mousemove', e => {
      this.mouse.x = (e.clientX - this.cx) / this.cx;
      this.mouse.y = (e.clientY - this.cy) / this.cy;
    });
  }
  project(x, y, z, fov = 400) {
    const cosX = Math.cos(this.rotation.x), sinX = Math.sin(this.rotation.x);
    const cosY = Math.cos(this.rotation.y), sinY = Math.sin(this.rotation.y);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    const scale = fov / (fov + z2 + 300);
    return { sx: x2 * scale + this.cx, sy: y1 * scale + this.cy, scale, z: z2 };
  }
  animate() {
    this.rotation.y += 0.003 + this.mouse.x * 0.002;
    this.rotation.x += 0.001 + this.mouse.y * 0.001;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const projected = this.particles.map(p => ({
      ...this.project(p.ox, p.oy, p.oz), ...p
    })).sort((a, b) => a.z - b.z);
    projected.forEach(p => {
      const alpha = (p.z + 400) / 800;
      const size = p.size * p.scale;
      this.ctx.beginPath();
      this.ctx.arc(p.sx, p.sy, Math.max(0.3, size), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.9})`;
      this.ctx.fill();
    });
    // draw lines between close sphere particles
    for (let i = 0; i < Math.min(projected.length, 200); i++) {
      for (let j = i + 1; j < Math.min(projected.length, 200); j++) {
        const dx = projected[i].sx - projected[j].sx;
        const dy = projected[i].sy - projected[j].sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50) {
          const alpha = (1 - dist / 50) * 0.08;
          this.ctx.beginPath();
          this.ctx.moveTo(projected[i].sx, projected[i].sy);
          this.ctx.lineTo(projected[j].sx, projected[j].sy);
          this.ctx.strokeStyle = `rgba(103,100,246,${alpha})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ============ TEXT SCRAMBLE ============
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.resolve = null;
    this.frameReq = null;
    this.frame = 0;
    this.queue = [];
    this.original = el.textContent;
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const len = Math.max(oldText.length, newText.length);
    return new Promise(res => {
      this.resolve = res;
      this.queue = [];
      for (let i = 0; i < len; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 10);
        const end = start + Math.floor(Math.random() * 15) + 5;
        this.queue.push({ from, to, start, end, char: '' });
      }
      cancelAnimationFrame(this.frameReq);
      this.frame = 0;
      this.update();
    });
  }
  update() {
    let output = '', complete = 0;
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:var(--red);opacity:.6">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frame++;
      this.frameReq = requestAnimationFrame(() => this.update());
    }
  }
  scrambleIn() {
    this.setText(this.original);
  }
}

// ============ TYPEWRITER ============
class TypeWriter {
  constructor(el, texts, speed = 80) {
    this.el = el;
    this.texts = texts;
    this.speed = speed;
    this.idx = 0;
    this.charIdx = 0;
    this.deleting = false;
    this.pause = 0;
    this.run();
  }
  run() {
    const txt = this.texts[this.idx];
    if (!this.deleting) {
      this.el.textContent = txt.slice(0, this.charIdx++);
      if (this.charIdx > txt.length) { this.deleting = true; this.pause = 2000; }
    } else {
      if (this.pause > 0) { this.pause -= this.speed; setTimeout(() => this.run(), this.speed); return; }
      this.el.textContent = txt.slice(0, --this.charIdx);
      if (this.charIdx === 0) { this.deleting = false; this.idx = (this.idx + 1) % this.texts.length; }
    }
    setTimeout(() => this.run(), this.deleting ? this.speed / 2 : this.speed);
  }
}

// ============ COUNT UP ============
class CountUp {
  constructor(el) {
    this.el = el;
    this.target = parseInt(el.dataset.target);
    this.suffix = el.dataset.suffix || '';
    this.done = false;
  }
  start() {
    if (this.done) return;
    this.done = true;
    let cur = 0;
    const step = Math.max(1, Math.floor(this.target / 60));
    const iv = setInterval(() => {
      cur = Math.min(cur + step, this.target);
      this.el.textContent = cur + this.suffix;
      if (cur >= this.target) clearInterval(iv);
    }, 25);
  }
}

// ============ CARD 3D TILT ============
class CardTilt {
  constructor(card) {
    this.card = card;
    this.bind();
  }
  bind() {
    this.card.addEventListener('mousemove', e => {
      const r = this.card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      this.card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });
    this.card.addEventListener('mouseleave', () => {
      this.card.style.transform = 'none';
      this.card.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
      setTimeout(() => this.card.style.transition = '', 500);
    });
  }
}

// ============ RADAR CHART ============
class RadarChart {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = data;
    this.frame = 0;
    this.progress = 0;
    this.draw();
  }
  draw() {
    const c = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.4;
    const N = this.data.length;
    const angle = (2 * Math.PI) / N;
    const p = Math.min(this.progress, 1);
    c.clearRect(0, 0, w, h);
    // Grid
    for (let lv = 1; lv <= 5; lv++) {
      c.beginPath();
      for (let i = 0; i < N; i++) {
        const a = angle * i - Math.PI / 2;
        const r = (R * lv) / 5;
        i === 0 ? c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                : c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.closePath();
      c.strokeStyle = 'rgba(103,100,246,0.15)';
      c.lineWidth = 1;
      c.stroke();
      if (lv === 5) {
        c.fillStyle = 'rgba(103,100,246,0.03)';
        c.fill();
      }
    }
    // Spokes
    for (let i = 0; i < N; i++) {
      const a = angle * i - Math.PI / 2;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      c.strokeStyle = 'rgba(103,100,246,0.2)';
      c.lineWidth = 1;
      c.stroke();
    }
    // Data shape
    c.beginPath();
    for (let i = 0; i < N; i++) {
      const a = angle * i - Math.PI / 2;
      const r = R * (this.data[i].value / 100) * p;
      i === 0 ? c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
              : c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    c.closePath();
    const grad = c.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(255,0,15,0.35)');
    grad.addColorStop(1, 'rgba(103,100,246,0.15)');
    c.fillStyle = grad;
    c.fill();
    c.strokeStyle = 'rgba(147,161,255,0.8)';
    c.lineWidth = 2;
    c.stroke();
    // Dots + labels
    for (let i = 0; i < N; i++) {
      const a = angle * i - Math.PI / 2;
      const r = R * (this.data[i].value / 100) * p;
      c.beginPath();
      c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, 0, Math.PI * 2);
      c.fillStyle = '#93a1ff';
      c.fill();
      c.shadowBlur = 10;
      c.shadowColor = '#6764f6';
      c.fill();
      c.shadowBlur = 0;
      const lr = R * 1.2;
      const lx = cx + Math.cos(a) * lr;
      const ly = cy + Math.sin(a) * lr;
      c.fillStyle = '#b0b0cc';
      c.font = '11px Inter';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(this.data[i].label, lx, ly);
    }
    if (this.progress < 1) {
      this.progress += 0.03;
      requestAnimationFrame(() => this.draw());
    }
  }
  start() { this.progress = 0; this.draw(); }
}

// ============ SCROLL PROGRESS ============
function initScrollProgress() {
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = ((window.scrollY / h) * 100) + '%';
  });
}

// ============ NAV ACTIVE + SCROLL ============
function initNav() {
  const nav = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });
  links.forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(l.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ============ LIVE CLOCK ============
function initClock() {
  const el = document.querySelector('.nav-time');
  if (!el) return;
  setInterval(() => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }, 1000);
}

// ============ REVEAL ON SCROLL ============
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
  els.forEach(el => io.observe(el));
}

// ============ SKILL BARS ============
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + '%';
        e.target.classList.add('filled');
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => io.observe(b));
}

// ============ COUNT UP ============
function initCountUp() {
  const counters = document.querySelectorAll('.count-up');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const cu = new CountUp(e.target);
        cu.start();
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

// ============ CARD TILT ============
function initTilt() {
  document.querySelectorAll('.tl-card,.about-card,.proto-card').forEach(c => new CardTilt(c));
}

// ============ RADAR ============
function initRadar() {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const data = [
    { label: '800xA DCS', value: 92 },
    { label: 'Edgenius IoT', value: 88 },
    { label: 'OPC UA', value: 90 },
    { label: 'Symphony+', value: 92 },
    { label: 'SCADA', value: 85 },
    { label: 'PLC', value: 82 },
    { label: 'Testing', value: 90 },
    { label: 'IIoT', value: 88 }
  ];
  const chart = new RadarChart(canvas, data);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { chart.start(); io.unobserve(e.target); } });
  }, { threshold: 0.3 });
  io.observe(canvas);
}

// ============ TEXT SCRAMBLE ============
function initScramble() {
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const ts = new TextScramble(el);
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { ts.scrambleIn(); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

// ============ HORIZONTAL DRAG SCROLL ============
function initDragScroll() {
  const track = document.querySelector('.proj-track');
  if (!track) return;
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDown = true; track.classList.add('grabbing');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  document.addEventListener('mouseup', () => { isDown = false; track.classList.remove('grabbing'); });
  track.addEventListener('mouseleave', () => { isDown = false; });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}

// ============ PHOTO TILT ============
function initPhotoTilt() {
  const wrap = document.querySelector('.photo-3d-wrap');
  const inner = document.querySelector('.photo-3d-inner');
  if (!wrap || !inner) return;
  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    inner.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.03)`;
    inner.style.transition = 'transform .1s linear';
  });
  wrap.addEventListener('mouseleave', () => {
    inner.style.transform = 'none';
    inner.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
  });
}

// ============ MAIN INIT ============
function init() {
  new Cursor();
  new ParticleSphere();
  const tw = new TypeWriter(
    document.querySelector('.hero-role'),
    ['Research and Development Engineer', 'IIoT Architect', 'DCS/SCADA Expert', 'Edge Computing Engineer', 'Automation Specialist']
  );
  initScrollProgress();
  initNav();
  initClock();
  initReveal();
  initSkillBars();
  initCountUp();
  initTilt();
  initRadar();
  initScramble();
  initDragScroll();
  initPhotoTilt();
}

// ============ BOOT ============
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = 'hidden';
  new Loader();
});
