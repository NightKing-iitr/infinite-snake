const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const startButton = document.getElementById("startButton");
const overlayRestartButton = document.getElementById("overlayRestartButton");
const gameOverlay = document.getElementById("gameOverlay");
const overlayKicker = document.getElementById("overlayKicker");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const touchPauseButton = document.getElementById("touchPauseButton");

const cellSize = 20;
const tileCount = canvas.width / cellSize;
const moveDelay = 90;
const highScoreKey = "infinite-snake-high-score";
const minSwipeDistance = 30;

const states = {
  START: "start",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "gameover",
};

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

let snake;
let food;
let direction;
let nextDirection;
let score;
let highScore;
let gameState;
let lastMoveTime;
let touchStartX = 0;
let touchStartY = 0;

function triggerHaptic(pattern) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function getStoredHighScore() {
  try {
    const savedScore = Number(localStorage.getItem(highScoreKey));
    return Number.isFinite(savedScore) ? savedScore : 0;
  } catch (error) {
    return 0;
  }
}

function saveHighScore() {
  try {
    localStorage.setItem(highScoreKey, String(highScore));
  } catch (error) {
    // The game remains playable if browser storage is unavailable.
  }
}

function resetGame(nextState = states.START) {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  lastMoveTime = 0;
  food = createFood();
  setGameState(nextState);
  updateScore();
  drawGame(1);
}

function setGameState(nextState) {
  gameState = nextState;
  updateTouchPauseButton();

  if (gameState === states.START) {
    showOverlay("Ready", "Infinite Snake", "Collect food, wrap the board, and do not hit yourself.");
    startButton.textContent = "Start";
    overlayRestartButton.hidden = true;
    return;
  }

  if (gameState === states.PAUSED) {
    showOverlay("Paused", "Game Paused", "Press Space, Resume, or a direction to keep playing.");
    startButton.textContent = "Resume";
    overlayRestartButton.hidden = false;
    return;
  }

  if (gameState === states.GAME_OVER) {
    showOverlay("Game Over", "Final Score: " + score, "Best score: " + highScore);
    startButton.textContent = "Play Again";
    overlayRestartButton.hidden = false;
    return;
  }

  gameOverlay.classList.remove("is-visible");
}

function showOverlay(kicker, title, message) {
  overlayKicker.textContent = kicker;
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  gameOverlay.classList.add("is-visible");
}

function startGame() {
  if (gameState === states.GAME_OVER) {
    resetGame(states.PLAYING);
    return;
  }

  setGameState(states.PLAYING);
  lastMoveTime = 0;
}

function restartGame() {
  resetGame(states.PLAYING);
}

function togglePause() {
  if (gameState === states.PLAYING) {
    setGameState(states.PAUSED);
  } else if (gameState === states.PAUSED) {
    startGame();
  }
}

function updateTouchPauseButton() {
  if (!touchPauseButton) {
    return;
  }

  touchPauseButton.textContent = gameState === states.PAUSED ? "Resume" : "Pause";
}

function createFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  return newFood;
}

function handleKeyDown(event) {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  const chosenDirection = directions[event.key];

  if (!chosenDirection) {
    return;
  }

  event.preventDefault();
  changeDirection(chosenDirection);
}

function changeDirection(chosenDirection) {
  if (gameState === states.START || gameState === states.GAME_OVER) {
    resetGame(states.PLAYING);
  } else if (gameState === states.PAUSED) {
    startGame();
  }

  const wouldReverse =
    chosenDirection.x + direction.x === 0 && chosenDirection.y + direction.y === 0;

  if (!wouldReverse) {
    nextDirection = chosenDirection;
  }
}

function handleTouchStart(event) {
  const touch = event.changedTouches[0];

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < minSwipeDistance) {
    return;
  }

  event.preventDefault();

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    changeDirection(deltaX > 0 ? directions.ArrowRight : directions.ArrowLeft);
  } else {
    changeDirection(deltaY > 0 ? directions.ArrowDown : directions.ArrowUp);
  }
}

function updateGame() {
  direction = nextDirection;

  const currentHead = snake[0];
  const nextHead = {
    x: wrapPosition(currentHead.x + direction.x),
    y: wrapPosition(currentHead.y + direction.y),
  };

  const ateFood = nextHead.x === food.x && nextHead.y === food.y;

  if (hasSelfCollision(nextHead, ateFood)) {
    endGame();
    return;
  }

  snake.unshift(nextHead);

  if (ateFood) {
    score += 1;
    updateScore();
    triggerHaptic(20);
    food = createFood();
  } else {
    snake.pop();
  }
}

