const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const snakeSize = 20;
const snakeRadius = snakeSize / 2;
let snakeX = canvas.width / 2;
let snakeY = canvas.height / 2;
let mouseX = snakeX;
let mouseY = snakeY;
let isMoving = false;
let isBoosted = false; // 클릭으로 속도를 높이는 여부
let snakeSpeed = 5; // 뱀의 초기 이동 속도
const bodyParts = [{ x: snakeX, y: snakeY }];
const appleSize = 20;
let appleX = 0;
let appleY = 0;
let angle = 0; // 초기 회전 각도
const obstacles = [];
const score = document.getElementById("body");
const timer = document.getElementById("timer");

    function drawSnake() 
    {
        ctx.fillStyle = 'green';
        for (let i = 0; i < bodyParts.length; i++) 
        {
            const part = bodyParts[i];
            ctx.beginPath();
            ctx.arc(part.x + snakeRadius, part.y + snakeRadius, snakeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
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
            moveApple();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSnake();
        drawApple();
        checkCollision();
        requestAnimationFrame(moveSnake);

        // 호출하여 도형 그리기
        drawTriangle();
        drawRectangle();
        drawCircle();
        startGame();
    }

    function drawApple() 
    {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(appleX + appleSize / 2, appleY + appleSize / 2, appleSize / 2, 0, Math.PI * 2);
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

            // 새로운 사과 위치 설정
            appleX = Math.floor(Math.random() * (canvas.width - appleSize));
            appleY = Math.floor(Math.random() * (canvas.height - appleSize));
        }
    }

    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX - canvas.getBoundingClientRect().left - snakeRadius;
        mouseY = e.clientY - canvas.getBoundingClientRect().top - snakeRadius;
        isMoving = true;
    });

    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 마우스 왼쪽 버튼 클릭
            if (!isBoosted) {
                snakeSpeed *= 2; // 이동 속도 2배 증가
                isBoosted = true;
                setTimeout(() => {
                    snakeSpeed /= 2; // 지속 시간 후 속도 복구
                    isBoosted = false;
                }, 1000); // 1초간 클릭 속도 향상
            }
        }
    });

    // 초기 사과 위치 설정
    appleX = Math.floor(Math.random() * (canvas.width - appleSize));
    appleY = Math.floor(Math.random() * (canvas.height - appleSize));

    // 삼각형 그리기
    function drawTriangle(x,y) 
    {
        ctx.fillStyle = "blue";
        ctx.save(); //현재 그리기 상태를 스택에 저장
        ctx.translate(x,y);
        ctx.rotate(angle); // 각도를 현재 각도로 설정
        ctx.beginPath();
        ctx.moveTo(0, -20); // 시작점
        ctx.lineTo(20, 20); // 첫 번째 꼭지점
        ctx.lineTo(-20, 20); // 두 번째 꼭지점
        ctx.closePath(); // 패스 닫기
        ctx.fill(); // 도형 채우기
        ctx.restore(); //스택에서 최근에 저장된 그리기 상태를 가져와 복원
    }

    // 사각형 그리기
    function drawRectangle(x,y)
    {
        ctx.fillStyle = "black";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillRect(-20, -20, 40, 40);
        ctx.restore();
    }

    // 원 그리기
    function drawCircle(x,y) 
    {
        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(angle);
        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.arc(0,0,20,0, Math.PI * 2); // x, y, 반지름, 시작 각도, 종료 각도
        ctx.fill();
        ctx.restore();
    }

    function drawFrame() 
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTriangle(10, 10);
        drawRectangle(200, 100);
        drawCircle(300, 100);
        angle += 0.01; // 각도를 증가하여 회전
        requestAnimationFrame(drawFrame);
    }

    function startGame() 
    {
        score = 0;
        timer = 0;
        drawApple();
        updateTimer();
        moveSnake();
    }
    
    function updateTimer() 
    {
        timerDisplay.textContent = "Time: " + timer;
        timer++;
        setTimeout(updateTimer, 1000);
    }

    drawFrame();

    

    moveSnake();
