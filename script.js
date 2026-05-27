/* ─── Quiz State ─────────────────────────────────────────────────── */
const state = {
  step: 0,
  maxStep: 4,
};

const steps = Array.from(document.querySelectorAll(".quiz-step"));
const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
const nextButton = document.querySelector("#nextStep");
const prevButton = document.querySelector("#prevStep");
const successScreen = document.querySelector(".quiz-success");
const quizShell = document.querySelector(".quiz-shell");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const budgetRange = document.querySelector("#budgetRange");
const budgetValue = document.querySelector("#budgetValue");

function updateQuiz() {
  steps.forEach((step, index) => {
    step.classList.toggle("is-active", index === state.step);
  });

  progressSteps.forEach((step, index) => {
    step.classList.toggle("is-active", index === state.step);
    step.classList.toggle("is-done", index < state.step);
  });

  successScreen.classList.remove("is-active");
  prevButton.disabled = state.step === 0;
  prevButton.style.opacity = state.step === 0 ? "0.55" : "1";
  nextButton.textContent = state.step === state.maxStep ? "Получить подборку →" : "Далее →";
}

function showSuccess() {
  steps.forEach((step) => step.classList.remove("is-active"));
  progressSteps.forEach((step) => {
    step.classList.remove("is-active");
    step.classList.add("is-done");
  });
  successScreen.classList.add("is-active");
  nextButton.textContent = "Заполнить ещё раз";
  prevButton.style.opacity = "1";
  quizShell.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateRange() {
  const min = Number(budgetRange.min);
  const max = Number(budgetRange.max);
  const value = Number(budgetRange.value);
  const progress = ((value - min) / (max - min)) * 100;
  budgetRange.style.setProperty("--range-progress", `${progress}%`);
  budgetValue.textContent = value >= 3000 ? "$3000+" : `$${value}`;
  budgetValue.style.left = `${progress}%`;
}

document.querySelectorAll("[data-choice-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const card = event.target.closest(".choice-card");
    if (!card) return;
    group.querySelectorAll(".choice-card").forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
  });
});

progressSteps.forEach((step) => {
  step.addEventListener("click", () => {
    state.step = Number(step.dataset.stepJump);
    updateQuiz();
  });
});

nextButton.addEventListener("click", () => {
  if (successScreen.classList.contains("is-active")) {
    state.step = 0;
    updateQuiz();
    return;
  }
  if (state.step === state.maxStep) {
    showSuccess();
    return;
  }
  state.step += 1;
  updateQuiz();
  quizShell.scrollIntoView({ behavior: "smooth", block: "start" });
});

prevButton.addEventListener("click", () => {
  if (successScreen.classList.contains("is-active")) {
    state.step = state.maxStep;
    updateQuiz();
    return;
  }
  state.step = Math.max(0, state.step - 1);
  updateQuiz();
});

budgetRange.addEventListener("input", updateRange);

/* ─── Mobile Menu ────────────────────────────────────────────────── */
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("is-open");
  mobileMenu.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
});

mobileMenu.addEventListener("click", (event) => {
  if (!event.target.matches("a")) return;
  menuToggle.classList.remove("is-open");
  mobileMenu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
});

/* ─── Scroll Reveal ──────────────────────────────────────────────── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("[data-reveal]").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 50, 280)}ms`;
  observer.observe(element);
});

/* ─── Tour Cards → Quiz ──────────────────────────────────────────── */
document.querySelectorAll(".tour-card button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#quiz").scrollIntoView({ behavior: "smooth" });
    state.step = 0;
    updateQuiz();
  });
});

/* ─── Header scroll state ────────────────────────────────────────── */
const siteHeader = document.getElementById("siteHeader");
function updateHeader() {
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 60);
}
window.addEventListener("scroll", updateHeader, { passive: true });

/* ─── Active Nav Highlight on Scroll ────────────────────────────── */
const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const sections = navLinks.map((link) => {
  const id = link.getAttribute("href").replace("#", "");
  return document.getElementById(id);
}).filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => navObserver.observe(section));

/* ─── Sticky CTA ─────────────────────────────────────────────────── */
(function () {
  const stickyCta = document.getElementById("stickyCta");
  const heroSection = document.getElementById("hero");
  const quizSection = document.getElementById("quiz");
  if (!stickyCta || !heroSection) return;

  let ctaVisible = false;

  function updateStickyCta() {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const quizTop = quizSection ? quizSection.getBoundingClientRect().top : Infinity;

    // Show after hero passes, hide when quiz is visible in viewport
    const shouldShow = heroBottom < 0 && quizTop > window.innerHeight * 0.6;

    if (shouldShow !== ctaVisible) {
      ctaVisible = shouldShow;
      stickyCta.setAttribute("aria-hidden", String(!shouldShow));
      if (shouldShow) {
        stickyCta.classList.add("is-visible");
        stickyCta.classList.remove("is-hidden");
      } else {
        stickyCta.classList.remove("is-visible");
        stickyCta.classList.add("is-hidden");
      }
    }
  }

  window.addEventListener("scroll", updateStickyCta, { passive: true });
  updateStickyCta();
})();