function updateScore() {
  if (score > highScore) {
    highScore = score;
    saveHighScore();
  }

  scoreElement.textContent = score;
  highScoreElement.textContent = highScore;
}

function wrapPosition(position) {
  return (position + tileCount) % tileCount;
}

function hasSelfCollision(head, ateFood) {
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  return bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y);
}

function endGame() {
  setGameState(states.GAME_OVER);
  triggerHaptic([100, 50, 100]);
}

function drawGame(progress) {
  drawBackground();
  drawFood();
  drawSnake(progress);
}

function drawBackground() {
  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#07111f");
  background.addColorStop(0.52, "#10251f");
  background.addColorStop(1, "#160f24");

  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < tileCount; y += 1) {
    for (let x = 0; x < tileCount; x += 1) {
      if ((x + y) % 2 === 0) {
        context.fillStyle = "rgb(255 255 255 / 0.025)";
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  context.strokeStyle = "rgb(255 255 255 / 0.055)";
  context.lineWidth = 1;

  for (let position = 0; position <= canvas.width; position += cellSize) {
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }
}

function drawFood() {
  const centerX = food.x * cellSize + cellSize / 2;
  const centerY = food.y * cellSize + cellSize / 2;
  const glow = context.createRadialGradient(centerX, centerY, 2, centerX, centerY, cellSize);

  glow.addColorStop(0, "rgb(251 113 133 / 0.9)");
  glow.addColorStop(1, "rgb(251 113 133 / 0)");

  context.fillStyle = glow;
  context.beginPath();
  context.arc(centerX, centerY, cellSize, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#fb7185";
  context.beginPath();
  context.arc(centerX, centerY, cellSize / 2 - 4, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#fecdd3";
  context.beginPath();
  context.arc(centerX - 3, centerY - 3, 3, 0, Math.PI * 2);
  context.fill();
}

function drawSnake(progress) {
  snake.forEach((segment, index) => {
    const previousSegment = snake[index + 1] || segment;
    const drawX = interpolateWrapped(previousSegment.x, segment.x, progress) * cellSize;
    const drawY = interpolateWrapped(previousSegment.y, segment.y, progress) * cellSize;
    const inset = index === 0 ? 2 : 3;
    const size = cellSize - inset * 2;

    context.shadowColor = index === 0 ? "rgb(94 234 212 / 0.45)" : "rgb(34 197 94 / 0.25)";
    context.shadowBlur = index === 0 ? 16 : 8;
    context.fillStyle = index === 0 ? "#5eead4" : getBodyColor(index);
    roundedRect(drawX + inset, drawY + inset, size, size, 5);
    context.fill();
    context.shadowBlur = 0;

    if (index === 0) {
      drawEyes(drawX, drawY);
    }
  });
}

function getBodyColor(index) {
  return index % 2 === 0 ? "#22c55e" : "#16a34a";
}

function drawEyes(x, y) {
  const eyeOffsetX = direction.x === 0 ? 5 : direction.x > 0 ? 12 : 5;
  const secondEyeOffsetX = direction.x === 0 ? 12 : eyeOffsetX;
  const eyeOffsetY = direction.y === 0 ? 5 : direction.y > 0 ? 12 : 5;
  const secondEyeOffsetY = direction.y === 0 ? 12 : eyeOffsetY;

  context.fillStyle = "#042f2e";
  context.beginPath();
  context.arc(x + eyeOffsetX, y + eyeOffsetY, 2.3, 0, Math.PI * 2);
  context.arc(x + secondEyeOffsetX, y + secondEyeOffsetY, 2.3, 0, Math.PI * 2);
  context.fill();
}

function roundedRect(x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function interpolateWrapped(from, to, progress) {
  let distance = to - from;

  if (distance > tileCount / 2) {
    distance -= tileCount;
  } else if (distance < -tileCount / 2) {
    distance += tileCount;
  }

  const value = from + distance * progress;
  return wrapPosition(value);
}

function gameLoop(timestamp) {
  if (!lastMoveTime) {
    lastMoveTime = timestamp;
  }

  if (gameState === states.PLAYING && timestamp - lastMoveTime >= moveDelay) {
    updateGame();
    lastMoveTime = timestamp;
  }

  const progress =
    gameState === states.PLAYING ? Math.min((timestamp - lastMoveTime) / moveDelay, 1) : 1;

  drawGame(progress);
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", handleKeyDown);
canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
startButton.addEventListener("click", startGame);
overlayRestartButton.addEventListener("click", restartGame);
touchPauseButton.addEventListener("click", togglePause);

highScore = getStoredHighScore();
resetGame();
requestAnimationFrame(gameLoop);
