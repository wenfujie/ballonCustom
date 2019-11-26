/*
* createTime：2018/9/6
* author：en.chen
* description:  获取token
*/

const config = require("../config");

const axios = require('axios')

let url = config.baseUrl + '/uaa/oauth-client/token'

class getToken {

    //  通过客户端获取token
    static async getCilentToken(ctx, params) {
        params.client_id = global.shopClientId
        params.client_secret = global.shopClientSecret
        return axios.post(url, params).then((res) => {
            return res.data
        });
    }

    //  通过密码模式获取token
    static async getPwdToken(ctx, params) {
        return ctx.$post(url, params).then((res) => {
            return res
        });
    }

}

module.exports = getToken