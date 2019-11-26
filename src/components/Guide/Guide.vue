/*
* createTime：2019/1/7
* author：junyong.hong
* description: 引导页
*/
<template>
    <div v-if="selfGuideShow" @click="closeKnow()" class="tip-shadow"></div>
</template>
<script type="text/ecmascript-6">
    import Storage from '../../util/storage'

    export default {
        components: {
        },
        data() {
            return {
                selfGuideShow: false
            }
        },
        created () {
            this._initGuide()

        },
        methods: {
            /**
             * 引导页
             */
            _initGuide () {
                if (!Storage.get('guide')) {    // 缓存不存在
                    this.selfGuideShow = true
                } else {                        // 缓存存在
                    this.selfGuideShow = false
                }
            },
            /**
             * 关闭详情引导
             */
            closeKnow () {
                this.selfGuideShow = false
                Storage.set('guide', '{"guideState": null}')
            }
        }
    }
</script>
<style lang="scss" type="text/scss" scoped>
    .tip-shadow {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 200;
        opacity: .4;
        background: #000;
        background-position: center center;
        background-repeat: no-repeat;
        background-image: url('../../assets/images/goods/guide.png');
    }
</style>