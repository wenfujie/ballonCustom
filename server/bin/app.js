const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const static = require('koa-static')
const path = require('path')
const app = new Koa()
const config = require('../config')
const router = require('../config/router')()
const util = require('../util')
const session = require('koa-session')
const koaBody = require('koa-body')

// // 引入日志中间件
// const logger = require('../middleware/log4js/index')
// const ip = require('ip')
// // 注册中间件
// app.use(logger({
//     // koa提供的环境变量
//     env: app.env,
//     // 项目名，记录在日志中的项目信息
//     projectName: 'ballonCustom',
//     // 指定记录的日志级别
//     applogLevel: 'debug',
//     // 指定日志存放的目录名
//     dir: 'logs',
//     // 默认情况下服务器 ip 地址
//     serverIp: ip.address()
// }))

//将工具函数挂载到应用
util.moutedToContext(app)

// session默认声明有效期
app.keys = ['jodollKey']
app.use(session({
    key: 'koaSess',
    maxAge: 7200000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
}, app))

// 错误处理
util.errorHandler(app)

//解决跨域问题2
app.use(cors())

app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    }
}))

// 解析post请求的请求体
app.use(bodyParser())

// 配置静态资源文件路径
app.use(static(path.resolve(__dirname, '../') + config.publicSourceDir))

//  不同请求方法的参数配置
app.use(async function (ctx, next) {
    if (ctx.method === 'GET' || ctx.method === 'DELETE') {
        ctx.params = ctx.query
    } else if (ctx.method === 'POST' || ctx.method === 'PUT') {
        ctx.params = ctx.request.body
    }
    await next()
})

// 路由中间件
app.use(router.routes(), router.allowedMethods())


// 监听端口
app.listen(config.port)

console.log('port:' + config.port, '服务器启动成功')
