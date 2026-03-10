// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
);

reveals.forEach((el) => observer.observe(el));

// Emote tier tabs
document.querySelectorAll(".emote-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tier = tab.dataset.tier;
    const card = tab.closest(".emotes-card");
    card
      .querySelectorAll(".emote-tab")
      .forEach((t) => t.classList.remove("active"));
    card
      .querySelectorAll(".emotes-tier-panel")
      .forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    card
      .querySelector(`.emotes-tier-panel[data-tier="${tier}"]`)
      .classList.add("active");
  });
});

// Twitch emotes
async function loadEmotes() {
  try {
    const res = await fetch("/api/emotes");
    const tiers = await res.json();
    for (const [tier, emotes] of Object.entries(tiers)) {
      const grid = document.querySelector(
        `.emotes-tier-panel[data-tier="${tier}"] .emotes-grid`,
      );
      if (!grid) continue;
      grid.innerHTML = emotes
        .map(
          (e) =>
            `<div class="emote-slot" title="${e.name}"><img src="${e.url}" alt="${e.name}" /></div>`,
        )
        .join("");
    }
  } catch (e) {
    // silently fail — emote panels stay empty
  }
}

loadEmotes();
loadProducts();
loadSchedule();

// Twitch live status + live products
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
        ${p.image ? `<img src="${p.image}" alt="${p.imageAlt}" style="width:100%;border-radius:8px;margin-bottom:0.75rem;object-fit:cover;aspect-ratio:1" />` : ""}
        <div class="platform-name">${p.title}</div>
        <p class="platform-desc">${p.price} ${p.currency}</p>
        <span style="display:inline-block;margin-top:0.4rem;font-size:0.75rem;padding:2px 8px;border-radius:999px;${p.available ? "background:rgba(0,200,100,0.15);color:#4dffaa;" : "background:rgba(255,255,255,0.06);color:#888;"}">${p.available ? "På lager" : "Utsolgt"}</span>
        <span class="platform-arrow">↗</span>
      </a>`,
      )
      .join("");
  } catch (e) {
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
    const res = await fetch("/api/twitch-schedule");
    const { days } = await res.json();

    container.innerHTML = dayNames
      .map((name, i) =>
        days[i]
          ? `<div class="schedule-day stream-day"><span class="day-name">${name}</span><span class="day-time">${days[i]}</span></div>`
          : `<div class="schedule-day"><span class="day-name">${name}</span><span class="day-off">—</span></div>`,
      )
      .join("");

    if (note) note.textContent = "⚡ Direkte fra Twitch-schedule";
  } catch (e) {
    if (note) note.textContent = "⚡ Kunne ikke hente schedule";
  }
}

async function checkTwitchLive() {
  const liveEl = document.querySelector(".hero-live");
  if (!liveEl) return;
  const dotEl = liveEl.querySelector(".live-dot");
  const textEl = liveEl.querySelector(".live-text");
  const badge = document.getElementById("stream-status-badge");

  try {
    const res = await fetch("/api/twitch-status");
    const { isLive } = await res.json();
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
  } catch (e) {
    // silently fail — keep default look
  }
}

checkTwitchLive();
setInterval(checkTwitchLive, 60 * 1000);

// Nav shadow on scroll
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.style.background = "rgba(10,10,15,0.97)";
    nav.style.backdropFilter = "blur(12px)";
    nav.style.borderBottom = "1px solid rgba(255,255,255,0.06)";
  } else {
    nav.style.background =
      "linear-gradient(to bottom, rgba(10,10,15,0.95), transparent)";
    nav.style.backdropFilter = "blur(2px)";
    nav.style.borderBottom = "none";
  }
});
