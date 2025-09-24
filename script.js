// Monkey Runner - Web Edition Game Engine
class MonkeyRunnerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('monkeyRunnerHighScore')) || 0;
        this.gameSpeed = 2.2;
        this.acceleration = 0.001;

        // Game objects
        this.monkey = {
            x: 100,
            y: 250,
            width: 60,
            height: 60,
            isJumping: false,
            jumpVelocity: 0,
            jumpPower: 24, // INCREASED JUMP POWER FOR EASIER JUMPING
            gravity: 1.2
        };

        this.obstacles = [];
        this.bananas = [];
        this.particles = [];
        this.background = { x: 0 };

        // Timing
        this.lastSpawn = 0;
        this.spawnInterval = 2000; // milliseconds

        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            }
        });

        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });

        // Click controls
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
    }

    jump() {
        if (this.gameState === 'playing' && !this.monkey.isJumping) {
            this.monkey.isJumping = true;
            this.monkey.jumpVelocity = -this.monkey.jumpPower;
            this.playSound('jump');
            this.createJumpParticles();
        }
    }

    createJumpParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.monkey.x + Math.random() * this.monkey.width,
                y: this.monkey.y + this.monkey.height,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -3,
                life: 30,
                maxLife: 30,
                color: `hsl(${Math.random() * 60 + 20}, 70%, 60%)`
            });
        }
    }

    createCollectParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 40,
                maxLife: 40,
                color: '#FFD700'
            });
        }
    }

    spawnObstacle() {
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnInterval) {
            this.lastSpawn = now;

            // Randomly spawn banana or log
            if (Math.random() < 0.3) {
                // Spawn banana
                this.bananas.push({
                    x: this.canvas.width,
                    y: 200 + Math.random() * 100,
                    width: 30,
                    height: 30,
                    collected: false
                });
            } else if (Math.random() < 0.6) {
                // Spawn log obstacle
                this.obstacles.push({
                    x: this.canvas.width,
                    y: 280,
                    width: 65,
                    height: 40,
                    type: 'log'
                });
            }

            // Decrease spawn interval to increase difficulty
            this.spawnInterval = Math.max(800, this.spawnInterval - 5);
        }
    }

    updatePhysics() {
        // Update monkey physics
        if (this.monkey.isJumping) {
            this.monkey.y += this.monkey.jumpVelocity;
            this.monkey.jumpVelocity += this.monkey.gravity;

            // Ground check
            if (this.monkey.y >= 250) {
                this.monkey.y = 250;
                this.monkey.isJumping = false;
                this.monkey.jumpVelocity = 0;
            }
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.gameSpeed;
            return obstacle.x > -obstacle.width;
        });

        // Update bananas
        this.bananas = this.bananas.filter(banana => {
            banana.x -= this.gameSpeed;
            return banana.x > -banana.width && !banana.collected;
        });

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life--;
            return particle.life > 0;
        });

        // Update background
        this.background.x -= this.gameSpeed * 0.3;
        if (this.background.x <= -this.canvas.width) {
            this.background.x = 0;
        }

        // Increase game speed
        this.gameSpeed += this.acceleration;
    }

    checkCollisions() {
        // Check banana collection
        this.bananas.forEach(banana => {
            if (!banana.collected && this.isColliding(this.monkey, banana)) {
                banana.collected = true;
                this.score += 10;
                this.updateUI();
                this.playSound('collect');
                this.createCollectParticles(banana.x, banana.y);
            }
        });

        // Check obstacle collision
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.monkey, obstacle)) {
                this.gameOver('You crashed into a log!');
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background elements
        this.drawBackground();

        // Draw game objects
        this.drawMonkey();
        this.drawObstacles();
        this.drawBananas();
        this.drawParticles();

        // Draw ground line
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 320);
        this.ctx.lineTo(this.canvas.width, 320);
        this.ctx.stroke();
    }

    drawBackground() {
        // Draw animated clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 3; i++) {
            const cloudX = (this.background.x + i * 300) % (this.canvas.width + 100);
            this.drawCloud(cloudX, 50 + i * 30);
        }

        // Draw jungle elements
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < 5; i++) {
            const treeX = (this.background.x * 0.5 + i * 200) % (this.canvas.width + 50);
            this.drawTree(treeX, 200);
        }
    }

    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTree(x, y) {
        // Tree trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 10, y + 80, 20, 40);

        // Tree leaves
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(x + 20, y + 80, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawMonkey() {
        const monkey = this.monkey;

        // Monkey body
        this.ctx.fillStyle = '#D2691E';
        this.ctx.fillRect(monkey.x + 15, monkey.y + 20, 30, 35);

        // Monkey head
        this.ctx.fillStyle = '#DEB887';
        this.ctx.beginPath();
        this.ctx.arc(monkey.x + 30, monkey.y + 15, 18, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(monkey.x + 25, monkey.y + 12, 2, 0, Math.PI * 2);
        this.ctx.arc(monkey.x + 35, monkey.y + 12, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Arms
        this.ctx.fillStyle = '#D2691E';
        this.ctx.fillRect(monkey.x + 5, monkey.y + 25, 15, 8);
        this.ctx.fillRect(monkey.x + 40, monkey.y + 25, 15, 8);

        // Legs
        this.ctx.fillRect(monkey.x + 18, monkey.y + 50, 8, 15);
        this.ctx.fillRect(monkey.x + 34, monkey.y + 50, 8, 15);

        // Tail
        this.ctx.strokeStyle = '#D2691E';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(monkey.x + 50, monkey.y + 30, 15, 0, Math.PI);
        this.ctx.stroke();
    }

    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'log') {
                // Draw log
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

                // Log texture
                this.ctx.strokeStyle = '#654321';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(obstacle.x, obstacle.y + 10 + i * 10);
                    this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + 10 + i * 10);
                    this.ctx.stroke();
                }
            }
        });
    }

    drawBananas() {
        this.bananas.forEach(banana => {
            if (!banana.collected) {
                // Draw banana
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.ellipse(banana.x + 15, banana.y + 15, 12, 20, Math.PI / 6, 0, Math.PI * 2);
                this.ctx.fill();

                // Banana stem
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(banana.x + 12, banana.y + 5, 6, 8);
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    playSound(type) {
        // Simple sound simulation with Web Audio API
        if (window.AudioContext || window.webkitAudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'jump') {
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            } else if (type === 'collect') {
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            } else if (type === 'crash') {
                oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
            }

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    gameOver(message) {
        this.gameState = 'gameOver';

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('monkeyRunnerHighScore', this.highScore.toString());
        }

        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('crashMessage').textContent = message;
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';

        this.playSound('crash');
        this.updateUI();
    }

    start() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.bananas = [];
        this.particles = [];
        this.lastSpawn = 0;
        this.spawnInterval = 2000;

        // Reset monkey position
        this.monkey.x = 100;
        this.monkey.y = 250;
        this.monkey.isJumping = false;
        this.monkey.jumpVelocity = 0;

        // Hide overlays
        document.getElementById('gameOverlay').style.display = 'none';

        this.updateUI();
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.spawnObstacle();
            this.updatePhysics();
            this.checkCollisions();
        }

        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global game instance
let game;

// Game control functions
function startGame() {
    if (!game) {
        game = new MonkeyRunnerGame();
    }
    game.start();
}

function restartGame() {
    game.start();
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new MonkeyRunnerGame();
});
