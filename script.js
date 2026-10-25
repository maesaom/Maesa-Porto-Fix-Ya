/* =========================================================
   MAESA PORTFOLIO — interactions
   ========================================================= */
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeSymbol = themeToggle.querySelector(".theme-symbol");
const themeLabel = themeToggle.querySelector(".theme-label");
const themeMeta = document.querySelector('meta[name="theme-color"]');

// 1. Theme: the bright accent palette stays the same in both modes.
function applyTheme(theme, save = true) {
  root.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  themeSymbol.textContent = isDark ? "☼" : "☾";
  themeLabel.textContent = isDark ? "Mode terang" : "Mode gelap";
  themeToggle.setAttribute("aria-label", isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap");
  if (themeMeta) themeMeta.setAttribute("content", isDark ? "#111318" : "#f4f1e8");
  if (save) {
    try { localStorage.setItem("maesa-portfolio-theme", theme); } catch (error) { /* Storage may be blocked. */ }
  }
}

let initialTheme = "dark";
try {
  const savedTheme = localStorage.getItem("maesa-portfolio-theme");
  if (savedTheme === "dark" || savedTheme === "light") initialTheme = savedTheme;
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) initialTheme = "light";
} catch (error) {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) initialTheme = "light";
}
applyTheme(initialTheme, false);
themeToggle.addEventListener("click", () => {
  applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

// 2. Mobile navigation.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
function closeMenu() {
  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Buka navigasi");
}
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Tutup navigasi" : "Buka navigasi");
});
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMenu(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

// 3. Filter skill cards by category.
const filterButtons = document.querySelectorAll("[data-filter]");
const skillCards = document.querySelectorAll(".skill-card[data-cat]");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    skillCards.forEach((card) => {
      const show = filter === "all" || card.dataset.cat === filter;
      card.hidden = !show;
      if (show && revealObserver) revealObserver.observe(card);
    });
  });
});

// 4. Scroll reveals repeat in both directions: entering the viewport
// reveals each item, and leaving the viewport resets it for the next pass.
let scrollDirection = "down";
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const currentY = window.scrollY;
  if (Math.abs(currentY - lastScrollY) > 2) scrollDirection = currentY > lastScrollY ? "down" : "up";
  lastScrollY = currentY;
}, { passive: true });

const revealItems = document.querySelectorAll(".reveal");
let revealObserver = null;
if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.dataset.direction = scrollDirection;
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
      else entry.target.classList.remove("is-visible");
    });
  }, { threshold: 0.12, rootMargin: "-5% 0px -8% 0px" });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${(index % 4) * 65}ms`;
    item.dataset.direction = "down";
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// 5. Highlight the navigation item matching the visible section.
const sectionTargets = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((anchor) => {
        const active = anchor.getAttribute("href") === `#${entry.target.id}`;
        anchor.classList.toggle("active", active);
        if (active) anchor.setAttribute("aria-current", "location");
        else anchor.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-38% 0px -52% 0px" });
  sectionTargets.forEach((section) => sectionObserver.observe(section));
}

// 6. Contact form opens the visitor's email app (no backend service required).
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const CONTACT_EMAIL = "maesaom2006@gmail.com";
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("senderName").value.trim();
  const senderEmail = document.getElementById("senderEmail").value.trim();
  const message = document.getElementById("senderMessage").value.trim();
  if (!name || !senderEmail || !message) {
    formNote.textContent = "Mohon lengkapi nama, email, dan pesan terlebih dahulu.";
    return;
  }
  const subject = encodeURIComponent(`Pesan portofolio dari ${name}`);
  const body = encodeURIComponent(`${message}\n\nDari: ${name}\nEmail: ${senderEmail}`);
  formNote.textContent = "Aplikasi email akan dibuka. Periksa pesan lalu tekan Kirim di aplikasi email kamu.";
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

// 7. Current year.
document.getElementById("year").textContent = new Date().getFullYear();

// 8. Teks animasi di hero (mengetik & menghapus bergantian).
const typedEl = document.getElementById("typed");
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (typedEl && !reduceMotion) {
  const roles = ["Web Developer", "Analis Sistem", "Database Designer", "Problem Solver"];
  let roleIndex = 0, charIndex = 0, deleting = false;
  (function tick() {
    const word = roles[roleIndex];
    typedEl.textContent = word.slice(0, charIndex);
    if (!deleting && charIndex === word.length) { deleting = true; return setTimeout(tick, 1500); }
    if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
    charIndex += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 40 : 85);
  })();
}