/* ─── Hot Tours Countdown Timer ──────────────────────────────────── */
(function () {
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Store end time in sessionStorage so it persists on refresh
  const storageKey = "alice_tour_countdown_end";
  let endTime = parseInt(sessionStorage.getItem(storageKey), 10);
  if (!endTime || endTime < Date.now()) {
    // Random between 4 and 23 hours from now
    const hours = Math.floor(Math.random() * 19) + 4;
    endTime = Date.now() + hours * 3600 * 1000;
    sessionStorage.setItem(storageKey, String(endTime));
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const diff = Math.max(0, endTime - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hoursEl.textContent = pad(h);
    minutesEl.textContent = pad(m);
    secondsEl.textContent = pad(s);

    if (diff <= 0) {
      clearInterval(countdownInterval);
    }
  }

  tick();
  const countdownInterval = setInterval(tick, 1000);
})();

/* ─── Count-up Numbers in About ─────────────────────────────────── */
(function () {
  function animateCount(el, target, duration = 1600, isDecimal = false) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = start + (target - start) * eased;

      if (isDecimal) {
        el.textContent = value.toFixed(1);
      } else {
        el.textContent = Math.floor(value) + "+";
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target + "+";
      }
    }

    requestAnimationFrame(update);
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const intEls = entry.target.querySelectorAll(".count-up");
        intEls.forEach((el) => {
          const target = parseInt(el.dataset.target, 10);
          animateCount(el, target, 1600, false);
        });

        const decEls = entry.target.querySelectorAll(".count-up-dec");
        decEls.forEach((el) => {
          const target = parseFloat(el.dataset.target);
          animateCount(el, target, 1600, true);
        });

        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  const statsRow = document.querySelector(".stats-row");
  if (statsRow) countObserver.observe(statsRow);
})();

/* ─── Ripple effect on tour card buttons ────────────────────────── */
document.querySelectorAll(".tour-card button").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.35);
      width: 8px; height: 8px;
      top: ${e.clientY - rect.top - 4}px;
      left: ${e.clientX - rect.left - 4}px;
      transform: scale(1);
      animation: rippleAnim 600ms ease-out forwards;
      pointer-events: none;
    `;
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

// Inject ripple keyframes
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `@keyframes rippleAnim {
  to { transform: scale(28); opacity: 0; }
}`;
document.head.appendChild(rippleStyle);

/* ─── Init ───────────────────────────────────────────────────────── */
updateRange();
updateQuiz();

/* ─── Scroll-driven video background ────────────────────────────── */
(function () {
  const videoBg   = document.getElementById('videoBg');
  const video     = document.getElementById('bgVideo');
  if (!videoBg || !video) return;

  const quizSection = document.getElementById('quiz');
  if (!quizSection) return;

  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d', { alpha: false });
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
  video.style.display = 'none';
  videoBg.appendChild(canvas);

  let duration    = 0;
  let targetTime  = 0;
  let displayTime = 0;
  let rafId       = null;
  let ready       = false;

  function resizeCanvas() {
    if (!video.videoWidth) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  function drawFrame() {
    if (!ctx || !video.videoWidth) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  function getZone() {
    const quizTop = quizSection.getBoundingClientRect().top + window.scrollY;
    const docH    = document.documentElement.scrollHeight;
    const winH    = window.innerHeight;
    return { quizTop, zoneEnd: docH - winH, winH };
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!ready || !duration) return;

    const scrollY = window.scrollY;
    const { quizTop, zoneEnd, winH } = getZone();

    const zoneLen  = Math.max(1, zoneEnd - quizTop);
    const progress = Math.max(0, Math.min(1, (scrollY - quizTop) / zoneLen));
    targetTime     = progress * duration;

    let opacity;
    if (scrollY < quizTop - 80) {
      opacity = 0;
    } else if (scrollY < quizTop) {
      opacity = (scrollY - (quizTop - 80)) / 80;
    } else if (progress >= 1) {
      opacity = Math.max(0, 1 - (scrollY - zoneEnd) / winH * 3);
    } else {
      opacity = 1;
    }
    videoBg.classList.toggle('is-visible', opacity > 0.01);

    const diff = targetTime - displayTime;
    if (Math.abs(diff) < 0.001) return;

    const lerpFactor = Math.min(0.28, Math.abs(diff) * 0.9);
    displayTime += diff * lerpFactor;
    displayTime = Math.max(0, Math.min(duration, displayTime));

    if (Math.abs(video.currentTime - displayTime) > 1 / 48) {
      video.currentTime = displayTime;
    }
    drawFrame();
  }

  function onReady() {
    duration = video.duration;
    resizeCanvas();
    video.currentTime = 0;
    drawFrame();
    ready = true;
    rafId = requestAnimationFrame(loop);
  }

  if (video.readyState >= 4) {
    onReady();
  } else {
    video.addEventListener('canplaythrough', onReady, { once: true });
    video.addEventListener('loadeddata', () => { if (!ready) onReady(); }, { once: true });
  }

  video.load();
})();
