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
        
        // Character-specific sprites
        this.sprites = {
            default: null,
            ninja: null,
            space: null
        };
        
        this.loadSprites();
    }

    loadSprites() {
        // Create character sprites using canvas
        const createCharacterSprite = (colors, accessories) => {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 120;
            const ctx = canvas.getContext('2d');
            
            // Draw base character
            ctx.save();
            
            // Body
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(50, 70, 20, 25, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Head
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(50, 40, 18, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Face
            ctx.fillStyle = colors.face;
            ctx.beginPath();
            ctx.ellipse(50, 42, 12, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(44, 38, 4, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(56, 38, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.ellipse(44, 38, 2, 2.5, 0, 0, Math.PI * 2);
            ctx.ellipse(56, 38, 2, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Mouth
            ctx.fillStyle = colors.mouth || '#A52A2A';
            ctx.beginPath();
            ctx.ellipse(50, 48, 6, 4, 0, 0, Math.PI);
            ctx.fill();
            
            // Ears
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(36, 28, 6, 8, -0.3, 0, Math.PI * 2);
            ctx.ellipse(64, 28, 6, 8, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner ears
            ctx.fillStyle = colors.innerEar || colors.face;
            ctx.beginPath();
            ctx.ellipse(36, 28, 3, 5, -0.3, 0, Math.PI * 2);
            ctx.ellipse(64, 28, 3, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Arms
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(30, 70, 6, 15, -0.3, 0, Math.PI * 2);
            ctx.ellipse(70, 70, 6, 15, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Legs
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.ellipse(40, 95, 7, 15, 0, 0, Math.PI * 2);
            ctx.ellipse(60, 95, 7, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Tail
            ctx.fillStyle = colors.body;
            ctx.beginPath();
            ctx.moveTo(50, 85);
            ctx.quadraticCurveTo(75, 85, 80, 65);
            ctx.quadraticCurveTo(82, 60, 80, 55);
            ctx.quadraticCurveTo(78, 50, 75, 55);
            ctx.quadraticCurveTo(70, 70, 50, 75);
            ctx.fill();
            
            // Character-specific accessories
            if (accessories) {
                accessories(ctx);
            }
            
            ctx.restore();
            return canvas;
        };
        
        // Create default jungle monkey
        this.sprites.default = createCharacterSprite(
            {
                body: '#D2691E',
                face: '#F4A460',
                innerEar: '#FFA07A',
                mouth: '#8B4513'
            },
            (ctx) => {
                // Jungle accessories - leaves on head
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.ellipse(50, 22, 10, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(40, 25);
                ctx.quadraticCurveTo(35, 15, 30, 20);
                ctx.quadraticCurveTo(35, 25, 40, 25);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(60, 25);
                ctx.quadraticCurveTo(65, 15, 70, 20);
                ctx.quadraticCurveTo(65, 25, 60, 25);
                ctx.fill();
                
                // Banana in hand
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.ellipse(30, 85, 5, 10, -0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        );
        
        // Create ninja monkey
        this.sprites.ninja = createCharacterSprite(
            {
                body: '#2F4F4F',
                face: '#696969',
                innerEar: '#A9A9A9',
                mouth: '#4B0082'
            },
            (ctx) => {
                // Ninja mask
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.ellipse(50, 38, 18, 12, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Eye holes
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.ellipse(44, 38, 4, 3, 0, 0, Math.PI * 2);
                ctx.ellipse(56, 38, 4, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Ninja headband
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(32, 28, 36, 6);
                
                // Headband ties
                ctx.beginPath();
                ctx.moveTo(68, 31);
                ctx.quadraticCurveTo(75, 35, 78, 45);
                ctx.lineTo(76, 45);
                ctx.quadraticCurveTo(73, 35, 68, 33);
                ctx.fill();
                
                // Ninja star
                ctx.fillStyle = '#C0C0C0';
                ctx.save();
                ctx.translate(30, 85);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-5, -5, 10, 10);
                ctx.restore();
            }
        );
        
        // Create space monkey
        this.sprites.space = createCharacterSprite(
            {
                body: '#4169E1',
                face: '#87CEEB',
                innerEar: '#ADD8E6',
                mouth: '#000080'
            },
            (ctx) => {
                // Space helmet (transparent dome)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.ellipse(50, 40, 22, 24, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Helmet connector
                ctx.fillStyle = '#C0C0C0';
                ctx.beginPath();
                ctx.ellipse(50, 64, 10, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Stars around
                const stars = [
                    [30, 25], [70, 30], [25, 50], [75, 55], [35, 15]
                ];
                
                stars.forEach(([x, y]) => {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Star glow
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 5);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                // Space gadget in hand
                ctx.fillStyle = '#C0C0C0';
                ctx.beginPath();
                ctx.ellipse(30, 85, 6, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#00BFFF';
                ctx.beginPath();
                ctx.arc(30, 85, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        );
    }
    
    setCharacter(character) {
        this.character = character;
    }

    jump() {
        if (this.onGround) {
            this.velocityY = -GAME_CONFIG.JUMP_POWER;
            this.onGround = false;
            this.canDoubleJump = true;
            return true;
        } else if (this.canDoubleJump) {
            this.velocityY = -GAME_CONFIG.DOUBLE_JUMP_POWER;
            this.canDoubleJump = false;
            return true;
        }
        return false;
    }

    slide() {
        if (this.onGround && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = GAME_CONFIG.SLIDE_DURATION;
        }
    }

    activatePowerUp(type) {
        this.powerUps[type] = true;
        this.powerUpTimers[type] = type === 'shield' ? 300 : type === 'magnet' ? 400 : 200;
    }

    makeInvincible() {
        this.isInvincible = true;
        this.invincibilityTimer = GAME_CONFIG.INVINCIBILITY_DURATION;
    }

    update(dt) {
        // Physics
        if (!this.onGround) {
            this.velocityY += GAME_CONFIG.GRAVITY * dt;
            this.y += this.velocityY * dt;
        }

        // Ground collision
        if (this.y >= GAME_CONFIG.GROUND_HEIGHT - this.height) {
            this.y = GAME_CONFIG.GROUND_HEIGHT - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }

        // Sliding
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }

        // Invincibility
        if (this.isInvincible) {
            this.invincibilityTimer -= dt;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
            }
        }

        // Power-ups
        Object.keys(this.powerUpTimers).forEach(key => {
            if (this.powerUps[key]) {
                this.powerUpTimers[key] -= dt;
                if (this.powerUpTimers[key] <= 0) {
                    this.powerUps[key] = false;
                }
            }
        });

        // Animation
        this.animationTimer += dt;
        if (this.animationTimer > 100) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Update blink animation
        this.blinkTimer++;
        if (this.blinkTimer > 120) {
            this.isBlinking = true;
            if (this.blinkTimer > 125) {
                this.isBlinking = false;
                this.blinkTimer = Math.floor(Math.random() * 60);
            }
        }
        
        // Update tail animation
        this.tailWag = Math.sin(this.animationFrame * 0.2) * 5;
        
        // Invincibility flashing
        if (this.isInvincible && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw character using sprite if available
        if (this.sprites[this.character]) {
            const sprite = this.sprites[this.character];
            const scale = 0.6;
            const spriteWidth = sprite.width * scale;
            const spriteHeight = sprite.height * scale;
            
            // Calculate position adjustments based on state
            let yOffset = 0;
            if (!this.onGround) {
                // In air pose
                yOffset = -5;
            } else if (this.isSliding) {
                // Sliding pose - draw differently
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height - 15);
                ctx.rotate(Math.PI / 2.5); // Rotate for sliding pose
                ctx.drawImage(
                    sprite, 
                    -spriteWidth/2, 
                    -spriteHeight/2, 
                    spriteWidth, 
                    spriteHeight
                );
                ctx.restore();
                
                // Skip normal drawing for sliding
                ctx.restore();
                
                // Draw shield effect if active
                this.drawPowerUpEffects(ctx);
                
                return;
            }
            
            // Running animation
            const bounceOffset = this.onGround ? Math.abs(Math.sin(this.animationFrame * 0.3) * 3) : 0;
            
            // Draw the sprite
            ctx.drawImage(
                sprite, 
                this.x - 5, 
                this.y - 15 - bounceOffset + yOffset, 
                spriteWidth, 
                spriteHeight
            );
            
            // Draw power-up effects
            this.drawPowerUpEffects(ctx);
            
            ctx.restore();
            return;
        }
        
        // Fallback drawing if sprites aren't loaded
        const colors = {
            default: { body: '#D2691E', belly: '#F4A460', face: '#FFA07A' },
            ninja: { body: '#2F4F4F', belly: '#696969', face: '#A9A9A9' },
            space: { body: '#4169E1', belly: '#87CEEB', face: '#ADD8E6' }
        };
        
        const color = colors[this.character] || colors.default;
        
        // Body
        ctx.fillStyle = color.body;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + 35, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = color.body;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Face
        ctx.fillStyle = color.face;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + 17, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        if (!this.isBlinking) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2 - 5, this.y + 14, 3, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(this.x + this.width/2 + 5, this.y + 14, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2 - 5, this.y + 14, 1.5, 2, 0, 0, Math.PI * 2);
            ctx.ellipse(this.x + this.width/2 + 5, this.y + 14, 1.5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Blinking eyes
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2 - 8, this.y + 14);
            ctx.lineTo(this.x + this.width/2 - 2, this.y + 14);
            ctx.moveTo(this.x + this.width/2 + 2, this.y + 14);
            ctx.lineTo(this.x + this.width/2 + 8, this.y + 14);
            ctx.stroke();
        }
        
        // Mouth
        ctx.fillStyle = '#A52A2A';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + 22, 5, 3, 0, 0, Math.PI);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = color.body;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2 - 12, this.y + 5, 5, 7, -0.3, 0, Math.PI * 2);
        ctx.ellipse(this.x + this.width/2 + 12, this.y + 5, 5, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ears
        ctx.fillStyle = color.face;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2 - 12, this.y + 5, 3, 4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(this.x + this.width/2 + 12, this.y + 5, 3, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms (animated)
        ctx.fillStyle = color.body;
        const armOffset = Math.sin(this.animationFrame * 0.5) * 3;
        
        // Left arm
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y + 35 + armOffset, 5, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Right arm
        ctx.beginPath();
        ctx.ellipse(this.x + this.width - 10, this.y + 35 - armOffset, 5, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs (animated when running)
        if (this.onGround && !this.isSliding) {
            const legOffset = Math.sin(this.animationFrame * 0.8) * 4;
            
            // Left leg
            ctx.fillStyle = color.body;
            ctx.beginPath();
            ctx.ellipse(this.x + 15, this.y + this.height - 10 + legOffset, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Right leg
            ctx.beginPath();
            ctx.ellipse(this.x + this.width - 15, this.y + this.height - 10 - legOffset, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.isSliding) {
            // Sliding pose
            ctx.fillStyle = color.body;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, this.y + this.height - 15, 20, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Jumping pose - legs together
            ctx.fillStyle = color.body;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2 - 7, this.y + this.height - 15, 5, 10, -0.2, 0, Math.PI * 2);
            ctx.ellipse(this.x + this.width/2 + 7, this.y + this.height - 15, 5, 10, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Tail
        ctx.fillStyle = color.body;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + 45);
        ctx.quadraticCurveTo(
            this.x + this.width/2 + 15 + this.tailWag, 
            this.y + 45, 
            this.x + this.width/2 + 20 + this.tailWag, 
            this.y + 35
        );
        ctx.quadraticCurveTo(
            this.x + this.width/2 + 22 + this.tailWag, 
            this.y + 30, 
            this.x + this.width/2 + 20 + this.tailWag, 
            this.y + 25
        );
        ctx.quadraticCurveTo(
            this.x + this.width/2 + 18 + this.tailWag, 
            this.y + 20, 
            this.x + this.width/2 + 15 + this.tailWag, 
            this.y + 25
        );
        ctx.quadraticCurveTo(
            this.x + this.width/2 + 10 + this.tailWag/2, 
            this.y + 40, 
            this.x + this.width/2, 
            this.y + 40
        );
        ctx.fill();
        
        // Draw power-up effects
        this.drawPowerUpEffects(ctx);
        
        ctx.restore();
    }
    
    drawPowerUpEffects(ctx) {
        // Shield effect
        if (this.powerUps.shield) {
            const shieldRadius = this.width/2 + 15;
            const gradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.height/2, shieldRadius - 10,
                this.x + this.width/2, this.y + this.height/2, shieldRadius
            );
            gradient.addColorStop(0, 'rgba(52, 152, 219, 0.1)');
            gradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.3)');
            gradient.addColorStop(1, 'rgba(52, 152, 219, 0.1)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, shieldRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Shield border
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Shield sparkles
            for (let i = 0; i < 5; i++) {
                const angle = (this.animationFrame * 0.05) + (i * Math.PI * 2 / 5);
                const sparkleX = this.x + this.width/2 + Math.cos(angle) * shieldRadius;
                const sparkleY = this.y + this.height/2 + Math.sin(angle) * shieldRadius;
                
                const sparkleSize = 2 + Math.sin(this.animationFrame * 0.2 + i) * 2;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Magnet effect
        if (this.powerUps.magnet) {
            const magnetRadius = 80;
            const gradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.height/2, 20,
                this.x + this.width/2, this.y + this.height/2, magnetRadius
            );
            gradient.addColorStop(0, 'rgba(155, 89, 182, 0)');
            gradient.addColorStop(0.7, 'rgba(155, 89, 182, 0.1)');
            gradient.addColorStop(1, 'rgba(155, 89, 182, 0.2)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, magnetRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Magnetic field lines
            ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < 8; i++) {
                const angle = (this.animationFrame * 0.02) + (i * Math.PI / 4);
                
                ctx.beginPath();
                ctx.moveTo(
                    this.x + this.width/2 + Math.cos(angle) * 20,
                    this.y + this.height/2 + Math.sin(angle) * 20
                );
                ctx.lineTo(
                    this.x + this.width/2 + Math.cos(angle) * magnetRadius,
                    this.y + this.height/2 + Math.sin(angle) * magnetRadius
                );
                ctx.stroke();
            }
        }
        
        // Boost effect
        if (this.powerUps.boost) {
            // Flame trail
            const flameColors = ['#e74c3c', '#e67e22', '#f1c40f'];
            
            for (let i = 0; i < 15; i++) {
                const size = 10 - i * 0.5;
                const alpha = 1 - (i / 15);
                const offsetX = -i * 3 - 10;
                const offsetY = Math.sin(this.animationFrame * 0.3 + i * 0.5) * 5;
                
                const colorIndex = Math.floor(i / 5) % flameColors.length;
                
                ctx.fillStyle = flameColors[colorIndex] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                ctx.beginPath();
                ctx.ellipse(
                    this.x + offsetX, 
                    this.y + this.height/2 + offsetY, 
                    size, size * 0.6, 
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            }
            
            // Speed lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 5; i++) {
                const y = this.y + 10 + i * 10;
                const length = 20 + Math.random() * 30;
                const x = this.x - 20 - Math.random() * 40;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - length, y);
                ctx.stroke();
            }
        }
    }
}

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
        
        // Bird specific properties
        if (type === 'bird') {
            this.wingFlap = 0;
            this.flapDirection = 1;
            this.birdColor = Math.random() > 0.5 ? 'red' : Math.random() > 0.5 ? 'blue' : 'yellow';
            this.flyPattern = Math.floor(Math.random() * 3); // 0: straight, 1: sine wave, 2: bobbing
        }
        
        // Rock specific properties
        if (type === 'rock') {
            this.rockType = Math.floor(Math.random() * 3); // 0: round, 1: jagged, 2: flat
            this.rockColor = Math.random() > 0.7 ? 'gray' : Math.random() > 0.5 ? 'brown' : 'mossy';
        }
        
        // Log specific properties
        if (type === 'log') {
            this.logRotation = Math.random() * 0.3 - 0.15;
            this.barkDetail = Math.floor(Math.random() * 5) + 3;
            this.hasMushrooms = Math.random() > 0.7;
        }
        
        // Create sprite
        this.sprite = this.createSprite();
    }

    createSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width * 2;
        canvas.height = this.height * 2;
        
        if (this.type === 'log') {
            this.drawLogSprite(ctx, canvas.width, canvas.height);
        } else if (this.type === 'rock') {
            this.drawRockSprite(ctx, canvas.width, canvas.height);
        } else if (this.type === 'bird') {
            this.drawBirdSprite(ctx, canvas.width, canvas.height);
        }
        
        return canvas;
    }
    
    drawLogSprite(ctx, width, height) {
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.rotate(this.logRotation);
        
        // Log body
        const gradient = ctx.createLinearGradient(-width/2, 0, width/2, 0);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.3, '#A0522D');
        gradient.addColorStop(0.7, '#A0522D');
        gradient.addColorStop(1, '#8B4513');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-width/2 + 10, -height/2 + 10, width - 20, height - 20, 5);
        ctx.fill();
        
        // Log ends (rings)
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(-width/2 + 10, 0, 5, height/2 - 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(width/2 - 10, 0, 5, height/2 - 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ring details
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1;
        
        // Left ring
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.ellipse(-width/2 + 10, 0, i * 3, (height/2 - 15) * i/3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Right ring
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.ellipse(width/2 - 10, 0, i * 3, (height/2 - 15) * i/3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Bark texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < this.barkDetail; i++) {
            const x1 = -width/2 + 20 + Math.random() * (width - 40);
            const y1 = -height/2 + 10;
            const x2 = x1 + (Math.random() - 0.5) * 20;
            const y2 = height/2 - 10;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Bark knots
        for (let i = 0; i < 2; i++) {
            const x = (Math.random() - 0.5) * (width - 40);
            const y = (Math.random() - 0.5) * (height - 30);
            const size = 5 + Math.random() * 10;
            
            // Knot base
            const knotGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            knotGradient.addColorStop(0, '#A0522D');
            knotGradient.addColorStop(1, '#8B4513');
            
            ctx.fillStyle = knotGradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Knot rings
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            
            for (let j = 1; j <= 3; j++) {
                ctx.beginPath();
                ctx.arc(x, y, size * j/3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Mushrooms (optional)
        if (this.hasMushrooms) {
            for (let i = 0; i < 3; i++) {
                const x = (Math.random() - 0.5) * (width - 40);
                const y = height/2 - 15 - Math.random() * 10;
                const size = 5 + Math.random() * 8;
                
                // Mushroom stem
                ctx.fillStyle = '#F5F5DC';
                ctx.beginPath();
                ctx.roundRect(x - size/4, y - size/2, size/2, size/2, 2);
                ctx.fill();
                
                // Mushroom cap
                ctx.fillStyle = Math.random() > 0.5 ? '#FF4500' : '#8B0000';
                ctx.beginPath();
                ctx.ellipse(x, y - size/2, size, size/2, 0, 0, Math.PI);
                ctx.fill();
                
                // Mushroom spots
                if (Math.random() > 0.5) {
                    ctx.fillStyle = '#FFFFFF';
                    for (let j = 0; j < 3; j++) {
                        const spotX = x + (Math.random() - 0.5) * size;
                        const spotY = y - size/2 - Math.random() * (size/2);
                        const spotSize = 1 + Math.random() * 2;
                        
                        ctx.beginPath();
                        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
        
        ctx.restore();
    }
    
    drawRockSprite(ctx, width, height) {
        ctx.save();
        
        // Base colors based on rock type
        let baseColor, highlightColor, shadowColor;
        
        if (this.rockColor === 'gray') {
            baseColor = '#696969';
            highlightColor = '#A9A9A9';
            shadowColor = '#2F4F4F';
        } else if (this.rockColor === 'brown') {
            baseColor = '#8B4513';
            highlightColor = '#CD853F';
            shadowColor = '#654321';
        } else { // mossy
            baseColor = '#696969';
            highlightColor = '#A9A9A9';
            shadowColor = '#2F4F4F';
        }
        
        // Rock shape based on type
        if (this.rockType === 0) { // Round rock
            // Main rock body
            const gradient = ctx.createRadialGradient(
                width/2, height/2, 0,
                width/2, height/2, width/2
            );
            gradient.addColorStop(0, highlightColor);
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, shadowColor);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(width/2, height/2, width/2 - 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlights
            ctx.fillStyle = highlightColor;
            ctx.beginPath();
            ctx.ellipse(
                width/3, height/3,
                width/6, height/6,
                0, 0, Math.PI * 2
            );
            ctx.fill();
            
        } else if (this.rockType === 1) { // Jagged rock
            // Create jagged path
            ctx.beginPath();
            ctx.moveTo(width/2, 10);
            
            const points = 8;
            for (let i = 1; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radius = (width/2 - 10) * (0.8 + Math.random() * 0.4);
                const x = width/2 + Math.cos(angle) * radius;
                const y = height/2 + Math.sin(angle) * radius;
                
                ctx.lineTo(x, y);
            }
            
            ctx.closePath();
            
            // Fill with gradient
            const gradient = ctx.createRadialGradient(
                width/2, height/2, 0,
                width/2, height/2, width/2
            );
            gradient.addColorStop(0, highlightColor);
            gradient.addColorStop(0.6, baseColor);
            gradient.addColorStop(1, shadowColor);
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Cracks
            ctx.strokeStyle = shadowColor;
            ctx.lineWidth = 1;
            
            for (let i = 0; i < 3; i++) {
                const startX = width/2;
                const startY = height/2;
                const endX = width/2 + (Math.random() - 0.5) * width;
                const endY = height/2 + (Math.random() - 0.5) * height;
                const controlX = (startX + endX) / 2 + (Math.random() - 0.5) * 20;
                const controlY = (startY + endY) / 2 + (Math.random() - 0.5) * 20;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(controlX, controlY, endX, endY);
                ctx.stroke();
            }
            
        } else { // Flat rock
            // Main rock body
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, highlightColor);
            gradient.addColorStop(0.5, baseColor);
            gradient.addColorStop(1, shadowColor);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(width/2, height/2, width/2 - 10, height/4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Surface details
            ctx.strokeStyle = shadowColor;
            ctx.lineWidth = 1;
            
            for (let i = 0; i < 5; i++) {
                const y = height/2 - height/8 + Math.random() * (height/4);
                
                ctx.beginPath();
                ctx.moveTo(20, y);
                ctx.lineTo(width - 20, y + (Math.random() - 0.5) * 10);
                ctx.stroke();
            }
        }
        
        // Add moss if mossy
        if (this.rockColor === 'mossy') {
            ctx.fillStyle = '#556B2F';
            
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = 2 + Math.random() * 5;
                
                if (y > height/2) { // More moss on bottom half
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Moss patches
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * width;
                const y = height - 20 - Math.random() * 20;
                const sizeX = 10 + Math.random() * 20;
                const sizeY = 5 + Math.random() * 10;
                
                ctx.beginPath();
                ctx.ellipse(x, y, sizeX, sizeY, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    drawBirdSprite(ctx, width, height) {
        ctx.save();
        
        // Bird colors based on type
        let bodyColor, wingColor, beakColor;
        
        if (this.birdColor === 'red') {
            bodyColor = '#FF6347';
            wingColor = '#FF4500';
            beakColor = '#FFA500';
        } else if (this.birdColor === 'blue') {
            bodyColor = '#4682B4';
            wingColor = '#1E90FF';
            beakColor = '#FFD700';
        } else { // yellow
            bodyColor = '#FFD700';
            wingColor = '#FFA500';
            beakColor = '#FF8C00';
        }
        
        // Draw bird body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(width/2, height/2, width/4, height/4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw head
        ctx.beginPath();
        ctx.arc(width/2 + width/4, height/2 - height/8, width/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(width/2 + width/4 + width/12, height/2 - height/8 - height/16, width/16, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(width/2 + width/4 + width/12, height/2 - height/8 - height/16, width/32, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = beakColor;
        ctx.beginPath();
        ctx.moveTo(width/2 + width/4 + width/6, height/2 - height/8);
        ctx.lineTo(width/2 + width/4 + width/3, height/2 - height/8 - height/16);
        ctx.lineTo(width/2 + width/4 + width/3, height/2 - height/8 + height/16);
        ctx.closePath();
        ctx.fill();
        
        // Draw tail
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(width/2 - width/4, height/2);
        ctx.lineTo(width/2 - width/2, height/2 - height/8);
        ctx.lineTo(width/2 - width/2, height/2 + height/8);
        ctx.closePath();
        ctx.fill();
        
        // Draw wings (will be animated in the draw method)
        ctx.fillStyle = wingColor;
        
        // Top wing
        ctx.beginPath();
        ctx.ellipse(width/2, height/2 - height/4, width/3, height/8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom wing
        ctx.beginPath();
        ctx.ellipse(width/2, height/2 + height/4, width/3, height/8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Feather details
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 1;
        
        // Top wing feathers
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(width/2, height/2 - height/4);
            ctx.lineTo(width/2 - width/6 + i * width/12, height/2 - height/2);
            ctx.stroke();
        }
        
        // Bottom wing feathers
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(width/2, height/2 + height/4);
            ctx.lineTo(width/2 - width/6 + i * width/12, height/2 + height/2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    update(speed) {
        this.x -= speed;
        this.animationTimer += speed;
        
        if (this.animationTimer > 5) {
            this.animationFrame = (this.animationFrame + 1) % 8;
            this.animationTimer = 0;
            
            // Bird wing flap animation
            if (this.type === 'bird') {
                this.wingFlap += 0.2 * this.flapDirection;
                
                if (this.wingFlap > 1) {
                    this.flapDirection = -1;
                } else if (this.wingFlap < -1) {
                    this.flapDirection = 1;
                }
                
                // Bird movement patterns
                if (this.flyPattern === 1) { // Sine wave
                    this.y += Math.sin(this.x / 50) * 2;
                } else if (this.flyPattern === 2) { // Bobbing
                    this.y += (Math.random() - 0.5) * 3;
                }
            }
            
            // Log rotation
            if (this.type === 'log') {
                this.rotation += 0.01;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        if (this.sprite) {
            if (this.type === 'bird') {
                // Draw bird with wing flap animation
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                
                // Draw body
                ctx.drawImage(
                    this.sprite,
                    -this.width,
                    -this.height,
                    this.width * 2,
                    this.height * 2
                );
                
                // Draw animated wings
                const wingColor = this.birdColor === 'red' ? '#FF4500' : 
                                 this.birdColor === 'blue' ? '#1E90FF' : '#FFA500';
                
                ctx.fillStyle = wingColor;
                
                // Top wing with flap animation
                ctx.save();
                ctx.rotate(this.wingFlap * 0.5);
                ctx.beginPath();
                ctx.ellipse(0, -this.height/2, this.width/2, this.height/4, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                // Bottom wing with flap animation
                ctx.save();
                ctx.rotate(-this.wingFlap * 0.5);
                ctx.beginPath();
                ctx.ellipse(0, this.height/2, this.width/2, this.height/4, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                ctx.restore();
            } else if (this.type === 'log') {
                // Draw log with slight rotation
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.logRotation + Math.sin(this.rotation) * 0.05);
                ctx.drawImage(
                    this.sprite,
                    -this.width,
                    -this.height,
                    this.width * 2,
                    this.height * 2
                );
            } else {
                // Draw rock normally
                ctx.drawImage(
                    this.sprite,
                    this.x - this.width/2,
                    this.y - this.height/2,
                    this.width * 2,
                    this.height * 2
                );
            }
        } else {
            // Fallback drawing if sprite isn't loaded
            if (this.type === 'log') {
                // Draw log
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Log texture
                ctx.fillStyle = '#A0522D';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(this.x + 5, this.y + i * 15 + 5, this.width - 10, 3);
                }
                
                // Log rings
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y, 20, 0, Math.PI * 2);
                ctx.stroke();
                
            } else if (this.type === 'rock') {
                // Draw rock
                ctx.fillStyle = '#696969';
                ctx.beginPath();
                ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Rock highlights
                ctx.fillStyle = '#A9A9A9';
                ctx.beginPath();
                ctx.ellipse(this.x + this.width/3, this.y + this.height/3, this.width/6, this.height/6, 0, 0, Math.PI * 2);
                ctx.fill();
                
            } else if (this.type === 'bird') {
                // Draw bird
                const wingFlap = Math.sin(this.animationFrame * 2) * 5;
                
                // Body
                ctx.fillStyle = '#FF6347';
                ctx.beginPath();
                ctx.ellipse(this.x + this.width/2, this.y + this.height/2, 15, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Wings
                ctx.fillStyle = '#FF4500';
                ctx.beginPath();
                ctx.ellipse(this.x + 10, this.y + this.height/2 + wingFlap, 12, 6, -0.3, 0, Math.PI * 2);
                ctx.ellipse(this.x + 30, this.y + this.height/2 - wingFlap, 12, 6, 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                // Beak
                ctx.fillStyle = '#FFA500';
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2 + 10, this.y + this.height/2);
                ctx.lineTo(this.x + this.width/2 + 18, this.y + this.height/2 - 3);
                ctx.lineTo(this.x + this.width/2 + 18, this.y + this.height/2 + 3);
                ctx.fill();
                
                // Eye
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x + this.width/2 + 5, this.y + this.height/2 - 3, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(this.x + this.width/2 + 5, this.y + this.height/2 - 3, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
}

class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 35;
        this.height = 35;
        this.collected = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.bobOffset = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.rotation = Math.random() * Math.PI * 2;
        this.scale = 1;
        this.collectAnimation = 0;
        this.glowIntensity = 0;
        
        // Create sprite
        this.sprite = this.createSprite();
        
        // Particle effects
        this.particles = [];
    }
    
    createSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width * 3;
        canvas.height = this.height * 3;
        
        if (this.type === 'banana') {
            this.drawBananaSprite(ctx, canvas.width, canvas.height);
        } else if (this.type === 'coconut') {
            this.drawCoconutSprite(ctx, canvas.width, canvas.height);
        }
        
        return canvas;
    }
    
  drawBananaSprite(ctx, width, height) {
        ctx.save();
        
        // This map of letters defines the pixelated banana shape, inspired by your images.
        // Each character represents a pixel, 'Y' for yellow, 'B' for brown, 'D' for dark yellow.
        const bananaMap = [
            "    B     ",
            "   BYB    ",
            "  YDBYB   ",
            " YDDYBB   ",
            "YDDDYBB   ",
            "YDDDDYBB  ",
            " YDDDDYBB ",
            "  YDDDDBB ",
            "   YDDDY  ",
            "    YYY   ",
            "          " // This extra line helps give it a bit more length
        ];

        const colors = {
            'Y': '#FFD700', // Bright Banana Yellow
            'D': '#DAA520', // Darker Yellow for shading/dimension
            'B': '#8B4513'  // Brown for outline and stem
        };

        const pixelSize = 4; // Size of each individual pixel block
        
        // Calculate starting position to center the banana
        const mapWidth = bananaMap[0].length * pixelSize;
        const mapHeight = bananaMap.length * pixelSize;
        const startX = (width - mapWidth) / 2;
        const startY = (height - mapHeight) / 2;

        ctx.translate(startX, startY); // Move canvas to the calculated starting position

        // Loop through the banana map and draw each pixel
        for (let y = 0; y < bananaMap.length; y++) {
            for (let x = 0; x < bananaMap[y].length; x++) {
                const pixelChar = bananaMap[y][x];
                if (pixelChar !== ' ') { // Only draw if it's not a blank space
                    ctx.fillStyle = colors[pixelChar];
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        ctx.restore();
    }
    
    drawCoconutSprite(ctx, width, height) {
        ctx.save();
        ctx.translate(width/2, height/2);
        
        // Glow effect
        const glowGradient = ctx.createRadialGradient(0, 0, 15, 0, 0, 40);
        glowGradient.addColorStop(0, 'rgba(139, 69, 19, 0.2)');
        glowGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Coconut shell
        const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 25);
        gradient.addColorStop(0, '#A0522D');
        gradient.addColorStop(0.7, '#8B4513');
        gradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Coconut hair/fibers
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const length = 5 + Math.random() * 5;
            
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 25, Math.sin(angle) * 25);
            ctx.lineTo(Math.cos(angle) * (25 + length), Math.sin(angle) * (25 + length));
            ctx.stroke();
        }
        
        // Coconut face
        ctx.fillStyle = '#3E2723';
        
        // Eyes
        ctx.beginPath();
        ctx.ellipse(-8, -5, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(8, -5, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.beginPath();
        ctx.ellipse(0, 10, 10, 5, 0, 0, Math.PI);
        ctx.fill();
        
        // Coconut texture spots
        ctx.fillStyle = '#5D4037';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 15 + Math.random() * 5;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const size = 2 + Math.random() * 3;
            
            // Skip spots where the face is
            if ((x > -15 && x < 15) && (y > -15 && y < 15)) continue;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Coconut shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(-10, -10, 5, 10, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    update(speed) {
        this.x -= speed;
        this.animationTimer += speed;
        this.bobOffset = Math.sin(this.animationTimer * 0.1) * 3;
        this.rotation += this.rotationSpeed;
        this.glowIntensity = Math.sin(this.animationTimer * 0.05) * 0.5 + 0.5;
        
        if (this.animationTimer > 10) {
            this.animationFrame = (this.animationFrame + 1) % 8;
            this.animationTimer = 0;
        }
        
        // Collection animation
        if (this.collected) {
            this.collectAnimation += 0.2;
            this.scale = Math.max(0, 1 - this.collectAnimation / 5);
            
            // Create collection particles
            if (this.collectAnimation < 1) {
                for (let i = 0; i < 2; i++) {
                    this.particles.push({
                        x: 0,
                        y: 0,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        size: 2 + Math.random() * 3,
                        color: this.type === 'banana' ? '#FFD700' : '#8B4513',
                        life: 20 + Math.random() * 20,
                        alpha: 1
                    });
                }
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = p.life / 40;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (this.collected && this.scale <= 0) return;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2 + this.bobOffset);
        
        // Draw collection particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw glow effect
        if (!this.collected) {
            const glowColor = this.type === 'banana' ? 
                `rgba(255, 215, 0, ${0.1 + this.glowIntensity * 0.1})` : 
                `rgba(139, 69, 19, ${0.1 + this.glowIntensity * 0.1})`;
                
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.arc(0, 0, this.width * (1 + this.glowIntensity * 0.3), 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw sprite with rotation and scale
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        if (this.sprite) {
            ctx.drawImage(
                this.sprite, 
                -this.width * 1.5, 
                -this.height * 1.5, 
                this.width * 3, 
                this.height * 3
            );
        } else {
            // Fallback drawing if sprite isn't loaded
            if (this.type === 'banana') {
                // Draw banana
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // Banana curve
                ctx.fillStyle = '#FFA500';
                ctx.beginPath();
                ctx.ellipse(-3, -8, 8, 12, 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                // Banana spots
                ctx.fillStyle = '#FF8C00';
                ctx.beginPath();
                ctx.arc(-2, -3, 2, 0, Math.PI * 2);
                ctx.arc(3, 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
                
            } else if (this.type === 'coconut') {
                // Draw coconut
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // Coconut texture
                ctx.fillStyle = '#A0522D';
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * 8;
                    const y = Math.sin(angle) * 8;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Coconut eyes
                ctx.fillStyle = '#654321';
                ctx.beginPath();
                ctx.arc(-4, -4, 2, 0, Math.PI * 2);
                ctx.arc(4, -4, 2, 0, Math.PI * 2);
                ctx.arc(0, 2, 3, 0, Math.PI);
                ctx.fill();
            }
        }
        
        // Collection sparkle effect
        if (this.collected) {
            ctx.strokeStyle = this.type === 'banana' ? '#FFFF00' : '#FFFFFF';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + this.collectAnimation;
                const innerRadius = this.width * (0.5 + this.collectAnimation);
                const outerRadius = this.width * (1 + this.collectAnimation);
                
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
                ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
                ctx.stroke();
            }
        }
        
        ctx.restore();
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
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.glowIntensity = 0;
        this.rotation = 0;
        this.bobOffset = 0;
        this.scale = 1;
        this.collectAnimation = 0;
        
        // Create sprite
        this.sprite = this.createSprite();
        
        // Particle effects
        this.particles = [];
        this.orbitParticles = [];
        
        // Create orbit particles
        this.createOrbitParticles();
    }
    
    createSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width * 3;
        canvas.height = this.height * 3;
        
        if (this.type === 'shield') {
            this.drawShieldSprite(ctx, canvas.width, canvas.height);
        } else if (this.type === 'magnet') {
            this.drawMagnetSprite(ctx, canvas.width, canvas.height);
        } else if (this.type === 'boost') {
            this.drawBoostSprite(ctx, canvas.width, canvas.height);
        }
        
        return canvas;
    }
    
    createOrbitParticles() {
        const count = this.type === 'shield' ? 5 : 
                     this.type === 'magnet' ? 6 : 4;
                     
        const color = this.type === 'shield' ? '#3498db' : 
                     this.type === 'magnet' ? '#9b59b6' : '#e74c3c';
                     
        for (let i = 0; i < count; i++) {
            this.orbitParticles.push({
                angle: (i / count) * Math.PI * 2,
                distance: 30 + Math.random() * 10,
                speed: 0.02 + Math.random() * 0.02,
                size: 3 + Math.random() * 3,
                color: color,
                alpha: 0.7 + Math.random() * 0.3
            });
        }
    }
    
    drawShieldSprite(ctx, width, height) {
        ctx.save();
        ctx.translate(width/2, height/2);
        
        // Shield base
        const gradient = ctx.createLinearGradient(0, -30, 0, 30);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(0.5, '#2980b9');
        gradient.addColorStop(1, '#3498db');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-20, -10);
        ctx.lineTo(-20, 20);
        ctx.lineTo(0, 30);
        ctx.lineTo(20, 20);
        ctx.lineTo(20, -10);
        ctx.closePath();
        ctx.fill();
        
        // Shield border
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Shield inner design
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-12, -5);
        ctx.lineTo(-12, 12);
        ctx.lineTo(0, 20);
        ctx.lineTo(12, 12);
        ctx.lineTo(12, -5);
        ctx.closePath();
        ctx.fill();
        
        // Shield emblem
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-5, 5);
        ctx.lineTo(0, 10);
        ctx.lineTo(5, 5);
        ctx.lineTo(5, -5);
        ctx.closePath();
        ctx.fill();
        
        // Shield highlights
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-15, -5);
        ctx.lineTo(15, -5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(10, 10);
        ctx.stroke();
        
        // Shield glow
        const glowGradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
        glowGradient.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
        glowGradient.addColorStop(1, 'rgba(52, 152, 219, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawMagnetSprite(ctx, width, height) {
        ctx.save();
        ctx.translate(width/2, height/2);
        
        // Magnet base
        const gradient = ctx.createLinearGradient(-20, 0, 20, 0);
        gradient.addColorStop(0, '#9b59b6');
        gradient.addColorStop(0.5, '#8e44ad');
        gradient.addColorStop(1, '#9b59b6');
        
        // Magnet body
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-15, -8, 30, 16, 3);
        ctx.fill();
        
        // Magnet poles
        ctx.fillStyle = '#8e44ad';
        
        // North pole
        ctx.beginPath();
        ctx.moveTo(-20, -15);
        ctx.lineTo(-20, 15);
        ctx.lineTo(-30, 15);
        ctx.lineTo(-30, -15);
        ctx.closePath();
        ctx.fill();
        
        // South pole
        ctx.beginPath();
        ctx.moveTo(20, -15);
        ctx.lineTo(20, 15);
        ctx.lineTo(30, 15);
        ctx.lineTo(30, -15);
        ctx.closePath();
        ctx.fill();
        
        // Pole details
        ctx.fillStyle = '#ecf0f1';
        
        // N marking
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', -25, 0);
        
        // S marking
        ctx.fillText('S', 25, 0);
        
        // Magnetic field lines
        ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
        ctx.lineWidth = 2;
        
        for (let i = -10; i <= 10; i += 5) {
            // Field line
            ctx.beginPath();
            ctx.moveTo(-30, i);
            
            // Create curved field line
            ctx.bezierCurveTo(
                -15, i - 20,
                15, i + 20,
                30, i
            );
            
            ctx.stroke();
        }
        
        // Magnet glow
        const glowGradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
        glowGradient.addColorStop(0, 'rgba(155, 89, 182, 0.3)');
        glowGradient.addColorStop(1, 'rgba(155, 89, 182, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawBoostSprite(ctx, width, height) {
        ctx.save();
        ctx.translate(width/2, height/2);
        
        // Boost base
        const gradient = ctx.createLinearGradient(-30, 0, 30, 0);
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(0.5, '#c0392b');
        gradient.addColorStop(1, '#e74c3c');
        
        // Rocket shape
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(10, -15);
        ctx.lineTo(-20, -15);
        ctx.lineTo(-30, 0);
        ctx.lineTo(-20, 15);
        ctx.lineTo(10, 15);
        ctx.closePath();
        ctx.fill();
        
        // Rocket window
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Rocket fins
        ctx.fillStyle = '#c0392b';
        
        // Top fin
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-10, -30);
        ctx.lineTo(10, -15);
        ctx.closePath();
        ctx.fill();
        
        // Bottom fin
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(-10, 30);
        ctx.lineTo(10, 15);
        ctx.closePath();
        ctx.fill();
        
        // Rocket exhaust
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(-40, -10);
        ctx.lineTo(-50, 0);
        ctx.lineTo(-40, 10);
        ctx.closePath();
        ctx.fill();
        
        // Exhaust flames
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(-50, 0);
        ctx.lineTo(-65, -5);
        ctx.lineTo(-70, 0);
        ctx.lineTo(-65, 5);
        ctx.closePath();
        ctx.fill();
        
        // Speed lines
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            const y = (i - 1) * 10;
            
            ctx.beginPath();
            ctx.moveTo(-40 - i * 10, y);
            ctx.lineTo(-60 - i * 5, y);
            ctx.stroke();
        }
        
        // Boost glow
        const glowGradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
        glowGradient.addColorStop(0, 'rgba(231, 76, 60, 0.3)');
        glowGradient.addColorStop(1, 'rgba(231, 76, 60, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    update(speed) {
        this.x -= speed;
        this.animationTimer += speed;
        this.glowIntensity = Math.sin(this.animationTimer * 0.05) * 0.5 + 0.5;
        this.bobOffset = Math.sin(this.animationTimer * 0.1) * 3;
        this.rotation += 0.01;
        
        if (this.animationTimer > 10) {
            this.animationFrame = (this.animationFrame + 1) % 8;
            this.animationTimer = 0;
            
            // Add trail particles
            if (!this.collected) {
                const color = this.type === 'shield' ? '#3498db' : 
                             this.type === 'magnet' ? '#9b59b6' : '#e74c3c';
                             
                this.particles.push({
                    x: 0,
                    y: 0,
                    vx: -1 - Math.random() * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: 2 + Math.random() * 4,
                    color: color,
                    life: 20 + Math.random() * 20,
                    alpha: 0.7
                });
            }
        }
        
        // Update orbit particles
        this.orbitParticles.forEach(p => {
            p.angle += p.speed;
            if (p.angle > Math.PI * 2) {
                p.angle -= Math.PI * 2;
            }
        });
        
        // Collection animation
        if (this.collected) {
            this.collectAnimation += 0.2;
            this.scale = Math.max(0, 1 - this.collectAnimation / 5);
            
            // Create collection particles
            if (this.collectAnimation < 1) {
                const color = this.type === 'shield' ? '#3498db' : 
                             this.type === 'magnet' ? '#9b59b6' : '#e74c3c';
                             
                for (let i = 0; i < 3; i++) {
                    this.particles.push({
                        x: 0,
                        y: 0,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        size: 3 + Math.random() * 5,
                        color: color,
                        life: 30 + Math.random() * 20,
                        alpha: 1
                    });
                }
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = p.life / 50;
            p.size *= 0.95;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (this.collected && this.scale <= 0) return;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2 + this.bobOffset);
        
        // Draw trail particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw orbit particles
        if (!this.collected) {
            this.orbitParticles.forEach(p => {
                const x = Math.cos(p.angle) * p.distance;
                const y = Math.sin(p.angle) * p.distance;
                
                ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Particle trail
                ctx.strokeStyle = p.color + '40'; // 25% opacity
                ctx.lineWidth = p.size / 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x - Math.cos(p.angle) * p.size * 3,
                    y - Math.sin(p.angle) * p.size * 3
                );
                ctx.stroke();
            });
        }
        
        // Draw glow effect
        const glowColor = this.type === 'shield' ? '#3498db' : 
                         this.type === 'magnet' ? '#9b59b6' : '#e74c3c';
                         
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15 + this.glowIntensity * 15;
        
        // Draw sprite with rotation and scale
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        if (this.sprite) {
            ctx.drawImage(
                this.sprite, 
                -this.width * 1.5, 
                -this.height * 1.5, 
                this.width * 3, 
                this.height * 3
            );
        } else {
            // Fallback drawing if sprite isn't loaded
            if (this.type === 'shield') {
                // Draw shield
                ctx.fillStyle = '#3498db';
                ctx.beginPath();
                ctx.moveTo(0, -15);
                ctx.lineTo(-10, -5);
                ctx.lineTo(-10, 10);
                ctx.lineTo(0, 15);
                ctx.lineTo(10, 10);
                ctx.lineTo(10, -5);
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = '#2980b9';
                ctx.beginPath();
                ctx.moveTo(0, -10);
                ctx.lineTo(-6, -2);
                ctx.lineTo(-6, 6);
                ctx.lineTo(0, 10);
                ctx.lineTo(6, 6);
                ctx.lineTo(6, -2);
                ctx.closePath();
                ctx.fill();
                
            } else if (this.type === 'magnet') {
                // Draw magnet
                ctx.fillStyle = '#9b59b6';
                
                // Magnet body
                ctx.fillRect(-10, -5, 20, 10);
                
                // Magnet poles
                ctx.fillRect(-10, -15, 5, 10);
                ctx.fillRect(5, -15, 5, 10);
                ctx.fillRect(-10, 5, 5, 10);
                ctx.fillRect(5, 5, 5, 10);
                
                // Magnet highlights
                ctx.fillStyle = '#8e44ad';
                ctx.fillRect(-8, -3, 16, 6);
                
            } else if (this.type === 'boost') {
                // Draw boost
                ctx.fillStyle = '#e74c3c';
                
                // Boost arrow
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.lineTo(0, -15);
                ctx.lineTo(0, -5);
                ctx.lineTo(15, -5);
                ctx.lineTo(15, 5);
                ctx.lineTo(0, 5);
                ctx.lineTo(0, 15);
                ctx.closePath();
                ctx.fill();
                
                // Boost highlights
                ctx.fillStyle = '#c0392b';
                ctx.beginPath();
                ctx.moveTo(-10, 0);
                ctx.lineTo(0, -10);
                ctx.lineTo(0, -3);
                ctx.lineTo(10, -3);
                ctx.lineTo(10, 3);
                ctx.lineTo(0, 3);
                ctx.lineTo(0, 10);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // Collection effect
        if (this.collected) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + this.collectAnimation;
                const innerRadius = this.width * (0.5 + this.collectAnimation);
                const outerRadius = this.width * (1 + this.collectAnimation);
                
                ctx.globalAlpha = 1 - this.collectAnimation / 5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
                ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
}

class Background {
    constructor() {
        // Theme-specific backgrounds
        this.themes = {
            default: this.createJungleTheme(),
            ninja: this.createNinjaTheme(),
            space: this.createSpaceTheme()
        };
        
        // Current theme
        this.currentTheme = 'default';
        
        // Ground height
        this.groundHeight = GAME_CONFIG.GROUND_HEIGHT;
        
        // Particles for visual effects
        this.particles = [];
        
        // Animation properties
        this.animationFrame = 0;
    }
    
    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
        }
    }
    
    createJungleTheme() {
        const theme = {
            layers: [],
            groundPattern: null,
            skyColors: ['#87CEEB', '#E0F7FA'],
            groundColors: ['#8B4513', '#A0522D', '#654321'],
            particles: []
        };
        
        // Create background layers
        theme.layers = [
            this.createJungleSkyLayer(),
            this.createJungleMountainsLayer(),
            this.createJungleTreesLayer(),
            this.createJungleBushesLayer()
        ];
        
        // Create ground pattern
        theme.groundPattern = this.createGroundPattern(theme.groundColors);
        
        return theme;
    }
    
    createNinjaTheme() {
        const theme = {
            layers: [],
            groundPattern: null,
            skyColors: ['#2C3E50', '#34495E'],
            groundColors: ['#2C3E50', '#34495E', '#1C2833'],
            particles: []
        };
        
        // Create background layers
        theme.layers = [
            this.createNinjaSkyLayer(),
            this.createNinjaMountainsLayer(),
            this.createNinjaPagodaLayer(),
            this.createNinjaBambooLayer()
        ];
        
        // Create ground pattern
        theme.groundPattern = this.createGroundPattern(theme.groundColors);
        
        return theme;
    }
    
    createSpaceTheme() {
        const theme = {
            layers: [],
            groundPattern: null,
            skyColors: ['#0B0B3B', '#000000'],
            groundColors: ['#4A235A', '#512E5F', '#5B2C6F'],
            particles: [],
            stars: []
        };
        
        // Generate stars
        for (let i = 0; i < 100; i++) {
            theme.stars.push({
                x: Math.random() * 800,
                y: Math.random() * 300,
                size: Math.random() * 2 + 1,
                twinkle: Math.random()
            });
        }
        
        // Create background layers
        theme.layers = [
            this.createSpaceSkyLayer(),
            this.createSpacePlanetsLayer(),
            this.createSpaceNebulaLayer(),
            this.createSpaceAsteroidsLayer()
        ];
        
        // Create ground pattern
        theme.groundPattern = this.createGroundPattern(theme.groundColors);
        
        return theme;
    }
    
    createJungleSkyLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Sun
        ctx.fillStyle = '#FDB813';
        ctx.beginPath();
        ctx.arc(200, 80, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Sun glow
        const sunGlow = ctx.createRadialGradient(200, 80, 40, 200, 80, 100);
        sunGlow.addColorStop(0, 'rgba(253, 184, 19, 0.5)');
        sunGlow.addColorStop(1, 'rgba(253, 184, 19, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(200, 80, 100, 0, Math.PI * 2);
        ctx.fill();
        
        // Clouds
        this.drawClouds(ctx, 10);
        
        return {
            canvas: canvas,
            speed: 0.05,
            x: 0
        };
    }
    
    createJungleMountainsLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Mountains
        ctx.fillStyle = '#4A7C59';
        
        // Back mountains
        this.drawMountainRange(ctx, 0, 300, canvas.width, 100, 3);
        
        // Front mountains
        ctx.fillStyle = '#2D5016';
        this.drawMountainRange(ctx, 0, 300, canvas.width, 150, 5);
        
        return {
            canvas: canvas,
            speed: 0.1,
            x: 0
        };
    }
    
    createJungleTreesLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Trees
        for (let i = 0; i < 15; i++) {
            const x = i * 120 - 30 + Math.random() * 60;
            const height = 150 + Math.random() * 100;
            this.drawJungleTree(ctx, x, 300, height);
        }
        
        return {
            canvas: canvas,
            speed: 0.3,
            x: 0
        };
    }
    
    createJungleBushesLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Bushes and plants
        for (let i = 0; i < 40; i++) {
            const x = i * 40 + Math.random() * 30;
            const height = 30 + Math.random() * 50;
            this.drawJunglePlant(ctx, x, 300, height);
        }
        
        // Flowers
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = 280 + Math.random() * 20;
            this.drawFlower(ctx, x, y);
        }
        
        return {
            canvas: canvas,
            speed: 0.6,
            x: 0
        };
    }
    
    createNinjaSkyLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Night sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, '#0B0B3B');
        gradient.addColorStop(1, '#2C3E50');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Moon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(200, 80, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon glow
        const moonGlow = ctx.createRadialGradient(200, 80, 30, 200, 80, 80);
        moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        moonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(200, 80, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // Stars
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * 200;
            const size = Math.random() * 2 + 0.5;
            
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.5 + Math.random() * 0.5) + ')';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return {
            canvas: canvas,
            speed: 0.05,
            x: 0
        };
    }
    
    createNinjaMountainsLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Mountains
        ctx.fillStyle = '#1C2833';
        
        // Back mountains
        this.drawMountainRange(ctx, 0, 300, canvas.width, 120, 3);
        
        // Front mountains
        ctx.fillStyle = '#17202A';
        this.drawMountainRange(ctx, 0, 300, canvas.width, 170, 5);
        
        return {
            canvas: canvas,
            speed: 0.1,
            x: 0
        };
    }
    
    createNinjaPagodaLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Pagodas
        for (let i = 0; i < 5; i++) {
            const x = i * 350 - 50 + Math.random() * 100;
            this.drawPagoda(ctx, x, 300);
        }
        
        return {
            canvas: canvas,
            speed: 0.3,
            x: 0
        };
    }
    
    createNinjaBambooLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Bamboo
        for (let i = 0; i < 30; i++) {
            const x = i * 60 - 30 + Math.random() * 60;
            const height = 100 + Math.random() * 150;
            this.drawBamboo(ctx, x, 300, height);
        }
        
        return {
            canvas: canvas,
            speed: 0.6,
            x: 0
        };
    }
    
    createSpaceSkyLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Space background
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, '#0B0B3B');
        gradient.addColorStop(1, '#1A0033');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Stars
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * 300;
            const size = Math.random() * 2 + 0.5;
            
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.5 + Math.random() * 0.5) + ')';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Some stars get a glow
            if (Math.random() > 0.9) {
                const glow = ctx.createRadialGradient(x, y, size, x, y, size * 4);
                glow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, size * 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        return {
            canvas: canvas,
            speed: 0.05,
            x: 0
        };
    }
    
    createSpacePlanetsLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Planets
        const planetColors = [
            ['#FF5733', '#C70039'], // Red planet
            ['#3498DB', '#2874A6'], // Blue planet
            ['#F1C40F', '#D4AC0D'], // Yellow planet
            ['#884EA0', '#76448A']  // Purple planet
        ];
        
        for (let i = 0; i < 4; i++) {
            const x = i * 400 + 100 + Math.random() * 100;
            const y = 50 + Math.random() * 150;
            const size = 20 + Math.random() * 40;
            const colors = planetColors[i % planetColors.length];
            
            this.drawPlanet(ctx, x, y, size, colors[0], colors[1]);
        }
        
        return {
            canvas: canvas,
            speed: 0.1,
            x: 0
        };
    }
    
    createSpaceNebulaLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Nebula clouds
        const nebulaColors = [
            ['#3498DB', '#2874A6', '#1ABC9C'], // Blue/green nebula
            ['#9B59B6', '#8E44AD', '#E74C3C'], // Purple/red nebula
            ['#F1C40F', '#D35400', '#E67E22']  // Yellow/orange nebula
        ];
        
        for (let i = 0; i < 3; i++) {
            const x = i * 500 + 100;
            const y = 100 + Math.random() * 100;
            const colors = nebulaColors[i % nebulaColors.length];
            
            this.drawNebula(ctx, x, y, colors);
        }
        
        return {
            canvas: canvas,
            speed: 0.2,
            x: 0
        };
    }
    
    createSpaceAsteroidsLayer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1600;
        canvas.height = 400;
        
        // Asteroids
        for (let i = 0; i < 20; i++) {
            const x = i * 80 + Math.random() * 40;
            const y = 150 + Math.random() * 150;
            const size = 5 + Math.random() * 15;
            
            this.drawAsteroid(ctx, x, y, size);
        }
        
        // Space station
        this.drawSpaceStation(ctx, 400, 150);
        this.drawSpaceStation(ctx, 1200, 200);
        
        return {
            canvas: canvas,
            speed: 0.4,
            x: 0
        };
    }
    
    createGroundPattern(colors) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 40;
        
        // Base color
        ctx.fillStyle = colors[0];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Detail lines
        ctx.fillStyle = colors[1];
        for (let i = 0; i < 20; i++) {
            const x = i * 10 + Math.random() * 5;
            const y = Math.random() * 30;
            const width = 3 + Math.random() * 5;
            const height = 2 + Math.random() * 3;
            ctx.fillRect(x, y, width, height);
        }
        
        // Dots and details
        ctx.fillStyle = colors[2];
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return canvas;
    }
    
    // Helper drawing methods
    drawClouds(ctx, count) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 0; i < count; i++) {
            const x = i * 160 + Math.random() * 100;
            const y = 50 + Math.random() * 100;
            const size = 30 + Math.random() * 20;
            
            // Cloud puffs
            for (let j = 0; j < 5; j++) {
                const puffX = x + j * (size/2) - size;
                const puffY = y + Math.sin(j * 0.5) * 10;
                const puffSize = size - j * 2 + Math.random() * 10;
                
                ctx.beginPath();
                ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    drawMountainRange(ctx, startX, baseY, width, height, peakCount) {
        ctx.beginPath();
        ctx.moveTo(startX, baseY);
        
        const peakWidth = width / peakCount;
        
        for (let i = 0; i <= peakCount; i++) {
            const x = startX + i * peakWidth;
            const peakHeight = Math.random() * height * 0.5 + height * 0.5;
            
            if (i === 0) {
                ctx.lineTo(x, baseY - peakHeight);
            } else {
                const cpX1 = startX + (i - 0.5) * peakWidth;
                const cpY1 = baseY - peakHeight + Math.random() * 20;
                
                ctx.quadraticCurveTo(cpX1, cpY1, x, baseY - peakHeight);
            }
            
            if (i < peakCount) {
                const nextX = startX + (i + 1) * peakWidth;
                const nextY = baseY;
                
                const cpX2 = startX + (i + 0.5) * peakWidth;
                const cpY2 = baseY - Math.random() * 20;
                
                ctx.quadraticCurveTo(cpX2, cpY2, nextX, nextY);
            }
        }
        
        ctx.lineTo(startX + width, baseY);
        ctx.closePath();
        ctx.fill();
    }
    
    drawJungleTree(ctx, x, baseY, height) {
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x - 10, baseY);
        ctx.lineTo(x - 5, baseY - height);
        ctx.lineTo(x + 5, baseY - height);
        ctx.lineTo(x + 10, baseY);
        ctx.closePath();
        ctx.fill();
        
        // Tree foliage
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 5; i++) {
            const leafY = baseY - height + 10 + i * 20;
            const leafSize = 40 - i * 5 + Math.random() * 10;
            
            ctx.beginPath();
            ctx.arc(x - 20, leafY, leafSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x + 20, leafY - 10, leafSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(x, baseY - height - 30, 50, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawJunglePlant(ctx, x, baseY, height) {
        // Plant stem
        ctx.fillStyle = '#006400';
        ctx.beginPath();
        ctx.moveTo(x - 2, baseY);
        ctx.lineTo(x - 1, baseY - height);
        ctx.lineTo(x + 1, baseY - height);
        ctx.lineTo(x + 2, baseY);
        ctx.closePath();
        ctx.fill();
        
        // Leaves
        const leafCount = Math.floor(height / 15);
        
        for (let i = 0; i < leafCount; i++) {
            const leafY = baseY - i * 15 - 10;
            const leafSize = 10 + Math.random() * 5;
            const angle = (i % 2 === 0) ? -0.3 : 0.3;
            const direction = (i % 2 === 0) ? -1 : 1;
            
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            ctx.ellipse(
                x + direction * 10, 
                leafY, 
                leafSize * 2, 
                leafSize, 
                angle, 
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    drawFlower(ctx, x, y) {
        const colors = [
            '#FF5733', // Orange
            '#C70039', // Red
            '#FFC300', // Yellow
            '#FF5733', // Orange
            '#C70039', // Red
            '#FFC300', // Yellow
            '#FF5733', // Orange
            '#C70039', // Red
            '#FFC300', // Yellow
            '#FFFFFF'  // White
        ];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Stem
        ctx.fillStyle = '#006400';
        ctx.fillRect(x - 1, y, 2, 20);
        
        // Flower
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * 5;
            const petalY = y + Math.sin(angle) * 5;
            
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 5, 3, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center
        ctx.fillStyle = '#FFC300';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPagoda(ctx, x, baseY) {
        const levels = 3 + Math.floor(Math.random() * 2);
        const baseWidth = 80;
        const roofOverhang = 20;
        
        // Base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - baseWidth/2, baseY - 20, baseWidth, 20);
        
        // Levels
        for (let i = 0; i < levels; i++) {
            const levelY = baseY - 20 - i * 40;
            const levelWidth = baseWidth - i * 15;
            
            // Walls
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(x - levelWidth/2, levelY - 30, levelWidth, 30);
            
            // Roof
            ctx.fillStyle = '#8B0000';
            ctx.beginPath();
            ctx.moveTo(x - levelWidth/2 - roofOverhang, levelY - 30);
            ctx.lineTo(x, levelY - 50 - i * 5);
            ctx.lineTo(x + levelWidth/2 + roofOverhang, levelY - 30);
            ctx.closePath();
            ctx.fill();
            
            // Windows
            if (i < levels - 1) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(x - levelWidth/4, levelY - 25, levelWidth/6, 15);
                ctx.fillRect(x + levelWidth/4 - levelWidth/6, levelY - 25, levelWidth/6, 15);
            }
        }
    }
    
    drawBamboo(ctx, x, baseY, height) {
        const segments = Math.floor(height / 20);
        const width = 8 + Math.random() * 4;
        
        for (let i = 0; i < segments; i++) {
            const segmentY = baseY - i * 20;
            
            // Segment
            ctx.fillStyle = i % 2 === 0 ? '#006400' : '#008000';
            ctx.fillRect(x - width/2, segmentY - 20, width, 20);
            
            // Joint
            ctx.fillStyle = '#004d00';
            ctx.fillRect(x - width/2 - 2, segmentY - 2, width + 4, 4);
        }
        
        // Leaves
        if (Math.random() > 0.5) {
            const leafY = baseY - height + 20;
            
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = '#006400';
                ctx.beginPath();
                ctx.ellipse(
                    x + (i % 2 === 0 ? -15 : 15), 
                    leafY + i * 10, 
                    20, 
                    5, 
                    i % 2 === 0 ? -0.3 : 0.3, 
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    drawPlanet(ctx, x, y, size, mainColor, secondaryColor) {
        // Planet body
        const gradient = ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        gradient.addColorStop(0, mainColor);
        gradient.addColorStop(1, secondaryColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet details
        ctx.fillStyle = secondaryColor;
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (size * 0.7);
            const detailX = x + Math.cos(angle) * distance;
            const detailY = y + Math.sin(angle) * distance;
            const detailSize = size * 0.1 + Math.random() * (size * 0.2);
            
            ctx.beginPath();
            ctx.arc(detailX, detailY, detailSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Planet glow
        const glowGradient = ctx.createRadialGradient(x, y, size, x, y, size * 1.5);
        glowGradient.addColorStop(0, 'rgba(' + this.hexToRgb(mainColor) + ', 0.3)');
        glowGradient.addColorStop(1, 'rgba(' + this.hexToRgb(mainColor) + ', 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Rings (for some planets)
        if (Math.random() > 0.5) {
            ctx.strokeStyle = mainColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(x, y, size * 1.5, size * 0.5, Math.PI / 6, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = secondaryColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(x, y, size * 1.7, size * 0.6, Math.PI / 6, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawNebula(ctx, x, y, colors) {
        for (let i = 0; i < 5; i++) {
            const cloudX = x + Math.random() * 200 - 100;
            const cloudY = y + Math.random() * 100 - 50;
            const cloudSize = 50 + Math.random() * 100;
            
            const color = colors[i % colors.length];
            const alpha = 0.1 + Math.random() * 0.2;
            
            const gradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
            gradient.addColorStop(0, 'rgba(' + this.hexToRgb(color) + ', ' + alpha + ')');
            gradient.addColorStop(1, 'rgba(' + this.hexToRgb(color) + ', 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawAsteroid(ctx, x, y, size) {
        ctx.fillStyle = '#696969';
        
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        
        for (let i = 1; i <= 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = size * (0.8 + Math.random() * 0.4);
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            ctx.lineTo(pointX, pointY);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Crater details
        ctx.fillStyle = '#505050';
        for (let i = 0; i < 3; i++) {
            const craterX = x + (Math.random() - 0.5) * size;
            const craterY = y + (Math.random() - 0.5) * size;
            const craterSize = size * 0.2 + Math.random() * (size * 0.2);
            
            ctx.beginPath();
            ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawSpaceStation(ctx, x, y) {
        // Main body
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x - 40, y - 10, 80, 20);
        
        // Solar panels
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(x - 80, y - 30, 30, 60);
        ctx.fillRect(x + 50, y - 30, 30, 60);
        
        // Panel details
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 80, y - 20 + i * 20);
            ctx.lineTo(x - 50, y - 20 + i * 20);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 50, y - 20 + i * 20);
            ctx.lineTo(x + 80, y - 20 + i * 20);
            ctx.stroke();
        }
        
        // Module connections
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(x - 15, y - 20, 30, 40);
        
        // Windows
        ctx.fillStyle = '#FFFF00';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x - 20 + i * 20, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Antenna
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y - 30);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x, y - 30, 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return r + ',' + g + ',' + b;
    }
    
    update(speed) {
        // Update animation frame
        this.animationFrame += 0.5;
        
        // Get current theme
        const theme = this.themes[this.currentTheme];
        
        // Update background layers
        theme.layers.forEach(layer => {
            layer.x -= layer.speed * speed;
            if (layer.x <= -layer.canvas.width) {
                layer.x = 0;
            }
        });
        
        // Update particles
        if (theme.particles) {
            // Remove old particles
            theme.particles = theme.particles.filter(p => p.life > 0);
            
            // Update existing particles
            theme.particles.forEach(p => {
                p.x += p.vx - speed * p.parallax;
                p.y += p.vy;
                p.size *= p.fade;
                p.life--;
                p.rotation += p.rotationSpeed;
            });
            
            // Add new particles based on theme
            if (this.currentTheme === 'default' && Math.random() > 0.95) {
                // Leaves falling
                theme.particles.push({
                    x: Math.random() * 800,
                    y: -20,
                    vx: (Math.random() - 0.5) * 2,
                    vy: 1 + Math.random() * 2,
                    size: 5 + Math.random() * 10,
                    color: Math.random() > 0.5 ? '#228B22' : '#006400',
                    life: 200 + Math.random() * 100,
                    fade: 0.99,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    type: 'leaf',
                    parallax: 0.5 + Math.random() * 0.5
                });
            } else if (this.currentTheme === 'ninja' && Math.random() > 0.98) {
                // Cherry blossoms
                theme.particles.push({
                    x: Math.random() * 800,
                    y: -20,
                    vx: (Math.random() - 0.5) * 1,
                    vy: 0.5 + Math.random(),
                    size: 3 + Math.random() * 5,
                    color: Math.random() > 0.3 ? '#FFB7C5' : '#FFFFFF',
                    life: 300 + Math.random() * 200,
                    fade: 0.995,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.05,
                    type: 'petal',
                    parallax: 0.3 + Math.random() * 0.3
                });
            } else if (this.currentTheme === 'space' && Math.random() > 0.9) {
                // Space dust
                theme.particles.push({
                    x: 800 + Math.random() * 100,
                    y: Math.random() * 300,
                    vx: -3 - Math.random() * 5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: 1 + Math.random() * 2,
                    color: Math.random() > 0.7 ? '#FFFFFF' : 
                           Math.random() > 0.5 ? '#87CEFA' : '#FFA07A',
                    life: 100 + Math.random() * 100,
                    fade: 0.99,
                    rotation: 0,
                    rotationSpeed: 0,
                    type: 'dust',
                    parallax: 1 + Math.random()
                });
            }
        }
        
        // Update stars in space theme
        if (this.currentTheme === 'space' && theme.stars) {
            theme.stars.forEach(star => {
                star.twinkle += 0.02;
                if (star.twinkle > Math.PI * 2) {
                    star.twinkle = 0;
                }
            });
        }
    }
    
    draw(ctx) {
        // Get current theme
        const theme = this.themes[this.currentTheme];
        
        // Draw sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.groundHeight);
        gradient.addColorStop(0, theme.skyColors[0]);
        gradient.addColorStop(1, theme.skyColors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, this.groundHeight);
        
        // Special effects for space theme
        if (this.currentTheme === 'space' && theme.stars) {
            // Draw stars with twinkle effect
            theme.stars.forEach(star => {
                const brightness = 0.5 + Math.sin(star.twinkle) * 0.5;
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Star glow
                if (star.size > 1.5) {
                    const glowSize = star.size * (2 + Math.sin(star.twinkle));
                    const glow = ctx.createRadialGradient(
                        star.x, star.y, 0,
                        star.x, star.y, glowSize
                    );
                    glow.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.5})`);
                    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
        
        // Draw background layers
        theme.layers.forEach(layer => {
            if (layer.canvas) {
                ctx.drawImage(layer.canvas, layer.x, 0);
                ctx.drawImage(layer.canvas, layer.x + layer.canvas.width, 0);
            }
        });
        
        // Draw particles
        if (theme.particles) {
            theme.particles.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                
                if (p.type === 'leaf') {
                    // Draw leaf
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Leaf vein
                    ctx.strokeStyle = '#006400';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-p.size, 0);
                    ctx.lineTo(p.size, 0);
                    ctx.stroke();
                } else if (p.type === 'petal') {
                    // Draw petal
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'dust') {
                    // Draw space dust with trail
                    const gradient = ctx.createLinearGradient(0, 0, -p.vx * 5, 0);
                    gradient.addColorStop(0, p.color);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Trail
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-p.vx * 5, 0);
                    ctx.lineWidth = p.size * 2;
                    ctx.strokeStyle = gradient;
                    ctx.stroke();
                } else {
                    // Default particle
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            });
        }
        
        // Draw ground
        if (theme.groundPattern) {
            // Ground base
            const groundGradient = ctx.createLinearGradient(0, this.groundHeight, 0, ctx.canvas.height);
            groundGradient.addColorStop(0, theme.groundColors[0]);
            groundGradient.addColorStop(1, theme.groundColors[2]);
            
            ctx.fillStyle = groundGradient;
            ctx.fillRect(0, this.groundHeight, ctx.canvas.width, ctx.canvas.height - this.groundHeight);
            
            // Draw ground pattern
            for (let x = 0; x < ctx.canvas.width; x += theme.groundPattern.width) {
                ctx.drawImage(theme.groundPattern, x, this.groundHeight - theme.groundPattern.height/2);
            }
            
            // Ground edge highlight
            ctx.strokeStyle = theme.groundColors[1];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, this.groundHeight);
            ctx.lineTo(ctx.canvas.width, this.groundHeight);
            ctx.stroke();
        }
        
        // Theme-specific foreground effects
        if (this.currentTheme === 'space') {
            // Space foreground glow
            const foreGlow = ctx.createLinearGradient(0, this.groundHeight - 50, 0, this.groundHeight);
            foreGlow.addColorStop(0, 'rgba(138, 43, 226, 0)');
            foreGlow.addColorStop(1, 'rgba(138, 43, 226, 0.2)');
            
            ctx.fillStyle = foreGlow;
            ctx.fillRect(0, this.groundHeight - 50, ctx.canvas.width, 50);
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.state = 'start'; // start, playing, paused, gameOver
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('monkeyRunnerHighScore') || '0');
        this.speed = GAME_CONFIG.INITIAL_SPEED;
        this.distance = 0;
        
        // Game objects
        this.monkey = new Monkey('default');
        this.background = new Background();
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        
        // Game timers
        this.lastTime = 0;
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        
        // Audio
        this.sounds = {
            jump: new Audio('https://assets.codepen.io/21542/howler-push.mp3'),
            collect: new Audio('https://assets.codepen.io/21542/howler-sfx-levelup.mp3'),
            powerUp: new Audio('https://assets.codepen.io/21542/howler-sfx-movement.mp3'),
            crash: new Audio('https://assets.codepen.io/21542/howler-sfx-negative.mp3')
        };
        this.muted = false;
        
        // UI elements
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
        
        // Buttons
        this.startButton = document.getElementById('startButton');
        this.resumeButton = document.getElementById('resumeButton');
        this.restartButton = document.getElementById('restartButton');
        this.menuButton = document.getElementById('menuButton');
        this.quitButton = document.getElementById('quitButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.muteButton = document.getElementById('muteButton');
        
        // Character selection
        this.characterElements = document.querySelectorAll('.character');
        
        // Initialize
        this.init();
    }
    
    init() {
        // Update high score display
        this.highScoreElement.textContent = this.highScore.toString();
        this.highScoreTopElement.textContent = this.highScore.toString();
        
        // Event listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.resumeButton.addEventListener('click', () => this.resumeGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.menuButton.addEventListener('click', () => this.showStartScreen());
        this.quitButton.addEventListener('click', () => this.showStartScreen());
        this.pauseButton.addEventListener('click', () => this.pauseGame());
        this.muteButton.addEventListener('click', () => this.toggleMute());
        
        // Character selection
        this.characterElements.forEach(element => {
            element.addEventListener('click', () => {
                const character = element.getAttribute('data-character');
                
                // Update selection UI
                this.characterElements.forEach(el => el.setAttribute('data-selected', 'false'));
                element.setAttribute('data-selected', 'true');
                
                // Update monkey character
                this.monkey.setCharacter(character);
                
                // Update background theme
                this.background.setTheme(character);
                
                // Update character preview styles
                this.updateCharacterPreviews(character);
            });
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.state === 'playing') {
                if (e.code === 'Space' || e.code === 'ArrowUp') {
                    if (this.monkey.jump() && !this.muted) {
                        this.sounds.jump.currentTime = 0;
                        this.sounds.jump.play();
                    }
                } else if (e.code === 'ArrowDown') {
                    this.monkey.slide();
                }
            } else if (this.state === 'start' && (e.code === 'Space' || e.code === 'Enter')) {
                this.startGame();
            } else if (this.state === 'gameOver' && (e.code === 'Space' || e.code === 'Enter')) {
                this.restartGame();
            } else if (e.code === 'Escape') {
                if (this.state === 'playing') {
                    this.pauseGame();
                } else if (this.state === 'paused') {
                    this.resumeGame();
                }
            }
        });
        
        // Mouse/touch controls
        this.canvas.addEventListener('click', () => {
            if (this.state === 'playing') {
                if (this.monkey.jump() && !this.muted) {
                    this.sounds.jump.currentTime = 0;
                    this.sounds.jump.play();
                }
            }
        });
        
        // Update character previews with enhanced styles
        this.enhanceCharacterPreviews();
        
        // Start animation loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    enhanceCharacterPreviews() {
        // Get all character preview elements
        const defaultPreview = document.querySelector('.character-preview.default');
        const ninjaPreview = document.querySelector('.character-preview.ninja');
        const spacePreview = document.querySelector('.character-preview.space');
        
        if (defaultPreview) {
            // Jungle monkey preview
            defaultPreview.style.background = 'linear-gradient(135deg, #228B22, #006400)';
            defaultPreview.style.boxShadow = '0 0 10px #32CD32';
            defaultPreview.style.border = '3px solid #8B4513';
            
            // Add monkey face to preview
            const jungleCanvas = document.createElement('canvas');
            jungleCanvas.width = 60;
            jungleCanvas.height = 60;
            const jungleCtx = jungleCanvas.getContext('2d');
            
            // Draw jungle monkey face
            jungleCtx.fillStyle = '#D2691E';
            jungleCtx.beginPath();
            jungleCtx.arc(30, 30, 25, 0, Math.PI * 2);
            jungleCtx.fill();
            
            jungleCtx.fillStyle = '#F4A460';
            jungleCtx.beginPath();
            jungleCtx.arc(30, 32, 18, 0, Math.PI * 2);
            jungleCtx.fill();
            
            // Eyes
            jungleCtx.fillStyle = 'white';
            jungleCtx.beginPath();
            jungleCtx.arc(22, 25, 5, 0, Math.PI * 2);
            jungleCtx.arc(38, 25, 5, 0, Math.PI * 2);
            jungleCtx.fill();
            
            jungleCtx.fillStyle = 'black';
            jungleCtx.beginPath();
            jungleCtx.arc(22, 25, 2.5, 0, Math.PI * 2);
            jungleCtx.arc(38, 25, 2.5, 0, Math.PI * 2);
            jungleCtx.fill();
            
            // Mouth
            jungleCtx.fillStyle = '#8B4513';
            jungleCtx.beginPath();
            jungleCtx.arc(30, 40, 8, 0, Math.PI);
            jungleCtx.fill();
            
            // Leaf on head
            jungleCtx.fillStyle = '#32CD32';
            jungleCtx.beginPath();
            jungleCtx.ellipse(30, 10, 15, 8, 0, 0, Math.PI * 2);
            jungleCtx.fill();
            
            defaultPreview.style.backgroundImage = `url(${jungleCanvas.toDataURL()})`;
            defaultPreview.style.backgroundSize = 'cover';
        }
        
        if (ninjaPreview) {
            // Ninja monkey preview
            ninjaPreview.style.background = 'linear-gradient(135deg, #2C3E50, #34495E)';
            ninjaPreview.style.boxShadow = '0 0 10px #8B0000';
            ninjaPreview.style.border = '3px solid #2F4F4F';
            
            // Add ninja monkey face to preview
            const ninjaCanvas = document.createElement('canvas');
            ninjaCanvas.width = 60;
            ninjaCanvas.height = 60;
            const ninjaCtx = ninjaCanvas.getContext('2d');
            
            // Draw ninja monkey face
            ninjaCtx.fillStyle = '#2F4F4F';
            ninjaCtx.beginPath();
            ninjaCtx.arc(30, 30, 25, 0, Math.PI * 2);
            ninjaCtx.fill();
            
            // Ninja mask
            ninjaCtx.fillStyle = 'black';
            ninjaCtx.beginPath();
            ninjaCtx.arc(30, 32, 18, 0, Math.PI * 2);
            ninjaCtx.fill();
            
            // Eyes
            ninjaCtx.fillStyle = 'white';
            ninjaCtx.beginPath();
            ninjaCtx.arc(22, 25, 4, 0, Math.PI * 2);
            ninjaCtx.arc(38, 25, 4, 0, Math.PI * 2);
            ninjaCtx.fill();
            
            // Headband
            ninjaCtx.fillStyle = '#8B0000';
            ninjaCtx.fillRect(10, 18, 40, 6);
            
            // Headband ties
            ninjaCtx.beginPath();
            ninjaCtx.moveTo(50, 21);
            ninjaCtx.quadraticCurveTo(55, 25, 58, 35);
            ninjaCtx.lineTo(55, 35);
            ninjaCtx.quadraticCurveTo(52, 25, 50, 23);
            ninjaCtx.fill();
            
            ninjaPreview.style.backgroundImage = `url(${ninjaCanvas.toDataURL()})`;
            ninjaPreview.style.backgroundSize = 'cover';
        }
        
        if (spacePreview) {
            // Space monkey preview
            spacePreview.style.background = 'linear-gradient(135deg, #000000, #0B0B3B)';
            spacePreview.style.boxShadow = '0 0 15px #4169E1';
            spacePreview.style.border = '3px solid #4169E1';
            
            // Add space monkey face to preview
            const spaceCanvas = document.createElement('canvas');
            spaceCanvas.width = 60;
            spaceCanvas.height = 60;
            const spaceCtx = spaceCanvas.getContext('2d');
            
            // Draw space background with stars
            spaceCtx.fillStyle = '#0B0B3B';
            spaceCtx.fillRect(0, 0, 60, 60);
            
            // Stars
            for (let i = 0; i < 20; i++) {
                spaceCtx.fillStyle = 'white';
                spaceCtx.beginPath();
                spaceCtx.arc(
                    Math.random() * 60,
                    Math.random() * 60,
                    Math.random() * 1.5 + 0.5,
                    0, Math.PI * 2
                );
                spaceCtx.fill();
            }
            
            // Draw space monkey face
            spaceCtx.fillStyle = '#4169E1';
            spaceCtx.beginPath();
            spaceCtx.arc(30, 30, 20, 0, Math.PI * 2);
            spaceCtx.fill();
            
            // Face
            spaceCtx.fillStyle = '#87CEEB';
            spaceCtx.beginPath();
            spaceCtx.arc(30, 32, 15, 0, Math.PI * 2);
            spaceCtx.fill();
            
            // Space helmet (transparent dome)
            spaceCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            spaceCtx.beginPath();
            spaceCtx.arc(30, 30, 22, 0, Math.PI * 2);
            spaceCtx.fill();
            spaceCtx.strokeStyle = '#C0C0C0';
            spaceCtx.lineWidth = 2;
            spaceCtx.stroke();
            
            // Eyes
            spaceCtx.fillStyle = 'white';
            spaceCtx.beginPath();
            spaceCtx.arc(22, 28, 4, 0, Math.PI * 2);
            spaceCtx.arc(38, 28, 4, 0, Math.PI * 2);
            spaceCtx.fill();
            
            spaceCtx.fillStyle = 'black';
            spaceCtx.beginPath();
            spaceCtx.arc(22, 28, 2, 0, Math.PI * 2);
            spaceCtx.arc(38, 28, 2, 0, Math.PI * 2);
            spaceCtx.fill();
            
            spacePreview.style.backgroundImage = `url(${spaceCanvas.toDataURL()})`;
            spacePreview.style.backgroundSize = 'cover';
        }
    }
    
    updateCharacterPreviews(selectedCharacter) {
        // Add visual effects to the selected character
        const characterElements = document.querySelectorAll('.character');
        
        characterElements.forEach(element => {
            const character = element.getAttribute('data-character');
            const preview = element.querySelector('.character-preview');
            
            if (character === selectedCharacter) {
                // Enhanced selected state
                preview.style.boxShadow = character === 'default' ? '0 0 15px #32CD32' :
                                         character === 'ninja' ? '0 0 15px #8B0000' :
                                         '0 0 15px #4169E1';
                preview.style.transform = 'scale(1.1)';
                preview.style.transition = 'all 0.3s ease';
            } else {
                // Reset non-selected characters
                preview.style.boxShadow = character === 'default' ? '0 0 5px #32CD32' :
                                         character === 'ninja' ? '0 0 5px #8B0000' :
                                         '0 0 5px #4169E1';
                preview.style.transform = 'scale(1)';
                preview.style.transition = 'all 0.3s ease';
            }
        });
    }
    
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.speed = GAME_CONFIG.INITIAL_SPEED;
        this.distance = 0;
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.powerUpTimer = 0;
        this.scoreElement.textContent = '0';
        this.gameOverlay.style.display = 'none';
        
        // Set background theme based on selected character
        const selectedCharacter = document.querySelector('.character[data-selected="true"]');
        if (selectedCharacter) {
            const character = selectedCharacter.getAttribute('data-character');
            this.background.setTheme(character);
            this.monkey.setCharacter(character);
        }
        
        // Add start game effects
        this.addStartGameEffects();
    }
    
    addStartGameEffects() {
        // Create a flash effect
        const flashOverlay = document.createElement('div');
        flashOverlay.style.position = 'absolute';
        flashOverlay.style.top = '0';
        flashOverlay.style.left = '0';
        flashOverlay.style.width = '100%';
        flashOverlay.style.height = '100%';
        flashOverlay.style.backgroundColor = 'white';
        flashOverlay.style.opacity = '0.8';
        flashOverlay.style.zIndex = '5';
        flashOverlay.style.pointerEvents = 'none';
        flashOverlay.style.transition = 'opacity 0.5s ease-out';
        
        this.canvas.parentNode.appendChild(flashOverlay);
        
        // Fade out the flash
        setTimeout(() => {
            flashOverlay.style.opacity = '0';
            setTimeout(() => {
                flashOverlay.remove();
            }, 500);
        }, 50);
        
        // Play start sound
        if (!this.muted) {
            const startSound = new Audio('https://assets.codepen.io/21542/howler-sfx-levelup.mp3');
            startSound.volume = 0.5;
            startSound.play();
        }
    }
    
    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.gameOverlay.style.display = 'flex';
            this.startScreen.style.display = 'none';
            this.pauseScreen.style.display = 'block';
            this.gameOverScreen.style.display = 'none';
        }
    }
    
    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.gameOverlay.style.display = 'none';
        }
    }
    
    gameOver(message) {
        this.state = 'gameOver';
        this.gameOverlay.style.display = 'flex';
        this.startScreen.style.display = 'none';
        this.pauseScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'block';
        this.finalScoreElement.textContent = this.score.toString();
        this.crashMessageElement.textContent = message || 'You crashed!';
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('monkeyRunnerHighScore', this.highScore.toString());
            this.highScoreElement.textContent = this.highScore.toString();
            this.highScoreTopElement.textContent = this.highScore.toString();
        }
        
        if (!this.muted) {
            this.sounds.crash.currentTime = 0;
            this.sounds.crash.play();
        }
    }
    
    restartGame() {
        this.startGame();
    }
    
    showStartScreen() {
        this.state = 'start';
        this.gameOverlay.style.display = 'flex';
        this.startScreen.style.display = 'block';
        this.pauseScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
    }
    
    toggleMute() {
        this.muted = !this.muted;
        this.muteButton.textContent = this.muted ? '🔇' : '🔊';
    }
    
    updatePowerMeter() {
        let powerLevel = 0;
        
        if (this.monkey.powerUps.shield) {
            powerLevel = Math.max(powerLevel, this.monkey.powerUpTimers.shield / 300);
        }
        if (this.monkey.powerUps.magnet) {
            powerLevel = Math.max(powerLevel, this.monkey.powerUpTimers.magnet / 400);
        }
        if (this.monkey.powerUps.boost) {
            powerLevel = Math.max(powerLevel, this.monkey.powerUpTimers.boost / 200);
        }
        
        this.powerFillElement.style.width = `${powerLevel * 100}%`;
    }
    
    spawnObstacle() {
        const types = ['log', 'rock', 'bird'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.obstacles.push(new Obstacle(this.width, type));
    }
    
    spawnCollectible() {
        const types = ['banana', 'coconut'];
        const type = types[Math.floor(Math.random() * types.length)];
        const y = GAME_CONFIG.GROUND_HEIGHT - 100 - Math.random() * 150;
        this.collectibles.push(new Collectible(this.width, y, type));
    }
    
    spawnPowerUp() {
        const types = ['shield', 'magnet', 'boost'];
        const type = types[Math.floor(Math.random() * types.length)];
        const y = GAME_CONFIG.GROUND_HEIGHT - 150 - Math.random() * 100;
        this.powerUps.push(new PowerUp(this.width, y, type));
    }
    
    checkCollisions() {
        // Obstacle collisions
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            
            // Skip if obstacle is behind monkey
            if (obstacle.x + obstacle.width < this.monkey.x) continue;
            
            // Skip if monkey is invincible or has shield
            if (this.monkey.isInvincible || this.monkey.powerUps.shield) continue;
            
            // Adjust hitbox for sliding
            let monkeyHeight = this.monkey.height;
            if (this.monkey.isSliding) {
                monkeyHeight = this.monkey.height / 2;
            }
            
            // Check collision
            if (
                this.monkey.x < obstacle.x + obstacle.width &&
                this.monkey.x + this.monkey.width > obstacle.x &&
                this.monkey.y < obstacle.y + obstacle.height &&
                this.monkey.y + monkeyHeight > obstacle.y
            ) {
                // Collision detected
                if (this.monkey.powerUps.shield) {
                    // Remove shield instead of game over
                    this.monkey.powerUps.shield = false;
                    this.monkey.makeInvincible();
                } else {
                    let message = '';
                    if (obstacle.type === 'log') message = 'You tripped over a log!';
                    else if (obstacle.type === 'rock') message = 'You crashed into a rock!';
                    else if (obstacle.type === 'bird') message = 'That bird wasn\'t friendly!';
                    
                    this.gameOver(message);
                    return;
                }
            }
        }
        
        // Collectible collisions
        for (let i = 0; i < this.collectibles.length; i++) {
            const collectible = this.collectibles[i];
            
            if (collectible.collected) continue;
            
            // Magnet power-up extends collection range
            let collectionRange = this.monkey.powerUps.magnet ? 100 : 0;
            
            if (
                this.monkey.x - collectionRange < collectible.x + collectible.width &&
                this.monkey.x + this.monkey.width + collectionRange > collectible.x &&
                this.monkey.y - collectionRange < collectible.y + collectible.height &&
                this.monkey.y + this.monkey.height + collectionRange > collectible.y
            ) {
                // Collect item
                collectible.collected = true;
                
                // Add score
                if (collectible.type === 'banana') {
                    this.score += 10;
                } else if (collectible.type === 'coconut') {
                    this.score += 25;
                }
                
                this.scoreElement.textContent = this.score.toString();
                
                if (!this.muted) {
                    this.sounds.collect.currentTime = 0;
                    this.sounds.collect.play();
                }
            }
        }
        
        // Power-up collisions
        for (let i = 0; i < this.powerUps.length; i++) {
            const powerUp = this.powerUps[i];
            
            if (powerUp.collected) continue;
            
            if (
                this.monkey.x < powerUp.x + powerUp.width &&
                this.monkey.x + this.monkey.width > powerUp.x &&
                this.monkey.y < powerUp.y + powerUp.height &&
                this.monkey.y + this.monkey.height > powerUp.y
            ) {
                // Collect power-up
                powerUp.collected = true;
                this.monkey.activatePowerUp(powerUp.type);
                
                if (!this.muted) {
                    this.sounds.powerUp.currentTime = 0;
                    this.sounds.powerUp.play();
                }
            }
        }
    }
    
    update(dt) {
        if (this.state !== 'playing') return;
        
        // Update game speed
        this.speed = Math.min(
            GAME_CONFIG.MAX_SPEED, 
            GAME_CONFIG.INITIAL_SPEED + (this.distance * GAME_CONFIG.ACCELERATION)
        );
        
        // Apply boost power-up
        if (this.monkey.powerUps.boost) {
            this.speed *= 1.5;
        }
        
        // Update distance
        this.distance += this.speed * dt / 60;
        
        // Update score based on distance
        const newScore = Math.floor(this.distance);
        if (newScore > this.score) {
            this.score = newScore;
            this.scoreElement.textContent = this.score.toString();
        }
        
        // Update game objects
        this.background.update(this.speed);
        this.monkey.update(dt);
        
        // Update obstacles
        this.obstacles.forEach(obstacle => obstacle.update(this.speed));
        this.obstacles = this.obstacles.filter(obstacle => obstacle.x > -obstacle.width);
        
        // Update collectibles
        this.collectibles.forEach(collectible => collectible.update(this.speed));
        this.collectibles = this.collectibles.filter(collectible => 
            !collectible.collected && collectible.x > -collectible.width
        );
        
        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update(this.speed));
        this.powerUps = this.powerUps.filter(powerUp => 
            !powerUp.collected && powerUp.x > -powerUp.width
        );
        
        // Spawn obstacles
        this.obstacleTimer -= dt;
        if (this.obstacleTimer <= 0) {
            this.spawnObstacle();
            this.obstacleTimer = 60 + Math.random() * 60; // 1-2 seconds
        }
        
        // Spawn collectibles
        this.collectibleTimer -= dt;
        if (this.collectibleTimer <= 0) {
            this.spawnCollectible();
            this.collectibleTimer = 45 + Math.random() * 90; // 0.75-2.25 seconds
        }
        
        // Spawn power-ups
        this.powerUpTimer -= dt;
        if (this.powerUpTimer <= 0) {
            this.spawnPowerUp();
            this.powerUpTimer = 300 + Math.random() * 300; // 5-10 seconds
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Update power meter
        this.updatePowerMeter();
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.background.draw(this.ctx);
        
        // Draw collectibles
        this.collectibles.forEach(collectible => collectible.draw(this.ctx));
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        
        // Draw monkey
        this.monkey.draw(this.ctx);
    }
    
    gameLoop(currentTime) {
        // Calculate delta time
        const dt = this.lastTime ? (currentTime - this.lastTime) / (1000 / 60) : 1;
        this.lastTime = currentTime;
        
        // Update and draw
        this.update(dt);
        this.draw();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
