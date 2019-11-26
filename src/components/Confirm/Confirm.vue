/*
* createTime：2019/1/22
* author：junyong.hong
* description: 通用确定框（confirm）
*/
<template>
    <div v-if="isShow" class="confirm">
        <div class="confirm-shadow"></div>
        <div class="confirm-context">
            <p v-if="text.title" class="title">{{text.title}}</p>
            <p class="message">{{text.message}}</p>
            <div class="btn">
                <span @click="close()" v-if="text.btn.close">{{text.btn.close}}</span>
                <span @click="sure()" v-if="text.btn.sure">{{text.btn.sure}}</span>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        components: {},
        data() {
            return {
                isShow: true,
                text: {
                    title: '',
                    message: '确定删除此条信息？',
                    btn: {
                        sure: '确定',
                        close: '取消'
                    }
                }
            }
        },
        mounted() {

        },
        methods: {
            close(){
                console.log('关闭')
            },
            sure(){
                console.log('确定')
            }
        }
    }
</script>
<style lang="scss" type="text/scss" scoped>
    .confirm{
        position: fixed;
        top: 0;
        z-index: 999;
        width: 100%;
        height: 100%;
        .confirm-shadow{
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            opacity: 0.1;
            background: #000;
        }
        .confirm-context{
            position: absolute;
            left: 50%;
            top: 50%;
            background: #fff;
            border-radius: 4px;
            border: 1px solid #dcdcdc;
            box-shadow: 0 0 8px #CDCDC1;
            width: 224px;
            transform: translate(-50%, -50%);
            padding: 30px 20px 16px 20px;
            box-sizing: border-box;
            .title{
                text-align: center;
                color: $clickdomcolor;
                margin-bottom: 10px;
            }
            .message{
                width: 184px;
                line-height: 20px;
                min-height: 20px;
            }
            .btn{
                float: right;
                margin-top: 30px;
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
    }
</style>