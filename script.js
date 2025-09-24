// Monkey Runner - Web Edition Game Engine - Updated

class MonkeyRunnerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('monkeyRunnerHighScore')) || 0;
        this.gameSpeed = 2;
        this.acceleration = 0.001;

        // Game objects
        this.monkey = new Monkey();
        this.obstacles = [];
        this.bananas = [];
        this.particles = [];
        this.background = { x: 0 };
        this.ground = { x: 0 };

        // Timing
        this.lastSpawn = 0;
        this.spawnInterval = 2000;

        // Audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {
            jump: this.createSound(200, 400),
            collect: this.createSound(400, 800),
            crash: this.createSound(100, 50)
        };
        this.music = new Audio('path/to/your/background-music.mp3'); 
        this.music.loop = true;
        this.music.volume = 0.3;

        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handlePlayerAction();
            }
        });

        this.canvas.addEventListener('mousedown', () => this.handlePlayerAction());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePlayerAction();
        });
    }

    handlePlayerAction() {
        if (this.gameState === 'playing') {
            this.monkey.jump(this.sounds.jump);
        } else if (this.gameState === 'gameOver' || this.gameState === 'menu') {
            this.start();
        }
    }

    createSound(startFreq, endFreq) {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    spawnObject() {
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnInterval) {
            this.lastSpawn = now;
            const rand = Math.random();

            if (rand < 0.25) { // Spawn a banana
                this.bananas.push(new Banana(this.canvas.width, 200 + Math.random() * 80));
            } else if (rand < 0.65) { // Spawn a log
                this.obstacles.push(new Obstacle(this.canvas.width, 280, 'log'));
            } else { // Spawn a tree trunk
                this.obstacles.push(new Obstacle(this.canvas.width, 200, 'tree'));
            }

            this.spawnInterval = Math.max(800, this.spawnInterval - 5);
        }
    }

    updatePhysics() {
        this.monkey.update();
        this.obstacles.forEach(o => o.update(this.gameSpeed));
        this.bananas.forEach(b => b.update(this.gameSpeed));
        this.particles.forEach(p => p.update());

        this.obstacles = this.obstacles.filter(o => o.x > -o.width);
        this.bananas = this.bananas.filter(b => b.x > -b.width && !b.collected);
        this.particles = this.particles.filter(p => p.life > 0);

        this.background.x -= this.gameSpeed * 0.1;
        this.ground.x -= this.gameSpeed * 1;

        if (this.background.x <= -this.canvas.width) {
            this.background.x = 0;
        }
        if (this.ground.x <= -this.canvas.width) {
            this.ground.x = 0;
        }

        this.gameSpeed += this.acceleration;
    }

    checkCollisions() {
        this.bananas.forEach(banana => {
            if (!banana.collected && this.isColliding(this.monkey, banana)) {
                banana.collected = true;
                this.score += 10;
                this.updateUI();
                this.sounds.collect();
                this.createCollectParticles(banana.x, banana.y);
            }
        });

        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.monkey, obstacle)) {
                this.gameOver('You crashed!');
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.monkey.draw(this.ctx);
        this.obstacles.forEach(o => o.draw(this.ctx));
        this.bananas.forEach(b => b.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.drawGround();
    }

    drawBackground() {
        // Light sky background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Distant jungle layer
        this.ctx.fillStyle = '#006400';
        drawTrees(this.ctx, this.background.x * 0.2, 100, 50, 4);

        // Mid-layer of jungle foliage
        this.ctx.fillStyle = '#2E8B57';
        drawFoliage(this.ctx, this.background.x * 0.4, 150, 60, 6);

        // Close jungle layer
        this.ctx.fillStyle = '#3CB371';
        drawTrees(this.ctx, this.background.x * 0.6, 200, 70, 8);
    }
    
    drawGround() {
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(this.ground.x, 320, this.canvas.width * 2, this.canvas.height - 320);
    }

    createCollectParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, '#FFD700', 40, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6));
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('highScoreTop').textContent = this.highScore;
    }

    gameOver(message) {
        this.gameState = 'gameOver';
        this.sounds.crash();
        this.music.pause();
        this.music.currentTime = 0;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('monkeyRunnerHighScore', this.highScore.toString());
        }

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('crashMessage').textContent = message;
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';

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

        this.monkey.reset();

        document.getElementById('gameOverlay').style.display = 'none';
        this.updateUI();
        this.music.play();
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.spawnObject();
            this.updatePhysics();
            this.checkCollisions();
        }

        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// --- Helper Classes and Functions ---

