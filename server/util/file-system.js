/**
 * createTime: 2018/7/10 21:04
 * author: zhibin.zhao
 * description: 对接微服务文件系统
 */
class fileSystem {
    /*
    * 通过token获取图片
    * */
    static async getImgByPath(ctx) {
        let query = ctx.params
        let options = {
            responseType: 'arraybuffer'
        }
        return ctx.$getImg(ctx.baseUrl + '/file/oss/image/' + query.fileUrl + "?companyId=" + query.companyId, {
            "ossType": "meterial"
        }, options).then((res) => {
            return res;
        })
    }
}

module.exports = fileSystem
