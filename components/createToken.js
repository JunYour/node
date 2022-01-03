const jwt = require('jwt-simple')
const { tokenKey } = require('../config');
// 生成token
module.exports.createToken = (data) => {
    return jwt.encode({
        exp: Date.now() + (1000 * 60 * 60 * 24),//token有效时间为一天时间
        info: data
    }, tokenKey)
}