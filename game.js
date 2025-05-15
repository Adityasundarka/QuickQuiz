let soundUnlocked = false;

document.addEventListener('click', () => {
  const beepSound = document.getElementById('beep');
  beepSound.play().then(() => {
    beepSound.pause();
    beepSound.currentTime = 0;
    soundUnlocked = true;
    console.log("Sound unlocked.");
  }).catch(() => {});
}, { once: true });

const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const timerDisplay = document.getElementById('timer');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let timerInterval;
let timeLeft = 10;

let questions = [];

fetch("https://opentdb.com/api.php?amount=10&type=multiple")
  .then((res) => res.json())
  .then((loadedQuestions) => {
    questions = loadedQuestions.results.map((loadedQuestion) => {
      const formattedQuestion = {
        question: loadedQuestion.question,
      };

      const answerChoices = [...loadedQuestion.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });

      return formattedQuestion;
    });

    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

const SCORE_POINTS = 10;
const MAX_QUESTIONS = 10;

const startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden");
};

const startTimer = () => {
  clearInterval(timerInterval);
  timeLeft = 10;
  timerDisplay.innerText = `Time Left: ${timeLeft}s`;

  const beepSound = document.getElementById("beep");
  const alarmicon = document.getElementById("alarmicon"); // Get the alarm icon
  alarmicon.classList.remove("shake");

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `Time Left: ${timeLeft}s`;

    if (timeLeft < 5 && timeLeft > 0) {
      alarmicon.classList.add("shake");
      if (soundUnlocked) {
        beepSound.pause();
        beepSound.currentTime = 0;
        beepSound.play().catch(() => {});
      }
    } else {
      alarmicon.classList.remove("shake");
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      acceptingAnswers = false;
      getNewQuestion(); // Skip unanswered
    }
  }, 1000);
};

const getNewQuestion = () => {
  clearInterval(timerInterval);

  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    return window.location.assign("end.html");
  }

  questionCounter++;
  progressText.innerText = `Question ${questionCounter} of ${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionsIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionsIndex];
  question.innerHTML = currentQuestion.question;

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    choice.innerHTML = currentQuestion["choice" + number];
  });

  availableQuestions.splice(questionsIndex, 1);
  acceptingAnswers = true;

  startTimer();
};

choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    clearInterval(timerInterval); // Stop timer when user clicks

    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

    if (classToApply === "correct") {
      incrementScore(SCORE_POINTS);
    }

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});

const incrementScore = (num) => {
  score += num;
  scoreText.innerText = score;
};
