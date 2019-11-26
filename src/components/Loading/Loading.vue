/*
* createTime：2018/12/28
* author：junyong.hong
* description: loading
*/
<template>
    <div class="loading-mask">
        <img class="loading" src="./loading.gif" alt="">
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        components: {
        }
    }
</script>
<style lang="scss" type="text/scss" scoped>
    .loading-mask {
        position:relative;
        width: 100%;
        height: 100%;
        z-index: 999;
        background: rgba(0,0,0,.4);
        .loading{
            position: absolute;
            width:48px;
            height: 48px;
            top:50%;
            left:50%;
            margin-left:-24px;
            margin-top:-24px;
            text-align: center;
        }
    }
</style>