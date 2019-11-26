/**
 *
 * @description: 新技术组方法调用
 * @author: junyong.hong
 * @createTime: 2018/12/10
 * @version: 1.3.0.0
 * @history:
 *    1、重新调整通用方法
 *    2、对接3D素材管理工具
 *
 */
import Storage from '../../util/storage.js'
// model为canvas要加入的元素id，若无参则默认元素为body。注：元素必须事先定好大小尺寸
let model = new Web3DBin('model')
let ISCC = {
    /**
     * 设置图片前缀 和 后缀
     */
    setFile: function () {
        // model.setFilePrefix(serverUrl + 'customization/getImg?fileUrl=', "&companyId=" + Storage.get('COMPANYID').company_id)

        let url = baseConstant.ossOpenUrl ? baseConstant.ossOpenUrl : Storage.get('properties').ossOpenUrl
        model.setFilePrefix(url + 'image/', '')
    },
    /**
     * 场景渲染
     * @param context this
     * @param goodsCode 选中的商品编码
     * @returns {Promise}
     */
    goodScene: async function (context, goodsCode) {
        // 获取场景数据
        let getScene = await context.$get('customization/getScene', {
            goodsCode: goodsCode
        })

        model.initScene(getScene)
    },
    /**
     * 面料渲染方法
     * @param context this
     * @param goodsCode 商品编码
     * @param goodsId 商品id
     * @param FabricCode 选中的面料
     * @param isDesign 有传入参数，代表我的设计 或 限定关系
     * @param modelLeftOrRightId 对比：克隆出来的模型id
     * @returns {Promise}
     */
    Fabric3d: async function (context, goodsCode, goodsId, FabricCode, isDesign = false, modelLeftOrRightId = '') {
        let getPartFabricRender = await this.getPartFabricRender(context, goodsCode, goodsId, FabricCode, isDesign)


        let obj = ''

        if (modelLeftOrRightId) {
            obj = modelLeftOrRightId
        } else {
            obj = model
        }

        // 利用promise判断模型是否加载完毕
        let promise = new Promise((resolve, reject) => {
            let obj = ''

            if (modelLeftOrRightId) {
                obj = modelLeftOrRightId
            } else {
                obj = model
            }

            let modelListLen = getPartFabricRender.length
            obj.chooseModel({modelList: ISCC.setPosition(getPartFabricRender)}, function (data) {
                if (modelListLen === data.loadCount) {
                    resolve()
                }
            })
        })

        return promise.then(() => {
            return '0'
        })
    },
    /**
     * 重置模型参数
     * @param data 原始数据
     * @returns {*}
     */
    setPosition: function (data) {
        data.forEach((item, index) => {
            // item.modelScale = '0.7,0.7,0.7'
            // item.modelScale = '1,1,1'
            item.decalArea = {
                maxX: 1,
                minX: 0,
                maxY: 1,
                minY: 0
            }
        })

        return data
    },
    /**
     * 通用：获取面料渲染数据
     * @param context
     * @param goodsCode 商品编码
     * @param goodsId 商品id
     * @param FabricCode 选中的面料
     * @param isDesign 有传入参数，代表我的设计 或 限定关系
     * @returns {Promise.<*>}
     */
    getPartFabricRender: async function (context, goodsCode, goodsId, FabricCode, isDesign) {
        let getDefaultDetailed = ''
        if (isDesign) {
            getDefaultDetailed = isDesign
        } else {
            // 初始定制清单（默认的部件面料）--获取部件编码
            getDefaultDetailed = await context.$get('customization/getDefaultDetailed', {
                goodsCode: goodsCode,       //选中的商品编码
                mainFabricCode: FabricCode, //选中的面料编码
                checkFlag: 0,               // 限定关系有没有设定到商品面料（1有，0没有）
            })
        }

        // 对返回的数重新组装
        let designs = []
        getDefaultDetailed.detailedList.forEach((itm) => {
            let des = {}
            des.regionCode = itm.regionCode
            des.partCode = itm.partCode
            des.fabricCode = itm.fabricCode
            des.emb = {}
            des.embPrint = {}
            designs.push(des)
        })

        // 获取部件面料3d渲染
        let parms = {
            goodsCode: goodsCode,
            partId: goodsId,    // 商品id v4版本
            isSingle: 1,    // 单品（固定1） v4版本
            isPublish: 1,   // 是否发布 1发布 0未发布 v4版本
            detailedListStr: JSON.stringify(designs)
        }
        let getPartFabricRender = await context.$get('customization/getPartFabricRender', parms)
        return getPartFabricRender
    },
    /**
     * 绣/印花/绣字渲染
     * @param context this
     * @param goodsCode 选中的商品编码
     * @param goodsId 商品id
     * @param regionCode 部位（前片等）
     * @param partCode 部件编码（前片具体的）  (可空)
     * @param decalImgSrc 文字
     * @param type 印绣花类型 1.绣字  2、绣花；3、印花；默认绣字
     * @param definedFlag 自定义标记  (可空)  0，系统定义，1自定义（默认0，仅支持印花）
     * @param FabricCode 主面料
     * @param rotate 旋转角度
     * @param modelObj 模型对象
     * @returns {Promise}
     */
    getPartEmbInfo: async function (context, goodsCode, goodsId, regionCode, partCode, decalImgSrc, type, definedFlag, FabricCode, rotate = 0, modelObj = '') {
        let typeFlag = ''
        if (type == 1) {        // 绣字
            typeFlag = 'D_EMBTYPE_FONT'
        } else if (type == 2) { // 绣花
            typeFlag = 'D_EMBTYPE_EMBPIC'
        } else if (type == 3) { // 印花
            typeFlag = 'D_EMBTYPE_PRT'
        }
        // 获取部位部件绣字/花信息
        let getPartEmbInfo = await context.$get('customization/getPartEmbInfo', {
            goodsCode: goodsCode,
            regionCode: regionCode,
            typeFlag: typeFlag
        })

        let obj = model
        if (modelObj) {
            obj = modelObj
        }
        // 获取印绣花区域
        let embAreaData = await ISCC.changeMeshArea(context, goodsCode, goodsId, FabricCode, regionCode, typeFlag, obj)

        switch (type) {
            // 绣字
            case 1:
                let result = {}

                let par = {
                    // 绣字内容，采用html标签格式
                    "textstr": decalImgSrc,
                    // 部件场景名
                    "assemblySceneName": regionCode,
                    // 绣字ID
                    "decalID": getPartEmbInfo.decalID,
                    // X轴 Y轴
                    "UVPosition": {
                        x: embAreaData.x,
                        y: embAreaData.y
                        // x: 0.45,
                        // y: 0.45
                    },
                    // 旋转
                    "UVRotation": getPartEmbInfo.uvrotation,
                    // 是否可缩放
                    "scaleenable": getPartEmbInfo.scaleenable
                }

                return new Promise((resolve,reject)=>{
                    obj.addDecalText(par, function (res) {
                        obj.getDecal(regionCode, function (response) {
                            // UVData（绣字截图）
                            result = Object.assign(par, response)
                            resolve(result)
                            return result
                        })
                    })
                })

                break
            // 绣花、印花
            case 2:
            case 3:
                let params = {
                    // 部件场景名
                    "assemblySceneName": regionCode,
                    // 图片
                    "decalImgSrc": decalImgSrc,
                    // 绣花、印花id
                    "decalID": getPartEmbInfo.decalID,
                    // X轴 Y轴
                    "UVPosition": {
                        x: embAreaData.x,
                        y: embAreaData.y
                        // 暂时写死（接口坐标超出范围）
                        // x: 0.45,
                        // y: 0.45
                    },
                    // 旋转
                    "UVRotation": rotate/180*3.14,
                    // 是否可缩放
                    "scaleenable": getPartEmbInfo.scaleenable,
                }

                return new Promise((resolve,reject)=>{
                    obj.addDecalPic(params, function (res) {
                        obj.getDecal(regionCode, function (response) {
                            // UVData
                            result = Object.assign(params, response)
                            resolve(result)
                            return result
                        })
                    })
                })

                // return params
                break
        }
    },
    /**
     * 通用修改印花、绣字、绣花区域
     * @param context
     * @param goodsCode 选中的商品编码
     * @param goodsId 商品id
     * @param FabricCode 主面料
     * @param regionCode 部位（前片等）
     * @param typeFlag D_EMBTYPE_FONT绣字   D_EMBTYPE_EMBPIC绣花   D_EMBTYPE_PRT印花
     * @param modelObj 模型对象
     * @returns {Promise.<void>}
     */
    changeMeshArea:async function (context, goodsCode, goodsId, FabricCode, regionCode, typeFlag, modelObj) {
        let dttIds = null
        let uvPosition

        let getPartFabricRender = await this.getPartFabricRender(context, goodsCode, goodsId, FabricCode)

        // 部位id
        for (let i=0;i<getPartFabricRender.length;i++) {
            if (getPartFabricRender[i].m3dW3dOrgHdCode === regionCode) {
                dttIds = getPartFabricRender[i].m3dW3dOrgDtttId
            }
        }

        // 获取绣字最大值、最小值
        let getDecalaReabyPartCode = await context.$get('customization/getDecalaReabyPartCode', {
            type: typeFlag,
            dttIds: dttIds
        })

        // 修改绣字区域
        getPartFabricRender.forEach((item, index) => {
            if (item.sceneName === regionCode) {
                modelObj.changeMeshArea({
                    assemblySceneName: regionCode,
                    decalArea: {
                        maxX: parseFloat(getDecalaReabyPartCode[0].maxX),
                        minX: parseFloat(getDecalaReabyPartCode[0].minX),
                        maxY: parseFloat(getDecalaReabyPartCode[0].maxY),
                        minY: parseFloat(getDecalaReabyPartCode[0].minY)
                        // 暂时写死（接口坐标超出范围）
                        // maxX: 1,
                        // minX: 0,
                        // maxY: 1,
                        // minY: 0
                    },
                    // uvMap: item.assemblyUVMapping || '/spweb3d/UVmap/J_SLEE_B.png'
                    uvMap: item.assemblyUVMapping || '../img/J_SLEE_B.png'
                })

                uvPosition = getDecalaReabyPartCode[0].uvPosition
            }
        })

        return uvPosition
    },
    /**
     * 获取价格
     *  author：junyong.hong
     *  data:2018-07-06
     * @param content this
     * @param goodsCode 商品货号
     * @param currentModelData
     * @returns {Promise.<*>} 商品价格
     */
    getPrice: async function (content, goodsCode, currentModelData) {
        // console.log('currentModelData', JSON.stringify(currentModelData))

        let params = []
        // 获取 部件类别编码、部件编码、面料编码
        let getDefaultDetailed = await content.$get('customization/getDefaultDetailed', {
            goodsCode: goodsCode,
            checkFlag: 0            // 限定关系有没有设定到商品面料（1有，0没有）
        })

        getDefaultDetailed.detailedList.forEach((data) => {
            if (data.regionCode === currentModelData[data.regionCode].regionCode) {
                let par = {}
                par.regionCode = currentModelData[data.regionCode].regionCode
                par.partCode = currentModelData[data.regionCode].partCode
                par.fabricCode = currentModelData[data.regionCode].fabricCode

                // 是否印花，1代表有印花，0代表没有印花
                if (currentModelData.partPrintData && currentModelData.partPrintData.length > 0) {
                    currentModelData.partPrintData.forEach((item, index) => {
                        if (data.regionCode === item.regionCode) {
                            par.isPrint = 1
                        } else {
                            par.isPrint = 0
                        }
                    })
                } else {
                    par.isPrint = 0
                }
                // 是否绣字，1代表绣字，0代表没有
                if (currentModelData.partEmbData && currentModelData.partEmbData.length > 0) {
                    currentModelData.partEmbData.forEach((item, index) => {
                        if (data.regionCode === item.regionCode) {
                            par.isEmb = 1
                        } else {
                            par.isEmb = 0
                        }
                    })
                } else {
                    par.isEmb = 0
                }
                // 是否绣花，1代表有绣花，0代表没有绣花”,[增加是否绣花]
                if (currentModelData.partEmbPrintData && currentModelData.partEmbPrintData.length > 0) {
                    currentModelData.partEmbPrintData.forEach((item, index) => {
                        if (data.regionCode === item.regionCode) {
                            par.isEmbPrint = 1
                        } else {
                            par.isEmbPrint = 0
                        }
                    })
                } else {
                    par.isEmbPrint = 0
                }

                params.push(par)
            }
        })

        let paramsData = {
            // 商品货号
            goodsCode: goodsCode,
            // 主面料编码(可空)
            mainFabricCode: currentModelData.MainFabric || '',
            goodsDetailPriceDtoStr: JSON.stringify(params)
        }
        // console.log('计算价格，===', JSON.stringify(paramsData))
        let priceResult = await content.$get('customization/getPrice', paramsData)

        content.btnLock = false
        return priceResult
    },
    /**
     * 模型截图
     *  author：junyong.hong
     *  data:2018-07-09
     * @param content this
     * @param modelObj 当前模型对象
     * @returns {Promise.<*|Promise>}
     */
    getScreen: async function (content, modelObj = '') {
        let obj = ''
        if (modelObj) {
            obj = modelObj
        } else {
            obj = model
        }

        // 角度0（0是正面截图，180是背面截图）
        return obj.getScreen(0)
    },
    /**
     * 模型放大、缩小
     *  author：junyong.hong
     *  data:2018-07-12
     */
    zoom: function () {
        model.onWindowResize()
    },
    /**
     * 获取绣字颜色字体
     *  author：yating.sun
     *  data:2018-07-09
     * @param content this
     * @returns {Promise.<*>} 绣字颜色及字体
     */
    getFont: async function (context) {
        // 获取系统绣字字体和颜色
        let getEmbFonts = await context.$get('customization/getEmbFonts')
        // 获取的字体路径写入head标签中
        let newStyle = document.createElement('style');

        getEmbFonts.fontList.forEach((font, index) => {
            let url = serverUrl + 'customization/getImg?fileUrl=' + font.fontttfUrl + '?companyId=' + Storage.get('COMPANYID').company_id
            newStyle.appendChild(document.createTextNode('@font-face {font-family:' + font.ictEmbFontsHdName + ';src: url("'+ url + '")}'));

            let newDiv = document.createElement('span');
            newDiv.style.fontFamily = font.ictEmbFontsHdName
            newDiv.style.opacity = 0
            newDiv.style.width = 0
            newDiv.style.height = 0
            newDiv.style.overflow = 'hidden'
            document.body.appendChild(newDiv);
        })
        document.head.appendChild(newStyle);

        return getEmbFonts
    },
    /**
     * 删除印绣花接口
     * @param id 印绣花id
     */
    deleteDecal: function (id) {
        model.deleteDecal(id)
    },
    /**
     * 切换部位（后期代码优化）
     * @param context
     * @param goodsId 商品id
     * @param goodsCode 商品货号
     * @param newData 当前模型的主面料
     * @param regionCodeActive 当前选中的部位
     * @param partCodeActive 当前选中的部件
     * @param fabricCodeActive 切换部件的面料（如果不是主面料驱动，部件面料可能是不同的）
     * @param getDefaultDetailed 默认部件
     * @param callback 回调
     * @returns {Promise.<void>}
     */
    regionChange: async function (context, goodsId, goodsCode, newData, regionCodeActive, partCodeActive, fabricCodeActive, getDefaultDetailed, callback) {
        getDefaultDetailed.detailedList.forEach((item, index) => {
            if (newData.MainFabric) {   // 主面料驱动
                if (newData[item.regionCode].regionCode === regionCodeActive) { // 当前操作的部件
                    item.partCode = newData[item.regionCode].partCode

                    // 因特殊部位，进行调整，暂不合并【主面料驱动】与【非主面料驱动】，代码勿删除
                    // item.fabricCode = oldData.MainFabric
                    item.fabricCode = newData[item.regionCode].fabricCode
                } else {
                    // 代码勿删除
                    // item.fabricCode = oldData.MainFabric
                    item.fabricCode = newData[item.regionCode].fabricCode
                }
            } else {                    // 非主面料驱动
                if (newData[item.regionCode].regionCode === regionCodeActive) {
                    item.partCode = newData[item.regionCode].partCode
                    item.fabricCode = newData[item.regionCode].fabricCode
                }
            }
        })

        // 获取部件面料3d渲染
        let parms = {
            goodsCode: goodsCode,
            partId: goodsId,    // 商品id v4版本
            isSingle: 1,    // 单品（固定1） v4版本
            isPublish: 1,   // 是否发布 1发布 0未发布 v4版本
            detailedListStr: JSON.stringify(getDefaultDetailed.detailedList)
        }
        let getPartFabricRender = await context.$get('customization/getPartFabricRender', parms)

        let fabricLen = getPartFabricRender.length
        model.chooseModel({modelList: ISCC.setPosition(getPartFabricRender)}, (item) => {
            if (fabricLen == item.loadCount ) {
                setTimeout(() => {
                    callback()
                }, 500)
            }
        })
    },
    /**
     * 清空场景接口
     */
    clearAll (modelObj = '') {
        let obj = ''
        if (modelObj) {
            obj = modelObj
        } else {
            obj = model
        }
        obj.clearAll()
    },
    /**
     * 克隆模型
     * @param id 为HTML左边id、右边id
     */
    clone (id) {
        return model.clone(id)
    },
    /**
     * 绑定模型
     * @param list 为要进行操作绑定或者解除绑定的web3d对象的数组
     * @param switchs 1为绑定  0为解绑
     */
    bindingCouple (list, switchs) {
        model.bindingCouple(list, switchs)
    },
    /**
     * 删除画布
     * @param obj 克隆出来模型的对象
     */
    dispose (obj) {
        obj.dispose()
    },
    /**
     * 获取模型坐标
     * @param regionCode
     */
    getUVMSG (regionCode) {
        let position = {}

        return new Promise((resolve,reject)=>{
            model.getUVMSG(regionCode, function (res) {
                position.x = res.x
                position.y = res.y
                resolve(position)
            })
        })
    },
    /**
     * 3s未操作则自动旋转水平旋转
     * @param flag true为自动旋转，false为不旋转
     */
    rotateSelf (flag) {
        let param = {
            power: flag,
            angle: 1
        }

        model.rotateSelf(param)
    },
    /**
     * 获取当前帧状态参数接口
     * @returns {*|{distance, scale, angle}}
     */
    frameStatue () {
        return model.frameStatue()
    },
    /**
     * 帧跳转接口
     * @param data
     */
    frameChoose (data) {
        model.frameChoose(data)
    },
    /**
     * 部件闪烁
     * @param regionCode 部件
     * @param time 闪烁时间
     * @param color 颜色
     */
    shineAssembly (regionCode, time = 2, color = null, callback) {
        model.shineAssembly(regionCode, time, color, function () {
            callback()
        })
    }
}

export default ISCC
