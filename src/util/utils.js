/**
 *
 * @description:
 * @author: junyong.hong
 * @createTime: 2018/9/17
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */
const utils = {
    /**
     * 获取url参数
     */
    _getRequest:function () {
        let url = location.search;
        let theRequest = new Object();
        if (url.indexOf("?") != -1) {
            let str = url.substr(1),
                strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    },
    /**
     * 对比两个对象是否相同
     * @param x 对象1
     * @param y 对象2
     * @returns {*}
     */
    equals:function( x, y ) {
        var in1 = x instanceof Object;
        var in2 = y instanceof Object;
        if(!in1||!in2){
            return x===y;
        }
        if(Object.keys(x).length!==Object.keys(y).length){
            return false;
        }
        for(var p in x){
            var a = x[p] instanceof Object;
            var b = y[p] instanceof Object;
            if(a&&b){
                return utils.equals( x[p], y[p]);
            }
            else if(x[p]!==y[p]){
                return false;
            }
        }
        return true;
    }
}

export default utils