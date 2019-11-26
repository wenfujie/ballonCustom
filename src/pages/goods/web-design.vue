/*
* createTime：2018/12/04
* author：junyong.hong
* description: PC定制组件（标版）
*/
<template>
    <div class="clearfix com-web-design web-design">
        <!-- 左上角：关闭按钮 -->
        <!--<i class="iconfont icon-close_sketch design-close-btn"></i>-->

        <!-- 左侧：推荐设计、我的设计 -->
        <div :class="['com-web-shadow-more','fl','main-left',{'hidden':modelFullScreen}]">
            <!-- 导航 -->
            <ul class="main-left-tab clearfix">
                <li v-if="isDesign"
                    @click="designTitle('1')"
                    :class="['main-left-nav', 'fl', {'selected':designTitleActive == 1}]">
                    推荐设计
                </li>
                <li @click="designTitle('2')"
                    :class="['main-left-nav', 'fl', {'selected':designTitleActive == 2}, {'full' : !isDesign}]">
                    我的设计
                </li>
            </ul>

            <div class="option-swrap">
                <!-- 推荐设计 -->
                <ul v-if="designTitleActive == 1" class="option-list">
                    <li v-for="(item,index) in designData"
                        :key="index"
                        @click="designStock(item, index)"
                        class="option-item">
                        <img v-lazy="getImg(item.designUrl)" :key="item.designUrl">
                        <!-- 是否缺库存 -->
                        <div v-if="item.isStock"
                             @click.stop="shortClick(index)"
                             class="icon-que">
                            <!-- 三角形 -->
                            <div class="icon-que-describe">
                                部分面料缺少库存
                                <div class="triangle triangle-top"></div>
                            </div>
                        </div>
                        <!-- 选中效果 -->
                        <div v-show="designDataActive === index" class="item-selected">
                            <div class="item-selected-bg"></div>
                            <div class="item-selected-text">当前设计</div>
                        </div>
                    </li>

                    <!-- 撑开去对比按钮高度，防止列表被遮挡 -->
                    <div class="compare-support"></div>
                </ul>

                <!-- 我的设计 -->
                <ul v-if="designTitleActive == 2" class="option-list">
                    <li v-for="(item,index) in designData"
                        :key="index"
                        @click="myDesign(item, index)"
                        class="option-item">
                        <img v-lazy="getImg(item.ptiPartHdDtoList[0].designUrl)" :key="item.ptiPartHdDtoList[0].designUrl">
                        <!-- 是否缺库存 -->
                        <div v-if="item.isStock"
                             @click.stop="shortClick(index)"
                             class="icon-que">
                            <!-- 三角形 -->
                            <div class="icon-que-describe">
                                部分面料缺少库存
                                <div class="triangle triangle-top"></div>
                            </div>
                        </div>
                        <!-- 选中效果 -->
                        <div v-show="myDesignDataActive === index" class="item-selected">
                            <div class="item-selected-bg"></div>
                            <div class="item-selected-text">当前设计</div>
                        </div>
                        <!-- hover显示删除按钮 -->
                        <i @click.stop="delMyDesign(item, index)" class="iconfont icon-close_sketch close-btn"></i>
                    </li>

                    <!-- 撑开去对比按钮高度，防止列表被遮挡 -->
                    <div class="compare-support"></div>
                </ul>

                <div v-if="designDataEmpty" class="empty">暂无数据~</div>

                <div class="compare-btn">
                    <div class="compare-btn-bg"></div>
                    <div @click="showComparePop" class="compare-btn-cont">
                        <i class="iconfont icon-Icons_duibi"></i>
                        <span class="compare-btn-text">去对比</span>
                    </div>
                </div>
            </div>

            <div @click="_frontMyDesignClick()" class="com-radius-shadow common-btn save-btn">保存</div>
            <div v-if="positionShowOrHidden" @click="getUVMSG()" class="com-radius-shadow common-btn position-btn">获取坐标</div>
            <div v-if="framesShowOrHidden" @click="getFrames()" class="com-radius-shadow common-btn frames-btn">获取帧数</div>
        </div>

        <!-- 中间：3D模型、导航、全屏、重置、价格、定制清单 -->
        <div :class="['fl', 'clearfix', 'main-center',{'main-center-full':modelFullScreen}]">
            <!--防抖案例：<input type="text" v-model="test" @keyup="debounceTest('参数1')">-->
            <!--{{test}}-->
            <!--节流案例：<button @click="throttleTest('我是参数')">节流案例</button>-->


            <!-- 3D模型 -->
            <div id="model" class="fl main-center-model"></div>

            <div class="main-right-operat">
                <!-- 导航 -->
                <ul v-show="!modelFullScreen" class="operat-list">
                    <li v-for="(item,index) in footerList"
                        :key="index"
                        @click="afterDetail(index, item);"
                        :class="['operat-item', {'selected':isHeader === item.enName || isHeader === item.usedName}]">
                        <img v-lazy="item.imgUrl" :key="item.imgUrl" class="operat-item-img">
                        <p class="operat-item-text">{{item.name}}</p>
                    </li>
                </ul>

                <div class="operat-bottom">
                    <div class="operat-btn">
                        <!-- 全屏 -->
                        <i @click="detailShowOrHide()"
                           :class="['iconfont',{'icon-Icon_guanbiquanping':modelFullScreen,'icon-Icon_quanping':!modelFullScreen}]"></i>

                        <div class="clearfix">
                            <div class="fr operat-btn-cut"></div>
                        </div>

                        <!-- 重置 -->
                        <i @click="reset()" class="iconfont icon-Icon_zhongzhi"></i>
                    </div>

                    <!-- 定制清单 -->
                    <div class="operat-info">
                        <p v-if="price" class="operat-price">￥{{price.totalPrice | Fix2}}</p>
                        <p v-else class="operat-price">￥0.00</p>
                        <div class="operat-design-btn">
                            <div @click.stop="customList(true)">
                                <i class="iconfont icon-Icon_qingdan icon-list"></i>
                                <span>定制清单</span>
                            </div>

                            <!-- 定制清单弹窗 -->
                            <div v-if="customListShow" class="pop-custom-container" @click.stop="">
                                <div class="pop-custom-shadow"></div>
                                <!-- 三角形 -->
                                <div class="triangle triangle-right"></div>
                                <div class="pop-custom-cont">
                                    <p class="pop-custom-title">定制清单</p>
                                    <!--<p class="pop-custom-model">部件价格：</p>-->
                                    <ul class="pop-custom-list">
                                        <!-- 主面料 -->
                                        <li v-if="newData.MainFabric" class="pop-custom-item">
                                            <div class="pop-part-name">主面料－{{newData.MainFabricName}}</div>
                                            <div class="pop-part-price"><!--¥{{this.price.mainFabricPrice | Fix2}}--></div>
                                            <img class="pop-part-img" v-lazy="getImg(newData.MainFabricUrl)" :key="newData.MainFabricUrl">
                                        </li>

                                        <!-- 部件 -->
                                        <li v-for="(item, index) in getDefaultDetailed.detailedList"
                                            v-if="item.regionCode === newData[item.regionCode].regionCode"
                                            :key="'customListPart_' + index"
                                            class="pop-custom-item">
                                            <div v-for="(itemPrice, indexPrice) in price.detailList"
                                                 v-if="itemPrice.regionCode === newData[item.regionCode].regionCode">
                                                <div class="pop-part-name">{{newData[item.regionCode].partName}}－{{newData[item.regionCode].fabricName}}</div>
                                                <div class="pop-part-price"><!--¥{{itemPrice.price | Fix2}}--></div>
                                                <img class="pop-part-img" v-lazy="getImg(newData[item.regionCode].url)" :key="newData[item.regionCode].url">
                                            </div>
                                        </li>

                                        <!-- 印花 -->
                                        <li v-if="newData.partPrintData"
                                            v-for="(item, index) in newData.partPrintData"
                                            :key="'customListPrint_' + index"
                                            class="pop-custom-item">
                                            <div v-for="(priceItem, priceItemIndex) in price.detailList"
                                                 :key="'price_' + priceItemIndex"
                                                 v-if="item.regionCode === priceItem.regionCode">
                                                <div class="pop-part-name">印花－{{priceItem.regionName}}</div>
                                                <div v-show="priceItem.printPrice > 0"
                                                     class="pop-part-price">
                                                    ¥{{priceItem.printPrice | Fix2}}
                                                </div>
                                            </div>
                                            <img class="pop-part-img" v-lazy="getImg(item.pictUrl)" :key="item.pictUrl">
                                        </li>
                                        <!-- 绣字 -->
                                        <li v-if="newData.partEmbData"
                                            v-for="(item, index) in newData.partEmbData"
                                            :key="'customListEmb_' + index"
                                            class="pop-custom-item">
                                            <div v-for="(priceItem, priceItemIndex) in price.detailList"
                                                 :key="'price_' + priceItemIndex"
                                                 v-if="item.regionCode === priceItem.regionCode">
                                                <div class="pop-part-name">绣字－{{priceItem.regionName}}－{{item.fontName}}</div>
                                                <div v-show="priceItem.embPrice > 0"
                                                     class="pop-part-price">
                                                    ¥{{priceItem.embPrice | Fix2}}
                                                </div>
                                            </div>
                                            <span :style="{ color: item.color }" class="pop-part-word" :title="item.content">{{item.content}}</span>
                                        </li>
                                        <!-- 绣花 -->
                                        <li v-if="newData.partEmbPrintData"
                                            v-for="(item, index) in newData.partEmbPrintData"
                                            :key="'customListEmbPrint_' + index"
                                            class="pop-custom-item">
                                            <div v-for="(priceItem, priceItemIndex) in price.detailList"
                                                 :key="'price_' + priceItemIndex"
                                                 v-if="item.regionCode === priceItem.regionCode">
                                                <div class="pop-part-name">绣花－{{priceItem.regionName}}</div>
                                                <div v-show="priceItem.embPrtPrice > 0"
                                                     class="pop-part-price">
                                                    ¥{{priceItem.embPrtPrice | Fix2}}
                                                </div>
                                            </div>
                                            <img class="pop-part-img" v-lazy="getImg(item.pictUrl)" :key="item.pictUrl">
                                        </li>

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="operate-btn-box">
                        <div class="collect-box">
                            <!--未收藏-->
                            <i class="iconfont icon-weishoucang" v-if="collectionFlag === 0" @click="addOrCancelCollection('add')"></i>
                            <!--已收藏-->
                            <i class="iconfont icon-shoucang" v-if="collectionFlag === 1" @click="addOrCancelCollection('cancel')"></i>
                            <p>{{collectionFlag === 1 ? '已收藏' : '收藏'}}</p>
                        </div>
                        <div class="com-web-shadow-less operat-btn-group" v-if="sellFlag === 1">
                            <div @click="addCart()" class="operat-btn-add">加入购物车</div>
                            <div @click="_nowBuySure()" class="operat-btn-bug">立即购买</div>
                        </div>
                        <div class="com-web-shadow-less operat-btn-group-unsell" v-else>
                            <div class="under-sell">已下架</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧 -->
        <div :class="['fl','main-right',{'hidden':modelFullScreen}] ">
            <div class="com-web-shadow-more main-right-cont">
                <!-- 主面料 -->
                <div v-show="isHeader === 'fabric'" class="fabric-cont">
                    <ul class="common-btn-support fabric-list">
                        <li v-for="(item,index) in fabricData"
                            :key="index"
                            @click="fabricClick(item, index)"
                            :class="['fabric-item',{'selected':fabricDataActive === index}]">
                            <img v-lazy="getImg(item.fabricUrl)" :key="item.fabricUrl">
                            <p class="fabric-item-text">{{item.fabricName}}</p>
                        </li>
                    </ul>

                    <!-- 底部确定按钮 -->
                    <!--<div class="right-footer">-->
                        <!--<div @click="fabricCloseOrOk('ok')" class="com-radius-shadow right-sure-btn">-->
                            <!--<i class="iconfont icon-Icon_queding icon-sure"></i>-->
                            <!--<span class="compare-btn-text">确定</span>-->
                        <!--</div>-->
                    <!--</div>-->
                </div>

                <!-- 部件：第一步操作 -->
                <div v-show="isHeader === 'partFirst'" class="part-cont">
                    <ul class="part-list">
                        <li v-for="(item, index) in getRegionclassData"
                            :key="index"
                            @click="footerPart(item)"
                            class="part-item-swrap">
                            <div @click="partIndex = index"
                                 :class="['com-web-shadow-less','clearfix','part-item',{'selected':partIndex === index}]">
                                <div class="clearfix part-item-info">
                                    <div class="fl part-img">
                                        <img v-if="item.regionUrl" v-lazy="getImg(item.regionUrl[0])" :key="item.regionUrl[0]">
                                        <img v-else="!item.regionUrl" src="" :onerror="errorImg">
                                    </div>
                                    <div class="fr part-open">
                                        <i class="iconfont icon-caretright"></i>
                                    </div>
                                    <div class="fr part-describe">
                                        <span class="text-overhidden part-describe-title">{{item.regionName}}</span>
                                        <span class="text-overhidden part-describe-text">{{newData[item.regionCode].partName}}</span>
                                        <span class="text-overhidden part-describe-color">{{newData[item.regionCode].fabricName}}</span>
                                    </div>
                                </div>

                                <!-- 右侧小块长型面料图 -->
                                <img class="part-fabric-color"
                                     v-if="item.regionCode === newData[item.regionCode].regionCode"
                                     v-lazy="getImg(newData[item.regionCode].url)"
                                     :key="newData[item.regionCode].url">
                            </div>

                            <!-- 部件 -->
                            <div v-show="partIndex === index" class="part-item-open">
                                <ul class="clearfix part-detail-list">
                                    <li v-for="(partFabricItem,partFabricIndex) in getRegionPartFabric"
                                        :key="partFabricIndex"
                                        @click.stop="regionPartActiveClick(partFabricItem, partFabricIndex)"
                                        :class="['fl', 'part-detail-item',{'selected':newData[item.regionCode].partCode === partFabricItem.partCode}]">
                                        <img v-lazy="getImg(partFabricItem.partUrl)" :key="partFabricItem.partUrl">
                                        <i class="iconfont icon-check icon-select"></i>
                                        <p class="text-overhidden part-item-open-describe">{{partFabricItem.partName}}</p>
                                    </li>
                                </ul>

                                <div @click.stop="firstRightNextClick()" class="com-radius-shadow common-btn next-btn">
                                    <span class="compare-btn-marginr">下一步</span>
                                    <i class="iconfont icon-Icon_xiayibu icon-sure"></i>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <!-- 部件：第二步操作 -->
                <div v-show="isHeader === 'partSecond'" class="part-cont">
                    <div class="part-fabric">
                        <div :class="['com-web-shadow-less','clearfix','part-fabric-item','selected']">
                            <div class="clearfix part-fabric-item-info">
                                <div @click="isHeader === 'partSecond' && secondLeftPreviousClick('partFirst')"
                                     class="fl part-fabric-open-close">
                                    <i class="iconfont icon-close_sketch"></i>
                                </div>
                                <div class="fl part-fabric-img">
                                    <img v-if="regionActionItem.regionUrl"
                                         v-lazy="getImg(regionActionItem.regionUrl[0])"
                                         :key="regionActionItem.regionUrl[0]">
                                    <img v-else src="" :onerror="errorImg">
                                </div>
                                <div class="fr part-fabric-open">
                                    <i class="iconfont icon-caretright"></i>
                                </div>
                                <div v-if="regionActionItem" class="fr part-fabric-describe">
                                    <span class="text-overhidden part-fabric-describe-title">{{regionActionItem.regionName}}</span>
                                    <span class="text-overhidden part-fabric-describe-color">{{newData[regionActionItem.regionCode].partName}}</span>
                                    <span class="text-overhidden part-fabric-describe-text">{{newData[regionActionItem.regionCode].fabricName}}</span>
                                </div>
                            </div>

                            <!-- 右侧小块长型面料图 -->
                            <img v-lazy="getImg(regionPartTwoActiveItem.fabricUrl)" :key="regionPartTwoActiveItem.fabricUrl" class="part-fabric-color">
                        </div>

                        <!-- 面料列表 -->
                        <div class="part-fabric-container">
                            <ul class="common-btn-support part-fabric-list">
                                <li v-for="(item,index) in getRegionPartFabricTwoData"
                                    :key="index"
                                    @click="regionPartTwoActiveClick(item, index)"
                                    :class="['part-fabric-li',{'selected':newData[regionActionItem.regionCode].fabricCode === item.fabricCode}]">
                                    <img v-lazy="getImg(item.fabricUrl)" :key="item.fabricUrl">
                                    <p class="part-fabric-li-text">{{item.fabricName}}</p>
                                </li>
                            </ul>
                        </div>

                        <!-- 底部确定按钮 -->
                        <div class="right-footer">
                            <div @click="partCloseOrOk('ok')" class="com-radius-shadow right-sure-btn">
                                <!--<i class="iconfont icon-Icon_queding icon-sure"></i>-->
                                <span class="compare-btn-text">编辑其他部位</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 印花：第一步操作 -->
                <div v-show="isHeader === 'printFirst'" class="custom-cont">
                    <ul class="clearfix custom-list common-btn-support">
                        <li v-for="(item,index) in printData"
                            :key="'print_' + index"
                            @click="printActiveClick(item,index)"
                            :class="['fl', 'custom-item',{'selected':printDataActive === index}]">
                            <img v-if="item.regionUrl" v-lazy="getImg(item.regionUrl[0])" :key="item.regionUrl[0]">
                            <img v-else src="" :onerror="errorImg">
                            <i class="iconfont icon-check icon-select"></i>
                            <p class="text-overhidden custom-open-describe">{{item.regionName}}</p>
                        </li>
                    </ul>
                    <div class="right-footer">
                        <div @click="firstRightNextClick()" class="com-radius-shadow right-sure-btn">
                            <span class="compare-btn-marginr">下一步</span>
                            <i class="iconfont icon-Icon_xiayibu icon-sure"></i>
                        </div>
                    </div>
                </div>
                <!-- 印花：第二步操作 -->
                <div v-show="isHeader === 'printSecond'" class="custom-cont">
                    <div class="print-detail">
                        <!-- tab -->
                        <div :class="['com-web-shadow-less','clearfix','print-detail-item','selected']">
                            <div class="clearfix print-detail-item-info">
                                <div @click="secondLeftPreviousClick('printFirst')" class="fl print-detail-open-close">
                                    <i class="iconfont icon-close_sketch"></i>
                                </div>
                                <div class="fl print-detail-img">
                                    <img src="@/assets/images/goods/part1.png">
                                </div>
                                <div class="text-overhidden fl print-detail-describe">
                                    {{printDataActiveItem.regionName}}
                                </div>
                            </div>
                        </div>

                        <div class="print-detail-cont">
                            <div class="clearfix operator-line">
                                <div @click="uploadDailog()" class="fl clearfix add-pic">
                                    <i class="iconfont fl icon-Icon_jiahao icon-add"></i>
                                    <span>上传图片</span>
                                    <input ref="uploadImg" class="none" type="file" name="file" @change="uploadImg($event)">
                                </div>
                                <div class="rotate fr">
                                    <span>旋转：</span>
                                    <!-- @blur="changePrint()" @keyup.enter="changePrint()" -->
                                    <input ref="printRotate" @blur="isEmbFlag = true; changePrint()" @keyup.enter="$event.target.blur" v-model="printRotate" class="rotate-input" type="text" oninput="value=value.replace(/[^0-9-]+/,'')">
                                    <span>度</span>
                                </div>
                            </div>

                            <!-- 我的图片、官方图片 -->
                            <div class="pic-container" @click="handleClickCustomList('printRotate')">
                                <ul class="clearfix pic-container-list common-btn-support">
                                    <li v-for="(item,index) in printNewArr"
                                        @click.stop="printTwoActiveClick(item, index)"
                                        :class="['fl', 'pic-container-item',{'selected':officialColActive === index}]">
                                        <img v-lazy="getImg(item.imageUrl)" :key="item.imageUrl">
                                        <i class="iconfont icon-check icon-select"></i>
                                        <div v-if="item.isMyPrint" class="user-logo">
                                            <i class="iconfont icon-Icon_yonghu icon-user"></i>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- 底部确定按钮 -->
                        <!--<div @click="printSureClick()" class="right-footer">-->
                            <!--<div class="com-radius-shadow right-sure-btn">-->
                                <!--<i class="iconfont icon-Icon_queding icon-sure"></i>-->
                                <!--<span class="compare-btn-text">确定</span>-->
                            <!--</div>-->
                        <!--</div>-->
                    </div>
                </div>

                <!-- 绣字：第一步操作 -->
                <div v-show="isHeader === 'embFirst'" class="custom-cont">
                    <ul class="clearfix custom-list common-btn-support">
                        <li v-for="(item,index) in embData"
                            :key="'emb_' + index"
                            @click="embActiveClick(item,index)"
                            :class="['fl', 'custom-item',{'selected':embDataActive === index}]">
                            <img v-if="item.regionUrl" v-lazy="getImg(item.regionUrl[0])" :key="item.regionUrl[0]">
                            <img v-else src="" :onerror="errorImg">
                            <i class="iconfont icon-check icon-select"></i>
                            <p class="text-overhidden custom-open-describe">{{item.regionName}}</p>
                        </li>
                    </ul>
                    <div class="right-footer">
                        <div @click="firstRightNextClick()" class="com-radius-shadow right-sure-btn">
                            <span class="compare-btn-marginr">下一步</span>
                            <i class="iconfont icon-Icon_xiayibu icon-sure"></i>
                        </div>
                    </div>
                </div>
                <!-- 绣字：第二步操作 -->
                <div v-show="isHeader === 'embSecond'" class="custom-cont">
                    <div class="print-detail">
                        <div :class="['com-web-shadow-less','clearfix','print-detail-item','selected']">
                            <div class="clearfix print-detail-item-info">
                                <div @click="secondLeftPreviousClick('embFirst')" class="fl print-detail-open-close">
                                    <i class="iconfont icon-close_sketch"></i>
                                </div>
                                <div class="fl print-detail-img">
                                    <img src="@/assets/images/goods/part1.png">
                                </div>
                                <div class="text-overhidden fl print-detail-describe">
                                    {{embDataActiveItem.regionName}}
                                </div>
                            </div>
                        </div>

                        <div class="print-detail-cont">
                            <div class="emb-word-cont">
                                <textarea class="textarea-input" v-model="ebdText" name="" placeholder="输入文字" id="" cols="30" rows="10"></textarea>
                                <div class="clearfix font">
                                    <div class="fl font-label">字体：</div>
                                    <div @click="fontFlag = !fontFlag" class="fl font-cont">
                                        <span class="text-overhidden">{{fontName}}</span>
                                        <i class="iconfont icon-icon_Arrow_down icon-down"></i>
                                        <!-- 字体下拉弹层 -->
                                        <div class="com-web-shadow-less font-container" v-show="fontFlag">
                                            <ul>
                                                <li v-for="(item,index) in getEmbFonts.fontList"
                                                    :key="index"
                                                    @click="embFontActive(item, index)"
                                                    :class="['text-overhidden',{'selected':embFontActiveIndex === index}]">
                                                    {{item.ictEmbFontsHdName}}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div class="clearfix font">
                                    <div class="fl font-label">颜色：</div>
                                    <div class="fl font-cont">
                                        <ul class="clearfix color-list">
                                            <li v-for="(item,index) in getEmbFonts.colorList"
                                                :key="index"
                                                @click="embColorActive(item, index)"
                                                :class="['fl','color-item',{'selected':embColorActiveIndex === index}]">
                                                <div :style="{backgroundColor: item.colorNumberHx}" class="color-container"></div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 底部确定按钮 -->
                        <div class="right-footer">
                            <div @click="embSureClick()" class="com-radius-shadow right-sure-btn">
                                <i class="iconfont icon-Icon_queding icon-sure"></i>
                                <span class="compare-btn-text">确定</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 绣花：第一步操作 -->
                <div v-show="isHeader === 'embPrintFirst'" class="custom-cont">
                    <ul class="clearfix custom-list common-btn-support">
                        <li v-for="(item,index) in embPrintData"
                            :key="'embPrint_' + index"
                            @click="embPrintActiveClick(item,index)"
                            :class="['fl', 'custom-item',{'selected':embPrintDataActive === index}]">
                            <img v-if="item.regionUrl" v-lazy="getImg(item.regionUrl[0])" :key="item.regionUrl[0]">
                            <img v-else src="" :onerror="errorImg">
                            <i class="iconfont icon-check icon-select"></i>
                            <p class="text-overhidden custom-open-describe">{{item.regionName}}</p>
                        </li>
                    </ul>

                    <div class="right-footer">
                        <div @click="firstRightNextClick()" class="com-radius-shadow right-sure-btn">
                            <span class="compare-btn-marginr">下一步</span>
                            <i class="iconfont icon-Icon_xiayibu icon-sure"></i>
                        </div>
                    </div>
                </div>
                <!-- 绣花：第二步操作 -->
                <div v-show="isHeader === 'embPrintSecond'" class="custom-cont">
                    <div class="print-detail">
                        <div :class="['com-web-shadow-less','clearfix','print-detail-item','selected']">
                            <div class="clearfix print-detail-item-info">
                                <div @click="isHeader === 'embPrintSecond' && secondLeftPreviousClick('embPrintFirst')"
                                     class="fl print-detail-open-close">
                                    <i class="iconfont icon-close_sketch"></i>
                                </div>
                                <div class="fl print-detail-img">
                                    <img src="@/assets/images/goods/part1.png">
                                </div>
                                <div class="text-overhidden fl print-detail-describe">
                                    {{embPrintDataActiveItem.regionName}}
                                </div>
                            </div>
                        </div>

                        <div class="print-detail-cont">
                            <div class="clearfix operator-line">
                                <div class="rotate fl">
                                    <span>旋转：</span>
                                    <input ref="embPrintRotate" @blur="isEmbFlag = true; changeEmbPrint()" @keyup.enter="$event.target.blur" v-model="embPrintRotate" class="rotate-input" type="text" oninput="value=value.replace(/[^0-9-]+/,'')">
                                    <span>度</span>
                                </div>
                            </div>

                            <!-- 图片列表 -->
                            <div class="pic-container" id="embroider-pic-container" @click="handleClickCustomList('embPrintRotate')">
                                <ul class="clearfix pic-container-list common-btn-support">
                                    <li v-for="(item,index) in embPrintNewArr"
                                        @click.stop="embPrintTwoActiveClick(item, index)"
                                        :class="['fl', 'pic-container-item',{'selected': embPrintColActive === index}]">
                                        <img v-lazy="getImg(item.imageUrl)" :key="item.imageUrl">
                                        <i class="iconfont icon-check icon-select"></i>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- 底部确定按钮 -->
                        <!--<div class="right-footer">-->
                            <!--<div @click="embPrintSureClick()" class="com-radius-shadow right-sure-btn">-->
                                <!--<i class="iconfont icon-Icon_queding icon-sure"></i>-->
                                <!--<span class="compare-btn-text">确定</span>-->
                            <!--</div>-->
                        <!--</div>-->
                    </div>
                </div>
            </div>
        </div>

        <!-- 定制对比弹框 -->
        <div v-show="showContrastFlag" class="pop-contrast">
            <div @click="showContrastFlag = false" class="pop-contrast-back">
                <i class="iconfont icon-Icon_fanhui"></i>
                <span>返回</span>
            </div>

            <div class="contrast-top">
                <div class="clearfix contrast-top-cont">
                    <div class="fl contrast-top-item">
                        <div id="modelLeft" class="contrast-top-model"></div>
                        <div class="com-web-shadow-less contrast-btn-group">
                            <div v-if="modelLeftPrice" class="contrast-btn-price">¥{{modelLeftPrice.totalPrice | Fix2}}</div>
                            <div v-else class="contrast-btn-price">¥0.00</div>
                            <div @click="reCustomize('modelLeftData')" class="contrast-btn-reset">重新定制</div>
                            <div @click="addCartContrast('modelLeftData')" class="contrast-btn-add" v-if="sellFlag === 1">加入购物车</div>
                            <div class="contrast-btn-unsell" v-else>已下架</div>
                        </div>
                    </div>
                    <div class="fl contrast-top-item">
                        <div id="modelRight" class="contrast-top-model"></div>
                        <div class="com-web-shadow-less contrast-btn-group">
                            <div v-if="modelRightPrice" class="contrast-btn-price">¥{{modelRightPrice.totalPrice | Fix2}}</div>
                            <div v-else class="contrast-btn-price">¥0.00</div>
                            <div @click="reCustomize('modelRightData')" class="contrast-btn-reset">重新定制</div>
                            <div @click="addCartContrast('modelRightData')" class="contrast-btn-add" v-if="sellFlag === 1">加入购物车</div>
                            <div class="contrast-btn-unsell" v-else>已下架</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="contrast-bottom-cont">
                <div class="contrast-bottom-barrier-left"></div>
                <div class="contrast-bottom-barrier-right"></div>
                <div class="com-web-shadow-more contrast-bottom" ref="xScroll">
                    <ul class="contrast-bottom-list" ref="xScrollUl">
                        <li v-for="(item,index) in constrastList"
                            @click="selectedContrast(item,index)"
                            :class="['contrast-bottom-item', {'selected':contrastIndex === index || item.modelLeftActive || item.modelRightActive}]">
                            <img v-lazy="getImg(item.url)" :key="item.url">
                            <!--<input name="select" checked class="contrast-checkbox" type="checkbox" value="true"/>-->
                            <div v-if="item.isSystem === 2" class="recommend-logo">荐</div>
                            <div v-show="contrastIndex === index"
                                 class="com-web-shadow-less contrast-tip-cont"
                                 @click.stop="">
                                <div class="contrast-tip">
                                    <p class="contrast-msg">请选择需要替换的方案</p>
                                    <div class="clearfix contrast-foot-btn">
                                        <span @click.stop="contrastIndex = -1" class="fl not-btn">否</span>
                                        <span @click.stop="contrastReplace(item, index, 'modelLeft')" class="fl clear-btn">替换左侧</span>
                                        <span @click.stop="contrastReplace(item, index, 'modelRight')" class="fl">替换右侧</span>
                                    </div>
                                </div>
                                <div class="triangle triangle-bottom"></div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- 弹窗：sync指里外参数同步 -->
        <dialog-comp :is-show.sync="isShowDialog" @sureBtn="sureBtn" @closeBtn="closeBtn"></dialog-comp>

        <!-- 弹窗：超过2个部位印绣花 -->
        <dialog-more-comp :is-show.sync="partShow" :shine-flag.sync="shineFlag" :newData="newData" @partRemove="partRemove"></dialog-more-comp>

        <!-- 组件：loading -->
        <loading-comp v-if="loading"></loading-comp>

        <!-- 组件：详情引导 -->
        <guide-comp v-if="guideShow"></guide-comp>
    </div>
