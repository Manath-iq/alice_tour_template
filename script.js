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

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll("[data-reveal]").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  observer.observe(element);
});

document.querySelectorAll(".tour-card button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#quiz").scrollIntoView({ behavior: "smooth" });
    state.step = 0;
    updateQuiz();
  });
});

updateRange();
updateQuiz();

/* ─── Scroll-driven video background ─────────────────────────────── */
(function () {
  const videoBg    = document.getElementById('videoBg');
  const video      = document.getElementById('bgVideo');
  if (!videoBg || !video) return;

  const quizSection = document.getElementById('quiz');
  if (!quizSection) return;

  // ── Replace <video> with a canvas for flicker-free frame rendering ──
  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d', { alpha: false });
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
  video.style.display  = 'none';
  videoBg.appendChild(canvas);

  let duration     = 0;
  let targetTime   = 0;   // where scroll wants us to be
  let displayTime  = 0;   // where we actually are (lerped)
  let rafId        = null;
  let ready        = false;

  // ── Resize canvas to match video ────────────────────────────────────
  function resizeCanvas() {
    if (!video.videoWidth) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  // ── Draw current video frame to canvas ──────────────────────────────
  function drawFrame() {
    if (!ctx || !video.videoWidth) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  // ── Compute scroll metrics ───────────────────────────────────────────
  function getZone() {
    const quizTop  = quizSection.getBoundingClientRect().top + window.scrollY;
    const docH     = document.documentElement.scrollHeight;
    const winH     = window.innerHeight;
    return { quizTop, zoneEnd: docH - winH, winH };
  }

  // ── Main animation loop ─────────────────────────────────────────────
  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!ready || !duration) return;

    const scrollY = window.scrollY;
    const { quizTop, zoneEnd, winH } = getZone();

    // Progress [0..1] within the scrollable zone
    const zoneLen   = Math.max(1, zoneEnd - quizTop);
    const progress  = Math.max(0, Math.min(1, (scrollY - quizTop) / zoneLen));
    targetTime      = progress * duration;

    // Opacity: fade in as we approach quiz, stay on, fade out at bottom
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

    // Lerp displayTime toward targetTime for smooth motion
    const diff = targetTime - displayTime;
    if (Math.abs(diff) < 0.001) return;          // already there

    // Lerp factor: faster when far, slower when close (ease-out feel)
    const lerpFactor = Math.min(0.28, Math.abs(diff) * 0.9);
    displayTime += diff * lerpFactor;

    // Clamp to valid range
    displayTime = Math.max(0, Math.min(duration, displayTime));

    // Seek & draw
    if (Math.abs(video.currentTime - displayTime) > 1 / 48) {
      video.currentTime = displayTime;
    }
    drawFrame();
  }

  // ── Init once video is ready ─────────────────────────────────────────
  function onReady() {
    duration = video.duration;
    resizeCanvas();
    video.currentTime = 0;
    drawFrame();
    ready = true;
    rafId = requestAnimationFrame(loop);
  }

  // Wait for enough data to seek freely
  if (video.readyState >= 4) {          // HAVE_ENOUGH_DATA
    onReady();
  } else {
    video.addEventListener('canplaythrough', onReady, { once: true });
    // Fallback: start as soon as metadata & first frame are available
    video.addEventListener('loadeddata', () => {
      if (!ready) onReady();
    }, { once: true });
  }

  // Force the browser to load the full file
  video.load();
})();
/* ─────────────────────────────────────────────────────────────────── */
