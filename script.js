const DIFFICULTIES = {
  easy: { turnSeconds: 8, moveInterval: 900 },
  medium: { turnSeconds: 6, moveInterval: 650 },
  hard: { turnSeconds: 4, moveInterval: 420 },
};

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const scoreXElement = document.getElementById("score-x");
const scoreOElement = document.getElementById("score-o");
const timeElement = document.getElementById("time");
const currentPlayerElement = document.getElementById("current-player");
const statusElement = document.getElementById("status");
const startButton = document.getElementById("start-button");
const difficultySelect = document.getElementById("difficulty-select");
const gameBoard = document.getElementById("game-board");
const cellElements = Array.from(document.querySelectorAll(".board-cell"));
const target = document.getElementById("target");

let scores = { X: 0, O: 0 };
let boardState = Array(9).fill("");
let currentPlayer = "X";
let timeLeft = 0;
let countdownId = null;
let moveTargetId = null;
let activeCellIndex = null;
let isRoundRunning = false;
let audioContext = null;

const getSelectedDifficulty = () => DIFFICULTIES[difficultySelect.value] || DIFFICULTIES.medium;

const ensureAudioContext = async () => {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return null;
  }

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return audioContext;
};

const playTone = async (frequency, duration, type, gainValue) => {
  const context = await ensureAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const startTime = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(gainValue, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const playHitSound = () => {
  void playTone(720, 0.14, "triangle", 0.09);
};

const playMissSound = () => {
  void playTone(220, 0.18, "sawtooth", 0.06);
};

const playWinSound = () => {
  void Promise.all([
    playTone(523.25, 0.16, "sine", 0.08),
    playTone(659.25, 0.22, "triangle", 0.05),
  ]);
};

const updateScores = () => {
  scoreXElement.textContent = String(scores.X);
  scoreOElement.textContent = String(scores.O);
};

const updateTime = (nextTime) => {
  timeLeft = nextTime;
  timeElement.textContent = String(timeLeft);
};

const updateCurrentPlayer = () => {
  currentPlayerElement.textContent = `Player ${currentPlayer}`;
};

const clearTimers = () => {
  window.clearInterval(countdownId);
  window.clearInterval(moveTargetId);
  countdownId = null;
  moveTargetId = null;
};

const renderBoard = () => {
  cellElements.forEach((cellElement, index) => {
    const value = boardState[index];
    cellElement.textContent = value;
    cellElement.classList.toggle("player-x", value === "X");
    cellElement.classList.toggle("player-o", value === "O");
    cellElement.classList.toggle("active-cell", index === activeCellIndex && isRoundRunning);
    cellElement.disabled = Boolean(value) || !isRoundRunning;
  });

  if (activeCellIndex !== null && isRoundRunning) {
    cellElements[activeCellIndex].append(target);
  }
};

const getEmptyCellIndexes = () => boardState.flatMap((value, index) => (value ? [] : [index]));

const chooseActiveCell = () => {
  const emptyCellIndexes = getEmptyCellIndexes();

  if (!emptyCellIndexes.length) {
    activeCellIndex = null;
    target.hidden = true;
    renderBoard();
    return false;
  }

  const randomIndex = Math.floor(Math.random() * emptyCellIndexes.length);
  activeCellIndex = emptyCellIndexes[randomIndex];
  target.hidden = false;
  renderBoard();
  moveTarget();
  return true;
};

const moveTarget = () => {
  if (activeCellIndex === null) {
    return;
  }

  const activeCell = cellElements[activeCellIndex];
  const cellRect = activeCell.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const maxX = Math.max(cellRect.width - targetRect.width - 12, 0);
  const maxY = Math.max(cellRect.height - targetRect.height - 12, 0);
  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  target.style.left = `${randomX + 6}px`;
  target.style.top = `${randomY + 6}px`;
};

const stopRound = () => {
  isRoundRunning = false;
  clearTimers();
  activeCellIndex = null;
  target.hidden = true;
  startButton.disabled = false;
  difficultySelect.disabled = false;
  renderBoard();
};

const getWinner = () => {
  for (const [first, second, third] of WINNING_LINES) {
    const mark = boardState[first];

    if (mark && mark === boardState[second] && mark === boardState[third]) {
      return mark;
    }
  }

  return "";
};

const finishRound = (winner) => {
  stopRound();

  if (winner) {
    scores[winner] += 1;
    updateScores();
    playWinSound();
    statusElement.textContent = `Player ${winner} wins the round. Press start for the next round.`;
  } else {
    playMissSound();
    statusElement.textContent = "Round drawn. Press start for a rematch.";
  }

  startButton.textContent = "Play next round";
};

const beginTurn = () => {
  updateCurrentPlayer();
  updateTime(getSelectedDifficulty().turnSeconds);
  statusElement.textContent = `Player ${currentPlayer}, hit the target to claim a square.`;

  if (!chooseActiveCell()) {
    finishRound("");
    return;
  }

  clearTimers();
  const { moveInterval } = getSelectedDifficulty();

  countdownId = window.setInterval(() => {
    if (timeLeft <= 1) {
      updateTime(0);
      playMissSound();
      statusElement.textContent = `Player ${currentPlayer} ran out of time.`;
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      beginTurn();
      return;
    }

    updateTime(timeLeft - 1);
  }, 1000);

  moveTargetId = window.setInterval(moveTarget, moveInterval);
};

const resetBoard = () => {
  boardState = Array(9).fill("");
  currentPlayer = "X";
  activeCellIndex = null;
  target.hidden = true;
  renderBoard();
  updateCurrentPlayer();
  updateTime(0);
};

const startRound = async () => {
  await ensureAudioContext();
  resetBoard();
  isRoundRunning = true;
  startButton.disabled = true;
  difficultySelect.disabled = true;
  startButton.textContent = "Round in progress";
  beginTurn();
};

startButton.addEventListener("click", () => {
  void startRound();
});

target.addEventListener("click", (event) => {
  if (!isRoundRunning || activeCellIndex === null) {
    return;
  }

  event.stopPropagation();
  playHitSound();
  boardState[activeCellIndex] = currentPlayer;

  const winner = getWinner();

  if (winner) {
    renderBoard();
    finishRound(winner);
    return;
  }

  if (!getEmptyCellIndexes().length) {
    renderBoard();
    finishRound("");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  beginTurn();
});

gameBoard.addEventListener("click", (event) => {
  if (!isRoundRunning || event.target === target) {
    return;
  }

  playMissSound();
  statusElement.textContent = `Missed. Player ${currentPlayer} loses the turn.`;
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  beginTurn();
});

difficultySelect.addEventListener("change", () => {
  statusElement.textContent = `${difficultySelect.options[difficultySelect.selectedIndex].text} mode selected. Press start when ready.`;
});

updateScores();
resetBoard();