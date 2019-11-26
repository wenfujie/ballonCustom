/*
 * createTime：2018-06-07
 * author：yongtian.hong
 * description: 封装四种HTTP请求类型
 * */
const axios = require('axios')
// const config = require('../config')
const TokenManager = require('./token-manager')
const moment = require('moment')

// 添加请求拦截器
axios.interceptors.request.use(function (request) {
    // 在发送请求之前做些什么
    console.log("[" + moment().format('YYYY-MM-DD HH:mm:ss ms') + "][request]" + request.url + ", 参数: " + JSON.stringify(request.params))
    return request;
}, function (error) {
    // 对请求错误做些什么
    // console.error('错误信息：', error)
    return Promise.reject(error);
});

/**
 * 返回状态判断(添加响应拦截器)
 */
axios.interceptors.response.use((response) => {
    let resUrl = response.config.url
    let data = JSON.stringify(response.data)
    if (resUrl.indexOf('file/oss') !== -1) {    // 过滤图片请求返回的参数
        data = ""
    }
    console.log("[" + moment().format('YYYY-MM-DD HH:mm:ss ms') + "][response]" + resUrl + ", 返回数据: " + data)
    return response
}, (err) => {
    // console.error('错误信息：', err)
    // try {
    //     if ((err.error === 'invalid_token') || err.response.error === 'invalid_token' || err.status === 401 || err.response.status === 401) {  // token过期处理
    //         console.log('重新获取token')
    //         global.tokenMap = undefined
    //         TokenManager.getToken()
    //     }
    // } catch (e) {
    //     throw e
    // }
    // return Promise.reject(err.response)

    console.log("koa-http-err", err)
    err.response.data.statusCode = err.response.status
    return err.response
})


class http {
    /*
     * 查询方法
     * options: 设置axios其他参数项
     * */
    static async get(serverUrl, params, options) {
        let configObj = Object.assign(    // 合并参数对象和其他axios参数对象（例如headers、responseType）
            {
                params: params
            },
            // options,
            {
                headers: {
                    Authorization: options.authorization,
                    ownCompanyId: options.owncompanyid
                }
            }
        )
        return axios.get(serverUrl, configObj)
    }

    /*
     * 获取图片
     * options:
     * */
    static async getImg(serverUrl, params, options) {
        let token = await TokenManager.getToken()
        let configObj = Object.assign(    // 合并参数对象和其他axios参数对象（例如headers、responseType）
            {
                params: params
            },
            options,
            {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }
        )
        return axios.get(serverUrl, configObj)
    }

    /*
     * 新增方法(后台使用body接收参数)
     * */
    static async post(serverUrl, params, options) {
        let configObj = Object.assign(
            // options,
            {
                headers: {
                    Authorization: options.authorization,
                    ownCompanyId: options.owncompanyid
                }
            }
        )
        return axios.post(serverUrl, params, configObj).then((res) => {
            return res.data
        })
    }

    /*
     * 新增方法(用于文件上传)
     * */
    static async postUpload(serverUrl, params, options) {
        let token = TokenManager.getToken()
        let configObj = Object.assign({
            headers: {
                Authorization: 'Bearer ' + token,
                ownCompanyId: params.ownCompanyId
            }
        }, options)
        console.log('post-params', JSON.stringify(params))
        return axios.post(serverUrl, params, configObj).then((res) => {
            return res.data
        })
    }

    /*
     * (后台使用params接收参数)
     * */
    static async postUrl(serverUrl, params, options) {
        return axios.post(serverUrl, params, {
            transformRequest: [function (data) {
                // 对 data 进行任意转换处理
                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            // options,
            headers: {
                Authorization: options.authorization,
                ownCompanyId: options.owncompanyid
            }
        }).then((res) => {
            return res
        })
    }

    /*
     *  修改方法(body传参)
     * */
    static async put(serverUrl, params) {
        return axios.put(serverUrl, params, {
            headers: {
                Authorization: options.authorization,
                ownCompanyId: options.owncompanyid
            }
        }).then((res) => {
            return res.data
        })
    }

    /*
     *  修改方法(params传参)
     * */
    static async putUrl(serverUrl, params, options) {
        return axios.put(serverUrl, params, {
            transformRequest: [function (data) {
                // 对 data 进行任意转换处理
                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                Authorization: options.authorization,
                ownCompanyId: options.owncompanyid
            }
        }).then((res) => {
            return res.data
        })
    }

    /*
     * 删除方法
     * */
    static async delete(serverUrl, params, options) {
        let configObj = Object.assign(
            {
                params: params
            },
            // options,
            {
                headers: {
                    Authorization: options.authorization,
                    ownCompanyId: options.owncompanyid
                }
            }
        )
        return axios.delete(serverUrl, configObj).then((res) => {
            return res.data
        })
    }

    static async all(...fn) {
        return axios.all(...fn)
    }
}

module.exports = http