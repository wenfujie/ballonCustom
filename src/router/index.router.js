import Vue from 'vue'
import Router from 'vue-router'
import webDesign from '@/pages/goods/web-design'
// import webDesign1 from '@/pages/goods/web-design-ww'
import webDesignIframe from '@/pages/goods/web-design'
Vue.use(Router)
const router = new Router({
    // mode: 'history',
    routes: [{
            path: '/',
            redirect: '/goods/web-design'
        },
        {
            path: '/goods/web-design',
            component: webDesign,
            meta: {
                title: 'PC定制组件'
            }
        },
        // {
        //     path: '/goods/web-design-ww',
        //     component: webDesign1,
        //     meta: {
        //         title: 'PC定制组件-ww'
        //     }
        // },
        {
            path: '/goods/web-design-iframe',
            component: webDesignIframe,
            meta: {
                title: 'PC定制组件iframe'
            }
        }
    ]
})
router.beforeEach((to, form, next) => {
    // 路由变化修改title
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})
export default router
