const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restartButton");

// The board is measured in grid cells. Each cell is drawn as one square tile.
const cellSize = 20;
const tileCount = canvas.width / cellSize;

// Milliseconds between logical snake steps. Drawing still happens smoothly.
const moveDelay = 90;

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
let gameOver;
let isPlaying;
let lastMoveTime;

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  isPlaying = false;
  lastMoveTime = 0;

  scoreElement.textContent = score;
  statusElement.textContent = "Press an arrow key to start.";
  food = createFood();
  drawGame(0);
}

function createFood() {
  let newFood;

  // Keep trying random cells until the food is not inside the snake.
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  return newFood;
}

function handleKeyDown(event) {
  const chosenDirection = directions[event.key];

  if (!chosenDirection) {
    return;
  }

  event.preventDefault();

  if (gameOver) {
    resetGame();
  }

  isPlaying = true;
  statusElement.textContent = "Playing";

  // Prevent reversing directly into the second snake segment.
  const wouldReverse =
    chosenDirection.x + direction.x === 0 && chosenDirection.y + direction.y === 0;

  if (!wouldReverse) {
    nextDirection = chosenDirection;
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
    scoreElement.textContent = score;
    food = createFood();
  } else {
    // Removing the tail keeps the snake the same length when it did not eat.
    snake.pop();
  }
}

function wrapPosition(position) {
  // Modulo wrapping creates the infinite-world behavior at every edge.
  return (position + tileCount) % tileCount;
}

function hasSelfCollision(head, ateFood) {
  // If food was not eaten, the tail moves away, so the head may enter that cell.
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  return bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y);
}

function endGame() {
  gameOver = true;
  isPlaying = false;
  statusElement.textContent = "Game over. Press an arrow key or Restart.";
}

function drawGame(progress) {
  drawBackground();
  drawFood();
  drawSnake(progress);
}

function drawBackground() {
  context.fillStyle = "#020617";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // A subtle grid helps beginners see the tile-based movement.
  context.strokeStyle = "#0f172a";
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
  const padding = 4;

  context.fillStyle = "#fb7185";
  context.beginPath();
  context.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    cellSize / 2 - padding,
    0,
    Math.PI * 2
  );
  context.fill();
}

function drawSnake(progress) {
  snake.forEach((segment, index) => {
    const previousSegment = snake[index + 1] || segment;

    // Interpolate between the previous and current cell for smoother movement.
    const drawX = interpolateWrapped(previousSegment.x, segment.x, progress) * cellSize;
    const drawY = interpolateWrapped(previousSegment.y, segment.y, progress) * cellSize;

    context.fillStyle = index === 0 ? "#5eead4" : "#22c55e";
    context.fillRect(drawX + 2, drawY + 2, cellSize - 4, cellSize - 4);
  });
}

function interpolateWrapped(from, to, progress) {
  let distance = to - from;

  // Smooth the visual jump when the snake wraps across an edge.
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

  if (isPlaying && !gameOver && timestamp - lastMoveTime >= moveDelay) {
    updateGame();
    lastMoveTime = timestamp;
  }

  const progress = isPlaying ? Math.min((timestamp - lastMoveTime) / moveDelay, 1) : 1;
  drawGame(progress);
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", handleKeyDown);
restartButton.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(gameLoop);
