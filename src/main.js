import Vue from 'vue'
import Main from './index.vue'
import VueLazyload from 'vue-lazyload'      //  图片懒加载
import router from './router/index.router'
import './util/common'
import http from './util/http.js'           // axios二次封装
import Storage from './util/storage.js'
import './util/commonVueFilter'             // 过滤器
import './util/globalFun'                   // 全局函数
import toastRegistry from './components/Toast/Toast.js'         // 引用吐司
import confirmRegistry from './components/Confirm/Confirm.js'   // 引用confirm

Vue.use(VueLazyload, {
    preLoad: 1.1,  // 预加载高度比例
    error: require('./assets/images/common/error.png'),  // 图片路径错误时加载图片
    loading: require('./assets/images/common/loading.png'),  // 预加载图片
    attempt: 2 // 尝试计数
})

Vue.prototype.$get = http.get
Vue.prototype.$post = http.post
Vue.prototype.$put = http.put
Vue.prototype.$delete = http.delete
Vue.prototype.$getStorage = Storage.get
Vue.prototype.$setStorage = Storage.set
Vue.prototype.$removeStorage = Storage.remove
Vue.prototype.$clearStorage = Storage.clear
Vue.prototype.serverUrl = global.serverUrl

Vue.prototype.$toast = toastRegistry        // 组件：注册吐司
Vue.prototype.$confirm = confirmRegistry    // 组件：注册confirm

Vue.config.productionTip = false

Vue.prototype.getImg = global.getImg

new Vue({
    el: '#app',
    router,
    components: { Main },
    template: '<Main/>'
})
