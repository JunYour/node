const crypto = require('crypto');
const { key } = require('../config');
//加密
module.exports.encrypt = (str) => {
    let cipher = crypto.createCipher('aes192', key);
    //编码方式从utf-8转为hex
    let enc = cipher.update(str, 'utf-8', 'hex');
    //编码方式转为hex
    enc += cipher.final('hex');
    return enc;
}
//解密
module.exports.decypt = (str) => {
    let cipher = crypto.createDecipher('aes192', key);
    //编码方式从hex转为utf-8
    let dec = cipher.update(str, 'hex', 'utf-8');
    //编码方式转为utf-8
    dec += cipher.final('utf-8');
    return dec;
}