const username = JSON.parse(localStorage.getItem("quizUser"))?.name || "Guest";
const photo = JSON.parse(localStorage.getItem("quizUser"))?.photo || "";
const score = localStorage.getItem("mostRecentScore");
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

const scoreEntry = {
  name: username,
  photo: photo,
  score: parseInt(score),
  date: new Date().toLocaleString()
};

highScores.push(scoreEntry);
localStorage.setItem("highScores", JSON.stringify(highScores));
