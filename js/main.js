// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 80);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Emote tier tabs
document.querySelectorAll(".emote-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tier = tab.dataset.tier;
    const card = tab.closest(".emotes-card");
    card.querySelectorAll(".emote-tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    card.querySelectorAll(".emotes-tier-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    card.querySelector(`.emotes-tier-panel[data-tier="${tier}"]`).classList.add("active");
  });
});

// Twitch emotes
async function loadEmotes() {
  try {
    const res = await fetch("/api/emotes");
    const tiers = await res.json();
    for (const [tier, emotes] of Object.entries(tiers)) {
      const grid = document.querySelector(`.emotes-tier-panel[data-tier="${tier}"] .emotes-grid`);
      if (!grid) continue;
      grid.innerHTML = emotes
        .map((e) => `<div class="emote-slot" title="${e.name}"><img src="${e.url}" alt="${e.name}" /></div>`)
        .join("");
    }
  } catch {
    // silently fail — emote panels stay empty
  }
}

// Shopify products
async function loadProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  try {
    const res = await fetch("/api/products");
    const products = await res.json();
    if (!products.length) return;
    grid.innerHTML = products
      .map(
        (p) => `
        <a href="https://apexcollect.no/products/${p.handle}" target="_blank" class="platform-card">
          ${p.image ? `<img src="${p.image}" alt="${p.imageAlt || p.title}" class="product-img" />` : ""}
          <div class="platform-name">${p.title}</div>
          <p class="platform-desc">${p.price} ${p.currency}</p>
          <span class="stock-badge ${p.available ? "available" : "sold-out"}">${p.available ? "På lager" : "Utsolgt"}</span>
          <span class="platform-arrow" aria-hidden="true">↗</span>
        </a>`,
      )
      .join("");
  } catch {
    // silently fail
  }
}

// Twitch schedule
async function loadSchedule() {
  const container = document.getElementById("schedule-days");
  const note = document.getElementById("schedule-note");
  if (!container) return;
  const dayNames = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  try {
    const { days } = await fetch("/api/twitch-schedule").then((r) => r.json());
    container.innerHTML = dayNames
      .map((name, i) =>
        days[i]
          ? `<div class="schedule-day stream-day"><span class="day-name">${name}</span><span class="day-time">${days[i]}</span></div>`
          : `<div class="schedule-day"><span class="day-name">${name}</span><span class="day-off">—</span></div>`,
      )
      .join("");
    if (note) note.textContent = "⚡ Direkte fra Twitch-schedule";
  } catch {
    if (note) note.textContent = "⚡ Kunne ikke hente schedule";
  }
}

// Twitch live status
async function checkTwitchLive() {
  const liveEl = document.querySelector(".hero-live");
  if (!liveEl) return;
  const dotEl = liveEl.querySelector(".live-dot");
  const textEl = liveEl.querySelector(".live-text");
  const badge = document.getElementById("stream-status-badge");
  try {
    const { isLive } = await fetch("/api/twitch-status").then((r) => r.json());
    if (isLive) {
      dotEl.classList.remove("offline");
      textEl.textContent = "LIVE NÅ på Twitch";
      if (badge) {
        badge.textContent = "🔴 LIVE nå";
        badge.style.background = "rgba(145,70,255,0.2)";
        badge.style.color = "#b97aff";
      }
    } else {
      dotEl.classList.add("offline");
      textEl.textContent = "Ikke live nå";
      if (badge) {
        badge.textContent = "Ikke live nå";
        badge.style.background = "rgba(255,255,255,0.06)";
        badge.style.color = "#aaa";
      }
    }
  } catch {
    // silently fail — keep default look
  }
}

// Nav shadow on scroll
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.style.background = "rgba(10,10,15,0.97)";
    nav.style.backdropFilter = "blur(12px)";
    nav.style.borderBottom = "1px solid rgba(255,255,255,0.06)";
  } else {
    nav.style.background = "linear-gradient(to bottom, rgba(10,10,15,0.95), transparent)";
    nav.style.backdropFilter = "blur(2px)";
    nav.style.borderBottom = "none";
  }
});

loadEmotes();
loadProducts();
loadSchedule();
checkTwitchLive();
setInterval(checkTwitchLive, 60_000);
