/*
* createTime：2019/1/16
* author：en.chen
* description:  token管理
*/

import Storage from './storage.js'
import axios from 'axios'

const tokenManager = {

    //  获取游客模式token
    async getCilentToken() {
        if(!!Storage.get('TOKENINFO_CUSTOM')) {
            // console.log('浏览器缓存中的token',Storage.get('TOKENINFO_CUSTOM').access_token)
            return Storage.get('TOKENINFO_CUSTOM').access_token
        }else{
            let res = await axios.post('token/cilentToken',{})
            let tokenInfo = res
            Storage.set('TOKENINFO_CUSTOM',tokenInfo,6660)  // 设置token存储时间为1小时52分钟
            // console.log('线上获取token',tokenInfo.access_token)
            return tokenInfo.access_token
        }
    },

    //  获取密码模式token
    async getPwdToken() {
        let data = {
            client_id: "wissClient",
            client_secret: "wissClientSecret",
            usrId: Storage.get('USER_INFO').usrId,
            companyId: Storage.get('COMPANYID').company_id
        }
        let res = await axios.post('token/pwdToken',data)
        let tokenInfo = res
        Storage.set('TOKENINFO_CUSTOM',tokenInfo)
        return tokenInfo.access_token
    }
}

export default tokenManager