/*
 * createTime: 2019/6/24 15:55
 * author: wei.wang
 * description: 路由
 */
const fs = require('fs');
const path = require('path');
const router = require('koa-router')();

/*
 * 添加路由映射
 * routers：路由对象
 * mapping：参数二
 * filename：返回值
 */
function addMapping(mapping, filename) {
    for (let url in mapping) {
        let paths = '';
        if (url.startsWith('GET')) {
            paths = filename + url.substring(3);
            router.get(paths, mapping[url]);
        } else if (url.startsWith('POST')) {
            paths = filename + url.substring(4);
            router.post(paths, mapping[url]);
        } else if (url.startsWith('PUT')) {
            paths = filename + url.substring(3);
            router.put(paths, mapping[url]);
        } else if (url.startsWith('DELETE')) {
            paths = filename + url.substring(6);
            router.delete(paths, mapping[url]);
        } else if (url.startsWith('REDIRECT')) {
            paths = filename + url.substring(8);
            router.redirect(paths, mapping[url]);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

function addControllers() {
    let files = fs.readdirSync(path.resolve(__dirname, '../') + '/router');
    let jsFiles = files.filter(f => {
        return f.endsWith('.js');
    });
    for (let f of jsFiles) {
        let filename = '/'.concat(f.replace('.js', '').trim());
        let mapping = require(path.resolve(__dirname, '../') + '/router/' + f);
        addMapping(mapping, filename);
    }
}

module.exports = function (dir) {
    let controllerDir = dir || 'router';
    addControllers(router, controllerDir);
    return router;
};