// 9. Bilah progres scroll + parallax lingkaran hero.
const progressBar = document.getElementById("scrollProgress");
const orbits = document.querySelectorAll(".hero-orbit");
let scrollTick = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  if (!reduceMotion) orbits.forEach((orbit, i) => { orbit.style.translate = `0 ${window.scrollY * (i ? -0.08 : 0.12)}px`; });
  scrollTick = false;
}
window.addEventListener("scroll", () => { if (!scrollTick) { scrollTick = true; requestAnimationFrame(updateScroll); } }, { passive: true });
updateScroll();

// 10. Pointer: cahaya halus mengikuti kursor + sorot pada kartu (hanya mouse).
const glow = document.getElementById("cursorGlow");
if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    glow.classList.add("on");
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    const card = e.target.closest && e.target.closest(".skill-card, .project-card");
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  }, { passive: true });
  document.addEventListener("pointerleave", () => glow.classList.remove("on"));
}

// 11. Transisi halus saat berganti tema.
themeToggle.addEventListener("click", () => {
  root.classList.add("theme-anim");
  setTimeout(() => root.classList.remove("theme-anim"), 600);
});

// 12. Latar belakang hidup: blob warna mengalir + jaringan titik (tema "sistem informasi").
(function () {
  const cv = document.getElementById("bgCanvas");
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const BLUE = "65,105,255", LIME = "200,255,69", ORANGE = "255,112,67";
  // a = [opasitas mode gelap, opasitas mode terang]; warna sama di kedua mode.
  const blobs = [
    { c: BLUE,   r: .62, ax: .32, ay: .22, sx: 1.1e-4, sy: .9e-4,  p: 0,   k: 1.0, a: [.34, .24] },
    { c: ORANGE, r: .46, ax: .34, ay: .26, sx: .8e-4,  sy: 1.2e-4, p: 2.1, k: .6,  a: [.24, .20] },
    { c: LIME,   r: .40, ax: .30, ay: .30, sx: 1.3e-4, sy: .7e-4,  p: 4.0, k: 1.4, a: [.17, .30] },
    { c: BLUE,   r: .38, ax: .36, ay: .20, sx: .7e-4,  sy: 1.0e-4, p: 5.3, k: .8,  a: [.22, .16] },
  ];
  const palette = [BLUE, LIME, ORANGE, BLUE, ORANGE];
  let W = 0, H = 0, dpr = 1, nodes = [];
  const mouse = { x: -999, y: -999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = W < 700 ? 22 : 46;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      c: palette[Math.floor(Math.random() * palette.length)], s: 1.2 + Math.random() * 1.8,
    }));
  }

  function draw(t) {
    const dark = document.documentElement.getAttribute("data-theme") !== "light";
    ctx.clearRect(0, 0, W, H);
    const shift = window.scrollY * .1;

    // 1) Blob warna yang mengalir (bergerak sendiri + sedikit mengikuti scroll)
    for (const b of blobs) {
      const x = W * (.5 + b.ax * Math.sin(t * b.sx + b.p));
      const y = H * (.5 + b.ay * Math.cos(t * b.sy + b.p * 1.7)) - shift * b.k;
      const R = Math.max(W, H) * b.r;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, `rgba(${b.c},${dark ? b.a[0] : b.a[1]})`);
      g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // 2) Jaringan titik yang saling terhubung, menjauh dari kursor
    const link = dark ? "144,166,255" : "65,105,255";
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const dx = n.x - mouse.x, dy = n.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 19600 && d2 > 1) { const f = 1 - Math.sqrt(d2) / 140; n.vx += (dx / Math.sqrt(d2)) * f * .06; n.vy += (dy / Math.sqrt(d2)) * f * .06; }
      n.vx *= .995; n.vy *= .995;
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j], ex = n.x - m.x, ey = n.y - m.y, dist = Math.sqrt(ex * ex + ey * ey);
        if (dist < 140) {
          ctx.strokeStyle = `rgba(${link},${(1 - dist / 140) * (dark ? .22 : .2)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${n.c},${dark ? .75 : .65})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.s, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop(t) { draw(t); requestAnimationFrame(loop); }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
  if (reduceMotion) draw(0); else requestAnimationFrame(loop);
})();