</template>
<script type="text/ecmascript-6">
    import Storage from './../../util/storage'
    import ISCC from '../../assets/js/custom_method'
    import UTILS from '../../util/utils'
    import { Customization } from "../../api/service"
    import BScroll from 'better-scroll'
    import VueCoreImageUpload from 'vue-core-image-upload'
    import dataVerify from '../../util/dataVerify'
    import LoadingComp from '../../components/Loading/Loading.vue'
    import GuideComp from '../../components/Guide/Guide.vue'
    import DialogComp from '../../components/Dialog.vue'
    import DialogMoreComp from '../../components/DialogMore/DialogMore.vue'
    import { debounce, throttle } from '../../util/debounce'

    export default {
        name: 'web-design',
        components: {
            'vue-core-image-upload': VueCoreImageUpload,
            LoadingComp,
            GuideComp,
            DialogComp,
            DialogMoreComp
        },
        data () {
            return {
//                test: '',
                errorImg: 'this.src="' + require('../../assets/images/common/none.png') + '"',
                // 部件当前索引
                partIndex: 0,
                // 印花、绣花、绣字选中部件当前索引
                partDetailIndex: 0,
                fontFlag: false,//显示字体列表
                isShowDialog: false,
                partShow: false,
                modelFullScreen: false,//模型是否全屏
                btnLock: false,
                btnResetLock: false, // 重置按钮锁

                // 价格
                price: 0,
                // 详情引导
                guideShow: false,
                loading: false,
                // 商品上下架
                isShelves: false,
                // 定制清单
                customListShow: false,
                customPartList: [],
                // 绣字颜色选中
                embColorActiveIndex: 0,
                // 绣字字体选中
                embFontActiveIndex: 0,
                // 绣字内容
                ebdText: '',
                // header标题（默认主面料）
                isHeader: 'fabric',
                footerList: [],
                // 设计方案（默认选中推荐设计）
                designTitleActive: 1,
                // 推荐设计
                designData: '',
                designDataEmpty: false,
                isDesign: true,
                // 选中推荐设计
                designDataActive: null,
                // 选中我的设计
                myDesignDataActive: -1,
                // 缺
                designDataShort: null,
                // 主面料
                fabricData: '',
                fabricDataActive: null,
                fabricDataActiveItem: '',
                getgoodBase: '',
                // 部件
                getRegionclassData: '',
                regionActionItem: '',
                // 部件查数来的具体部件数据
                getRegionPartFabric: [],
                getRegionPartFabricTwoData: [],
                regionPartActive: null,
                regionPartActiveItem: '',

                regionPartTwoActive: null,
                regionPartTwoActiveItem: '',
                // 绣字
                embData: [],
                embDataActive: null,
                embDataActiveItem: '',
                // 绣字颜色、字体列表
                getEmbFonts: '',
                // 绣字选中的颜色字体
                color: '',
                colorCode: '',
                colorId: '',
//                font: '',
                fontName: '',
                fontCode: '',
                fontId: '',
                // 绣花
                embPrintData: [],
                embPrintDataActive: null,
                embPrintDataActiveItem: '',
                embPrintNewArr: [],
                liWidth: 0,
                embPrintRotate: 0,
                // 印花
                printData: [],
                printDataActive: null,
                printDataActiveItem: '',
                printNewArr: [],
                myPrintNewArr: [],
                officialColActive: null,
                officialColIndexActive: null,
                myPicColActive: null,
                myPicColIndexActive: null,
                embPrintColActive: null,
                embPrintColIndexActive: null,
                printRotate: 0,
                isEmbStartFlag: false,
                // 新数据
                newData: {},
                // 旧数据
                oldData: {},
                // 是否驱动部位
                driveRegionFlag: false,
                driveRegionList: '',
                // 对比：显示对比页
                showContrastFlag: false,
                // 对比：列表
                constrastList: '',
                // 对比：商品列表下标
                contrastIndex: -1,
                // 对比：左边模型克隆出来的对象
                modelLeftObj: '',
                // 对比：右边模型克隆出来的对象
                modelRightObj: '',
                // 对比：左边模型数据
                modelLeftData: {},
                // 对比：左边模型数据
                modelRightData: {},
                modelLeftPrice: 0,
                modelRightPrice: 0,
                getAllDesignDetailLeft: '',
                getAllDesignDetailRight: '',
                shineFlag: false,   // 闪烁还没解决  true未结束
                isEmbFlag: false,
                event: '',

                // 是否显示获取坐标按钮
                positionShowOrHidden: false,
                // 是否显示获取帧数按钮
                framesShowOrHidden: false,

                // 组合商品编码
                goodsCode: '',
                // 业务触点code
                busContsCode: '',
                // 业务触点Id
                busContskey: '',
                // 店铺code
                shopCode: '',
                // 店铺key
                shopKey: '',
                // 用户id
                usrId: '',
                // 公司id
                companyId: '',
                // 是否上下架标识
                sellFlag: 1,
                // 是否收藏标识 0否 1是
                collectionFlag: 0,
                // 收藏id
                rtlCollectionDtId: null,
                salePrice: 0,
                tagPrice: 0
            }
        },
        created() {
            ISCC.setFile()

            this._initData()

            document.addEventListener('click', () => {
                this.customListShow = false;
            });

            // 监听父页面发送的信息
            window.addEventListener('message', (async event => {
                console.log("定制组件收到" + event.origin + "消息", event.data)
                // 加入购物车
                if (event.data.operate === 'addCart') {
                    this.addCart();
                    // 重新获取我的设计方案
                    if (this.designTitleActive === 2 || this.designTitleActive === '2') {
                        this.designData = this.designTitle(2, true)
                    }
                }
                // 左侧模型加入购物车
                if (event.data.operate === 'addCartModelLeft') {
                    this.addCartContrast('modelLeftData');
                    // 重新获取我的设计和系统推荐设计
                    this.getMyAndSystemDesign();
                }
                // 右侧模型加入购物车
                if (event.data.operate === 'addCartModelRight') {
                    this.addCartContrast('modelRightData');
                    // 重新获取我的设计和系统推荐设计
                    this.getMyAndSystemDesign();
                }
                // 立即购买
                if (event.data.operate === 'nowBuy') {
                    this._nowBuySure();
                }
                // 保存
                if (event.data.operate === 'myDesign') {
                    this._frontMyDesignClick();
                    // 重新获取我的设计方案
                    if (this.designTitleActive === 2 || this.designTitleActive === '2') {
                        this.designData = this.designTitle(2, true)
                    }
                }
                // 上传印花
                if (event.data.operate === 'uploadPrint') {
                    this.uploadDailog();
                    // 重新获取我的印花
                    this._getMyPrintAndOfficialList();
                    // 重新获取我的设计方案
                    if (this.designTitleActive === 2 || this.designTitleActive === '2') {
                        this.designData = this.designTitle(2, true)
                    }
                }
                // 加入收藏
                if (event.data.operate === 'addCollect') {
                    // 重新获取收藏状态
                    await this.getIsCollect();
                    if (this.collectionFlag === 1) {
                        // 取消收藏
                        this.addOrCancelCollection('cancel');
                    }
                    if (this.collectionFlag === 0) {
                        // 加入收藏
                        this.addOrCancelCollection('add');
                    }

                    return
                }

                if (event.data.operate != undefined) {
                    // 是否收藏判断
                    this.getIsCollect();
                }
            }), false);
        },
        mounted() {
            this._initScroll()
        },
        methods: {
            /**
             * 解决better scroll阻止原生点击事件导致input无法失焦问题
             *
             * 方案：判断是否处于聚焦旋转input的时候去点击印花或绣字列表容器 => 是则处理失焦
             * **/
            handleClickCustomList(ref) {
                // 判断是否聚焦input
                if(this.$refs[ref] === document.activeElement) {
                    this.$refs[ref].blur();
                }else{

                }
            },
//            // 防抖测试
//            debounceTest: debounce(function(params) {
//                console.log('函数防抖')
//            }, 2000),
//            // 节流测试
//            throttleTest: throttle(function (params) {
//                console.log('节流测试', params)
//            },5000),
            /**
             * postMessage实现与父级通信
             */
            postMessage(operate){
                let usrInfo = Storage.get('USER_INFO')
                let url = this.baseUrl + 'goods-design/'
//                let url = 'http://localhost:8083/goods-design/'
                window.parent.postMessage({
                    isLogin: !usrInfo,
                    operate: operate
                }, url)
            },
            /**
             * 参数初始化
             */
            async _initData() {
                this.loading = true
                this.footerList = []
                this.printData = []
                this.embData = []
                this.embPrintData = []
                this.newData.partEmbData = []
                this.newData.partEmbPrintData = []
                this.newData.partPrintData = []

                let goodsName = ''
                let request = UTILS._getRequest()   // 地址栏获取
                let query = this.$route.query       // 路由获取

                // 获取基本参数
                let flag = request['flag'] || query.flag
                if (flag) {     // 项目上线，注释掉if里的内容
                    this.goodsCode = request['goodsCode'] || query.goodsCode
                    goodsName = query.goodsName || '商品名称'
                    this.companyId = '2'     // 巴龙测试id：562   开发：536    239
                    this.busContsCode = 'D_BUSCONTS_B2C'    // D_BUSCONTS_WSC

                    if (!Storage.get('COMPANYID')) {
                        Storage.set('COMPANYID', '{"company_id":' + this.companyId + '}')
                    }
                    if (!Storage.get('USER_INFO')) {
                        Storage.set('USER_INFO', '{"usrId":673,"shopCode":"QS0002","shopId":312}')  // {"usrId":2,"shopId":364,"shopCode":"PC001"}
                    }
                } else {
                    this.goodsCode = request['goodsCode'] || query.goodsCode
                    goodsName = decodeURIComponent(query.goodsName)
                    this.companyId = Storage.get('COMPANYID').company_id
                    this.busContsCode = Storage.get('properties').busContsCode
                    this.shopCode = Storage.get("properties").shopCode
                    this.shopKey = Storage.get("properties").shopId
                }

                // 获取坐标
                if (request['position'] || query.position) {
//                    this.$toast('请先选择部位，再抓点；抓点请在这个部位上；')
                    this.positionShowOrHidden = true
                }

                if (window.location.ancestorOrigins) {
                    this.baseUrl = window.location.ancestorOrigins[0] + '/'
                } else {
                    this.baseUrl = window.location.origin + '/'
                }

                // 获取模型帧数
                if (request['frames'] || query.frames) {
                    this.framesShowOrHidden = true
                }

                document.title = goodsName

                // 商品基本信息（主面料驱动）
                await Customization.getGoodBase({
                    goodsCode: this.goodsCode,
                    busContsCode: this.busContsCode
                }).then((res) => {
                    this.getgoodBase = res;
                });

                // 从购物车进入
                let rtlDesignHdId = request['rtlDesignHdId'] || query.rtlDesignHdId //我的设计
                let spGoodsDtDesignId = request['spGoodsDtDesignId'] || query.spGoodsDtDesignId // 推荐设计

                if (rtlDesignHdId || spGoodsDtDesignId) {
                    this.goodsId = request['goodsId'] || query.goodsId

                    // 模型场景渲染
                    await ISCC.goodScene(this, this.goodsCode)

                    let id = ''
                    let type = ''
                    if (rtlDesignHdId) {
                        id = rtlDesignHdId
                        type = 1
                    } else {
                        id = spGoodsDtDesignId
                        type = 2
                    }

                    await this.myDesign({id: id}, null, type)

                } else {
                    // 初始定制清单（默认的部件面料）
                    await Customization.getDefaultDetailed({
                        goodsCode: this.goodsCode,  // 选中的商品编码
                        checkFlag: 0,               // 限定关系：0开启筛选 1关闭筛选
                        companyId: this.companyId
                    }).then((res) => {
                        this.getDefaultDetailed = res;
                    });

                    // 页面一初始化，存储默认主面料、主面料url、默认部件
                    this.goodsId = this.getDefaultDetailed.goodsId ? this.getDefaultDetailed.goodsId : (request['goodsId'] || query.goodsId)
                    this.newData.MainFabric = this.getDefaultDetailed.mainFabricCode
                    this.newData.MainFabricName = this.getDefaultDetailed.mainFabricName
                    this.newData.fabricId = this.getDefaultDetailed.fabricId
                    this.newData.MainFabricUrl = this.getDefaultDetailed.url
                    this.newData.MainFabricName = this.getDefaultDetailed.mainFabricName

                    this.getDefaultDetailed.detailedList.forEach((item, index) => {
                        this.newData[item.regionCode] = Object.assign({}, item)
                    })

                    // 模型场景渲染
                    await ISCC.goodScene(this, this.goodsCode)
                    // 模型渲染
                    await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, this.getDefaultDetailed.mainFabricCode)
                    // 获取价格
//                    this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
                }

                // 是否上下架判断
                this.getIsShelves();
                // 是否收藏判断
                this.getIsCollect();

                this.designDataActive = -1
                this.myDesignDataActive = -1

                // 驱动部位
                await Customization.driveRegion({
                    goodsCode: this.goodsCode
                }).then((res) => {
                    this.driveRegionList = res;
                });

                // 部件列表
                let getRegionclass;
                await Customization.getRegionClass({
                    goodsCode: this.goodsCode,
                    isFilter: 1 // 1启用部件过滤，0不过滤部件是否启用
                }).then(async (res) => {
                    getRegionclass = res;
                    let isNoDriveFlag = 0

                    for (let i = 0; i < getRegionclass.length; i++) {
                        let isDriveRegion = 0   // 默认不是限定关系
                        let item = getRegionclass[i]

                        if (this.driveRegionList.length) {
                            for (let j = 0; j < this.driveRegionList.length; j++) {
                                let itm = this.driveRegionList[j]
                                if (item.regionCode === itm.regionCode) {
                                    if (itm.mainFlag === 1) {
                                        isDriveRegion = 1
                                        item.isDriveRegion = isDriveRegion

                                        if (!rtlDesignHdId && !spGoodsDtDesignId) {
                                            await this._getRegionPartFabricCheck(this.newData[item.regionCode].partCode, false, 1)
                                        }
                                    } else {
                                        item.isDriveRegion = isDriveRegion
                                        isNoDriveFlag = isNoDriveFlag + 1
                                    }

                                    if ((j + 1 === this.driveRegionList.length) && (isNoDriveFlag + 1 === this.driveRegionList.length)) {
                                        this.getPriceFlag = false
                                    }
                                }
                            }
                        } else {
                            item.isDriveRegion = 0
                            this.getPriceFlag = false
                        }
                    }

                    // 没有限定关系，调用这里的价格
                    if (this.getPriceFlag === false) {
                        // 获取价格
                        this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)

                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    }

                    this.getRegionclassData = getRegionclass

                    // 获取推荐设计数据
                    let sysDesignData = await this.designTitle('1')
                    this.designData = []
                    if (sysDesignData === undefined || sysDesignData === null || sysDesignData.length === 0) {
                        this.isDesign = false
                        this.designTitleActive = 2
                        this.designData = await this.designTitle('2')
                    } else {
                        this.designTitleActive = 1
                        this.designData = sysDesignData
                    }

                    // 判断部件是否绣字 或 绣花 或 印花
                    getRegionclass.forEach((item) => {
                        if (item.isAvailabeEmb === 1) {             // 可绣字部件
                            this.embData.push(item)
                        }
                        if (item.isAvailabeEmbPrint === 1) {         // 可绣花部件
                            this.embPrintData.push(item)
                        }
                        if (item.isAvailabePrint === 1) {           // 可印花部件
                            this.printData.push(item)
                        }
                    })

                    // 添加主面料按钮
                    if (this.getgoodBase.driveMode === 1) {
                        this.footerList.push({
                            icon: '',
                            imgUrl: require('../../assets/images/goods/mianliao.png'),
                            name: '主面料',
                            enName: 'fabric',
                            usedName: '',
                            data: ''
                        })

                        // 获取主面料列表
                        await Customization.getMainFabricList({
                            goodsCode: this.goodsCode
                        }).then((res) => {
                            this.fabricData = res;
                        });

                        // 设置主面料选中状态
                        this._fabricActive(this.newData.fabricId)

                        this.isHeader = 'fabric'
                        await this.footerFabric(true)
                    }
                    // 部件按钮
                    if (this.getRegionclassData.length > 0) {
                        this.footerList.push({
                            icon: '',
                            imgUrl: require('../../assets/images/goods/suit.png'),
                            name: '部件',
                            enName: 'partFirst',
                            usedName: 'partSecond',
                            data: this.getRegionclassData[0]
                        })
                    }
                    // 印花按钮
                    if (this.printData.length > 0) {
                        this.footerList.push({
                            icon: '',
                            imgUrl: require('../../assets/images/goods/yinghua.png'),
                            name: '印花',
                            enName: 'printFirst',
                            usedName: 'printSecond',
                            data: ''
                        })
                    }
                    // 绣字按钮
                    if (this.embData.length > 0) {
                        this.footerList.push({
                            icon: '',
                            imgUrl: require('../../assets/images/goods/xiuzi.png'),
                            name: '绣字',
                            enName: 'embFirst',
                            usedName: 'embSecond',
                            data: ''
                        })
                    }
                    // 绣花按钮
                    if (this.embPrintData.length > 0) {
                        this.footerList.push({
                            icon: '',
                            imgUrl: require('../../assets/images/goods/xiuhua.png'),
                            name: '绣花',
                            enName: 'embPrintFirst',
                            usedName: 'embPrintSecond',
                            data: ''
                        })
                    }

                    if (this.getgoodBase.driveMode !== 1 && this.getRegionclassData.length > 0) {
                        this.isHeader = 'partFirst'
                        // 部件默认展开第一个
                        this.partIndex = 0

                        this.footerPart(this.getRegionclassData[0])
                    }

                    // 获取商城url
//                let getProperties = await this.$get('customization/getProperties')
//                Storage.set("ecshopIframeUrl", {"ecshopIframeUrl": getProperties.ecshopIframeUrl})

//                this.ecshopBaseUrl = Storage.get('ecshopIframeUrl').ecshopIframeUrl

                    this.guideShow = true

                    window.onresize = () => {
                        this.initXScroll()
                    }

                    setTimeout(() => {
//                        this.loading = false

                        // 3s未操作则自动旋转水平旋转
                        this._rotate()
                    }, 500)

                    this.btnResetLock = false
                })
            },
            /**
             * 3s未操作则自动旋转水平旋转
             */
            _rotate () {
                let isMove = false,
                    timer = null;
                window.onmousemove = function(){
                    // 移动时
                    isMove = true;
                    clearTimeout(timer);
                    ISCC.rotateSelf(false)

                    // 静止后
                    timer = setTimeout(function(){
                        isMove = false;
//                        ISCC.rotateSelf(true)
                    },3000);
                }
            },
            /**
             * 展开详情
             */
            detailShowOrHide () {
                this.modelFullScreen = !this.modelFullScreen

                // 详情收起的时间是600毫秒，所以改变canvas需要比600多
                setTimeout(() => {
                    ISCC.zoom()
                }, 610)
            },
            /**
             * 模型重置
             */
            reset () {
                if (this.btnResetLock) {
                    return
                }
                this.btnResetLock = true

                ISCC.clearAll()
                this.partIndex = 0
                this.printRotate = 0
                this.embPrintRotate = 0

                this._initData()
            },
            /**
             * 用户未登录
             * @param isStatus addCart：加入购物车
             *                 nowBuy：立即购买
             *                 myDesign: 保存设计方案
             */
            _gotoLogin (isStatus = '') {
                let flag = true
                if (!Storage.get('USER_INFO')) {
                    flag = false
                    this.$toast('您未登录，请先登录~')

                    this.postMessage(isStatus) // 判断有无用户信息
                }

                return flag
            },
            async _frontMyDesignClick() {
                // 用户未登录
                if (!this._gotoLogin('myDesign')) {
                    return
                }

                let params = {
                    shopKey: this.shopKey,
                    partHdId: this.goodsId
                }
                let getDesign;
                await Customization.getDesignFilter(params).then((res) => {
                    getDesign = res;
                });
                if (getDesign.length >= 8) {
                    this.$confirm({
                        title: '',
                        message: '我的设计方案最多可保存8个，保存该方案将自动清空一个历史最久的方案~',
                        btn: {
                            sure: '确定',
                            close: '否'
                        }
                    }).then(() => {
                        this.myDesignClick()

                    }).catch(() => {})
                } else {
                    this.myDesignClick()
                }
            },
            /**
             * 保存-暂存设计
             * @param isAddCart true为点击加入购物车触发的保存 false为暂存设计
             */
            async myDesignClick(isAddCart = false) {
                if (this.isEmbFlag) {
                    this.event = 'myDesignClick'
                    return
                }

                let goodsList = []
                let goodsListObj = {}
                let goodsListData = ''

                // 模型截图
                let screenModel = await ISCC.getScreen()

                goodsListObj.detailedList = []
                goodsListObj.goodsCode = this.goodsCode
                goodsListObj.amount = 1
                goodsListObj.usrId = Storage.get("USER_INFO").usrId
                goodsListObj.companyId = this.companyId
                goodsListObj.busContsCode = this.busContsCode
                goodsListObj.mainFabricCode = this.newData.MainFabric
                goodsListObj.designHdFileHdId = await uploadImg(this, screenModel)

//                    goodsListObj.detailedList = await this.isEmbOrIsPartEmt()

                let promise = new Promise((resolve, reject) => {
                    let partList = []
                    // 部件信息
                    for (let i = 0; i < this.getDefaultDetailed.detailedList.length; i++) {
                        let res = this.getDefaultDetailed.detailedList[i]
                        let currentData = this.newData[res.regionCode]
                        if (res.regionCode == currentData.regionCode) {
                            let partListObj = {}
                            partListObj.regionCode = currentData.regionCode
                            partListObj.partCode = currentData.partCode
                            partListObj.fabricCode = currentData.fabricCode
                            partListObj.partId = currentData.partId
                            partListObj.fabricId = currentData.fabricId
                            partListObj.regionId = currentData.regionId
                            partListObj.printList = []
                            partListObj.embList = []
                            partListObj.embptList = []

                            // 判断哪个部位绣字 或 绣花 或印花了
                            // 印花
                            if (this.newData.partPrintData) {
                                for (let j = 0; j < this.newData.partPrintData.length; j++) {
                                    let item = this.newData.partPrintData[j]
                                    if (item.regionCode == currentData.regionCode) {
                                        let printListObj = {}

                                        // 印花Id、旋转X角度、旋转Y角度、缩放、x坐标、y坐标、印花图片
                                        printListObj.printHdId = item.id
                                        printListObj.locationX = item.rotate || '0'
                                        printListObj.locationY = 0
                                        printListObj.scale = item.zoom || 0
                                        printListObj.positionX = item.xcoordinate
                                        printListObj.positionY = item.ycoordinate
                                        printListObj.fileHdId = item.pictKey

                                        partListObj.printList.push(printListObj)
//                                        embNum -= 1
                                    }
                                }
                            }
                            // 绣字
                            if (this.newData.partEmbData) {
                                for (let j = 0; j < this.newData.partEmbData.length; j++) {
                                    let item = this.newData.partEmbData[j]
                                    if (item.regionCode == currentData.regionCode) {
                                        let embListObj = {}

                                        embListObj.embValue = item.content                      // 绣字内容
                                        embListObj.colorId = item.colorId                       // 颜色
                                        embListObj.fontsId = item.fontId                        // 字体
                                        embListObj.rotationX = item.rotate || '0'               // 旋转
                                        embListObj.scaleX = item.scale || '0'                   // 缩放
                                        embListObj.positionX = item.xcoordinate                 // x轴坐标
                                        embListObj.positionY = item.ycoordinate                 // y轴坐标
                                        embListObj.embPictkey = item.embPictkey                 // 绣字图

                                        partListObj.embList.push(embListObj)
//                                        embNum -= 1
                                    }
                                }
                            }
                            // 绣花
                            if (this.newData.partEmbPrintData) {
                                for (let j = 0; j < this.newData.partEmbPrintData.length; j++) {
                                    let item = this.newData.partEmbPrintData[j]
                                    if (item.regionCode == currentData.regionCode) {
                                        let embptListObj = {}

                                        embptListObj.embHdId = item.id                           // 绣花编码
                                        embptListObj.locationX = item.rotate || '0'              // 旋转
                                        embptListObj.scale = item.zoom || '0'                    // 缩放
                                        embptListObj.positionX = item.xcoordinate               // x轴坐标
                                        embptListObj.positionY = item.ycoordinate               // y轴坐标
                                        embptListObj.glbFileHdId = item.pictKey                 // 绣花图列表有对应图片的id，直接使用

                                        partListObj.embptList.push(embptListObj)
//                                        embNum -= 1
                                    }
                                }
                            }

                            partList.push(partListObj)
                        }
                    }
                    goodsListObj.detailedList = partList

                    // 循环遍历结束
//                    if (embNum === 0) {
                        resolve()
//                    }
                })

                return promise.then(async() => {
                    // 点击购物车，调用保存（tempDesignFlag为1，不会保存到我的设计方案里）
                    if (isAddCart) {
                        goodsListObj.tempDesignFlag = 1
                    }

                    goodsList.push(goodsListObj)

                    // 提交
                    goodsListData = goodsList[0]
                    console.log('暂存设计数据====', JSON.stringify(goodsListData))

                    return await Customization.saveDesign({
                        goodsList: goodsListData
                    }).then(async (res) => {
                        if (res) {
                            if (isAddCart) {
                                this.event = ''
                                return res
                            } else {
                                this.$toast('保存成功~')

                                this.designDataActive = -1
                                this.myDesignDataActive = -1
                                this.event = ''

                                // 重新获取我的设计方案
                                if (this.designTitleActive == 2) {
                                    this.designData = await this.designTitle(2, true)
                                }
                            }
                        } else {
                            this.$toast('保存失败~')
                            this.event = ''
                        }
                    });
                })
            },
            /**
             * 加入购物车
             * @param modelData modelLeftData左边模型数据  modelRightData右边模型数据
             * @param modelObj 模型克隆出来的对象
             */
            async addCart(modelData = '', modelObj = '') {
                if (this.btnLock) {
                    console.log('您的操作太快了，请稍等~')
                    return
                }

                // 绣花、印花未结束
                if (this.isEmbFlag) {
                    this.event = 'addCart'
                    return
                }

                // 用户未登录
                if (!this._gotoLogin('addCart')) {
                    return
                }

                // 判断上下架
                await this.getIsShelves()
                if (this.sellFlag === 0) {
                    return false
                }

                // 判断库存
                let numData = await this._isDesignStock(modelData)
                if (numData.isInvEnough === 0) {
                    let info = ''
                    numData.fabricList.forEach(item => {
                        info += item.fabricName + ';'
                    })
                    this.$toast(`部分面料库存不足~</br>${info}`)
                    return
                }

                // 获取商品基本信息（颜色、尺码等）
                let getGoodsInfo;
                await Customization.getGoodsInfo({
                    goodsCode: this.goodsCode,
                    busContsCode: this.busContsCode,
                    shopCode: this.shopCode
                }).then((res) => {
                    getGoodsInfo = res;
                });

                let currentData = this.newData
                let defaultDetailed = this.getDefaultDetailed
                let price = this.price
                if (modelData === 'modelLeftData') {
                    defaultDetailed = ''
                    currentData = this[modelData]
                    defaultDetailed = this.getAllDesignDetailLeft
                    price = this.modelLeftPrice
                } else if (modelData === 'modelRightData') {
                    defaultDetailed = ''
                    currentData = this[modelData]
                    defaultDetailed = this.getAllDesignDetailRight
                    price = this.modelRightPrice
                }

                if (price <= 0 || (!price && price.totalPrice <= 0)) {
                    return
                }

                let parmas = {
                    amount: 1,
                    mainFabricCode: currentData.MainFabric,
                    partDtoList: [],
                    ptiPartHdId: this.goodsId,                      // 商品id
                    salePrice: price.totalPrice,
                    shopDptId: this.shopKey,                        // 门店id
                    colorId: getGoodsInfo.colorsVoList[0].colorId,
                    sizeId: getGoodsInfo.sizesVoList[0].sizeId,
                    busContsCode: this.busContsCode,
                    vipInfoHdId: Storage.get('USER_INFO').vipInfoId
                }

                if (!modelData) {   // 首页加入购物车
                    parmas.rtlDesignHdId = await this.myDesignClick(true)   // 暂存设计方案id

                    let screenModel = await ISCC.getScreen(modelObj)
                    parmas.fileHdId = await uploadImg(this, screenModel)          // 商品截图ID
                } else {            // 左边模型加入购物车
                    if (modelData === 'modelLeftData') {
                        for (let i=0;i<this.constrastList.length;i++) {
                            if (this.constrastList[i].modelLeftActive) {

                                // 我的设计
                                if (this.constrastList[i].isSystem === 1) {
                                    parmas.rtlDesignHdId = this.constrastList[i].designId
                                } else {
                                    parmas.spGoodsDtDesignId = this.constrastList[i].designId
                                }

                                parmas.fileHdId = this.constrastList[i].urlId
                                break
                            }
                        }
                    } else if (modelData === 'modelRightData') {    // 右边模型加入购物车
                        for (let i=0;i<this.constrastList.length;i++) {
                            if (this.constrastList[i].modelRightActive) {

                                // 我的设计
                                if (this.constrastList[i].isSystem === 1) {
                                    parmas.rtlDesignHdId = this.constrastList[i].designId
                                } else {
                                    parmas.spGoodsDtDesignId = this.constrastList[i].designId
                                }

                                parmas.fileHdId = this.constrastList[i].urlId
                                break
                            }
                        }
                    }
                }

                for (let i = 0; i < defaultDetailed.detailedList.length; i++) {
                    let item = defaultDetailed.detailedList[i]
                    let partObj = {}
                    if (item.regionCode === currentData[item.regionCode].regionCode) {
                        partObj.fabricCode = currentData[item.regionCode].fabricCode
                        partObj.fabricId = currentData[item.regionCode].fabricId
                        partObj.partCode = currentData[item.regionCode].partCode
                        partObj.partId = currentData[item.regionCode].partId
                        partObj.regionCode = currentData[item.regionCode].regionCode
                        partObj.regionId = currentData[item.regionCode].regionId
                        partObj.embList = []
                        partObj.embptList = []
                        partObj.printList = []

                        // 印花
                        if (currentData.partPrintData && currentData.partPrintData.length > 0) {
                            for (let j = 0; j < currentData.partPrintData.length; j++) {
                                let printItem = currentData.partPrintData[j]
                                if (item.regionCode === printItem.regionCode) {
                                    let printObj = {}

                                    printObj.fileHdId = printItem.id            // 印花图片路径id
                                    printObj.embPrintPictId = printItem.pictKey // 印花图
                                    printObj.locationX = printItem.rotate || '0'       // 印花旋转角度x
                                    printObj.locationY = printItem.rotate || '0'       // 印花旋转角度y
                                    printObj.positionX = printItem.xcoordinate  // 印花x坐标
                                    printObj.positionY = printItem.ycoordinate  // 印花y坐标
                                    printObj.printHdId = printItem.id           // 印花id
                                    printObj.scale = printItem.zoom || '0'      // 印花大小
                                    printObj.scaleX = '0'                       // 缩放

                                    partObj.printList.push(printObj)
                                }
                            }
                        }
                        // 绣字
                        if (currentData.partEmbData && currentData.partEmbData.length > 0) {
                            for (let j = 0; j < currentData.partEmbData.length; j++) {
                                let embItem = currentData.partEmbData[j]
                                if (item.regionCode === embItem.regionCode) {
                                    let embObj = {}

                                    embObj.colorId = embItem.colorId            // 绣字颜色id
                                    embObj.embValue = embItem.content           // 绣字值
                                    embObj.fontsId = embItem.fontId             // 绣字字体id
                                    embObj.positionX = embItem.xcoordinate      // 绣字x坐标
                                    embObj.positionY = embItem.ycoordinate      // 绣字y坐标
                                    embObj.rotationX = embItem.rotate || '0'    // 绣字旋转角度x
                                    embObj.scaleX = '0'                         // 缩放

                                    partObj.embList.push(embObj)
                                }
                            }
                        }
                        // 绣花
                        if (currentData.partEmbPrintData && currentData.partEmbPrintData.length > 0) {
                            for (let j = 0; j < currentData.partEmbPrintData.length; j++) {
                                let embPrintItem = currentData.partEmbPrintData[j]
                                if (item.regionCode === embPrintItem.regionCode) {
                                    let embPrintObj = {}

                                    embPrintObj.embHdId = embPrintItem.id               // 绣花id
                                    embPrintObj.embPrintPictId = embPrintItem.pictKey   // 绣花图
                                    embPrintObj.locationX = embPrintItem.rotate || '0'  // 绣花旋转角度
                                    embPrintObj.positionX = embPrintItem.xcoordinate    // 印花x坐标
                                    embPrintObj.positionY = embPrintItem.ycoordinate    // 印花y坐标
                                    embPrintObj.scale = embPrintItem.zoom || '0'        // 印花大小

                                    partObj.embptList.push(embPrintObj)
                                }
                            }
                        }

                        parmas.partDtoList.push(partObj)
                    }
                }

                console.log('加入购物车成功==', JSON.stringify(parmas))
                await Customization.saveCartValue(parmas).then(async (res) => {
                    if (res === 1) {
                        this.$toast("加入购物车成功~")
                        this.event = ''
                        this.postMessage('addCartSucceed') // 判断有无用户信息
                    }
                });
            },
            /**
             * 立即购买（废弃）
             */
            async nowBuy () {
                if (!UTILS.equals(JSON.stringify(this.oldData), JSON.stringify(this.newData))) {
                    this.$confirm({
                        title: '',
                        message: '是否要保存上一步操作？',
                        btn: {
                            sure: '确定',
                            close: '否'
                        }
                    }).then(() => {
                        this.infoCloseClick()

                        this._nowBuySure()
                    }).catch(() => {
                        this.infoCloseClick()

                        this._nowBuySure()
                    })
                } else {
                    this._nowBuySure()
                }
            },
            /**
             * 确定购买
             */
            async _nowBuySure() {
                if (this.btnLock) {
                    console.log('您的操作太快了，请稍等~')
                    return
                }

                // 绣花、印花未结束
                if (this.isEmbFlag) {
                    this.event = '_nowBuySure'
                    return
                }

                let params = {}
                let skuListObj = {}

                // 用户未登录
                if (!this._gotoLogin('nowBuy')) {
                    return
                }

                if (this.price <= 0 || (!this.price && this.price.totalPrice <= 0)) {
                    return
                }

                // 判断上下架
                await this.getIsShelves()
                if (this.sellFlag === 0) {
                    return false
                }

                // 判断库存
                let numData = await this._isDesignStock()
                if (numData.isInvEnough === 0) {
                    let info = ''
                    numData.fabricList.forEach(item => {
                        info += item.fabricName + ';'
                    })
                    this.$toast(`部分面料库存不足~</br>${info}`)
                    return
                }

                // 获取商品基本信息（颜色、尺码等）
                let getGoodsInfo;
                await Customization.getGoodsInfo({
                    goodsCode: this.goodsCode,
                    busContsCode: this.busContsCode,
                    shopCode: this.shopCode
                }).then((res) => {
                    getGoodsInfo = res;
                });

                // 模型截图
                let screenModel = await ISCC.getScreen()

                params.companyId = this.companyId
                params.vipInfoHdId = Storage.get("USER_INFO").vipInfoId
                params.cookieId = Storage.get("USER_INFO").usrId
                params.ctmUsrId = Storage.get("USER_INFO").usrId
                params.usrId = Storage.get("USER_INFO").usrId
                params.shopCode = this.shopCode
                params.sourceCode = 'D_ORDSHOP'     // D_ORDSHOP来源编码：pc端
                params.skuList = []
                params.amountOrd = this.price.totalPrice

                skuListObj.amount = 1
                skuListObj.colorCode = getGoodsInfo.colorsVoList[0].colorCode
                skuListObj.colorId = getGoodsInfo.colorsVoList[0].colorId
                skuListObj.sizeCode = getGoodsInfo.sizesVoList[0].sizeCode
                skuListObj.sizeId = getGoodsInfo.sizesVoList[0].sizeId
                skuListObj.ptiPartHdId = this.goodsId           // 商品id
                skuListObj.dealPrice = ''                       // 成交价
                skuListObj.goodsCode = this.goodsCode
                skuListObj.mainFabricCode = this.newData.MainFabric
                skuListObj.mainFabricName = ''
                skuListObj.mainFabricId = this.newData.fabricId
                skuListObj.pictFileId = await uploadImg(this, screenModel) // 定制图片key（封面图）

                skuListObj.partList = []

                params.skuList.push(skuListObj)

                this.getDefaultDetailed.detailedList.forEach((item, index) => {
                    let partObj = {}
                    if (item.regionCode === this.newData[item.regionCode].regionCode) {
                        partObj.fabricCode = this.newData[item.regionCode].fabricCode
                        partObj.fabricId = this.newData[item.regionCode].fabricId
                        partObj.partCode = this.newData[item.regionCode].partCode
                        partObj.partId = this.newData[item.regionCode].partId
                        partObj.regionCode = this.newData[item.regionCode].regionCode
                        partObj.regionId = this.newData[item.regionCode].regionId
                        partObj.emb = []
                        partObj.ept = []
                        partObj.prt = []

                        // 印花
                        if (this.newData.partPrintData && this.newData.partPrintData.length > 0) {
                            this.newData.partPrintData.forEach((printItem, printIndex) => {
                                if (item.regionCode === printItem.regionCode) {
                                    let printObj = {}

                                    printObj.embPrintPictId = printItem.pictKey         // 印花图
                                    printObj.embPrintPictUrl = printItem.pictUrl
                                    printObj.prtId = printItem.id                       // 印花图对应的主键
                                    printObj.prtcode = printItem.embPrintCode           // 印花编码
                                    printObj.rotate = printItem.rotate                  // 旋转
                                    printObj.scale = printItem.zoom || '0'              // 印花大小
                                    printObj.xcoordinate = printItem.xcoordinate        // 印花x坐标
                                    printObj.ycoordinate = printItem.ycoordinate        // 印花y坐标

                                    partObj.prt.push(printObj)
                                }
                            })
                        }
                        // 绣字
                        if (this.newData.partEmbData && this.newData.partEmbData.length > 0) {
                            this.newData.partEmbData.forEach((embItem, embIndex) => {
                                if (item.regionCode === embItem.regionCode) {
                                    let embObj = {}
                                    embObj.colorId = embItem.colorId            // 绣字颜色id
                                    embObj.content = embItem.content            // 绣字值
                                    embObj.embPictId = embItem.embPictkey       // 绣字图Id
                                    embObj.fontsId = embItem.fontId             // 绣字字体id
                                    embObj.rotate = embItem.rotate || '0'       // 旋转
                                    embObj.scale = embItem.scale || '0'         // 缩放
                                    embObj.xcoordinate = embItem.xcoordinate    // 绣字x坐标
                                    embObj.ycoordinate = embItem.ycoordinate    // 绣字y坐标

                                    partObj.emb.push(embObj)
                                }
                            })
                        }
                        // 绣花
                        if (this.newData.partEmbPrintData && this.newData.partEmbPrintData.length > 0) {
                            this.newData.partEmbPrintData.forEach((embPrintItem, embPrintIndex) => {
                                if (item.regionCode === embPrintItem.regionCode) {
                                    let embPrintObj = {}
                                    embPrintObj.embId = embPrintItem.id                 // 绣花id
                                    embPrintObj.embPrintPictId = embPrintItem.pictKey   // 绣花图
                                    embPrintObj.embcode = embPrintItem.embPrintCode     // 绣花编码
                                    embPrintObj.rotate = embPrintItem.rotate            // 旋转
                                    embPrintObj.scale = embPrintItem.zoom || '0'        // 印花大小
                                    embPrintObj.xcoordinate = embPrintItem.xcoordinate    // 印花y坐标
                                    embPrintObj.ycoordinate = embPrintItem.ycoordinate    // 印花y坐标

                                    partObj.ept.push(embPrintObj)
                                }
                            })
                        }

                        skuListObj.partList.push(partObj)
                    }
                })

                // 保存更新结算
                console.log('一件商品提交订单==', JSON.stringify(params))
                let saveCartTemp;
                await Customization.saveCartTemp(params).then((res) => {
                    saveCartTemp = res;
                });
                console.log('订单编码：' + saveCartTemp)

                let calculateData = {
                    ordId: saveCartTemp
                }
                await Customization.onlineCalculate(calculateData).then((res) => {});

                top.location.href = this.baseUrl + 'order-settle?orderHdId=' + saveCartTemp
            },
            /**
             * 通用：部件是否绣花 或 绣字数据组拼（用于提交订单[单西]、暂存设计）
             */
            isEmbOrIsPartEmt() {
                let partList = []
                // 部件信息
                for (let i = 0; i < this.getDefaultDetailed.detailedList.length; i++) {
                    let res = this.getDefaultDetailed.detailedList[i]
                    let currentData = this.newData[res.regionCode]

                    if (res.regionCode == currentData.regionCode) {
                        let partListObj = {}
                        partListObj.regionCode = currentData.regionCode
                        partListObj.partCode = currentData.partCode
                        partListObj.fabricCode = currentData.fabricCode
                        partListObj.partId = currentData.partId
                        partListObj.fabricId = currentData.fabricId
                        partListObj.regionId = currentData.regionId
                        partListObj.printList = []
                        partListObj.embList = []
                        partListObj.embptList = []

                        // 判断哪个部位绣字 或 绣花 或印花了
                        // 印花
                        if (this.newData.partPrintData && this.newData.partPrintData.length > 0) {
                            for (let j = 0; j < this.newData.partPrintData.length; j++) {
                                let item = this.newData.partPrintData[j]
                                if (item.regionCode == currentData.regionCode) {
                                    let printListObj = {}

                                    // 印花Id、旋转X角度、旋转Y角度、缩放、x坐标、y坐标、印花图片
                                    printListObj.printHdId = item.id
                                    printListObj.locationX = item.rotate || '0'
                                    printListObj.locationY = 0
                                    printListObj.scale = item.zoom || 0
                                    printListObj.positionX = item.xcoordinate
                                    printListObj.positionY = item.ycoordinate
                                    printListObj.fileHdId = item.pictKey

                                    partListObj.printList.push(printListObj)
                                }
                            }
                        }
                        // 绣字
                        if (this.newData.partEmbData && this.newData.partEmbData.length > 0) {
                            for (let j = 0; j < this.newData.partEmbData.length; j++) {
                                let item = this.newData.partEmbData[j]
                                if (item.regionCode == currentData.regionCode) {
                                    let embListObj = {}

                                    embListObj.embValue = item.content                      // 绣字内容
                                    embListObj.colorId = item.colorId                       // 颜色
                                    embListObj.fontsId = item.fontId                        // 字体
                                    embListObj.rotationX = item.rotate || '0'               // 旋转
                                    embListObj.scaleX = item.scale || '0'                   // 缩放
                                    embListObj.positionX = item.xcoordinate                 // x轴坐标
                                    embListObj.positionY = item.ycoordinate                 // y轴坐标
                                    embListObj.embPictkey = item.embPictkey                 // 绣字图

                                    partListObj.embList.push(embListObj)
                                }
                            }
                        }
                        // 绣花
                        if (this.newData.partEmbPrintData && this.newData.partEmbPrintData.length > 0) {
                            for (let j = 0; j < this.newData.partEmbPrintData.length; j++) {
                                let item = this.newData.partEmbPrintData[j]
                                if (item.regionCode == currentData.regionCode) {
                                    let embptListObj = {}

                                    embptListObj.embHdId = item.id                           // 绣花编码
                                    embptListObj.locationX = item.rotate || '0'              // 旋转
                                    embptListObj.scale = item.zoom || '0'                    // 缩放
                                    embptListObj.positionX = item.xcoordinate               // x轴坐标
                                    embptListObj.positionY = item.ycoordinate               // y轴坐标
                                    embptListObj.glbFileHdId = item.pictKey                 // 绣花图列表有对应图片的id，直接使用

                                    partListObj.embptList.push(embptListObj)
                                }
                            }
                        }

                        partList.push(partListObj)
                    }
                }

//                this.getDefaultDetailed.detailedList.forEach((res, index) => {
//                    let currentData = this.newData[res.regionCode]
//                    if (res.regionCode == currentData.regionCode) {
//                        let partListObj = {}
//                        partListObj.regionCode = currentData.regionCode
//                        partListObj.partCode = currentData.partCode
//                        partListObj.fabricCode = currentData.fabricCode
//                        partListObj.partId = currentData.partId
//                        partListObj.fabricId = currentData.fabricId
//                        partListObj.regionId = currentData.regionId
//                        partListObj.printList = []
//                        partListObj.embList = []
//                        partListObj.embptList = []
//
//                        // 判断哪个部位绣字 或 绣花 或印花了
//                        // 印花
//                        if (this.newData.partPrintData && this.newData.partPrintData.length > 0) {
//                            this.newData.partPrintData.forEach((item, itemIndex) => {
//                                if (item.regionCode == currentData.regionCode) {
//                                    let printListObj = {}
//
//                                    // 印花Id、旋转X角度、旋转Y角度、缩放、x坐标、y坐标、印花图片
//                                    printListObj.printHdId = item.id
//                                    printListObj.locationX = item.rotate || '0'
//                                    printListObj.locationY = 0
//                                    printListObj.scale = item.zoom || 0
//                                    printListObj.positionX = item.xcoordinate
//                                    printListObj.positionY = item.ycoordinate
//                                    printListObj.fileHdId = item.pictKey
//
//                                    partListObj.printList.push(printListObj)
//                                }
//                            })
//                        }
//                        // 绣字
//                        if (this.newData.partEmbData && this.newData.partEmbData.length > 0) {
//                            this.newData.partEmbData.forEach(async (item, index) => {
//                                if (item.regionCode == currentData.regionCode) {
//                                    let embListObj = {}
//
//                                    embListObj.embValue = item.content                      // 绣字内容
//                                    embListObj.colorId = item.colorId                       // 颜色
//                                    embListObj.fontsId = item.fontId                        // 字体
//                                    embListObj.rotationX = item.rotate || '0'               // 旋转
//                                    embListObj.scaleX = item.scale || '0'                   // 缩放
//                                    embListObj.positionX = item.xcoordinate                 // x轴坐标
//                                    embListObj.positionY = item.ycoordinate                 // y轴坐标
//                                    embListObj.embPictkey = item.embPictkey                 // 绣字图
//
//                                    partListObj.embList.push(embListObj)
//                                }
//                            })
//                        }
//                        // 绣花
//                        if (this.newData.partEmbPrintData && this.newData.partEmbPrintData.length > 0) {
//                            this.newData.partEmbPrintData.forEach((item, index) => {
//                                if (item.regionCode == currentData.regionCode) {
//                                    let embptListObj = {}
//
//                                    embptListObj.embHdId = item.id                           // 绣花编码
//                                    embptListObj.locationX = item.rotate || '0'              // 旋转
//                                    embptListObj.scale = item.zoom || '0'                    // 缩放
//                                    embptListObj.positionX = item.xcoordinate               // x轴坐标
//                                    embptListObj.positionY = item.ycoordinate               // y轴坐标
//                                    embptListObj.glbFileHdId = item.pictKey                 // 绣花图列表有对应图片的id，直接使用
//
//                                    partListObj.embptList.push(embptListObj)
//                                }
//                            })
//                        }
//
//                        partList.push(partListObj)
//                    }
//                })

                return partList
            },
            /**
             * 定制清单 展开或收起
             * @param isShow 是否要
             */
            customList(isShow = false) {
                this.customListShow = !this.customListShow
            },
            /**
             * 删除部位
             * @param delDecalId 删除印绣花的id
             */
            async partRemove (delDecalId) {
                // 删除印绣花
                ISCC.deleteDecal(delDecalId)

                // 删除数据 name
                this._partRemoveDataCommon(delDecalId)

                this.partShow = false

                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)

                this.$toast('删除成功~')
            },
            /**
             * footer前置事件，控制弹窗切换内容 还是 弹窗显示或隐藏
             */
            afterDetail (index = null, item) {
//                if (!UTILS.equals(JSON.stringify(this.oldData), JSON.stringify(this.newData))) {
//                    console.log('不一样~~~~~~')
//
//                    this.infoCloseClick()
//                }

                // 点击底部导航，调用对应的事件
                if (item) {
                    if (item.name === '主面料') {
                        this.footerFabric()
                    } else if (item.name === '印花') {
                        this.footerPrint()
                    } else if (item.name === '绣字') {
                        this.footerEmb()
                    } else if (item.name === '绣花') {
                        this.footerEmbPrint()
                    } else {    // 部件
                        this.footerPart(item.data)
                    }

                    this.isHeader = item.enName
                }
            },
            /**
             * 推荐设计 和 我的设计 切换
             * @param flag 1为推荐设计 2为我的设计
             * @param isFlash 是否可以刷新列表
             * @param isReturn false为触发去对比按钮：不改变选中左侧标题，不刷新数据
             */
            async designTitle (flag, isFlash = false, isReturn = true) {
                // 防止重复点击
                if (this.designTitleActive === flag && !isFlash) {
                    return
                }
                let dataList = ''
                if (flag == 1) {        // 推荐设计
                    let getSysRecommendDesign;
                    await Customization.getSysRecommendDesign({
                        busContsCode: this.busContsCode,
                        goodsCode: this.goodsCode,
                        pageSize: 0,
                        pageNum: 0
                    }).then((res) => {
                        getSysRecommendDesign = res;
                    });

                    // 最多显示8个设计
                    if (getSysRecommendDesign && getSysRecommendDesign.list !== null && getSysRecommendDesign.list.length >= 8) {
                        dataList = getSysRecommendDesign.list.slice(0,8)
                    } else {
                        dataList = getSysRecommendDesign.list
                    }

                    if (isReturn) {
                        this.designData = []
                        this.designDataEmpty = !this.designDataEmpty
                        this.designTitleActive = flag
                        this.designData = dataList

                        // 判断是否为空
                        if (getSysRecommendDesign.list === null ||
                            (getSysRecommendDesign.list != null && getSysRecommendDesign.list.length === 0 )) {
                            this.designDataEmpty = true
                        } else {
                            this.designDataEmpty = false
                        }
                    }
                } else if (flag == 2) { // 我的设计
                    let params = {
                        shopKey: this.shopKey,
                        partHdId: this.goodsId
                    }
                    let getDesign;
                    await Customization.getDesignFilter(params).then((res) => {
                        getDesign = res;
                    });

                    // 最多显示8个设计
                    if (getDesign && getDesign.length >= 8) {
                        dataList = getDesign.slice(0,8)
                    } else {
                        dataList = getDesign
                    }

                    if (isReturn) {
                        this.designData = []
                        this.designDataEmpty = !this.designDataEmpty
                        this.designTitleActive = flag
                        this.designData = dataList

                        // 判断是否为空
                        if (getDesign.length <= 0) {
                            this.designDataEmpty = true
                        } else {
                            this.designDataEmpty = false
                        }
                    }
                }

                return dataList
            },
            /**
             * 推荐设计判断是否缺少面料，并重新渲染模型
             */
            async designStock (item, index) {
                // 第二次点击
                if (this.designDataActive === index) {
                    return
                }

                this.designDataActive = index
                this.myDesignDataActive = -1     // 我的设计

                // 获取设计详情
                let getAllDesignDetail;
                await Customization.getAllDesignDetail({
                    designId: item.designId,
                    designType: 2               // 设计类型 2一定没有主面料编码 1才会有主面料编码
                }).then((res) => {
                    getAllDesignDetail = res;
                });

                if (!getAllDesignDetail.detailedList) {
                    this.$toast('该推荐设计不完整~')
                    return
                }

                // 判断库存
                let numData = await this._isDesignStock('', getAllDesignDetail)
                if (numData.isInvEnough === 0) {
                    item.isStock = true
                    this.designData = JSON.parse(JSON.stringify(this.designData))

                    let info = ''
                    numData.fabricList.forEach(item => {
                        info += item.fabricName + ';'
                    })
                    this.$toast(`部分面料库存不足~</br>${info}`)
                }

                ISCC.clearAll()

                this.newData.MainFabric = getAllDesignDetail.mainFabricCode
                this.newData.fabricId = getAllDesignDetail.mainFabricId
                this.newData.MainFabricUrl = getAllDesignDetail.mainFabricUrl
                this.newData.MainFabricName = getAllDesignDetail.mainFabricName

                getAllDesignDetail.detailedList.forEach((item, index) => {
//                    this.newData[item.regionCode].assemplyId = ''
                    this.newData[item.regionCode].isSpcRegion = 0
                    this.newData[item.regionCode].fabricCode = item.fabricCode
                    this.newData[item.regionCode].fabricId = item.fabricId
                    this.newData[item.regionCode].fabricName = item.fabricName
                    this.newData[item.regionCode].fileId = item.fileId
                    this.newData[item.regionCode].partCode = item.partCode
                    this.newData[item.regionCode].partId = item.partId
                    this.newData[item.regionCode].partName = item.partName
                    this.newData[item.regionCode].regionCode = item.regionCode
                    this.newData[item.regionCode].regionId = item.regionId
                    this.newData[item.regionCode].regionName = item.regionName
                    this.newData[item.regionCode].url = item.url

//                    this.newData[item.regionCode] = Object.assign({},item)
                })

                // 模型渲染
                await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, '', getAllDesignDetail)

                // 清空印绣花数据
                this.newData.partEmbData = []
                this.newData.partEmbPrintData = []
                this.newData.partPrintData = []

                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)

                // 设置主面料选中状态
                if (getAllDesignDetail.mainFabricId) {
                    this._fabricActive(getAllDesignDetail.mainFabricId)
                    this.setTabHeader();
                } else {
                    this.setTabHeader('partFirst');
                    this.partIndex = 0
                    this.footerPart(this.getRegionclassData[0])
                }
            },
            // 设置操作导航当前选中项
            setTabHeader(headType='fabric'){
                this.isHeader = headType;
            },
            /**
             * 判断库存
             * @param modelData modelLeftData左边模型数据  modelRightData右边模型数据
             * @return designData
             */
            async _isDesignStock (modelData = '', designData = '') {
                let currentData = this.newData
                let defaultDetailed = this.getDefaultDetailed

                if (modelData === 'modelLeftData' && !designData) {
                    defaultDetailed = ''
                    currentData = this[modelData]
                    defaultDetailed = this.getAllDesignDetailLeft
                } else if (modelData === 'modelRightData' && !designData) {
                    defaultDetailed = ''
                    currentData = this[modelData]
                    defaultDetailed = this.getAllDesignDetailRight
                }

                let data = {}
                data.detailedList = []
                if (designData) {   // 推荐设计、对比
                    data.mainFabricId = designData.mainFabricId
                    designData.detailedList.forEach((itm, index) => {
                        let currentRegionCode = currentData[itm.regionCode].regionCode
                        if (itm.regionCode === currentRegionCode) {
                            let obj = {}
                            obj.regionId = itm.regionId
                            obj.fabricId = itm.fabricId

                            data.detailedList.push(obj)
                        }
                    })

                } else {
                    data.mainFabricId = currentData.fabricId
                    defaultDetailed.detailedList.forEach((itm, index) => {
                        let currentRegionCode = currentData[itm.regionCode].regionCode
                        if (itm.regionCode === currentRegionCode) {
                            let obj = {}
                            obj.regionId = currentData[itm.regionCode].regionId
                            obj.fabricId = currentData[itm.regionCode].fabricId

                            data.detailedList.push(obj)
                        }
                    })
                }

                let regionIdsList = []
                let fabricIdsList = []
                data.detailedList.forEach((itm, index) => {
                    regionIdsList.push(itm.regionId)
                    fabricIdsList.push(itm.fabricId)
                })

                let params = {
                    // 商品id
                    ptiPartHdId: this.goodsId,
                    // 主面料id
                    fabricId: data.mainFabricId,
                    // 部件类别ids
                    gctRegionHdIds: regionIdsList,
                    // 面料ids
                    fabricIds: fabricIdsList,
                    // 数量
                    amount: 1,
                    // 定制：1
                    orderFlag: 1,
                    // 店铺id
                    shopDptId: this.shopKey,
                    companyId: this.companyId
                }
                console.log('判断库存===', JSON.stringify(params))
                // 判断库存
                let numData;
                await Customization.getPartFabricInventoryNew(params).then((res) => {
                    numData = res;
                });

                return numData
            },
            /**
             * 我的设计-选中
             */
            async myDesign (item, index, type = '') {
                // 第二次点击
//                if (this.myDesignDataActive === index) {
//                    return
//                }

                this.loading = true
                this.myDesignDataActive = index
                this.designDataActive = -1  // 推荐设计

                let designType = ''
                if (type) {
                    designType = type
                } else {
                    designType = 1
                }
                // 获取设计详情
                let getAllDesignDetail;
                await Customization.getAllDesignDetail({
                    designId: item.id,
                    designType: designType       // 设计类型 2一定没有主面料编码 1才会有主面料编码
                }).then((res) => {
                    getAllDesignDetail = res;
                });

                if (!getAllDesignDetail.detailedList) {
                    this.$toast('我的设计不完整~')
                    return
                }

                this.getDefaultDetailed = getAllDesignDetail

                this.newData.MainFabric = getAllDesignDetail.mainFabricCode
                this.newData.fabricId = getAllDesignDetail.fabricId ? getAllDesignDetail.fabricId : getAllDesignDetail.mainFabricId
                this.newData.MainFabricUrl = getAllDesignDetail.mainFabricUrl
                this.newData.MainFabricName = getAllDesignDetail.mainFabricName

                getAllDesignDetail.detailedList.forEach((item, index) => {
                    let isSpcRegion = 0
                    if (this.newData && this.newData[item.regionCode]) {
                        isSpcRegion = this.newData[item.regionCode].isSpcRegion || 0
                    }
                    item.isSpcRegion = isSpcRegion

                    this.newData[item.regionCode] = Object.assign({},item)
                })
                this.newData.partPrintData = []
                this.newData.partEmbData = []
                this.newData.partEmbPrintData = []

                // 判断库存
                let numData = await this._isDesignStock('', getAllDesignDetail)
                if (numData.isInvEnough === 0) {
                    item.isStock = true
                    this.designData = JSON.parse(JSON.stringify(this.designData))

                    let info = ''
                    numData.fabricList.forEach(item => {
                        info += item.fabricName + ';'
                    })
                    this.$toast(`部分面料库存不足~</br>${info}`)
                }

                ISCC.clearAll()

                // 模型渲染
                let result = await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, '', getAllDesignDetail)
                if (result == '0') {
                    await this._embCommon(getAllDesignDetail, '', '', true, true)

                    // 设置主面料选中状态
                    if (getAllDesignDetail.mainFabricId) {
                        this._fabricActive(getAllDesignDetail.mainFabricId)
                        this.setTabHeader();
                    } else {
//                    this.setTabHeader('partFirst');
//                    this.partIndex = 0
//                    this.footerPart(this.getRegionclassData[0])
                    }
                }
            },
            /**
             * 设置主面料选中状态
             * @param fabric 可传入主面料id、主面料code
             */
            _fabricActive (fabric) {
                if (fabric) {
                    for (let i=0;i<this.fabricData.length;i++){
                        if (this.fabricData[i].fabricId === fabric || this.fabricData[i].fabricCode === fabric) {
                            this.fabricDataActive = i
                            break
                        }
                    }
                }
            },
            /**
             * 通用：实现印绣花
             * @parma getAllDesignDetail 部件
             * @parma modelObj 克隆出来的对象
             * @parma cloneId 对比左右两边模型容器id
             * @parma embFlag 是否回显印绣花信息
             */
            async _embCommon (getAllDesignDetail, modelObj = '', cloneId = '', embFlag = false) {
                let obj = ''
                if (modelObj) {
                    obj = modelObj
                }

                let promise = new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        for (let i = 0; i < getAllDesignDetail.detailedList.length; i++) {
                            let item = getAllDesignDetail.detailedList[i]
                            // 印花
                            if (item.gsDttPrintVos && item.gsDttPrintVos.length > 0) {
                                for (let j = 0; j < item.gsDttPrintVos.length; j++) {
                                    let printItem = item.gsDttPrintVos[j]
                                    let imgUrl = getImg(printItem.embPrintPicUrl)
                                    let getPartEmbInfo = await ISCC.getPartEmbInfo(this, this.goodsCode, this.goodsId, item.regionCode, item.partCode, imgUrl, 3, '', getAllDesignDetail.mainFabricCode, printItem.rotate, obj)

                                    let arr = {}
                                    // 部位
                                    arr.regionCode = item.regionCode
                                    // 印花id
                                    arr.id = printItem.printId
                                    // 印花编码
                                    arr.embPrintCode = printItem.printCode
                                    // 旋转
                                    arr.rotate = printItem.rotate
                                    // 缩放
                                    arr.zoom = printItem.scale
                                    // x轴坐标
                                    arr.xcoordinate = printItem.xcoordinate
                                    // y轴坐标
                                    arr.ycoordinate = printItem.ycoordinate
                                    // 印花图id
                                    arr.pictKey = printItem.fileId
                                    arr.pictUrl = printItem.embPrintPicUrl
                                    arr.delDecalId = getPartEmbInfo.decalID

                                    // 首页模型
                                    if (!obj) {
                                        this.newData.partPrintData.push(arr)
                                    }

                                    // 对比模型
                                    if (cloneId && cloneId === 'modelLeft') {
                                        this.modelLeftData.partPrintData.push(arr)
                                    } else if (cloneId && cloneId === 'modelRight') {
                                        this.modelRightData.partPrintData.push(arr)
                                    }
                                }
                            }
                            // 绣字
                            if (item.gsDttEmbVos && item.gsDttEmbVos.length > 0) {
                                for (let j = 0; j < item.gsDttEmbVos.length; j++){
                                    let embItem = item.gsDttEmbVos[j]
                                    let textstr = '<font style="font-size:300px;color:' + embItem.colorNumberHx + ';font-family:'+ embItem.fontName +'">' + embItem.content + '</font>'
                                    let getPartEmbInfo = await ISCC.getPartEmbInfo(this, this.goodsCode, this.goodsId, item.regionCode, item.partCode, textstr, 1, '', getAllDesignDetail.mainFabricCode, embItem.rotate, obj)

                                    let arr = {}
                                    // 部位
                                    arr.regionCode = item.regionCode
                                    // 绣字内容
                                    arr.content = embItem.content
                                    // 颜色
                                    arr.color = embItem.colorNumberHx
                                    arr.colorCode = embItem.color
                                    arr.colorId = embItem.colorId
                                    // 字体
                                    arr.fontName = embItem.fontName
                                    arr.fontCode = embItem.font
                                    arr.fontId = embItem.fontsId
                                    // 旋转
                                    arr.rotate = embItem.rotate
                                    // 缩放
                                    arr.scale = embItem.zoom
                                    // x轴坐标
                                    arr.xcoordinate = embItem.xcoordinate
                                    // y轴坐标
                                    arr.ycoordinate = embItem.ycoordinate
                                    // 绣字图
                                    arr.embPictkey = await uploadImg(this, getPartEmbInfo.decalImgSrc)
                                    arr.delDecalId = getPartEmbInfo.decalID

                                    // 首页模型
                                    if (!obj) {
                                        this.newData.partEmbData.push(arr)
                                    }

                                    // 对比模型
                                    if (cloneId && cloneId === 'modelLeft') {
                                        this.modelLeftData.partEmbData.push(arr)
                                    } else if (cloneId && cloneId === 'modelRight') {
                                        this.modelRightData.partEmbData.push(arr)
                                    }

                                    // 回显绣字信息
                                    if (embFlag) {
                                        this._embActive()
                                    }
                                }
                            }
                            // 绣花
                            if (item.gsDttEmbptVos && item.gsDttEmbptVos.length > 0) {
                                for (let j = 0; j < item.gsDttEmbptVos.length; j++) {
                                    let embPrintItem = item.gsDttEmbptVos[j]
                                    let imgUrl = getImg(embPrintItem.embPrintPicUrl)
                                    let getPartEmbInfo = await ISCC.getPartEmbInfo(this, this.goodsCode, this.goodsId, item.regionCode, item.partCode, imgUrl, 2, '', getAllDesignDetail.mainFabricCode, embPrintItem.rotate, obj)

                                    let arr = {}
                                    // 部位
                                    arr.regionCode = item.regionCode
                                    // 绣花编码
                                    arr.embPrintCode = embPrintItem.embCode
                                    // 绣花对应的主键
//                                    arr.id = getPartEmbInfo.decalID
                                    arr.id = embPrintItem.embHdId
                                    // 旋转
                                    arr.rotate = embPrintItem.rotate
                                    // 缩放
                                    arr.zoom = embPrintItem.scale
                                    // x轴坐标
                                    arr.xcoordinate = embPrintItem.xcoordinate
                                    // y轴坐标
                                    arr.ycoordinate = embPrintItem.ycoordinate
                                    // 绣花图
                                    arr.pictKey = embPrintItem.fileId
                                    arr.pictUrl = embPrintItem.embPrintPicUrl
                                    arr.delDecalId = getPartEmbInfo.decalID

                                    // 首页模型
                                    if (!obj) {
                                        this.newData.partEmbPrintData.push(arr)
                                    }

                                    // 对比模型
                                    if (cloneId && cloneId === 'modelLeft') {
                                        this.modelLeftData.partEmbPrintData.push(arr)
                                    } else if (cloneId && cloneId === 'modelRight') {
                                        this.modelRightData.partEmbPrintData.push(arr)
                                    }
                                }
                            }

                            if (getAllDesignDetail.detailedList.length === (i+1) ) {
                                setTimeout(() => {
                                    resolve()
                                }, 500)
                            }
                        }
                    }, 1000)
                })

                return promise.then(async () => {
                    this.loading = false

                    if (embFlag) {
                        if (!getAllDesignDetail.mainFabricId) {
                            this.setTabHeader('partFirst');
                            this.partIndex = 0
                            this.footerPart(this.getRegionclassData[0])
                        }
                    }

                    // todo 需优化
                    setTimeout(async() => {
                        // 获取价格
                        if (!obj) {
                            this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
                        }

                        if (cloneId && cloneId === 'modelLeft') {
                            this.modelLeftPrice = await ISCC.getPrice(this, this.goodsCode, this.modelLeftData)
                        } else if (cloneId && cloneId === 'modelRight') {
                            this.modelRightPrice = await ISCC.getPrice(this, this.goodsCode, this.modelRightData)
                        }

                    }, 2000)
                })
            },
            /**
             * 我的设计-删除
             */
            async delMyDesign(item, index) {
                this.$confirm({
                    title: '',
                    message: '是否删除这条信息？',
                    btn: {
                        sure: '确定',
                        close: '否'
                    }
                }).then(async () => {
                    let params = {
                        designID: item.id,
                        companyId: this.companyId
                    }
                    await Customization.delDesign(params).then(async (res) => {
                        this.designData = await this.designTitle(2, true)
//                        this.myDesignDataActive.splice(index, 1)

                        this.$toast('删除成功~')

                        setTimeout(async () => {
                            // 删除当前选中的设计方案
                            if (this.myDesignDataActive === index) {
                                this.myDesignDataActive = -1

                                // 恢复初始化方案
                                await this.reset()
                            } else if (this.myDesignDataActive > index) {   // 删除当前方案前的设计方案
                                this.myDesignDataActive -= 1
                            }
                        }, 600)
                    });
                }).catch(() => {})
            },
            /**
             * 主面料
             * @param flag true页面第一次加载 false页面第二次调用
             */
            async footerFabric (flag = false) {
                if (!flag) {
                    // 当前已经是主面料，再展开无需请求
                    if (this.isHeader === 'fabric') {
                        return
                    }
                }
            },
            /**
             * 选中主面料
             */
            async fabricClick (item, index) {
                this.btnLock = true
                this.fabricDataActive = index
                this.fabricDataActiveItem = item
                this.newData.MainFabric = item.fabricCode
                this.newData.MainFabricName = item.fabricName
                this.newData.fabricId = item.fabricId
                this.newData.MainFabricUrl = item.fabricUrl
                this.newData.MainFabricName = item.fabricName

                // 主面料驱动
                let renderData = {}
                renderData.detailedList = []
                if (this.getgoodBase.driveMode === 1) {
                    // 多一层循环，如果当第一个部位就是特殊部位，需要用codes去请求接口，故需先遍历
                    let codes = ''
                    this.getDefaultDetailed.detailedList.forEach(async (itm, index) => {
                        codes += itm.partCode + ','
                    })

                    this.getDefaultDetailed.detailedList.forEach(async (itm, index) => {
                        let obj = {}
                        let regionCode = this.newData[itm.regionCode].regionCode
                        if (itm.regionCode === regionCode && itm.isSpcRegion !== 1) {   // 不是特殊部位
                            obj.fabricCode = this.newData[itm.regionCode].fabricCode = item.fabricCode
                            obj.fabricId = this.newData[itm.regionCode].fabricId = item.fabricId
                            obj.fabricName = this.newData[itm.regionCode].fabricName = item.fabricName
                            obj.url = this.newData[itm.regionCode].url = item.fabricUrl

                            obj.partCode = this.newData[itm.regionCode].partCode
                            obj.regionCode = regionCode

                            renderData.detailedList.push(obj)
                        } else {    // 特殊部位
//                            let params = {
//                                goodsCode: this.goodsCode,
//                                regionCode: itm.regionCode,
//                                dptId: this.shopKey,
//                                checkFlag: 1,       // 限定关系：0开启筛选 1关闭筛选
//                                mainFabricCode: this.newData.MainFabric,
//                                partCodes: codes.substring(0, codes.length - 1)
//                            }
//                            let partAndFabric;
//                            await Customization.getRegionPartFabric(params).then((res) => {
//                                partAndFabric = res;
//                            });
//
//                            let isSearch = false    // 切换主面料，查看特殊部位下是否有这款面料
//                            let partLen = partAndFabric.length
//                            // 部件
//                            for (let i = 0; i < partLen; i++) {
//                                if (partAndFabric[i].partCode === itm.partCode) {
//                                    let fabricListLen = partAndFabric[i].fabricList.length
//                                    // 面料
//                                    for (let k = 0; k < fabricListLen; k++) {
//                                        if (partAndFabric[i].fabricList[k].fabricCode === itm.fabricCode) {
//                                            isSearch = true
//                                            break
//                                        }
//                                    }
//                                }
//                            }
//
//                            if (isSearch) { // 特殊部位下有这款面料（用原来的面料，不替换）
//                                obj.fabricCode = this.newData[itm.regionCode].fabricCode
//                                obj.fabricId = this.newData[itm.regionCode].fabricId
//                                obj.fabricName = this.newData[itm.regionCode].fabricName
//                                obj.url = this.newData[itm.regionCode].url = itm.url
//                                obj.partCode = itm.partCode
//                                obj.regionCode = itm.regionCode
//                            } else {        // 特殊部位下没有这款面料，跟随主面料
//                                obj.fabricCode = this.newData[itm.regionCode].fabricCode = item.fabricCode
//                                obj.fabricId = this.newData[itm.regionCode].fabricId = item.fabricId
//                                obj.fabricName = this.newData[itm.regionCode].fabricName = item.fabricName
//                                obj.url = this.newData[itm.regionCode].url = item.fabricUrl
//                                obj.partCode = this.newData[itm.regionCode].partCode
//                                obj.regionCode = regionCode
//                            }

                            obj.fabricCode = this.newData[itm.regionCode].fabricCode
                            obj.fabricId = this.newData[itm.regionCode].fabricId
                            obj.fabricName = this.newData[itm.regionCode].fabricName
                            obj.url = this.newData[itm.regionCode].url
                            obj.partCode = this.newData[itm.regionCode].partCode
                            obj.regionCode = this.newData[itm.regionCode].regionCode

                            renderData.detailedList.push(obj)
                        }
                    })
                }

                let flag = await this._getRegionPartFabricCheck('', true, 0)
                if (!flag) {
                    // 模型渲染
                    await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, this.newData.MainFabric, renderData)
                }

                // 获取价格
                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
            },
            /**
             * 主面料关闭 or 确定
             * @param flag close为关闭，ok为确定
             */
            fabricCloseOrOk (flag) {
                this.infoSureClick()

                // 默认获取第一个部件-部位数组
                if (this.getRegionclassData.length > 0) {
                    this.footerPart(this.getRegionclassData[0])
                }
            },
            /**
             * 切换部件是否保存
             */
            partCloseOrOk (flag) {
//                this.infoSureClick()

                this.isHeader = 'partFirst'

                this.partIndex += 1
                let len = this.getRegionclassData.length
                for (let i = 0; i < len; i++) {
                    // 跳到下一个部件
                    if (this.partIndex === i) {
                        this.footerPart(this.getRegionclassData[i])
                        break
                    }

                    // 跳到对应的印绣花
                    if (this.partIndex === len) {
                        if (this.printData.length > 0) {
                            this.footerPrint()
                        } else if (this.embData.length > 0){
                            this.footerEmb()
                        } else if (this.embPrintData.length > 0){
                            this.footerEmbPrint()
                        }
                    }
                }
            },
            /**
             * 弹窗操作-关闭（不保存） 废弃
             * 把oldData赋值给newData
             * 撤销操作
             */
            async infoCloseClick () {
                if (this.isHeader === 'fabric') {               // 面料撤销
                    // 模型渲染
                    await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, this.oldData.MainFabric)

                    // 撤销主面料选中
                    this.newData.MainFabric = this.oldData.MainFabric
                    this.newData.MainFabricName = this.oldData.MainFabricName
                    this.newData.fabricId = this.oldData.fabricId
                    this.newData.MainFabricUrl = this.oldData.MainFabricUrl

                    // 主面料驱动
                    if (this.getgoodBase.driveMode === 1) {
                        this.getDefaultDetailed.detailedList.forEach((itm, index) => {
                            let regionCode = this.newData[itm.regionCode].regionCode
                            if (itm.regionCode === regionCode) {
//                            fabricCode
//                            fabricId
//                            fabricName
                                this.newData[itm.regionCode].url = this.oldData[itm.regionCode].url
                            }
                        })
                    }

                } else if (this.isHeader === 'partFirst') {     // 部件撤销（第一步）
                    ISCC.regionChange(this, this.goodsId, this.goodsCode, this.oldData, this.regionActionItem.regionCode, this.oldData[this.regionActionItem.regionCode].partCode, '',this.getDefaultDetailed, () => {})

                    this.newData[this.regionActionItem.regionCode].partCode = this.oldData[this.regionActionItem.regionCode].partCode
                    this.newData[this.regionActionItem.regionCode].partId = this.oldData[this.regionActionItem.regionCode].partId
                    this.newData[this.regionActionItem.regionCode].partName = this.oldData[this.regionActionItem.regionCode].partName
                    this.newData[this.regionActionItem.regionCode].url = this.oldData[this.regionActionItem.regionCode].url

                    // pc端要包含撤销主面料
                    this.newData[this.regionActionItem.regionCode].fabricCode = this.oldData[this.regionActionItem.regionCode].fabricCode
                    this.newData[this.regionActionItem.regionCode].fabricId = this.oldData[this.regionActionItem.regionCode].fabricId
                    this.newData[this.regionActionItem.regionCode].fabricName = this.oldData[this.regionActionItem.regionCode].fabricName

                } else if (this.isHeader === 'partSecond') {     // 部件撤销（第二步）   暂不与上面合并
                    ISCC.regionChange(this, this.goodsId, this.goodsCode, this.oldData, this.regionActionItem.regionCode, this.oldData[this.regionActionItem.regionCode].partCode, '',this.getDefaultDetailed, () => {})

                    this.newData[this.regionActionItem.regionCode].partCode = this.oldData[this.regionActionItem.regionCode].partCode
                    this.newData[this.regionActionItem.regionCode].partId = this.oldData[this.regionActionItem.regionCode].partId
                    this.newData[this.regionActionItem.regionCode].partName = this.oldData[this.regionActionItem.regionCode].partName
                    this.newData[this.regionActionItem.regionCode].url = this.oldData[this.regionActionItem.regionCode].url

                    this.newData[this.regionActionItem.regionCode].fabricCode = this.oldData[this.regionActionItem.regionCode].fabricCode
                    this.newData[this.regionActionItem.regionCode].fabricId = this.oldData[this.regionActionItem.regionCode].fabricId
                    this.newData[this.regionActionItem.regionCode].fabricName = this.oldData[this.regionActionItem.regionCode].fabricName

                } else if (this.isHeader === 'printSecond' || this.isHeader === 'printFirst') {        // 印花撤销
                    ISCC.deleteDecal(this.delPrintDecalID)
                    this.oldData.partPrintData = []
                    this.newData.partPrintData = []

                } else if (this.isHeader === 'embSecond' || this.isHeader === 'embFirst') {          // 绣字撤销
                    ISCC.deleteDecal(this.delEmbDecalID)
                    this.oldData.partEmbData = []
                    this.newData.partEmbData = []

                } else if (this.isHeader === 'embPrintSecond' || this.isHeader === 'embPrintFirst') {     // 绣花撤销
                    ISCC.deleteDecal(this.delEmbPrintDecalID)
                    this.oldData.partEmbPrintData = []
                    this.newData.partEmbPrintData = []

                }

                // 获取价格
                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)

