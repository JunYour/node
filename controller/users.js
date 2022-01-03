const moment = require('moment');
//json web token
const db = require('../core/mysql');
const { createToken } = require('../components/createToken')
const { nodev1id } = require('../components/nodeUuid');
const {
    encrypt, decypt
} = require('../components/crypto')
const svgCaptcha = require('svg-captcha');
// 用户类
class UsersController {
    //注册帐号
    async register(request, resposne, next) {
        try {
            // 检测管理员是否帐号重复
            let userRepeatSql = "SELECT admin_name FROM admininfo WHERE admin_name=? AND admin_status=0;";
            let paramsRepeat = [
                encrypt(request.query.username),
            ];
            let result = await db.exec(userRepeatSql, paramsRepeat);
            if (result[0] === undefined) {
                // 注册sql
                let insertSql = "INSERT INTO admininfo(admin_name,admin_pwd,admin_time,admin_status,admin_no) VALUES(?,?,?,?,?);";
                //注册参数
                let params = [
                    encrypt(request.query.username),
                    encrypt(request.query.userpwd),
                    // (new Date()).valueOf(),
                    moment().format('YYYY-MM-DD HH:mm:ss'),
                    request.query.status ? request.query.status : parseInt('0'),
                    nodev1id()
                ];
                let result = await db.exec(insertSql, params);
                if (result && result.affectedRows >= 1) {
                    resposne.json({
                        code: 0,
                        msg: "注册成功",
                    })
                } else {
                    resposne.json({
                        code: 1,
                        msg: "注册失败",

                    })
                }
            } else {
                resposne.json({
                    code: 0,
                    msg: "管理员帐号注册重复",
                });
            }
        } catch (error) {
            resposne.json({
                code: 1,
                msg: "服务器异常",
                error
            })
        }

    }
    // 登录
    async login(request, resposne, next) {
        let loginSql = "SELECT admin_name,admin_pwd,admin_time FROM admininfo WHERE admin_name=? OR admin_pwd=? AND admin_status=0;";
        let params = [
            encrypt(request.body.username),
            encrypt(request.body.userpwd),//密码md5加密
        ];
        try {

            let result = await db.exec(loginSql, params);
            if (result.length == 0) {
                resposne.json({
                    code: 1001,
                    msg: "帐号不存在",
                })
            } else if (encrypt(request.body.username) !== result[0].admin_name) {
                resposne.json({
                    code: 1003,
                    msg: "帐号错误",
                })
            }
            else if (encrypt(request.body.userpwd) !== result[0].admin_pwd) {
                resposne.json({
                    code: 1005,
                    msg: "帐号密码错误",
                })
            }
            else if (request.body.usercode !== request.cookies['captcha']) {
                resposne.json({
                    code: 1007,
                    msg: "图形验证码错误",
                })
            }
            else {
                resposne.json({
                    code: 1000,
                    msg: "登录成功",
                    data: {
                        username: decypt(result[0].admin_name),
                        userpwd: result[0].admin_pwd,
                        adminTime: moment(result[0].admin_time).format('YYYY-MM-DD HH:mm:ss'),
                    },
                    token: createToken(result[0]),//设置token
                })

            }
        } catch (error) {
            resposne.json({
                code: 1,
                msg: "服务器异常",
                error
            })
        }


    }
    // 图形验证码
    async getCaptcha(request, resposne, next) {
        try {
            var captcha = svgCaptcha.create({
                size: 4,//验证码长度
                inverse: false,// 翻转颜色 
                ignoreChars: '0o1i', // 验证码字符中排除 0o1i
                fontSize: 60, // 字体大小 
                noise: 3,// 噪声线条数 
                width: 150,// 宽度 
                height: 42,// 高度 
                color: '#cc9966',
                background: 'transparent' // 验证码图片背景颜色
            });
            // 保存到session,忽略大小写 
            request.session = captcha.text.toLowerCase();//0xtg 生成的验证码
            //保存到cookie 方便前端调用验证
            resposne.cookie('captcha', request.session);
            resposne.setHeader('Content-Type', 'image/svg+xml');
            resposne.send(captcha.data)
        } catch (error) {
            resposne.json({
                code: 1,
                msg: "服务器异常",
                error
            })
        }
    }
    //管理员列表分页查询
    async adminlist(request, resposne, next) {
        try {
            let pageSize = request.body.pageSize ? request.body.pageSize : 10,
                currentPage = request.body.currentPage ? request.body.currentPage : 1;
            let params = [(currentPage - 1) * parseInt(pageSize), parseInt(pageSize)];
            let aresultSql = 'SELECT SQL_CALC_FOUND_ROWS* FROM admininfo LIMIT ?,?;';
            let totalRowSql = 'SELECT FOUND_ROWS() as total;';
            let result = await db.exec(aresultSql, params);
            let totalRow = await db.exec(totalRowSql)
            if (result && result.length >= 1) {
                resposne.send({
                    code: 0,
                    msg: '管理员列表查询成功！',
                    data: {
                        result: result,
                        totalRow: totalRow[0].total,
                        currentPage: 1
                    }
                })
            } else {
                resposne.send({
                    code: 0,
                    msg: '暂无数据',
                });
            }
        } catch (error) {
            resposne.json({
                code: 1,
                msg: "服务器异常",
                error: error
            })
        }
    }
}
//暴露用户类
module.exports = new UsersController();