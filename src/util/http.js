/**
 *
 * @description: axios二次封装
 * @author: junyong.hong
 * @createTime: 2018/5/23
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */
import axios from 'axios'
import Storage from './storage.js'
import '../util/common'
import tokenManager from "./tokenManager" // 全局参数

//  请求超时时间
axios.defaults.timeout = 20000

axios.defaults.baseURL = baseConstant.serverUrl

/**
 * 返回状态判断(添加请求拦截器)
 */
axios.interceptors.request.use(config => {
    return config
}, err => {
    return Promise.reject(err)
})

/**
 * 返回状态判断(添加响应拦截器)
 */
axios.interceptors.response.use(response => {
    let resStr = JSON.stringify(response)
    if(resStr.indexOf('invalid_token') !== -1) {  // token过期
        Storage.remove('TOKENINFO_CUSTOM')
        tokenManager.getCilentToken()
        window.location.reload()
        return
    }
    if(!!response.data && !!response.data.statusCode) {
        return Promise.reject(response.data)
    }else{
        Storage.set('USER_INFO',Storage.get('USER_INFO'),3600);// 重置用户信息有效时间
        return response.data
    }
}, err => {
    return Promise.reject(err)
})

const http = {
    /**
     * get请求方法
     * 调用：
     *  var params = { id: id }
     *  this.$get('url', params).then((response) => {  })
     * @param url 地址
     * @param params 参数
     * @returns {Promise}
     */
    async get(url, params = {}) {
        let token = await tokenManager.getCilentToken()
        let company = Storage.get('COMPANYID')
        let userInfo = Storage.get('USER_INFO')
        try {
            if (company !== null) {
                params.ownCompanyId = company.company_id
                params.companyId = company.company_id
            }
            if (userInfo !== null) {
                params.usrId = userInfo.usrId
            }
        } catch (e) {}
        // 全局请求加时间戳
        // params.timeStamp = Date.parse(new Date());
        return axios.get(url, {
            params: params,
            headers: {
                Authorization: 'Bearer ' + token,
                ownCompanyId: params.ownCompanyId,
                'Cache-Control':'no-cache',
                'Pragma':'no-cache',
            }
        })
    },
    /**
     * post请求方法
     * 调用：
     *  var data = { id: id }
     *  this.$post('url', data).then((response) => {  })
     * @param url 地址
     * @param data 参数
     * @returns {Promise}
     */
    post: async function (url, data = {}) {
        let token = await tokenManager.getCilentToken()
        let company = Storage.get('COMPANYID')
        let userInfo = Storage.get('USER_INFO')
        try {
            if (company !== null) {
                data.ownCompanyId = company.company_id
                data.companyId = company.company_id
            }
            if (userInfo !== null) {
                data.usrId = userInfo.usrId
            }
        } catch (e) {}
        return axios.post(url, data,{
            headers: {
                Authorization: 'Bearer ' + token,
                ownCompanyId: data.ownCompanyId,
            }
        })
            .then((res) =>{
                return res
            })
    },
    /**
     * put请求方法
     * 调用：
     *
     *  this.$put(url, data).then((response) => {  })
     * @param url 地址
     * @param data 参数
     * @returns {Promise}
     */
    put: async function (url, data = {}) {
        let token = await tokenManager.getCilentToken()
        let company = Storage.get('COMPANYID')
        let userInfo = Storage.get('USER_INFO')
        try {
            if (company !== null) {
                data.ownCompanyId = company.company_id
                data.companyId = company.company_id
            }
            if (userInfo !== null) {
                data.usrId = userInfo.usrId
            }
        } catch (e) {}
        return axios.put(url, data,{
            headers: {
                Authorization: 'Bearer ' + token,
                ownCompanyId: data.ownCompanyId,
            }
        })
            .then((res) => {return res})
    },
    /**
     * delete请求方法
     * @param url 地址
     * @param params 参数
     * @returns {Promise}
     */
    delete: async function (url, params = {}) {
        let token = await tokenManager.getCilentToken()
        let company = Storage.get('COMPANYID')
        let userInfo = Storage.get('USER_INFO')
        try {
            if (company !== null) {
                params.ownCompanyId = company.company_id
                params.companyId = company.company_id
            }
            if (userInfo !== null) {
                params.usrId = userInfo.usrId
            }
        } catch (e) {}
        return axios.delete(url, {
            params: params,
            headers: {
                Authorization: 'Bearer ' + token,
                ownCompanyId: params.ownCompanyId,
            }
        }).then((res) =>{
            return res
        })
    },

    requestAll(...fn) {
        return axios.all(...fn)
    }
}

export default http
