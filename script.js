document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreElement = document.getElementById('finalScore');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');

    // --- Game Configuration ---
    const TILE_SIZE = 20; // Size of player/alien squares
    const PLAYER_SPEED = 5;
    const BULLET_SPEED = 7;
    const ALIEN_BULLET_SPEED = 4;
    const ALIEN_ROWS = 5;
    const ALIEN_COLS = 11;
    const ALIEN_SPACING_X = TILE_SIZE * 1.8;
    const ALIEN_SPACING_Y = TILE_SIZE * 1.5;
    const ALIEN_START_Y = 50;
    const ALIEN_DROP_DISTANCE = TILE_SIZE / 2;
    let initialAlienSpeed = 0.5; // Initial horizontal speed
    let alienShootInterval = 1000; // ms between alien shots (average)

    // --- Game State ---
    let player;
    let bullets = [];
    let aliens = [];
    let alienBullets = [];
    let alienDirection = 1; // 1 for right, -1 for left
    let alienSpeed = initialAlienSpeed;
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let gameRunning = false;
    let keysPressed = {};
    let lastAlienMoveTime = 0;
    let alienMoveInterval = 1000; // ms - will adjust based on alien count
    let lastAlienShootTime = 0;
    let alienMoveSoundIndex = 0;

    // --- Audio ---
    let sounds = {};

    function loadAudio() {
        sounds.shoot = new Audio('audio/shoot.wav');
        sounds.invaderkilled = new Audio('audio/invaderkilled.wav');
        sounds.explosion = new Audio('audio/explosion.wav');
        // Add multiple alien move sounds for variety/classic feel
        sounds.alienMove = [
            new Audio('audio/fastinvader1.wav'),
            new Audio('audio/fastinvader2.wav'),
            new Audio('audio/fastinvader3.wav'),
            new Audio('audio/fastinvader4.wav')
        ];
        // Lower volume for move sounds
        sounds.alienMove.forEach(sound => sound.volume = 0.3);
        sounds.explosion.volume = 0.5;

        // Attempt to load (browsers might block until interaction)
        Object.values(sounds).forEach(sound => {
            if (Array.isArray(sound)) {
                sound.forEach(s => s.load());
            } else {
                sound.load();
            }
        });
        console.log("Audio loading initiated...");
    }

    function playSound(soundName) {
        if (sounds[soundName]) {
            if (soundName === 'alienMove') {
                const sound = sounds.alienMove[alienMoveSoundIndex];
                sound.currentTime = 0; // Rewind if already playing
                sound.play().catch(e => console.log("Error playing move sound:", e));
                alienMoveSoundIndex = (alienMoveSoundIndex + 1) % sounds.alienMove.length;
            } else {
                const sound = sounds[soundName];
                sound.currentTime = 0; // Rewind
                sound.play().catch(e => console.log(`Error playing ${soundName}:`, e));
            }
        } else {
            console.warn(`Sound not found: ${soundName}`);
        }
    }

    // --- Game Objects ---
    class Player {
        constructor(x, y, width, height, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.canShoot = true;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        moveLeft() {
            this.x -= PLAYER_SPEED;
            if (this.x < 0) this.x = 0;
        }

        moveRight() {
            this.x += PLAYER_SPEED;
            if (this.x + this.width > canvas.width) {
                this.x = canvas.width - this.width;
            }
        }

        shoot() {
            if (this.canShoot) {
                bullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y, 5, 10, 'yellow', -BULLET_SPEED));
                playSound('shoot');
                this.canShoot = false;
                // Cooldown timer for shooting
                setTimeout(() => { this.canShoot = true; }, 500); // 500ms cooldown
            }
        }
    }

    class Bullet {
        constructor(x, y, width, height, color, speedY) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.speedY = speedY; // Negative for player, positive for alien
        }

        update() {
            this.y += this.speedY;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Alien {
        constructor(x, y, width, height, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.alive = true;
        }

        draw() {
            if (this.alive) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    // --- Game Initialization ---
    function initGame() {
        gameOver = false;
        gameRunning = true;
        score = 0;
        lives = 3;
        bullets = [];
        aliens = [];
        alienBullets = [];
        alienDirection = 1;
        alienSpeed = initialAlienSpeed; // Reset speed
        keysPressed = {};

        player = new Player(
            canvas.width / 2 - TILE_SIZE / 2,
            canvas.height - TILE_SIZE * 2,
            TILE_SIZE,
            TILE_SIZE,
            'limegreen'
        );

        createAliens();
        updateUI();

        gameOverScreen.style.display = 'none';
        startScreen.style.display = 'none';
        canvas.focus(); // Ensure canvas can receive key events if needed (though we use document listener)

        // Reset timers
        lastAlienMoveTime = performance.now();
        lastAlienShootTime = performance.now();
        alienMoveInterval = calculateAlienMoveInterval(); // Initial calculation

        // Start the game loop
        if (!gameRunning) { // Prevent multiple loops if already started somehow
            gameLoop(performance.now());
        }
    }

    function createAliens() {
        aliens = []; // Clear existing aliens
        const startX = (canvas.width - (ALIEN_COLS * ALIEN_SPACING_X - (ALIEN_SPACING_X - TILE_SIZE))) / 2; // Center the grid

        for (let row = 0; row < ALIEN_ROWS; row++) {
            for (let col = 0; col < ALIEN_COLS; col++) {
                const x = startX + col * ALIEN_SPACING_X;
                const y = ALIEN_START_Y + row * ALIEN_SPACING_Y;
                const color = row < 2 ? 'pink' : row < 4 ? 'cyan' : 'lightcoral'; // Different colors per row
                aliens.push(new Alien(x, y, TILE_SIZE, TILE_SIZE, color));
            }
        }
    }


    // --- Input Handling ---
    document.addEventListener('keydown', (e) => {
        keysPressed[e.code] = true;
        // Prevent default space bar scroll
        if (e.code === 'Space' && gameRunning && !gameOver) {
             e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.code] = false;
    });

    function handleInput() {
        if (gameOver || !gameRunning) return;

        if (keysPressed['ArrowLeft'] || keysPressed['KeyA']) {
            player.moveLeft();
        }
        if (keysPressed['ArrowRight'] || keysPressed['KeyD']) {
            player.moveRight();
        }
        if (keysPressed['Space']) {
            player.shoot();
             // Optional: Prevent holding space for continuous fire, require separate presses
             // keysPressed['Space'] = false; // Uncomment this line if you want single shots per press
        }
    }

    // --- Game Logic ---
    function update(timestamp) {
        if (gameOver || !gameRunning) return;

        handleInput();

        // Update player bullets
        bullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.y + bullet.height < 0) {
                bullets.splice(index, 1); // Remove bullets going off-screen
            }
        });

        // Update alien bullets
        alienBullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.y > canvas.height) {
                alienBullets.splice(index, 1); // Remove bullets going off-screen
            }
        });

        // Move Aliens
        moveAliens(timestamp);

        // Alien Shooting
        alienShoot(timestamp);

        // Collision Detection
        checkCollisions();

        // Check Win/Loss Conditions
        checkGameOver();
    }

    function calculateAlienMoveInterval() {
        // Speed up movement as fewer aliens remain
        const livingAliens = aliens.filter(a => a.alive).length;
        const totalAliens = ALIEN_ROWS * ALIEN_COLS;
        // Example scaling: starts at 1000ms, goes down to ~100ms
        // Adjust the formula for desired difficulty curve
        const baseInterval = 1000;
        const minInterval = 100;
        const speedFactor = Math.max(0, (livingAliens / totalAliens) - 0.1); // Don't go below 10% instantly
        return minInterval + (baseInterval - minInterval) * speedFactor * speedFactor; // Exponential curve feels better
    }


    function moveAliens(timestamp) {
        alienMoveInterval = calculateAlienMoveInterval(); // Recalculate each frame (or less often)

        if (timestamp - lastAlienMoveTime > alienMoveInterval) {
            lastAlienMoveTime = timestamp;
            playSound('alienMove');

            let hitEdge = false;
            let lowestY = 0;

            aliens.forEach(alien => {
                if (alien.alive) {
                    alien.x += alienSpeed * alienDirection;
                    if (alien.x <= 0 || alien.x + alien.width >= canvas.width) {
                        hitEdge = true;
                    }
                    lowestY = Math.max(lowestY, alien.y + alien.height);
                }
            });

            if (hitEdge) {
                alienDirection *= -1; // Reverse direction
                 // Increase horizontal speed slightly on edge hit
                alienSpeed *= 1.02;
                aliens.forEach(alien => {
                    if (alien.alive) {
                        alien.y += ALIEN_DROP_DISTANCE; // Move down
                        alien.x += alienSpeed * alienDirection; // Move slightly after drop to prevent sticking
                    }
                });
            }
             // Check if aliens reached the bottom (after moving)
             if(lowestY >= player.y){
                triggerGameOver();
             }
        }
    }

     function alienShoot(timestamp) {
        if (timestamp - lastAlienShootTime > alienShootInterval && aliens.filter(a => a.alive).length > 0) {
            lastAlienShootTime = timestamp;

            // Find potential shooters (bottom-most aliens in each column that are alive)
            const shooters = [];
            const columns = {}; // Keep track of the lowest alien in each column

            aliens.forEach(alien => {
                 if (alien.alive) {
                    const colIndex = Math.round(alien.x / ALIEN_SPACING_X); // Approximate column
                    if (!columns[colIndex] || alien.y > columns[colIndex].y) {
                        columns[colIndex] = alien;
                    }
                }
            });

            const potentialShooters = Object.values(columns);

            if (potentialShooters.length > 0) {
                // Choose a random shooter from the potential ones
                const shooter = potentialShooters[Math.floor(Math.random() * potentialShooters.length)];
                 // Add small random chance adjustment to interval
                alienShootInterval = 800 + Math.random() * 500;

                alienBullets.push(new Bullet(
                    shooter.x + shooter.width / 2 - 2.5, // Center bullet
                    shooter.y + shooter.height,
                    5, 10, 'red', ALIEN_BULLET_SPEED
                ));
                // Optional: Play alien shoot sound here if you have one
            }
        }
    }


    function checkCollisions() {
        // Player bullets vs Aliens
        bullets.forEach((bullet, bulletIndex) => {
            aliens.forEach((alien) => {
                if (alien.alive && isColliding(bullet, alien)) {
                    alien.alive = false;
                    bullets.splice(bulletIndex, 1); // Remove bullet
                    score += 10; // Increase score
                    playSound('invaderkilled');
                    updateUI();
                    // Optionally increase alien speed slightly when one is killed
                    // alienSpeed *= 1.01;
                }
            });
        });

        // Alien bullets vs Player
        alienBullets.forEach((bullet, bulletIndex) => {
            if (isColliding(bullet, player)) {
                alienBullets.splice(bulletIndex, 1); // Remove bullet
                playerHit();
            }
        });

        // Aliens vs Player (direct collision - game over)
        aliens.forEach(alien => {
             if(alien.alive && isColliding(alien, player)){
                triggerGameOver();
             }
        });
    }

    function isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    function playerHit() {
        lives--;
        playSound('explosion');
        updateUI();
        if (lives <= 0) {
            triggerGameOver();
        } else {
            // Optional: Add brief invincibility or reset player position
            // For simplicity, we just decrement lives here.
        }
    }

    function checkGameOver() {
        // Check if aliens reached the bottom (already checked in moveAliens)

        // Check if all aliens are dead (win condition for the 'level')
        if (aliens.every(alien => !alien.alive)) {
            // For this simple version, winning means game over with success
            // Or you could start a new, harder level here
             console.log("Wave Cleared!");
             // triggerGameOver(true); // Or implement next level logic
             // Reset for next wave (example):
             setTimeout(() => {
                alert("Wave Cleared! Prepare for the next!");
                initialAlienSpeed *= 1.1; // Make next wave faster
                alienShootInterval *= 0.9; // Make them shoot more often
                initGame(); // Re-initialize (keeps score/lives)
                createAliens(); // Create new set of aliens
                player.x = canvas.width / 2 - TILE_SIZE / 2; // Reset player position
             }, 1000);
        }
    }

     function triggerGameOver(won = false) {
        if(gameOver) return; // Prevent multiple triggers

        console.log("Game Over Triggered");
        gameOver = true;
        gameRunning = false;
        playSound('explosion'); // Play explosion on game over regardless of win/loss for now

        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'flex';
        if (won) {
             gameOverScreen.querySelector('h2').textContent = "You Won!";
        } else {
             gameOverScreen.querySelector('h2').textContent = "Game Over!";
        }
    }

    // --- Drawing ---
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000'; // Black background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!gameRunning && !gameOver) {
             // Only show start screen if game hasn't started and isn't over
             startScreen.style.display = 'flex';
             return; // Don't draw game elements yet
        } else {
             startScreen.style.display = 'none'; // Ensure start screen is hidden during play
        }


        // Draw Player
        if (!gameOver) { // Don't draw player if game is over
             player.draw();
        }


        // Draw Bullets
        bullets.forEach(bullet => bullet.draw());
        alienBullets.forEach(bullet => bullet.draw());

        // Draw Aliens
        aliens.forEach(alien => alien.draw());

        // Draw UI (already handled by HTML overlay)
    }

    function updateUI() {
        scoreElement.textContent = score;
        livesElement.textContent = lives;
    }

    // --- Game Loop ---
    let lastFrameTime = 0;
    function gameLoop(timestamp) {
        if (!gameRunning && !gameOver) { // Stop loop if game explicitly stopped or over
             console.log("Game loop stopped.");
             return;
        }

        const deltaTime = timestamp - lastFrameTime;
        lastFrameTime = timestamp;

        // console.log(`DeltaTime: ${deltaTime.toFixed(2)}ms`); // For debugging frame rate

        update(timestamp); // Pass timestamp for time-based logic
        draw();

        requestAnimationFrame(gameLoop); // Request next frame
    }


    // --- Event Listeners ---
    startButton.addEventListener('click', () => {
        console.log("Start button clicked");
        loadAudio(); // Ensure audio context is ready after user interaction
        // Brief delay to allow audio loading potentially
        setTimeout(() => {
            initGame();
            gameLoop(performance.now()); // Start the loop explicitly after init
        }, 100); // Small delay
    });

    restartButton.addEventListener('click', () => {
        console.log("Restart button clicked");
        gameOverScreen.style.display = 'none';
        // Reset speeds for a fresh game
        initialAlienSpeed = 0.5;
        alienShootInterval = 1000;
        initGame(); // Re-initialize everything
        gameLoop(performance.now()); // Start the loop again
    });

    // Initial call to show start screen correctly
     draw();

}); // End DOMContentLoaded