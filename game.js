// This new object will handle loading our images
const assets = {
    images: {},
    loadImages: function(onComplete) {
        const sources = {
            banana: 'https://i.imgur.com/2OD5y2c.png' // <-- The new pixel art banana image!
        };
        let imagesToLoad = Object.keys(sources).length;
        if (imagesToLoad === 0) {
            onComplete();
            return;
        }
        for (const key in sources) {
            if (sources.hasOwnProperty(key)) {
                this.images[key] = new Image();
                this.images[key].src = sources[key];
                this.images[key].onload = () => {
                    imagesToLoad--;
                    if (imagesToLoad === 0) {
                        onComplete();
                    }
                };
                 this.images[key].onerror = () => {
                    imagesToLoad--;
                    console.error("Failed to load image: " + sources[key]);
                    if (imagesToLoad === 0) {
                        onComplete();
                    }
                };
            }
        }
    },
    getImage: function(name) {
        return this.images[name];
    }
};

const GAME_CONFIG = {
    GRAVITY: 0.8,
    INITIAL_SPEED: 5,
    MAX_SPEED: 15,
    ACCELERATION: 0.0005,
    JUMP_POWER: 18,
    DOUBLE_JUMP_POWER: 15,
    GROUND_HEIGHT: 320,
    SLIDE_DURATION: 40,
    INVINCIBILITY_DURATION: 120
};

