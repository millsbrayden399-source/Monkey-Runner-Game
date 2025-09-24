class MonkeyRunnerGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.score = 0;
    this.highScore = 0;
    this.gameSpeed = 2.2;
    this.gamePaused = false;
    this.spawnInterval = 1500;
    this.lastSpawnTime = Date.now();

    this.monkey = {
      x: 50,
      y: 290,
      width: 40,
      height: 40,
      dy: 0,
      jumpPower: 24,
      gravity: 1.2
    };

    this.obstacles = [];
    this.trees = [];

    this.isJumping = false;
    this.isFalling = false;

    this.init();
    this.loop();
  }

  init() {
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#555';

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  handleKeyDown(event) {
    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'ArrowUp') {
      if (!this.isJumping && !this.isFalling) {
        this.isJumping = true;
        this.monkey.dy = -this.monkey.jumpPower;
      }
    }
  }

  handleKeyUp(event) {
    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'ArrowUp') {
      this.isJumping = false;
    }
  }

  update() {
    if (this.gamePaused) return;

    // Update monkey position
    this.monkey.y += this.monkey.dy;
    this.monkey.dy += this.monkey.gravity;

    if (this.monkey.y >= 290) {
      this.monkey.y = 290;
      this.monkey.dy = 0;
      this.isFalling = false;
    } else {
      this.isFalling = true;
    }

    // Update obstacles
    this.obstacles.forEach(obstacle => {
      obstacle.x -= this.gameSpeed;
    });

    // Spawn new obstacles
    if (Date.now() - this.lastSpawnTime > this.spawnInterval) {
      this.spawnObstacle();
      this.lastSpawnTime = Date.now();
    }

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // Update trees
    this.trees.forEach(tree => {
      tree.x -= this.gameSpeed / 2;
    });
    this.trees = this.trees.filter(tree => tree.x + tree.width > 0);
    if (this.trees.length === 0 || this.trees[this.trees.length - 1].x < this.canvas.width - 200) {
      this.spawnTree();
    }

    // Collision detection
    this.obstacles.forEach(obstacle => {
      if (
        this.monkey.x < obstacle.x + obstacle.width &&
        this.monkey.x + this.monkey.width > obstacle.x &&
        this.monkey.y < obstacle.y + obstacle.height &&
        this.monkey.y + this.monkey.height > obstacle.y
      ) {
        this.gameOver();
      }
    });

    // Score update
    this.score += 0.1;
  }

  spawnObstacle() {
    const obstacleType = Math.random() > 0.5 ? 'log' : 'banana';
    if (obstacleType === 'log') {
      this.obstacles.push({
        x: this.canvas.width,
        y: 300,
        width: 65,
        height: 40,
        type: 'log'
      });
    } else {
      this.obstacles.push({
        x: this.canvas.width,
        y: 200,
        width: 30,
        height: 30,
        type: 'banana'
      });
    }
  }

  spawnTree() {
    this.trees.push({
      x: this.canvas.width,
      y: 250,
      width: 50,
      height: 100,
      type: 'tree'
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#4b3521';
    this.ctx.fillRect(0, 330, this.canvas.width, 10);

    // Draw trees
    this.trees.forEach(tree => {
      this.ctx.fillStyle = '#228B22'; // ForestGreen
      this.ctx.fillRect(tree.x, tree.y, tree.width, tree.height);
      this.ctx.fillStyle = '#8B4513'; // SaddleBrown
      this.ctx.fillRect(tree.x + tree.width / 4, tree.y + tree.height, tree.width / 2, 50);
    });

    // Draw monkey
    this.ctx.fillStyle = '#808080';
    this.ctx.fillRect(this.monkey.x, this.monkey.y, this.monkey.width, this.monkey.height);

    // Draw obstacles
    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'log') {
        this.ctx.fillStyle = '#b5651d';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.type === 'banana') {
        this.ctx.fillStyle = '#ffc800';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    });

    // Draw score
    this.ctx.fillStyle = '#555';
    this.ctx.fillText('Score: ' + Math.floor(this.score), 10, 30);
    this.ctx.fillText('High Score: ' + Math.floor(this.highScore), 10, 60);
  }

  gameOver() {
    this.highScore = Math.max(this.highScore, this.score);
    this.gamePaused = true;
    this.ctx.fillText('Game Over!', this.canvas.width / 2 - 50, this.canvas.height / 2);
    this.ctx.fillText('Press any key to restart', this.canvas.width / 2 - 100, this.canvas.height / 2 + 30);
    document.addEventListener('keydown', this.restartGame.bind(this), { once: true });
  }

  restartGame() {
    this.score = 0;
    this.monkey.y = 290;
    this.obstacles = [];
    this.trees = [];
    this.gamePaused = false;
    this.gameSpeed = 2.2;
    this.spawnInterval = 1500;
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }
}

const game = new MonkeyRunnerGame();