class Monkey {
    constructor() {
        this.x = 100;
        this.y = 250;
        this.width = 60;
        this.height = 60;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.jumpPower = 15;
        this.gravity = 0.8;
        this.frame = 0;
        this.frameInterval = 5;
        this.frameCount = 0;
    }

    jump(jumpSound) {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = -this.jumpPower;
            jumpSound();
        }
    }

    update() {
        if (this.isJumping) {
            this.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;

            if (this.y >= 250) {
                this.y = 250;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }
        this.frameCount++;
        if (this.frameCount >= this.frameInterval) {
            this.frame = (this.frame + 1) % 2;
            this.frameCount = 0;
        }
    }

    draw(ctx) {
        // Body (Ellipse)
        ctx.fillStyle = '#D2691E'; // Brown body color
        ctx.beginPath();
        ctx.ellipse(this.x + 30, this.y + 40, 25, 20, Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();

        // Head (Arc)
        ctx.fillStyle = '#DEB887'; // Lighter head/face color
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + 20, 18, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 18, 8, 0, Math.PI * 2);
        ctx.arc(this.x + 45, this.y + 18, 8, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + 25, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 20, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 35, this.y + 20, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 50);
        ctx.bezierCurveTo(this.x - 20, this.y + 40, this.x - 30, this.y + 60, this.x, this.y + 70);
        ctx.stroke();

        // Legs (animated)
        ctx.fillStyle = '#D2691E';
        if (this.frame === 0) {
            ctx.fillRect(this.x + 20, this.y + 55, 8, 15);
            ctx.fillRect(this.x + 32, this.y + 55, 8, 15);
        } else {
            ctx.fillRect(this.x + 20, this.y + 50, 8, 15);
            ctx.fillRect(this.x + 32, this.y + 60, 8, 15);
        }
    }

    reset() {
        this.x = 100;
        this.y = 250;
        this.isJumping = false;
        this.jumpVelocity = 0;
    }
}

class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        if (this.type === 'log') {
            this.width = 80;
            this.height = 40;
            this.y = 320 - this.height;
        } else if (this.type === 'tree') {
            this.width = 60;
            this.height = 120;
            this.y = 320 - this.height;
        }
    }

    update(speed) {
        this.x -= speed;
    }

    draw(ctx) {
        if (this.type === 'log') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + 10 + i * 10);
                ctx.lineTo(this.x + this.width, this.y + 10 + i * 10);
                ctx.stroke();
            }
        } else if (this.type === 'tree') {
            ctx.fillStyle = '#4a2d1d';
            ctx.fillRect(this.x + 10, this.y, 40, this.height);
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + 20, 30, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Banana {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.collected = false;
    }

    update(speed) {
        this.x -= speed;
    }

    draw(ctx) {
        if (!this.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(this.x + 15, this.y + 15, 12, 20, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#228B22';
            ctx.fillRect(this.x + 12, this.y + 5, 6, 8);
        }
    }
}

class Particle {
    constructor(x, y, color, life, vx, vy) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.vx = vx;
        this.vy = vy;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; 
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Global functions for background drawing
function drawTrees(ctx, x, y, size, count) {
    for (let i = 0; i < count; i++) {
        const treeX = (x + i * 200) % (ctx.canvas.width + 50);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(treeX + 10, y + 80, 20, 40);
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(treeX + 20, y + 80, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFoliage(ctx, x, y, size, count) {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const foliageX = (x + i * 150) % (ctx.canvas.width + 50);
        ctx.ellipse(foliageX, y, size, size * 0.5, 0, 0, Math.PI * 2);
    }
    ctx.fill();
}

// Global game instance and control functions
let game;

function startGame() {
    if (!game) {
        game = new MonkeyRunnerGame();
    }
    game.start();
}

function restartGame() {
    game.start();
}

window.addEventListener('load', () => {
    game = new MonkeyRunnerGame();
});
