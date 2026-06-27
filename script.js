const GAME_DURATION = 30;
const TARGET_MOVE_INTERVAL = 900;

const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const bestScoreElement = document.getElementById("best-score");
const statusElement = document.getElementById("status");
const startButton = document.getElementById("start-button");
const gameBoard = document.getElementById("game-board");
const target = document.getElementById("target");

let score = 0;
let timeLeft = GAME_DURATION;
let countdownId = null;
let moveTargetId = null;
let isRunning = false;

const getBestScore = () => Number(window.localStorage.getItem("target-rush-best") || 0);

const updateBestScore = (nextScore) => {
  const bestScore = getBestScore();

  if (nextScore > bestScore) {
    window.localStorage.setItem("target-rush-best", String(nextScore));
    bestScoreElement.textContent = String(nextScore);
    return;
  }

  bestScoreElement.textContent = String(bestScore);
};

const updateScore = (nextScore) => {
  score = nextScore;
  scoreElement.textContent = String(score);
};

const updateTime = (nextTime) => {
  timeLeft = nextTime;
  timeElement.textContent = String(timeLeft);
};

const moveTarget = () => {
  const boardRect = gameBoard.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const maxX = Math.max(boardRect.width - targetRect.width - 16, 0);
  const maxY = Math.max(boardRect.height - targetRect.height - 16, 0);
  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  target.style.left = `${randomX + 8}px`;
  target.style.top = `${randomY + 8}px`;
};

const stopGame = () => {
  isRunning = false;
  window.clearInterval(countdownId);
  window.clearInterval(moveTargetId);
  countdownId = null;
  moveTargetId = null;
  target.hidden = true;
  startButton.disabled = false;
  updateBestScore(score);
  statusElement.textContent = `Time's up. Final score: ${score}. Press start to play again.`;
};

const startGame = () => {
  updateScore(0);
  updateTime(GAME_DURATION);
  updateBestScore(score);
  isRunning = true;
  startButton.disabled = true;
  statusElement.textContent = "Click the target before it moves.";
  target.hidden = false;
  moveTarget();

  countdownId = window.setInterval(() => {
    if (timeLeft <= 1) {
      updateTime(0);
      stopGame();
      return;
    }

    updateTime(timeLeft - 1);
  }, 1000);

  moveTargetId = window.setInterval(moveTarget, TARGET_MOVE_INTERVAL);
};

startButton.addEventListener("click", startGame);

target.addEventListener("click", () => {
  if (!isRunning) {
    return;
  }

  updateScore(score + 1);
  statusElement.textContent = "Nice hit. Keep going.";
  moveTarget();
});

gameBoard.addEventListener("click", (event) => {
  if (!isRunning || event.target === target) {
    return;
  }

  updateScore(Math.max(score - 1, 0));
  statusElement.textContent = "Missed. Aim for the glowing target.";
});

bestScoreElement.textContent = String(getBestScore());