//                this.detailShowOrHide()
            },
            /**
             * 弹窗操作-确定（保存） 废弃
             * 把newData赋值给oldData
             */
            async infoSureClick () {
                if (this.isHeader === 'fabric') {               // 面料
                    this.oldData.MainFabric = this.newData.MainFabric
                    this.oldData.MainFabricName = this.newData.MainFabricName
                    this.oldData.fabricId = this.newData.fabricId
                    this.oldData.MainFabricUrl = this.newData.MainFabricUrl

                    this.getDefaultDetailed.detailedList.forEach((item, index) => {
                        let regionCode = this.oldData[item.regionCode].regionCode
                        if (item.regionCode === regionCode) {
                            if (this.newData.MainFabric) {
                                this.oldData[regionCode].fabricCode = this.newData.MainFabric
                                this.oldData[regionCode].fabricId = this.newData.fabricId
                                this.oldData[regionCode].fabricName = this.newData[regionCode].fabricName
                                this.oldData[regionCode].url = this.newData.MainFabricUrl

                                this.newData[regionCode].fabricCode = this.newData.MainFabric
                                this.newData[regionCode].fabricId = this.newData.fabricId
                                this.newData[regionCode].url = this.newData.MainFabricUrl
                            }
                        }
                    })

                    this.isHeader = 'partFirst'

                } else if (this.isHeader === 'partFirst') {     // 部位（第一步）
                    this.oldData[this.regionActionItem.regionCode].partCode = this.newData[this.regionActionItem.regionCode].partCode
                    this.oldData[this.regionActionItem.regionCode].partId = this.newData[this.regionActionItem.regionCode].partId
                    this.oldData[this.regionActionItem.regionCode].partName = this.newData[this.regionActionItem.regionCode].partName

                    this.footerPart(this.getRegionclassData[this.footerActiveIndex++])

                } else if (this.isHeader === 'partSecond') {    // 部位（第二步）
                    this.oldData[this.regionActionItem.regionCode].partCode = this.newData[this.regionActionItem.regionCode].partCode
                    this.oldData[this.regionActionItem.regionCode].partId = this.newData[this.regionActionItem.regionCode].partId
                    this.oldData[this.regionActionItem.regionCode].partName = this.newData[this.regionActionItem.regionCode].partName

                    this.oldData[this.regionActionItem.regionCode].fabricCode = this.newData[this.regionActionItem.regionCode].fabricCode
                    this.oldData[this.regionActionItem.regionCode].fabricId = this.newData[this.regionActionItem.regionCode].fabricId
                    this.oldData[this.regionActionItem.regionCode].fabricName = this.newData[this.regionActionItem.regionCode].fabricName
                    this.oldData[this.regionActionItem.regionCode].url = this.newData[this.regionActionItem.regionCode].url

                    this.isHeader = 'partFirst'

                    this.partIndex += 1
                    let len = this.getRegionclassData.length
                    for (let i = 0; i < len; i++) {
                        // 跳到下一个部件
                        if (this.partIndex === i) {
                            this.footerPart(this.getRegionclassData[i])
                            break
                        }

                        // 跳到对应的印绣花
                        if (this.partIndex === len) {
                            if (this.printData.length > 0) {
                                this.footerPrint()
                            } else if (this.embData.length > 0){
                                this.footerEmb()
                            } else if (this.embPrintData.length > 0){
                                this.footerEmbPrint()
                            }
                        }
                    }

                } else if (this.isHeader === 'printSecond' || this.isHeader === 'printFirst') {     // 印花
                    this.oldData.partPrintData = this.newData.partPrintData

                    if (this.embData.length > 0){
                        this.footerEmb()
                    } else if (this.embPrintData.length > 0){
                        this.footerEmbPrint()
                    }

                } else if (this.isHeader === 'embSecond' || this.isHeader === 'embFirst') {     // 绣字
                    this.oldData.partEmbData = this.newData.partEmbData

                    if (this.embPrintData.length > 0){
                        this.footerEmbPrint()
                    }
                } else if (this.isHeader === 'embPrintSecond' || this.isHeader === 'embPrintFirst') {     // 绣花
                    this.oldData.partEmbPrintData = this.newData.partEmbPrintData

                    this.detailShowOrHide()
                }
            },
            /**
             * 切换部位才会触发
             *  限定关系（例如：换了前片，后片选项也跟着变化）
             *  @param partCode 部件名称
             *  @param fabricFlag
             *  @param initFlag 1首次进入，0非首次进入
             */
            async _getRegionPartFabricCheck (partCode = '', fabricFlag = false, initFlag = 0) {
                let flag = false    // 判断限定关系是否生效  false不生效 true生效
                if (partCode === '' || partCode === null) {
                    if (!this.driveRegionFlag && this.getRegionclassData[this.partIndex].isDriveRegion !== 1 && !fabricFlag) {
                        this.getPriceFlag = false
                        return
                    }
                }

                let partCodes = ''
                this.getDefaultDetailed.detailedList.forEach((itm, index) => {
                    let regionCode = this.newData[itm.regionCode].regionCode
                    if (itm.regionCode === regionCode) {
                        partCodes += this.newData[itm.regionCode].partCode + ','
                    }
                })

                // 获取需要替换的部件
                let params = {
                    goodsCode: this.goodsCode,
                    mainFabricCode: this.newData.MainFabric,                // 主面料编码
                    mainPartCode: this.regionPartActiveItem.partCode ? this.regionPartActiveItem.partCode : partCode,       // 选定的驱动部件编码
                    partCodes: partCodes.substring(0, partCodes.length-1),   // 部件参数列表
                    initFlag: initFlag
                }
                let getRegionPartFabricCheck;
                await Customization.getRegionPartFabricCheck(params).then((res) => {
                    getRegionPartFabricCheck = res;
                });

                if (getRegionPartFabricCheck.resetFlag === 1) {
                    // 重组数据，方便通用方法调用
                    let renderData = {
                        detailedList: []
                    }
                    let len = this.getDefaultDetailed.detailedList.length

                    if (getRegionPartFabricCheck.gctPartsVoList.length > 0) {
                        flag = true
                        this.getPriceFlag = true
                        getRegionPartFabricCheck.gctPartsVoList.forEach((item, index) => {

                            for (let i = 0; i < len; i++) {
                                let currentDetaileList = this.getDefaultDetailed.detailedList[i]
                                // 把需要切换的部位更换掉
                                if (currentDetaileList.regionCode === item.regionCode) {
                                    let obj = {}
                                    obj.partCode = this.newData[currentDetaileList.regionCode].partCode = item.partCode
                                    obj.partId = this.newData[currentDetaileList.regionCode].partId = item.partId
                                    obj.partName = this.newData[currentDetaileList.regionCode].partName = item.partName

                                    if (item.fabricId) {    // 如果有主面料信息，就用限定出来的；否则用原来默认部件里的面料
                                        obj.fabricCode = this.newData[currentDetaileList.regionCode].fabricCode = item.fabricCode
                                        obj.fabricId = this.newData[currentDetaileList.regionCode].fabricId = item.fabricId
                                        obj.fabricName = this.newData[currentDetaileList.regionCode].fabricName = item.fabricName
                                        obj.url = this.newData[currentDetaileList.regionCode].url = item.fabricUrl
                                    } else {
                                        obj.fabricCode = this.newData[currentDetaileList.regionCode].fabricCode
                                        obj.fabricId = this.newData[currentDetaileList.regionCode].fabricId
                                        obj.fabricName = this.newData[currentDetaileList.regionCode].fabricName
                                        obj.url = this.newData[currentDetaileList.regionCode].url
                                    }

                                    obj.regionCode = this.newData[currentDetaileList.regionCode].regionCode
                                    obj.regionId = this.newData[currentDetaileList.regionCode].regionId
                                    obj.regionName = this.newData[currentDetaileList.regionCode].regionName

                                    renderData.detailedList.push(obj)
                                }
                            }
                        })
                    } else {
                        this.getPriceFlag = false
                    }

                    // 添加其他部位（除限定出来的其他部位）
                    for (let i = 0; i < this.getDefaultDetailed.detailedList.length; i++) {
                        let item = this.getDefaultDetailed.detailedList[i]
                        for (let j = 0; j < renderData.detailedList.length; j++) {
                            if (item.regionCode === renderData.detailedList[j].regionCode) {
                                item.checkFlag = true
                            }
                        }
                    }
                    for (let i = 0; i < this.getDefaultDetailed.detailedList.length; i++) {
                        let item = this.getDefaultDetailed.detailedList[i]
                        if (!item.checkFlag) {
                            let obj = {}

                            obj.partCode = this.newData[item.regionCode].partCode
                            obj.partId = this.newData[item.regionCode].partId
                            obj.partName = this.newData[item.regionCode].partName

                            obj.fabricCode = this.newData[item.regionCode].fabricCode
                            obj.fabricId = this.newData[item.regionCode].fabricId
                            obj.fabricName = this.newData[item.regionCode].fabricName

                            obj.regionCode = this.newData[item.regionCode].regionCode
                            obj.regionId = this.newData[item.regionCode].regionId
                            obj.regionName = this.newData[item.regionCode].regionName

                            renderData.detailedList.push(obj)
                        }
                    }

                    // 模型渲染
                    let promise = new Promise(async (resolve, reject) => {
                        if (this.getgoodBase.driveMode === 0) {  // 非主面料驱动，要等待部件闪烁结束（2秒），才能改变模型
                            setTimeout(async () => {
                                let result = await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, '', renderData)
                                resolve(result)
                            }, 2010)
                        } else {    // 主面料驱动，不需要等待
                            let result = await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, '', renderData)
                            resolve(result)
                        }
                    })
                    promise.then((result) => {
                        if (result == '0') {
                            // todo 需优化
                            setTimeout(async() => {
                                // 获取价格
                                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)

                                setTimeout(() => {
                                    this.loading = false
                                }, 600)
                            }, 2000)
                        }
                    })
                } else {
                    this.getPriceFlag = false
                }

                return flag
            },
            /**
             * 切换部位才会触发
             *  袖型（数据是遍历出来的，有可能是前片、后片等等）
             * @param item 当前对象
             */
            async footerPart (item) {
                // 防止重复点击
//                if (this.regionActionItem.regionCode === item.regionCode) {
//                    return
//                }

                this._partFrameAndFlash(item.regionCode)


                if (item != undefined && item.isDriveRegion === 1) {
                    this.driveRegionFlag = true
                } else {
                    this.driveRegionFlag = false
                }

                // 修改导航-->部件里的data数据
                this.footerList.forEach((itm, index) => {
                    if (itm.name === '部件') {
                        this.footerList[index].data = item
                    }
                })

                this.regionActionItem = item
                this.isHeader = 'partFirst'
                this.getRegionPartFabric = []
                this.regionPartActive = null

                let partCodes = ''
                this.getDefaultDetailed.detailedList.forEach((itm, index) => {
                    let regionCode = this.newData[itm.regionCode].regionCode
                    if (itm.regionCode === regionCode) {
                        partCodes += this.newData[itm.regionCode].partCode + ','
                    }
                })

                let checkFlag = 0

//                    if ((主面料 && 指定的面料) || 非主面料 || 主限定部位) {
//                        限定关系生效
//                    }
                let driveRegionLen = this.driveRegionList.length
                for (let k = 0; k < driveRegionLen; k++) {
                    if (item.regionCode === this.driveRegionList[k].regionCode) {
                        if (this.driveRegionList[k].mainFlag === 1) {
                            checkFlag = 1
                        }
                    }
                }

                let fabricDataLen = this.fabricData.length
                for (let j = 0; j < fabricDataLen; j++) {
                    if ((this.getgoodBase.driveMode === 1 && this.fabricData[j].limitFlag === 1) ||
                        this.getgoodBase.driveMode !== 1) {
                        checkFlag = 1
                    }
                }

                // 获取定制商品可定制部件面料
                let params = {
                    goodsCode: this.goodsCode,
                    regionCode: item.regionCode,
                    dptId: this.shopKey,
                    checkFlag: 1,       // 限定关系：0开启筛选 1关闭筛选
                    mainFabricCode: this.newData.MainFabric,
                    partCodes: partCodes.substring(0, partCodes.length - 1)
                }
                await Customization.getRegionPartFabric(params).then((res) => {
                    this.getRegionPartFabric = res;
                });
            },
            /**
             * 帧跳转、部位闪烁
             */
            _partFrameAndFlash (regionCode) {
                let _this = this
                // 闪烁还没结束
                _this.shineFlag = false

//                _this.shineFlag = true

                // todo 帧跳转接口（接口未开发） 延期处理
//                let frameObjData = {
//                    distance: 154.7029702970296,
//                    scale: 1.360374141999807,
//                    angle: 0.3288229934450415
//                }
//                ISCC.frameChoose(frameObjData)

                // 部位闪烁
                ISCC.shineAssembly(regionCode, 2, null, function () {
                    // 闪烁结束
                    _this.shineFlag = true
                })
            },
            /**
             * 选中部件—第一步
             * @param item 当前要更换的部位
             * @param index 当前部位的索引值
             * @param flag 是否要重新替换第二步下的面料数据
             */
            async regionPartActiveClick (item, index, flag = true) {
                this.btnLock = true
                // 判断闪烁是否结束
                if (!this.shineFlag) {
                    this.btnLock = false
                    return
                }

                if (flag){
                    this.getRegionPartFabricTwoData = []
                    this.getRegionPartFabricTwoData = item.fabricList
                }
                this.regionPartActive = index
                this.regionPartActiveItem = item

                this.newData[this.regionActionItem.regionCode].partCode = item.partCode
                this.newData[this.regionActionItem.regionCode].partId = item.partId
                this.newData[this.regionActionItem.regionCode].partName = item.partName

                let isSpcRegionFlag = false
                let len = this.getDefaultDetailed.detailedList.length
                for (let i = 0; i < len; i++) {
                    if (this.regionActionItem.regionCode ===  this.getDefaultDetailed.detailedList[i].regionCode &&
                        this.getDefaultDetailed.detailedList[i].isSpcRegion === 1) {
                        isSpcRegionFlag = true
                        break
                    }
                }
                // 切换部件对应下的默认面料（特殊部位、非主面料驱动才会触发）
                if (!this.newData.MainFabric || isSpcRegionFlag) {
                    let len = item.fabricList.length
                    for (let i = 0; i < len; i++) {
                        if (item.fabricList[i].isDefaultFabric) {
                            this.newData[this.regionActionItem.regionCode].fabricCode = item.fabricList[i].fabricCode
                            this.newData[this.regionActionItem.regionCode].fabricId = item.fabricList[i].fabricId
                            this.newData[this.regionActionItem.regionCode].fabricName = item.fabricList[i].fabricName
                            this.newData[this.regionActionItem.regionCode].url = item.fabricList[i].fabricUrl

                            break
                        }
                    }
                }


                let isFlag = await this._getRegionPartFabricCheck('', false, 0)
                if (isFlag) {
                    return
                }

                let defaultDetailed = {
                    detailedList: [],
                    MainFabric: this.newData.MainFabric
                }
                this.getDefaultDetailed.detailedList.forEach((itm) => {
                    let obj = {}
                    obj.regionCode = this.newData[itm.regionCode].regionCode
                    obj.partCode = this.newData[itm.regionCode].partCode
                    obj.fabricCode = this.newData[itm.regionCode].fabricCode
                    defaultDetailed.detailedList.push(obj)
                })

                // 切换部位
                await ISCC.regionChange(this, this.goodsId, this.goodsCode, this.newData, this.regionActionItem.regionCode, this.newData[this.regionActionItem.regionCode].partCode, this.newData[this.regionActionItem.regionCode].fabricCode, defaultDetailed, () => {})

                // 获取价格
                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
            },
            /**
             * 选中部件—第二步
             */
            async regionPartTwoActiveClick (item, index) {
                this.btnLock = true
                this.regionPartTwoActive = index
                this.regionPartTwoActiveItem = item

                // 临时存储数据
                this.newData[this.regionActionItem.regionCode].fabricCode = item.fabricCode
                this.newData[this.regionActionItem.regionCode].fabricId = item.fabricId
                this.newData[this.regionActionItem.regionCode].fabricName = item.fabricName
                this.newData[this.regionActionItem.regionCode].url = item.fabricUrl

                this.newData = JSON.parse(JSON.stringify(this.newData))

                let defaultDetailed = {}
                defaultDetailed.detailedList = []
                defaultDetailed.MainFabric = this.newData.MainFabric
                this.getDefaultDetailed.detailedList.forEach((itm) => {
                    let obj = {}
                    obj.regionCode = this.newData[itm.regionCode].regionCode
                    obj.partCode = this.newData[itm.regionCode].partCode
                    obj.fabricCode = this.newData[itm.regionCode].fabricCode
                    defaultDetailed.detailedList.push(obj)
                })
                // 切换部位面料
                ISCC.regionChange(this, this.goodsId, this.goodsCode, this.newData, this.regionActionItem.regionCode, this.regionPartActiveItem.partCode, item.fabricCode, defaultDetailed, () => {})

                // 获取价格
                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
            },
            /**
             * 印花
             */
            footerPrint () {
                this.isHeader = 'printFirst'

                if (this.printData.length) {
                    this.printDataActive = 0
                    this.printDataActiveItem = this.printData[0]

                    // 部位闪烁
                    this._partFrameAndFlash(this.printData[0].regionCode)
                }
            },
            /**
             * 印花选择—第一步
             */
            printActiveClick (item, index) {
                this._moreTwo('partPrintData', item.regionCode)

                // 部位闪烁
                this._partFrameAndFlash(item.regionCode)

                this.printDataActive = index
                this.printDataActiveItem = item
            },
            /**
             * 印花—修改角度
             */
            changePrint() {
                console.log('即将打印2222=====》',)
                let _this = this

                setTimeout(() => {
                    if (_this.isEmbStartFlag) {
                        return
                    }

                    if (!_this.isEmbFlag) {
                        return
                    }
                    _this.isEmbFlag = true

                    // 删除上一次的印花
                    let id = _this._isPrintOrEmbOrEmbPrint(_this.printDataActiveItem.regionCode)
                    if (id) {
                        ISCC.deleteDecal(id)

                        // 过滤当前要修改的印花
                        let newPartPrintData = _this.newData.partPrintData.filter((item) => item.delDecalId !== id)
                        this.$set(_this.newData, 'partPrintData', newPartPrintData)
                    }

                    if (!!_this.officialItem && _this.officialItem.imageUrl) {
                        this._surePrintTwoCommon(_this.officialItem, _this.officialColActive, _this.printRotate)
                    }

                    setTimeout(() => {
                        _this.isEmbFlag = false
                    }, 1000)
                }, 300)
            },
            /**
             * 印花选择—第二步—官方图片
             * @param item 当前对象
             * @param index 每列的index
             */
            async printTwoActiveClick (item, index) {
                // 设置input失去焦点
                this.$refs.printRotate.blur()
                this.isEmbFlag = false

                this.isEmbStartFlag = true
                // 按钮锁
                if (this.btnLock === true || !this.shineFlag) {
                    this.isEmbStartFlag = false
                    return
                }
                this.btnLock = true

                let id = this._isPrintOrEmbOrEmbPrint(this.printDataActiveItem.regionCode)
                let rotate = this.printRotate

                if (id) {
                    ISCC.deleteDecal(id)

                    // 一个部位同时存在2个印绣花，删除上一个印绣花
                    await this._partRemoveDataCommon(id)

                    await this._surePrintTwoCommon(item, index, rotate)
                    this.btnLock = false
                } else {
                    await this._surePrintTwoCommon(item, index, rotate)
                    this.btnLock = false
                }

                this.isEmbStartFlag = false
            },
            /**
             * 确定印花—第二步—官方图片
             * @param item 当前对象
             * @param itemIndex 每列的index
             * @param dataIndex 每行的index
             */
            async _surePrintTwoCommon (item, index, rotate) {
                this.isEmbFlag = false
                this.officialItem = item
                this.officialColActive = index

                let imgUrl = await getImg(item.imageUrl)
                let getPartEmbInfo = await ISCC.getPartEmbInfo(this, this.goodsCode, this.goodsId, this.printDataActiveItem.regionCode, this.partCode, imgUrl, 3, '', this.newData.MainFabric, rotate)
                this.delPrintDecalID = getPartEmbInfo.decalID
                this.partPrintData = getPartEmbInfo
                this._printTwoCommonData(rotate)
            },
            /**
             * 印花-我的图片-打开file
             */
            uploadDailog () {
                // 用户未登录
                if (!this._gotoLogin('uploadPrint')) {
                    return
                }

                this.$refs.uploadImg.click()
            },
            /**
             * 印花-我的图片-上传图片
             */
            async uploadImg (e) {
                if (!dataVerify.isImg(e.srcElement.value)) {
                    this.$toast('请上传gif、jpg、jpeg、png图片~')
                    return
                }

                let photoId = await uploadImg(this, null, e)

                let params = {
                    photoId: photoId
                }
                await Customization.savePrintPhoto(params).then((res) => {
                    if (res) {
                        this.$toast('图片上传成功~')
                        this._getMyPrintAndOfficialList()
                    }
                }).catch(() => {
                    this.$toast('图片上传失败，请重试~')
                });
            },
            /**
             * 判断同个部位是否存在印绣花
             * @param regionCode 部位
             * @return id 返回印绣花id
             */
            _isPrintOrEmbOrEmbPrint (regionCode) {
                let id = ''

                if (this.newData.partPrintData && this.newData.partPrintData.length > 0) {
                    this.newData.partPrintData.forEach((item, index) => {
                        if (item.regionCode == regionCode) {
                            id = item.delDecalId
                        }
                    })
                }
                if (this.newData.partEmbData && this.newData.partEmbData.length > 0) {
                    this.newData.partEmbData.forEach((item, index) => {
                        if (item.regionCode == regionCode) {
                            id = item.delDecalId
                        }
                    })
                }
                if (this.newData.partEmbPrintData && this.newData.partEmbPrintData.length > 0) {
                    this.newData.partEmbPrintData.forEach((item, index) => {
                        if (item.regionCode == regionCode) {
                            id = item.delDecalId
                        }
                    })
                }

                return id
            },
            /**
             * 判断印绣花是否大于2
             * @param name partPrintData印花   partEmbData绣字   partEmbPrintData绣花
             * @param activeRegionCode 当前部位
             */
            _moreTwo (name, activeRegionCode) {
                let num = 0
                let flag = false    // 默认不可编辑

                // 当前部件是否可以编辑
                if (this.newData[name] && this.newData[name].length > 0) {
                    let len = this.newData[name].length
                    for (let i = 0; i < len; i++) {
                        if (activeRegionCode === this.newData[name][i].regionCode) {
                            flag = true
                            break
                        }
                    }
                }

                if (this.newData.partPrintData && this.newData.partPrintData.length > 0) {
                    num += this.newData.partPrintData.length
                }
                if (this.newData.partEmbData && this.newData.partEmbData.length > 0) {
                    num += this.newData.partEmbData.length
                }
                if (this.newData.partEmbPrintData && this.newData.partEmbPrintData.length > 0) {
                    num += this.newData.partEmbPrintData.length
                }

                if (num >= 1 && !flag) {
                    this.partShow = true
                }
            },
            /**
             * 通用：印花 把数据存放临时的newData
             *
             */
            async _printTwoCommonData (rotate) {
                let arr = {}

                // 对象不存在，则创建
                if (!this.newData.hasOwnProperty('partPrintData')) {
                    this.newData.partPrintData = []
                }
                // 部位
                arr.regionCode = this.printDataActiveItem.regionCode
                // 印花id
                arr.id = this.officialItem.id
                // 印花编码
                arr.embPrintCode = this.officialItem.embPrintCode
                // 旋转
                arr.rotate = rotate
                // 缩放
                arr.zoom = this.partPrintData.decalScale
                // x轴坐标
                arr.xcoordinate = this.partPrintData.UVPosition.x
                // y轴坐标
                arr.ycoordinate = this.partPrintData.UVPosition.y
                // 绣花图id
                arr.pictKey = this.officialItem.imageId
                arr.pictUrl = this.officialItem.imageUrl
                arr.delDecalId = this.delPrintDecalID

                this.newData.partPrintData.push(arr)

                // 获取价格
                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
            },
            /**
             * 印花、绣花、绣字选中部件
             * @param item 当前对象
             * @param index 索引
             */
            selectedCustomPart(item, index) {
                this.partDetailIndex = index
            },
            /**
             * 根据部件编码返回部件信息
             * @params
             */
            getPartItem(regionCode){
                let partList = this.getDefaultDetailed.detailedList;
                for(let i=0;i<partList.length;i++){
                    if(partList[i].regionCode === regionCode){
                        return partList[i];
                    }
                }
            },
            /**
             * 印花、绣花、绣字点击下一步
             */
            async firstRightNextClick () {
                let headerFlag = this.isHeader
                let partItem = {}// 部件信息
                if (headerFlag === 'printFirst') {              // 印花
                    if (this.printDataActive === null) {
                        this.$toast('请先选择印花部件')
                        return
                    }

                    this._moreTwo('partPrintData', this.printDataActiveItem.regionCode)
                    if (this.partShow) {
                        return
                    }

                    this._getMyPrintAndOfficialList()

                    this.isHeader = 'printSecond'

                    partItem = this.getPartItem(this.printData[this.printDataActive].regionCode);
                    // 初始化旋转角度
                    if(partItem && partItem.gsDttPrintVos && partItem.gsDttPrintVos.length){
                        this.printRotate = partItem.gsDttPrintVos[0].rotate
                    }else{
//                        this.printRotate = 0
                    }

                } else if (headerFlag === 'embPrintFirst') {    // 绣花
                    if (this.embPrintDataActive === null) {
                        this.$toast('请先选择绣花部件')
                        return
                    }

                    this._moreTwo('partEmbPrintData', this.embPrintDataActiveItem.regionCode)
                    if (this.partShow) {
                        return
                    }

                    // 获取部件对应的图片
                    this.embPrintNewArr = await this._getEmbPrintList(2, 0)

                    this.isHeader = 'embPrintSecond'

                    partItem = this.getPartItem(this.embPrintData[this.embPrintDataActive].regionCode);
                    // 初始化旋转角度
                    if(partItem && partItem.gsDttEmbptVos && partItem.gsDttEmbptVos.length){
                        this.embPrintRotate = partItem.gsDttEmbptVos[0].rotate
                    }else{
//                        this.embPrintRotate = 0
                    }

                } else if (headerFlag === 'embFirst') {         // 绣字
                    if (this.embDataActive === null) {
                        this.$toast('请先选择绣字部件')
                        return
                    }

                    this._moreTwo('partEmbData', this.embDataActiveItem.regionCode)
                    if (this.partShow) {
                        return
                    }

                    // 防止重复点击：已经获取过字体、颜色
                    if (this.getEmbFonts === '' || this.getEmbFonts === null) {
                        // 字体、颜色
                        await ISCC.getFont(this).then(res => {
                            this.getEmbFonts = res
                            this.color = this.getEmbFonts.colorList[0].colorNumberHx
//                            this.font = this.getEmbFonts.fontList[0].ictEmbFontsHdName

                            this.colorCode = this.getEmbFonts.colorList[0].ictEmbColorsHdCode
                            this.fontCode = this.getEmbFonts.fontList[0].ictEmbFontsHdCode
                            this.fontName = this.getEmbFonts.fontList[0].ictEmbFontsHdName

                            this.colorId = this.getEmbFonts.colorList[0].id
                            this.fontId = this.getEmbFonts.fontList[0].id
                        })
                    }

                    // 回显绣字信息
                    this._embActive()

                    this.isHeader = 'embSecond'
                } else {                                        // 部件
                    // 默认选中的部位，查询部件列表（部件对应的面料）
                    let len = this.getRegionPartFabric.length
                    for (let i=0;i<len;i++) {
                        let current = this.getRegionPartFabric[i]
                        if (current.partCode === this.newData[this.regionActionItem.regionCode].partCode) {
                            this.getRegionPartFabricTwoData = []
                            this.getRegionPartFabricTwoData = current.fabricList
                            await this.regionPartActiveClick(current, i, false)

                            if (current.fabricList.length === 1) {
                                this.partIndex += 1
                                let len = this.getRegionclassData.length

                                for (let i = 0; i < len; i++) {
                                    // 跳到下一个部件
                                    if (this.partIndex === i) {
                                        this.footerPart(this.getRegionclassData[i])
                                        break
                                    }

                                    // 跳到对应的印绣花
                                    if (this.partIndex === len) {
                                        if (this.printData.length > 0) {
                                            this.footerPrint()
                                        } else if (this.embData.length > 0){
                                            this.footerEmb()
                                        } else if (this.embPrintData.length > 0){
                                            this.footerEmbPrint()
                                        }
                                    }
                                }
                            } else {
                                this.isHeader = 'partSecond'
                            }

                            break
                        }
                    }
                }
            },
            /**
             *  回显绣字信息
             */
            _embActive () {
                // 字体默认选中
                if (this.newData.partEmbData.length > 0) {
                    for (let i=0;i<this.newData.partEmbData.length;i++) {
                        if (this.newData.partEmbData[i].regionCode === this.embDataActiveItem.regionCode) {
                            this.ebdText = this.newData.partEmbData[i].content

                            for (let j=0;j<this.getEmbFonts.fontList.length;j++){
                                if (this.getEmbFonts.fontList[j].id === this.newData.partEmbData[i].fontId) {
                                    this.fontName = this.newData.partEmbData[i].font
//                                    this.font = this.newData.partEmbData[i].font
                                    this.fontId = this.newData.partEmbData[i].fontId
                                    this.fontCode = this.newData.partEmbData[i].fontCode
                                    this.embFontActiveIndex = j

                                    break
                                }
                            }

                            for (let j=0;j<this.getEmbFonts.colorList.length;j++){
                                if (this.getEmbFonts.colorList[j].id === this.newData.partEmbData[i].colorId) {
                                    this.color = this.newData.partEmbData[i].color
                                    this.colorId = this.newData.partEmbData[i].colorId
                                    this.colorCode = this.newData.partEmbData[i].colorCode
                                    this.embColorActiveIndex = j
                                    break
                                }
                            }

                            break
                        }
                    }
                } else {
                    this.ebdText = ''
                    this.fontName = this.getEmbFonts.fontList[0].ictEmbFontsHdName
                    this.embFontActiveIndex = 0
                    this.embColorActiveIndex = 0
                }
            },
            /**
             * 设置印绣花选中状态
             * @param embList 数组，例如this.newData.partEmbPrintData是绣花数组
             * @param currentRegionCode 当前选中部位，例如this.embPrintDataActiveItem.regionCode
             * @param activeIndex 当前的索引值，例如this.embPrintColActive
             * @param dataList
             */
            _setIndex (embList, currentRegionCode, activeIndex, dataList = '') {
                let isIndexFlag = false
                if (embList.length > 0) {
                    for (let i=0;i<embList.length;i++) {
                        if (currentRegionCode === embList[i].regionCode) {
                            for (let j=0;j<dataList.length;j++) {
                                if (dataList[j].absoluteImageUrl === embList[i].pictUrl) {
                                    isIndexFlag = true
                                    this[activeIndex] = j

                                    // 印花
                                    if (activeIndex === 'officialColActive' && embList[i].rotate) {
                                        this.printRotate = embList[i].rotate
                                    }
                                    // 绣花
                                    if (activeIndex === 'embPrintColActive' && embList[i].rotate) {
                                        this.embPrintRotate = embList[i].rotate
                                    }

                                    break
                                }
                            }
                        }
                    }
                } else {
                    // 印花
                    if (activeIndex === 'officialColActive') {
                        this.printRotate = 0
                    }
                    // 绣花
                    if (activeIndex === 'embPrintColActive') {
                        this.embPrintRotate = 0
                    }
                }

                if (!isIndexFlag) {
                    this[activeIndex] = -1
                }
            },
            /**
             * 上一步
             * @param flag 返回的是哪一步
             */
            async secondLeftPreviousClick (flag) {
                if (flag === 'partFirst') {             // 部件

                } else if (flag === 'printFirst') {     // 印花
                    this.officialColActive = null
                    this.officialColIndexActive = null
                    this._delPreviousDataCommon(this.delPrintDecalID, this.newData.partPrintData)

                    // 获取价格
                    this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
                } else if (flag === 'embFirst') {       // 绣字

                } else if (flag === 'embPrintFirst') {  // 绣花
                    this.embPrintColActive = null
                    this.embPrintColIndexActive = null
                    this._delPreviousDataCommon(this.delEmbPrintDecalID, this.newData.partEmbPrintData)

                    // 获取价格
                    this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
                }
                this.isHeader = flag
            },
            /**
             * 印绣花-返回上一步-删除上一步操作
             * @param delId 删除印绣花id
             * @param currentData 要删除的当前对象
             * @private
             */
            _delPreviousDataCommon (delId, currentData) {
                ISCC.deleteDecal(delId)
                let len = currentData.length
                for (let i=0;i<len;i++) {
                    if (currentData[i].delDecalId === delId) {
                        currentData.splice(i, 1)
                        break
                    }
                }
            },
            /**
             * 同时获取绣花、印花图片
             */
            async _getMyPrintAndOfficialList () {
                let arr = []
                // 我的图片
                let myPrintNewArr = await this._getEmbPrintList(3, 1)
                if (myPrintNewArr && myPrintNewArr.length > 0) {
                    myPrintNewArr.forEach((item, index) => {
                        arr.push(Object.assign(item, {isMyPrint: true}))
                    })
                }

                // 官方图片
                let printNewArr = await this._getEmbPrintList(3, 0)
                if (printNewArr && printNewArr.length > 0) {
                    printNewArr.forEach((item, index) => {
                        arr.push(item)
                    })
                }

                this.printNewArr = arr

                // 设置印绣花选中状态
                this._setIndex(this.newData.partPrintData,
                    this.printDataActiveItem.regionCode,
                    'officialColActive', this.printNewArr)
            },
            /**
             * 获取绣花、印花图片
             * @param type 2. 绣花  3.印花
             * @param definedFlag 0为不支持用户上传图片，1为支持用户上传图片
             */
            async _getEmbPrintList (type, definedFlag) {
                let regionCode = ''
                if (this.isHeader === 'printFirst' || this.isHeader === 'printSecond') {
                    regionCode = this.printDataActiveItem.regionCode
                } else if (this.isHeader === 'embPrintFirst') {
                    regionCode = this.embPrintDataActiveItem.regionCode
                }

                let getEmbPrintList;
                await Customization.getEmbPrintList({
                    goodsCode: this.goodsCode,
                    regionCode: regionCode,
                    type: type,
                    definedFlag: definedFlag,
                    pageSize: 0 // 非必传
                }).then((res) => {
                    getEmbPrintList = res;
                });

                // 设置印绣花选中状态
                this._setIndex(this.newData.partEmbPrintData,
                    this.embPrintDataActiveItem.regionCode,
                    'embPrintColActive',
                    getEmbPrintList)

                return getEmbPrintList
            },
            /**
             * 确定-印花
             */
            printSureClick () {
                this.infoSureClick()
            },
            /**
             * 绣字
             */
            footerEmb () {
                this.isHeader = 'embFirst'

                if (this.embData.length) {
                    this.embDataActive = 0
                    this.embDataActiveItem = this.embData[0]

                    // 部位闪烁
                    this._partFrameAndFlash(this.embData[0].regionCode)
                }
            },
            /**
             * 绣字选择
             */
            embActiveClick (item, index) {
                this._moreTwo('partEmbData', item.regionCode)

                // 部位闪烁
                this._partFrameAndFlash(item.regionCode)

                this.embDataActive = index
                this.embDataActiveItem = item
            },
            /**
             * 绣字
             */
            async embSureClick() {
                if (!this.ebdText || this.ebdText.trim() === '' || this.ebdText.trim() === null) {
                    this.$toast('请输入绣字内容')
                    return
                }

                // 判断闪烁是否结束
                if (!this.shineFlag) {
                    return
                }

                this.loading = true

                let id = this._isPrintOrEmbOrEmbPrint(this.embDataActiveItem.regionCode)

                if (id) {
                    ISCC.deleteDecal(id)

                    // 一个部位同时存在2个印绣花，删除上一个印绣花
                    this._partRemoveDataCommon(id)

                    this._sureEmbCommon()
                } else {
                    this._sureEmbCommon()
                }
            },
            /**
             * 通用：确定绣字
             */
            async _sureEmbCommon() {
                let arr = {}
                this.textstr = '<font style="font-size:300px;color:' + this.color + ';font-family:' + this.font + '">' + this.ebdText + '</font>'
                let getPartEmbInfo = await ISCC.getPartEmbInfo(this, this.goodsCode, this.goodsId, this.embDataActiveItem.regionCode, this.partCode, this.textstr, 1, '', this.newData.MainFabric)
                this.delEmbDecalID = getPartEmbInfo.decalID
                this.partEmbData = getPartEmbInfo

                // 对象不存在，则创建
                if (!this.newData.hasOwnProperty('partEmbData')) {
                    this.newData.partEmbData = []
                }
                // 部位
                arr.regionCode = this.embDataActiveItem.regionCode
                // 绣字内容
                arr.content = this.ebdText
                // 颜色
                arr.color = this.color
                arr.colorCode = this.colorCode
                arr.colorId = this.colorId
                // 字体
                arr.fontName = this.fontName
                arr.fontCode = this.fontCode
                arr.fontId = this.fontId
                // 旋转
                arr.rotate = this.partEmbData.UVRotation
                // 缩放
                arr.scale = this.partEmbData.decalScale
                // x轴坐标
                arr.xcoordinate = this.partEmbData.UVPosition.x
                // y轴坐标
                arr.ycoordinate = this.partEmbData.UVPosition.y
                // 绣字图
                arr.embPictkey = await uploadImg(this, this.partEmbData.decalImgSrc)
                arr.delDecalId = this.delEmbDecalID

                this.newData.partEmbData.push(arr)

                // 获取价格
                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)

