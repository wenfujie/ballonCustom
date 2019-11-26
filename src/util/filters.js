/**
 * createTime: 2018/9/10 17:06
 * author: zhibin.zhao
 * description:
 */
import Storage from './storage.js'
import axios from 'axios'

class filters {
    // 获取图片
    static imgFilter(fileUrl) {
        if (!!fileUrl) {
            // return serverUrl + "customization/getImg?" + ("fileUrl=" + fileUrl + "&companyId=" + Storage.get('COMPANYID').company_id)
            return (baseConstant.ossOpenUrl || Storage.get('properties').ossOpenUrl) + 'image/' + fileUrl
        } else {
            return require('../assets/images/common/none.png')
        }
    }

    /**
     * base64转文件流
     * @param urlData 文件流
     * @returns {*}
     */
    static convertBase64UrlToBlob(urlData) {
        let newUrlData = urlData.toString().replace(/^data:image\/(png|jpg);base64,/, '')
        //去掉url的头，并转换为byte
        var bytes = window.atob(newUrlData)
        // 处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length)
        var ia = new Uint8Array(ab)
        for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i)
        }
        return new Blob([ab], {type: 'image/png'})
    }

    /**
     * 上传图片
     * @param _this
     * @param base64 base64上传方式
     * @param file 文件流上传方式
     * @returns {Promise.<*>}
     */
    static async uploadImg(_this, base64, file) {
        let param = new FormData()

        // 判断上传方式
        if (base64) {
            param.append('file', filters.convertBase64UrlToBlob(base64), 'file.png')
        } else {
            param.append('file', file.target.files[0])
        }

        param.append('companyId', Storage.get('COMPANYID').company_id)

        if (Storage.get('USER_INFO')) {
            param.append('usrId', Storage.get('USER_INFO').usrId)
        } else {
            param.append('usrId', '0')
        }

        // 上传图片
        let imgId = await _this.$post(serverUrl + 'customization/uploadImg', param).then((res)=>{
            return res
        })

        return imgId
    }
}

export default filters