/**
 *
 * @description: 后台接口调用（已废弃，请移步controller/customization.js）
 * @author: yating.sun
 * @createTime: 2018/6/11 13:31
 * @version: 1.0.0.0
 * @history:
 *    1、
 *    2、
 *
 */
const axios = require('axios')
//  获取常数值
const fileSystemObj = require('../util/file-system')
const TokenManager = require('../util/token-manager')
const uuid = require('node-uuid')

// 上传图片
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

class customization {
    // ----- jodoll BEGIN -----

    // 商品基本信息 SP_GOODS_GETBASEINFO 志樑
    static async getgoodBase (ctx, next) {
        if (!ctx.params.usrId) {
            ctx.params.usrId = '0'
        }

        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/base-info', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 平台运营分类列表 SP_GOODS_GETPLATFORMLIST 杨杰
    static async getPlatFormList (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.issBas + '/cms-busconcla-hds', ctx.params)
        ctx.body = result.data
    }

    // 获取定制商品列表 SP_GOODS_GETCUSTOMGOODSLIST 扬辉
    static async getCustomGoodsList (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/gs-getcustomergoodslists', ctx.params)
        ctx.body = result.data
    }

    // 获取风格选择列表 SP_GOODS_GETPROPLIST 杨杰
    static async getPropList (ctx, next) {
        let obj = {
            // 上级附加属性编码
            code: 'FENGGE'
        }
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/prop-hds/part-goods/'+ obj.code, ctx.params)
        ctx.body = result.data
    }

