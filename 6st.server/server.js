const express = require('express');
const app = express();
const port = 3000;

// CORS 미들웨어 추가
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/hi', hi);

function hi(req, res) {
    res.send('202227005 김도현 하이브리드 앱 6주차 과제 성공!!!!');
}

app.listen(port, () => {
    console.log(`202227005 김도현 하이브리드앱 6주차 과제 서버 (http://localhost:${port}/hi)`);
});