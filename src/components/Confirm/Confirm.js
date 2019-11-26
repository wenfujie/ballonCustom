/**
 * 通用确定框（confirm）
 * @description:
 * @author: junyong.hong
 * @createTime: 2019/1/22
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 * 在src/main.js里引用：
 * import confirmRegistry from './components/Confirm/Confirm.js'   // 引用confirm
 * Vue.prototype.$confirm = confirmRegistry    // 注册confirm
 *
 * 调用方法：
 * this.$confirm({
        title: '标题（默认空）',
        message: '提示信息',
        btn: {
            sure: '确定按钮名称',
            close: '关闭按钮名称'
        }
    }).then(() => {
        console.log('确定回调')
    }).catch(() => {
        console.log('关闭回调')
    })
 */
import vue from 'vue'
import confirm from './Confirm.vue'

let confirmConstructor = vue.extend(confirm)

let theConfirm = function (text) {
    return new Promise((resolve, reject) => { //promise封装，sure执行resolve，no执行reject
        let confirmDom = new confirmConstructor({
            el: document.createElement('div')
        })
        document.body.appendChild(confirmDom.$el)  //new一个对象，然后插入body里面

        confirmDom.text = text   //为了使confirm的扩展性更强，这个采用对象的方式传入，所有的字段都可以根据需求自定义
        confirmDom.sure = function () {
            resolve()
            confirmDom.isShow = false
        }
        confirmDom.close = function () {
            reject()
            confirmDom.isShow = false
        }
    })
}

export default theConfirm