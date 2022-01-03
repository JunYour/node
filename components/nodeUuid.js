// 自动生成自编号
const uuid = require('node-uuid');
// v1是根据时间戳生成的,保证唯一性
module.exports.nodev1id=()=>{
    //字符串转数组
    let uid=uuid.v1().split('-');
    return uid[0];
};