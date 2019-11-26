/*
 * createTime: 2019/6/24 15:02
 * author: wei.wang
 * description: 定制组件公共模块
 */

const customization = require('../../model/customization');

class customizationController {
    /*
     * 商品服务相关接口 (goodsService)
     */
    static async getDefaultDetailed(ctx) {
        let res = await customization.getDefaultDetailed(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getRegionClass(ctx) {
        let res = await customization.getRegionClass(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getRegionPartFabric(ctx) {
        let res = await customization.getRegionPartFabric(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getEmbFonts(ctx) {
        let res = await customization.getEmbFonts(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getPartFabricInventory(ctx) {
        let res = await customization.getPartFabricInventory(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getPartFabricInventoryNew(ctx) {
        let res = await customization.getPartFabricInventoryNew(ctx, ctx.params);
        ctx.body = res;
    }
    static async driveRegion(ctx) {
        let res = await customization.driveRegion(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getRegionPartFabricCheck(ctx) {
        let res = await customization.getRegionPartFabricCheck(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async deletePrintPhoto(ctx) {
        let res = await customization.deletePrintPhoto(ctx, ctx.params);
        ctx.body = res.data;
    }

    /*
     * 基础档案服务相关接口 (issBas)
     */

    /*
     * 零售服务相关接口 (shoppingCart)
     */
    static async getGoodBase(ctx) {
        let res = await customization.getGoodBase(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getMainFabricList(ctx) {
        let res = await customization.getMainFabricList(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getEmbPrintList(ctx) {
        let res = await customization.getEmbPrintList(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getPartEmbInfo(ctx) {
        let res = await customization.getPartEmbInfo(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getGoodsInfo(ctx) {
        let res = await customization.getGoodsInfo(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getPrice(ctx) {
        let res = await customization.getPrice(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getDesign(ctx) {
        let res = await customization.getDesign(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getDesignFilter(ctx) {
        let res = await customization.getDesignFilter(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getSysRecommendDesign(ctx) {
        let res = await customization.getSysRecommendDesign(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getAllDesignDetail(ctx) {
        let res = await customization.getAllDesignDetail(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async saveDesign(ctx) {
        let res = await customization.saveDesign(ctx, ctx.params);
        ctx.body = res;
    }
    static async delDesign(ctx) {
        let res = await customization.delDesign(ctx, ctx.params);
        ctx.body = res;
    }
    static async saveCartTemp(ctx) {
        let res = await customization.saveCartTemp(ctx, ctx.params);
        ctx.body = res;
    }
    static async saveCartValue(ctx) {
        let res = await customization.saveCartValue(ctx, ctx.params);
        ctx.body = res;
    }
    static async savePrintPhoto(ctx) {
        let res = await customization.savePrintPhoto(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getCartListValue(ctx) {
        let res = await customization.getCartListValue(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getGoodsIsStock(ctx) {
        let res = await customization.getGoodsIsStock(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getSellStateValue(ctx) {
        let res = await customization.getSellStateValue(ctx, ctx.params);
        ctx.body = res;
    }
    static async getIsShelves(ctx) {
        let res = await customization.getIsShelves(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async addCollection(ctx) {
        let res = await customization.addCollection(ctx, ctx.params);
        ctx.body = res;
    }
    static async deleteCollection(ctx) {
        let res = await customization.deleteCollection(ctx, ctx.params);
        ctx.body = res;
    }

    /*
     * 素材管理服务相关接口 (material)
     */
    static async getScene(ctx) {
        let res = await customization.getScene(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getPartFabricRender(ctx) {
        let res = await customization.getPartFabricRender(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getDecalaReabyPartCode(ctx) {
        let res = await customization.getDecalaReabyPartCode(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getPeopleModelRender(ctx) {
        let res = await customization.getPeopleModelRender(ctx, ctx.params);
        ctx.body = res;
    }

    /*
     * 系统服务相关接口 (system)
     */
    static async uploadImg(ctx) {
        let res = await customization.uploadImg(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getImgByPath(ctx) {
        let res = await customization.getImgByPath(ctx, ctx.params);
        ctx.body = res.data;
    }
    static async getBusContskey(ctx) {
        let res = await customization.getBusContskey(ctx, ctx.params);
        ctx.body = res.data;
    }

    /*
     * 促销服务相关接口 (promotion)
     */
    static async onlineCalculate(ctx) {
        let res = await customization.onlineCalculate(ctx, ctx.params);
        ctx.body = res.data;
    }
}

module.exports = customizationController;
