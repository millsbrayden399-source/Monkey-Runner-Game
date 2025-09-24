
/**
 * Monkey Runner - Enhanced Edition
 * A web-based endless runner game
 */

// Game Constants
const GAME_CONFIG = {
    GRAVITY: 0.8,
    INITIAL_SPEED: 5,
    MAX_SPEED: 15,
    ACCELERATION: 0.0005,
    JUMP_POWER: 18,
    DOUBLE_JUMP_POWER: 15,
    GROUND_HEIGHT: 320,
    POWER_DRAIN_RATE: 0.2,
    POWER_GAIN_RATE: 0.5,
    MAX_POWER: 100,
    SLIDE_DURATION: 40,
    INVINCIBILITY_DURATION: 120
};

// Asset Management
class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.onComplete = null;
    }

    loadImage(name, src) {
        this.totalAssets++;
        const img = new Image();
        img.src = src;
        img.onload = () => this._assetLoaded();
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            this._assetLoaded();
        };
        this.images[name] = img;
    }

    loadSound(name, src) {
        this.totalAssets++;
        const sound = new Audio(src);
        sound.oncanplaythrough = () => this._assetLoaded();
        sound.onerror = () => {
            console.error(`Failed to load sound: ${src}`);
            this._assetLoaded();
        };
        this.sounds[name] = sound;
    }

    _assetLoaded() {
        this.loadedAssets++;
        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }

    getImage(name) {
        return this.images[name];
    }

    playSound(name, volume = 1.0, loop = false) {
        if (!this.sounds[name]) return;
        
        // Clone the audio to allow multiple instances
        const sound = this.sounds[name].cloneNode();
        sound.volume = volume;
        sound.loop = loop;
        sound.play();
        return sound;
    }

    stopSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        }
    }
}

