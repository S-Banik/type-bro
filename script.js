let currentText = "";
let startTime;
let timerStarted = false;
let timeLeft = 0;
let timerInterval;

let mistakes = 0;
let lastLength = 0;

const setupDiv = document.getElementById("setup");
const testDiv = document.getElementById("test");

const passageEl = document.getElementById("passage");
const inputEl = document.getElementById("input");

const accuracyEl = document.getElementById("accuracy");
const wpmEl = document.getElementById("wpm");
const timerEl = document.getElementById("timer");

/* START TEST */
function startTest() {
  const text = document.getElementById("givenText").value.trim();
  const timeVal = parseInt(document.getElementById("timeValue").value);
  const unit = document.getElementById("timeUnit").value;

  if (!text || !timeVal) {
    alert("Please enter text and time");
    return;
  }

  currentText = text;

  passageEl.innerHTML = currentText
    .split("")
    .map(char => `<span>${char}</span>`)
    .join("");

  timeLeft = unit === "min" ? timeVal * 60 : timeVal;
  timerEl.textContent = timeLeft;

  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();

  accuracyEl.textContent = "100";
  wpmEl.textContent = "0";

  mistakes = 0;
  lastLength = 0;
  timerStarted = false;

  setupDiv.style.display = "none";
  testDiv.style.display = "block";

  // reset scroll position
  passageEl.scrollTop = 0;
  window.lastScrollTop = 0;
  clearInterval(timerInterval);
}

/* TIMER */
function startTimer() {
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      inputEl.disabled = true;
      alert("Time's up!");
      return;
    }
    timeLeft--;
    timerEl.textContent = timeLeft;
  }, 1000);
}

/* TYPING */
inputEl.addEventListener("input", () => {
  const inputText = inputEl.value;
  const spans = passageEl.querySelectorAll("span");

  let correct = 0;

  if (!timerStarted && inputText.length === 1) {
    startTime = new Date();
    timerStarted = true;
    startTimer();
  }

  // mistake tracking
  if (inputText.length > lastLength) {
    const index = inputText.length - 1;
    if (inputText[index] !== currentText[index]) {
      mistakes++;
    }
  }

  lastLength = inputText.length;

  spans.forEach((span, index) => {
    const char = inputText[index];

    if (char == null) {
      span.classList.remove("correct", "wrong");
    } else if (char === span.textContent) {
      span.classList.add("correct");
      span.classList.remove("wrong");
      correct++;
    } else {
      span.classList.add("wrong");
      span.classList.remove("correct");
    }
  });

  /* ✅ AUTO SCROLL (non-intrusive, smooth) */
  const activeIndex = inputText.length;
  const activeSpan = spans[activeIndex];

  if (activeSpan) {
    const spanTop = activeSpan.offsetTop;
    const boxHeight = passageEl.clientHeight;
    const passageScrollTop = passageEl.scrollTop;

    if (!window.lastScrollTop) {
      window.lastScrollTop = 0;
    }

    const minimumIndexBeforeScroll = 180;
    const nearEnd = activeIndex > spans.length - 25;

    // scroll only when char crosses mid-point AND is advancing by enough margin
    if (
      activeIndex > minimumIndexBeforeScroll &&
      !nearEnd &&
      spanTop > passageScrollTop + boxHeight * 0.6 &&
      spanTop > window.lastScrollTop + 18
    ) {
      passageEl.scrollTop += 28;
      window.lastScrollTop = spanTop;
    }
  }

  // Accuracy
  let totalTyped = inputText.length;
  let totalAttempts = totalTyped + mistakes;
  let accuracy = totalAttempts > 0 ? (correct / totalAttempts) * 100 : 100;
  accuracyEl.textContent = accuracy.toFixed(2);

  // WPM
  if (timerStarted && startTime) {
    let timeElapsed = (new Date() - startTime) / 1000 / 60;
    let words = inputText.length / 5;
    let wpm = timeElapsed > 0 ? words / timeElapsed : 0;
    wpmEl.textContent = Math.round(wpm);
  } else {
    wpmEl.textContent = 0;
  }
});

/* RESTART */
function restartTest() {
  clearInterval(timerInterval);
  timerStarted = false;
  if (timerInterval) clearInterval(timerInterval);
  testDiv.style.display = "none";
  setupDiv.style.display = "block";

  document.getElementById("givenText").value = "";
  document.getElementById("timeValue").value = "";
  inputEl.value = "";
  passageEl.innerHTML = "";
  mistakes = 0;
  lastLength = 0;
  window.lastScrollTop = 0;
}