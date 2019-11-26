/*
 * createTime：2018/9/6
 * author：en.chen
 * description: 中间层提供给前端的token模块api
 */

//  token功能模块
const token = require('../controller/token/token')

module.exports = {
    "POST/cilentToken": token.cilentToken, // 通过客户端获取token
    "POST/pwdToken": token.pwdToken, // 通过密码模式获取token
}