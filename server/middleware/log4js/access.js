/**
 *
 * @description: 记录 和 配置客户端信息
 * @author: junyong.hong
 * @createTime: 2018/5/31
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */
module.exports = (ctx, message, commonInfo) => {

    // 请求方法
    var getMethod = ctx.request.method;
    // 用户提交的数据
    var params = '';
    // 服务端返回的json
    var data = '';

    if (getMethod === 'GET') {
        params = ctx.query
    } else if (getMethod === 'POST') {
        params = ctx.request.body
    } else if (getMethod === 'PUT') {
        params = ctx.request.body
    } else if (getMethod === 'DELETE') {
        params = ctx.query
    }
    data = ctx.body

    const {
        // 请求方法 get post或其他
        method,
        // 请求链接
        url,
        // 发送请求的客户端的host
        host,
        // 请求中的headers
        headers
    } = ctx.request;

    const client = {
        method,
        url,
        host,
        message,
        params,
        data,
        // 请求的源地址
        referer: headers['referer'],
        // 客户端信息设备 及 浏览器信息
        userAgent: headers['user-agent'],
    };

    if (client.url.indexOf('customization/getImg') !== -1) {    // 过滤图片请求返回的参数
        client.data = 'Buffer类型'
    }

    return JSON.stringify(Object.assign(commonInfo, client));
}
