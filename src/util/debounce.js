/**
 * 函数防抖、节流
 * 引入方式：import { debounce, throttle } from '../../util/debounce'
 * @description:
 * @author: junyong.hong
 * @createTime: 2018/9/17
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */

/**
 * 函数防抖
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时；
 * 典型的案例就是输入搜索：输入结束后n秒才进行搜索请求，n秒内又输入的内容，就重新计时
 * @param fn 要执行的方法体
 *  console.log('typeof fn', typeof fn) 结果是function
 * @param t 防抖时间（也就是输入停止多少秒后才会触发）
 * @returns {Function}
 * @constructor
 *
 * 使用方法（test变量要在data里进行定义）：
     <input type="text" v-model="test" @keyup="debounceTest('参数1')">
    {{test}}

    debounceTest: debounce(function(params) {
        console.log('函数防抖')
    }, 2000),

 */
export const debounce = (fn, t) => {
    let delay = t || 500
    let timer

    return function () {
        let args = arguments        // 外部传入的参数

        if (timer) {                // N秒内还在输入内容，重新计算
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            timer = null
            fn.apply(this, args)    // 拷贝了fn的属性和方法，实现了类的继承
        }, delay)
    }
}

/**
 * 函数节流
 * 规定在一个单位时间内，只能触发一次函数，如果这个单位时间内触发多次函数，只有一次生效；
 * 典型的案例就是鼠标不断点击触发，规定在n秒内多次点击只有一次生效
 * @param fn 要执行的方法体
 *  console.log('typeof fn', typeof fn) 结果是function
 * @param t 节流时间
 * @returns {Function}
 * @constructor
 *
 * 使用方法
 * <button @click="throttleTest('我是参数')">节流案例</button>
 *
   throttleTest: throttle(function (params) {
        console.log('节流测试', params)
    },5000),
 */
export const throttle = (fn, t) => {
    let last
    let timer
    let interval = t || 500
    return function () {
        let args = arguments            // 外部传入的参数
        let now = +new Date()

        // now - last < interval 当前的时间 - 第一次触发的时间 < 节流时间
        // 第二次以上的点击都会进入
        if (last && (now - last < interval)) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                last = now
                fn.apply(this, args)    // 拷贝了fn的属性和方法，实现了类的继承
            }, interval)
        } else {                        // 只有第一次进入才会触发
            last = now
            fn.apply(this, args)
        }
    }
}