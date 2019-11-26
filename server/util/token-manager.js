/*
* createTime：2018/9/6
* author：en.chen
* description: 获取token
*/

const axios = require('axios')

class TokenManager {

    //  获取token
    static getToken() {
        //  从session中判断是否存在token,如果存在则从session中返回
        if (global.tokenMap && (global.tokenMap !== undefined)) {
            // console.log('global中已存在token', global.tokenMap.access_token)
            return global.tokenMap.access_token
        }else{
            // console.log('global中不存在token,调用接口获取')
            let url = 'http://qishon-zuul-gateway.dev.qishon.com/uaa/oauth-client/token'
            if((global.axiosBaseUrl) && (global.axiosBaseUrl !== undefined)) {
                url = global.axiosBaseUrl + '/uaa/oauth-client/token'
            }
            let params = {
                client_id: 'wissClient',
                client_secret: 'wissClientSecret'
            }
            return axios.post(url,params).then((res)=> {
                // console.log('koa-token',res)
                global.tokenMap = res.data
                return global.tokenMap.access_token
            })
        }
    }

}

/**
 * 唤醒token检测
 */
let wakeUpTokenCheck = function () {
    global.tokenMap = undefined
    TokenManager.getToken()
}

// 轮询设置token
setInterval(function () {
    wakeUpTokenCheck()
}, 6000000)

module.exports = TokenManager