class Monkey {
    // This is your original, unchanged Monkey class
    constructor(character = 'default') {
        this.x = 100;
        this.y = GAME_CONFIG.GROUND_HEIGHT - 60;
        this.width = 50;
        this.height = 60;
        this.velocityY = 0;
        this.onGround = true;
        this.canDoubleJump = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.character = character;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.tailWag = 0;
        this.powerUps = { shield: false, magnet: false, boost: false };
        this.powerUpTimers = { shield: 0, magnet: 0, boost: 0 };
        this.sprites = { default: null, ninja: null, space: null };
        this.loadSprites();
    }
    loadSprites() {
        const createCharacterSprite = (colors, accessories) => {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 120;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(50, 70, 20, 25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(50, 40, 18, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = colors.face;
            ctx.beginPath();
            ctx.ellipse(50, 42, 12, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(44, 38, 4, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(56, 38, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.ellipse(44, 38, 2, 2.5, 0, 0, Math.PI * 2);
            ctx.ellipse(56, 38, 2, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = colors.mouth || '#A52A2A';
            ctx.beginPath();
            ctx.ellipse(50, 48, 6, 4, 0, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(36, 28, 6, 8, -0.3, 0, Math.PI * 2);
            ctx.ellipse(64, 28, 6, 8, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = colors.innerEar || colors.face;
            ctx.beginPath();
            ctx.ellipse(36, 28, 3, 5, -0.3, 0, Math.PI * 2);
            ctx.ellipse(64, 28, 3, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(30, 70, 6, 15, -0.3, 0, Math.PI * 2);
            ctx.ellipse(70, 70, 6, 15, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(40, 95, 7, 15, 0, 0, Math.PI * 2);
            ctx.ellipse(60, 95, 7, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(50, 85);
            ctx.quadraticCurveTo(75, 85, 80, 65);
            ctx.quadraticCurveTo(82, 60, 80, 55);
            ctx.quadraticCurveTo(78, 50, 75, 55);
            ctx.quadraticCurveTo(70, 70, 50, 75);
            ctx.fill();
            if (accessories) { accessories(ctx); }
            ctx.restore();
            return canvas;
        };
        this.sprites.default = createCharacterSprite({ body: '#D2691E', face: '#F4A460', innerEar: '#FFA07A', mouth: '#8B4513' }, (ctx) => { ctx.fillStyle = '#228B22'; ctx.beginPath(); ctx.ellipse(50, 22, 10, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(40, 25); ctx.quadraticCurveTo(35, 15, 30, 20); ctx.quadraticCurveTo(35, 25, 40, 25); ctx.fill(); ctx.beginPath(); ctx.moveTo(60, 25); ctx.quadraticCurveTo(65, 15, 70, 20); ctx.quadraticCurveTo(65, 25, 60, 25); ctx.fill(); ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(30, 85, 5, 10, -0.5, 0, Math.PI * 2); ctx.fill(); });
        this.sprites.ninja = createCharacterSprite({ body: '#2F4F4F', face: '#696969', innerEar: '#A9A9A9', mouth: '#4B0082' }, (ctx) => { ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(50, 38, 18, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'white'; ctx.beginPath(); ctx.ellipse(44, 38, 4, 3, 0, 0, Math.PI * 2); ctx.ellipse(56, 38, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#8B0000'; ctx.fillRect(32, 28, 36, 6); ctx.beginPath(); ctx.moveTo(68, 31); ctx.quadraticCurveTo(75, 35, 78, 45); ctx.lineTo(76, 45); ctx.quadraticCurveTo(73, 35, 68, 33); ctx.fill(); ctx.fillStyle = '#C0C0C0'; ctx.save(); ctx.translate(30, 85); ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -5, 10, 10); ctx.restore(); });
        this.sprites.space = createCharacterSprite({ body: '#4169E1', face: '#87CEEB', innerEar: '#ADD8E6', mouth: '#000080' }, (ctx) => { ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.beginPath(); ctx.ellipse(50, 40, 22, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#C0C0C0'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#C0C0C0'; ctx.beginPath(); ctx.ellipse(50, 64, 10, 5, 0, 0, Math.PI * 2); ctx.fill(); [[30, 25], [70, 30], [25, 50], [75, 55], [35, 15]].forEach(([x, y]) => { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); const gradient = ctx.createRadialGradient(x, y, 0, x, y, 5); gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); }); ctx.fillStyle = '#C0C0C0'; ctx.beginPath(); ctx.ellipse(30, 85, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#00BFFF'; ctx.beginPath(); ctx.arc(30, 85, 2, 0, Math.PI * 2); ctx.fill(); });
    }
    setCharacter(character) { this.character = character; }
    jump() { if (this.onGround) { this.velocityY = -GAME_CONFIG.JUMP_POWER; this.onGround = false; this.canDoubleJump = true; return true; } else if (this.canDoubleJump) { this.velocityY = -GAME_CONFIG.DOUBLE_JUMP_POWER; this.canDoubleJump = false; return true; } return false; }
    slide() { if (this.onGround && !this.isSliding) { this.isSliding = true; this.slideTimer = GAME_CONFIG.SLIDE_DURATION; } }
    activatePowerUp(type) { this.powerUps[type] = true; this.powerUpTimers[type] = type === 'shield' ? 300 : type === 'magnet' ? 400 : 200; }
    makeInvincible() { this.isInvincible = true; this.invincibilityTimer = GAME_CONFIG.INVINCIBILITY_DURATION; }
    update(dt) { if (!this.onGround) { this.velocityY += GAME_CONFIG.GRAVITY * dt; this.y += this.velocityY * dt; } if (this.y >= GAME_CONFIG.GROUND_HEIGHT - this.height) { this.y = GAME_CONFIG.GROUND_HEIGHT - this.height; this.velocityY = 0; this.onGround = true; } if (this.isSliding) { this.slideTimer -= dt; if (this.slideTimer <= 0) { this.isSliding = false; } } if (this.isInvincible) { this.invincibilityTimer -= dt; if (this.invincibilityTimer <= 0) { this.isInvincible = false; } } Object.keys(this.powerUpTimers).forEach(key => { if (this.powerUps[key]) { this.powerUpTimers[key] -= dt; if (this.powerUpTimers[key] <= 0) { this.powerUps[key] = false; } } }); this.animationTimer += dt; if (this.animationTimer > 100) { this.animationFrame = (this.animationFrame + 1) % 4; this.animationTimer = 0; } }
    draw(ctx) { ctx.save(); this.blinkTimer++; if (this.blinkTimer > 120) { this.isBlinking = true; if (this.blinkTimer > 125) { this.isBlinking = false; this.blinkTimer = Math.floor(Math.random() * 60); } } this.tailWag = Math.sin(this.animationFrame * 0.2) * 5; if (this.isInvincible && Math.floor(Date.now() / 100) % 2) { ctx.globalAlpha = 0.5; } if (this.sprites[this.character]) { const sprite = this.sprites[this.character]; const scale = 0.6; const spriteWidth = sprite.width * scale; const spriteHeight = sprite.height * scale; let yOffset = 0; if (!this.onGround) { yOffset = -5; } else if (this.isSliding) { ctx.save(); ctx.translate(this.x + this.width / 2, this.y + this.height - 15); ctx.rotate(Math.PI / 2.5); ctx.drawImage(sprite, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight); ctx.restore(); ctx.restore(); this.drawPowerUpEffects(ctx); return; } const bounceOffset = this.onGround ? Math.abs(Math.sin(this.animationFrame * 0.3) * 3) : 0; ctx.drawImage(sprite, this.x - 5, this.y - 15 - bounceOffset + yOffset, spriteWidth, spriteHeight); this.drawPowerUpEffects(ctx); ctx.restore(); return; } ctx.restore(); }
    drawPowerUpEffects(ctx) { if (this.powerUps.shield) { const shieldRadius = this.width / 2 + 15; const gradient = ctx.createRadialGradient(this.x + this.width / 2, this.y + this.height / 2, shieldRadius - 10, this.x + this.width / 2, this.y + this.height / 2, shieldRadius); gradient.addColorStop(0, 'rgba(52, 152, 219, 0.1)'); gradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.3)'); gradient.addColorStop(1, 'rgba(52, 152, 219, 0.1)'); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + this.height / 2, shieldRadius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + this.height / 2, shieldRadius, 0, Math.PI * 2); ctx.stroke(); for (let i = 0; i < 5; i++) { const angle = (this.animationFrame * 0.05) + (i * Math.PI * 2 / 5); const sparkleX = this.x + this.width / 2 + Math.cos(angle) * shieldRadius; const sparkleY = this.y + this.height / 2 + Math.sin(angle) * shieldRadius; const sparkleSize = 2 + Math.sin(this.animationFrame * 0.2 + i) * 2; ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.beginPath(); ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2); ctx.fill(); } } if (this.powerUps.magnet) { const magnetRadius = 80; const gradient = ctx.createRadialGradient(this.x + this.width / 2, this.y + this.height / 2, 20, this.x + this.width / 2, this.y + this.height / 2, magnetRadius); gradient.addColorStop(0, 'rgba(155, 89, 182, 0)'); gradient.addColorStop(0.7, 'rgba(155, 89, 182, 0.1)'); gradient.addColorStop(1, 'rgba(155, 89, 182, 0.2)'); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + this.height / 2, magnetRadius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)'; ctx.lineWidth = 1; for (let i = 0; i < 8; i++) { const angle = (this.animationFrame * 0.02) + (i * Math.PI / 4); ctx.beginPath(); ctx.moveTo(this.x + this.width / 2 + Math.cos(angle) * 20, this.y + this.height / 2 + Math.sin(angle) * 20); ctx.lineTo(this.x + this.width / 2 + Math.cos(angle) * magnetRadius, this.y + this.height / 2 + Math.sin(angle) * magnetRadius); ctx.stroke(); } } if (this.powerUps.boost) { const flameColors = ['#e74c3c', '#e67e22', '#f1c40f']; for (let i = 0; i < 15; i++) { const size = 10 - i * 0.5; const alpha = 1 - (i / 15); const offsetX = -i * 3 - 10; const offsetY = Math.sin(this.animationFrame * 0.3 + i * 0.5) * 5; const colorIndex = Math.floor(i / 5) % flameColors.length; ctx.fillStyle = flameColors[colorIndex] + Math.floor(alpha * 255).toString(16).padStart(2, '0'); ctx.beginPath(); ctx.ellipse(this.x + offsetX, this.y + this.height / 2 + offsetY, size, size * 0.6, 0, 0, Math.PI * 2); ctx.fill(); } ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { const y = this.y + 10 + i * 10; const length = 20 + Math.random() * 30; const x = this.x - 20 - Math.random() * 40; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - length, y); ctx.stroke(); } } }
}

// THIS IS THE RESTORED OBSTACLE CLASS
class Obstacle {
    constructor(x, type) {
        this.x = x;
        this.type = type;
        this.width = type === 'bird' ? 50 : 60;
        this.height = type === 'bird' ? 40 : 50;
        this.y = type === 'bird' ?
            GAME_CONFIG.GROUND_HEIGHT - 150 - Math.random() * 100 :
            GAME_CONFIG.GROUND_HEIGHT - this.height;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.rotation = 0;
        if (type === 'bird') { this.wingFlap = 0; this.flapDirection = 1; this.birdColor = Math.random() > 0.5 ? 'red' : Math.random() > 0.5 ? 'blue' : 'yellow'; this.flyPattern = Math.floor(Math.random() * 3); }
        if (type === 'rock') { this.rockType = Math.floor(Math.random() * 3); this.rockColor = Math.random() > 0.7 ? 'gray' : Math.random() > 0.5 ? 'brown' : 'mossy'; }
        if (type === 'log') { this.logRotation = Math.random() * 0.3 - 0.15; this.barkDetail = Math.floor(Math.random() * 5) + 3; this.hasMushrooms = Math.random() > 0.7; }
        this.sprite = this.createSprite();
    }
    createSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width * 2;
        canvas.height = this.height * 2;
        if (this.type === 'log') { this.drawLogSprite(ctx, canvas.width, canvas.height); } else if (this.type === 'rock') { this.drawRockSprite(ctx, canvas.width, canvas.height); } else if (this.type === 'bird') { this.drawBirdSprite(ctx, canvas.width, canvas.height); }
        return canvas;
    }
    drawLogSprite(ctx, width, height) { /* ... Your original drawing code ... */ }
    drawRockSprite(ctx, width, height) { /* ... Your original drawing code ... */ }
    drawBirdSprite(ctx, width, height) { /* ... Your original drawing code ... */ }
    update(speed) {
        this.x -= speed;
        this.animationTimer += speed;
        if (this.animationTimer > 5) {
            this.animationFrame = (this.animationFrame + 1) % 8;
            this.animationTimer = 0;
            if (this.type === 'bird') {
                this.wingFlap += 0.2 * this.flapDirection;
                if (this.wingFlap > 1) { this.flapDirection = -1; } else if (this.wingFlap < -1) { this.flapDirection = 1; }
                if (this.flyPattern === 1) { this.y += Math.sin(this.x / 50) * 2; } else if (this.flyPattern === 2) { this.y += (Math.random() - 0.5) * 3; }
            }
            if (this.type === 'log') { this.rotation += 0.01; }
        }
    }
    draw(ctx) {
        ctx.save();
        if (this.sprite) {
            if (this.type === 'bird') {
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.drawImage(this.sprite, -this.width, -this.height, this.width * 2, this.height * 2);
                const wingColor = this.birdColor === 'red' ? '#FF4500' : this.birdColor === 'blue' ? '#1E90FF' : '#FFA500';
                ctx.fillStyle = wingColor;
                ctx.save();
                ctx.rotate(this.wingFlap * 0.5);
                ctx.beginPath();
                ctx.ellipse(0, -this.height / 2, this.width / 2, this.height / 4, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                ctx.save();
                ctx.rotate(-this.wingFlap * 0.5);
                ctx.beginPath();
                ctx.ellipse(0, this.height / 2, this.width / 2, this.height / 4, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                ctx.restore();
            } else if (this.type === 'log') {
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(this.logRotation + Math.sin(this.rotation) * 0.05);
                ctx.drawImage(this.sprite, -this.width, -this.height, this.width * 2, this.height * 2);
            } else {
                ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width * 2, this.height * 2);
            }
        }
        ctx.restore();
    }
}

// THIS IS THE NEW, IMAGE-BASED COLLECTIBLE CLASS
class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 35;
        this.height = 35;
        this.collected = false;
        this.bobOffset = Math.random() * 10;
        this.rotation = (Math.random() - 0.5) * 0.5;
    }
    update(speed) {
        this.x -= speed;
        this.bobOffset += 0.05;
        this.y += Math.sin(this.bobOffset) * 0.2;
    }
    draw(ctx) {
        if (this.collected) return;
        let imageToDraw = null;
        if (this.type === 'banana') {
            imageToDraw = assets.getImage('banana');
        } else if (this.type === 'coconut') {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 15, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        if (imageToDraw && imageToDraw.complete) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.drawImage(imageToDraw, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }
}

// THIS IS THE RESTORED POWERUP CLASS
class PowerUp {
     constructor(x, y, type) {
        this.x = x; this.y = y; this.type = type; this.width = 40; this.height = 40; this.collected = false; this.animationFrame = 0; this.animationTimer = 0; this.glowIntensity = 0; this.rotation = 0; this.bobOffset = 0; this.scale = 1; this.collectAnimation = 0;
        this.sprite = this.createSprite();
        this.particles = []; this.orbitParticles = [];
        this.createOrbitParticles();
    }
    createSprite() {
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); canvas.width = this.width * 3; canvas.height = this.height * 3;
        if (this.type === 'shield') { this.drawShieldSprite(ctx, canvas.width, canvas.height); } else if (this.type === 'magnet') { this.drawMagnetSprite(ctx, canvas.width, canvas.height); } else if (this.type === 'boost') { this.drawBoostSprite(ctx, canvas.width, canvas.height); }
        return canvas;
    }
    createOrbitParticles() { /* ... Your original drawing code ... */ }
    drawShieldSprite(ctx, width, height) { /* ... Your original drawing code ... */ }
    drawMagnetSprite(ctx, width, height) { /* ... Your original drawing code ... */ }
    drawBoostSprite(ctx, width, height) { /* ... Your original drawing code ... */ }
    update(speed) { /* ... Your original update code ... */ }
    draw(ctx) { /* ... Your original draw code ... */ }
}

// THIS IS THE RESTORED BACKGROUND CLASS
class Background {
    constructor() {
        this.themes = { default: this.createJungleTheme(), ninja: this.createNinjaTheme(), space: this.createSpaceTheme() };
        this.currentTheme = 'default';
        this.groundHeight = GAME_CONFIG.GROUND_HEIGHT;
        this.particles = [];
        this.animationFrame = 0;
    }
    setTheme(theme) { if (this.themes[theme]) { this.currentTheme = theme; } }
    createJungleTheme() { /* ... Your original theme code ... */ return { layers: [], groundPattern: null, skyColors: ['#87CEEB', '#E0F7FA'], groundColors: ['#8B4513', '#A0522D', '#654321'], particles: [] }; }
    createNinjaTheme() { /* ... Your original theme code ... */ return { layers: [], groundPattern: null, skyColors: ['#2C3E50', '#34495E'], groundColors: ['#2C3E50', '#34495E', '#1C2833'], particles: [] }; }
    createSpaceTheme() { /* ... Your original theme code ... */ return { layers: [], groundPattern: null, skyColors: ['#0B0B3B', '#000000'], groundColors: ['#4A235A', '#512E5F', '#5B2C6F'], particles: [], stars: [] }; }
    createJungleSkyLayer() { /* ... Your original drawing code ... */ return { canvas: document.createElement('canvas'), speed: 0.05, x: 0 }; }
    createJungleMountainsLayer() { /* ... Your original drawing code ... */ return { canvas: document.createElement('canvas'), speed: 0.1, x: 0 }; }
    createJungleTreesLayer() { /* ... Your original drawing code ... */ return { canvas: document.createElement('canvas'), speed: 0.3, x: 0 }; }
    createJungleBushesLayer() { /* ... Your original drawing code ... */ return { canvas: document.createElement('canvas'), speed: 0.6, x: 0 }; }
    // ... all the other background drawing helper methods
    update(speed) { /* ... Your original update code ... */ }
    draw(ctx) { /* ... Your original draw code ... */ }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.state = 'start';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('monkeyRunnerHighScore') || '0');
        this.speed = GAME_CONFIG.INITIAL_SPEED;
        this.distance = 0;
        this.monkey = new Monkey('default');
        this.background = new Background();
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.lastTime = 0;
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.sounds = { jump: new Audio('https://assets.codepen.io/21542/howler-push.mp3'), collect: new Audio('https://assets.codepen.io/21542/howler-sfx-levelup.mp3'), powerUp: new Audio('https://assets.codepen.io/21542/howler-sfx-movement.mp3'), crash: new Audio('https://assets.codepen.io/21542/howler-sfx-negative.mp3') };
        this.muted = false;
        this.gameOverlay = document.getElementById('gameOverlay');
        this.startScreen = document.getElementById('startScreen');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.highScoreTopElement = document.getElementById('highScoreTop');
        this.finalScoreElement = document.getElementById('finalScore');
        this.powerFillElement = document.getElementById('powerFill');
        this.crashMessageElement = document.getElementById('crashMessage');
        this.startButton = document.getElementById('startButton');
        this.resumeButton = document.getElementById('resumeButton');
        this.restartButton = document.getElementById('restartButton');
        this.menuButton = document.getElementById('menuButton');
        this.quitButton = document.getElementById('quitButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.muteButton = document.getElementById('muteButton');
        this.characterElements = document.querySelectorAll('.character');
        this.init();
    }
    init() {
        this.highScoreElement.textContent = this.highScore.toString();
        this.highScoreTopElement.textContent = this.highScore.toString();
        this.startButton.addEventListener('click', () => this.startGame());
        this.resumeButton.addEventListener('click', () => this.resumeGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.menuButton.addEventListener('click', () => this.showStartScreen());
        this.quitButton.addEventListener('click', () => this.showStartScreen());
        this.pauseButton.addEventListener('click', () => this.pauseGame());
        this.muteButton.addEventListener('click', () => this.toggleMute());
        this.characterElements.forEach(element => {
            element.addEventListener('click', () => {
                const character = element.getAttribute('data-character');
                this.characterElements.forEach(el => el.setAttribute('data-selected', 'false'));
                element.setAttribute('data-selected', 'true');
                this.monkey.setCharacter(character);
                this.background.setTheme(character);
                this.updateCharacterPreviews(character);
            });
        });
        document.addEventListener('keydown', (e) => {
            if (this.state === 'playing') {
                if (e.code === 'Space' || e.code === 'ArrowUp') {
                    if (this.monkey.jump() && !this.muted) { this.sounds.jump.currentTime = 0; this.sounds.jump.play(); }
                } else if (e.code === 'ArrowDown') { this.monkey.slide(); }
            } else if (this.state === 'start' && (e.code === 'Space' || e.code === 'Enter')) { this.startGame(); } else if (this.state === 'gameOver' && (e.code === 'Space' || e.code === 'Enter')) { this.restartGame(); } else if (e.code === 'Escape') { if (this.state === 'playing') { this.pauseGame(); } else if (this.state === 'paused') { this.resumeGame(); } }
        });
        this.canvas.addEventListener('click', () => { if (this.state === 'playing') { if (this.monkey.jump() && !this.muted) { this.sounds.jump.currentTime = 0; this.sounds.jump.play(); } } });
        this.enhanceCharacterPreviews();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    enhanceCharacterPreviews() { /* ... Your original code ... */ }
    updateCharacterPreviews(selectedCharacter) { /* ... Your original code ... */ }
    startGame() { /* ... Your original code ... */ }
    addStartGameEffects() { /* ... Your original code ... */ }
    pauseGame() { /* ... Your original code ... */ }
    resumeGame() { /* ... Your original code ... */ }
    gameOver(message) { /* ... Your original code ... */ }
    restartGame() { this.startGame(); }
    showStartScreen() { /* ... Your original code ... */ }
    toggleMute() { this.muted = !this.muted; this.muteButton.textContent = this.muted ? '🔇' : '🔊'; }
    updatePowerMeter() { /* ... Your original code ... */ }
    spawnObstacle() { const types = ['log', 'rock', 'bird']; const type = types[Math.floor(Math.random() * types.length)]; this.obstacles.push(new Obstacle(this.width, type)); }
    spawnCollectible() { const types = ['banana', 'coconut']; const type = types[Math.floor(Math.random() * types.length)]; const y = GAME_CONFIG.GROUND_HEIGHT - 100 - Math.random() * 150; this.collectibles.push(new Collectible(this.width, y, type)); }
    spawnPowerUp() { const types = ['shield', 'magnet', 'boost']; const type = types[Math.floor(Math.random() * types.length)]; const y = GAME_CONFIG.GROUND_HEIGHT - 150 - Math.random() * 100; this.powerUps.push(new PowerUp(this.width, y, type)); }
    checkCollisions() { /* ... Your original code ... */ }
    update(dt) { /* ... Your original code ... */ }
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.background.draw(this.ctx);
        this.collectibles.forEach(collectible => collectible.draw(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        this.monkey.draw(this.ctx);
    }
    gameLoop(currentTime) {
        const dt = this.lastTime ? (currentTime - this.lastTime) / (1000 / 60) : 1;
        this.lastTime = currentTime;
        this.update(dt);
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    assets.loadImages(() => {
        const game = new Game();
    });
});
