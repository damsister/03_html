const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const snakeSize = 20;
const snakeRadius = snakeSize / 2;
let snakeX = canvas.width / 2;
let snakeY = canvas.height / 2;
let mouseX = snakeX;
let mouseY = snakeY;
let isMoving = false;
let isBoosted = false;
let snakeSpeed = 5;
const speedMultiplier = 1.0; // speedMultiplier 초기값 설정
const bodyParts = [{ x: snakeX, y: snakeY }];
const appleSize = 20;
let appleX = 0;
let appleY = 0;
const obstacles = [];
let isGameOver = false;
let score = 0; // 점수 변수 추가
let scoreDisplay = document.getElementById('scoreDisplay'); // 점수를 표시할 요소

// 게임 시작 시간을 기록하는 변수
let gameStartTime = Date.now();
// 게임 시간을 표시할 HTML 요소
let timeDisplay = document.getElementById('timeDisplay');

class Obstacle 
{
    constructor(x, y, size, type, angle) 
    {
        this.x = x;
        this.y = y;
        this.speed = (Math.random() * 2 + 1) * speedMultiplier;
        this.size = size;
        this.type = type;
        this.angle = angle;
    }

    update() 
    {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.angle += 0.01;

        if (this.x < -this.size ||
            this.x > canvas.width ||
            this.y < -this.size ||
            this.y > canvas.height) 
        {
            obstacles.splice(obstacles.indexOf(this), 1);
        }
    }

    GameLoop() 
    {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (this.type === 'triangle') 
        {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();
            ctx.fill();
        } 
        else if (this.type === 'square') 
        {
            ctx.fillStyle = 'purple';
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } 
        else if (this.type === 'circle') 
        {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

let obstacleCreationInterval = 2000; // 초기 장애물 생성 간격

function createRandomObstacle() 
{
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 20 + 10;
    const angle = Math.random() * Math.PI * 2;
    const types = ['triangle', 'square', 'circle'];
    const type = types[Math.floor(Math.random() * 3)];

    const obstacle = new Obstacle(x, y, size, type, angle);
    obstacles.push(obstacle);
    
    // 게임 진행에 따라 장애물 생성 간격을 줄여 더 빨리 생성되도록 조절합니다.
    obstacleCreationInterval -= 100; // 필요에 따라 이 값을 조절합니다.
}

function GameLoop() 
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const obstacle of obstacles) 
    {
        obstacle.update();
        obstacle.GameLoop();
    }

        drawSnake();
        drawApple();
        checkCollision();
        requestAnimationFrame(GameLoop);
}

setInterval(createRandomObstacle, obstacleCreationInterval);

    setInterval(() => {
        snakeSpeed += 1;
    }, 10000);

    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX - canvas.getBoundingClientRect().left - snakeRadius;
        mouseY = e.clientY - canvas.getBoundingClientRect().top - snakeRadius;
        isMoving = true;
    });

    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) 
        {
            if (!isBoosted) 
            {
                snakeSpeed *= 2;
                isBoosted = true;
                setTimeout(() => {
                    snakeSpeed /= 2;
                    isBoosted = false;
                    }, 1000);
            }
        }
    });

// 뱀 그리기 함수
function drawSnake() 
{
    ctx.fillStyle = 'green';
    for (let i = 0; i < bodyParts.length; i++) 
    {
        const part = bodyParts[i];
        ctx.beginPath();
        ctx.arc(part.x, part.y, snakeRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
}

function moveSnake() 
{
    if (isMoving) 
    {
        const dx = mouseX - snakeX;
        const dy = mouseY - snakeY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < snakeSize) 
        {
            isMoving = false;
        }

        snakeX += (dx / distance) * snakeSpeed;
        snakeY += (dy / distance) * snakeSpeed;

        //뱀의 머리와 몸통의 거리
        snakeX += (1 / 3) * (dx / distance) * snakeSize;
        snakeY += (1 / 3) * (dy / distance) * snakeSize;

        bodyParts.unshift({ x: snakeX, y: snakeY });
            
        if (bodyParts.length > 3) 
        {
            bodyParts.pop();
        }
    }
    if (snakeX === appleX && snakeY === appleY) 
    {
        score++;
        scoreDisplay.textContent = "Score: " + score;
        drawApple();
    }

    // 현재 시간 계산
    const currentTime = Date.now();
    const elapsedTime = (currentTime - gameStartTime) / 1000; // 경과 시간(초) 계산
    timeDisplay.textContent = "Time: " + elapsedTime.toFixed(0); // 시간 표시
    //.toFixed(1): 소수점 한 자리

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawApple();
    checkCollision();
    requestAnimationFrame(moveSnake);
}

// 사과 그리기 함수
function drawApple() 
{
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(appleX, appleY, appleSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function checkCollision() 
{
    const headX = bodyParts[0].x;
    const headY = bodyParts[0].y;

    if (headX + snakeSize > appleX && headX < appleX + appleSize && 
        headY + snakeSize > appleY && headY < appleY + appleSize) 
    {
        // 뱀이 사과를 먹음
        const tail = { x: bodyParts[bodyParts.length - 1].x, y: bodyParts[bodyParts.length - 1].y };
        bodyParts.push(tail);
            score++;
            scoreDisplay.textContent = "Score: " + score;
            drawApple();

        // 새로운 사과 위치 설정
        appleX = Math.floor(Math.random() * (canvas.width - appleSize));
        appleY = Math.floor(Math.random() * (canvas.height - appleSize));
    }
    // 뱀과 장애물 간의 충돌을 확인
    for (const obstacle of obstacles) 
    {
        if (headX + snakeSize > obstacle.x &&
            headX < obstacle.x + obstacle.size &&
            headY + snakeSize > obstacle.y &&
            headY < obstacle.y + obstacle.size) 
        {
            isGameOver = true;
        }
    }

    if (isGameOver) 
    {
        // 게임 종료 시 처리
        const restartGame = confirm("게임 오버\n점수: " + score + "\n게임을 다시 시작하시겠습니까?");
        if (restartGame) 
        {
            reset(); // 게임을 재설정하고 다시 시작
        }
    }
}

function reset() 
{
    // 초기 상태로 변수 및 요소를 설정
    snakeX = canvas.width / 2;
    snakeY = canvas.height / 2;
    mouseX = snakeX;
    mouseY = snakeY;
    isMoving = false;
    isBoosted = false;
    snakeSpeed = 5;
    bodyParts.length = 1;
    bodyParts[0] = { x: snakeX, y: snakeY };
    appleX = Math.floor(Math.random() * (canvas.width - appleSize));
    appleY = Math.floor(Math.random() * (canvas.height - appleSize));
    obstacles.length = 0;
    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = "Score: " + score;

    // 게임 시작 시간을 다시 기록
    gameStartTime = Date.now();
}

// 초기 사과 위치 설정
appleX = Math.floor(Math.random() * (canvas.width - appleSize));
appleY = Math.floor(Math.random() * (canvas.height - appleSize));

// 뱀의 초기 위치 설정 (중앙에 배치)
snakeX = canvas.width / 2;
snakeY = canvas.height / 2;
mouseX = snakeX;
mouseY = snakeY;

moveSnake(); // 뱀 이동 및 게임 진행
//게임 루프 시작
GameLoop(); // 게임 화면 그리기