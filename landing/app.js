const BASE = window.NEPAL_API_BASE || window.location.origin;

// ── 3D Matrix Code-Rain Canvas ──
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CHARS = '01234567890{}[]<>=!&|/\\;:.,+-_'.split('');
  const WORDS = ['API','GET','POST','JWT','null','true','false','async','await','fetch','token','Nepal','/v1/','200','404'];

  const PLANES = [
    { size: 7,  gap: 9,  speed: 0.22, alpha: 0.05, headClr: '#3f3f3f', bodyClr: '#1f1f1f' },
    { size: 11, gap: 14, speed: 0.55, alpha: 0.12, headClr: '#166534', bodyClr: '#052e16' },
    { size: 15, gap: 20, speed: 1.0,  alpha: 0.20, headClr: '#22c55e', bodyClr: '#15803d' },
    { size: 13, gap: 40, speed: 0.85, alpha: 0.17, headClr: '#dc2626', bodyClr: '#991b1b' },
  ];

  let W, H, streams = [], resizeTimer;

  function mkStream(plane) {
    const len = 7 + Math.floor(Math.random() * 20);
    return {
      plane,
      x: Math.random() * W,
      y: Math.random() * H,
      len,
      chars: Array.from({ length: len + 6 }, () =>
        Math.random() > 0.82
          ? WORDS[Math.floor(Math.random() * WORDS.length)]
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      ),
      age: 0,
    };
  }

  function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    streams = [];
    PLANES.forEach((p, pi) => {
      const density = pi === 3 ? 0.10 : pi === 2 ? 0.45 : 0.80;
      const count = Math.floor((W / p.gap) * density);
      for (let i = 0; i < count; i++) streams.push(mkStream(p));
    });
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 180);
  });
  init();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    streams.forEach(s => {
      const p = s.plane;
      s.y += p.speed;
      s.age++;
      if (s.age > 10) {
        s.age = 0;
        const i = Math.floor(Math.random() * s.chars.length);
        s.chars[i] = Math.random() > 0.82
          ? WORDS[Math.floor(Math.random() * WORDS.length)]
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      if (s.y - s.len * p.size > H) {
        s.y = -s.len * p.size - Math.random() * 150;
        s.x = Math.random() * W;
      }
      ctx.font = `${p.size}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < s.len; i++) {
        const cy = s.y - i * p.size;
        if (cy < -p.size || cy > H + p.size) continue;
        const fade = 1 - (i / s.len) * 0.88;
        ctx.globalAlpha = p.alpha * fade * (i < 2 ? 2.2 : 1);
        ctx.fillStyle = i < 2 ? p.headClr : p.bodyClr;
        ctx.fillText(s.chars[i] || '0', s.x, cy);
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Mobile nav ──
const toggle = document.getElementById('mobileToggle');
const menu   = document.getElementById('mobileMenu');
toggle.addEventListener('click', () => menu.classList.toggle('open'));
function closeMobile() { menu.classList.remove('open'); }
document.addEventListener('click', e => {
  if (!toggle.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
});

// ── Hero code tabs ──
document.querySelectorAll('.tab-switcher .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-switcher .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.snippet').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// ── Example nav tabs ──
document.querySelectorAll('.example-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.example-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.example-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('example-' + tab.dataset.example).classList.add('active');
  });
});

// ── Endpoint copy buttons ──
document.querySelectorAll('.ep-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.ep-row');
    const url = BASE + row.dataset.path;
    navigator.clipboard.writeText(url).then(() => {
      btn.textContent = '✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = '⎘'; btn.classList.remove('copied'); }, 1800);
    });
  });
});

// ── Copy base URL ──
function copyBaseUrl() {
  const text = document.getElementById('base-url-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.innerHTML = '⎘ Copy'; }, 2000);
  });
}

// ── Live API runner ──
function runLive(btn) {
  const runner = btn.closest('.live-runner');
  const url = BASE + runner.dataset.url;
  const pre = runner.querySelector('.live-response');

  btn.disabled = true;
  btn.innerHTML = '<span class="run-spinner"></span> Running…';
  pre.hidden = false;
  pre.textContent = 'Fetching…';
  pre.classList.remove('run-error');

  fetch(url)
    .then(r => r.json())
    .then(data => {
      pre.textContent = JSON.stringify(data, null, 2);
      btn.innerHTML = '▶ Run Live';
      btn.disabled = false;
    })
    .catch(err => {
      pre.textContent = 'Error: ' + err.message;
      pre.classList.add('run-error');
      btn.innerHTML = '▶ Run Live';
      btn.disabled = false;
    });
}
