/*
* createTime：2019/1/21
* author：junyong.hong
* description: 通用吐司
*/
<template>
    <div v-if="showWrap"
         :class="showContent ? 'fadein' : 'fadeout'"
         class="toast" v-html="text">
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        components: {},
        data() {
            return {}
        },
        mounted() {

        },
        methods: {}
    }
</script>
<style lang="scss" type="text/scss" scoped>
    .toast {
        position: fixed;
        left: 50%;
        top: 50%;
        font-size: 16px;
        background: rgba(13, 12, 29, 0.4);
        padding: 14px 32px;
        border-radius: 5px;
        transform: translate(-50%, -50%);
        color: #fff;
        z-index: 999;
        text-align: center;

        &.fadein {
            animation: animate_in 0.25s;
        }
        &.fadeout {
            animation: animate_out 1s;
            opacity: 0;
        }
        @keyframes animate_in {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
        @keyframes animate_out {
            0% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }
    }
</style>