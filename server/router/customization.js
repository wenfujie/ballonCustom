/*
 * createTime: 2019/6/24 15:00
 * author: wei.wang
 * description: 定制组件公用模块
 */

const customization = require('../controller/customization/customization');

module.exports = {
    /*
     * 商品服务相关接口 (goodsService)
     */
    'GET/getDefaultDetailed': customization.getDefaultDetailed,
    'GET/getRegionClass': customization.getRegionClass,
    'GET/getRegionPartFabric': customization.getRegionPartFabric,
    'GET/getEmbFonts': customization.getEmbFonts,
    'POST/getPartFabricInventory': customization.getPartFabricInventory,
    'POST/getPartFabricInventoryNew': customization.getPartFabricInventoryNew,
    'GET/driveRegion': customization.driveRegion,
    'GET/getRegionPartFabricCheck': customization.getRegionPartFabricCheck,
    'DELETE/deletePrintPhoto': customization.deletePrintPhoto,

    /*
     * 基础档案服务相关接口 (issBas)
     */

    /*
     * 零售服务相关接口 (shoppingCart)
     */
    'GET/getGoodBase': customization.getGoodBase,
    'GET/getMainFabricList': customization.getMainFabricList,
    'GET/getEmbPrintList': customization.getEmbPrintList,
    'GET/getPartEmbInfo': customization.getPartEmbInfo,
    'GET/getGoodsInfo': customization.getGoodsInfo,
    'GET/getPrice': customization.getPrice,
    'GET/getDesign': customization.getDesign,
    'GET/getDesignFilter': customization.getDesignFilter,
    'GET/getSysRecommendDesign': customization.getSysRecommendDesign,
    'GET/getAllDesignDetail': customization.getAllDesignDetail,
    'POST/saveDesign': customization.saveDesign,
    'POST/delDesign': customization.delDesign,
    'POST/saveCartTemp': customization.saveCartTemp,
    'POST/saveCartValue': customization.saveCartValue,
    'POST/savePrintPhoto': customization.savePrintPhoto,
    'GET/getCartListValue': customization.getCartListValue,
    'GET/getGoodsIsStock': customization.getGoodsIsStock,
    'POST/getSellStateValue': customization.getSellStateValue,
    'GET/getIsShelves': customization.getIsShelves,
    'POST/addCollection': customization.addCollection,
    'DELETE/deleteCollection': customization.deleteCollection,

    /*
     * 素材管理服务相关接口 (material)
     */
    'GET/getScene': customization.getScene,
    'GET/getPartFabricRender': customization.getPartFabricRender,
    'GET/getDecalaReabyPartCode': customization.getDecalaReabyPartCode,
    'POST/getPeopleModelRender': customization.getPeopleModelRender,

    /*
     * 系统服务相关接口 (system)
     */
    'POST/uploadImg': customization.uploadImg,
    'GET/getImg': customization.getImgByPath,
    'GET/getBusContskey': customization.getBusContskey,

    /*
     * 促销服务相关接口 (promotion)
     */
    'GET/onlineCalculate': customization.onlineCalculate,
};
