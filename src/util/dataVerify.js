/**
 *
 * @description: 正则校验
 * @author: junyong.hong
 * @createTime: 2019/1/15
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */
let dataVerify = {
    // 判断是否是图片格式（是返回true，不是返回false）
    isImg: function (filepath) {
        // \. 必须加\转定义
        // /i i表示忽略大小写
        return /\.(gif|jpg|jpeg|png)$/i.test(filepath)
    }
}

export default dataVerify