//                this.infoSureClick()

                this.loading = false
            },
            /**
             * 删除部位数据
             * @param name partPrintData印花   partEmbData绣字   partEmbPrintData绣花
             * @param delDecalId 删除印绣花的id
             */
            _partRemoveDataCommon (delDecalId) {
                let arrList = ['partEmbData', 'partEmbPrintData', 'partPrintData']

                let len = arrList.length
                for (let i = 0; i < len; i++) {
                    let name = arrList[i]
                    if (this.newData[name] && this.newData[name].length > 0) {
                        for (let i = 0; i < this.newData[name].length; i++) {
                            if (this.newData[name][i].delDecalId == delDecalId) {
                                this.newData[name].splice(i, 1)
                                break
                            }
                        }
                    }
                }
            },
            /**
             * 绣字字体选中
             */
            embFontActive (item, index) {
                this.embFontActiveIndex = index

//                this.font = item.ictEmbFontsHdName
                this.fontId = item.id
                this.fontName = item.ictEmbFontsHdName
                this.fontCode = item.ictEmbFontsHdCode
            },
            /**
             * 绣字颜色选中
             */
            embColorActive (item, index) {
                this.embColorActiveIndex = index

                this.color = item.colorNumberHx
                this.colorCode = item.ictEmbColorsHdCode
                this.colorId = item.id
            },
            /**
             * 绣花
             */
            footerEmbPrint () {
                this.isHeader = 'embPrintFirst'

                if (this.embPrintData.length) {
                    this.embPrintDataActive = 0
                    this.embPrintDataActiveItem = this.embPrintData[0]

                    // 部位闪烁
                    this._partFrameAndFlash(this.embPrintData[0].regionCode)
                }
            },
            /**
             * 绣花选择—第一步
             */
            embPrintActiveClick (item, index) {
                this._moreTwo('partEmbPrintData', item.regionCode)

                // 部位闪烁
                this._partFrameAndFlash(item.regionCode)

                this.embPrintDataActive = index
                this.embPrintDataActiveItem = item
            },
            /**
             * 绣花—修改角度
             */
            changeEmbPrint() {
                let _this = this

                setTimeout(() => {
                    if (_this.isEmbStartFlag) {
                        return
                    }

                    if (!_this.isEmbFlag) {
                        return
                    }
                    _this.isEmbFlag = true

                    // 删除上一次的印花
                    let id = _this._isPrintOrEmbOrEmbPrint(_this.embPrintDataActiveItem.regionCode)
                    if (id) {
                        ISCC.deleteDecal(id)

                        // 过滤当前要修改的印花
                        let newPartPrintData = _this.newData.partEmbPrintData.filter((item) => item.delDecalId !== id)
                        _this.$set(_this.newData, 'partEmbPrintData', newPartPrintData)
                    }

                    if (!!_this.embPrintItem && _this.embPrintItem.imageUrl) {
                        _this._sureEmbPrintCommon(_this.embPrintItem, _this.embPrintColActive, _this.embPrintRotate)
                    }

                    setTimeout(() => {
                        _this.isEmbFlag = false
                    }, 1000)
                }, 300)
            },
            /**
             * 绣花选择—第二步
             */
            async embPrintTwoActiveClick (item, index) {
                // 设置input失去焦点
                this.$refs.embPrintRotate.blur()
                this.isEmbFlag = false

                this.isEmbStartFlag = true

                // 按钮锁
                if (this.btnLock === true || !this.shineFlag) {
                    this.isEmbStartFlag = false
                    return
                }
                this.btnLock = true

                let id = this._isPrintOrEmbOrEmbPrint(this.embPrintDataActiveItem.regionCode)
                let rotate = this.embPrintRotate

                if (id) {
                    ISCC.deleteDecal(id)

                    // 一个部位同时存在2个印绣花，删除上一个印绣花
                    await this._partRemoveDataCommon(id)

                    await this._sureEmbPrintCommon(item, index, rotate)
                    this.btnLock = false
                } else {
                    await this._sureEmbPrintCommon(item, index, rotate)
                    this.btnLock = false
                }

                this.isEmbStartFlag = false
            },
            async _sureEmbPrintCommon (item, index, rotate) {
                let arr = {}
                this.embPrintItem = item
                this.embPrintColActive = index

                let imgUrl = await getImg(item.imageUrl)
                let getPartEmbInfo = await ISCC.getPartEmbInfo(this, this.goodsCode, this.goodsId, this.embPrintDataActiveItem.regionCode, this.partCode, imgUrl, 2, '', this.newData.MainFabric, rotate)
                this.delEmbPrintDecalID = getPartEmbInfo.decalID
                this.partEmbPrintData = getPartEmbInfo

                // 对象不存在，则创建
                if (!this.newData.hasOwnProperty('partEmbPrintData')) {
                    this.newData.partEmbPrintData = []
                }
                // 把数据存放临时的newData
//                this.newData.partEmbPrintData = []
                // 部位
                arr.regionCode = this.embPrintDataActiveItem.regionCode
                // 绣花编码
                arr.embPrintCode = this.embPrintItem.embPrintCode
                // 绣花对应的主键
                arr.id = this.embPrintItem.id
                // 旋转
//                arr.rotate = this.partEmbPrintData.UVRotation
                arr.rotate = rotate
                // 缩放
                arr.zoom = this.partEmbPrintData.decalScale
                // x轴坐标
                arr.xcoordinate = this.partEmbPrintData.UVPosition.x
                // y轴坐标
                arr.ycoordinate = this.partEmbPrintData.UVPosition.y
                // 绣花图
                arr.pictKey = this.embPrintItem.imageId
                arr.pictUrl = this.embPrintItem.imageUrl
                arr.delDecalId = this.delEmbPrintDecalID

                this.newData.partEmbPrintData.push(arr)

                // 获取价格
                this.price = await ISCC.getPrice(this, this.goodsCode, this.newData)
            },
            /**
             * 绣花确定
             */
            embPrintSureClick () {
                this.infoSureClick()
            },
            /**
             * 去对比
             */
            async showComparePop() {
                // 模型解绑
                if (this.modelLeftObj && this.modelRightObj) {
                    ISCC.bindingCouple([this.modelLeftObj, this.modelRightObj], 0)
                }

                // 清空左右两边模型
                if (this.modelLeftObj) {
                    await ISCC.clearAll(this.modelLeftObj)
                    await ISCC.dispose(this.modelLeftObj)
                    this.modelLeftPrice = 0
                }
                if (this.modelRightObj) {
                    await ISCC.clearAll(this.modelRightObj)
                    await ISCC.dispose(this.modelRightObj)
                    this.modelRightPrice = 0
                }

                // 我的设计
                let getDesign = await this.designTitle('2', true, false)
                // 推荐设计
                let getSysRecommendDesign = await this.designTitle('1', true, false)

                let dataList = []
                if (getDesign.length > 0) {
                    getDesign.forEach((item, index) => {
                        let obj = {}
                        obj.designId = item.id
                        obj.url = item.ptiPartHdDtoList[0].designUrl
                        obj.urlId = item.ptiPartHdDtoList[0].designId
                        obj.isSystem = 1
                        obj.modelLeftActive = false
                        obj.modelRightActive = false

                        dataList.push(obj)
                    })
                }
                if (getSysRecommendDesign && getSysRecommendDesign.length > 0) {
                    getSysRecommendDesign.forEach((item, index) => {
                        let obj = {}
                        obj.designId = item.designId
                        obj.url = item.designUrl
                        obj.urlId = item.picFileId
                        obj.isSystem = 2
                        obj.modelLeftActive = false
                        obj.modelRightActive = false

                        dataList.push(obj)
                    })
                }

                // 判断是否可以对比
                if (dataList && dataList.length < 2) {
                    this.$toast('请至少保存两套方案进行对比~')
                    return
                }

//                if (this.constrastList !== '') {
//                    this.constrastList.forEach((item, index) => {
//                        dataList.forEach((dataItem, dataIndex) => {
//                            if (item.designCode === dataItem.designCode) {
//                                if (item.modelLeftActive) {
//                                    dataItem.modelLeftActive = true
//                                }
//                                if (item.modelRightActive) {
//                                    dataItem.modelRightActive = true
//                                }
//                            }
//                        })
//                    })
//                }

                this.constrastList = dataList

                this.showContrastFlag = !this.showContrastFlag

                // 默认选中第一个方案
                await this.contrastReplace(this.constrastList[0], '', 'modelLeft', true)
//                this.constrastList[0].modelLeftActive = true

                this.initXScroll()
            },
            // 重新获取我的设计和推荐设计
            async getMyAndSystemDesign() {
                // 我的设计
                let getDesign = await this.designTitle('2', true, false)
                // 推荐设计
                let getSysRecommendDesign = await this.designTitle('1', true, false)

                let dataList = []
                if (getDesign.length > 0) {
                    getDesign.forEach((item, index) => {
                        let obj = {}
                        obj.designId = item.id
                        obj.url = item.ptiPartHdDtoList[0].designUrl
                        obj.urlId = item.ptiPartHdDtoList[0].designId
                        obj.isSystem = 1
                        obj.modelLeftActive = false
                        obj.modelRightActive = false

                        dataList.push(obj)
                    })
                }
                if (getSysRecommendDesign && getSysRecommendDesign.length > 0) {
                    getSysRecommendDesign.forEach((item, index) => {
                        let obj = {}
                        obj.designId = item.designId
                        obj.url = item.designUrl
                        obj.urlId = item.picFileId
                        obj.isSystem = 2
                        obj.modelLeftActive = false
                        obj.modelRightActive = false

                        dataList.push(obj)
                    })
                }

                // 判断是否可以对比
                if (dataList && dataList.length < 2) {
                    this.$toast('请至少保存两套方案进行对比~')
                    return
                }

                this.constrastList = dataList
            },
            /**
             * 去对比：弹窗
             * @param item 当前对象
             * @param index 索引
             */
            async selectedContrast(item, index) {
//                // 反选：清空模型
//                if (item.modelLeftActive){
//                    this.contrastIndex = -1
//                    item.modelLeftActive = false
//                    await ISCC.clearAll(this.modelLeftObj)
//                    return
//                } else if (item.modelRightActive) {
//                    this.contrastIndex = -1
//                    item.modelRightActive = false
//                    await ISCC.clearAll(this.modelRightObj)
//                    return
//                }

                this.contrastIndex = index
            },
            /**
             * 去对比：点击替换左边、替换右边事件
             * @param item 当前对象
             * @param index 索引
             * @param leftOrRight modelLeft替换左边 modelRight替换右边
             */
            async contrastReplace (item, index, leftOrRight, defaultFirst = false) {
                if (this.btnLock) {
                    return
                }
                this.btnLock = true

                let modelObj = ''       // 克隆出来的对象

                // 获取设计详情
                let getAllDesignDetail = await this.$get('customization/getAllDesignDetail', {
                    designId: item.designId,
                    designType: item.isSystem       // 设计类型 2一定没有主面料编码 1才会有主面料编码
                })

                if (!getAllDesignDetail.detailedList) {
                    this.$toast('该推荐设计不完整~')
                    this.btnLock = false
                    return
                }

                if (leftOrRight === 'modelLeft') {
                    let numData = await this._isDesignStock('modelLeftData', getAllDesignDetail)
                    if (numData.isInvEnough === 0) {
                        let info = ''
                        numData.fabricList.forEach(itm => {
                            info += itm.fabricName + ';'
                        })
                        this.$toast(`部分面料库存不足~</br>${info}`)
                        this.btnLock = false
                        return
                    }

                    await this._contrastPart(getAllDesignDetail, 'modelLeftData')

                    // 默认选中对比第一个
                    if (defaultFirst) {
                        this.constrastList[0].modelLeftActive = true
                    }

                    this._activeAndIsModel(item, 'modelLeftActive', this.modelLeftObj)
                    this.modelLeftObj = modelObj = await ISCC.clone(leftOrRight)
                } else {
                    let numData = await this._isDesignStock('modelRightData', getAllDesignDetail)
                    if (numData.isInvEnough === 0) {
                        let info = ''
                        numData.fabricList.forEach(itm => {
                            info += itm.fabricName + ';'
                        })
                        this.$toast(`部分面料库存不足~</br>${info}`)
                        this.btnLock = false
                        return
                    }
                    this._contrastPart(getAllDesignDetail, 'modelRightData')

                    await this._activeAndIsModel(item, 'modelRightActive', this.modelRightObj)
                    this.modelRightObj = modelObj = await ISCC.clone(leftOrRight)
                }


                await this._contrastReplaceCommon(modelObj, leftOrRight, getAllDesignDetail)
                this.btnLock = false
            },
            /**
             * 通用设置选中状态、模型解绑、删除画布
             * @param item 当前对象
             * @param activeName modelLeftActive左边模型选中  modelRightActive右边模型选中
             * @param modelObj 模型克隆出来的对象
             */
            _activeAndIsModel (item, activeName, modelObj) {
                this.constrastList.forEach((itm, itmIndex) => {
                    itm[activeName] = false
                })
                item[activeName] = true

                // 判断左侧、右侧模型是否存在
                let left = document.getElementById('modelLeft').getElementsByTagName('canvas')
                let right = document.getElementById('modelRight').getElementsByTagName('canvas')

                if (left.length > 0 && right.length > 0) {
                    ISCC.bindingCouple([this.modelLeftObj, this.modelRightObj], 0)
                    ISCC.dispose(modelObj)
                }

                if (activeName === 'modelLeftActive') {
                    if (left.length > 0) {
                        ISCC.dispose(modelObj)
                    }
                } else if (activeName === 'modelRightActive') {
                    if (right.length > 0) {
                        ISCC.dispose(modelObj)
                    }
                }

                this.contrastIndex = -1
            },
            /**
             * 去对比：点击替换左边、替换右边通用方法
             * @param modelObj 克隆出来的对象
             * @param cloneId HTML容器id
             * @param getAllDesignDetail 克隆出来的部件信息
             */
            async _contrastReplaceCommon (modelObj, cloneId, getAllDesignDetail) {
                // 部件数据存储
                if (cloneId && cloneId === 'modelLeft') {
                    this._contrastPart(getAllDesignDetail, 'modelLeftData')
                } else if (cloneId && cloneId === 'modelRight') {
                    this._contrastPart(getAllDesignDetail, 'modelRightData')
                }

                // 模型渲染
                let result = await ISCC.Fabric3d(this, this.goodsCode, this.goodsId, '', getAllDesignDetail, modelObj)

                if (result == '0') {
                    await this._embCommon(getAllDesignDetail, modelObj, cloneId, false)
                    this.isTwoCanvas()
                }
            },
            /**
             * 部件数据存储
             * @param getAllDesignDetail 模型部件  modelLeftData左边模型数据  modelRightData右边模型数据
             * @param obj 要存放的变量
             */
            async _contrastPart (getAllDesignDetail, obj) {
                if (obj === 'modelLeftData') {
                    this.getAllDesignDetailLeft = getAllDesignDetail
                } else if (obj === 'modelRightData') {
                    this.getAllDesignDetailRight = getAllDesignDetail
                }

                this[obj] = {}
                this[obj].MainFabric = getAllDesignDetail.mainFabricCode
                this[obj].fabricId = getAllDesignDetail.fabricId
                this[obj].MainFabricUrl = getAllDesignDetail.mainFabricUrl
                this[obj].MainFabricName = getAllDesignDetail.mainFabricName

                getAllDesignDetail.detailedList.forEach((item, index) => {
                    this[obj][item.regionCode] = Object.assign({},item)
                    this[obj].partPrintData = []
                    this[obj].partEmbData = []
                    this[obj].partEmbPrintData = []
                })
            },
            /**
             * 对模型进行绑定
             */
            isTwoCanvas () {
                let count = 0
                let left = document.getElementById('modelLeft').getElementsByTagName('canvas')
                let right = document.getElementById('modelRight').getElementsByTagName('canvas')

                if (left.length === 1) {
                    count++
                }
                if (right.length === 1) {
                    count++
                }

                if (count === 2) {  // 绑定
                    ISCC.bindingCouple([this.modelLeftObj, this.modelRightObj], 1)
                }
//                else if (count !== 1 && this.modelLeftObj && this.modelRightObj) {            // 解绑
//                    ISCC.bindingCouple([this.modelLeftObj, this.modelRightObj], 0)
//                }
            },
            /**
             * 对比：重新定制
             * @param modelData  modelLeftData左边模型数据  modelRightData右边模型数据
             */
            async reCustomize (modelData) {
                if (Object.keys(this[modelData]).length === 0) {
                    this.$toast('请选择模型，再操作~')
                    return
                }

                let modelObj = ''
                let active = ''
                let currentActiveObj = ''
                if (modelData === 'modelLeftData') {
                    modelObj = this.modelLeftObj
                    active = 'modelLeftActive'
                } else if (modelData === 'modelRightData') {
                    modelObj = this.modelRightObj
                    active = 'modelRightActive'
                }

                let len = this.constrastList.length
                for (let i=0;i<len;i++) {
                    if (this.constrastList[i][active]) {
                        currentActiveObj = this.constrastList[i]
                        break
                    }
                }

                // isSystem 我的设计1 推荐设计2
                // designTitleActive 我的设计2 推荐设计1
                let findFlag = false
                if (currentActiveObj.isSystem === 1) {          // 我的设计
                    if (this.designTitleActive != 2) {
                        await this.designTitle('2')
                    }
                } else if (currentActiveObj.isSystem === 2) {   // 推荐设计
                    if (this.designTitleActive != 1) {
                        await this.designTitle('1')
                    }
                }

                let designDataLen = this.designData.length
                for (let i=0;i<designDataLen;i++) {
                    if ((!!this.designData[i].designCode&&currentActiveObj.designCode === this.designData[i].designCode)
                        || currentActiveObj.designId === (this.designData[i].designId || this.designData[i].id) ) {
                        if (currentActiveObj.isSystem === 1) {          // 我的设计
                            this.designDataActive = null
                            await this.myDesign(this.designData[i], i)
                        } else if (currentActiveObj.isSystem === 2) {   // 推荐设计
                            this.myDesignDataActive = null
                            await this.designStock(this.designData[i], i)
                        }

                        findFlag = true
                        break
                    }
                }

                this.showContrastFlag = !this.showContrastFlag
            },
            /**
             * 对比：加入购物车
             * @param modelData  modelLeftData左边模型数据  modelRightData右边模型数据
             */
            addCartContrast (modelData) {
                let addCart = '';
                if (modelData === 'modelLeftData') {
                    addCart = 'addCartModelLeft';
                } else if (modelData === 'modelRightData') {
                    addCart = 'addCartModelRight'
                }

                // 用户未登录
                if (!this._gotoLogin(addCart)) {
                    return
                }

                if (Object.keys(this[modelData]).length === 0) {
                    this.$toast('请选择模型，再操作~')
                    return
                }

                let modelObj = ''
                if (modelData === 'modelLeftData') {
                    modelObj = this.modelLeftObj
                } else if (modelData === 'modelRightData') {
                    modelObj = this.modelRightObj
                }

                this.addCart(modelData, modelObj)
            },
            /**
             * 横向滚动
             */
            initXScroll() {
                let scrollParamsX = {
                    scrollbar: {
                        fade: false,
                        interactive: false // 1.8.0 新增
                    },
                    mouseWheel: {
                        speed: 20,
                        invert: false,
                        easeTime: 300
                    },
                    preventDefault: true,
                    startX: 0,
                    click: true,
                    scrollX: true,
                    scrollY: false,
                }
                this.$nextTick(() => {
                    let contrastWidth = $getChildrenWidth(this.$refs.xScrollUl, 16)
                    this.$refs.xScrollUl.style.width = contrastWidth + 'px'
                    let scrollContrast = new BScroll(this.$refs.xScroll, scrollParamsX)//对比商品列表
                })
            },
            /**
             * better-scroll初始化
             */
            _initScroll () {
                let scrollParams = {
                    scrollY: true,
                    click: true,
                    probeType: 2,
                    scrollbar: {
                        fade: true,
                        interactive: false // 1.8.0 新增
                    },
                    mouseWheel: {
                        speed: 20,
                        invert: false,
                        easeTime: 300
                    }
                }
                let scrollLeft = new BScroll('.option-swrap', scrollParams)
                let scrollFabric = new BScroll('.fabric-cont', scrollParams)//面料
                let scrollPart = new BScroll('.part-cont', scrollParams)//部件
                let scrollPartFabric = new BScroll('.part-fabric-container', scrollParams)//部件下面料列表
                let scrollCustom = new BScroll('.custom-cont', scrollParams)//印花、绣花、绣字列表
                let scrollCustomPrint = new BScroll('.pic-container', scrollParams)//印花图片列表
                let scrollCustomEmbroider = new BScroll('#embroider-pic-container', scrollParams)//绣花图片列表
                let scrollFont = new BScroll('.font-container', scrollParams)//字体列表
            },
            /**
             * 捕获鼠标点击UV值
             */
            async getUVMSG () {
                let currentRegionCode = this.getRegionclassData[this.partIndex].regionCode
                if (!currentRegionCode) {
                    this.$toast('请先选择部件')
                    return
                }

                let position = await ISCC.getUVMSG(currentRegionCode)

                console.log('X:' + position.x + ',Y:' + position.y)
                this.$toast('X:' + position.x + ',Y:' + position.y)
            },

            /**
             * 获取当前帧状态参数
             */
            getFrames () {
                let frames = ISCC.frameStatue()

                console.log('distance:' + frames.distance + ',scale:' + frames.scale + ',angle:' + frames.angle)
                this.$toast('distance:' + frames.distance + ',scale:' + frames.scale + ',angle:' + frames.angle)
            },

            /**
             * 弹窗组件：确定回调
             */
            sureBtn() {
                console.log('点击了确定~')
            },
            /**
             * 弹窗组件：取消回调
             */
            closeBtn() {
                console.log('点击了取消~')
            },
            // 是否上下架判断
            async getIsShelves() {
                // let params = {
                //     ownCompanyId: this.companyId,
                //     goodsCode: this.goodsCode,
                //     buscontsCode: this.busContsCode,
                // };
                // // 判断定制商品是否上下架
                // Customization.isShelves(params).then((res) => {
                //     this.sellFlag = res.sellFlag;
                //     if (res.sellFlag !== 1) {
                //         this.$toast("抱歉，该商品已下架");
                //     }
                // })
                let list = [];
                let map = {};
                map.goodsCode = this.goodsCode;
                map.busContsCode = this.busContsCode;
                map.companyId = this.companyId;
                list.push(map);
                let data = {
                    spPartGoodsSearchDtoList: list
                };
                await Customization.getSellStateValue(data).then((res) => {
                    this.sellFlag = res[0].sellFlag
                    if (res[0].sellFlag === 0) {
                        this.$toast("抱歉，该商品已下架");
                    }
                });
            },
            // 获取商品详情判断是否收藏
            async getIsCollect() {
                if (Storage.get("USER_INFO") && Storage.get("USER_INFO").usrId) {
                    let params = {
                        busContsCode: this.busContsCode,
                        goodsCode: this.goodsCode,
                        shopCode: Storage.get("properties").shopCode,
                        userId: Storage.get("USER_INFO").usrId
                    };
                    await Customization.getGoodsInfo(params).then((res) => {
                        this.collectionFlag = res.collectionFlag;
                        this.rtlCollectionDtId = res.rtlCollectionDtId;
                        this.salePrice = res.salePrice;
                        this.tagPrice = res.tagPrice;
                    });
                }
            },
            // 加入或取消收藏
            addOrCancelCollection(operate) {
                // 用户未登录
                if (!this._gotoLogin('addCollect')) {
                    return
                }

                if (this.sellFlag === 0) {
                    this.$toast("该商品已下架~")
                    return
                }

                // 加入收藏
                if (operate === 'add') {
                    let data = {
                        busContsCode: this.busContsCode,
                        goodsCode: this.goodsCode,
                        shopId: Storage.get("USER_INFO").shopId,
                        vipInfoHdId: Storage.get('USER_INFO').vipInfoId,
                        salePrice: this.salePrice,
                        tagPrice: this.tagPrice,
                        goodName: this.$route.query.goodsName
                    };
                    Customization.addCollection(data).then((res) => {
                        if (res === 1) {
                            this.$toast("加入收藏成功~");
                            // 刷新收藏状态
                            this.getIsCollect();
                        }
                    });
                }
                // 取消收藏
                if (operate === 'cancel') {
                    let data = {
                        goodCodeStr: this.goodsCode,
                        ids: this.rtlCollectionDtId,
                        vipInfoHdId: Storage.get('USER_INFO').vipInfoId
                    };
                    Customization.deleteCollection(data).then((res) => {
                        if (res === 1) {
                            this.$toast('已取消收藏~');
                            // 刷新收藏状态
                            this.getIsCollect();
                        }
                    });
                }
            }
        },
        computed: {

        },
        watch: {
            'isEmbFlag': function () {
                if (!this.isEmbFlag) {
                    if (this.event === 'addCart') {
                        this.addCart()
                    } else if (this.event === '_nowBuySure') {
                        this._nowBuySure()
                    } else if (this.event === 'myDesignClick') {
                        this.myDesignClick()
                    }
                }
            }
        }
    }
</script>
<style scoped lang="scss" type="text/scss">
    @import '../../assets/scss/goods/web-design';
</style>
