/*
 * createTime: 2019/6/24 15:05
 * author: wei.wang
 * description: 定制组件公共模块
 */
const axios = require('axios');
//  获取常数值
const fileSystemObj = require('../util/file-system');
const TokenManager = require('../util/token-manager');
const uuid = require('node-uuid');

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class customizationModel {
    /**
     * 商品服务相关接口 (goodsService)
     */
    // 初始定制清单（默认的部件面料） SP_GOODS_GETDEFAULTDETAILED 刘扬辉
    static async getDefaultDetailed(ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/link-cfg-dts/gct-default-detail/part-codeV2', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 获取可定制部位 SP_GOODS_GETREGIONCLASS 季兆宇
    static async getRegionClass (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/part-dt-regions/get-region-class/' + params.goodsCode, params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
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
    static async getRegionPartFabric (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/link-cfg-hds/region-part-fabric', params, ctx.headers).then((res) => {
            return res;
        })
    }

    // 获取系统绣字字体和颜色 SP_GOODS_GETEMBFONTSCOLORS 杨杰
    static async getEmbFonts (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/ict-emb-hds-aggregate/fonnts-and-colors', params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
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
    static async getPartFabricInventory (ctx, params) {
        return ctx.$post(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/gct-fabcostset-hds-aggregates/is-custom-pro-inv-enough?companyId=' + ctx.params.companyId, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
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
    static async getPartFabricInventoryNew (ctx, params) {
        return ctx.$post(ctx.baseUrl + ctx.serverPortUrl.goodsService + '/gct-fabcostset-hds-aggregates/get-custom-pro-inv-data?companyId=' + ctx.params.companyId, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
     * 获取到驱动部位 明强
     * let params = {
     *  goodsCode: '商品code'
     * }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async driveRegion (ctx, params) {
        // 需求修改
        let url = '/part-dt-regions/get-region-code/astrict/' + ctx.params.goodsCode + '?companyId=' + ctx.params.companyId;
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
     * 获取需要替换的部件 毅杰
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getRegionPartFabricCheck (ctx, params) {
        let url = '/link-cfg-hds/region-part-fabric-check';
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.goodsService + url, ctx.params, ctx.headers).then((res) => {
        // return ctx.$get('http://1.1.6.162:8802' + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
     * 删除印花
     * let params = {
     *      ids: '删除印花对应的id，如果是批量删除，用逗号隔开'
     * }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async deletePrintPhoto (ctx, params) {
        let ids = ctx.params.ids;
        let url = '/print-hds?id=' + ids;
        return ctx.$delete(ctx.baseUrl + ctx.serverPortUrl.goodsService + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /**
     * 基础档案服务相关接口 (issBas)
     */

    /**
     * 零售服务相关接口 (shoppingCart)
     */
    // 商品基本信息 SP_GOODS_GETBASEINFO 志樑
    static async getGoodBase (ctx, params) {
        if (!params.usrId) {
            params.usrId = '0'
        }

        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/base-info', params, ctx.headers).then((res) => {
            return res;
        })
    }

    // 获取商品面料列表 SP_GOODS_GETMAINFABRIC 刘志梁
    static async getMainFabricList (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/main-fbc', params, ctx.headers).then((res) => {
            return res;
        })
    }

    // 获取绣花印花图片列表 SP_GOODS_GETPARTEMBPRINTLIST 刘志梁
    static async getEmbPrintList (ctx, params) {
        if (!params.usrId) {
            params.usrId = '0'
        }

        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/part-emb-prints', params, ctx.headers).then((res) => {
            return res;
        })
    }

    // 获取部位部件绣字/花信息 SP_GOODS_GETPARTEMBINFO 刘志梁
    static async getPartEmbInfo(ctx, params){
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/part-emb-info', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // （套西）联动商品详情 SP_MAS_GETGOODSINFO 扬辉
    static async getGoodsInfo (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-part-goodss', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 价格 SP_GOODS_GETDETAILPRICE 刘志梁
    static async getPrice (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/detail-price', params, ctx.headers).then((res) => {
            return res;
        });
    }

    /*
     * 获取-暂存设计（获取该用户所有的暂存设计） SP_GOODS_GETSPECIALPERSONALDESIGN 扬辉
     * let params = {
            shopKey: '门店id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getDesign (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/rtl-design-hds/designs', params, ctx.headers).then((res) => {
            return res;
        });
    }

    /*
     * 获取-暂存设计（获取该商品下的暂存设计）  明强
     * let params = {
            shopKey: '门店id',
            partHdId: '商品id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getDesignFilter (ctx, params) {
        if (!params.usrId) {
            params.usrId = '0'
        }

        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/rtl-design-hds/designs-part', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 获取系统推荐设计 SP_GOODS_getSysRecommendDesign 金毅
    static async getSysRecommendDesign (ctx, params) {
        if (!params.usrId) {
            params.usrId = '0'
        }

        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/recommend-design', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 获取设计详情 SP_GOODS_GETALLDESIGNDETAIL 刘扬辉
    static async getAllDesignDetail (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/gs-designs', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 保存-暂存设计 SP_GOODS_SAVESPECIALPERSONALDESIGN 庄金毅
    static async saveDesign (ctx, params) {
        let url = '/rtl-design-hds?usrId=' + params.usrId + '&companyId=' + params.companyId

        // 套西需要加入batch（批量保存）
        if (params.goodsList.length > 1) {
            url += '&batch=true';
            return ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, params, ctx.headers).then((res) => {
                return res;
            });
        } else {
            return ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, params.goodsList, ctx.headers).then((res) => {
                return res;
            });
        }
    }

    // 删除-暂存设计 SP_GOODS_DELETEPERSONALDESIGN 刘扬辉
    static async delDesign (ctx, params) {
        let url = '/rtl-design-hds/' + params.designID;
        return ctx.$delete(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 保存更新结算 SP_SALE_saveCartTemp
    static async saveCartTemp (ctx, params) {
        let url = '/sp-sales/cart-temp?companyId=' + ctx.params.companyId + '&usrId=' + ctx.params.usrId;
        return ctx.$post(ctx.nettyUrl + ctx.serverPortUrl.shoppingCart + ctx.optimizeFlag + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
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
    static async saveCartValue(ctx, params) {
        let url = '/sp-goods/save-shopping-cart?usrId=' + ctx.params.usrId + '&companyId=' + ctx.params.companyId
        return ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
     * 保存自定义印花 SP_GOODS_SAVEPRINTPHOTO 刘志梁
     * let params = {
            photoId: '印花图片id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async savePrintPhoto (ctx, params) {
        let photoId = ctx.params.photoId;
        let url = '/sp-goods/print-photo/' + photoId;
        return ctx.$postUrl(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }


    /*
     * 查询购物车列表
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getCartListValue (ctx, params) {
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/shopping-sort-count', ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
     * 判断商品是否上架
     * let params = {
            partHdIds: '商品id（以逗号隔开）',
            buscontskey: '业务触点id'
       }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getGoodsIsStock(ctx, params) {
        let url = '/sp-part-goodss/goods/' + ctx.params.partHdIds + '?companyId=' + ctx.params.companyId + '&buscontskey=' + ctx.params.buscontskey
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params, ctx.headers).then((res) => {
            return res
        })
    }

    /*
     * 获取商品是否上架
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getSellStateValue(ctx, params) {
        let url = '/sp-part-goodss/batch-get-sell-flags?companyId=' + ctx.params.companyId;
        return await ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, ctx.params.spPartGoodsSearchDtoList, ctx.headers).then((res) => {
            return res;
        })
    }

    // 是否上下架判断
    static async getIsShelves(ctx, params) {
        return await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-part-goodss/simple/'+params.goodsCode, ctx.params, ctx.headers).then((res) => {
            return res
        });
    }

    // 加入收藏
    static async addCollection(ctx, params) {
        let url = `/sp-goods/favorite?vipInfoHdId=${params.vipInfoHdId}&usrId=${!!params.usrId ? params.usrId : '' }&companyId=${params.companyId}`
        return ctx.$post(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + url, params, ctx.headers).then((res) => {
            return res
        });
    }

    // 取消收藏
    static async deleteCollection(ctx, params) {
        return ctx.$delete(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-collects/clt-info', params, ctx.headers).then((res) => {
            return res
        });
    }

    /**
     * 素材管理服务相关接口 (material)
     */
    // 获取场景数据列表 SP_GOODS_GETSCENE_V2 王超鸿
    static async getScene (ctx, params) {
        // v2接口
        // return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m3d-w3d-org-dtts/scene-v2', params).then((res) => {
        //     return res;
        // });

        // v3接口
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m3d-w3d-org-dtts/scene-v3', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 获取部件面料3d渲染 SP_GOODS_GETPARTFABRICRENDER 刘志梁
    static async getPartFabricRender (ctx, params) {
        // 防止IE浏览器缓存问题，无实际用处
        ctx.params.uuid = uuid.v1();

        // v3接口
        // let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-collects/part-fabric-render-v3',  ctx.params)

        // 志樑本地
        // let result = await ctx.$get('http://1.1.6.187:8806/sp-collects/part-fabric-render-v3', ctx.params)
        // 文杰本地
        // let result = await ctx.$get('http://1.1.6.41:8810/m-3d-glb-ordattr-hds/find-model-info-web', ctx.params)

        // v4版本
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m-3d-glb-ordattr-hds/find-model-info-web', params, ctx.headers).then((res) => {
        // return ctx.$get('http://1.1.6.224:8810/m-3d-glb-ordattr-hds/find-model-info-web', params, ctx.headers).then((res) => {
            return res;
        });
    }

    // 获取绣字绣花区域列表 SP_GOODS_GETDECALAREABYPARTCODE 刘志梁
    static async getDecalaReabyPartCode (ctx, params) {
        // 如果没有用户信息，默认0（接口不改，只能前端改）
        if (!ctx.params.usrId) {
            ctx.params.usrId = '0'
        }

        // v1接口
        // let result = await ctx.$get(ctx.baseUrl + ctx.serverPortUrl.shoppingCart + '/sp-goods/decal-area', ctx.params)

        // v2接口
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.material + '/m-3d-glb-modelass-dt-prts/decal-area-v2', ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /*
     * 获取人台
     *  let params = {
            avatarCode: '人台编码'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getPeopleModelRender(ctx, params) {
        let url = '/m-3d-w-3d-avatar-hds/find-avatar-data';
        return ctx.$postUrl(ctx.baseUrl + ctx.serverPortUrl.material + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /**
     * 系统服务相关接口 (system)
     */
    // 图片上传
    static async uploadImg(ctx, next) {
        let result;
        let companyId = ctx.params.companyId
        let usrId = ctx.params.usrId
        let url = global.axiosBaseUrl + '/file/oss/image/mam/test3?companyId=' + companyId
        let imgPath = ctx.request.files.file.path
        let imgName = ctx.request.files.file.name

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

                // 获取token
                let token = await TokenManager.getToken()
                let option = {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'ownCompanyId': companyId,
                        'Content-Type': 'multipart/form-data'
                    }
                }

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

                let headers = await getHeaders(form)
                let imgUploadData = await axios.post(url, form, {
                    headers: Object.assign(headers, option.headers)
                })

                resolve(imgUploadData)
            })
        })

        // 上传到java成功回调
        result = await promise.then(async (res) => {
            let data = res.data
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

                imgId = await ctx.$postUrl(ctx.baseUrl + ctx.serverPortUrl.system + url, params, ctx.headers)
            }

            return imgId
        })
        return result;
    }

    // 获取图片资源
    static async getImgByPath(ctx){
        return await fileSystemObj.getImgByPath(ctx).then((res) => {
            return res;
        })
    }

    /*
     * 通过业务触点code 换取 业务触点id
     * let params = {
            code: '业务触点code'
       }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async getBusContskey(ctx, params) {
        let url = '/dict-ids/code/' + ctx.params.code
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.system + url, ctx.params, ctx.headers).then((res) => {
            return res;
        })
    }

    /**
     * 促销服务相关接口 (promotion)
     */
    /*
     *  计算促销结果（保存更新结算完后必须调用）
     *  let calculateData = {
            ordId: '订单结算表id'
        }
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    static async onlineCalculate (ctx, params) {
        let url = '/online-calculate/' + ctx.params.ordId + '?companyId=' + ctx.params.companyId + '&usrId=' + ctx.params.usrId
        return ctx.$get(ctx.baseUrl + ctx.serverPortUrl.promotion + url, ctx.params, ctx.headers).then((res) => {
            return {
                status: 200
            }
        })
    }

}
module.exports = customizationModel;
