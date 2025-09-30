<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monkey Runner - Jungle Adventure</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(135deg, #2d5016, #4a7c59);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }

        .game-container {
            position: relative;
            width: 800px;
            height: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            border: 3px solid #8B4513;
        }

        #gameCanvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        #gameOverlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .screen {
            width: 90%;
            max-width: 600px;
            max-height: 90%;
            background: linear-gradient(135deg, #f4e4bc, #ddbf94);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border: 3px solid #8B4513;
            animation: fadeIn 0.5s ease-out;
            overflow-y: auto;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h1 {
            color: #2d5016;
            font-size: 2rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 0 rgba(139, 69, 19, 0.3);
        }

        h2 {
            color: #4a7c59;
            font-size: 1.3rem;
            margin-bottom: 15px;
        }

        h3 {
            color: #2d5016;
            font-size: 1rem;
            margin: 10px 0;
        }

        .game-button {
            background: linear-gradient(135deg, #228B22, #32CD32);
            color: white;
            border: none;
            padding: 10px 25px;
            font-size: 1rem;
            border-radius: 50px;
            cursor: pointer;
            margin: 8px;
            transition: all 0.2s;
            box-shadow: 0 4px 0 #006400;
            border: 2px solid #8B4513;
        }

        .game-button:hover {
            background: linear-gradient(135deg, #32CD32, #7CFC00);
            transform: translateY(-2px);
        }

        .game-button:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #006400;
        }

        .game-button.secondary {
            background: linear-gradient(135deg, #8B4513, #A0522D);
            box-shadow: 0 4px 0 #654321;
        }

        .game-button.secondary:hover {
            background: linear-gradient(135deg, #A0522D, #CD853F);
        }

        .score-display {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            font-size: 1.1rem;
            font-weight: bold;
            color: #2d5016;
            border: 2px solid #8B4513;
        }

        .high-score {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border-radius: 8px;
            padding: 8px;
            margin: 10px auto;
            width: fit-content;
            font-weight: bold;
            color: #2d5016;
            border: 2px solid #8B4513;
        }

        .character-select {
            margin: 15px 0;
        }

        .character-options {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 10px 0;
        }

        .character {
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s;
            border: 2px solid transparent;
        }

        .character:hover {
            background: rgba(139, 69, 19, 0.1);
        }

        .character[data-selected="true"] {
            background: rgba(34, 139, 34, 0.2);
            border: 2px solid #228B22;
        }

        .character-preview {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 8px;
            background-color: #f5f5f5;
            border: 3px solid #8B4513;
            position: relative;
            overflow: hidden;
        }

        .character-preview.default {
            background: linear-gradient(135deg, #D2691E, #CD853F);
        }

        .character-preview.ninja {
            background: linear-gradient(135deg, #2F4F4F, #696969);
        }

        .character-preview.space {
            background: linear-gradient(135deg, #4169E1, #87CEEB);
        }

        .character p {
            font-size: 0.9rem;
            margin: 0;
        }

        .instructions {
            margin-top: 15px;
            padding: 12px;
            background: rgba(139, 69, 19, 0.1);
            border-radius: 8px;
            border: 1px solid #8B4513;
        }

        .instructions p {
            margin: 3px 0;
            color: #2d5016;
            font-weight: bold;
            font-size: 0.9rem;
        }

        .hud {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 5;
            background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
        }

        .score-container {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .score {
            background: rgba(139, 69, 19, 0.8);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            border: 1px solid #8B4513;
        }

        .power-meter {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .power-label {
            color: white;
            font-weight: bold;
            text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
        }

        .power-bar {
            width: 100px;
            height: 10px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
            overflow: hidden;
            border: 1px solid #8B4513;
        }

        #powerFill {
            height: 100%;
            width: 0%;
            background: linear-gradient(to right, #FFD700, #32CD32);
            transition: width 0.3s;
        }

        .controls button {
            background: rgba(139, 69, 19, 0.8);
            color: white;
            border: 1px solid #8B4513;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-left: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .controls button:hover {
            background: rgba(139, 69, 19, 1);
        }
    </style>
</head>
<body>
    <div class="game-container">
        <canvas id="gameCanvas" width="800" height="400"></canvas>
        
        <div class="hud">
            <div class="score-container">
                <span class="score">SCORE: <span id="score">0</span></span>
                <span class="score">HIGH SCORE: <span id="highScoreTop">0</span></span>
            </div>
            <div class="power-meter">
                <span class="power-label">POWER</span>
                <div class="power-bar"><div id="powerFill"></div></div>
            </div>
            <div class="controls">
                <button id="pauseButton" title="Pause">❚❚</button>
                <button id="muteButton" title="Mute">🔊</button>
            </div>
        </div>

        <div id="gameOverlay">
            <div id="startScreen" class="screen">
                <h1>🐵 Monkey Runner 🌴</h1>
                <h2>Jungle Adventure</h2>
                <div class="high-score">HIGH SCORE: <span id="highScore">0</span></div>
                
                <div class="character-select">
                    <h3>SELECT YOUR MONKEY</h3>
                    <div class="character-options">
                        <div class="character" data-character="default" data-selected="true">
                            <div class="character-preview default"></div>
                            <p>Jungle</p>
                        </div>
                        <div class="character" data-character="ninja" data-selected="false">
                            <div class="character-preview ninja"></div>
                            <p>Shadow</p>
                        </div>
                        <div class="character" data-character="space" data-selected="false">
                            <div class="character-preview space"></div>
                            <p>Sky</p>
                        </div>
                    </div>
                </div>
                
                <button id="startButton" class="game-button">🚀 Start Adventure</button>
                
                <div class="instructions">
                    <p>🎮 SPACE / Arrow UP / Click: Jump & Double Jump</p>
                    <p>⬇️ Arrow DOWN: Slide (under birds)</p>
                    <p>🍌 Collect bananas and coconuts for points!</p>
                    <p>⚡ Grab power-ups for special abilities!</p>
                </div>
            </div>

            <div id="pauseScreen" class="screen" style="display: none;">
                <h2>⏸️ Game Paused</h2>
                <button id="resumeButton" class="game-button">▶️ Resume</button>
                <button id="quitButton" class="game-button secondary">🏠 Quit to Menu</button>
            </div>

            <div id="gameOverScreen" class="screen" style="display: none;">
                <h1>💥 Game Over</h1>
                <h2 id="crashMessage">You crashed!</h2>
                <div class="score-display">Your Score: <span id="finalScore">0</span></div>
                <button id="restartButton" class="game-button">🔄 Play Again</button>
                <button id="menuButton" class="game-button secondary">🏠 Main Menu</button>
            </div>
        </div>
    </div>

    <script>
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

        class Obstacle { /* Your original Obstacle class */ }
        class Collectible { /* Your original Collectible class */ }
        class PowerUp { /* Your original PowerUp class */ }
        class Background { /* Your original Background class */ }
        class Particle { /* Your original Particle class */ }
        class Game { /* Your original Game class */ }

        // Initialize game when page loads
        window.addEventListener('load', () => {
            const game = new Game();
        });

    </script>
</body>
</html>
