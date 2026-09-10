// ── Neural network canvas with signal propagation ──
(function () {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const NODE_COUNT = 46;
  const CONNECTION_DIST = 175;
  const NODE_COLOR = 'rgba(120, 120, 128, VAL)';
  const LINE_COLOR = 'rgba(140, 140, 148, VAL)';
  const SIGNAL_RGB = '30, 58, 138';
  const MAX_SIGNALS = 14;

  let nodes = [];
  let signals = [];
  let frame = 0;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function init() {
    nodes = [];
    signals = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1.5,
        pulse: Math.random() * Math.PI * 2,
        flash: 0,
      });
    }
  }

  function neighbours(idx) {
    const out = [];
    const a = nodes[idx];
    for (let j = 0; j < nodes.length; j++) {
      if (j === idx) continue;
      const dx = a.x - nodes[j].x;
      const dy = a.y - nodes[j].y;
      if (dx * dx + dy * dy < CONNECTION_DIST * CONNECTION_DIST) out.push(j);
    }
    return out;
  }

  function fireSignal(from) {
    if (signals.length >= MAX_SIGNALS) return;
    const ns = neighbours(from);
    if (!ns.length) return;
    const to = ns[(Math.random() * ns.length) | 0];
    signals.push({ from, to, t: 0, speed: 0.012 + Math.random() * 0.014 });
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.14;
          ctx.beginPath();
          ctx.strokeStyle = LINE_COLOR.replace('VAL', alpha);
          ctx.lineWidth = 1;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) {
      if (frame % 40 === 0) fireSignal((Math.random() * nodes.length) | 0);
      for (let k = signals.length - 1; k >= 0; k--) {
        const s = signals[k];
        const a = nodes[s.from];
        const b = nodes[s.to];
        if (!a || !b) { signals.splice(k, 1); continue; }
        s.t += s.speed;
        const x = a.x + (b.x - a.x) * s.t;
        const y = a.y + (b.y - a.y) * s.t;
        const fade = Math.sin(Math.min(s.t, 1) * Math.PI);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, `rgba(${SIGNAL_RGB}, ${0.45 * fade})`);
        glow.addColorStop(1, `rgba(${SIGNAL_RGB}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${SIGNAL_RGB}, ${0.9 * fade})`;
        ctx.fill();
        if (s.t >= 1) {
          b.flash = 1;
          signals.splice(k, 1);
          if (Math.random() < 0.62) fireSignal(s.to);
        }
      }
    }

    nodes.forEach(n => {
      n.pulse += 0.02;
      const base = 0.2 + Math.sin(n.pulse) * 0.12;
      const alpha = Math.min(0.9, base + n.flash * 0.6);
      const radius = n.r + n.flash * 2.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = NODE_COLOR.replace('VAL', alpha);
      ctx.fill();
      if (n.flash > 0) n.flash = Math.max(0, n.flash - 0.035);
    });

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

// ── Scroll progress bar ──
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = ((scrollTop / docHeight) * 100) + '%';
});

// ── Navbar scroll border ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile menu ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Back to top ──
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Staggered scroll-reveal ──
const revealEls = document.querySelectorAll(
  '.section-title, .about-text, .career-track, .rec-intro, .contact-intro, ' +
  '.top-skill-card, .skill-category, .project-card, .edu-card, .rec-card, ' +
  '.speaking-card, .contact-card, .timeline-item, .pipeline-stage'
);
revealEls.forEach(el => el.classList.add('reveal'));

document.querySelectorAll(
  '.top-skills-grid, .skills-grid, .projects-grid, .education-grid, .rec-grid, .contact-links'
).forEach(group => {
  Array.from(group.children).forEach((child, i) => {
    child.style.setProperty('--reveal-delay', ((i % 3) * 70) + 'ms');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
);
revealEls.forEach(el => revealObserver.observe(el));

// ── Career timeline draw-in ──
const careerTrack = document.querySelector('.career-track');
if (careerTrack) {
  const careerObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); careerObserver.unobserve(e.target); }
    }),
    { threshold: 0.3 }
  );
  careerObserver.observe(careerTrack);
}

// ── Active nav link ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
sections.forEach(s => sectionObserver.observe(s));
