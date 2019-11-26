/*
 * createTime: 2019/6/27 10:31
 * author: wei.wang
 * description: 前端基础模块api聚合
 */

import http from '../../util/http'

/*
 * 商品服务相关接口 (goodsService)
 */
// 初始定制清单（默认的部件面料）
export const getDefaultDetailed = (config) => { return http.get('customization/getDefaultDetailed', config); };

// 获取可定制部位
export const getRegionClass = (config) => { return http.get('customization/getRegionClass', config); };

// 获取定制商品可定制部件面料
export const getRegionPartFabric = (config) => { return http.get('customization/getRegionPartFabric', config); };

// 获取系统绣字字体和颜色
export const getEmbFonts = (config) => { return http.get('customization/getEmbFonts', config); };

// 获取定制商品部件面料库存
export const getPartFabricInventory = (config) => { return http.post('customization/getPartFabricInventory', config); };

// 获取定制商品部件面料库存
export const getPartFabricInventoryNew = (config) => { return http.post('customization/getPartFabricInventoryNew', config); };

// 获取到驱动部位
export const driveRegion = (config) => { return http.get('customization/driveRegion', config); };

// 获取需要替换的部件
export const getRegionPartFabricCheck = (config) => { return http.get('customization/getRegionPartFabricCheck', config); };

// 删除印花
export const deletePrintPhoto = (config) => { return http.delete('customization/deletePrintPhoto', config); };

/*
 * 基础档案服务相关接口 (issBas)
 */

/*
 * 零售服务相关接口 (shoppingCart)
 */
// 商品基本信息
export const getGoodBase = (config) => { return http.get('customization/getGoodBase', config); };

// 获取商品面料列表
export const getMainFabricList = (config) => { return http.get('customization/getMainFabricList', config); };

// 获取绣花印花图片列表
export const getEmbPrintList = (config) => { return http.get('customization/getEmbPrintList', config); };

// 获取部位部件绣字/花信息
export const getPartEmbInfo = (config) => { return http.get('customization/getPartEmbInfo', config); };

// （套西）联动商品详情
export const getGoodsInfo = (config) => { return http.get('customization/getGoodsInfo', config); };

// 获取价格
export const getPrice = (config) => { return http.get('customization/getPrice', config); };

// 获取-暂存设计（获取该用户所有的暂存设计）
export const getDesign = (config) => { return http.get('customization/getDesign', config); };

// 获取-暂存设计（获取该商品下的暂存设计）
export const getDesignFilter = (config) => { return http.get('customization/getDesignFilter', config); };

// 获取系统推荐设计
export const getSysRecommendDesign = (config) => { return http.get('customization/getSysRecommendDesign', config); };

// 获取设计详情
export const getAllDesignDetail = (config) => { return http.get('customization/getAllDesignDetail', config); };

// 保存-暂存设计
export const saveDesign = (config) => { return http.post('customization/saveDesign', config); };

// 删除-暂存设计
export const delDesign = (config) => { return http.post('customization/delDesign', config); };

// 保存更新结算
export const saveCartTemp = (config) => { return http.post('customization/saveCartTemp', config); };

// 保存购物车列表
export const saveCartValue = (config) => { return http.post('customization/saveCartValue', config); };

// 保存自定义印花
export const savePrintPhoto = (config) => { return http.post('customization/savePrintPhoto', config); };

// 查询购物车列表
export const getCartListValue = (config) => { return http.get('customization/getCartListValue', config); };

// 判断商品是否上架
export const getGoodsIsStock = (config) => { return http.get('customization/getGoodsIsStock', config); };

// 获取商品是否上架
export const getSellStateValue = (config) => { return http.post('customization/getSellStateValue', config); };

// 获取商品是否上下架
export const isShelves = (config) => { return http.get('customization/getIsShelves', config); };

// 加入收藏
export const addCollection = (config) => { return http.post('customization/addCollection', config); };

// 取消收藏
export const deleteCollection = (config) => { return http.delete('customization/deleteCollection', config); };

/*
 * 素材管理服务相关接口 (material)
 */
// 获取场景数据列表
export const getScene = (config) => { return http.get('customization/getScene', config); };

// 获取部件面料3d渲染
export const getPartFabricRender = (config) => { return http.get('customization/getPartFabricRender', config); };

// 获取绣字绣花区域列表
export const getDecalaReabyPartCode = (config) => { return http.get('customization/getDecalaReabyPartCode', config); };

// 获取人台
export const getPeopleModelRender = (config) => { return http.post('customization/getPeopleModelRender', config); };

/*
 * 系统服务相关接口 (system)
 */
// 图片上传
export const uploadImg = (config) => { return http.post('customization/uploadImg', config); };

// 获取图片资源
export const getImg = (config) => { return http.get('customization/getImg', config); };

// 通过业务触点code 换取 业务触点id
export const getBusContskey = (config) => { return http.get('customization/getBusContskey', config); };

/*
 * 促销服务相关接口 (promotion)
 */
// 计算促销结果（保存更新结算完后必须调用）
export const onlineCalculate = (config) => { return http.get('customization/onlineCalculate', config); };
