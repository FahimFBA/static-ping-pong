const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

// Game Constants
const paddleWidth = 12;
const paddleHeight = 90;
const ballSize = 16;
const paddleSpeed = 6;
const aiSpeed = 4;

// Game Objects
const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    score: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    score: 0
};

const ball = {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    size: ballSize,
    speed: 6,
    dx: 6 * (Math.random() > 0.5 ? 1 : -1),
    dy: 6 * (Math.random() > 0.5 ? 1 : -1)
};

// Drawing Functions
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = '32px Arial';
    context.fillText(text, x, y);
}

// Game Logic
function resetBall() {
    ball.x = canvas.width / 2 - ball.size / 2;
    ball.y = canvas.height / 2 - ball.size / 2;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * (Math.random() * 2 - 1);
}

function collisionDetect(paddle, ball) {
    return (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

function update() {
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top/bottom)
    if (ball.y < 0) {
        ball.y = 0;
        ball.dy *= -1;
    } else if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }

    // Paddle collision (player)
    if (collisionDetect(player, ball)) {
        ball.x = player.x + player.width;
        ball.dx *= -1;
        // Add some "spin"
        let collidePoint = (ball.y + ball.size / 2) - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = 1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
    }

    // Paddle collision (AI)
    if (collisionDetect(ai, ball)) {
        ball.x = ai.x - ball.size;
        ball.dx *= -1;
        // Add some "spin"
        let collidePoint = (ball.y + ball.size / 2) - (ai.y + ai.height / 2);
        collidePoint = collidePoint / (ai.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = -1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
    }

    // Score (left or right)
    if (ball.x < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        player.score++;
        resetBall();
    }

    // AI movement (simple follow)
    let aiCenter = ai.y + ai.height / 2;
    if (aiCenter < ball.y + ball.size / 2 - 8) {
        ai.y += aiSpeed;
    } else if (aiCenter > ball.y + ball.size / 2 + 8) {
        ai.y -= aiSpeed;
    }
    // Prevent AI paddle from going out of bounds
    ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));
}

function render() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, '#222');

    // Net
    for (let i = 0; i < canvas.height; i += 32) {
        drawRect(canvas.width / 2 - 2, i, 4, 16, '#fff3');
    }

    // Paddles
    drawRect(player.x, player.y, player.width, player.height, '#fff');
    drawRect(ai.x, ai.y, ai.width, ai.height, '#fff');

    // Ball
    drawRect(ball.x, ball.y, ball.size, ball.size, '#fff');

    // Scores
    drawText(player.score, canvas.width / 4, 50, '#fff');
    drawText(ai.score, canvas.width * 3 / 4, 50, '#fff');
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Mouse control for left paddle
canvas.addEventListener('mousemove', function (evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const mouseY = (evt.clientY - rect.top) * scaleY;
    player.y = mouseY - player.height / 2;
    // Clamp to canvas
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
});

// Start the game
gameLoop();