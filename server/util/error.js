const errorHandler = async (ctx, next) => {
    try {
        await next();
    } catch (e) {
        console.log('koa-err.js',e)
        try {
            if((e.error === 'invalid_token') || (e.response.error === 'invalid_token')) {
                console.log('error.js,token过期' + e)
                global.tokenMap = undefined
            }
        } catch (e) {}
        ctx.body = e;
        // let status = e.status || 500;
        // let message = e.message || "服务器内部错误";
        // ctx.status = status;
        // if (status === 403) {
        //     ctx.body = "403";
        // }
        // if (status === 404) {
        //     ctx.body = message;
        // }
        // if (status === 500) {
        //     ctx.body = "500";
        //     ctx.app.emit("error", e, this);
        // }
    }
};

module.exports = errorHandler;
