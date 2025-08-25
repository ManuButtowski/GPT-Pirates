const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');
const difficultySelect = document.getElementById('difficulty');
const playBtn = document.getElementById('playBtn');
const message = document.getElementById('message');

let maze = null;
let cols = 0;
let rows = 0;
let cellSize = 0;
let player = { x: 0, y: 0 };
let won = false;
const pirateImg = new Image();
pirateImg.src = 'assets/images/pirate-sprite.png';
pirateImg.onload = () => drawPlayer();

playBtn.addEventListener('click', () => {
  const diff = difficultySelect.value;
  const sizeMap = { easy: 10, normal: 15, hard: 20 };
  cols = rows = sizeMap[diff];
  cellSize = canvas.width / cols;
  maze = generateMaze(cols, rows);
  player = { x: 0, y: 0 };
  won = false;
  drawMaze();
  drawPlayer();
  message.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
  if (!maze || won) return;
  const cell = maze[player.y * cols + player.x];
  switch (e.key) {
    case 'ArrowUp':
      if (!cell.walls[0]) player.y--;
      break;
    case 'ArrowRight':
      if (!cell.walls[1]) player.x++;
      break;
    case 'ArrowDown':
      if (!cell.walls[2]) player.y++;
      break;
    case 'ArrowLeft':
      if (!cell.walls[3]) player.x--;
      break;
    default:
      return;
  }
  e.preventDefault();
  drawMaze();
  drawPlayer();
  if (player.x === cols - 1 && player.y === rows - 1) {
    won = true;
    message.classList.remove('hidden');
  }
});

function generateMaze(cols, rows) {
  const grid = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid.push(new Cell(x, y));
    }
  }
  let current = grid[0];
  current.visited = true;
  const stack = [];

  while (true) {
    const next = current.checkNeighbors(grid, cols, rows);
    if (next) {
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      break;
    }
  }
  return grid;
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.visited = false;
  }

  index(x, y, cols, rows) {
    if (x < 0 || y < 0 || x > cols - 1 || y > rows - 1) return -1;
    return x + y * cols;
  }

  checkNeighbors(grid, cols, rows) {
    const neighbors = [];
    const top = grid[this.index(this.x, this.y - 1, cols, rows)];
    const right = grid[this.index(this.x + 1, this.y, cols, rows)];
    const bottom = grid[this.index(this.x, this.y + 1, cols, rows)];
    const left = grid[this.index(this.x - 1, this.y, cols, rows)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    if (neighbors.length > 0) {
      const r = Math.floor(Math.random() * neighbors.length);
      return neighbors[r];
    }
    return undefined;
  }
}

function removeWalls(a, b) {
  const x = a.x - b.x;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  const y = a.y - b.y;
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  for (const cell of maze) {
    const x = cell.x * cellSize;
    const y = cell.y * cellSize;
    if (cell.walls[0]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if (cell.walls[1]) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.walls[2]) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y + cellSize);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
    if (cell.walls[3]) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
  // draw goal
  ctx.font = `${cellSize * 0.8}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💰', (cols - 0.5) * cellSize, (rows - 0.5) * cellSize);
}

function drawPlayer() {
  if (!pirateImg.complete) return;
  const padding = cellSize * 0.1;
  const size = cellSize - padding * 2;
  ctx.drawImage(
    pirateImg,
    player.x * cellSize + padding,
    player.y * cellSize + padding,
    size,
    size
  );
}
