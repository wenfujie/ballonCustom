const http = require('./http');
const file = require('./fileRw');
const error = require('./error');
const config = require('../config');

const moutedToContext = function (app) {
    app.context.$get = http.get;
    app.context.$getImg = http.getImg;
    app.context.$post = http.post;
    app.context.$postUpload = http.postUpload
    app.context.$postUrl = http.postUrl;
    app.context.$put = http.put;
    app.context.$putUrl = http.putUrl;
    app.context.$delete = http.delete;
    app.context.readFile = file.readFile;
    app.context.writeFile = file.writeFile;
    app.context.baseUrl = config.baseUrl
    app.context.nettyUrl = config.nettyUrl
    app.context.serverPortUrl = config.serverPortUrl
    app.context.optimizeFlag = config.optimizeFlag
};

const errorHandler = app => {
    app.on('error', function (err, ctx) {
        if (process.env.NODE_ENV != 'test') {
            console.log('错误信息', err);
        }
    });
    app.use(error);
};
module.exports = {
    moutedToContext: moutedToContext,
    errorHandler: errorHandler
};
