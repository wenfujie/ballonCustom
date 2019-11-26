/**
 *
 * @description: 对日志中间件进行错误处理
 * @author: junyong.hong
 * @createTime: 2018/5/31
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */
const logger = require('./logger');
module.exports = (options) => {
    const loggerMiddleware = logger(options);

    return (ctx, next) => {
        return loggerMiddleware(ctx, next)
            .catch((e) => {

                // 如果中间件里面有抛出错误，这里将通过 catch 函数捕捉到并处理，将状态码小于 500 的错误统一按照 500 错误码处理，以方便后面的 http-error 中间件显示错误页面。
                if (ctx.status < 500) {
                    ctx.status = 500;
                }
                // 异常日志打印
                ctx.log.error(e.stack);
                ctx.state.logged = true;
                ctx.throw(e);
            })
    }
}
