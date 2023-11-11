const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const snakeSize = 20; //뱀의 크기
const snakeRadius = snakeSize / 2; //뱀의 반지름

// 뱀의 초기 위치 설정 (중앙에 배치)
let snakeX = canvas.width / 2;
let snakeY = canvas.height / 2;
let mouseX = snakeX;
let mouseY = snakeY;

let isMoving = false;
let isBoosted = false;
let snakeSpeed = 5;
const bodyParts = [{ x: snakeX, y: snakeY }]; //몸통 배열
const appleSize = 20; //사과 크기

//사과 위치 선언
let appleX;
let appleY;

//장애물 속도
const speedMultiplier = 1.0; //speedMultiplier 초기값 설정
const obstacles = []; //장애물

let isGameOver = false;
let score = 0; //점수 변수
let scoreDisplay = document.getElementById('scoreDisplay'); //점수를 표시할 요소

// 게임 시작 시간을 기록하는 변수
let gameStartTime = Date.now();
// 게임 시간을 표시할 HTML 요소
let timeDisplay = document.getElementById('timeDisplay');

class Obstacle 
{
    constructor(size, type, angle) 
    {
        const position = Math.random();
        if (position < 0.25) {
            this.x = -size;
            this.y = Math.random() * canvas.height;
        } else if (position < 0.5) {
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
        } else if (position < 0.75) {
            this.x = Math.random() * canvas.width;
            this.y = -size;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + size;
        }
        
        this.speed = (Math.random() * 2 + 1) * speedMultiplier;
        this.size = 20;
        this.type = type;
        this.rotationAngle = angle;
    }

    update() {
        // 장애물을 캔버스 중앙으로 이동하기 위해 업데이트
        const dx = canvas.width / 2;
        const dy = canvas.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;

        if (this.x + this.size < 0 || this.x - this.size > canvas.width || this.y + this.size < 0 || this.y - this.size > canvas.height) {
            // 장애물이 캔버스 밖으로 나가면 재생성
            this.respawn();
        }

        this.rotationAngle += 0.01; // 회전 각도 업데이트
    }

    //화면에 그리기 위해 메서드 호출
    draw() 
    {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle); // 회전 적용

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
            ctx.fillRect(-20, -20, 40, 40);
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
    
    respawn() {
        // 장애물을 무작위로 캔버스 바깥에서 다시 생성
        const position = Math.random();
        if (position < 0.25) {
            this.x = -this.size;
            this.y = Math.random() * canvas.height;
        } else if (position < 0.5) {
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
        } else if (position < 0.75) {
            this.x = Math.random() * canvas.width;
            this.y = -this.size;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + this.size;
        }
    }
}

let obstacleCreationInterval = 2000; // 초기 장애물 생성 간격

//장애물 랜덤 생성
function createRandomObstacle() {
    const size = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const types = ['triangle', 'square', 'circle'];
    const type = types[Math.floor(Math.random() * 3)];

    const obstacle = new Obstacle(size, type, angle);
    obstacles.push(obstacle);
}

function GameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.update();
        obstacle.draw();
    }

    drawSnake();
    drawApple();
    checkCollision();
    requestAnimationFrame(GameLoop);
}
setInterval(createRandomObstacle, obstacleCreationInterval); //createRandomObstacle함수를 obstacleCreationInterval 간격으로 호출ㄴ
//setInterval: 일정 시간 간격으로 호출

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - canvas.getBoundingClientRect().left - snakeRadius;
    mouseY = e.clientY - canvas.getBoundingClientRect().top - snakeRadius;
    isMoving = true;
}); //뱀 이동 이벤트

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
            }, 500); //1초 동안 유지 후 원상복구
        }
    }
}); //뱀 부스터 이벤트

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
        //마우스 위치
        const dx = mouseX - snakeX;
        const dy = mouseY - snakeY;
        const distance = Math.sqrt(dx * dx + dy * dy); //

        if (distance < snakeSize) 
        {
            isMoving = false;
        }

        // 이동 벡터 크기 및 방향 계산
        if (distance > 0) 
        {
            snakeX += (dx / distance) * snakeSpeed;
            snakeY += (dy / distance) * snakeSpeed;
        }   

        bodyParts.unshift({ x: snakeX, y: snakeY });
        //unshift: 배열의 맨 앞에 하나 이상의 요소를 추가
            
        if (bodyParts.length > 3) 
        {
            bodyParts.pop();
        }
        //pop: 배열에서 맨 뒤의 요소를 제거하고 반환하는 역할
    }
    //뱀이 사과를 먹으면 점수가 오른다.
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
    checkCollision(); //충돌 여부 확인
    requestAnimationFrame(moveSnake); //moveSnake호출하여 게임 업데이트
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

//충돌 여부 확인 함수
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
        if (
            headX + snakeSize / 2 > obstacle.x - obstacle.size / 2 &&
            headX - snakeSize / 2 < obstacle.x + obstacle.size / 2 &&
            headY + snakeSize / 2 > obstacle.y - obstacle.size / 2 &&
            headY - snakeSize / 2 < obstacle.y + obstacle.size / 2
        )
        {
            isGameOver = true;
        }
    }

    //게임 오버 시
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


moveSnake(); // 뱀 이동 및 게임 진행
//게임 루프 시작
GameLoop();