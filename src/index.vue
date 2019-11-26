<template>
    <div id="app">
        <!--缓存路由-->
        <keep-alive>
            <router-view></router-view>
        </keep-alive>
    </div>
</template>
<script>
    export default {
        name: 'index',
        data () {
            return {}
        },
        methods: {}
    }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
    @import "assets/font/iconfont.css";
    @import "assets/scss/resetUI.scss";
    @import "assets/scss/common/index.scss";
</style>
