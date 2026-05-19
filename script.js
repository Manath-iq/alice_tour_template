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
