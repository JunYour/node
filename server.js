const express = require('express');
const server = express();
const cookieParase = require('cookie-parser');
server.use(cookieParase());
//引入中间件
const bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.use(express.urlencoded({ extended: false }));
server.use(express.json());


//引入socket.io实时数据
const http = require('http').createServer(server);
const io = require('socket.io')(http);
io.on('connection', (socket) => {
    console.log("连接成功！");
    socket.on('sendMsgServe', res => {
        io.emit('getMsgFromServe', res);
    });
});


//管理员接口
server.use('/users', require('./routers/users'));
//创建服务端口
server.listen(9090, () => {
    console.log('服务启动完毕');
})
//静态资源
server.use(express.static('./piblic/static/images'));