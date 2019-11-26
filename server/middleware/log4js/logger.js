/**
 *
 * @description: log4js记录日志
 * @author: junyong.hong
 * @createTime: 2018/5/31
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */
// log4js
const log4js = require('log4js');
// 引入日志输出信息的封装文件
const access = require('./access.js');

// 将日志的不同级别提取为数组，方便后面做处理
const methods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'mark'];

module.exports = (options) => {
    let contextLogger = {};

    const defaultInfo = {
        // 开发环境
        env: 'dev',
        // 输出的文件夹名称
        dir: 'logs',
        // 错误级别
        applogLevel: 'info'
    };
    // 继承自 defaultInfo 默认参数
    const opts = Object.assign({}, defaultInfo, options || {});
    // 需要的变量解构 方便使用
    const { env, dir, applogLevel } = opts;

    /**
     * 指定要记录的日志分类（日志切割）
     */
    const appenders = { cheese: {
        // 日志类型　dateFile输出到日志文件上　console输出到控制台上
        type: 'console',
        // 输出日志文件名称
        filename: `${dir}/task`,
        // 名称后面添加年月日
        pattern: '-yyyy-MM-dd.log',
        // 是否总是有后缀名
        alwaysIncludePattern: true
    } };

    /**
     * 把日志输出到终端上（需要时可以开启）
     * 环境变量为dev local development 认为是开发环境
     */
    // if (env === 'dev' || env === 'local' || env === 'development') {
    //     appenders.out = {
    //         type: 'console'
    //     }
    // }

    /**
     * 指定日志的默认配置项
     */
    const config = {
        appenders: appenders,
        // 日志级别level: error info
        categories: {
            default: {
                appenders: Object.keys(appenders),
                level: applogLevel
            }
        }
    };

    return async (ctx, next) => {
        // 记录请求开始的时间
        const start = Date.now();
        log4js.configure(config);

        const logger = log4js.getLogger('cheese');
        // logger.trace('Entering cheese testing');
        // logger.debug('Got cheese.');
        // logger.info('Cheese is Gouda.');
        // logger.warn('Cheese is quite smelly.');
        // logger.error('Cheese is too ripe!');
        // logger.fatal('Cheese was breeding ground for listeria.');

        /**
         * 循环methods将所有方法挂载到ctx上
         *  调用：ctx.log.error('错误啦')
         */
        methods.forEach((method, i) => {
            contextLogger[method] = (message) => {
                // 将入参换为函数返回的字符串
                logger[method](access(ctx, message, {}))
            }
        });
        ctx.log = contextLogger;

        await next();

        // 记录请求结束的时间
        const end = Date.now();
        const responseTime = end - start;

        // 过滤掉options操作（跨域）
        if (ctx.request.method != 'OPTIONS') {
            logger.info(access(ctx, `响应时间为${responseTime/1000}s`, {}));
        }
    }
}
