/*
* createTime：2019/1/17
* author：junyong.hong
* description:
*/
<template>
    <div v-if="isShow" class="alert-dialog">
        <div @click="close()" class="alert-dialog-shadow"></div>
        <div class="alert-dialog-custom">
            <p class="custom-title">最多一个部位添加个性定制</p>
            <p class="custom-tip">请先删除后添加</p>
            <ul>
                <li v-if="newData.partPrintData.length > 0"
                    v-for="(item, index) in newData.partPrintData"
                    :key="'printPart_' + index"
                    class="clearfix">
                    <span class="text-overhidden custom-list-name">
                        {{newData[item.regionCode].regionName}}－印花
                    </span>
                    <i @click="partRemove(item.delDecalId)" class="fr iconfont icon-close_sketch"></i>
                </li>
                <li v-if="newData.partEmbData.length > 0"
                    v-for="(item, index) in newData.partEmbData"
                    :key="'embPart_' + index"
                    class="clearfix">
                    <span class="text-overhidden custom-list-name">
                        {{newData[item.regionCode].regionName}}－绣字
                    </span>
                    <i @click="partRemove(item.delDecalId)" class="fr iconfont icon-close_sketch"></i>
                </li>
                <li v-if="newData.partEmbPrintData.length > 0"
                    v-for="(item, index) in newData.partEmbPrintData"
                    :key="'embPrintPart_' + index"
                    class="clearfix">
                    <span class="text-overhidden custom-list-name">
                        {{newData[item.regionCode].regionName}}－绣花
                    </span>
                    <i @click="partRemove(item.delDecalId)" class="fr iconfont icon-close_sketch"></i>
                </li>
            </ul>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            newData: {
                default: ''
            },
            shineFlag: {
                type: Boolean,
                default: false
            }
        },
        components: {},
        data() {
            return {}
        },
        mounted() {

        },
        methods: {
            /**
             * 点击遮罩，关闭弹窗
             *
             * update让组件外部的参数（isShow）同步
             */
            close () {
                this.$emit('update:isShow', false)
            },
            /**
             * 删除部位
             * @param delDecalId 删除印绣花的id
             */
            partRemove (delDecalId) {
                // 判断闪烁是否结束
                if (!this.shineFlag) {
                    return
                }

                this.$emit('partRemove',delDecalId)
                this.close()
            }
        }
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

    .alert-dialog-custom {
        width: 380px;
        margin-top: -122px;
        margin-left: -190px;
        padding: 30px 60px;
        box-sizing: border-box;

        .custom-title {
            font-size: $fs18;
            color: #0D0C1D;
        }
        .custom-tip {
            font-size: $fs12;
            color: $secondlycolor;
            padding: 15px 0 8px 0;
        }
        ul {

            li {
                border-radius: 4px;
                border: 1px solid $clickdomcolor;
                line-height: 54px;
                height: 54px;
                padding: 0 17px;
                margin-bottom: 8px;

                &:last-child {
                    margin-bottom: 0;
                }
                .custom-list-name {
                    display: inline-block;
                    width: 180px;
                }
                i {
                    color: $secondlycolor;
                    font-size: $fs12;
                    cursor: pointer;
                }
            }
        }
    }
</style>