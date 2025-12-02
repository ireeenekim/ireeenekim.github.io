let snake = [];
let maxLen = 15;
let score = 0;
let segDist = 10;
let food;
let foodColor;
let snakeColor;
let isPlaying = false;

//'Ghost' point that trails behind the mouse
let lagX = 0;
let lagY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  snakeColor = color(0, 255, 204);
  pickLocation();

  // Start the 'ghost' point in the center so the snake doesn't snap on load
  lagX = width / 2;
  lagY = height / 2;
}

function draw() {
  // Low opacity to create a motion blur/trail effect instead of erasing the screen completely every frame
  background(0, 50);

  // Red cursor that tracks the mouse
  push();
  noStroke();
  fill(255, 0, 0);
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'red';
  circle(mouseX, mouseY, 12);
  pop();
  drawingContext.shadowBlur = 0;

  if (isPlaying) {
    runGameLogic();
  }
}

function runGameLogic() {
  // 1. LAG CALCULATION
  // lerp() (Linear Interpolation) calculates a point 12% of the way between the current snake position and the mous
  lagX = lerp(lagX, mouseX, 0.12);
  lagY = lerp(lagY, mouseY, 0.12);

  // 2. MOVEMENT
  let currentHeadX = lagX;
  let currentHeadY = lagY;

  // If the snake is empty, add the first point
  if (snake.length === 0) {
    snake.push(createVector(currentHeadX, currentHeadY));
  } else {
    let head = snake[snake.length - 1];
    let d = dist(currentHeadX, currentHeadY, head.x, head.y);

    // Only add a new body segment if we have moved far enough (segDist)
    if (d > segDist) {
      snake.push(createVector(currentHeadX, currentHeadY));

      // Array Management: remove the oldest segment (tail) to maintain length
      if (snake.length > maxLen) {
        snake.shift();
      }
    }
  }

  // 3. COLLISIONS
  // Check collision between the 'ghost' head and the food
  if (dist(lagX, lagY, food.x, food.y) < 25) {
    eatFood();
  }

  // Check collision between the head and its own body
  // We subtract 10 from the loop to avoid detecting a collision with the first 10 circles
  for (let i = 0; i < snake.length - 10; i++) {
    let part = snake[i];
    if (dist(lagX, lagY, part.x, part.y) < 10) {
      gameOver();
    }
  }

  // 4. DRAWING
  // Draw the food using sin() to make it pulse in size
  noStroke();
  fill(foodColor);
  let pulseSize = map(sin(frameCount * 0.1), -1, 1, 10, 25);
  circle(food.x, food.y, pulseSize);

  // Draw the snake by looping through the array
  for (let i = 0; i < snake.length; i++) {
    // We use map() to make the tail more transparent (alpha) and smaller than the head
    let alpha = map(i, 0, snake.length, 20, 200);
    let size = map(i, 0, snake.length, 2, 25);

    fill(red(snakeColor), green(snakeColor), blue(snakeColor), alpha);
    noStroke();
    circle(snake[i].x, snake[i].y, size);
  }
}

function startGame() {
  isPlaying = true;
  snake = [];

  // Reset the lag variables to the mouse position to prevent instant death
  lagX = mouseX;
  lagY = mouseY;
  snake.push(createVector(lagX, lagY));

  // Reset physics variables and update the UI
  maxLen = 15;
  score = 0;
  document.getElementById('score-board').innerText = "SCORE: " + score;

  snakeColor = color(0, 255, 204);

  pickLocation();
  document.getElementById('overlay').classList.add('hidden');
}

function gameOver() {
  isPlaying = false;

  // Reveal the HTML overlay and update the text
  let overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden');

  document.getElementById('status-text').innerText = "GAME OVER";
  document.getElementById('sub-text').innerText = "You Died.";
  document.getElementById('start-btn').innerText = "PLAY AGAIN";
}

function eatFood() {
  score++;
  document.getElementById('score-board').innerText = "SCORE: " + score;

  // Make the snake physically longer
  maxLen += 8;

  // The snake adopts the color of the food it just ate
  snakeColor = foodColor;

  pickLocation();
}

function pickLocation() {
  food = createVector(random(50, width - 50), random(50, height - 50));
  // Generate a random neon color for the next piece of food
  foodColor = color(random(100, 255), random(50, 255), random(100, 255));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}