    // 获取商品面料列表 SP_GOODS_GETMAINFABRIC 刘志梁
    static async getMainFabricList (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/main-fbc', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 初始定制清单（默认的部件面料） SP_GOODS_GETDEFAULTDETAILED 刘扬辉
    static async getDefaultDetailed (ctx, next) {
        // let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/link-cfg-dts/gct-default-detail/part-code', ctx.params)
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/link-cfg-dts/gct-default-detail/part-codeV2', ctx.params, ctx.headers)
        // let result = await ctx.$get('http://1.1.6.154:8802/link-cfg-dts/gct-default-detail/part-codeV2', ctx.params)
        ctx.body = result.data
    }

    // 获取可定制部位 SP_GOODS_GETREGIONCLASS 季兆宇
    static async getRegionclass (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/part-dt-regions/get-region-class/' + ctx.params.goodsCode, ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 获取绣花印花图片列表 SP_GOODS_GETPARTEMBPRINTLIST 刘志梁
    static async getEmbPrintList (ctx, next) {
        if (!ctx.params.usrId) {
            ctx.params.usrId = '0'
        }

        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/part-emb-prints', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 获取部件面料3d渲染 SP_GOODS_GETPARTFABRICRENDER 刘志梁
    static async getPartFabricRender (ctx, next) {
        // 防止IE浏览器缓存问题，无实际用处
        ctx.params.uuid = uuid.v1()

        // v3接口
        // let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-collects/part-fabric-render-v3',  ctx.params)

        // 志樑本地
        // let result = await ctx.$get('http://1.1.6.187:8806/sp-collects/part-fabric-render-v3', ctx.params)
        // 文杰本地
        // let result = await ctx.$get('http://1.1.6.41:8810/m-3d-glb-ordattr-hds/find-model-info-web', ctx.params)

        // v4版本
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m-3d-glb-ordattr-hds/find-model-info-web', ctx.params, ctx.headers)

        ctx.body = result.data
    }

    // 获取场景数据列表 SP_GOODS_GETSCENE_V2 王超鸿
    static async getScene (ctx, next) {
        // v2接口
        // let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m3d-w3d-org-dtts/scene-v2', ctx.params)

        // v3接口
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m3d-w3d-org-dtts/scene-v3', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 获取部位部件绣字/花信息 SP_GOODS_GETPARTEMBINFO 刘志梁
    static async getPartEmbInfo(ctx,next){
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/part-emb-info', ctx.params)
        ctx.body = result.data
    }

    // 获取定制商品联动商品列表（套西） SP_GOODS_GETGOODSLINKAGE 刘志梁
    static async getGoodsLinkage(ctx,next){
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/region-link-age', ctx.params)
        ctx.body = result.data
    }

    // （套西）联动商品详情 SP_MAS_GETGOODSINFO 扬辉
    static async getGoodsInfo (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-part-goodss', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 获取系统绣字字体和颜色 SP_GOODS_GETEMBFONTSCOLORS 杨杰
    static async getEmbFonts (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/ict-emb-hds-aggregate/fonnts-and-colors', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 价格 SP_GOODS_GETDETAILPRICE 刘志梁
    static async getPrice (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/detail-price', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 保存-暂存设计 SP_GOODS_SAVESPECIALPERSONALDESIGN 庄金毅
    static async saveDesign (ctx, next) {
        let result
        let url = '/rtl-design-hds?usrId=' + ctx.params.usrId + '&companyId=' + ctx.params.companyId

        // 套西需要加入batch（批量保存）
        if (ctx.params.goodsList.length > 1) {
            url += '&batch=true'
            result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers)
        } else {
            result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params.goodsList, ctx.headers)
        }

        ctx.body = result
    }

    /**
     * 获取-暂存设计（获取该用户所有的暂存设计） SP_GOODS_GETSPECIALPERSONALDESIGN 扬辉
     * let params = {
            shopKey: '门店id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getDesign (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/rtl-design-hds/designs', ctx.params)
        ctx.body = result.data
    }

    /**
     * 获取-暂存设计（获取该商品下的暂存设计）  明强
     * let params = {
            shopKey: '门店id',
            partHdId: '商品id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getDesignFilter (ctx, next) {
        if (!ctx.params.usrId) {
            ctx.params.usrId = '0'
        }

        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/rtl-design-hds/designs-part', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 删除-暂存设计 SP_GOODS_DELETEPERSONALDESIGN 刘扬辉
    static async delDesign (ctx, next) {
        let url = '/rtl-design-hds/' + ctx.params.designID
        let result = await ctx.$delete(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers)
        ctx.body = result
    }

    // 获取会员属性 SP_CTM_GETVIPCUSTOMS 刘志梁
    static async getVipCustoms (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-ctms/vip-customs', ctx.params)
        ctx.body = result.data
    }

    // 乔顿远程量体（特殊处理）
    static async remoteVolume (ctx, next) {
        await axios.post('http://zhipinapi.idz.net/api/size', ctx.params).then((res) => {
            ctx.body = res.data
        })
    }

    // 修改会员属性 SP_CTM_SAVEVIPCUSTOMS 刘志梁
    static async updateVip (ctx, next) {
        let url = '/sp-ctms/vip-customs?usrId=' + ctx.params.usrId + '&companyId=' + ctx.params.companyId
        let result = await ctx.$put(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params)
        ctx.body = result
    }

    // 保存会员推荐尺码 SP_CTM_SAVERECOMMENDSIZE 刘志梁
    static async saveVolume (ctx, next) {
        let url = '/sp-ctms/recommend-size?usrId=' + ctx.params.usrId + '&companyId=' + ctx.params.companyId + '&ownCompanyId=' + ctx.params.companyId
        let result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params)
        ctx.body = result
    }

    // 获取会员推荐尺码 SP_CTM_GETRECOMMENDSIZE 刘志梁
    static async getVolume (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-ctms/recommend-size', ctx.params)
        ctx.body = result.data
    }

    // 保存更新结算 SP_SALE_SAVECARTTEMP
    static async saveCartTemp (ctx, next) {
        let url = '/sp-sales/cart-temp?companyId=' + ctx.params.companyId + '&usrId=' + ctx.params.usrId
        let result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers)
        ctx.body = result
    }

    /**
     *  计算促销结果（保存更新结算完后必须调用）
     *  let calculateData = {
            ordId: '订单结算表id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async onlineCalculate (ctx, next) {
        let url = '/online-calculate/' + ctx.params.ordId + '?companyId=' + ctx.params.companyId + '&usrId=' + ctx.params.usrId
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.promotion + url, ctx.params, ctx.headers)
        ctx.body = {
            status: 200
        }
    }

    // 获取图片资源
    static async getImgByPath(ctx){
        let result = await fileSystemObj.getImgByPath(ctx)
        ctx.body = result.data
    }

    // 获取系统推荐设计 SP_GOODS_GETSYSRECOMEMDDESIGN 金毅
    static async getSysRecommendDesign (ctx, next) {
        if (!ctx.params.usrId) {
            ctx.params.usrId = '0'
        }

        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/recommend-design', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 获取绣字绣花区域列表 SP_GOODS_GETDECALAREABYPARTCODE 刘志梁
    static async getDecalaReabyPartCode (ctx, next) {
        // 如果没有用户信息，默认0（接口不改，只能前端改）
        if (!ctx.params.usrId) {
            ctx.params.usrId = '0'
        }

        // v1接口
        // let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/decal-area', ctx.params)

        // v2接口
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m-3d-glb-modelass-dt-prts/decal-area-v2', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    // 获取设计详情 SP_GOODS_GETALLDESIGNDETAIL 刘扬辉
    static async getAllDesignDetail (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/gs-designs', ctx.params, ctx.headers)
        // let result = await ctx.$get('http://1.1.6.188:8806/gs-designs', ctx.params)
        ctx.body = result.data
    }

    // 图片上传
    static async uploadImg(ctx, next) {
        console.log('图片上传ctx', ctx)
        let result
        let companyId = ctx.params.companyId
        let usrId = ctx.params.usrId
        let url = global.axiosBaseUrl + '/file/oss/image/mam/test3?companyId=' + companyId
        let imgPath = ctx.request.files.file.path
        let imgName = ctx.request.files.file.name
        // 获取token
        let token = await TokenManager.getToken()

        // 创建可读流
        let reader = fs.createReadStream(imgPath)

        let index = imgName.indexOf('.')
        let imgPrefix = imgName.substring(0, index)                 // 图片前缀
        let imgSuffix = imgName.substring(index, imgName.length)    // 图片后缀
        let imgNameNew = 'IMG_' + uuid.v1().replace(/\-/g,'') + imgSuffix   // 生成新图片名称（UUID）

        let filePath = path.join(__dirname, '../../public/uploads/') + `/${imgNameNew}`
        // 创建可写流
        let upStream = fs.createWriteStream(filePath)
        // 可读流通过管道写入可写流（上传图片到node）
        let stream = reader.pipe(upStream)

        // 上传图片到java
        let promise = new Promise((resolve,reject)=>{
            // 图片写入本地结束
            stream.on('finish', async function () {
                // 读取上传到项目中的图片
                let file = await fs.createReadStream(path.resolve(__dirname, '../../public/uploads/' + imgNameNew))
                let form = new FormData()
                form.append('file', file)

                let getHeaders = (async form => {
                    return await new Promise((resolve, reject) => {
                        form.getLength((err, length) => {
                            if (err) {
                                reject(err)
                            }

                            let headers = Object.assign({'Content-Length': length}, form.getHeaders())
                            resolve(headers)
                        })
                    })
                })

                let option = {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'ownCompanyId': companyId,
                        'Content-Type': 'multipart/form-data'
                    }
                }

                let headers = await getHeaders(form)
                // let imgUploadData = await axios.post(url, form, {
                //     headers: Object.assign(headers, option.headers)
                // })
                form.ownCompanyId = companyId
                let imgUploadData = await ctx.$postUpload(url, form, {
                    headers: Object.assign(headers, option.headers)
                })

                resolve(imgUploadData)
            })
        })

        // 上传到java成功回调
        result = await promise.then(async (res) => {
            console.log('res', res)
            let data = res
            let imgId = ''


            if (data.success) {
                // 删除上传的图片
                fs.unlink(path.resolve(__dirname, '../../public/uploads/' + imgNameNew), function (err) {
                    if (err) {
                        throw err
                    }
                })

                // 图片路径保存到中间表,返回中间表id
                let fileUrl = data.uploadDetail.successDetail.filePath
                let index = fileUrl.lastIndexOf('/')
                let fileNameSource = fileUrl.substring(index + 1, fileUrl.length)
                let fileNameUpload = fileUrl.substring(0, index)
                let url = '/glb-file-hds/save-all'

                let params = {
                    companyId: companyId,
                    usrId: usrId,
                    fileUrl: fileUrl,// 文件路径
                    fileNameSource: fileNameSource,// 文件源名称，用户上传时的源文件名
                    fileNameUpload: fileNameUpload// 文件存储名称
                }

                // let option = {
                //     headers: {
                //         'Authorization': 'Bearer ' + token,
                //         'ownCompanyId': companyId
                //     }
                // }
                imgId = await ctx.$postUrl(ctx.baseUrl + ctx.serverPortUrl.system + url, params, ctx.headers)

                console.log('imgId', imgId)
            }

            return imgId
        })

        ctx.body = result.data
    }

    // ----- jodoll END -----

    // ----- hansir BEGIN -----
    /**
     * 获取衣柜列表
     * var params = {
     *  code: '组合商品编码'
     * }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getCabinetList(ctx, next) {
        let url = '/pti-combgood-dtt-prds/combgood-forcers'
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + url, ctx.params)
        ctx.body = result.data
    }

    /**
     * 查询商品详情（单件商品详情）
     * let params = {
            goodsId: '商品id'
        }
     * @param ctx
     * @param params
     * @returns {Promise.<void>}
     */
    static async goodsSingleDetail(ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-part-goods-descs', ctx.params)
        ctx.body = result.data
    }

    /**
     * 商品详情（查看整套定制商品）
     * let params = {
        comgoodsCode: '组合商品编码',
        buscontsCode: '业务触点'
      }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async goodsCombDetail(ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-combgood-descs', ctx.params)
        ctx.body = result.data
    }

    /**
     * 获取购物车列表
     * let params = {
     *      goodsList: [{"goodsDetailPriceDtoList":[{"regionCode":"部位code","partCode":"部件code","fabricCode":"部位主面料code","isEmb":0,"isEmbPrint":0,"isPrint":0}],"mainFabricCode":"商品主面料","goodsCode":"商品货号"}],
            busContsCode: '业务触点'
     * }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getShoppingList(ctx, next) {
        let url = '/sp-goods/goods-price-list?busContsCode=' + ctx.params.busContsCode + '&usrId=' + ctx.params.usrId + '&companyId=' + ctx.params.companyId
        let result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers)
        ctx.body = result
    }

    /**
     * 获取订单结算页信息
     * let params = {
            ctmUsrId: '用户id',
            cookieId: 'cookieId',
            rtlCartTempHdId: '订单结算中间表id',
            busContsCode: '业务触点',
            shopCode: '店铺code'
        }
     * @param ctx
     * @param params
     * @returns {Promise.<Promise.<TResult>|*>}
     */
    static async getOrderSettlementValue(ctx, next) {
        let url = '/sp-sales/cart-temp'
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params)
        ctx.body = result.data
    }

    /**
     * 结算页面优惠金额
     *  let data = {
            rtlOrdInterHdId: '订单结算中间表id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getOrderDiscountValue (ctx, next) {
        let result = await ctx.$postUrl(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/rtl-online-result-hds/preferential-amount', ctx.params)
        ctx.body = result
    }

    /**
     * 获取商城url
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getProperties(ctx, next) {
        let data = fs.readFileSync(path.join(__dirname, '..') + '/properties/constant.json', 'utf8')
        let constData = JSON.parse(data)

        let properties = constData.prod
        if (ctx.baseUrl.indexOf('dev') != -1 || ctx.baseUrl.indexOf('test') != -1) {
            properties = constData.dev
        }

        ctx.body = properties
    }

    /**
     * 通过业务触点code 换取 业务触点id
     * let params = {
            code: '业务触点code'
       }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getBusContskey(ctx, next) {
        let url = '/dict-ids/code/' + ctx.params.code
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.system + url, ctx.params)
        ctx.body = result.data
    }

    /**
     * 判断商品是否上架
     * let params = {
            partHdIds: '商品id（以逗号隔开）',
            buscontskey: '业务触点id'
       }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getGoodsIsStock(ctx, next) {
        let url = '/sp-part-goodss/goods/' + ctx.params.partHdIds + '?companyId=' + ctx.params.companyId + '&buscontskey=' + ctx.params.buscontskey
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params)
        ctx.body = result.data
    }

    /**
     * 获取人台
     *  let params = {
            avatarCode: '人台编码'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getPeopleModelRender(ctx, next) {
        let url = '/m-3d-w-3d-avatar-hds/find-avatar-data'
        let result = await ctx.$postUrl(ctx.baseUrl + ctx.serverPortUrl.material + url, ctx.params)
        ctx.body = result
    }

    // ----- hansir END -----

    // ----- 移动端、PC端标版定制组件 BEGIN -----

    /**
     * 获取定制商品部件面料库存 P_GOODS_GETPARTFABRICINVENTORY 建荣
     * let params = {
            ptiPartHdId: '商品id',
            fabricId: '主面料id',
            gctRegionHdIds: '部件类别ids',
            fabricIds: '面料ids',
            amount: '数量',
            orderFlag: '定制：1',
            shopDptId: '店铺id',
            companyId: this.companyId
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getPartFabricInventory (ctx, next) {
        let result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/gct-fabcostset-hds-aggregates/is-custom-pro-inv-enough?companyId=' + ctx.params.companyId, ctx.params)
        ctx.body = result
        // ctx.body = {
        //     status: result == 1 ? 200 : 500,
        //     data: result == 1 ? result : result.data
        // }
    }

    /**
     * 获取定制商品部件面料库存 建荣（同上，可以具体提示哪个面料不足）
     * let params = {
            ptiPartHdId: '商品id',
            fabricId: '主面料id',
            gctRegionHdIds: '部件类别ids',
            fabricIds: '面料ids',
            amount: '数量',
            orderFlag: '定制：1',
            shopDptId: '店铺id',
            companyId: this.companyId
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getPartFabricInventoryNew (ctx, next) {
        let result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/gct-fabcostset-hds-aggregates/get-custom-pro-inv-data?companyId=' + ctx.params.companyId, ctx.params, ctx.headers)
        ctx.body = result
    }

    /**
     * 获取定制商品可定制部件面料 SP_GOODS_GETREGIONPARTFABRIC 扬辉
     * let params = {
            goodsCode: '货号',
            regionCode: '当前部件',
            dptId: '店铺key',
            checkFlag: '1',
            mainFabricCode: '主面料',
            partCodes: 部件，以逗号隔开
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getRegionPartFabric (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/link-cfg-hds/region-part-fabric', ctx.params, ctx.headers)
        // let result = await ctx.$get('http://1.1.6.162:8802/link-cfg-hds/region-part-fabric', ctx.params, ctx.headers)
        ctx.body = result.data
    }

    /**
     * 保存自定义印花 SP_GOODS_SAVEPRINTPHOTO 刘志梁
     * let params = {
            photoId: '印花图片id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async savePrintPhoto (ctx, next) {
        let photoId = ctx.params.photoId
        let url = '/sp-goods/print-photo/' + photoId
        let result = await ctx.$postUrl(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers)
        ctx.body = result.data
    }

    /**
     * 删除印花
     * let params = {
     *      ids: '删除印花对应的id，如果是批量删除，用逗号隔开'
     * }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async deletePrintPhoto (ctx, next) {
        let ids = ctx.params.ids
        let url = '/print-hds?id=' + ids
        let result = await ctx.$delete(ctx.baseUrl + ctx.serverPortUrl.goodsService + url, ctx.params, ctx.headers)
        ctx.body = result.data
    }

    /**
     * 保存购物车列表 SP_MAS_SAVECART
     * let params = {
            "amount":"数量 ",
            "fileHdId":"购物车截图Id",
            "mainFabricCode":"主面料编码",
            "partDtoList":[
                {
                    "fabricCode":"部件主面料",
                    "fabricId":"部件主面料id",
                    "partCode":"部件",
                    "partId":"部件id",
                    "regionCode":"部位",
                    "regionId":"部位id",
                    "embList":[
                        {
                            "colorId":"绣字颜色id",
                            "embValue":"绣字值",
                            "fontsId":"绣字字体id",
                            "positionX":"绣字x坐标",
                            "positionY":"绣字y坐标",
                            "rotationX":"绣字旋转角度x",
                            "scaleX":"缩放"
                        }
                    ],
                    "embptList":[
                        {
                            "embHdId": "绣花id" ,
                            "locationX": "绣花旋转角度" ,
                            "positionX": "印花x坐标" ,
                            "positionY": "印花y坐标" ,
                            "scale": "印花大小"
                        }
                    ],
                    "printList":[
                        {
                            "fileHdId": "印花图片路径id" ,
                            "locationX": "印花旋转角度x" ,
                            "locationY": "印花旋转角度y" ,
                            "positionX": "印花x坐标" ,
                            "positionY": "印花y坐标" ,
                            "printHdId": "印花id" ,
                            "scale": "印花大小"
                        }
                    ]
                }
            ],
            "ptiPartHdId":"商品id",
            "salePrice":"销售价"
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async saveCartValue(ctx, next) {
        let url = '/sp-goods/save-shopping-cart?usrId=' + ctx.params.usrId + '&companyId=' + ctx.params.companyId
        let result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers)
        // let result = await ctx.$post('http://1.1.6.188:8806' + url, ctx.params)
        ctx.body = result
    }

    /**
     * 查询购物车列表
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getCartListValue (ctx, next) {
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/shopping-sort-count', ctx.params)
        ctx.body = result.data
    }

    /**
     * 获取到驱动部位 明强
     * let params = {
     *  goodsCode: '商品code'
     * }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async driveRegion (ctx, next) {
        // let url = '/part-dt-regions/get-region-code/' + ctx.params.goodsCode + '?companyId=' + ctx.params.companyId

        // 需求修改
        let url = '/part-dt-regions/get-region-code/astrict/' + ctx.params.goodsCode + '?companyId=' + ctx.params.companyId
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + url, ctx.params, ctx.headers)
        ctx.body = result.data
    }

    /**
     * 获取需要替换的部件 毅杰
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getRegionPartFabricCheck (ctx, next) {
        let url = '/link-cfg-hds/region-part-fabric-check'
        let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + url, ctx.params)
        // let result = await ctx.$get('http://1.1.6.162:8802' + url, ctx.params)
        ctx.body = result.data
    }

    /**
     * 获取商品是否上架
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getSellStateValue(ctx, next) {
        let url = '/sp-part-goodss/batch-get-sell-flags?companyId=' + ctx.params.spPartGoodsSearchDtoList[0].companyId
        let result = await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params.spPartGoodsSearchDtoList[0])
        ctx.body = result
    }

    static async cilentToken(ctx, next) {
        let url = '/uaa/oauth-client/token'
        let result = await axios.post(ctx.baseUrl + url, ctx.params)
        ctx.body = result.data
    }
    // ----- 移动端、PC端标版定制组件 END -----
}
module.exports = {
    'GET/getgoodBase': customization.getgoodBase,
    'GET/getPlatFormList': customization.getPlatFormList,
    'GET/getCustomGoodsList': customization.getCustomGoodsList,
    'GET/getPropList': customization.getPropList,
    'GET/getMainFabricList': customization.getMainFabricList,
    'GET/getDefaultDetailed': customization.getDefaultDetailed,
    'GET/getRegionclass': customization.getRegionclass,
    'GET/getEmbPrintList': customization.getEmbPrintList,
    'GET/getPartFabricRender': customization.getPartFabricRender,
    'GET/getScene': customization.getScene,
    'GET/getPartEmbInfo': customization.getPartEmbInfo,
    'GET/getGoodsLinkage': customization.getGoodsLinkage,
    'GET/getGoodsInfo': customization.getGoodsInfo,
    'GET/getEmbFonts': customization.getEmbFonts,
    'GET/getPrice': customization.getPrice,
    'POST/saveDesign': customization.saveDesign,
    'GET/getVipCustoms': customization.getVipCustoms,
    'POST/remoteVolume': customization.remoteVolume,
    'PUT/updateVip': customization.updateVip,
    'POST/saveVolume': customization.saveVolume,
    'GET/getVolume': customization.getVolume,
    'POST/saveCartTemp': customization.saveCartTemp,
    'GET/onlineCalculate': customization.onlineCalculate,
    'GET/getDesign': customization.getDesign,
    'GET/getDesignFilter': customization.getDesignFilter,
    'POST/delDesign': customization.delDesign,
    'GET/getImg': customization.getImgByPath,
    'GET/getSysRecommendDesign': customization.getSysRecommendDesign,
    'GET/getDecalaReabyPartCode': customization.getDecalaReabyPartCode,
    'GET/getAllDesignDetail': customization.getAllDesignDetail,
    'POST/uploadImg': customization.uploadImg,
    'GET/getCabinetList': customization.getCabinetList,
    'GET/goodsSingleDetail': customization.goodsSingleDetail,
    'GET/goodsCombDetail': customization.goodsCombDetail,
    'POST/getShoppingList': customization.getShoppingList,
    'GET/getOrderSettlementValue': customization.getOrderSettlementValue,
    'POST/getOrderDiscountValue': customization.getOrderDiscountValue,
    'GET/getProperties': customization.getProperties,
    'GET/getBusContskey': customization.getBusContskey,
    'GET/getGoodsIsStock': customization.getGoodsIsStock,
    'POST/getPeopleModelRender': customization.getPeopleModelRender,
    'POST/getPartFabricInventory': customization.getPartFabricInventory,
    'POST/getPartFabricInventoryNew': customization.getPartFabricInventoryNew,
    'GET/getRegionPartFabric': customization.getRegionPartFabric,
    'POST/savePrintPhoto': customization.savePrintPhoto,
    'DELETE/deletePrintPhoto': customization.deletePrintPhoto,
    'POST/saveCartValue': customization.saveCartValue,
    'GET/getCartListValue': customization.getCartListValue,
    'GET/driveRegion': customization.driveRegion,
    'GET/getRegionPartFabricCheck': customization.getRegionPartFabricCheck,
    'POST/getSellStateValue': customization.getSellStateValue,
    'POST/cilentToken': customization.cilentToken,
};
