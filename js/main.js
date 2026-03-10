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

// Twitch live status
async function checkTwitchLive() {
  const liveEl = document.querySelector(".hero-live");
  if (!liveEl) return;
  const dotEl = liveEl.querySelector(".live-dot");
  const textEl = liveEl.querySelector(".live-text");

  try {
    const res = await fetch("/api/twitch-status");
    const { isLive } = await res.json();
    if (isLive) {
      dotEl.classList.remove("offline");
      textEl.textContent = "LIVE NÅ på Twitch";
    } else {
      dotEl.classList.add("offline");
      textEl.textContent = "Ikke live nå";
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