// Game Engine
class MonkeyRunnerGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'loading';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('monkeyRunnerHighScore')) || 0;
        this.gameSpeed = GAME_CONFIG.INITIAL_SPEED;
        this.powerLevel = 0;
        this.distance = 0;
        this.frameCount = 0;
        
        // Character selection
        this.selectedCharacter = 'default';
        
        // Game objects
        this.monkey = null;
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.background = { layers: [] };
        
        // Timing
        this.lastObstacleSpawn = 0;
        this.lastCollectibleSpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.spawnInterval = 1500;
        
        // Asset management
        this.assets = new AssetManager();
        this.loadAssets();
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    loadAssets() {
        // Load images
        this.assets.loadImage('background1', 'https://i.imgur.com/JbFBGfH.png');
        this.assets.loadImage('background2', 'https://i.imgur.com/0mGjpYx.png');
        this.assets.loadImage('background3', 'https://i.imgur.com/QIVRbkP.png');
        this.assets.loadImage('ground', 'https://i.imgur.com/KgDc3vg.png');
        
        // Load sounds
        this.assets.loadSound('jump', 'https://assets.codepen.io/21542/howler-push.mp3');
        this.assets.loadSound('collect', 'https://assets.codepen.io/21542/howler-sfx-levelup.mp3');
        this.assets.loadSound('crash', 'https://assets.codepen.io/21542/howler-sfx-lose.mp3');
        this.assets.loadSound('powerup', 'https://assets.codepen.io/21542/howler-sfx-coin.mp3');
        this.assets.loadSound('music', 'https://assets.codepen.io/21542/howler-rag-time.mp3');
        
        // Set completion callback
        this.assets.onComplete = () => {
            this.initializeGame();
            this.gameState = 'menu';
            this.updateUI();
        };
    }
    
    initializeGame() {
        // Initialize background layers
        this.background.layers = [
            { image: 'background1', x: 0, speed: 0.2 },
            { image: 'background2', x: 0, speed: 0.5 },
            { image: 'background3', x: 0, speed: 0.8 },
            { image: 'ground', x: 0, speed: 1.0, y: GAME_CONFIG.GROUND_HEIGHT }
        ];
        
        // Initialize monkey character
        this.monkey = new Monkey(this.selectedCharacter);
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleJumpAction();
            }
            
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                this.handleSlideAction();
            }
            
            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse/touch events
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.handleJumpAction();
            }
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJumpAction();
        });
        
        // UI button events
        document.getElementById('startButton').addEventListener('click', () => this.start());
        document.getElementById('restartButton').addEventListener('click', () => this.start());
        document.getElementById('menuButton').addEventListener('click', () => this.showMenu());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeButton').addEventListener('click', () => this.resumeGame());
        document.getElementById('quitButton').addEventListener('click', () => this.showMenu());
        document.getElementById('muteButton').addEventListener('click', () => this.toggleMute());
        
        // Character selection
        document.querySelectorAll('.character').forEach(char => {
            char.addEventListener('click', () => {
                document.querySelectorAll('.character').forEach(c => c.setAttribute('data-selected', 'false'));
                char.setAttribute('data-selected', 'true');
                this.selectedCharacter = char.getAttribute('data-character');
                if (this.monkey) {
                    this.monkey.setCharacter(this.selectedCharacter);
                }
            });
        });
    }
    
    handleJumpAction() {
        if (this.gameState === 'playing') {
            if (this.monkey.jump()) {
                this.assets.playSound('jump', 0.5);
            }
        } else if (this.gameState === 'gameOver' || this.gameState === 'menu') {
            this.start();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    handleSlideAction() {
        if (this.gameState === 'playing') {
            this.monkey.slide();
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('gameOverlay').style.display = 'flex';
            document.getElementById('pauseScreen').style.display = 'block';
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameOverScreen').style.display = 'none';
            this.assets.stopSound('music');
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('gameOverlay').style.display = 'none';
            document.getElementById('pauseScreen').style.display = 'none';
            this.assets.playSound('music', 0.3, true);
        }
    }
    
    toggleMute() {
        const muteButton = document.getElementById('muteButton');
        if (muteButton.textContent === '\ud83d\udd0a') {
            muteButton.textContent = '\ud83d\udd07';
            // Mute all audio
            Object.values(this.assets.sounds).forEach(sound => {
                sound.muted = true;
            });
        } else {
            muteButton.textContent = '\ud83d\udd0a';
            // Unmute all audio
            Object.values(this.assets.sounds).forEach(sound => {
                sound.muted = false;
            });
        }
    }
    
    spawnObjects() {
        const now = Date.now();
        
        // Spawn obstacles
        if (now - this.lastObstacleSpawn > this.spawnInterval) {
            this.lastObstacleSpawn = now;
            
            // Determine obstacle type
            const obstacleTypes = ['log', 'rock', 'bird'];
            const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            
            // Create obstacle
            const obstacle = new Obstacle(this.canvas.width, type);
            this.obstacles.push(obstacle);
            
            // Adjust spawn interval based on game speed
            this.spawnInterval = Math.max(800, 2000 - this.gameSpeed * 50);
        }
        
        // Spawn collectibles
        if (now - this.lastCollectibleSpawn > this.spawnInterval * 1.5) {
            this.lastCollectibleSpawn = now;
            
            // Determine collectible type
            const collectibleTypes = ['banana', 'coconut'];
            const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
            
            // Create collectible
            const y = Math.random() * 150 + 100; // Random height
            const collectible = new Collectible(this.canvas.width, y, type);
            this.collectibles.push(collectible);
        }
        
        // Spawn power-ups (less frequently)
        if (now - this.lastPowerUpSpawn > this.spawnInterval * 5) {
            this.lastPowerUpSpawn = now;
            
            // Determine power-up type
            const powerUpTypes = ['shield', 'magnet', 'boost'];
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            // Create power-up
            const y = Math.random() * 150 + 100; // Random height
            const powerUp = new PowerUp(this.canvas.width, y, type);
            this.powerUps.push(powerUp);
        }
    }
    
    updatePhysics(deltaTime) {
        // Update monkey
        this.monkey.update(deltaTime, this.keys);
        
        // Update obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.update(this.gameSpeed);
        });
        
        // Update collectibles
        this.collectibles.forEach(collectible => {
            collectible.update(this.gameSpeed);
            
            // Apply magnet effect if active
            if (this.monkey.powerUps.magnet && !collectible.collected) {
                const dx = this.monkey.x - collectible.x;
                const dy = this.monkey.y - collectible.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    collectible.x += dx * 0.05;
                    collectible.y += dy * 0.05;
                }
            }
        });
        
        // Update power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.update(this.gameSpeed);
        });
        
        // Update particles
        this.particles.forEach(particle => {
            particle.update();
        });
        
        // Update background layers
        this.background.layers.forEach(layer => {
            layer.x -= this.gameSpeed * layer.speed;
            
            // Reset layer position when it moves off-screen
            if (layer.x <= -this.canvas.width) {
                layer.x = 0;
            }
        });
        
        // Update game metrics
        this.distance += this.gameSpeed * deltaTime * 0.01;
        this.score = Math.floor(this.distance) * 10;
        
        // Drain power level
        if (this.powerLevel > 0) {
            this.powerLevel = Math.max(0, this.powerLevel - GAME_CONFIG.POWER_DRAIN_RATE * deltaTime * 0.01);
        }
        
        // Update game speed
        if (this.gameSpeed < GAME_CONFIG.MAX_SPEED) {
            this.gameSpeed += GAME_CONFIG.ACCELERATION * deltaTime;
        }
        
        // Clean up objects that are off-screen
        this.obstacles = this.obstacles.filter(o => o.x > -o.width);
        this.collectibles = this.collectibles.filter(c => c.x > -c.width && !c.collected);
        this.powerUps = this.powerUps.filter(p => p.x > -p.width && !p.collected);
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Update UI
        this.updateUI();
    }
    
    checkCollisions() {
        // Check collectible collisions
        this.collectibles.forEach(collectible => {
            if (!collectible.collected && this.isColliding(this.monkey, collectible)) {
                collectible.collected = true;
                
                // Add points based on collectible type
                if (collectible.type === 'banana') {
                    this.score += 10;
                    this.powerLevel = Math.min(GAME_CONFIG.MAX_POWER, this.powerLevel + 5);
                } else if (collectible.type === 'coconut') {
                    this.score += 25;
                    this.powerLevel = Math.min(GAME_CONFIG.MAX_POWER, this.powerLevel + 10);
                }
                
                // Play sound and create particles
                this.assets.playSound('collect', 0.4);
                this.createCollectParticles(collectible.x, collectible.y, collectible.type);
            }
        });
        
        // Check power-up collisions
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected && this.isColliding(this.monkey, powerUp)) {
                powerUp.collected = true;
                
                // Apply power-up effect
                this.monkey.activatePowerUp(powerUp.type);
                
                // Play sound and create particles
                this.assets.playSound('powerup', 0.5);
                this.createPowerUpParticles(powerUp.x, powerUp.y, powerUp.type);
                
                // Add power
                this.powerLevel = Math.min(GAME_CONFIG.MAX_POWER, this.powerLevel + 25);
            }
        });
        
        // Check obstacle collisions
        if (!this.monkey.isInvincible) {
            this.obstacles.forEach(obstacle => {
                if (this.isColliding(this.monkey, obstacle)) {
                    // If monkey is sliding and obstacle is a bird, no collision
                    if (this.monkey.isSliding && obstacle.type === 'bird') {
                        return;
                    }
                    
                    // If monkey has shield power-up, consume it instead of game over
                    if (this.monkey.powerUps.shield) {
                        this.monkey.powerUps.shield = false;
                        this.monkey.makeInvincible();
                        this.createShieldBreakParticles(this.monkey.x, this.monkey.y);
                        return;
                    }
                    
                    // Otherwise, game over
                    this.gameOver(`You crashed into a ${obstacle.type}!`);
                }
            });
        }
    }
    
    isColliding(obj1, obj2) {
        // For sliding monkey, adjust hitbox
        let obj1Height = obj1.height;
        let obj1Y = obj1.y;
        
        if (obj1.isSliding) {
            obj1Height = obj1.height / 2;
            obj1Y = obj1.y + obj1.height / 2;
        }
        
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1Y < obj2.y + obj2.height &&
               obj1Y + obj1Height > obj2.y;
    }
    
    createCollectParticles(x, y, type) {
        const color = type === 'banana' ? '#FFD700' : '#8B4513';
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(
                x, y, color, 40,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6
            ));
        }
    }
    
    createPowerUpParticles(x, y, type) {
        let color;
        switch (type) {
            case 'shield': color = '#3498db'; break;
            case 'magnet': color = '#9b59b6'; break;
            case 'boost': color = '#e74c3c'; break;
            default: color = '#2ecc71';
        }
        
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(
                x, y, color, 60,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            ));
        }
    }
    
    createShieldBreakParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push(new Particle(
                x, y, '#3498db', 60,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ));
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background layers
        this.background.layers.forEach(layer => {
            // Draw first instance
            if (this.assets.images[layer.image]) {
                this.ctx.drawImage(
                    this.assets.images[layer.image],
                    layer.x, layer.y || 0,
                    this.canvas.width, this.canvas.height - (layer.y || 0)
                );
                
                // Draw second instance to fill gap
                this.ctx.drawImage(
                    this.assets.images[layer.image],
                    layer.x + this.canvas.width, layer.y || 0,
                    this.canvas.width, this.canvas.height - (layer.y || 0)
                );
            }
        });
        
        // Draw collectibles
        this.collectibles.forEach(collectible => {
            collectible.draw(this.ctx);
        });
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.draw(this.ctx);
        });
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.draw(this.ctx);
        });
        
        // Draw monkey
        this.monkey.draw(this.ctx);
        
        // Draw particles
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
        
        // Draw debug info if needed
        if (false) { // Set to true to enable debug visuals
            this.drawDebugInfo();
        }
    }
    
    drawDebugInfo() {
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        
        // Draw monkey hitbox
        this.ctx.strokeRect(
            this.monkey.x, this.monkey.y,
            this.monkey.width, this.monkey.height
        );
        
        // Draw obstacle hitboxes
        this.obstacles.forEach(obstacle => {
            this.ctx.strokeRect(
                obstacle.x, obstacle.y,
                obstacle.width, obstacle.height
            );
        });
        
        // Draw collectible hitboxes
        this.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                this.ctx.strokeRect(
                    collectible.x, collectible.y,
                    collectible.width, collectible.height
                );
            }
        });
        
        // Draw power-up hitboxes
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                this.ctx.strokeRect(
                    powerUp.x, powerUp.y,
                    powerUp.width, powerUp.height
                );
            }
        });
        
        // Draw debug text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Game Speed: ${this.gameSpeed.toFixed(2)}`, 10, 20);
        this.ctx.fillText(`Obstacles: ${this.obstacles.length}`, 10, 40);
        this.ctx.fillText(`Collectibles: ${this.collectibles.length}`, 10, 60);
        this.ctx.fillText(`Power-Ups: ${this.powerUps.length}`, 10, 80);
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 100);
        this.ctx.fillText(`Monkey State: ${this.monkey.isJumping ? 'Jumping' : (this.monkey.isSliding ? 'Sliding' : 'Running')}`, 10, 120);
    }
    
    updateUI() {
        // Update score display
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('highScoreTop').textContent = this.highScore;
        document.getElementById('finalScore').textContent = this.score;
        
        // Update power meter
        document.getElementById('powerFill').style.width = `${this.powerLevel}%`;
    }
    
    gameOver(message) {
        this.gameState = 'gameOver';
        this.assets.playSound('crash', 0.6);
        this.assets.stopSound('music');
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('monkeyRunnerHighScore', this.highScore.toString());
        }
        
        // Show game over screen
        document.getElementById('crashMessage').textContent = message || 'Game Over!';
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        
        this.updateUI();
    }
    
    showMenu() {
        this.gameState = 'menu';
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
    }
    
    start() {
        this.gameState = 'playing';
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = GAME_CONFIG.INITIAL_SPEED;
        this.powerLevel = 50; // Start with some power
        
        // Reset game objects
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.lastObstacleSpawn = Date.now();
        this.lastCollectibleSpawn = Date.now();
        this.lastPowerUpSpawn = Date.now();
        this.spawnInterval = 2000;
        
        // Reset monkey
        this.monkey.reset();
        
        // Hide overlay
        document.getElementById('gameOverlay').style.display = 'none';
        
        // Update UI
        this.updateUI();
        
        // Play music
        this.assets.playSound('music', 0.3, true);
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - (this.lastTime || timestamp);
        this.lastTime = timestamp;
        
        // Update frame count
        this.frameCount++;
        
        // Update game state
        if (this.gameState === 'playing') {
            this.spawnObjects();
            this.updatePhysics(deltaTime);
            this.checkCollisions();
        }
        
        // Draw everything
        this.draw();
        
        // Continue game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// Game Objects
class Monkey {
    constructor(character = 'default') {
        this.x = 100;
        this.y = 250;
        this.width = 60;
        this.height = 60;
        this.character = character;
        
        // Movement state
        this.isJumping = false;
        this.canDoubleJump = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.slideTimer = 0;
        
        // Animation
        this.frame = 0;
        this.frameInterval = 5;
        this.frameCount = 0;
        this.animState = 'running';
        
        // Power-ups
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.powerUps = {
            shield: false,
            magnet: false,
            boost: false
        };
        this.powerUpTimers = {
            shield: 0,
            magnet: 0,
            boost: 0
        };
    }
    
    setCharacter(character) {
        this.character = character;
    }
    
    jump() {
        if (!this.isJumping) {
            // First jump
            this.isJumping = true;
            this.canDoubleJump = true;
            this.jumpVelocity = -GAME_CONFIG.JUMP_POWER;
            this.isSliding = false;
            this.slideTimer = 0;
            this.animState = 'jumping';
            return true;
        } else if (this.canDoubleJump) {
            // Double jump
            this.jumpVelocity = -GAME_CONFIG.DOUBLE_JUMP_POWER;
            this.canDoubleJump = false;
            this.animState = 'doubleJumping';
            return true;
        }
        return false;
    }
    
    slide() {
        if (!this.isSliding && !this.isJumping) {
            this.isSliding = true;
            this.slideTimer = GAME_CONFIG.SLIDE_DURATION;
            this.animState = 'sliding';
            return true;
        }
        return false;
    }
    
    makeInvincible() {
        this.isInvincible = true;
        this.invincibilityTimer = GAME_CONFIG.INVINCIBILITY_DURATION;
    }
    
    activatePowerUp(type) {
        switch (type) {
            case 'shield':
                this.powerUps.shield = true;
                break;
            case 'magnet':
                this.powerUps.magnet = true;
                this.powerUpTimers.magnet = 600; // 10 seconds at 60fps
                break;
            case 'boost':
                this.powerUps.boost = true;
                this.powerUpTimers.boost = 300; // 5 seconds at 60fps
                this.makeInvincible();
                break;
        }
    }
    
    update(deltaTime, keys) {
        // Handle jumping physics
        if (this.isJumping) {
            this.y += this.jumpVelocity;
            this.jumpVelocity += GAME_CONFIG.GRAVITY;
            
            if (this.y >= 250) {
                this.y = 250;
                this.isJumping = false;
                this.canDoubleJump = false;
                this.jumpVelocity = 0;
                this.animState = 'running';
            }
        }
        
        // Handle sliding
        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.animState = 'running';
            }
        }
        
        // Handle invincibility
        if (this.isInvincible) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
            }
        }
        
        // Handle power-up timers
        Object.keys(this.powerUpTimers).forEach(powerUp => {
            if (this.powerUpTimers[powerUp] > 0) {
                this.powerUpTimers[powerUp]--;
                if (this.powerUpTimers[powerUp] <= 0) {
                    this.powerUps[powerUp] = false;
                }
            }
        });
        
        // Update animation frame
        this.frameCount++;
        if (this.frameCount >= this.frameInterval) {
            this.frame = (this.frame + 1) % 2;
            this.frameCount = 0;
        }
    }
    
    draw(ctx) {
        // Save context for potential opacity changes
        ctx.save();
        
        // Flash effect for invincibility
        if (this.isInvincible && Math.floor(this.invincibilityTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.7;
        }
        
        // Draw character based on selected character and state
        switch (this.character) {
            case 'ninja':
                this.drawNinjaMonkey(ctx);
                break;
            case 'space':
                this.drawSpaceMonkey(ctx);
                break;
            default:
                this.drawDefaultMonkey(ctx);
        }
        
        // Draw power-up effects
        if (this.powerUps.shield) {
            this.drawShield(ctx);
        }
        
        if (this.powerUps.magnet) {
            this.drawMagnetEffect(ctx);
        }
        
        if (this.powerUps.boost) {
            this.drawBoostEffect(ctx);
        }
        
        // Restore context
        ctx.restore();
    }
    
    drawDefaultMonkey(ctx) {
        // Adjust position based on state
        let drawY = this.y;
        let drawHeight = this.height;
        
        if (this.isSliding) {
            drawY = this.y + this.height / 2;
            drawHeight = this.height / 2;
        }
        
        // Body (Ellipse)
        ctx.fillStyle = '#D2691E'; // Brown body color
        ctx.beginPath();
        ctx.ellipse(this.x + 30, drawY + 40, 25, 20, Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Head (Arc)
        ctx.fillStyle = '#DEB887'; // Lighter head/face color
        ctx.beginPath();
        ctx.arc(this.x + 30, drawY + 20, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.arc(this.x + 15, drawY + 18, 8, 0, Math.PI * 2);
        ctx.arc(this.x + 45, drawY + 18, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Face
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.arc(this.x + 30, drawY + 25, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 25, drawY + 20, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 35, drawY + 20, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, drawY + 50);
        ctx.bezierCurveTo(this.x - 20, drawY + 40, this.x - 30, drawY + 60, this.x, drawY + 70);
        ctx.stroke();
        
        // Legs (animated)
        ctx.fillStyle = '#D2691E';
        if (this.isSliding) {
            // Sliding pose
            ctx.fillRect(this.x + 20, drawY + 15, 8, 5);
            ctx.fillRect(this.x + 32, drawY + 15, 8, 5);
        } else if (this.isJumping) {
            // Jumping pose
            ctx.fillRect(this.x + 20, drawY + 50, 8, 15);
            ctx.fillRect(this.x + 32, drawY + 50, 8, 15);
        } else {
            // Running animation
            if (this.frame === 0) {
                ctx.fillRect(this.x + 20, drawY + 55, 8, 15);
                ctx.fillRect(this.x + 32, drawY + 55, 8, 15);
            } else {
                ctx.fillRect(this.x + 20, drawY + 50, 8, 15);
                ctx.fillRect(this.x + 32, drawY + 60, 8, 15);
            }
        }
    }
    
    drawNinjaMonkey(ctx) {
        // Adjust position based on state
        let drawY = this.y;
        let drawHeight = this.height;
        
        if (this.isSliding) {
            drawY = this.y + this.height / 2;
            drawHeight = this.height / 2;
        }
        
        // Body (Ellipse)
        ctx.fillStyle = '#333'; // Dark ninja suit
        ctx.beginPath();
        ctx.ellipse(this.x + 30, drawY + 40, 25, 20, Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Head (Arc)
        ctx.fillStyle = '#333'; // Ninja mask
        ctx.beginPath();
        ctx.arc(this.x + 30, drawY + 20, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // Face area
        ctx.fillStyle = '#DEB887'; // Skin color showing through mask
        ctx.beginPath();
        ctx.arc(this.x + 30, drawY + 25, 10, 0, Math.PI, false);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 25, drawY + 20, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 35, drawY + 20, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 25, drawY + 20, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 35, drawY + 20, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ninja headband
        ctx.fillStyle = '#e74c3c'; // Red headband
        ctx.fillRect(this.x + 12, drawY + 15, 36, 5);
        
        // Ninja belt
        ctx.fillStyle = '#e74c3c'; // Red belt
        ctx.fillRect(this.x + 5, drawY + 40, 50, 5);
        
        // Tail
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, drawY + 50);
        ctx.bezierCurveTo(this.x - 20, drawY + 40, this.x - 30, drawY + 60, this.x, drawY + 70);
        ctx.stroke();
        
        // Legs (animated)
        ctx.fillStyle = '#333';
        if (this.isSliding) {
            // Sliding pose
            ctx.fillRect(this.x + 20, drawY + 15, 8, 5);
            ctx.fillRect(this.x + 32, drawY + 15, 8, 5);
        } else if (this.isJumping) {
            // Jumping pose - ninja kick
            ctx.fillRect(this.x + 20, drawY + 50, 8, 15);
            ctx.fillRect(this.x + 32, drawY + 40, 30, 8);
        } else {
            // Running animation
            if (this.frame === 0) {
                ctx.fillRect(this.x + 20, drawY + 55, 8, 15);
                ctx.fillRect(this.x + 32, drawY + 55, 8, 15);
            } else {
                ctx.fillRect(this.x + 20, drawY + 50, 8, 15);
                ctx.fillRect(this.x + 32, drawY + 60, 8, 15);
            }
        }
    }
    
    drawSpaceMonkey(ctx) {
        // Adjust position based on state
        let drawY = this.y;
        let drawHeight = this.height;
        
        if (this.isSliding) {
            drawY = this.y + this.height / 2;
            drawHeight = this.height / 2;
        }
        
        // Space suit body
        ctx.fillStyle = '#3498db'; // Blue space suit
        ctx.beginPath();
        ctx.ellipse(this.x + 30, drawY + 40, 25, 20, Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet
        ctx.fillStyle = '#fff'; // White helmet
        ctx.beginPath();
        ctx.arc(this.x + 30, drawY + 20, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet visor
        ctx.fillStyle = '#2c3e50'; // Dark visor
        ctx.beginPath();
        ctx.arc(this.x + 30, drawY + 20, 15, 0, Math.PI, false);
        ctx.fill();
        
        // Helmet reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + 25, drawY + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Space suit details
        ctx.fillStyle = '#2980b9'; // Darker blue details
        ctx.fillRect(this.x + 20, drawY + 30, 20, 5);
        ctx.fillRect(this.x + 15, drawY + 40, 30, 5);
        
        // Oxygen tank
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(this.x + 5, drawY + 30, 10, 25);
        
        // Legs (animated)
        ctx.fillStyle = '#3498db';
        if (this.isSliding) {
            // Sliding pose
            ctx.fillRect(this.x + 20, drawY + 15, 8, 5);
            ctx.fillRect(this.x + 32, drawY + 15, 8, 5);
        } else if (this.isJumping) {
            // Jumping pose - jetpack effect
            ctx.fillRect(this.x + 20, drawY + 55, 8, 15);
            ctx.fillRect(this.x + 32, drawY + 55, 8, 15);
            
            // Jetpack flames
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(this.x + 5, drawY + 55);
            ctx.lineTo(this.x - 10, drawY + 70 + Math.random() * 10);
            ctx.lineTo(this.x + 15, drawY + 70 + Math.random() * 10);
            ctx.fill();
        } else {
            // Running animation
            if (this.frame === 0) {
                ctx.fillRect(this.x + 20, drawY + 55, 8, 15);
                ctx.fillRect(this.x + 32, drawY + 55, 8, 15);
            } else {
                ctx.fillRect(this.x + 20, drawY + 50, 8, 15);
                ctx.fillRect(this.x + 32, drawY + 60, 8, 15);
            }
        }
    }
    
    drawShield(ctx) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        
        // Draw shield bubble
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + 30, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw shield highlights
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + 30, 40, Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();
        
        // Reset opacity
        ctx.globalAlpha = 1.0;
    }
    
    drawMagnetEffect(ctx) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        
        // Draw magnetic field lines
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const innerRadius = 45;
            const outerRadius = 60 + Math.sin(Date.now() / 200) * 10;
            
            ctx.beginPath();
            ctx.moveTo(
                this.x + 30 + Math.cos(angle) * innerRadius,
                this.y + 30 + Math.sin(angle) * innerRadius
            );
            ctx.lineTo(
                this.x + 30 + Math.cos(angle) * outerRadius,
                this.y + 30 + Math.sin(angle) * outerRadius
            );
            ctx.stroke();
        }
    }
    
    drawBoostEffect(ctx) {
        // Draw speed lines
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            const y = this.y + 20 + i * 10;
            const length = 30 + Math.random() * 20;
            
            ctx.beginPath();
            ctx.moveTo(this.x - length, y);
            ctx.lineTo(this.x, y);
            ctx.stroke();
        }
    }
    
    reset() {
        this.x = 100;
        this.y = 250;
        this.isJumping = false;
        this.canDoubleJump = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.slideTimer = 0;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.powerUps = {
            shield: false,
            magnet: false,
            boost: false
        };
        this.powerUpTimers = {
            shield: 0,
            magnet: 0,
            boost: 0
        };
        this.animState = 'running';
    }
}

class Obstacle {
    constructor(x, type) {
        this.x = x;
        this.type = type;
        
        // Set properties based on type
        switch (type) {
            case 'log':
                this.width = 80;
                this.height = 40;
                this.y = GAME_CONFIG.GROUND_HEIGHT - this.height;
                break;
            case 'rock':
                this.width = 50;
                this.height = 50;
                this.y = GAME_CONFIG.GROUND_HEIGHT - this.height;
                break;
            case 'bird':
                this.width = 60;
                this.height = 30;
                this.y = GAME_CONFIG.GROUND_HEIGHT - this.height - 60 - Math.random() * 40; // Flying higher
                break;
            default:
                this.width = 80;
                this.height = 40;
                this.y = GAME_CONFIG.GROUND_HEIGHT - this.height;
        }
    }
    
    update(speed) {
        this.x -= speed;
        
        // Bird obstacles can move up and down
        if (this.type === 'bird') {
            this.y += Math.sin(this.x / 50) * 0.5;
        }
    }
    
    draw(ctx) {
        switch (this.type) {
            case 'log':
                this.drawLog(ctx);
                break;
            case 'rock':
                this.drawRock(ctx);
                break;
            case 'bird':
                this.drawBird(ctx);
                break;
            default:
                this.drawLog(ctx);
        }
    }
    
    drawLog(ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Log details
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 10 + i * 10);
            ctx.lineTo(this.x + this.width, this.y + 10 + i * 10);
            ctx.stroke();
        }
        
        // Log ends
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.height / 2, this.height / 2, Math.PI * 0.5, Math.PI * 1.5);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + this.width, this.y + this.height / 2, this.height / 2, Math.PI * 1.5, Math.PI * 0.5);
        ctx.fill();
    }
    
    drawRock(ctx) {
        // Base rock shape
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + 10, this.y + 10);
        ctx.lineTo(this.x + 25, this.y);
        ctx.lineTo(this.x + 40, this.y + 15);
        ctx.lineTo(this.x + this.width, this.y + 20);
        ctx.lineTo(this.x + this.width - 5, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Rock details
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y + 20);
        ctx.lineTo(this.x + 25, this.y + 30);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 35, this.y + 15);
        ctx.lineTo(this.x + 30, this.y + 35);
        ctx.stroke();
    }
    
    drawBird(ctx) {
        // Bird body
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(this.x + 30, this.y + 15, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird head
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(this.x + 50, this.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 53, this.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 54, this.y + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird beak
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.moveTo(this.x + 60, this.y + 10);
        ctx.lineTo(this.x + 70, this.y + 12);
        ctx.lineTo(this.x + 60, this.y + 15);
        ctx.closePath();
        ctx.fill();
        
        // Bird wings
        ctx.fillStyle = '#e74c3c';
        
        // Animate wings based on position
        const wingPosition = Math.sin(this.x / 10) * 10;
        
        ctx.beginPath();
        ctx.moveTo(this.x + 30, this.y + 15);
        ctx.lineTo(this.x + 20, this.y - 10 + wingPosition);
        ctx.lineTo(this.x + 40, this.y + 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 30, this.y + 15);
        ctx.lineTo(this.x + 10, this.y - 5 + wingPosition);
        ctx.lineTo(this.x + 25, this.y + 10);
        ctx.closePath();
        ctx.fill();
    }
}

class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.collected = false;
        this.rotation = 0;
    }
    
    update(speed) {
        this.x -= speed;
        this.rotation += 0.05;
        
        // Add slight floating motion
        this.y += Math.sin(this.x / 50) * 0.5;
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        if (this.type === 'banana') {
            this.drawBanana(ctx);
        } else if (this.type === 'coconut') {
            this.drawCoconut(ctx);
        }
        
        ctx.restore();
    }
    
    drawBanana(ctx) {
        // Banana shape
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 20, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Banana stem
        ctx.fillStyle = '#228B22';
        ctx.fillRect(-3, -15, 6, 8);
        
        // Banana details
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -5);
        ctx.quadraticCurveTo(0, 0, 8, 5);
        ctx.stroke();
    }
    
    drawCoconut(ctx) {
        // Coconut shape
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Coconut texture
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(5, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(-7, 7, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Coconut "eyes"
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-5, -5, 2, 0, Math.PI * 2);
        ctx.arc(5, -5, 2, 0, Math.PI * 2);
        ctx.arc(0, 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.collected = false;
        this.rotation = 0;
        this.pulseSize = 0;
    }
    
    update(speed) {
        this.x -= speed;
        this.rotation += 0.03;
        this.pulseSize = Math.sin(Date.now() / 200) * 5;
        
        // Add floating motion
        this.y += Math.sin(this.x / 60) * 0.7;
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Draw glow effect
        ctx.globalAlpha = 0.3;
        let glowColor;
        switch (this.type) {
            case 'shield': glowColor = '#3498db'; break;
            case 'magnet': glowColor = '#9b59b6'; break;
            case 'boost': glowColor = '#e74c3c'; break;
            default: glowColor = '#2ecc71';
        }
        
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, 25 + this.pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset opacity
        ctx.globalAlpha = 1.0;
        
        // Draw power-up
        switch (this.type) {
            case 'shield':
                this.drawShield(ctx);
                break;
            case 'magnet':
                this.drawMagnet(ctx);
                break;
            case 'boost':
                this.drawBoost(ctx);
                break;
            default:
                this.drawGenericPowerUp(ctx);
        }
        
        ctx.restore();
    }
    
    drawShield(ctx) {
        // Shield base
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(15, -10);
        ctx.lineTo(15, 10);
        ctx.lineTo(0, 20);
        ctx.lineTo(-15, 10);
        ctx.lineTo(-15, -10);
        ctx.closePath();
        ctx.fill();
        
        // Shield details
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.stroke();
    }
    
    drawMagnet(ctx) {
        // Magnet body
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(-15, -20, 30, 40);
        
        // Magnet poles
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(-20, -20, 5, 15);
        ctx.fillRect(-20, 5, 5, 15);
        ctx.fillRect(15, -20, 5, 15);
        ctx.fillRect(15, 5, 5, 15);
        
        // Magnet details
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
    }
    
    drawBoost(ctx) {
        // Boost base
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(20, 0);
        ctx.lineTo(0, 20);
        ctx.lineTo(-20, 0);
        ctx.closePath();
        ctx.fill();
        
        // Boost details
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();
        
        // Arrow
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.moveTo(0, -5);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 5);
        ctx.stroke();
    }
    
    drawGenericPowerUp(ctx) {
        // Generic power-up
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Star shape
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 10;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
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
        this.size = 3 + Math.random() * 3;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity
        this.life--;
        this.size *= 0.97; // Shrink over time
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    // Wait for DOM to be fully loaded
    setTimeout(() => {
        new MonkeyRunnerGame();
    }, 100);
});
