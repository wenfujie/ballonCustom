/*
* createTime：2019/1/16
* author：junyong.hong
* description: 弹窗组件(已经废弃)
*/
<template>
    <div v-if="isShow" class="alert-dialog">
        <div @click="close()" class="alert-dialog-shadow"></div>
        <div class="alert-dialog-exist">
            <p class="exist-msg">{{info}}</p>
            <div class="clearfix exist-foot-btn">
                <!-- 确定 -->
                <span @click="sure()" class="fr">{{sureBtn}}</span>
                <!-- 取消 -->
                <span @click="cancel()" class="fr">{{closeBtn}}</span>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        props: {
            closeBtn: {
                type: String,
                default: '否'
            },
            sureBtn: {
                type: String,
                default: '清空'
            },
            info: {
                type: String,
                default: '此部件已存在个性定制，是否清空后重新编辑？'
            },
            isShow: {
                type: Boolean,
                default: false
            }
        },
        components: {},
        data() {
            return {}
        },
        created() {

        },
        methods: {
            /**
             * 点击遮罩，关闭弹窗
             *
             * update让组件外部的参数（isShow）同步
             */
            close() {
                this.$emit('update:isShow', false)
            },
            /**
             * 确定按钮
             */
            sure() {
                this.$emit('sureBtn')
                this.close()
            },
            /**
             * 取消按钮
             */
            cancel() {
                this.$emit('closeBtn')
                this.close()
            }
        },
//        watch: {
//            isShow: function (val) {
//            }
//        }
    }
</script>
<style lang="scss" type="text/scss" scoped>
    .alert-dialog {
        width: 100%;
        height: 100%;
        z-index: 210;
        position: relative;

        .alert-dialog-shadow {
            width: 100%;
            height: 100%;
            opacity: 0.1;
            background: #000;
            position: absolute;
            left: 0;
            top: 0;
        }
        .alert-dialog-exist,
        .alert-dialog-custom {
            position: absolute;
            left: 50%;
            top: 50%;
            background: #fff;
            border-radius: 4px;
            border: 1px solid #dcdcdc;
            box-shadow: 0 0 8px #CDCDC1;
        }
    }

    .alert-dialog-exist {
        width: 224px;
        height: 140px;
        margin-left: -112px;
        margin-top: -70px;
        padding: 30px 20px 16px 20px;
        box-sizing: border-box;
        .exist-msg {
            width: 184px;
            line-height: 20px;
        }
        .exist-foot-btn {
            padding-top: 30px;
            span {
                line-height: 20px;
                color: $clickdomcolor;
                display: inline-block;
                width: 48px;
                padding-left: 6px;
                cursor: pointer;
                text-align: center;
            }
        }
    }
</style>