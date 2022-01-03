const express = require('express');
//用户路由
let router = express.Router();
//登录
router.post('/login', require('../controller/users').login);
//注册
router.post('/register', require('../controller/users').register);
// 图形验证码
router.get('/getCaptcha', require('../controller/users').getCaptcha);
//管理员分页查询列表
router.post('/adminlist', require('../controller/users').adminlist);
//暴露用户路由
module.exports = router;