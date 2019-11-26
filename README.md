# 标版定制组件
## 1 端口说明

> node后台端口：3000

> vue端口：8080

## 2 访问路径
    本地访问路径：http://localhost:8080/#/goods/web-design?goodsCode=QZJ001&goodsId=241636&goodsName=123&position=true&frames=true
                http://localhost:8080/#/goods/web-design?goodsCode=DZMO01&goodsId=241176&goodsName=123&position=true&frames=true
                
    内网：
        开发环境：http://ballon-custom.dev.qs.com/#/goods/web-design?goodsCode=QZJ001&goodsId=631&goodsTitle=123&flag=true&position=true
        测试环境：http://ballon-custom.test.qs.com/#/goods/web-design?goodsCode=QZJ001&goodsId=631&goodsTitle=123&flag=true&position=true
                新商品：goodsCode=DZMO01&goodsId=241176&goodsTitle=123&flag=true&position=true
        正式环境：http://dz.chinaballon.com/goods-design?goodsCode=DZMO01&goodsId=1048&goodsTitle=123&position=true
        
        外网：http://1.1.2.50:3203/#/goods/web-design?goodsCode=DZMO01&flag=true
        
        http://qsuat.qishon.com/hjy/
        
    备注：
        goodsCode：  必传字段，商品货号
        goodsId：    非必传字段，商品id；购物车进入必传字段
        goodsTitle： 非必传字段，商品组合标题：默认名称商品名称
        flag：       非必传字段，添加默认本地缓存，此参数便于调试，不对任何人开放
        position：   非必传字段，此参数用于计算印绣花区域，由实施人员操作，不对客户开放
                        注意：1、先选部位，再抓点，即可抓到坐标；
                             2、不可未选部位，就抓点；抓点需在该部位上
        frames：     非必传字段，此参数用于获取模型帧数，由实施人员操作，不对客户开放
        rtlDesignHdId：非必传字段：定制方案，购物车进入必传字段
                             
                             
    巴龙pc测试环境定制组件
    DZMO01 男西服
    DZWO01 女西服
    DZMT01 男西裤
    DZWT01 女西裤
    DZMS01 男衬衫
    DZWS01 女衬衫
    
        
## 3 驱动部位
    1.获取到驱动部位 前端（driveRegion）
    /iss/mas/part-dt-regions/get-region-code
    
    2.获取到部位下的部件 和 部件面料 前端（getRegionPartFabric）
    /iss/mas/link-cfg-hds/region-part-fabric
    
    3.更换部件时，如果这个部件是驱动部位下的部件,调用这个接口,用所有部件类型下的选中部件获取需要替换的部件
    前端（getRegionPartFabricCheck） 获取限定关系整件衣服的信息
    /iss/mas/link-cfg-hds/region-part-fabric-check
    

## 4 threejs插件介绍
    |-- public
        |-- js
            |-- DecalGeometry.js       生成印绣花算法（官方提供）
            |-- Detector.js            webgl支持提示框（判断浏览器是否支持webgl）
            |-- OrbitControlsQS1.2.js  控制器插件（旋转、缩放大小等，也是官方提供，但是有改动）
            |-- three1.2.min.js        threejs
            |-- Web3DBin1.6.js         海隆封装（核心业务逻辑）

