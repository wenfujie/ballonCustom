/**
 * Web3D-bin-V1.4.14
 * 2018-08-08
 * by hailong.zhuang
 */
;(function () {
    Web3DBin = function (canvasEleName) {
        if (!Detector.webgl) Detector.addGetWebGLMessage();//判断当前显卡和浏览器是否支持webgl

        // $(document).bind("contextmenu", function (e) {
        //     return false;
        // });

        // 捕捉鼠标右击事件
        document.onmousedown = function (event) {
            var event = event || window.event
            if (event.button == "2") {
                return false;
            }
        };

        var canEle = canvasEleName;
        if (!document.getElementById(canvasEleName)) {
            //参数元素不存在
            console.error('Web3DBins: Element ', canvasEleName, ' not found');
            // canEle = undefined;
        }

        var containerElement = null;

        /**
         * 存储当前展示模型(几何体加材质)
         * @type {Map}
         */
        var meshMap = new Map();

        /**
         *当前印花区域模型
         * @type {null}
         */
        var decalAreaMesh = null;//印花区域模型

        /**
         *存储几何体
         * @type {Map}
         */
        var geometryGroup = new Map();//存储几何体

        /**
         *存储部件几何体的印绣花区域(UV点+UV偏移量)
         * @type {Map}
         */
        var meshDecalAreaMap = new Map();//存储部件几何体的印绣花区域(UV点+UV偏移量)

        /**
         *存储部件间投射阴影(几何体加材质)，键名为复合部件编码，a_b
         * @type {Map}
         */
        var receiveShadows = new Map();//存储部件间投射阴影(几何体加材质)，键名为复合部件编码，a_b

        /**
         *图片缓存
         * @type {Map}
         */
        var pictureCache = new Map();//图片缓存

        /**
         *存储当前展示(几何体加材质),键名为复合场景名,a_b
         * @type {Map}
         */
        var blendMap = new Map();//存储当前展示(几何体加材质),键名为复合场景名,a_b

        /**
         *当前场景
         * @type {Scene|*}
         */
        var scene = new THREE.Scene();//当前场景

        /**
         *灯光控制器群
         * @type {Array}
         */
        var lightControlsGroup = new Array();//灯光控制器群

        /**
         *灯光群
         * @type {Array}
         */
        var lightGroup = new Array();//灯光群

        /**
         *相机控制器
         * @type {null}
         */
        var controls = null;//相机控制器

        /**
         *当前相机
         * @type {null}
         */
        var camera = null;//当前相机

        /**
         * 渲染器设置 ①开启抗锯齿 ②最高着色精度 ③ 设置背景色透明 ④ 设置保存绘图缓冲
         * @type {WebGLRenderer|*}
         */
        var renderer = new THREE.WebGLRenderer({
            antialias: true,       //是否开启反锯齿
            precision: "highp",    //着色精度选择
            alpha: true,           //是否可以设置背景色透明
            preserveDrawingBuffer: true//是否保存绘图缓冲，若设为true，则可以提取canvas绘图的缓冲
        });

        /**
         *重力感应开关
         * @type {number}
         */
        var accelerometerPowerFlag = 0;//重力感应开关

        /**
         *中断"状态
         * @type {string}
         */
        var interruptionState = "initScene";//"中断"状态

        /**
         *存放印绣花鼠标事件值
         * @type {Map}
         */
        var decalClientPosition = new Map();//存放印绣花鼠标事件值

        /**
         *印花序号群（暂弃用）
         * @type {Map}
         */
        var decalOrderMap = new Map();//印花序号群（暂弃用）

        /**
         *存放场景内印绣花信息模型
         * @type {Map}
         */
        var decalMeshs = new Map();//存放场景内印绣花信息模型


        /**
         *印绣花辅助相关设置，交叉情况（碰撞）
         * @type {{intersects: boolean, point: (Vector3|*), normal: (Vector3|*)}}
         */
        var intersection = {
            intersects: false,
            point: new THREE.Vector3(),
            normal: new THREE.Vector3()
        };//交叉情况（碰撞）

        /**
         *
         * @type {Vector2|*}
         */
        var relativeUV = new THREE.Vector2(0, 0);

        /**
         *
         * @type {Vector2|*}
         */
        var eventPosition = new THREE.Vector2();

        /**
         *
         * @type {Vector2|*}
         */
        var mouse = new THREE.Vector2();

        /**
         *跟踪鼠标位置的 网格物体（辅助作用）
         * @type {Raycaster.params.Mesh|{}|*}
         */
        var mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
        mouseHelper.visible = false;
        scene.add(mouseHelper);

        /**
         *印绣花贴图
         * @type {Texture|*}
         */
        var textureDecal = new THREE.Texture();

        /**
         *区域贴图
         * @type {Texture|*}
         */
        var textureVersion = new THREE.Texture();

        /**
         *
         * @type {Texture|*}
         */
        var check = new THREE.Vector3(1, 1, 1);

        /**
         *空间三维坐标
         * @type {Vector3|*}
         */
        var p = new THREE.Vector3(0, 0, 0);

        /**
         *空间旋转坐标
         * @type {Vector3|*}
         */
        var r = new THREE.Vector3(0, 0, 0);

        var S = 40;
        /**
         * 空间缩放坐标
         * @type {number}
         */
        var s = new THREE.Vector3(S, S, S);

        /**
         *空间法向量坐标
         * @type {Vector3|*}
         */
        var normalN = new THREE.Vector3();

        /**
         *改变印绣花数据对象 decalID：印绣花ID  ，power：0-关闭 1-开启
         * @type {{decalID: null, power: number}}
         */
        var changeDecalData = {
            decalID: null,
            power: 0
        };

        /**
         *
         * @type {Vector2|*}
         */
        var mousePosOrigin = new THREE.Vector2();

        /**
         *
         * @type {number}
         */
        var rotateOrigin = 0;

        /**
         * 印绣花世界比例转UV图比例的转换率，暂时使用定值(分部件0.0012)
         * @type {number}
         */
        var conversionRatio = 0.0012;//

        /**
         *场景的宽度
         */
        var SCREEN_WIDTH;

        /**
         *场景的高度
         */
        var SCREEN_HEIGHT;

        /**
         *加载的图片数量
         * @type {number}
         */
        var pictureLoadNum = 0;

        /**
         *需要加载的图片总数量
         * @type {number}
         */
        var pictureNum = 0;

        /**
         *网格加载状态
         * @type {string}
         */
        var meshLoadStatue = "start";

        /**
         *
         * @type {number}
         */
        var meshBlendNum = 0;

        /**
         *
         * @type {number}
         */
        var meshBlendLoadNum = 0;

        /**
         * 对比灯光控制器群组对象
         * @type {Object}
         */
        var compareLightControlGroup = new Object();

        /**
         * 对比相机控制器群组对象
         * @type {Object}
         */
        var compareCameraControlGroup = new Array();

        /**
         * 放大镜摄像机
         * @type {null}
         */
        var magnifierCamera = null;

        /**
         * 放大镜渲染器
         * @type {null}
         */
        var magnifierRender = null;

        /**
         * 放大镜控制器
         * @type {null}
         */
        var magnifierControl = null;

        /**
         * 放大镜dom element元素
         * @type {null}
         */
        var magnifierContainerElement = null;

        /**
         * 放大镜放缩倍数
         * @type {number}
         */
        var zoomScale = 1;

        /**
         *用户设备（暂弃用）
         * @type {string}
         */
        var userDevice = "";

        /**
         * 印绣花类型
         * @type {number} 0:为无区域限制 1为区域限制 2为根据印绣花产生区域
         */
        var decalType = 0;

        /**
         *是否显示序列（暂弃用）
         * @type {boolean}
         */
        var orderShow = false;

        /**
         *是否自旋转标志位 0为不自旋转 1为自旋转
         * @type {number}
         */
        var rotateSelfFlag = 0;

        /*        /!**
         *弃用
         * @type {Object}
         *!/
        var modelTimeStamp =new Object();*/

        /**
         * 加载监听对象，用于监听当次模型传入的状态
         * @type {Map}
         */
        var loadSurveillance = new Map();//version 1.5

        /**
         *当前时间，用于模型解密
         * @type {Object}
         */
        var modelParseTime = new Object();//version 1.5

        /**
         *印绣花辅助框
         * @type {null}
         */
        var floatingBox = null;

        /**
         *
         * @type {null}
         */
        var relas = null;

        /**
         * 文件路径前缀
         * @type {string}
         */
        var filePrefix = "";

        /**
         * 文件路径后缀
         * @type {string}
         */
        var fileSuffix = "";

        /**
         *相机计算判断位，1为相机已自动计算，0为相机未自动计算
         * @type {number}
         */
        var cameraComputeJudge = 0;

        /**
         * 渲染器目标，用于存放渲染缓冲
         * @type {WebGLRenderTarget|*}
         */
        var RenderTarget = new THREE.WebGLRenderTarget(300, 300);


        var Web3DBins = new Object();


        Web3DBins.prototype = {
            /**
             * web3d实例化对象id
             * @type {string}
             */
            ID: new Date().getTime(),

            /**
             * 对比列表
             * @type {array}
             */
            compareList: new Array(),

            /**
             * 模型加载完回调函数执行
             * @param id 每次执行模型加载的id
             */
            goCallback: function (id) {
                var s = loadSurveillance[id];
                if (s.totalCallback != null) {
                    s.totalCallback(s.totalObj);
                    s.totalCallback = null;
                    s.totalObj = null;
                    s = null;
                }
            },

            /**
             * 路径前缀后缀设置
             * @param str1 路径前缀
             ** @param str1 路径后缀
             */
            setFilePrefix: function (str1, str2) {
                if (str1 != null && str1 != undefined) {
                    filePrefix = str1;
                }
                if (str2 != null && str2 != undefined) {
                    fileSuffix = str2;
                }
            },

            /**
             * 获取当前web3d实例相关数据
             */
            getInfo: function () {
                var info = {
                    'domElement': renderer.domElement,
                    'controls': controls,
                    'lightControlsGroup': lightControlsGroup,
                    'scene': scene,
                    'renderer': function () {
                        renderer.render(scene, camera)
                    }
                };
                return info;
            },

            /**
             * web3d实例销毁函数
             */
            dispose: function () {
                Web3DBins.prototype.clearAll();
                containerElement.removeChild(renderer.domElement);
                containerElement = null;
                window.removeEventListener('resize', Web3DBins.prototype.onWindowResize);
                for (var n in lightControlsGroup) {
                    lightControlsGroup[n].dispose();
                    lightControlsGroup[n] = null;
                }
                lightControlsGroup = [];
                if (controls != null) {
                    controls.removeEventListener('change', Web3DBins.prototype.renderanimate);
                    controls.dispose();
                    controls = null;
                }
                for (var n in lightGroup) {
                    scene.remove(lightGroup[n]);
                    lightGroup[n] = undefined;
                }
                lightGroup = [];
                meshMap = null;
                geometryGroup = null;
                meshDecalAreaMap = null;
                receiveShadows = null;
                blendMap = null;
                scene = null;
                lightControlsGroup = null;
                lightGroup = null;
                controls = null;
                camera = null;
                renderer.forceContextLoss();
                renderer.context = null;
                renderer.domElement = null;
                renderer.dispose();
                renderer = null;
                accelerometerPowerFlag = null;
                interruptionState = null;
                decalClientPosition = null;
                decalMeshs = null;
                intersection = null;
                eventPosition = null;
                mouse = null;
                mouseHelper = null;
                textureDecal = null;
                textureVersion = null;
                check = null;
                p = null;
                r = null;
                S = null;
                s = null;
                normalN = null;
                changeDecalData = null;
                mousePosOrigin = null;
                rotateOrigin = null;
                conversionRatio = null;
                this.ID = null;
                this.compareList = null;
                pictureLoadNum = null;
                pictureNum = null;
                meshLoadStatue = null;
                for (var n in Web3DBins.prototype) {
                    Web3DBins.prototype[n] = null;
                }
                compareLightControlGroup = null;
                compareCameraControlGroup = null;
                magnifierCamera = null;
                magnifierRender = null;
                magnifierControl = null;
                magnifierContainerElement = null;
                zoomScale = null;
                userDevice = null;
                Web3DBins.prototype = null;
                Web3DBins = null;
            },

            /**
             * 对比绑定
             * @param list 对比对象数组
             * @param switchs 对比开关 0-开启对比 1-关闭对比
             */
            bindingCouple: function (list, switchs) {
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (switchs == 1) {
                        for (var n = 0; n < list.length; n++) {
                            for (var x = n + 1; x < list.length; x++) {
                                list[n].compareWithOther(list[x], 'on');
                            }
                        }
                    }
                    if (switchs == 0) {
                        for (var n = 0; n < list.length; n++) {
                            for (var x = n + 1; x < list.length; x++) {
                                list[n].compareWithOther(list[x], 'off');
                            }
                        }
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }
            },

            /**
             * 移除当前实例对象与其他实例对象的对比（内部接口）
             * @param name 其他实例对象
             */
            removeCompare: function (name) {//内部函数，移除对比
                for (var n in compareLightControlGroup[name.ID]) {
                    var tmp = compareLightControlGroup[name.ID][n];
                    tmp.dispose();
                    tmp = null;
                }
                delete compareLightControlGroup[name.ID];
                for (var n = 0; n < compareCameraControlGroup.length; n++) {
                    if (compareCameraControlGroup[n].web3dID == name.ID) {
                        compareCameraControlGroup[n].dispose();
                        compareCameraControlGroup[n].removeEventListener('change', Web3DBins.prototype.renderanimate);
                        compareCameraControlGroup[n] = null;
                        compareCameraControlGroup.splice(n, 1);
                        break;
                    }
                }
                for (var n in this.compareList) {
                    if (this.compareList[n].ID == name.ID) {
                        this.compareList[n] = null;
                        this.compareList.splice(n, 1);
                        break;
                    }
                }
            },

            /**
             * 设置当前实例对象与其他实例对象的对比（内部接口）
             * @param name 其他实例对象
             * @param switchs 开关 0-关闭对比 1-开启对比
             */
            compareWithOther: function (name, switchs) {
                if (switchs == "on") {
                    for (var n in this.compareList) {
                        if (this.compareList[n].ID == name.ID) return;
                    }
                    this.compareList.push(name);
                    var scope = this;
                    name.compareList.push(scope);
                    controls.reset();
                    name.getInfo().controls.reset();
                    for (var n in lightControlsGroup) {
                        lightControlsGroup[n].reset();
                    }
                    tmplcg = name.getInfo().lightControlsGroup;
                    for (var n in tmplcg) {
                        tmplcg[n].reset();
                    }
                    Web3DBins.prototype.setCompareCameraControl();
                    Web3DBins.prototype.setCompareLightControl();
                    name.setCompareCameraControl();
                    name.setCompareLightControl();
                }
                else if (switchs == "off") {
                    Web3DBins.prototype.removeCompare(name);
                    var scope = this;
                    name.removeCompare(scope);
                }
            },

            /**
             * 设置对比相机控制器（内部接口）
             */
            setCompareCameraControl: function () {
                for (var n in compareCameraControlGroup) {
                    compareCameraControlGroup[n].dispose();
                    compareCameraControlGroup[n].removeEventListener('change', Web3DBins.prototype.renderanimate);
                    compareCameraControlGroup[n] = null;
                    delete compareCameraControlGroup[n];
                }
                for (var n in this.compareList) {
                    var tmp = this.compareList[n].getInfo().domElement;
                    var tmpcontrol2 = new THREE.OrbitControls(camera, tmp);
                    tmpcontrol2.updateControlType();
                    tmpcontrol2.maxPolarAngle = controls.maxPolarAngle;
                    tmpcontrol2.minDistance = controls.minDistance;
                    tmpcontrol2.maxDistance = controls.maxDistance;
                    tmpcontrol2.addEventListener('change', Web3DBins.prototype.renderanimate);
                    tmpcontrol2.web3dID = this.compareList[n].ID;
                    compareCameraControlGroup.push(tmpcontrol2);
                }
            },

            /**
             * 设置对比灯光控制器（内部接口）
             */
            setCompareLightControl: function () {
                for (var n in compareLightControlGroup) {
                    var tmp = compareLightControlGroup[n];
                    for (var x in tmp) {
                        tmp[x].dispose();
                        tmp[x] = null;
                    }
                    tmp = [];
                    delete compareLightControlGroup[n];
                }
                for (var n in this.compareList) {
                    tmp = this.compareList[n].getInfo().domElement;
                    var compareObject = new Array();
                    for (var x in lightGroup) {
                        var tmpcontrol2 = new THREE.OrbitControls(lightGroup[x], tmp);
                        tmpcontrol2.maxPolarAngle = controls.maxPolarAngle;
                        tmpcontrol2.enableZoom = false;
                        compareObject.push(tmpcontrol2);
                    }
                    compareLightControlGroup[this.compareList[n].ID] = compareObject;
                }
            },

            /**
             * 相机自动化设置（内部接口）
             */
            cameraCompute: function () {
                if (cameraComputeJudge == 1) return;
                cameraComputeJudge = 1;
                var judge = 1;
                var group = new THREE.Group();
                // var pGroup = new Map();
                // var sGroup = new Map();
                for (var n in meshMap) {
                    // var p = new THREE.Vector3();
                    // p.copy(meshMap[n].position);
                    // var s = new THREE.Vector3();
                    // s.copy(meshMap[n].scale);
                    // // meshMap[n].scale.set(1,1,1);
                    // var center = new THREE.Vector3();
                    // meshMap[n].geometry.computeBoundingBox();
                    // meshMap[n].geometry.boundingBox.getCenter(center);
                    // meshMap[n].geometry.center();
                    // meshMap[n].geometry.centers = center;
                    // meshMap[n].centers = center;
                    // meshMap[n].position.copy(center);
                    group.add(meshMap[n].clone());
                    // pGroup[n] = p;
                    // sGroup[n] = s;
                }
                var box = new THREE.Box3().setFromObject(group);
                var center = box.getCenter();
                var x = box.getSize().x;
                var y = box.getSize().y;
                var z = box.getSize().z;
                var max = x;
                if (x < y) {
                    max = y;
                    if (y < z) {
                        max = z;
                    }
                }
                else if (x < z) {
                    max = z;
                    if (z < y) {
                        max = y;
                    }
                }
                var distance = max / 2 / Math.tan((camera.fov - 10) / 2 / 180 * Math.PI);
                camera.position.setZ(-distance - center.z);
                camera.position.setX(center.x);
                camera.position.setY(center.y);
                camera.lookAt(center.x, center.y, center.z);
                //camera.targetqs.set(center.x,center.y,center.z);

                // for(var n in lightGroup){
                // var control2=new THREE.OrbitControls(lightGroup[n],renderer.domElement);
                // control2.updateControlType();
                // control2.enableZoom = false;
                // control2.maxPolarAngle = Math.PI * 0.5;
                // control2.name=lightGroup[n].name;

                // control2.saveState();
                // lightControlsGroup.push(control2);
                // }

                if (controls) controls.dispose();
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                camera.targetqs.set(center.x, center.y, center.z);
                controls.updateControlType();
                //controls.maxPolarAngle = Math.PI * parseFloat(0.5);
                controls.minDistance = max / 2;
                controls.maxDistance = camera.position.distanceTo(center);
                controls.update();
                controls.saveState();

                // if(cameraComputeJudge==2){
                // camera.targetqs.set(center.x,center.y,center.z);
                // controls.update();
                // }

                for (var n in lightControlsGroup) {
                    lightControlsGroup[n].update();
                    lightControlsGroup[n].saveState();
                }

                Web3DBins.prototype.setCompareLightControl();
                Web3DBins.prototype.setCompareCameraControl();

                controls.addEventListener('change', Web3DBins.prototype.renderanimate);

                // for(var n in meshMap){
                // 	meshMap[n].position.x += pGroup[n].x;
                // 	meshMap[n].position.y += pGroup[n].y;
                // 	meshMap[n].position.z += pGroup[n].z;
                // 	meshMap[n].scale.copy(sGroup[n]);
                // }
                // for(var n in meshMap){
                // meshMap[n].geometry.translate( center.x, center.y, center.z );
                // }
            },

            /**
             * 场景清空
             */
            clearAll: function () {

                pictureCache = {};
                renderer.clear();
                renderer.renderLists.dispose();
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    for (var n in meshMap) {
                        scene.remove(meshMap[n]);
                        Web3DBins.prototype.cacheClear(meshMap[n]);
                    }

                    decalMeshs.forEach(function (data, index, map) {
                        scene.remove(data.mesh);
                        Web3DBins.prototype.cacheClear(data.mesh);
                        //Web3DBins.prototype.cacheClear(data.shotGeo);
                    });

                    meshDecalAreaMap.forEach(function (data, index, map) {
                        if (data.areaMesh != undefined && data.areaMesh != null) Web3DBins.prototype.cacheClear(data.areaMesh);
                    });

                    for (var n in blendMap) {
                        scene.remove(blendMap[n]);
                        Web3DBins.prototype.cacheClear(blendMap[n]);
                    }

                    decalOrderMap.forEach(function (value, key, map) {
                        scene.remove(value);
                        Web3DBins.prototype.cacheClear(value);
                    });

                    renderer.render(scene, camera);
                    //composer.render();
                    meshMap = {};
                    blendMap.clear();
                    geometryGroup.clear();
                    decalMeshs.clear();
                    decalOrderMap.clear();

                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

            },

            /**
             * 缓存清空
             * @param mesh 要清缓存的网格模型
             */
            cacheClear: function (mesh) {
                if (mesh.material == undefined) return;
                else if (mesh.material instanceof Array) {
                    for (var n in mesh.material) {
                        var material = mesh.material[n];
                        if (material.map != null) {
                            material.map.dispose();
                        }
                        if (material.aoMap != null) {
                            material.aoMap.dispose();
                        }
                        if (material.normalMap != null) {
                            material.normalMap.dispose();
                        }
                        if (material.specularMap != null) {
                            material.specularMap.dispose();
                        }
                        if (material.bumpMap != null) {
                            material.bumpMap.dispose();
                        }
                        if (material.emissiveMap != null) {
                            material.bumpMap.dispose();
                        }
                        if (material.alphaMap != null) {
                            material.alphaMap.dispose();
                        }
                        if (material.metalnessMap != null) {
                            material.metalnessMap.dispose();
                        }
                        if (material.roughnessMap != null) {
                            material.roughnessMap.dispose();
                        }
                        if (material.lightMap != null) {
                            material.lightMap.dispose();
                        }
                        material.dispose();
                        //material=undefined;
                    }
                } else if (mesh.material instanceof Object) {
                    var material = mesh.material;
                    if (material.map != null) {
                        material.map.dispose();
                    }
                    if (material.aoMap != null) {
                        material.aoMap.dispose();
                    }
                    if (material.normalMap != null) {
                        material.normalMap.dispose();
                    }
                    if (material.specularMap != null) {
                        material.specularMap.dispose();
                    }
                    if (material.bumpMap != null) {
                        material.bumpMap.dispose();
                    }
                    if (material.emissiveMap != null) {
                        material.bumpMap.dispose();
                    }
                    if (material.alphaMap != null) {
                        material.alphaMap.dispose();
                    }
                    if (material.metalnessMap != null) {
                        material.metalnessMap.dispose();
                    }
                    if (material.roughnessMap != null) {
                        material.roughnessMap.dispose();
                    }
                    if (material.lightMap != null) {
                        material.lightMap.dispose();
                    }
                    material.dispose();
                    //material=undefined;
                }
                mesh.geometry.dispose();
                //mesh.geometry=undefined;
                //mesh=undefined;
            },

            /**
             * 初始化场景
             * @param json 灯光、控制器方式数据
             */
            initScene: function (json) {
                interruptionState = null;

                for (var n in lightControlsGroup) {
                    lightControlsGroup[n].dispose();
                    lightControlsGroup[n] = null;
                }
                lightControlsGroup = [];

                // if(controls!=null){
                // controls.removeEventListener( 'change',Web3DBins.prototype.renderanimate);
                // controls.dispose();
                // controls=null;
                // }

                for (var n in lightGroup) {
                    scene.remove(lightGroup[n]);
                }
                lightGroup = [];
                // camera=null;

                var CONTROLS = json.controls;
                var lights = json.lights;
                var CAMERA = json.camera;
                var dataIntArr = [];

                renderer.setPixelRatio(window.devicePixelRatio);
                /*if(navigator.userAgent.toLowerCase().match(/android/i)!= "android"){
        renderer.setPixelRatio( window.devicePixelRatio );
    }
    else if(navigator.userAgent.toLowerCase().match(/iphone/i)!= "iphone"){
        userDevice="ios";
    }
    else if(navigator.userAgent.toLowerCase().match(/iphone/i)!= "ipad"){
        userDevice="ipad";
    }*/
                //renderer.setSize( window.innerWidth, window.innerHeight );
                // if(canEle == undefined){
                //     renderer.setSize( document.body.clientWidth, document.body.clientHeight );
                //     document.body.appendChild( renderer.domElement );
                // }
                // else{
                //     renderer.setSize( document.getElementById(canEle).clientWidth, document.getElementById(canEle).clientHeight );
                //     document.getElementById(canEle).appendChild( renderer.domElement );
                // }
                if (canEle == undefined) {
                    containerElement = document.body;
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
                else {
                    containerElement = document.getElementById(canEle);
                    renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
                }
                renderer.domElement.style.zIndex = 0;
                renderer.domElement.style.position = "absolute";
                containerElement.appendChild(renderer.domElement);

                if (CONTROLS && CONTROLS.controlType !== undefined) {//未传参默认值为0
                    THREE.OrbitControls.prototype.controlType = CONTROLS.controlType;
                }
                if (cameraComputeJudge) var frameNow = Web3DBins.prototype.frameStatue();
                for (var lig = 0; lig < lights.length; lig++) {

                    var lightNow;
                    switch (lights[lig].lightType) {
                        case "AmbientLight":
                            lightNow = new THREE.AmbientLight(lights[lig].lightColor);
                            break;
                        case "DirectionalLight":
                            lightNow = new THREE.DirectionalLight(lights[lig].lightColor);
                            break;
                        case "HemisphereLight":
                            lightNow = new THREE.HemisphereLight(lights[lig].lightColor);
                            break;
                        case "PointLight":
                            lightNow = new THREE.PointLight(lights[lig].lightColor);
                            break;
                        case "SpotLight":
                            lightNow = new THREE.SpotLight(lights[lig].lightColor);
                            break;
                        default:
                            break;
                    }

                    dataIntArr = Web3DBins.prototype.splitArr(lights[lig].lightPosition);
                    lightNow.position.set(dataIntArr[0], dataIntArr[1], dataIntArr[2]);

                    // dataIntArr = Web3DBins.prototype.splitArr(lights[lig].lightRotation);
                    // lightNow.rotation.set(Math.PI*dataIntArr[0],Math.PI*dataIntArr[1],Math.PI*dataIntArr[2]);

                    lightNow.intensity = parseFloat(lights[lig].lightIntensity);
                    lightNow.name = lights[lig].lightCode;

                    lightGroup.push(lightNow);

                    var control2 = new THREE.OrbitControls(lightNow, renderer.domElement);
                    control2.updateControlType();
                    control2.enableZoom = false;
                    // control2.maxPolarAngle = Math.PI * CONTROLS.controlsMaxPolarAnglePI;
                    control2.name = lights[lig].lightCode;

                    control2.saveState();
                    lightControlsGroup.push(control2);

                    scene.add(lightNow);
                }

                //camera = new THREE.PerspectiveCamera(parseFloat(CAMERA.fov), window.innerWidth / window.innerHeight, parseFloat(CAMERA.near), parseFloat(CAMERA.far));
                // camera = new THREE.PerspectiveCamera(parseFloat(CAMERA.fov), renderer.domElement.width / renderer.domElement.height, parseFloat(CAMERA.near), parseFloat(CAMERA.far));

                // dataIntArr = Web3DBins.prototype.splitArr(CAMERA.cameraPosition);
                // camera.position.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);

                // if(CAMERA.FocalLength!=null){
                // var s=renderer.domElement.width/renderer.domElement.height;
                // if(s>1){
                // camera.setFocalLength(parseFloat(CAMERA.FocalLength)/s);
                // }
                // else camera.setFocalLength(s*parseFloat(CAMERA.FocalLength));
                // camera.isSetFocalLength=true;
                // }

                // controls = new THREE.OrbitControls( camera, renderer.domElement);
                // controls.updateControlType();
                // controls.maxPolarAngle = Math.PI * parseFloat(CONTROLS.controlsMaxPolarAnglePI);
                // controls.minDistance = parseFloat(CONTROLS.controlsMinDistance);
                // controls.maxDistance = parseFloat(CONTROLS.controlsMaxDistance);

                if (!cameraComputeJudge) {

                    camera = new THREE.PerspectiveCamera(parseFloat(45), renderer.domElement.width / renderer.domElement.height, parseFloat(1), parseFloat(4000));

                    camera.position.set(10000, 10000, 11900);
                    //controls = new THREE.OrbitControls( camera, renderer.domElement);
                    //controls.updateControlType();
                    //controls.maxPolarAngle = Math.PI * parseFloat(0.5);
                    //controls.minDistance = parseFloat(300);
                    //controls.maxDistance = parseFloat(1800);

                    //controls.saveState();

                    //Web3DBins.prototype.setCompareLightControl();
                    //Web3DBins.prototype.setCompareCameraControl();

                    //controls.addEventListener( 'change',Web3DBins.prototype.renderanimate);
                } else {
                    controls.reset();
                    if (THREE.OrbitControls.prototype.controlType == 1) {
                        var distancetmp = (parseFloat(frameNow.distance) - controls.totalDistance);
                        var scaletmp = parseFloat(frameNow.scale) / controls.totalScale;
                        var j = controls.getAzimuthalAngle() - Math.PI + parseFloat(frameNow.angle);
                        controls.panUpByDistance(distancetmp);
                        controls.zoomAndUpdate(scaletmp);
                        controls.rotateLeftByAngle(j);
                        for (var n in lightControlsGroup) {
                            lightControlsGroup[n].rotateLeftByAngle(j);
                        }
                    }
                    else if (THREE.OrbitControls.prototype.controlType == 2) {
                        var distancetmp = controls.getAzimuthalPhi() - Math.PI + parseFloat(frameNow.distance);
                        var scaletmp = parseFloat(frameNow.scale) / controls.totalScale;
                        var j = controls.getAzimuthalAngle() - Math.PI + parseFloat(frameNow.angle);
                        controls.rotateUpByAngle(distancetmp);
                        controls.zoomAndUpdate(scaletmp);
                        controls.rotateLeftByAngle(j);
                        for (var n in lightControlsGroup) {
                            lightControlsGroup[n].rotateLeftByAngle(j);
                            lightControlsGroup[n].rotateUpByAngle(distancetmp);
                        }
                    }
                    //Web3DBins.prototype.frameChoose(frameNow);
                }

                window.addEventListener('resize', Web3DBins.prototype.onWindowResize, false);
                // composer = new THREE.EffectComposer( renderer );
                // renderPass = new THREE.RenderPass( scene, camera );
                // composer.addPass( renderPass );
                // //outlinePass = new THREE.OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
                // outlinePass = new THREE.OutlinePass( new THREE.Vector2( renderer.domElement.width, renderer.domElement.height ), scene, camera );
                // composer.addPass( outlinePass );
                // var copyPass = new THREE.ShaderPass( THREE.CopyShader );
                // copyPass.renderToScreen = true;
                // composer.addPass( copyPass );

                Web3DBins.prototype.onWindowResize();

                /*renderr();
	function renderr(){
		requestAnimationFrame(renderr);
		renderer.render(scene,camera);
	}*/

                //重置窗口尺寸刷新函数
                //注：涉及渲染器操作，函数接口不应该暴露，所以放在内部
                /*function onWindowResize() {

        // SCREEN_WIDTH = window.innerWidth;
        // SCREEN_HEIGHT = window.innerHeight;
        // SCREEN_WIDTH = renderer.domElement.width;
        // SCREEN_HEIGHT = renderer.domElement.height;
        SCREEN_WIDTH = containerElement.clientWidth;
        SCREEN_HEIGHT = containerElement.clientHeight;
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();
        renderer.render( scene, camera );
        //composer.render();
    };*/
            },

            /**
             * 容器大小变化事件
             */
            onWindowResize: function () {
                // SCREEN_WIDTH = window.innerWidth;
                // SCREEN_HEIGHT = window.innerHeight;
                // SCREEN_WIDTH = renderer.domElement.width;
                // SCREEN_HEIGHT = renderer.domElement.height;
                SCREEN_WIDTH = containerElement.clientWidth;
                SCREEN_HEIGHT = containerElement.clientHeight;
                renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
                camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
                camera.updateProjectionMatrix();
                renderer.render(scene, camera);
                //composer.render();
            },

            /*modelShine: function(name,callback){
	var tmp = scene.getObjectByName(name);
	var i=0;
	function rendert(){
        if(i==10){
        if(callback!=undefined)callback();
        return;
        }
        i++;
        setTimeout(rendert,300);
		tmp.visible=!tmp.visible;
		renderer.render(scene,camera);
	}
	rendert();
},*/
            /**
             * 放大镜功能
             * @param data 1.为number值进行缩放 2.为object值时进行放大镜开关
             */
            magnifier: function (data) {
                var j = typeof data;
                if (j == "number" && magnifierCamera != null) {
                    magnifierControl.zoomAndUpdate(data);
                    zoomScale *= data;
                }
                else if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (data.power == 1 || ( data.power == 2 && interruptionState === null )) {
                        if (magnifierCamera == null) {
                            Web3DBins.prototype.setInterruptionState("magnifier");
                            Web3DBins.prototype.setControlsState(false);
                            renderer.domElement.style.cursor = "crosshair";
                            setMagnifier();
                            magnifierControl.addEventListener('change', Web3DBins.prototype.magnifierrenderanimate);
                            renderer.domElement.addEventListener('mousedown', Web3DBins.prototype.maginifierDown);
                            renderer.domElement.addEventListener('mouseup', Web3DBins.prototype.maginifierUp);
                        }
                    }
                    else if (data.power == 0 || ( data.power == 2 && interruptionState === "magnifier")) {
                        Web3DBins.prototype.setControlsState(true);
                        renderer.domElement.style.cursor = "default";
                        Web3DBins.prototype.setInterruptionState(null);
                        magnifierControl.removeEventListener('change', Web3DBins.prototype.magnifierrenderanimate);
                        renderer.domElement.removeEventListener('mousedown', Web3DBins.prototype.maginifierUp);
                        renderer.domElement.removeEventListener('mouseup', Web3DBins.prototype.maginifierDown);
                        disposeMagnifier();
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

                function setMagnifier() {
                    magnifierRender = new THREE.WebGLRenderer({
                        antialias: true,       //是否开启反锯齿
                        precision: "highp",    //着色精度选择
                        alpha: true,          //是否可以设置背景色透明
                    });
                    zoomScale = data.scale;
                    magnifierContainerElement = document.getElementById(data.elementID);
                    magnifierCamera = camera.clone();
                    magnifierCamera.targetqs = new THREE.Vector3();
                    magnifierCamera.targetqs.copy(camera.targetqs);
                    magnifierContainerElement.appendChild(magnifierRender.domElement);
                    magnifierRender.setSize(magnifierContainerElement.clientWidth, magnifierContainerElement.clientHeight);
                    magnifierRender.setPixelRatio(window.devicePixelRatio);
                    magnifierControl = new THREE.OrbitControls(magnifierCamera, magnifierRender.domElement);
                    magnifierControl.minDistance = 2;
                    //THREE.OrbitControls.prototype.controlType=1;
                    //magnifierControl.updateControlType();
                    //magnifierControl.rotateLeftEnable=false;
                    magnifierControl.enabled = false;
                    for (var n in magnifierRender.domElement.style) {
                        magnifierRender.domElement.style[n] = magnifierContainerElement.style[n];
                    }
                };

                function disposeMagnifier() {
                    magnifierContainerElement.removeChild(magnifierRender.domElement);
                    magnifierControl.dispose();
                    magnifierContainerElement = null;
                    magnifierControl = null;
                    magnifierCamera = null;
                    magnifierRender.forceContextLoss();
                    magnifierRender.context = null;
                    magnifierRender.domElement = null;
                    magnifierRender.dispose();
                    magnifierRender = null;
                };
            },

            /**
             * 放大镜渲染函数（内部接口）
             */
            magnifierrenderanimate: function () {
                requestAnimationFrame(render);

                function render() {
                    magnifierRender.render(scene, magnifierCamera);
                }
            },

            /**
             * 放大镜鼠标松开监听（内部接口）
             */
            maginifierUp: function (event) {
                renderer.domElement.removeEventListener('mousemove', Web3DBins.prototype.getMaginifier);
            },

            /**
             * 放大镜鼠标按下监听（内部接口）
             */
            maginifierDown: function (event) {//内部函数，放大镜点击监听
                Web3DBins.prototype.getMaginifier(event);
                renderer.domElement.addEventListener('mousemove', Web3DBins.prototype.getMaginifier);

            },

            /**
             * 放大镜设置相机数据（内部接口）
             */
            getMaginifier: function (event) {
                mouse.x = ( event.offsetX / renderer.domElement.width ) * 2 - 1;
                mouse.y = -( event.offsetY / renderer.domElement.height ) * 2 + 1;
                var raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);
                var intersects = raycaster.intersectObjects(scene.children);
                if (intersects.length > 0) {
                    //magnifierCamera.copy(camera);
                    /*var q=new THREE.Vector3();
        magnifierCamera.getWorldPosition(q);
        var camreaToTarget=q.distanceTo(magnifierCamera.targetqs);
        magnifierControl.maxDistance=camreaToTarget;
        magnifierControl.minDistance=2;*/
                    var p = intersects[0].point;
                    magnifierControl.reset();
                    magnifierCamera.position.x += (p.x - magnifierCamera.targetqs.x);
                    magnifierCamera.position.y += (p.y - magnifierCamera.targetqs.y);
                    magnifierCamera.position.z += (p.z - magnifierCamera.targetqs.z);
                    //magnifierCamera.lookAt(p);
                    magnifierCamera.targetqs.copy(p);
                    //magnifierControl.update();
                    magnifierControl.zoomAndUpdate(zoomScale);
                    //zoomScale=1;
                    //magnifierRender.render(scene,magnifierCamera);
                }
            },

            /**
             * 模型自动旋转
             * @param data object对象 {power:0-关,1-开,angle:每一帧旋转角度}
             */
            rotateSelf: function (data) {
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (data.power != 1 && data.power != 0) {
                        return;
                    }
                    else {
                        var anglePerFrame = data.angle !== undefined ? data.angle : 1.0;
                        rotateSelfFlag = data.power;
                        if (rotateSelfFlag == 1) {
                            animate();
                        }
                    }

                }
                else {
                    console.warn('Web3DBins.accelerometer:interruption ' + interruptionState + ' is enable.');
                }

                function animate() {
                    if (rotateSelfFlag == 0) {
                        return;
                    }
                    requestAnimationFrame(animate);
                    if (typeof(controls) !== "undefined") {//防止初始化异步带来的问题
                        Web3DBins.prototype.rotateFrame(anglePerFrame);
                    }
                };
            },

            /**
             * 传入模型到场景
             * @param modelData 模型数据
             * @param callback 回调函数
             */
            chooseModel: function (modelData, callback) {
                //version 1.5
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    var xmlhttp;
                    var id = new Date().getTime();
                    if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
                    else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                    xmlhttp.onreadystatechange = function () {
                        var date;
                        if (xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                var reponseStr = xmlhttp.responseText;
                                reponseStr.replace("\\", "");
                                reponseStr = reponseStr.split("\"")[3];
                                reponseStr = reponseStr.replace("-", "/");
                                reponseStr = reponseStr.replace("-", "/");
                                date = new Date(reponseStr);
                            }
                            else date = new Date();
                            modelParseTime.m2 = date.getMinutes();
                            modelParseTime.h = date.getHours();
                            modelParseTime.year = date.getFullYear();
                            modelParseTime.mouth = date.getMonth() + 1;
                            modelParseTime.day = date.getDate();
                            if (modelParseTime.day < 10) modelParseTime.day = "0" + modelParseTime.day;
                            loadSurveillance[id] = new Object();
                            var modellist = modelData.modelList;
                            var modelSLength = modellist.length;
                            loadSurveillance[id].chooseMeshLength = modelSLength;
                            loadSurveillance[id].meshLength = 0;
                            loadSurveillance[id].meshLoadStatue = "start";
                            loadSurveillance[id].meshBlendNum = 0;
                            loadSurveillance[id].meshBlendLoadNum = 0;
                            loadSurveillance[id].pictureLoadNum = 0;
                            loadSurveillance[id].pictureNum = 0;
                            for (var n = 0; n < modelSLength; n++) {
                                if (modellist[n].projectionIn !== undefined && modellist[n].projectionIn !== null) {
                                    loadSurveillance[id].meshBlendNum += modellist[n].projectionIn.length;
                                }
                            }
                            for (var mlt = 0; mlt < modelSLength; mlt++) {
                                var json = modellist[mlt];
                                Model(json, callback);
                            }
                        }
                    }
                    xmlhttp.open("GET", "http://quan.suning.com/getSysTime.do", true);
                    xmlhttp.send();

                }
                else {
                    console.warn('Web3DBins.chooseModel:interruption ' + interruptionState + ' is enable.');
                }

                //单模型创建函数
                //注：涉及内部数据，函数接口不应该暴露，所以放在内部
                function Model(modelData, callback) {
                    var json = modelData;
                    var mtls = json.mtls;
                    var projectionInConter = 0;
                    var extnedMaterial = new Object();
                    var matertemp;
                    if (mtls == undefined || mtls == null || mtls == "" || mtls.length == 0) {
                        matertemp = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
                    }
                    else {
                        var materials = new Array(mtls.length);
                        for (var i = 0; i < mtls.length; i++) {
                            var materialCreator = new Object();
                            materialCreator["DbgIndex"] = mtls[i].materiaIndex;
                            materialCreator["DbgName"] = mtls[i].materialName;
                            var extendAttributeList = mtls[i].extendAttributeList;
                            var attributeList = mtls[i].attributeList;
                            for (var x = 0; x < attributeList.length; x++) {
                                var valueType = attributeList[x].attributeValueType;
                                var valueName = attributeList[x].attributeName;
                                var value = attributeList[x].attributeValue;
                                if (!value) continue;
                                switch (valueType) {
                                    case "NUM":
                                        materialCreator[valueName] = parseFloat(value);
                                        break;
                                    case "STR":
                                        materialCreator[valueName] = value;
                                        break;
                                    case "BOOL":
                                        if (value == "1") {
                                            materialCreator[valueName] = true;
                                        }
                                        else if (value == "0") {
                                            materialCreator[valueName] = false;
                                        }
                                        else {
                                            console.error('Web3DBins.chooseModel: Unsupported', name, value);
                                        }
                                        break;
                                    case "ARR":
                                        materialCreator[valueName] = Web3DBins.prototype.splitArr(value);
                                        break;
                                    default:
                                        console.error('Web3DBins.chooseModel: Unsupported', name, value);
                                        break;
                                }
                            }
                            materials[mtls[i].materiaIndex] = materialCreator;
                        }
                        //var matertemp = THREE.Loader.prototype.initMaterials( materials, "", this.crossOrigin );
                        //version 1.5
                        matertemp = Web3DBins.prototype.initMaterials(materials, "", "Anonymous", function () {
                            if (loadSurveillance[id].meshLoadStatue == "over") {
                                renderer.domElement.style.visibility = "";
                                Web3DBins.prototype.cameraCompute();
                                renderer.render(scene, camera);
                                Web3DBins.prototype.goCallback(id);
                            }
                            //composer.render();
                        }, id);
                    }

                    if (meshMap[json.sceneName] == undefined) {//未创立此部件组（相同场景名）
                        if (geometryGroup.get(json.assemblyCode) != undefined) {//已缓存几何体
                            changeMesh(geometryGroup.get(json.assemblyCode), callback);
                        } else {//未缓存几何体
                            if (json.decalAreaGroup != undefined) {
                                for (var n in json.decalAreaGroup) {
                                    var dec = json.decalAreaGroup[n];
                                    var areas = dec.decalArea;
                                    meshDecalAreaMap.set(json.assemblyCode + dec.areaOrder, {
                                        "decalArea": areas,
                                        //"assemblyUVMappingSRC":json.assemblyUVMapping,
                                        "assemblyUVMapping": null,
                                        "areaRotation": dec.areaRotation != undefined && dec.areaRotation != null ? parseFloat(dec.areaRotation) / 180 * Math.PI : 0,
                                        "areaCenter": new THREE.Vector2((parseFloat(areas.minX) + parseFloat(areas.maxX)) / 2, (parseFloat(areas.minY) + parseFloat(areas.maxY)) / 2),
                                        //"decalType":dec.decalType!=undefined&&dec.decalType!=null?dec.decalType:0,
                                        "textLimit": dec.textLimit != undefined && dec.textLimit != null ? parseInt(dec.textLimit) : 1000
                                    });
                                }
                            }
                            loadGeo(json.modelPath, function (geometry) {
                                geometry.faceVertexUvs[1] = geometry.faceVertexUvs[0];//--------------
                                //var tmpBuffer=new THREE.BufferGeometry().fromGeometry( geometry );
                                geometryGroup.set(json.assemblyCode, geometry);
                                changeMesh(geometry, callback);
                            });
                        }
                    }
                    else {//已创立此部件组（相同场景名）
                        if (meshMap[json.sceneName].name == json.assemblyCode) {//与场景中展示属同一部件
                            Web3DBins.prototype.cacheClear(meshMap[json.sceneName]);
                            meshMap[json.sceneName].material = matertemp;
                            //投射阴影
                            if (json.projectionIn !== undefined && json.projectionIn !== null) {
                                for (var i = 0; i < json.projectionIn.length; i++) {
                                    addReceiveShadow(geometryGroup.get(json.assemblyCode), json.projectionIn[i]);
                                }
                                ;
                            }
                            finishedAssembly(callback);//模型计数加一
                            //执行单帧渲染
                            //renderer.render( scene, camera );
                            //composer.render();
                        }
                        else {//新部件
                            scene.remove(meshMap[json.sceneName]);
                            Web3DBins.prototype.cacheClear(meshMap[json.sceneName]);
                            if (geometryGroup.get(json.assemblyCode) != undefined) {
                                changeMesh(geometryGroup.get(json.assemblyCode), callback);
                            }
                            else {
                                if (json.decalAreaGroup != undefined) {
                                    for (var n in json.decalAreaGroup) {
                                        var dec = json.decalAreaGroup[n];
                                        var areas = dec.decalArea;
                                        meshDecalAreaMap.set(json.assemblyCode + dec.areaOrder, {
                                            "decalArea": areas,
                                            //"assemblyUVMappingSRC":json.assemblyUVMapping,
                                            "assemblyUVMapping": null,
                                            "areaRotation": dec.areaRotation != undefined && dec.areaRotation != null ? parseFloat(dec.areaRotation) / 180 * Math.PI : 0,
                                            "areaCenter": new THREE.Vector2((parseFloat(areas.minX) + parseFloat(areas.maxX)) / 2, (parseFloat(areas.minY) + parseFloat(areas.maxY)) / 2),
                                            //"decalType":dec.decalType!=undefined&&dec.decalType!=null?dec.decalType:0
                                            "textLimit": dec.textLimit != undefined && dec.textLimit != null ? parseInt(dec.textLimit) : 1000
                                        });
                                    }
                                }
                                loadGeo(json.modelPath, function (geometry) {
                                    geometry.faceVertexUvs[1] = geometry.faceVertexUvs[0];//--------------
                                    //var tmpBuffer=new THREE.BufferGeometry().fromGeometry( geometry );
                                    geometryGroup.set(json.assemblyCode, geometry);
                                    changeMesh(geometry, callback);
                                });
                            }
                        }
                    }

                    //更换模型函数
                    //注：涉及内部数据，函数接口不应该暴露，所以放在内部
                    function changeMesh(geometrys, callback) {
                        var mesh = new THREE.Mesh(geometrys, matertemp);
                        //var mesh=new THREE.Mesh(geometrys,UVMaterial);

                        if (cameraComputeJudge && !mesh.geometry.centers) {
                            var center = new THREE.Vector3();
                            mesh.geometry.computeBoundingBox();
                            mesh.geometry.boundingBox.getCenter(center);
                            //mesh.geometry.centerChange = true;
                            mesh.geometry.center();
                            mesh.geometry.centers = center;
                            mesh.centers = center;
                            mesh.position.copy(center);
                        }
                        if (json.modelPosition != undefined && json.modelPosition != null) {
                            var dataIntArr = Web3DBins.prototype.splitArr(json.modelPosition);
                            if (!cameraComputeJudge) mesh.position.set(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                            else if (mesh.geometry.centers) {
                                mesh.position.copy(mesh.geometry.centers);
                                mesh.position.x += dataIntArr[0];
                                mesh.position.y += dataIntArr[1];
                                mesh.position.z += dataIntArr[2];
                            }
                            else {
                                mesh.position.x += dataIntArr[0];
                                mesh.position.y += dataIntArr[1];
                                mesh.position.z += dataIntArr[2];
                                //(new THREE.Vector3(dataIntArr[0],dataIntArr[1],dataIntArr[2]));
                            }
                        }

                        if (json.modelRotation != undefined && json.modelRotation != null) {
                            dataIntArr = Web3DBins.prototype.splitArr(json.modelRotation);
                            //mesh.rotation.set(Math.PI*dataIntArr[0],Math.PI*dataIntArr[1],Math.PI*dataIntArr[2]);
                            mesh.rotation.set(dataIntArr[0] / 180 * Math.PI, dataIntArr[1] / 180 * Math.PI, dataIntArr[2] / 180 * Math.PI);
                        }

                        if (json.modelScale != undefined && json.modelScale != null) {
                            dataIntArr = Web3DBins.prototype.splitArr(json.modelScale);
                            mesh.scale.set(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                        }
                        if (json.assemblyUVMapping != undefined && json.assemblyUVMapping != null) {
                            mesh.assemblyUVMappingSRC = json.assemblyUVMapping;
                        }

                        mesh.name = json.assemblyCode;
                        meshMap[json.sceneName] = mesh;
                        scene.add(mesh);

                        //投射阴影
                        if (json.projectionIn !== undefined && json.projectionIn !== null) {
                            for (var i = 0; i < json.projectionIn.length; i++) {
                                addReceiveShadow(geometrys, json.projectionIn[i]);
                            }
                            ;
                        }

                        //单部件加载完毕执行统计与回调
                        finishedAssembly(callback);
                    };

                    //
                    function addReceiveShadow(geometry, projectionIn) {
                        var shSceneName = json.sceneName + "_" + projectionIn.sceneName;
                        var shSaveName = json.assemblyCode + "_" + projectionIn.assemblyCode;

                        if (blendMap.get(shSceneName) !== undefined) {//场景中已经存在该场景名则替换
                            if (receiveShadows.get(shSaveName) !== undefined) {//已缓存
                                scene.remove(blendMap.get(shSceneName));
                                Web3DBins.prototype.cacheClear(blendMap.get(shSceneName));
                                scene.add(receiveShadows.get(shSaveName));
                                blendMap.set(shSceneName, receiveShadows.get(shSaveName));
                                projectionConter();
                            }
                            else {//未缓存
                                loadreceiveShadow(shSceneName, geometry, projectionIn.picturePath, function (shadowmesh) {
                                    receiveShadows.set(shSaveName, shadowmesh);
                                    scene.remove(blendMap.get(shSceneName));
                                    Web3DBins.prototype.cacheClear(blendMap.get(shSceneName));
                                    scene.add(shadowmesh);
                                    blendMap.set(shSceneName, shadowmesh);
                                    projectionConter();
                                });
                                //
                            }
                        }
                        else {//场景中不存在则添加
                            if (receiveShadows.get(shSaveName) !== undefined) {//已缓存
                                scene.add(receiveShadows.get(shSaveName));
                                blendMap.set(shSceneName, receiveShadows.get(shSaveName));
                                projectionConter();
                            }
                            else {//未缓存
                                loadreceiveShadow(shSceneName, geometry, projectionIn.picturePath, function (shadowmesh) {
                                    receiveShadows.set(shSaveName, shadowmesh);
                                    scene.add(shadowmesh);
                                    blendMap.set(shSceneName, shadowmesh);
                                    projectionConter();
                                });
                            }
                        }
                    };

                    //version 1.5
                    function projectionConter() {
                        /*projectionInConter ++;
            if( projectionInConter == json.projectionIn.length ){
                //执行单帧渲染
                renderer.render( scene, camera );
                //composer.render();
            }*/
                        loadSurveillance[id].meshBlendLoadNum += 1;
                        var Surveillance = loadSurveillance[id];
                        if (Surveillance.meshLength == Surveillance.chooseMeshLength && Surveillance.meshBlendLoadNum == Surveillance.meshBlendNum) {
                            //执行单帧渲染
                            Surveillance.meshLoadStatue = "over";
                            if (Surveillance.pictureLoadNum == Surveillance.pictureNum) {
                                Web3DBins.prototype.cameraCompute();
                                renderer.domElement.style.visibility = "";
                                renderer.render(scene, camera);
                                Web3DBins.prototype.goCallback(id);
                                //alert("render");
                            }
                        }
                    };

                    function loadreceiveShadow(shSceneName, geometry, picturePath, callback) {
                        var textureLoader = new THREE.TextureLoader();
                        textureLoader.load(picturePath, function (currentMaps) {
                            var shadowmaterial = new THREE.MeshLambertMaterial({map: currentMaps});
                            shadowmaterial.transparent = true;
                            var blending = "MultiplyBlending";
                            shadowmaterial.blending = THREE[blending];
                            shadowmaterial.blendEquation = THREE.MaxEquatxion;
                            var shadowmesh = new THREE.Mesh(geometry, shadowmaterial);
                            shadowmesh.name = shSceneName;
                            var selfMesh = meshMap[json.sceneName];
                            shadowmesh.position.copy(selfMesh.position);
                            shadowmesh.updateMatrix();
                            callback(shadowmesh);
                        });
                    };

                    //执行加载统计与回调
                    function finishedAssembly(callback) {

                        var returnObj = {
                            loadCount: 0,
                            sceneName: json.sceneName
                        };

                        //计算更换数量
                        var Surveillance = loadSurveillance[id];
                        Surveillance.meshLength = Surveillance.meshLength + 1;
                        returnObj.loadCount = Surveillance.meshLength;

                        //执行回调函数
                        if (callback != undefined) {
                            //callback(json.sceneName,returnObj);
                            if (Surveillance.meshLength == Surveillance.chooseMeshLength) {
                                Surveillance.totalCallback = callback;
                                Surveillance.totalObj = returnObj;
                            }
                            else callback(returnObj);
                        }
                        //renderer.domElement.style.visibility="hidden";
                        //console.log(2);
                        renderer.render(scene, camera, RenderTarget);
                        //renderer.render(scene,camera);
                        //renderer.compile(scene,camera);
                        //更换结束
                        if (Surveillance.meshLength == Surveillance.chooseMeshLength && Surveillance.meshBlendLoadNum == Surveillance.meshBlendNum) {
                            //执行单帧渲染
                            Surveillance.meshLoadStatue = "over";
                            if (Surveillance.pictureLoadNum == Surveillance.pictureNum) {
                                Web3DBins.prototype.cameraCompute();
                                renderer.domElement.style.visibility = "";
                                renderer.render(scene, camera);
                                Web3DBins.prototype.goCallback(id);
                            }
                            //composer.render();
                        }

                        // renderer.render( scene, camera );
                        // //composer.render();
                    };

                    //获取几何体函数
                    function loadGeo(binPath, callback) {
                        //var loader = new THREE.BinaryLoader();
                        //var bufferLoader = new THREE.FileLoader( loader.manager );
                        var bufferLoader = new THREE.FileLoader(THREE.DefaultLoadingManager);
                        bufferLoader.setResponseType('arraybuffer');
                        bufferLoader.load(filePrefix + binPath + fileSuffix, function (bufData) {
                            //loader.parse( bufData, callback, "", [] );
                            Web3DBins.prototype.modelParseqs(bufData, callback, "", [], json.modelHash, json.modelCode);
                        });
                    };
                };
            },

            /**
             * 修改印绣花区域
             * @param data 区域信息
             * @param callback 回调函数
             */
            changeMeshDecalArea: function (data, callback) {
                var tmp = meshDecalAreaMap.get(data.assemblyCode + data.areaOrder);
                if (tmp.areaMesh) {
                    Web3DBins.prototype.cacheClear(tmp.areaMesh);
                }
                var center = tmp.areaCenter;
                var areas = data.decalArea;
                areas.maxX = parseFloat(areas.maxX);
                areas.maxY = parseFloat(areas.maxY);
                areas.minX = parseFloat(areas.minX);
                areas.minY = parseFloat(areas.minY);
                var sceneName;
                for (var n in meshMap) {
                    if (meshMap[n].name == data.assemblyCode) {
                        sceneName = n;
                    }
                }
                var newCenter = new THREE.Vector2((parseFloat(areas.minX) + parseFloat(areas.maxX)) / 2, (parseFloat(areas.minY) + parseFloat(areas.maxY)) / 2);
                meshDecalAreaMap.set(data.assemblyCode + data.areaOrder, {
                    "decalArea": areas,
                    //"assemblyUVMappingSRC":json.assemblyUVMapping,
                    "assemblyUVMapping": null,
                    "areaRotation": data.areaRotation != undefined && data.areaRotation != null ? parseFloat(data.areaRotation) / 180 * Math.PI : 0,
                    "areaCenter": newCenter,
                    "textLimit": data.textLimit != undefined && data.textLimit != null ? parseInt(data.textLimit) : 1000
                });
                var offsetX = newCenter.x - center.x, offsetY = newCenter.y - center.y;
                var changeGroup = new Array();
                decalMeshs.forEach(function (decal, index, arr) {
                    //console.log(data);
                    if (decal.assemblySceneName == sceneName && decal.areaOrder == data.areaOrder) {
                        decal.decalID = decal.sceneName;
                        decal.worldPosition = null;
                        decal.UVPosition.x += offsetX, decal.UVPosition.y += offsetY;
                        changeGroup.push(decal);
                    }
                });

                var addCount = 0;
                var changeLength = changeGroup.length;
                changeDecal();

                //Web3DBins.prototype.createDecalArea(1,sceneName,undefined,undefined,undefined,undefined,data.areaOrder);

                function changeDecal() {
                    if (changeLength > 0) {
                        Web3DBins.prototype.addDecalPic(changeGroup[0], add);
                    }
                    else if (callback) {
                        callback();
                    }
                }

                function add() {
                    addCount += 1;
                    if (changeGroup[addCount]) {
                        Web3DBins.prototype.addDecalPic(changeGroup[addCount], add);
                    }
                    else if (callback) {
                        callback();
                    }
                }
            },

            /**
             * 添加印绣花区域
             * @param data 区域信息
             */
            addMeshDecalArea: function (data) {
                var areas = data.decalArea;
                areas.maxX = parseFloat(areas.maxX);
                areas.maxY = parseFloat(areas.maxY);
                areas.minX = parseFloat(areas.minX);
                areas.minY = parseFloat(areas.minY);
                meshDecalAreaMap.set(data.assemblyCode + data.areaOrder, {
                    "decalArea": areas,
                    //"assemblyUVMappingSRC":json.assemblyUVMapping,
                    "assemblyUVMapping": null,
                    "areaRotation": data.areaRotation != undefined && data.areaRotation != null ? parseFloat(data.areaRotation) / 180 * Math.PI : 0,
                    "areaCenter": new THREE.Vector2((parseFloat(areas.minX) + parseFloat(areas.maxX)) / 2, (parseFloat(areas.minY) + parseFloat(areas.maxY)) / 2),
                    "textLimit": data.textLimit != undefined && data.textLimit != null ? parseInt(data.textLimit) : 1000
                });
            },

            /**
             * 删除印绣花区域
             * @param data 区域信息
             */
            deleteMeshDecalArea: function (data) {
                var deleteArea = meshDecalAreaMap.get(data.assemblyCode + data.areaOrder);
                if (deleteArea.areaMesh) {
                    Web3DBins.prototype.cacheClear(deleteArea);
                }
                delete meshDecalAreaMap[data.assemblyCode + data.areaOrder];
                meshDecalAreaMap.delete(data.assemblyCode + data.areaOrder);
            },

            /**
             * 删除场景中的模型
             * @param sceneName 模型的名称
             */
            deleteMesh: function (sceneName) {
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (meshMap[sceneName] != undefined) {
                        scene.remove(meshMap[sceneName]);
                        Web3DBins.prototype.cacheClear(meshMap[sceneName]);
                        delete meshMap[sceneName];
                        Web3DBins.prototype.renderanimate();
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }
            },

            /**
             * 模型材质修改接口
             * @param data 要修改的材质信息
             * @param callback 回调函数
             */
            prototypeOperate: function (data, callback) {//
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (meshMap[data.sceneName] != undefined) {
                        if (meshMap[data.sceneName].material instanceof Array) {
                            for (var n in meshMap[data.sceneName].material) {
                                var tmp = meshMap[data.sceneName].material[n];
                                if (tmp.name == data.materialName) {
                                    setPrototype(tmp, parseInt(n));
                                    return;
                                }
                            }
                            console.warn("material " + data.materialName + " is not exist");
                        }
                        else {
                            setPrototype(meshMap[data.sceneName].material);
                        }
                    }
                    else {
                        console.warn("sceneName " + data.sceneName + " is undefind");
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

                function setPrototype(material, materiaIndex) {
                    if (data.type == "colorDiffuse") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.color.setRGB(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                    }
                    else if (data.type == "emissive") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.emissive.setRGB(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                    }
                    else if (data.type == "colorSpecular") {
                        if (material.type != "meshPhongMaterial") {
                            console.warn(material.type + " not support speuclar");
                            return;
                        }
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.specular.setRGB(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                    }
                    else if (data.type == "doubleSided") {
                        if (parseFloat(data.value) == 1) material.side = 2;
                        else material.side = 0;
                    }
                    else if (data.type == "transparent") {
                        material.transparent = Boolean(parseFloat(data.value));
                    }
                    else if (data.type == "opacity") {
                        material.opacity = parseFloat(data.value);
                    }
                    else if (data.type == "mapDiffuseRepeat") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.map.repeat.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapDiffuseOffset") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.map.offset.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapDiffuseRotation") {
                        material.map.rotation = parseFloat(data.value) / 180 * Math.PI;
                    }
                    else if (data.type == "mapSpecularRepeat") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.specularMap.repeat.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapSpecularOffset") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.specularMap.offset.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapSpecularRotation") {
                        material.specularMap.rotation = parseFloat(data.value) / 180 * Math.PI;
                    }
                    else if (data.type == "mapBumpRepeat") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.bumpMap.repeat.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapBumpOffset") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.bumpMap.offset.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapBumpRotation") {
                        material.bumpMap.rotation = parseFloat(data.value) / 180 * Math.PI;
                    }
                    else if (data.type == "mapAlphaRepeat") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.alphaMap.repeat.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapAlphaOffset") {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.alphaMap.offset.set(dataIntArr[0], dataIntArr[1]);
                    }
                    else if (data.type == "mapAlphaRotation") {
                        material.alphaMap.rotation = parseFloat(data.value) / 180 * Math.PI;
                    }
                    else if (data.type == "mapBumpScale") {
                        material.bumpScale = parseFloat(data.value);
                    }
                    else if (data.type == "roughness") {
                        if (material.type != "MeshStandardMaterial") return;
                        material.roughness = parseFloat(data.value);
                    }
                    else if (data.type == "metalness") {
                        if (material.type != "MeshStandardMaterial") return;
                        material.metalness = parseFloat(data.value);
                    }
                    else if (data.type == "emissiveIntensity") {
                        material.emissiveIntensity = parseFloat(data.value);
                    }
                    else if (data.type == "shading") {
                        if (data.value == "basic") {
                            if (material.type == "MeshBasicMaterial") return;
                            var tmp = new THREE.MeshBasicMaterial();
                            clonePrototype(tmp, material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex] = tmp;
                        }
                        else if (data.value == "phong") {
                            if (material.type == "MeshPhongMaterial") return;
                            var tmp = new THREE.MeshPhongMaterial();
                            clonePrototype(tmp, material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex] = tmp;
                        }
                        else if (data.value == "standard") {
                            if (material.type == "MeshStandardMaterial") return;
                            var tmp = new THREE.MeshStandardMaterial();
                            clonePrototype(tmp, material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex] = tmp;
                        }
                        else if (data.value == "lambert") {
                            if (material.type == "MeshLambertMaterial") return;
                            var tmp = new THREE.MeshLambertMaterial();
                            clonePrototype(tmp, material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex] = tmp;
                        }
                    }
                    if (callback != undefined) {
                        callback();
                    }
                    Web3DBins.prototype.renderanimate();
                }

                function clonePrototype(materialA, materialB) {
                    materialA.color.copy(materialB.color);
                    if (materialB.map != null && materialB.map != undefined) materialA.map = materialB.map;
                    if (materialB.aoMap != null && materialB.aoMap != undefined) materialA.aoMap = materialB.aoMap;
                    if (materialB.bumpMap != null && materialB.bumpMap != undefined) materialA.bumpMap = materialB.bumpMap;
                    if (materialB.bumpScale != null && materialB.bumpScale != undefined) materialA.bumpScale = materialB.bumpScale;
                    if (materialB.normalMap != null && materialB.normalMap != undefined) materialA.normalMap = materialB.normalMap;
                    if (materialB.normalScale != null && materialB.normalScale != undefined) materialA.normalScale = materialB.normalScale;
                    if (materialB.alphaMap != null && materialB.alphaMap != undefined) materialA.alphaMap = materialB.alphaMap;
                    materialA.opacity = materialB.opacity;
                    materialA.side = materialB.side;
                    materialA.transparent = materialB.transparent;
                    if (materialB.specularMap != undefined && materialA.type != "MeshStandardMaterial") materialA.specularMap = materialB.specularMap;
                    materialA.name = materialB.name;
                    materialA.needsUpdate = true;
                }
            },

            /**
             * 贴图修改接口
             * @param data 要修改的贴图信息
             * @param callback 回调函数
             */
            textureOperate: function (data, callback) {
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (meshMap[data.sceneName] != undefined) {
                        if (meshMap[data.sceneName].material instanceof Array) {
                            for (var n in meshMap[data.sceneName].material) {
                                var tmp = meshMap[data.sceneName].material[n];
                                if (tmp.name == data.materialName) {
                                    setTextures(tmp, callback);
                                    return;
                                }
                            }
                            console.warn("material " + data.materialName + " is not exist");
                        }
                        else {
                            setTextures(meshMap[data.sceneName].material, callback);
                        }
                    }
                    else {
                        console.warn("sceneName " + data.sceneName + " is undefind");
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

                function setTextures(material, callback) {
                    var tmpMap;
                    if (data.textureType == "mapDiffuse") tmpMap = "map";
                    else if (data.textureType == "mapAO") tmpMap = "aomap";
                    else if (data.textureType == "mapEmissive") tmpMap = "emissiveMap";
                    else if (data.textureType == "mapSpecular") tmpMap = "specularMap";
                    else if (data.textureType == "mapBump") tmpMap = "bumpMap";
                    else if (data.textureType == "mapAlpha") {
                        tmpMap = "alphaMap";
                        material.transparent = true;
                    }
                    else {
                        console.warn(data.textureType + " :is not support");
                        return;
                    }
                    if (data.texturePath == null || data.texturePath == "null") {
                        if (material[tmpMap] != null) material[tmpMap].dispose();
                        material[tmpMap] = null;
                        renderAndCallback(material, callback);
                    }
                    else {
                        var textureLoader = new THREE.TextureLoader();
                        textureLoader.setCrossOrigin("");
                        textureLoader.load(data.texturePath, function (texture) {
                            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                            if (material[tmpMap] != undefined && material[tmpMap] != null) {
                                texture.offset.set(material[tmpMap].offset.x, material[tmpMap].offset.y);
                                texture.repeat.set(material[tmpMap].repeat.x, material[tmpMap].repeat.y);
                            }
                            if (material[tmpMap] != null) material[tmpMap].dispose();
                            material[tmpMap] = texture;
                            renderAndCallback(material, callback);

                        });
                    }
                }

                function renderAndCallback(material, callback) {
                    material.needsUpdate = true;
                    Web3DBins.prototype.renderanimate();
                    if (callback != undefined) callback();
                };
            },

            /**
             * 模型属性修改
             * @param data 要修改的模型信息
             */
            meshOperate: function (data) {
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (meshMap[data.sceneName] != undefined) {
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        if (data.type == "position") {
                            var tmp = meshMap[data.sceneName].geometry.centers;
                            meshMap[data.sceneName].position.set(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                        }
                        else if (data.type == "rotation") {
                            meshMap[data.sceneName].rotation.set(dataIntArr[0] / 180 * Math.PI, dataIntArr[1] / 180 * Math.PI, dataIntArr[2] / 180 * Math.PI);
                        }
                        else if (data.type == "scale") {
                            meshMap[data.sceneName].scale.set(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                        }
                        //cameraComputeJudge = 2;
                        //Web3DBins.prototype.cameraCompute();
                        Web3DBins.prototype.renderanimate();
                    }
                    else {
                        console.warn("sceneName " + data.sceneName + " is undefind");
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }
            },

            /**
             * 印字接口
             * @param data 印字信息
             * @param callback 回调函数
             */
            addDecalText: function (data, callback) {
                //var limit = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name+data.areaOrder).textLimit;
                var limit = 1000;
                var textGroup = document.createElement("div");
                textGroup.innerHTML = data.textstr;
                var canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1024;
                var ctx = canvas.getContext("2d");
                var ctxX = 0, ctxY = 0;
                var ycount = 0;
                var ysize = 0.8;
                var strCount = 0;
                for (var z = 0; z < textGroup.children.length; z++) {
                    var ele = textGroup.children[z]
                    var color = ele.style.color;
                    var fSize = parseInt(ele.style.fontSize);
                    var str = ele.innerHTML;
                    strCount += str.length;
                    if (strCount > limit) {
                        console.warn("the length of text is over the range");
                        return;
                    }
                    var fStyle = ele.style.fontFamily;
                    if (z == 0) ctxY = fSize / 1.2;
                    ctx.fillStyle = color;
                    ctx.font = fSize + "px " + fStyle;
                    for (var i = 0; i < str.length; i++) {
                        ctxX += ctx.measureText(str[i]).width;
                        if ((str[i] > 'a' && str[i] < 'z') || (str[i] > 'A' && str[i] < 'Z') || str.charCodeAt(i) > 255) ysize = 1.1;
                        if (ctxX > canvas.width) {
                            ycount += 1;
                            ctxY += fSize * ysize;
                            if (ctxY * 1.2 > ctxX) {
                                ctxY -= fSize * ysize;
                                break;
                            }
                            ysize = 0.8;
                            ctxX = ctx.measureText(str[i]).width;
                            lastSubStrIndex = i;
                            ctx.fillText(str[i], 0, ctxY);
                        }
                        else {
                            ctx.fillText(str[i], (ctxX - ctx.measureText(str[i]).width), ctxY);
                        }
                    }
                }
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                if (ycount == 0) {
                    canvas.height = canvas.width;
                    ctx.putImageData(imgData, (canvas.width - ctxX) / 2, (canvas.width - ctxY * 1.2) / 2);
                }
                else {
                    canvas.height = canvas.width;
                    ctx.putImageData(imgData, 0, (canvas.width - ctxY * 1.2) / 2);
                }
                data.decalImgSrc = canvas.toDataURL();
                data.dpi = 500;
                Web3DBins.prototype.addDecalPic(data, callback, data.textstr);
            },

            splitArr: function (inData) {//内部函数

                var inDataArr = inData.split(',');
                var outDataArr = [];
                inDataArr.forEach(function (data, index, arr) {
                    outDataArr.push(parseFloat(data));
                });
                return outDataArr;
            },

            /**
             * 模型闪烁接口
             * @param sceneName 模型名称
             * @param time 闪烁时间
             * @param color 闪烁颜色 （暂弃用）
             */
            shineAssembly: function (sceneName, time, color, callback) {

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) { //闪烁没完可以执行其他操作
                    Web3DBins.prototype.setInterruptionState("shine");
                    var shineTime = time !== undefined ? time : 2;
                    if (meshMap[sceneName] != undefined) {
                        //var tmpMaterial = meshMap[sceneName].material;
                        var material;
                        // if(tmpMaterial.constructor == Array){
                        // material = new Array();
                        // for(var n in tmpMaterial){
                        // var m = tmpMaterial[n].clone();
                        // m.opacity = 0.6;
                        // m.transparent = true;
                        // material.push(m);
                        // }
                        // }
                        // else{
                        // material = tmpMaterial.clone();
                        // material.opacity = 0.6;
                        // }
                        var c = color != undefined && color != null ? color : 0x111111;
                        material = new THREE.MeshBasicMaterial({
                            color: c,
                            specular: c,
                            emissive: c,
                            opacity: 0.15,
                            transparent: true
                        });
                        var clock = new THREE.Clock(true);
                        var count = 0;
                        //var newMaterial = material,
                        //var scale = new THREE.Vector3(1.00,1.00,1.00);
                        var copyMesh = meshMap[sceneName].clone();
                        copyMesh.material = material;
                        scene.add(copyMesh);
                        clock.start();
                        animate();

                        function animate() {
                            count++;
                            if (clock.getElapsedTime() > shineTime) {
                                //meshMap[sceneName].material = tmpMaterial;
                                //meshMap[sceneName].scale.set(1.0,1.0,1.0);
                                scene.remove(copyMesh);
                                Web3DBins.prototype.cacheClear(copyMesh);
                                renderer.render(scene, camera);
                                Web3DBins.prototype.setInterruptionState(null);
                                if (callback) callback();
                                return;
                            }
                            if (count == 30) {
                                copyMesh.visible = !copyMesh.visible;
                                // var x = newMaterial,y = new THREE.Vector3().copy(scale);
                                // newMaterial = meshMap[sceneName].material;
                                // scale.copy(meshMap[sceneName].scale);
                                // meshMap[sceneName].material = x;
                                //meshMap[sceneName].scale.copy(y);
                                count = 0;
                            }
                            requestAnimationFrame(animate);
                            renderer.render(scene, camera);
                            //composer.render();
                        };
                    }
                    else {
                        console.warn('sceneName ' + sceneName + ' is undefined.');
                    }
                }
                /*else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }*/
            },

            /**
             * 模型绝对旋转
             * @param angle 旋转角度
             */
            frameskip: function (angle) {

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    var tmp = controls.getAzimuthalAngle() - Math.PI + angle / 180 * Math.PI;
                    controls.rotateLeftByAngle(tmp);
                    for (var n = 0; n < lightControlsGroup.length; n++) {
                        lightControlsGroup[n].rotateLeftByAngle(tmp);
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

            },

            /**
             * 渲染接口（内部）
             * @param angle 旋转角度
             */
            renderanimate: function () {

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {

                    requestAnimationFrame(animate);

                    function animate() {
                        renderer.render(scene, camera);
                        //composer.render();
                    };

                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

            },

            /**
             * 模型相对旋转
             * @param angle 旋转角度
             */
            rotateFrame: function (angle) {

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {

                    controls.rotateLeftByAngle(angle / 180 * Math.PI);
                    for (var n = 0; n < lightControlsGroup.length; n++) {
                        lightControlsGroup[n].rotateLeftByAngle(angle / 180 * Math.PI);
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

            },

            /**
             * 模型旋转加缩放
             * @param angle 旋转角度
             * @param scale 缩放倍数
             */
            rotateAndZoom: function (angle, scale) {//
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    controls.zoomAndUpdate(scale);
                    controls.rotateLeftByAngle(angle / 180 * Math.PI);
                    for (var n in lightControlsGroup) {
                        lightControlsGroup[n].rotateLeftByAngle(angle / 180 * Math.PI);
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }
            },

            /**
             * 根据角度截屏
             * @param angle 旋转角度
             */
            getScreen: function (angle) {

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    angle = angle != undefined && angle != null ? angle : 0;
                    controls.saveState1();
                    for (var n = 0; n < lightControlsGroup.length; n++) {
                        lightControlsGroup[n].saveState1();
                    }

                    controls.reset();
                    for (var n = 0; n < lightControlsGroup.length; n++) {
                        lightControlsGroup[n].reset();
                    }
                    Web3DBins.prototype.rotateFrame(angle);
                    renderer.render(scene, camera);
                    //composer.render();
                    var strDataURI = renderer.domElement.toDataURL();

                    var w = renderer.domElement.width, h = renderer.domElement.height, z = 0;
                    var canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(renderer.domElement, 0, 0, w, h);
                    var data = ctx.getImageData(0, 0, w, h).data;
                    var left, top, bottom, right;
                    for (var col = 0; col < w; col++) {
                        for (var row = 0; row < h; row++) {
                            if (data[(col + row * w) * 4 + 3] != 0) {
                                left = col + 1;
                                break;
                            }
                        }
                    }
                    for (var col = w; col > 0; col--) {
                        for (var row = 0; row < h; row++) {
                            if (data[(col + row * w) * 4 + 3] != 0) {
                                right = col - 1;
                                break;
                            }
                        }
                    }
                    for (var row = 0; row < h; row++) {
                        for (var col = 0; col < w; col++) {
                            if (data[(col + row * w) * 4 + 3] != 0) {
                                top = row + 1;
                                break;
                            }
                        }
                    }
                    for (var row = h; row > 0; row--) {
                        for (var col = 0; col < w; col++) {
                            if (data[(col + row * w) * 4 + 3] != 0) {
                                bottom = row - 1;
                                break;
                            }
                        }
                    }
                    w = -right + left;
                    h = -bottom + top;
                    z = w > h ? w : h;
                    canvas.width = z;
                    canvas.height = z;
                    ctx.drawImage(renderer.domElement, right, bottom, w, h, (z - w) / 2, (z - h) / 2, w, h);
                    // z = w>h?w:h;
                    // canvas.width = z;
                    // canvas.height = z;
                    // var ctx = canvas.getContext("2d");
                    // ctx.drawImage(renderer.domElement,0,0,w,h,(z-w)/2,(z-h)/2,w,h);

                    controls.reset1();

                    for (var n = 0; n < lightControlsGroup.length; n++) {
                        lightControlsGroup[n].reset1();
                    }

                    return canvas.toDataURL();
                    //return strDataURI;

                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

            },

            /**
             * 重力感应接口
             * @param data 为object {accelerometerPower:1:开,0:关;speedRatio:旋转速度}
             */
            accelerometer: function (data) {//重力感应接口

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {

                    if (!window.DeviceOrientationEvent) {//检测
                        alert("对不起，您的浏览器还不支持Device Orientation!");
                    }
                    else if (data.accelerometerPower != 1 && data.accelerometerPower != 0) {
                        return;
                    }
                    else {
                        var speedRatio = data.speedRatio !== undefined ? data.speedRatio : 1.0;
                        accelerometerPowerFlag = data.accelerometerPower;
                        speed = 0.00;
                        if (accelerometerPowerFlag == 1) {
                            window.addEventListener('deviceorientation', rotate, false);
                            animate();
                        }
                        else {
                            window.removeEventListener('deviceorientation', rotate, false);
                        }
                    }

                }
                else {
                    console.warn('Web3DBins.accelerometer:interruption ' + interruptionState + ' is enable.');
                }

                function rotate(event) {
                    var gamma = event.gamma;
                    if (gamma > 10 || gamma < -10) {
                        speed = gamma * 0.1;
                    }
                    else {
                        speed = 0.0;
                    }
                };

                function animate() {
                    if (accelerometerPowerFlag == 0) {
                        return;
                    }
                    requestAnimationFrame(animate);
                    if (typeof(controls) !== "undefined") {//防止初始化异步带来的问题
                        Web3DBins.prototype.rotateFrame(speed * speedRatio);
                    }
                };
            },

            /**
             * 获取重力感应状态
             */
            getAccelerometerPowerFlag: function () {
                return accelerometerPowerFlag;
            },

            /**
             * 判断印花是否在区域内（内部）
             * @param uv uv位置
             * @param assemblyCode 模型编码
             * @param event 鼠标事件
             */
            isEffectiveDecalInArea: function (uv, assemblyCode, event) {
                var meshDecalArea = meshDecalAreaMap.get(assemblyCode);
                var decalArea;
                if (meshDecalArea == undefined) {//未定义区域说明不可贴花
                    return false;
                }
                else {
                    decalArea = meshDecalArea.decalArea;
                    uvs = uv.clone();
                    uvs.rotateAround(meshDecalArea.areaCenter, -meshDecalArea.areaRotation);
                    if (decalArea != undefined) {
                        if (uvs.x >= decalArea.minX && uvs.x <= decalArea.maxX && uvs.y >= decalArea.minY && uvs.y <= decalArea.maxY) {
                            return true;
                        }
                        else {
                            if (event != undefined && event != null) {
                                var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                                vector.project(camera);
                                //vector.x = ( vector.x + 1) * renderer.domElement.width / 2;
                                //vector.y = - ( vector.y - 1) * renderer.domElement.height / 2;
                                vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                                vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                                relativeUV.x = event.offsetX - vector.x;
                                relativeUV.y = event.offsetY - vector.y;
                            }
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            },

            /**
             * 判断印花是否在区域内（内部）
             * @param uv uv位置
             * @param assemblyCode 模型编码
             * @param event 鼠标事件
             */
            isEffectiveDecalInArea2: function (uv, decal, event, ifAux) {//内部函数，判断印花是否在区域内（印花相对移动操作）
                var meshDecalArea = decal;
                var decalArea;
                if (meshDecalArea == undefined) {//印花不存在
                    return false;
                }
                else {
                    decalArea = meshDecalArea.decalArea;
                    uvs = uv.clone();
                    uvs.rotateAround(meshDecalArea.areaCenter, -meshDecalArea.areaRotation);
                    if (decalArea != undefined) {
                        if (uvs.x >= decalArea.minX && uvs.x <= decalArea.maxX && uvs.y >= decalArea.minY && uvs.y <= decalArea.maxY) {
                            return true;
                        }
                        else {
                            if (ifAux && event != undefined && event != null) {
                                var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                                vector.project(camera);
                                vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                                vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                                relativeUV.x = event.clientX - vector.x - relas.x;
                                relativeUV.y = event.clientY - vector.y - relas.y;
                            }
                            else if (event != undefined && event != null) {
                                var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                                vector.project(camera);
                                //vector.x = ( vector.x + 1) * renderer.domElement.width / 2;
                                //vector.y = - ( vector.y - 1) * renderer.domElement.height / 2;
                                vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                                vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                                relativeUV.x = event.offsetX - vector.x;
                                relativeUV.y = event.offsetY - vector.y;
                            }
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            },

            /**
             * 创建印绣花贴图（内部）
             * @param img 印绣花图片
             * @param data 相关参数 object{opacity:不透明度,RGB:混合颜色,Portrait:横向反向,Landscape:纵向反向,Mirror:镜像反向}
             */
            createDecalTexture: function (img, data) {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext('2d');
                var opacity = data.opacity != undefined && data.opacity != null ? data.opacity : 1;
                var RGB = data.color != undefined && data.color != null ? Web3DBins.prototype.splitArr(data.color) : [1, 1, 1];
                var Portrait = data.Portrait == true ? -1 : 1;
                var Landscape = data.Landscape == true ? -1 : 1;
                var Mirror = data.Mirror == true ? -1 : 1;
                var x = Portrait * Mirror;
                var y = Landscape * Mirror;
                ctx.scale(x, y);
                ctx.drawImage(img, x == -1 ? -img.width : 0, y == -1 ? -img.height : 0);
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                datas = imgData.data;
                for (var n = 0; n < datas.length; n += 4) {
                    datas[n] *= RGB[0];
                    datas[n + 1] *= RGB[1];
                    datas[n + 2] *= RGB[2];
                    datas[n + 3] *= opacity;
                }
                ctx.putImageData(imgData, 0, 0);
                var textureDecal = new THREE.Texture(canvas);
                textureDecal.wrapS = THREE.RepeatWrapping;
                textureDecal.wrapT = THREE.RepeatWrapping;
                textureDecal.needsUpdate = true;
                return textureDecal;
            },

            /**
             * 修改印绣花贴图设置
             * @param data 相关参数 object{opacity:不透明度,RGB:混合颜色,Portrait:横向反向,Landscape:纵向反向,Mirror:镜像反向}
             */
            changeDecalDesign: function (data) {
                if (!decalMeshs.get(data.decalID)) {
                    console.warn('Web3DBins.prototype.changeDecal:decal ' + data.decalID + ' is not exit');
                    return;
                }
                var decalMesh = decalMeshs.get(data.decalID);
                var img = decalMesh.image;
                if (decalMesh.decalT == "ALL") {
                    if (data.allD == true) {
                        if (data.normal == true) {

                        }
                        var texture = Web3DBins.prototype.createDecalTexture(img, data);
                        var map = decalMesh.material.map;
                        texture.repeat = map.repeat;
                        texture.offset = map.offset;
                        texture.rotation = map.rotation;
                        map.dispose();
                        decalMesh.material.map = texture;
                        renderer.render(scene, camera);
                    }
                    else {
                        reDecal();
                    }
                }
                else {
                    if (data.allD == true) {
                        if (decalMesh.areaType != 0) return;
                        reDecal();
                    }
                    else {
                        var texture = Web3DBins.prototype.createDecalTexture(img, data);
                        decalMesh.mesh.material.map.dispose();
                        decalMesh.mesh.material.map = texture;
                        decalMesh.material.map.dispose();
                        decalMesh.material.map = texture;
                        decalMesh.decalImage = texture.image;
                        renderer.render(scene, camera);
                    }
                }


                function reDecal() {
                    data.areaType = decalMesh.areaType;
                    data.areaOrder = decalMesh.areaOrder;
                    data.decalOrder = decalMesh.decalOrder;
                    data.decalType = decalMesh.decalType;
                    data.UVPosition = decalMesh.UVPosition;
                    data.assemblySceneName = decalMesh.assemblySceneName;
                    if (decalMesh.image.src != undefined) data.decalImgSrc = decalMesh.image.src;
                    else data.decalImgSrc = decalMesh.image.toDataURL();
                    scene.remove(decalMeshs.get(data.decalID).mesh);
                    Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).mesh);
                    decalMeshs.delete(data.decalID);
                    Web3DBins.prototype.addDecalPic(data);
                }

            },

            /**
             * 字体载入（暂弃用）
             * @param position 印绣花位置
             * @param decalID 印绣花ID
             * @param order 印绣花序列
             */
            loadFont: function (position, decalID, order) {
                var loader = new THREE.FontLoader();
                loader.load('data/font/helvetiker_regular.typeface.json', function (response) {
                    font = response;
                    var textGeo = new THREE.TextGeometry(order, {font: font, size: 20.0, height: 1});
                    var mesh = new THREE.Mesh(textGeo, new THREE.MeshPhongMaterial({color: 0xffffff}));
                    if (!orderShow) mesh.visible = false;
                    mesh.position.copy(position);
                    mesh.rotation.y = Math.PI;
                    mesh.position.z -= 10;
                    var tmpOrder = decalOrderMap.get(decalID);
                    if (tmpOrder) {
                        scene.remove(tmpOrder);
                        Web3DBins.prototype.cacheClear(tmpOrder);
                    }
                    decalOrderMap.set(decalID, mesh);
                    scene.add(mesh);
                    renderer.render(scene, camera);
                });
            },

            /**
             * 显示印绣花序列（暂弃用）
             * @param power 1-显示 0-隐藏
             */
            showDecalOrder: function (power) {
                if (power == 1) {
                    orderShow = true;
                    decalOrderMap.forEach(function (value, key, map) {
                        console.log(value);
                        value.visible = true;
                    });
                }
                else if (power == 0) {
                    orderShow = false;
                    decalOrderMap.forEach(function (value, key, map) {
                        value.visible = false;
                    });
                }
                renderer.render(scene, camera);
            },

            /**
             * 相机重置（暂弃用）
             */
            resetCamera: function (callback) {//内部函数，
                controls.reset();
                for (var n in lightControlsGroup) {
                    lightControlsGroup[n].reset();
                }
                if (callback) callback();
            },

            /**
             * 修改印绣花区域（注：由于俊勇印绣花数据与当前印绣花数据格式不同，专门提供接口）
             */
            changeMeshArea: function (data) {//修改印绣花区域相关设置
                var code = meshMap[data.assemblySceneName].name;
                meshMap[data.assemblySceneName].assemblyUVMappingSRC = data.uvMap;
                // if(meshDecalAreaMap.get(code)){
                // meshDecalAreaMap.get(code).decalArea=data.decalArea;
                // meshDecalAreaMap.get(code).assemblyUVMappingSRC = data.uvMap;
                // }
            },

            /**
             * 印绣花接口
             * @param data 印绣花相关数据
             * @param callback 印绣花结束回调函数
             * @param textData 绣字信息，绣字接口专用
             */
            addDecalPic: function (data, callback, textData) {//印绣花接口
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    Web3DBins.prototype.setInterruptionState("addDec");

                    //decalType=meshDecalAreaMap.get(meshMap[data.assemblySceneName].name+data.areaOrder).decalType;
                    var decalType = data.decalType == 1 ? 1 : 0;
                    if (!data.areaType) {
                        data.areaType = 0;
                        decalType = 0;
                    }

                    if (data.direction != undefined) {
                        addDeclWithDirection(data.direction);
                    }

                    else if (data.UVPosition !== undefined && data.UVPosition != null) {//有传UV位置参数
                        addDeclWithUV();
                    }


                    else {//没有UV位置参数，采取鼠标监听
                        renderer.domElement.style.cursor = "crosshair";
                        Web3DBins.prototype.setControlsState(false);
                        if (data.areaType == 1) {
                            if (data.areaOrder != undefined && data.areaOrder != null) {
                                Web3DBins.prototype.showDecalAreaMesh(1, data.assemblySceneName, null, data.areaOrder);//点击前显示贴花区域，贴花生成后或贴花无法生成时消除贴花区域
                                renderer.domElement.addEventListener('click', checkIntersection);
                            }
                            else {
                                meshDecalAreaMap.forEach(function (value, key, map) {
                                    if (key.indexOf(meshMap[data.assemblySceneName].name) != -1) {
                                        var order = key.replace(meshMap[data.assemblySceneName].name, "");
                                        Web3DBins.prototype.showDecalAreaMesh(1, data.assemblySceneName, null, order);
                                    }
                                });
                                renderer.domElement.addEventListener('click', chooseArea);
                            }
                        }
                        else {
                            renderer.domElement.addEventListener('click', checkIntersection);
                        }
                    }
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                    if (callback !== undefined) {
                        callback("failed");
                    }
                }

                function chooseArea(event) {
                    renderer.domElement.removeEventListener('click', chooseArea);
                    Web3DBins.prototype.setControlsState(true);
                    Web3DBins.prototype.setInterruptionState(null);
                    renderer.domElement.style.cursor = "default";
                    mouse.x = ( event.offsetX / renderer.domElement.width ) * 2 - 1;
                    mouse.y = -( event.offsetY / renderer.domElement.height ) * 2 + 1;
                    var raycaster = new THREE.Raycaster();
                    raycaster.setFromCamera(mouse, camera);
                    var intersects = raycaster.intersectObjects([meshMap[data.assemblySceneName]]);
                    if (intersects.length > 0) {
                        var vv = intersects[0].uv;
                        console.log(vv);
                        meshDecalAreaMap.forEach(function (value, key, map) {
                            if (key.indexOf(meshMap[data.assemblySceneName].name) != -1) {
                                if (Web3DBins.prototype.isEffectiveDecalInArea(vv, key)) {
                                    data.areaOrder = key.replace(meshMap[data.assemblySceneName].name, "");
                                    checkIntersection(event);
                                }
                            }
                        });
                    }
                    meshDecalAreaMap.forEach(function (value, key, map) {
                        if (value.areaMesh != undefined) scene.remove(value.areaMesh);
                    });
                    renderer.render(scene, camera);
                }

                function checkIntersection(event) {

                    renderer.domElement.removeEventListener('click', checkIntersection);
                    Web3DBins.prototype.setControlsState(true);
                    Web3DBins.prototype.setInterruptionState(null);
                    renderer.domElement.style.cursor = "default";

                    if (meshMap[data.assemblySceneName] == undefined) {//场景中没有该模型
                        console.warn('Web3DBins.prototype.addDecalPic:assemblySceneName is undefined');
                        Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                    }
                    else if (data.areaType == 1 && meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder) == undefined) {
                        console.warn('Web3DBins.prototype.addDecalPic:assemblyUVMapping is undefined');
                        Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                    }
                    else {

                        // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                        // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                        mouse.x = ( event.offsetX / renderer.domElement.width ) * 2 - 1;
                        mouse.y = -( event.offsetY / renderer.domElement.height ) * 2 + 1;
                        decalClientPosition.set(data.decalID, {
                            x: event.offsetX,
                            y: event.offsetY
                        });//保存印花事件坐标
                        var raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera(mouse, camera);
                        //var tmp=meshDecalAreaMap.get(meshMap[data.assemblySceneName].name).areaMesh;
                        var intersects = raycaster.intersectObjects([meshMap[data.assemblySceneName]]);
                        if (intersects.length > 0) {

                            var p = intersects[0].point;
                            mouseHelper.position.copy(p);
                            intersection.point.copy(p);
                            //Web3DBins.prototype.loadFont(p,data.decalID,data.decalOrder);

                            var vv = intersects[0].uv;

                            var n = intersects[0].face.normal.clone();
                            n.multiplyScalar(10);
                            n.add(intersects[0].point);
                            normalN.addScaledVector(n, -1);//法向量的反方向
                            data.nz = n.z;

                            intersection.normal.copy(intersects[0].face.normal);
                            mouseHelper.lookAt(n);

                            var shootGeo = meshMap[data.assemblySceneName];
                            var areaCenter = new THREE.Vector2();
                            var areaRotation = 0;
                            var decalArea;

                            if (data.areaType == 1) {
                                if (!Web3DBins.prototype.isEffectiveDecalInArea(vv, meshMap[data.assemblySceneName].name + data.areaOrder)) {
                                    //不在印花区域内
                                    Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                                    if (callback !== undefined) {
                                        callback("failed");
                                    }
                                    return;
                                }
                                shootGeo = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaMesh;
                                areaCenter = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaCenter;
                                decalArea = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).decalArea;
                                areaRotation = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaRotation;
                            }

                            if (data.areaType == 2) {
                                if (data.width > 0 && data.height > 0) {
                                    if (decalMeshs.get(data.decalID)) Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).shootGeo);
                                    var width = data.width / 2;
                                    var height = data.height / 2;
                                    decalArea = {
                                        minX: vv.x - width,
                                        maxX: vv.x + width,
                                        minY: vv.y - height,
                                        maxY: vv.y + height
                                    };
                                    areaCenter.x = vv.x;
                                    areaCenter.y = vv.y;
                                    areaRotation = data.areaRotation != undefined && data.areaRotation != null ? data.areaRotation : 0;
                                    Web3DBins.prototype.createDecalArea(2, data.assemblySceneName, vv.x, vv.y, decalReady,
                                        {
                                            "decalArea": decalArea,
                                            "areaRotation": data.areaRotation != undefined ? data.areaRotation : 0
                                        }, data.areaOrder);
                                    return;
                                }
                                else if (decalMeshs.get(data.decalID) && !Web3DBins.prototype.isEffectiveDecalInArea2(vv, decalMeshs.get(data.decalID))) {
                                    if (callback !== undefined) {
                                        callback("failed");
                                    }
                                    return;
                                }
                            }
                            decalReady(null, shootGeo);


                            function decalReady(temp, shootGeo) {
                                if (decalMeshs.get(data.decalID)) {//印花存在
                                    scene.remove(decalMeshs.get(data.decalID).mesh);
                                    Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).mesh);
                                    decalMeshs.delete(data.decalID);
                                }
                                decalMeshs.set(data.decalID, {
                                    "mesh": null,
                                    "material": null,
                                    "sceneName": data.decalID,
                                    "assemblySceneName": data.assemblySceneName,
                                    "UVPosition": vv.clone(),
                                    "UVRotation": 0,
                                    "UVRotationDeviation": 0,
                                    "decalImage": null,
                                    //"versionImgSRC": meshDecalAreaMap.get(meshMap[data.assemblySceneName].name+data.areaOrder).assemblyUVMappingSRC,
                                    "versionImgSRC": meshMap[data.assemblySceneName].assemblyUVMappingSRC,
                                    "decalScale": 1.0,
                                    "decalTextureScale": null,
                                    "worldPosition": p.clone(),
                                    "normal": intersects[0].face.normal.clone(),
                                    "translateEnable": data.translateEnable === undefined ? true : data.translateEnable,
                                    "rotateEnable": data.rotateEnable === undefined ? true : data.rotateEnable,
                                    "scaleEnable": data.scaleEnable === undefined ? true : data.scaleEnable,
                                    "areaType": data.areaType,
                                    "shootGeo": shootGeo,
                                    "areaCenter": areaCenter,
                                    "decalArea": decalArea,
                                    "areaRotation": areaRotation,
                                    "areaOrder": data.areaOrder,
                                    "decalType": decalType,
                                    "decalImgSrc": data.decalImgSrc
                                });
                                if (textData != null) {//绣字
                                    decalMeshs.get(data.decalID).htmlData = textData;
                                }

                                intersection.intersects = true;

                                var textureLoader = new THREE.TextureLoader();
                                //获取贴花图片
                                //textureDecal = textureLoader.load(data.decalImgSrc,function(textureDecal){
                                var img = new Image();
                                img.setAttribute('crossOrigin', 'anonymous');
                                img.onload = function () {
                                    //decalMeshs.get(data.decalID).decalImage = textureDecal.image;
                                    imgResult = isPowerOfTwo(img);
                                    var textureDecal = Web3DBins.prototype.createDecalTexture(imgResult, data);
                                    var tmpDecal = decalMeshs.get(data.decalID);
                                    tmpDecal.decalImage = textureDecal.image;
                                    var DPI = data.dpi != undefined && data.dpi != null ? parseFloat(data.dpi) : 305;
                                    //采取默认大小
                                    // tmpDecal.width=img.width/DPI*25;
                                    // tmpDecal.height=img.height/DPI*25;
                                    tmpDecal.width = 40;
                                    tmpDecal.height = 40;
                                    var normal = null;
                                    var bump = null;
                                    if (false) {
                                        //if(data.normal==true){
                                        var tmpMaterial = meshMap[data.assemblySceneName].material;
                                        for (var n in tmpMaterial) {
                                            if (tmpMaterial[n].name.indexOf("mian_1") != -1) {
                                                if (tmpMaterial[n].normalMap != null) {
                                                    var normalS = tmpMaterial[n].normalMap;
                                                    normal = normalS.clone();
                                                    normal.repeat.set(UVS * tmpDecal.width * conversionRatio * normalS.repeat.x, UVS * tmpDecal.width * conversionRatio * normalS.repeat.y);
                                                    normal.offset.set(UVP.x * normalS.repeat.x - 0.5, UVP.y * normalS.repeat.y - 0.5);
                                                    normal.center.set(0.5, 0.5);
                                                    normal.rotation -= 0;
                                                    normal.needsUpdate = true;
                                                }
                                                if (tmpMaterial[n].bumpMap != null) {
                                                    var normalS = tmpMaterial[n].bumpMap;
                                                    bump = normalS.clone();
                                                    bump.repeat.set(1 * tmpDecal.width * conversionRatio * normalS.repeat.x, 1 * tmpDecal.width * conversionRatio * normalS.repeat.y);
                                                    bump.offset.set(vv.x * normalS.repeat.x - 0.5, vv.y * normalS.repeat.y - 0.5);
                                                    bump.center.set(0.5, 0.5);
                                                    bump.rotation -= 0;
                                                    bump.needsUpdate = true;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                    decalMaterial = new THREE.MeshBasicMaterial({
                                        //decalMaterial = new THREE.MeshPhongMaterial( {
                                        //specular: 0x444444,
                                        map: textureDecal,
                                        normalMap: normal,
                                        bumpMap: bump,
                                        //normalScale: new THREE.Vector2( 1, 1 ),
                                        //shininess: 40,
                                        transparent: true,
                                        depthTest: true,
                                        depthWrite: false,
                                        polygonOffset: true,
                                        polygonOffsetFactor: -4,
                                        wireframe: false
                                    });
                                    tmpDecal.material = decalMaterial;
                                    tmpDecal.image = imgResult;
                                    if (decalType) {
                                        /*var tmpArea=decalArea;
							var width = (decalArea.maxX-decalArea.minX)/conversionRatio;
							var height = (decalArea.maxY-decalArea.minY)/conversionRatio;
							var tmp=decalMeshs.get(data.decalID);
							var tmpS=decalMeshs.get(data.decalID).decalScale;
							var tmpS2=tmp.width*tmpS/width>tmp.height*tmpS/height?tmp.width*tmpS/width:tmp.height*tmpS/height;

							decalMeshs.get(data.decalID).decalScale=tmpS2>1?1/tmpS2*tmpS:tmpS;*/
                                        tmpDecal.decalScale = Web3DBins.prototype.decalCorrectScale(tmpDecal);
                                        data.decalScale = tmpDecal.decalScale;
                                        Web3DBins.prototype.decalCorrection(tmpDecal);
                                    }

                                    //获取部件版型图
                                    textureVersion = textureLoader.load(filePrefix + meshMap[data.assemblySceneName].assemblyUVMappingSRC + fileSuffix, function (textureVersion) {
                                        Web3DBins.prototype.shoot(data, callback);
                                    });
                                };
                                img.src = data.decalImgSrc;
                            }

                        } else {

                            intersection.intersects = false;
                            Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                            if (callback !== undefined) {
                                callback("failed");
                            }
                            return;

                        }

                    }
                };

                function decalALL(data) {
                    var img = new Image();
                    img.setAttribute('crossOrigin', 'anonymous');
                    img.onload = function () {
                        imgResult = isPowerOfTwo(img);
                        var textureDecal = Web3DBins.prototype.createDecalTexture(imgResult, data);
                        var decalMaterial = new THREE.MeshBasicMaterial({
                            //var decalMaterial = new THREE.MeshPhongMaterial( {
                            //specular: 0x444444,
                            map: textureDecal,
                            //normalMap: decalNormal,
                            //normalScale: new THREE.Vector2( 1, 1 ),
                            //shininess: 40,
                            transparent: true,
                            wireframe: false
                        });
                        var test = new THREE.Object3D();
                        for (var n in meshMap) {
                            var mesh = meshMap[n].clone();
                            var material = new Array(meshMap[n].material.length);
                            for (var x in meshMap[n].material) {
                                material[x] = meshMap[n].material[x].clone();
                            }
                            mesh.material = material;
                            for (var n in mesh.material) {
                                if (mesh.material[n].name.indexOf("mian_1") != -1) {
                                    if (data.normal == true) {
                                        decalMaterial.bumpMap = mesh.material[n].bumpMap;
                                        decalMaterial.normalMap = mesh.material[n].normalMap;
                                    }
                                    mesh.material[n] = decalMaterial;
                                }
                            }
                            test.add(mesh);
                        }
                        scene.add(test);
                        renderer.render(scene, camera);
                        decalMeshs.set(data.decalID, {
                            mesh: test, material: decalMaterial,
                            decalT: "ALL", image: imgResult,
                            assemblySceneName: data.assemblySceneName,
                            UVPosition: data.UVPosition,
                            areaType: data.areaType,
                            areaOrder: data.areaOrder,
                            decalOrder: data.decalOrder,
                            decalType: data.decalType
                        });
                        Web3DBins.prototype.setInterruptionState(null);
                    };
                    img.src = data.decalImgSrc;
                };

                function addDeclWithUV() {
                    Web3DBins.prototype.setInterruptionState(null);
                    if (meshMap[data.assemblySceneName] == undefined) {//场景中没有该模型
                        console.warn('Web3DBins.prototype.addDecal:assemblySceneName is undefined');
                    }
                    if (data.allD == true) {
                        if (data.areaType != 0) return;
                        if (decalMeshs.get(data.decalID)) {//印花存在
                            scene.remove(decalMeshs.get(data.decalID).mesh);
                            Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).mesh);
                            decalMeshs.delete(data.decalID);
                        }
                        decalALL(data);
                    }
                    else {
                        var UVP = new THREE.Vector2(data.UVPosition.x, data.UVPosition.y);
                        var decalArea = null;
                        var areaRotaion = 0;
                        var areaCenter = new THREE.Vector2();

                        if (data.areaType == 1) {
                            if (!Web3DBins.prototype.isEffectiveDecalInArea(UVP, meshMap[data.assemblySceneName].name + data.areaOrder)) {
                                //不在印花区域内
                                if (callback !== undefined) {
                                    callback("failed");
                                }
                                return;
                            }
                            decalArea = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).decalArea;
                            areaRotaion = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaRotation;
                            areaCenter = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaCenter;
                        }

                        if (data.areaType == 2) {
                            if (data.width > 0 && data.height > 0) {
                                if (decalMeshs.get(data.decalID)) Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).shootGeo);
                                var width = data.width / 2;
                                var height = data.height / 2;
                                decalArea = {
                                    minX: UVP.x - width,
                                    maxX: UVP.x + width,
                                    minY: UVP.y - height,
                                    maxY: UVP.y + height
                                };
                                areaCenter.x = UVP.x;
                                areaCenter.y = UVP.y;
                                areaRotaion = data.areaRotation != undefined && data.areaRotation != null ? data.areaRotation : 0;
                            }
                            else if (!decalMeshs.get(data.decalID)) {
                                console.warn("decal " + decalID + "'s area not exist");
                                return;
                            }
                            else if (!Web3DBins.prototype.isEffectiveDecalInArea2(UVP, decalMeshs.get(data.decalID))) {
                                if (callback !== undefined) {
                                    callback("failed");
                                }
                                return;
                            }
                        }

                        var UVR = data.UVRotation == undefined ? 0 : data.UVRotation;
                        var UVS = data.decalScale == undefined ? 1.0 : data.decalScale;
                        var UVTS = UVS * conversionRatio * S;

                        if (data.worldPosition != undefined && data.worldPosition != null && data.normal != undefined && data.normal != null) {
                            var vector = new Object();
                            vector.point = new THREE.Vector3(Number(data.worldPosition.x), Number(data.worldPosition.y), Number(data.worldPosition.z));
                            vector.normal = new THREE.Vector3(Number(data.normal.x), Number(data.normal.y), Number(data.normal.z));
                            vector.uv = new THREE.Vector2(Number(data.UVPosition.x), Number(data.UVPosition.y));
                        }
                        else {
                            if (data.areaType == 1) {
                                var tmp = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaMesh;
                                if (tmp != undefined) {
                                    var vector = Web3DBins.prototype.UVPToWorldP(UVP.x, UVP.y, data.assemblySceneName);
                                    decalReady(vector, tmp);
                                }
                                else {
                                    Web3DBins.prototype.createDecalArea(1, data.assemblySceneName, UVP.x, UVP.y, decalReady, null, data.areaOrder);
                                }
                            }

                            else if (data.areaType == 2) {
                                if (data.width > 0 && data.height > 0) {
                                    Web3DBins.prototype.createDecalArea(2, data.assemblySceneName, UVP.x, UVP.y, decalReady, {
                                        "decalArea": decalArea,
                                        "areaRotation": data.areaRotation
                                    }, data.areaOrder);
                                }
                                else {
                                    decalArea = decalMeshs.get(data.decalID).decalArea;
                                    areaRotaion = decalMeshs.get(data.decalID).areaRotaion;
                                    areaCenter = decalMeshs.get(data.decalID).areaCenter;
                                    shootGeo = decalMeshs.get(data.decalID).shootGeo;
                                    var vector = Web3DBins.prototype.UVPToWorldP(UVP.x, UVP.y, data.assemblySceneName);
                                    decalReady(vector, shootGeo);
                                }
                            }

                            else if (data.areaType == 0) {
                                var vector = Web3DBins.prototype.UVPToWorldP(UVP.x, UVP.y, data.assemblySceneName);
                                decalReady(vector, meshMap[data.assemblySceneName]);
                            }
                        }

                        function decalReady(vector, geo) {
                            if (vector != null) {//有效点
                                if (decalMeshs.get(data.decalID)) {//印花存在
                                    scene.remove(decalMeshs.get(data.decalID).mesh);
                                    Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).mesh);
                                    decalMeshs.delete(data.decalID);
                                }
                                var p = vector.point;
                                mouseHelper.position.copy(p);
                                intersection.point.copy(p);
                                //Web3DBins.prototype.loadFont(p,data.decalID,data.decalOrder);

                                var n = vector.normal.clone();
                                n.multiplyScalar(10);
                                n.add(p);
                                normalN.addScaledVector(n, 1);//法向量的反方向
                                data.nz = n.z;


                                intersection.normal.copy(n);
                                mouseHelper.lookAt(n);

                                decalMeshs.set(data.decalID, {
                                    "mesh": null,
                                    "material": null,
                                    "sceneName": data.decalID,
                                    "assemblySceneName": data.assemblySceneName,
                                    "UVPosition": vector.uv.clone(),
                                    "UVRotation": UVR,
                                    "UVRotationDeviation": 0,
                                    "decalImage": null,
                                    //"versionImgSRC": meshDecalAreaMap.get(meshMap[data.assemblySceneName].name+data.areaOrder).assemblyUVMappingSRC,
                                    "versionImgSRC": meshMap[data.assemblySceneName].assemblyUVMappingSRC,
                                    "decalScale": UVS,
                                    "decalTextureScale": UVTS,
                                    "worldPosition": p.clone(),
                                    "normal": vector.normal.clone(),
                                    "translateEnable": data.translateEnable === undefined ? true : data.translateEnable,
                                    "rotateEnable": data.rotateEnable === undefined ? true : data.rotateEnable,
                                    "scaleEnable": data.scaleEnable === undefined ? true : data.scaleEnable,
                                    "areaType": data.areaType,
                                    "shootGeo": geo,
                                    "decalArea": decalArea,
                                    "areaRotation": areaRotaion,
                                    "areaCenter": areaCenter,
                                    "areaOrder": data.areaOrder,
                                    "decalType": decalType,
                                    "decalImgSrc": data.decalImgSrc

                                });

                                if (textData) {//绣字
                                    decalMeshs.get(data.decalID).htmlData = textData;
                                }

                                intersection.intersects = true;

                                var textureLoader = new THREE.TextureLoader();
                                //获取贴花图片
                                var img = new Image();
                                img.setAttribute('crossOrigin', 'anonymous');
                                img.onload = function () {
                                    //获取贴花图片
                                    //textureDecal = textureLoader.load(data.decalImgSrc,function(textureDecal){
                                    imgResult = isPowerOfTwo(img);
                                    var textureDecal = Web3DBins.prototype.createDecalTexture(imgResult, data);
                                    var tmpDecal = decalMeshs.get(data.decalID);
                                    tmpDecal.decalImage = textureDecal.image;
                                    var DPI = data.dpi != undefined && data.dpi != null ? parseFloat(data.dpi) : 305;
                                    //采取默认大小
                                    // tmpDecal.width=img.width/DPI*25;
                                    // tmpDecal.height=img.height/DPI*25;
                                    tmpDecal.width = 40;
                                    tmpDecal.height = 40;
                                    var normal = null;
                                    var bump = null;
                                    if (data.normal == true) {
                                        var tmpMaterial = meshMap[data.assemblySceneName].material;
                                        for (var n in tmpMaterial) {
                                            if (tmpMaterial[n].name.indexOf("mian_1") != -1) {
                                                if (tmpMaterial[n].normalMap != null) {
                                                    var normalS = tmpMaterial[n].normalMap;
                                                    normal = normalS.clone();
                                                    normal.repeat.set(UVS * tmpDecal.width * conversionRatio * normalS.repeat.x, UVS * tmpDecal.width * conversionRatio * normalS.repeat.y);
                                                    normal.offset.set(UVP.x * normalS.repeat.x - 0.5, UVP.y * normalS.repeat.y - 0.5);
                                                    normal.center.set(0.5, 0.5);
                                                    normal.rotation -= UVR;
                                                    normal.needsUpdate = true;
                                                }
                                                if (tmpMaterial[n].bumpMap != null) {
                                                    var normalS = tmpMaterial[n].bumpMap;
                                                    bump = normalS.clone();
                                                    bump.repeat.set(UVS * tmpDecal.width * conversionRatio * normalS.repeat.x, UVS * tmpDecal.width * conversionRatio * normalS.repeat.y);
                                                    bump.offset.set(UVP.x * normalS.repeat.x - 0.5, UVP.y * normalS.repeat.y - 0.5);
                                                    bump.center.set(0.5, 0.5);
                                                    bump.rotation -= UVR;
                                                    bump.needsUpdate = true;
                                                }
                                                break;
                                            }
                                        }
                                    }

                                    decalMaterial = new THREE.MeshBasicMaterial({
                                        //decalMaterial = new THREE.MeshPhongMaterial( {
                                        //specular: 0x000000,
                                        map: textureDecal,
                                        normalMap: normal,
                                        bumpMap: bump,
                                        //normalMap: decalNormal,
                                        //normalScale: new THREE.Vector2( 1, 1 ),
                                        //shininess: 40,
                                        transparent: true,
                                        depthTest: true,
                                        depthWrite: false,
                                        polygonOffset: true,
                                        polygonOffsetFactor: -4,
                                        wireframe: false
                                    });
                                    tmpDecal.material = decalMaterial;
                                    tmpDecal.image = imgResult;
                                    if (decalType) {
                                        /*var tmpArea=decalArea;
						var width = (decalArea.maxX-decalArea.minX)/conversionRatio;
						var height = (decalArea.maxY-decalArea.minY)/conversionRatio;
						var tmp=tmpDecal;
						var tmpS=tmpDecal.decalScale;
						var tmpS2=tmp.width*tmpS/width>tmp.height*tmpS/height?tmp.width*tmpS/width:tmp.height*tmpS/height;*/
                                        tmpDecal.decalScale = Web3DBins.prototype.decalCorrectScale(tmpDecal);
                                        data.decalScale = tmpDecal.decalScale;
                                        Web3DBins.prototype.decalCorrection(tmpDecal);
                                    }

                                    //获取部件版型图
                                    textureVersion = textureLoader.load(filePrefix + meshMap[data.assemblySceneName].assemblyUVMappingSRC + fileSuffix, function (textureVersion) {
                                        Web3DBins.prototype.shoot(data, callback);
                                    });
                                };
                                img.src = data.decalImgSrc;
                            }
                            else {//无效点
                                //不在印花区域内
                                if (callback !== undefined) {
                                    callback("failed");
                                }
                                return;
                            }
                        };
                    }
                };

                function addDeclWithDirection(direction) {
                    Web3DBins.prototype.setInterruptionState(null);
                    if (meshMap[data.assemblySceneName] == undefined) {//场景中没有该模型
                        console.warn('Web3DBins.prototype.addDecal:assemblySceneName is undefined');
                        return;
                    }
                    if (meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder) == undefined) {
                        console.warn('Web3DBins.prototype.addDecalPic:assemblyUVMapping is undefined');
                        return;
                    }
                    var decalArea = null;
                    var areaRotaion = 0;
                    var areaCenter = new THREE.Vector2();

                    decalArea = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).decalArea;
                    areaRotaion = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaRotation;
                    areaCenter = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaCenter;

                    var UVR = data.UVRotation == undefined ? 0 : data.UVRotation;
                    var UVS = data.decalScale == undefined ? 1.0 : data.decalScale;
                    var UVTS = UVS * conversionRatio * S;
                    var tmp = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).areaMesh;
                    var tmpAreas = meshDecalAreaMap.get(meshMap[data.assemblySceneName].name + data.areaOrder).decalArea;
                    if (tmp != undefined) {
                        decalD(null, tmp);
                    }
                    else {
                        //Web3DBins.prototype.createDecalArea(1,data.assemblySceneName,UVP.x,UVP.y,decalReady,null,data.areaOrder);
                        //Web3DBins.prototype.createDecalArea(1,data.assemblySceneName);
                        //decalD(meshMap[data.assemblySceneName]);
                        Web3DBins.prototype.createDecalArea(1, data.assemblySceneName, 0, 0, decalD, null, data.areaOrder);
                    }

                    function decalD(t, geo) {
                        if (decalMeshs.get(data.decalID)) {//印花存在
                            scene.remove(decalMeshs.get(data.decalID).mesh);
                            Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).mesh);
                            decalMeshs.delete(data.decalID);
                        }

                        decalMeshs.set(data.decalID, {
                            "mesh": null,
                            "material": null,
                            "sceneName": data.decalID,
                            "assemblySceneName": data.assemblySceneName,
                            "UVPosition": null,
                            "UVRotation": UVR,
                            "UVRotationDeviation": 0,
                            "decalImage": null,
                            "versionImgSRC": meshMap[data.assemblySceneName].assemblyUVMappingSRC,
                            "decalScale": UVS,
                            "decalTextureScale": UVTS,
                            "worldPosition": null,
                            "normal": null,
                            "translateEnable": data.translateEnable === undefined ? true : data.translateEnable,
                            "rotateEnable": data.rotateEnable === undefined ? true : data.rotateEnable,
                            "scaleEnable": data.scaleEnable === undefined ? true : data.scaleEnable,
                            "areaType": data.areaType,
                            "shootGeo": geo,
                            "decalArea": decalArea,
                            "areaRotation": areaRotaion,
                            "areaCenter": areaCenter,
                            "areaOrder": data.areaOrder,
                            "decalType": decalType,
                            "decalImgSrc": data.decalImgSrc
                        });

                        if (textData) {//绣字
                            decalMeshs.get(data.decalID).htmlData = textData;
                        }

                        intersection.intersects = true;

                        var textureLoader = new THREE.TextureLoader();
                        //获取贴花图片
                        var img = new Image();
                        img.setAttribute('crossOrigin', 'anonymous');
                        img.onload = function () {
                            imgResult = isPowerOfTwo(img);
                            var textureDecal = Web3DBins.prototype.createDecalTexture(imgResult, data);
                            var tmpDecal = decalMeshs.get(data.decalID);
                            tmpDecal.decalImage = textureDecal.image;
                            var DPI = data.dpi != undefined && data.dpi != null ? parseFloat(data.dpi) : 305;
                            //采取默认大小
                            // tmpDecal.width=img.width/DPI*25;
                            // tmpDecal.height=img.height/DPI*25;
                            tmpDecal.width = 40;
                            tmpDecal.height = 40;
                            var normal = null;
                            var bump = null;
                            if (data.normal == true) {
                                var tmpMaterial = meshMap[data.assemblySceneName].material;
                                for (var n in tmpMaterial) {
                                    if (tmpMaterial[n].name.indexOf("mian_1") != -1) {
                                        if (tmpMaterial[n].normalMap != null) {
                                            var normalS = tmpMaterial[n].normalMap;
                                            normal = normalS.clone();
                                            normal.repeat.set(UVS * tmpDecal.width * conversionRatio * normalS.repeat.x, UVS * tmpDecal.width * conversionRatio * normalS.repeat.y);
                                            normal.offset.set(UVP.x * normalS.repeat.x - 0.5, UVP.y * normalS.repeat.y - 0.5);
                                            normal.center.set(0.5, 0.5);
                                            normal.rotation -= UVR;
                                            normal.needsUpdate = true;
                                        }
                                        if (tmpMaterial[n].bumpMap != null) {
                                            var normalS = tmpMaterial[n].bumpMap;
                                            bump = normalS.clone();
                                            bump.repeat.set(UVS * tmpDecal.width * conversionRatio * normalS.repeat.x, UVS * tmpDecal.width * conversionRatio * normalS.repeat.y);
                                            bump.offset.set(UVP.x * normalS.repeat.x - 0.5, UVP.y * normalS.repeat.y - 0.5);
                                            bump.center.set(0.5, 0.5);
                                            bump.rotation -= UVR;
                                            bump.needsUpdate = true;
                                        }
                                        break;
                                    }
                                }
                            }

                            decalMaterial = new THREE.MeshBasicMaterial({
                                //decalMaterial = new THREE.MeshPhongMaterial( {
                                //specular: 0x000000,
                                map: textureDecal,
                                normalMap: normal,
                                bumpMap: bump,
                                //normalMap: decalNormal,
                                //normalScale: new THREE.Vector2( 1, 1 ),
                                //shininess: 40,
                                transparent: true,
                                depthTest: true,
                                depthWrite: false,
                                polygonOffset: true,
                                polygonOffsetFactor: -4,
                                wireframe: false
                            });
                            tmpDecal.material = decalMaterial;
                            tmpDecal.image = imgResult;
                            var decalTmpUv = new THREE.Vector2();
                            if (decalType) {
                                tmpDecal.UVPosition = new THREE.Vector2(0, 0);
                                tmpDecal.decalScale = Web3DBins.prototype.decalCorrectScale(tmpDecal);
                                data.decalScale = tmpDecal.decalScale;
                                UVS = data.decalScale;
                            }
                            switch (direction) {
                                case "top":
                                    decalTmpUv.x = (tmpAreas.minX + tmpAreas.maxX) / 2;
                                    decalTmpUv.y = tmpAreas.maxY - tmpDecal.height * conversionRatio / 2 * UVS;
                                    break;
                                case "bottom":
                                    decalTmpUv.x = (tmpAreas.minX + tmpAreas.maxX) / 2;
                                    decalTmpUv.y = tmpAreas.minY + tmpDecal.height * conversionRatio / 2 * UVS;
                                    break;
                                case "left":
                                    decalTmpUv.y = (tmpAreas.minY + tmpAreas.maxY) / 2;
                                    decalTmpUv.x = tmpAreas.minX + tmpDecal.width * conversionRatio / 2 * UVS;
                                    break;
                                case "right":
                                    decalTmpUv.y = (tmpAreas.minY + tmpAreas.maxY) / 2;
                                    decalTmpUv.x = tmpAreas.maxX - tmpDecal.width * conversionRatio / 2 * UVS;
                                    break;
                                case "center":
                                    decalTmpUv.y = (tmpAreas.minY + tmpAreas.maxY) / 2;
                                    decalTmpUv.x = (tmpAreas.minX + tmpAreas.maxX) / 2;
                                    break;
                            }
                            decalTmpUv.rotateAround(tmpDecal.areaCenter, tmpDecal.areaRotation);
                            var vector = Web3DBins.prototype.UVPToWorldP(decalTmpUv.x, decalTmpUv.y, data.assemblySceneName);
                            if (vector != null) {
                                var p = vector.point;
                                mouseHelper.position.copy(p);
                                intersection.point.copy(p);
                                //Web3DBins.prototype.loadFont(p,data.decalID,data.decalOrder);

                                var n = vector.normal.clone();
                                n.multiplyScalar(10);
                                n.add(p);
                                normalN.addScaledVector(n, 1);//法向量的反方向
                                data.nz = n.z;


                                intersection.normal.copy(n);
                                mouseHelper.lookAt(n);
                                tmpDecal.UVPosition = vector.uv.clone();
                                tmpDecal.worldPosition = p.clone();
                                tmpDecal.normal = vector.normal.clone();

                            }

                            if (decalType) {
                                /*var tmpArea=decalArea;
					var width = (decalArea.maxX-decalArea.minX)/conversionRatio;
					var height = (decalArea.maxY-decalArea.minY)/conversionRatio;
					var tmp=tmpDecal;
					var tmpS=tmpDecal.decalScale;
					var tmpS2=tmp.width*tmpS/width>tmp.height*tmpS/height?tmp.width*tmpS/width:tmp.height*tmpS/height;

					tmpDecal.decalScale=tmpS2>1?1/tmpS2*tmpS:tmpS;*/
                                //tmpDecal.decalScale=Web3DBins.prototype.decalCorrectScale(tmpDecal);
                                //data.decalScale=tmpDecal.decalScale;
                                Web3DBins.prototype.decalCorrection(tmpDecal);
                            }

                            //获取部件版型图
                            textureVersion = textureLoader.load(filePrefix + meshMap[data.assemblySceneName].assemblyUVMappingSRC + fileSuffix, function (textureVersion) {
                                Web3DBins.prototype.shoot(data, callback);
                            });
                        };
                        img.src = data.decalImgSrc;
                    };
                };

                function isPowerOfTwo(image) {
                    var a = ( image.width & ( image.width - 1 ) ) === 0 && image.width !== 0;
                    var b = ( image.height & ( image.height - 1 ) ) === 0 && image.height !== 0;
                    if (a && b) {
                        return image;
                    }
                    else {
                        var _canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
                        _canvas.width = floorPowerOfTwo(image.width);
                        _canvas.height = floorPowerOfTwo(image.height);
                        var context = _canvas.getContext('2d');
                        context.drawImage(image, 0, 0, _canvas.width, _canvas.height);
                        return _canvas;
                    }
                };

                function floorPowerOfTwo(value) {
                    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
                };

            },

            /**
             * 创建印绣花区域（内部）
             * @param type 1-从印绣花信息组拿信息 2-从data中拿数据
             * @param sceneName 模型名称
             * @param x uv x轴坐标
             * @param y uv y轴坐标
             * @param callback 回调函数
             * @param data 相关数据
             * @param order 区域序列
             */
            createDecalArea: function (type, sceneName, x, y, callback, data, order) {//内部接口，创建印绣花区域
                var assemblyCode = meshMap[sceneName].name;
                if (!meshDecalAreaMap.get(assemblyCode + order)) return;
                if (type == 1) {
                    var decalArea = meshDecalAreaMap.get(assemblyCode + order).decalArea;
                    var areaRotation = meshDecalAreaMap.get(assemblyCode + order).areaRotation;
                    var tmpA = meshDecalAreaMap.get(assemblyCode + order);
                }
                else if (type == 2) {
                    var decalArea = data.decalArea;
                    var areaRotation = data.areaRotation;
                }

                var canvas = document.createElement('canvas');
                canvas.style.position = "absolute";
                var img = new Image();//UV图
                //img.src=meshDecalAreaMap.get(assemblyCode+order).assemblyUVMappingSRC;
                img.src = meshMap[sceneName].assemblyUVMappingSRC;
                img.onload = function () {
                    canvas.width = img.width * ( decalArea.maxX - decalArea.minX );
                    canvas.height = img.height * ( decalArea.maxY - decalArea.minY );

                    var context = canvas.getContext("2d");
                    context.globalCompositeOperation = "source-over";
                    context.fillStyle = "rgba(100%,66%,66%,0.6)";
                    context.fillRect(0, 0, canvas.width, canvas.height);

                    var textureLoader = new THREE.TextureLoader();
                    textureLoader.load(canvas.toDataURL(), function (currentMaps) {
                        var vector = Web3DBins.prototype.UVPToWorldP(( parseFloat(decalArea.maxX) + parseFloat(decalArea.minX) ) / 2, ( parseFloat(decalArea.maxY) + parseFloat(decalArea.minY) ) / 2, sceneName, 1);
                        if (vector != null) {//有效点
                            var p = vector.point;
                            mouseHelper.position.copy(p);
                            intersection.point.copy(p);

                            var n = vector.normal.clone();
                            n.multiplyScalar(10);
                            n.add(p);
                            normalN.addScaledVector(n, 1);//法向量的反方向

                            intersection.normal.copy(n);
                            mouseHelper.lookAt(n);

                            intersection.intersects = true;

                            var textureLoader = new THREE.TextureLoader();

                            decalMaterial = new THREE.MeshBasicMaterial({
                                map: currentMaps,
                                transparent: true,
                                depthTest: true,
                                depthWrite: false,
                                polygonOffset: true,
                                polygonOffsetFactor: -4,
                                wireframe: false
                            });
                            p = intersection.point;
                            r.copy(mouseHelper.rotation);
                            r.z += areaRotation;

                            var s2 = new THREE.Vector3((decalArea.maxX - decalArea.minX) / conversionRatio, ( decalArea.maxY - decalArea.minY ) / conversionRatio, (decalArea.maxX - decalArea.minX) / conversionRatio);
                            // var s2 = new THREE.Vector3( (decalArea.maxX - decalArea.minX)/conversionRatio, ( decalArea.maxY - decalArea.minY )/conversionRatio, 1/conversionRatio );
                            var m = new THREE.Mesh(new THREE.DecalGeometry(meshMap[sceneName], p, r, s2, check), decalMaterial);
                            m.renderOrder = 98;
                            m.areaRotation = areaRotation;
                            if (type == 1) tmpA.areaMesh = m;
                            if (callback != undefined) {
                                var tmp = Web3DBins.prototype.UVPToWorldP(x, y, sceneName);
                                callback(tmp, m);
                            }
                            else {
                                decalAreaMesh = m;
                                //camera.rotation.z+=decalAreaMesh.areaRotation;
                                scene.add(decalAreaMesh);
                                renderer.render(scene, camera);
                                //composer.render();
                            }

                        }
                        else {//无效点
                        }

                    });
                };
            },

            /**
             * 印绣花大小矫正（当印绣花大小超出区域，内部）
             * @param c 印绣花数据
             */
            decalCorrectScale: function (c) {
                decalArea = c.decalArea;
                var width = (decalArea.maxX - decalArea.minX) / conversionRatio;
                var height = (decalArea.maxY - decalArea.minY) / conversionRatio;
                //var c = b;
                //var d = c;
                var e = c.areaRotation + c.UVRotation;
                var s = c.decalScale;
                var f = c.height * s * conversionRatio * 0.5;
                var g = c.width * s * conversionRatio * 0.5;
                var h = c.UVPosition;
                var j = c.areaCenter;
                var p = new Object();
                p.a = new THREE.Vector2(h.x - g, h.y + f).rotateAround(h, e);
                p.b = new THREE.Vector2(h.x + g, h.y + f).rotateAround(h, e);
                p.c = new THREE.Vector2(h.x - g, h.y - f).rotateAround(h, e);
                p.d = new THREE.Vector2(h.x + g, h.y - f).rotateAround(h, e);
                var tmp = getDistance(p);
                var tmpS2 = tmp.width / width > tmp.height / height ? tmp.width / width : tmp.height / height;
                return tmpS2 > 1 ? 1 / tmpS2 * c.decalScale - 0.05 : c.decalScale;

                function getDistance(point) {
                    p.a.rotateAround(j, -c.areaRotation);
                    p.b.rotateAround(j, -c.areaRotation);
                    p.c.rotateAround(j, -c.areaRotation);
                    p.d.rotateAround(j, -c.areaRotation);
                    var maxX = getMaxX(point);
                    var minX = getMinX(point);
                    var maxY = getMaxY(point);
                    var minY = getMinY(point);
                    p.a.set(maxX, maxY);
                    p.b.set(maxX, minY);
                    p.c.set(minX, minY);
                    p.d.set(minX, maxY);
                    return {
                        width: p.a.distanceTo(p.d) / conversionRatio,
                        height: p.a.distanceTo(p.b) / conversionRatio
                    };
                }

                function getMaxX(point) {
                    var max = 0;
                    for (var n in point) {
                        if (point[n].x > max) max = point[n].x;
                    }
                    return max;
                }

                function getMinX(point) {
                    var min = 2;
                    for (var n in point) {
                        if (point[n].x < min) min = point[n].x;
                    }
                    return min;
                }

                function getMaxY(point) {
                    var max = 0;
                    for (var n in point) {
                        if (point[n].y > max) max = point[n].y;
                    }
                    return max;
                }

                function getMinY(point) {
                    var min = 2;
                    for (var n in point) {
                        if (point[n].y < min) min = point[n].y;
                    }
                    return min;
                }
            },

            /**
             * 印绣花位置校正（当印绣花位置超出区域，内部）
             * @param d 印绣花数据
             */
            decalCorrection: function (d) {
                //var d = decalMeshs.get(b);
                var e = d.areaRotation + d.UVRotation;
                var s = d.decalScale;
                var f = d.height * s * conversionRatio * 0.5;
                var g = d.width * s * conversionRatio * 0.5;
                var h = d.UVPosition;
                var j = d.areaCenter;
                var p = new Object();
                p.a = new THREE.Vector2(h.x - g, h.y + f).rotateAround(h, e);
                p.b = new THREE.Vector2(h.x + g, h.y + f).rotateAround(h, e);
                p.c = new THREE.Vector2(h.x - g, h.y - f).rotateAround(h, e);
                p.d = new THREE.Vector2(h.x + g, h.y - f).rotateAround(h, e);
                getNEW(p);
                var k = Web3DBins.prototype.isEffectiveDecalInArea2(p.a, d);
                var l = Web3DBins.prototype.isEffectiveDecalInArea2(p.b, d);
                var m = Web3DBins.prototype.isEffectiveDecalInArea2(p.c, d);
                var o = Web3DBins.prototype.isEffectiveDecalInArea2(p.d, d);
                var q = new Array(),
                    distanceY = new Array();
                if (!k) {
                    compute(p.a)
                }
                if (!l) {
                    compute(p.b)
                }
                if (!m) {
                    compute(p.c)
                }
                if (!o) {
                    compute(p.d)
                }
                if (q.length == 0 && distanceY.length == 0) return;
                else {
                    var r = q.length != 0 ? Math.max.apply(null, q) : 0;
                    var u = distanceY.length != 0 ? Math.max.apply(null, distanceY) : 0;
                    var t = d.UVPosition.clone();
                    t.rotateAround(j, -d.areaRotation);
                    t.x += r;
                    t.y += u;
                    t.rotateAround(j, d.areaRotation);
                    d.UVPosition.copy(t);
                    var v = Web3DBins.prototype.UVPToWorldP(d.UVPosition.x, d.UVPosition.y, d.assemblySceneName);
                    var p = v.point;
                    mouseHelper.position.copy(p);
                    intersection.point.copy(p);
                    var n = v.normal.clone();
                    n.multiplyScalar(10);
                    n.add(p);
                    normalN.addScaledVector(n, 1);
                    intersection.normal.copy(n);
                    mouseHelper.lookAt(n);
                    d.worldPosition = p.clone();
                    d.normal = v.normal.clone();
                }

                function compute(a) {
                    a.rotateAround(j, -d.areaRotation);
                    if (a.x < d.decalArea.minX) q.push(d.decalArea.minX - a.x);
                    else if (a.x > d.decalArea.maxX) q.push(d.decalArea.maxX - a.x);
                    if (a.y < d.decalArea.minY) distanceY.push(d.decalArea.minY - a.y);
                    else if (a.y > d.decalArea.maxY) distanceY.push(d.decalArea.maxY - a.y)
                }

                function getNEW(point) {
                    p.a.rotateAround(j, -d.areaRotation);
                    p.b.rotateAround(j, -d.areaRotation);
                    p.c.rotateAround(j, -d.areaRotation);
                    p.d.rotateAround(j, -d.areaRotation);
                    var maxX = getMaxX(point);
                    var minX = getMinX(point);
                    var maxY = getMaxY(point);
                    var minY = getMinY(point);
                    p.a.set(maxX, maxY);
                    p.b.set(maxX, minY);
                    p.c.set(minX, minY);
                    p.d.set(minX, maxY);
                    p.a.rotateAround(j, d.areaRotation);
                    p.b.rotateAround(j, d.areaRotation);
                    p.c.rotateAround(j, d.areaRotation);
                    p.d.rotateAround(j, d.areaRotation);
                }

                function getMaxX(point) {
                    var max = 0;
                    for (var n in point) {
                        if (point[n].x > max) max = point[n].x;
                    }
                    return max;
                }

                function getMinX(point) {
                    var min = 2;
                    for (var n in point) {
                        if (point[n].x < min) min = point[n].x;
                    }
                    return min;
                }

                function getMaxY(point) {
                    var max = 0;
                    for (var n in point) {
                        if (point[n].y > max) max = point[n].y;
                    }
                    return max;
                }

                function getMinY(point) {
                    var min = 2;
                    for (var n in point) {
                        if (point[n].y < min) min = point[n].y;
                    }
                    return min;
                }
            },

            /**
             * 判断印绣花是否超出区域（内部接口）
             * @param ID 印绣花ID
             * @param point uv坐标
             * @param scale 缩放倍数
             * @param r 印绣花旋转值
             */
            getFourPoint: function (ID, point, scale, r) {
                var tmpDecal = decalMeshs.get(ID);
                var tmpArea = tmpDecal;
                var angle = r != undefined ? tmpDecal.UVRotation + r : tmpDecal.UVRotation + tmpArea.areaRotation;
                //console.log(angle);
                var s = scale != undefined ? scale : tmpDecal.decalScale;
                var height = tmpDecal.height * s * conversionRatio * 0.5;
                var width = tmpDecal.width * s * conversionRatio * 0.5;
                var tmpPosition = point != undefined ? point : tmpDecal.UVPosition;
                var center = point != undefined ? point : tmpDecal.UVPosition;
                var p = new Object();
                p.a = new THREE.Vector2(tmpPosition.x - width, tmpPosition.y + height).rotateAround(center, angle);
                p.b = new THREE.Vector2(tmpPosition.x + width, tmpPosition.y + height).rotateAround(center, angle);
                p.c = new THREE.Vector2(tmpPosition.x - width, tmpPosition.y - height).rotateAround(center, angle);
                p.d = new THREE.Vector2(tmpPosition.x + width, tmpPosition.y - height).rotateAround(center, angle);
                var name = meshMap[tmpDecal.assemblySceneName].name;
                var j1 = Web3DBins.prototype.isEffectiveDecalInArea2(p.a, tmpDecal);
                var j2 = Web3DBins.prototype.isEffectiveDecalInArea2(p.b, tmpDecal);
                var j3 = Web3DBins.prototype.isEffectiveDecalInArea2(p.c, tmpDecal);
                var j4 = Web3DBins.prototype.isEffectiveDecalInArea2(p.d, tmpDecal);
                if (j1 && j2 && j3 && j4) {
                    return true;
                }
                else return false;
            },

            /**
             * 显示印绣花区域（内部）
             * @param power 1-显示 0-隐藏
             * @param sceneName 模型名称
             * @param decalID 印绣花ID
             * @param order 区域序列
             */
            showDecalAreaMesh: function (power, sceneName, decalID, order) {//内部接口，显示印绣花区域
                if (power == 0) {//off
                    if (decalAreaMesh != null) {
                        scene.remove(decalAreaMesh);
                        //camera.rotation.z-=decalAreaMesh.areaRotation;
                        //Web3DBins.prototype.cacheClear(decalAreaMesh);
                        renderer.render(scene, camera);
                        //composer.render();
                        decalAreaMesh = null;
                    }
                } else if (power == 1) {//on
                    if (meshMap[sceneName] == null && meshMap[sceneName] == undefined) {
                        console.warn("Web3DBins.prototype.showDecalAreaMesh:assemblySceneName is undefined");
                        return;
                    }
                    decalAreaMesh = meshDecalAreaMap.get(meshMap[sceneName].name + order).areaMesh;
                    if (decalAreaMesh != undefined && decalAreaMesh != null) {
                        scene.add(decalAreaMesh);
                        //camera.rotation.z+=decalAreaMesh.areaRotation;
                        renderer.render(scene, camera);
                        return;
                    }
                    else {
                        Web3DBins.prototype.createDecalArea(1, sceneName, null, null, undefined, null, order);
                    }
                } else if (power == 2) {
                    decalAreaMesh = decalMeshs.get(decalID).shootGeo;
                    if (decalAreaMesh != undefined && decalAreaMesh != null) {
                        scene.add(decalAreaMesh);
                        //camera.rotation.z+=decalAreaMesh.areaRotation;
                        renderer.render(scene, camera);
                        return;
                    }
                    else {
                        Web3DBins.prototype.createDecalArea(2, sceneName);
                    }
                }
            },

            /**
             * 执行印绣花印的动作（内部）
             * @param data 印绣花数据
             * @param 回调函数，返回"success"
             */
            shoot: function (data, callback) {//内部接口,印绣花
                p = intersection.point;
                r.copy(mouseHelper.rotation);
                r.z += decalMeshs.get(data.decalID).areaRotation;
                var dataDScale = data.decalScale;
                var decalMeshDScale = decalMeshs.get(data.decalID).decalScale;
                var decalWidth = decalMeshs.get(data.decalID).width;
                var decalHeight = decalMeshs.get(data.decalID).height;
                //console.log(decalWidth);
                //console.log(decalHeight);
                if (dataDScale !== undefined) {
                    s.set(dataDScale * decalWidth, dataDScale * decalHeight, dataDScale * decalWidth);
                    //s.set(dataDScale*decalWidth,dataDScale*decalHeight,1/conversionRatio);
                    //decalMeshs.get(data.decalID).decalScale = data.scale*10;
                }
                else if (decalMeshDScale !== undefined) {
                    s.set(decalMeshDScale * decalWidth, decalMeshDScale * decalWidth, decalMeshDScale * decalWidth);
                    //s.set(decalMeshDScale*decalWidth,decalMeshDScale*decalWidth,1/conversionRatio);
                }
                else {
                    //decalMeshs.get(data.decalID).decalScale = 10;
                    //s.set(40,40,40);
                }

                //印花旋转值带有法线的旋转信息为原始状态
                // decalMeshs.get(data.decalID).UVRotationDeviation = r.z;
                // r.z += decalMeshs.get(data.decalID).UVRotation;

                //印花旋转值对法线旋转信息进行了修正
                r.z += decalMeshs.get(data.decalID).UVRotation;
                /*if( data.nz < 0 ){
       // r.x = r.x > 0 ? r.x - Math.PI : r.x + Math.PI;
       // r.y = r.y > 0 ? r.y - Math.PI : r.y + Math.PI;
        r.z = r.z > 0 ? r.z - Math.PI : r.z + Math.PI;
        //r.multiply( new THREE.Vector3(-1,-1,-1) );
    }*/

                var material = decalMeshs.get(data.decalID).material.clone();
                var shootGeo = decalMeshs.get(data.decalID).shootGeo;
                //shootGeometry=meshDecalAreaMap.get(meshMap[data.assemblySceneName].name).areaMesh;
                //var shootGeometry = decalAreaMesh == null ? meshMap[data.assemblySceneName] : decalAreaMesh;
                var m = new THREE.Mesh(new THREE.DecalGeometry(shootGeo, p, r, s, check), material);
                m.renderOrder = 99;
                //decalMeshs.get(data.decalID).decalTextureScale = getDecalScale( m, decalMeshs.get(data.decalID).UVPosition );//动态计算缩放比
                decalMeshs.get(data.decalID).decalTextureScale = S * decalMeshs.get(data.decalID).decalScale * conversionRatio;
                m.name = data.decalID;
                decalMeshs.get(data.decalID).mesh = m;

                if (Web3DBins.prototype.checkInterruptionState(null)) {//贴花模型生成完毕且中断状态为null(非“持续修改贴花”状态)
                    Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                }

                scene.add(m);
                renderer.render(scene, camera);
                //composer.render();
                if (callback != undefined) {
                    callback("success");
                }

                function getDecalScale(mes, poi) {

                    var minPoiV2, minPoiV3;
                    var mousePoi = new THREE.Vector2();
                    var uvs = mes.geometry.uvs;
                    var poiIntersects;
                    var realUV = new THREE.Vector2();
                    for (var point0 in uvs) {
                        if (uvs[point0].x == 0 && uvs[point0].y == 0) {
                            minPoiV2 = uvs[point0];//印花上的UV坐标
                            minPoiV3 = mes.geometry.vertices[point0];//点的空间坐标

                            //创建射线
                            var raycaster2 = new THREE.Raycaster();
                            raycaster2.set(minPoiV3, normalN.normalize());
                            var intersects2 = raycaster2.intersectObjects([meshMap[decalMeshs.get(data.decalID).assemblySceneName]]);
                            if (intersects2.length > 0) {//碰撞
                                realUV = intersects2[0].uv;
                                break;
                            }
                            /*
            //     var assemblyCodeVertices = meshMap[decalMeshs.get(data.decalID).sceneName].geometry.vertices;//部件模型的点集合
            //     var assemblyCodeFaces = meshMap[decalMeshs.get(data.decalID).sceneName].geometry.faces;//部件模型的面集合
            //     var assemblyCodeFaceVertexUvs = meshMap[decalMeshs.get(data.decalID).sceneName].geometry.faceVertexUvs[0];//部件模型的 点-面-UV 集合

            //     for( var point1 in assemblyCodeVertices ){//遍历部件模型点
            //         if( assemblyCodeVertices[point1].equals(minPoiV3) ){//同点，则point1为所求点在部件模型中的下标
            //             for( var face0 in assemblyCodeFaces ){//遍历部件模型面
            //                 if( assemblyCodeFaces[face0].a.equals(point1) ){//面的a点为所求点
            //                    realUV =  assemblyCodeFaceVertexUvs[face0][0];
            //                    break;
            //                 }
            //                 if( assemblyCodeFaces[face0].b.equals(point1) ){//面的b点为所求点
            //                    realUV =  assemblyCodeFaceVertexUvs[face0][1];
            //                    break;
            //                 }
            //                 if( assemblyCodeFaces[face0].c.equals(point1) ){//面的c点为所求点
            //                    realUV =  assemblyCodeFaceVertexUvs[face0][2];
            //                    break;
            //                 }
            //             }
            //             break;
            //         }
            //     }
            //     break;
    */
                        }
                    }

                    var minPoiV3_2;
                    var realUV2 = new THREE.Vector2();
                    for (var point2 in uvs) {
                        if (uvs[point2].x == 1 && uvs[point2].y == 0) {
                            minPoiV3_2 = mes.geometry.vertices[point2];//点的空间坐标

                            //创建射线
                            var raycaster3 = new THREE.Raycaster();
                            raycaster3.set(minPoiV3_2, normalN.normalize());
                            var intersects3 = raycaster3.intersectObjects([meshMap[decalMeshs.get(data.decalID).assemblySceneName]]);
                            if (intersects3.length > 0) {//存在遮挡物
                                realUV2 = intersects3[0].uv;
                                break;
                            }
                        }
                    }

                    // console.log("3200?1:");
                    // console.log(10*S/(poi.x - realUV.x)*2);
                    // console.log("3200?2:");
                    // console.log(10*S/(realUV2.x - realUV.x));
                    //return (poi.x - realUV.x)*2;
                    return (realUV2.x - realUV.x);
                };

            },


            /*以下接口皆为印绣花操作辅助框相关函数*/
            decalsMoveA: function (event) {
                var map = decalMeshs.get(changeDecalData.decalID).material.map;
                //console.log(material);
                switch (event.which) {
                    case 1:
                        var offsetx = event.offsetX - mousePosOrigin.x, offsety = event.offsetY - mousePosOrigin.y;
                        map.offset.x -= offsetx / SCREEN_WIDTH * map.repeat.x;
                        map.offset.y += offsety / SCREEN_WIDTH * map.repeat.x;
                        mousePosOrigin = {x: event.offsetX, y: event.offsetY};
                        renderer.render(scene, camera);
                        break;
                    case 3:
                        var offsetx = Math.PI * (event.offsetX - mousePosOrigin.x) / SCREEN_WIDTH;
                        map.rotation += offsetx;
                        mousePosOrigin.x = event.offsetX;
                        renderer.render(scene, camera);
                        break;
                }
            },

            decalsMoveBeginA: function (event) {
                mousePosOrigin = {x: event.offsetX, y: event.offsetY};
                renderer.domElement.addEventListener("mousemove", Web3DBins.prototype.decalsMoveA);
            },

            decalsMoveEndA: function (event) {
                renderer.domElement.removeEventListener("mousemove", Web3DBins.prototype.decalsMoveA);
            },

            decalswheelA: function (event) {
                var map = decalMeshs.get(changeDecalData.decalID).material.map;
                var scale = 1 - event.wheelDelta / 1200.0;
                map.repeat.x *= scale;
                map.repeat.y *= scale;
                renderer.render(scene, camera);
            },

            createKK2: function () {
                var img = document.createElement("div");
            },

            createKK: function () {
                var img = document.createElement("div");
                var width = 70;
                var height = 70;
                img.style.border = "thin solid yellow";
                img.style.zIndex = 2;
                img.style.position = "absolute";
                img.style.left = 100 + "px";
                img.style.top = 100 + "px";
                img.style.width = width + "px";
                img.style.height = height + "px";
                var img2 = document.createElement("div");
                img2.style.border = "thin solid red";
                img2.style.position = "absolute";
                img2.style.right = 0 + "px";
                img2.style.top = 0 + "px";
                img2.style.width = 10 + "px";
                img2.style.height = 10 + "px";
                img.appendChild(img2);
                var img3 = document.createElement("div");
                img3.style.border = "thin solid blue";
                img3.style.position = "absolute";
                img3.style.right = 10 + "px";
                img3.style.top = 10 + "px";
                img3.style.width = 50 + "px";
                img3.style.height = 50 + "px";
                img.appendChild(img3);
                containerElement.appendChild(img);
            },

            getAbsPosition: function (element) {
                var abs = {x: 0, y: 0}

                //如果浏览器兼容此方法
                if (document.documentElement.getBoundingClientRect) {
                    //注意，getBoundingClientRect()是jQuery对象的方法
                    //如果不用jQuery对象，可以使用else分支。
                    abs.x = element.getBoundingClientRect().left;
                    abs.y = element.getBoundingClientRect().top;

                    abs.x += window.screenLeft +
                        document.documentElement.scrollLeft -
                        document.documentElement.clientLeft;
                    abs.y += window.screenTop +
                        document.documentElement.scrollTop -
                        document.documentElement.clientTop;

                }

                //如果浏览器不兼容此方法
                else {
                    while (element != document.body) {
                        abs.x += element.offsetLeft;
                        abs.y += element.offsetTop;
                        element = element.offsetParent;
                    }

                    //计算想对位置
                    abs.x += window.screenLeft +
                        document.body.clientLeft - document.body.scrollLeft;
                    abs.y += window.screenTop +
                        document.body.clientTop - document.body.scrollTop;

                }

                return abs;
            },

            auxiliaryMoveBegin: function (event) {
                relas = new THREE.Vector2(containerElement.offsetLeft, containerElement.offsetTop);
                var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                relativeUV.x = event.clientX - vector.x - relas.x;
                relativeUV.y = event.clientY - vector.y - relas.y;
                containerElement.addEventListener("mousemove", Web3DBins.prototype.auxiliaryMove);
            },

            auxiliaryMove: function (event) {

                floatingBox.style.left = event.clientX - relas.x - relativeUV.x - floatingBox.widths / 2 + "px";
                floatingBox.style.top = event.clientY - relas.y - relativeUV.y - floatingBox.heights / 2 + "px";
                mouse.x = ( (event.clientX - relas.x - relativeUV.x) / renderer.domElement.width) * 2 - 1;
                mouse.y = -( (event.clientY - relas.y - relativeUV.y) / renderer.domElement.height ) * 2 + 1;
                var decalMesh = decalMeshs.get(changeDecalData.decalID);
                var worldp = Web3DBins.prototype.elementPToWorldP(mouse.x, mouse.y, decalMesh.assemblySceneName);
                if (worldp != null) {
                    if (decalMesh.areaType != 0 && !decalType && !Web3DBins.prototype.isEffectiveDecalInArea2(worldp.uv, decalMesh, event, true)) {
                        //不在印花区域内
                        return;
                    }
                    if (decalMesh.areaType != 0 && decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, worldp.uv)) {
                        var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                        vector.project(camera);
                        vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                        vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                        relativeUV.x = event.clientX - vector.x - relas.x;
                        relativeUV.y = event.clientY - vector.y - relas.y;
                        return;
                    }
                    decalMeshs.get(changeDecalData.decalID).worldPosition = worldp.point;
                    decalMeshs.get(changeDecalData.decalID).UVPosition = worldp.uv;
                    decalMeshs.get(changeDecalData.decalID).normal = worldp.normal;
                    Web3DBins.prototype.checkIntersection2(event);
                }

            },

            auxiliaryZoomBegin: function (event) {
                event.preventDefault();
                relas = new THREE.Vector2(containerElement.offsetLeft, containerElement.offsetTop);
                var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                relativeUV.x = vector.x + relas.x, relativeUV.y = vector.y + relas.y;
                mouse.x = event.clientX;
                mouse.y = event.clientY;
                containerElement.addEventListener('mousemove', Web3DBins.prototype.auxiliaryZoomMove);
            },

            auxiliaryEnd: function () {
                containerElement.removeEventListener('mousemove', Web3DBins.prototype.auxiliaryZoomMove);
                containerElement.removeEventListener('mousemove', Web3DBins.prototype.auxiliaryRotateMove);
                containerElement.removeEventListener('mousemove', Web3DBins.prototype.auxiliaryMove);
            },

            auxiliaryZoomMove: function (event) {
                /*var x = (event.clientX - mouse.x)/floatingBox.widths;
	var y = (event.clientY - mouse.y)/floatingBox.heights;
	var s = x>y?x:y;
	decalsScale(s);*/
                var s1 = mouse.distanceTo(relativeUV);
                var s2 = new THREE.Vector2(event.clientX, event.clientY).distanceTo(relativeUV);
                var s = s2 / s1;
                decalsScale(s);
                mouse.x = event.clientX;
                mouse.y = event.clientY;

                function decalsScale(s) {
                    var scales = decalMeshs.get(changeDecalData.decalID).decalScale;
                    scales *= s;
                    //console.log(s+"_"+scales);
                    if (scales < 0.1) {
                        scales = 0.1;
                    }
                    else if (scales > 3) {
                        scales = 3;
                    }
                    if (decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, undefined, scales)) return;
                    decalMeshs.get(changeDecalData.decalID).decalScale = scales;
                    floatingBox.scale = scales;
                    floatingBox.style.transform = "scale(" + scales + "," + scales + ")rotate(" + floatingBox.rotatetion + "deg)";
                    Web3DBins.prototype.checkIntersection2();
                }
            },

            auxiliaryRotateBegin: function () {
                event.preventDefault();
                relas = new THREE.Vector2(containerElement.offsetLeft, containerElement.offsetTop);
                var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                relativeUV.x = vector.x + relas.x, relativeUV.y = vector.y + relas.y;
                mouse.x = event.clientX;
                mouse.y = event.clientY;
                containerElement.addEventListener('mousemove', Web3DBins.prototype.auxiliaryRotateMove);
            },

            auxiliaryRotateMove: function (event) {
                event.preventDefault();
                var or = new THREE.Vector2(event.clientX - relativeUV.x, event.clientY - relativeUV.y);
                var x = Math.atan2(or.x, or.y);
                mouse.x -= relativeUV.x;
                mouse.y -= relativeUV.y;
                var z = Math.atan2(mouse.x, mouse.y);
                decalsRotate(z - x);
                mouse.x = event.clientX;
                mouse.y = event.clientY;

                function decalsRotate(angle) {
                    rotateOrigin = decalMeshs.get(changeDecalData.decalID).UVRotation;
                    var rat = (rotateOrigin - angle);
                    if (decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, undefined, undefined, rat)) return;
                    decalMeshs.get(changeDecalData.decalID).UVRotation = rat;
                    floatingBox.rotatetion = -rat / Math.PI * 180;
                    floatingBox.style.transform = "scale(" + floatingBox.scale + "," + floatingBox.scale + ")" + "rotate(" + -rat / Math.PI * 180 + "deg)";
                    Web3DBins.prototype.checkIntersection2();
                }
            },

            changeDecal: function (data) {//data里面包括开关和id

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    var decalMesh = decalMeshs.get(data.decalID);
                    if (!decalMesh) {//印花不存在
                        console.warn('Web3DBins.prototype.changeDecal:decal ' + data.decalID + ' is not exit');
                        return;
                    }
                    changeDecalData = data;
                    if (decalMeshs.get(data.decalID).decalT == "ALL") {
                        if (data.power == 1 || ( data.power == 2 && interruptionState === null )) {
                            Web3DBins.prototype.setInterruptionState("changeDecal");
                            Web3DBins.prototype.setControlsState(false);
                            renderer.domElement.addEventListener('mousedown', Web3DBins.prototype.decalsMoveBeginA);
                            renderer.domElement.addEventListener('mouseup', Web3DBins.prototype.decalsMoveEndA);
                            renderer.domElement.addEventListener('mouseleave', Web3DBins.prototype.decalsMoveEndA);//移出显示区域div时视为鼠标操作结束
                            renderer.domElement.addEventListener('wheel', Web3DBins.prototype.decalswheelA);
                        }
                        else if (data.power == 0 || ( data.power == 2 && interruptionState === "changeDecal")) {
                            renderer.domElement.removeEventListener('mousedown', Web3DBins.prototype.decalsMoveBeginA);
                            renderer.domElement.removeEventListener('mouseup', Web3DBins.prototype.decalsMoveEndA);
                            renderer.domElement.removeEventListener('mouseleave', Web3DBins.prototype.decalsMoveEndA);
                            renderer.domElement.removeEventListener('wheel', Web3DBins.prototype.decalswheelA);
                            Web3DBins.prototype.setControlsState(true);
                            Web3DBins.prototype.setInterruptionState(null);
                        }
                        return;
                    }

                    order = decalMeshs.get(data.decalID).areaOrder;
                    decalType = decalMeshs.get(data.decalID).decalType;
                    areaType = decalMesh.areaType;

                    //0:off 1:on 2:reverse
                    if (data.power == 1 || ( data.power == 2 && interruptionState === null )) {//开启印花修改
                        if (areaType == 1) {
                            Web3DBins.prototype.showDecalAreaMesh(2, decalMesh.assemblySceneName, data.decalID);
                        }
                        else if (areaType == 0) {
                            //
                        }
                        else if (areaType == 2) {
                            Web3DBins.prototype.showDecalAreaMesh(2, decalMesh.assemblySceneName, data.decalID);
                        }
                        var vector = decalMeshs.get(data.decalID).worldPosition.clone();
                        vector.x -= decalMeshs.get(data.decalID).width / 2;
                        vector.y -= decalMeshs.get(data.decalID).height / 2;
                        vector.project(camera);
                        vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                        vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                        var vector2 = decalMeshs.get(data.decalID).worldPosition.clone();
                        vector2.project(camera);
                        vector2.x = Math.round((0.5 + vector2.x / 2) * renderer.domElement.width);
                        vector2.y = Math.round((0.5 - vector2.y / 2) * renderer.domElement.height);
                        var scaleOfWaH = decalMeshs.get(data.decalID).width / decalMeshs.get(data.decalID).height;

                        var width = scaleOfWaH > 1 ? (vector.x - vector2.x) * 2 * 1.5 : (vector.y - vector2.y) * 2 * 1.5 * scaleOfWaH;
                        var height = scaleOfWaH > 1 ? width / scaleOfWaH : (vector.y - vector2.y) * 2 * 1.5;
                        var img = document.createElement("div");
                        img.style.zIndex = 2;
                        //img.style.border="thin solid yellow";
                        img.style.position = "relative";
                        img.style.left = vector2.x - width / 2 + "px";
                        img.style.top = vector2.y - height / 2 + "px";
                        img.style.width = width + "px";
                        img.style.height = height + "px";
                        img.style.transform = "scale(" + decalMesh.decalScale + "," + decalMesh.decalScale + ")" + "rotate(" + -decalMesh.UVRotation / Math.PI * 180 + "deg)";
                        img.widths = width;
                        img.heights = height;
                        var img3 = document.createElement("div");
                        img3.style.border = "thin solid blue";
                        img3.style.position = "absolute";
                        img3.style.right = width / 1.5 * 0.2 + "px";
                        img3.style.top = height / 1.5 * 0.2 + "px";
                        img3.style.width = width / 1.4 + "px";
                        img3.style.height = height / 1.4 + "px";
                        img.appendChild(img3);
                        var img4 = document.createElement("div");
                        //img4.style.border="thin solid red";
                        img4.style.position = "absolute";
                        img4.style.right = 0 + "px";
                        img4.style.top = 0 + "px";
                        img4.style.width = width / 1.5 * 0.2 + "px";
                        img4.style.height = height / 1.5 * 0.2 + "px";
                        var img4t = new Image();
                        img4t.style.width = "100%", img4t.style.height = "100%";
                        img4t.src = "data:image/png;base64,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";
                        img4t.style.position = "absolute";
                        img4.appendChild(img4t);
                        img.appendChild(img4);
                        var img5 = document.createElement("div");
                        //img5.style.border="thin solid red";
                        img5.style.position = "absolute";
                        img5.style.right = 0 + "px";
                        img5.style.bottom = 0 + "px";
                        img5.style.width = width / 1.5 * 0.2 + "px";
                        img5.style.height = height / 1.5 * 0.2 + "px";
                        var img5t = new Image();
                        img5t.style.width = "100%", img5t.style.height = "100%";
                        img5t.src = "data:image/png;base64,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";
                        img5t.style.position = "absolute";
                        img5.appendChild(img5t);
                        img.appendChild(img5);
                        var img6 = document.createElement("div");
                        //img6.style.border="thin solid red";
                        img6.style.position = "absolute";
                        img6.style.left = 0 + "px";
                        img6.style.top = 0 + "px";
                        img6.style.width = width / 1.5 * 0.2 + "px";
                        img6.style.height = height / 1.5 * 0.2 + "px";
                        var img6t = new Image();
                        img6t.src = "data:image/png;base64,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";
                        img6t.style.width = "100%";
                        img6t.style.height = "100%";
                        img6t.style.position = "absolute";
                        img6.appendChild(img6t);
                        img6.onclick = function () {
                            Web3DBins.prototype.changeDecal({decalID: changeDecalData.decalID, power: 0});
                            id = changeDecalData.decalID;
                            scene.remove(decalMesh);
                            scene.remove(scene.getObjectByName(id));
                            Web3DBins.prototype.cacheClear(decalMeshs.get(id).mesh);
                            //var tmpOrder = decalOrderMap.get(id);
                            //scene.remove(tmpOrder);
                            //Web3DBins.prototype.cacheClear(tmpOrder);
                            renderer.render(scene, camera);
                            decalMeshs.delete(id);
                        }
                        img.appendChild(img6);
                        img3.addEventListener("mousedown", Web3DBins.prototype.auxiliaryMoveBegin);
                        img4.addEventListener("mousedown", Web3DBins.prototype.auxiliaryRotateBegin);
                        img5.addEventListener('mousedown', Web3DBins.prototype.auxiliaryZoomBegin);
                        containerElement.addEventListener('mouseup', Web3DBins.prototype.auxiliaryEnd);
                        containerElement.addEventListener('mouseleave', Web3DBins.prototype.auxiliaryEnd);
                        containerElement.appendChild(img);
                        floatingBox = img;
                        floatingBox.i3 = img3;
                        floatingBox.i4 = img4;
                        floatingBox.i5 = img5;
                        floatingBox.rotatetion = -decalMesh.UVRotation / Math.PI * 180;
                        floatingBox.scale = decalMesh.decalScale;
                        //Web3DBins.prototype.createKK();
                        Web3DBins.prototype.setInterruptionState("changeDecal");
                        Web3DBins.prototype.setControlsState(false);
                        //renderer.domElement.addEventListener('mousedown',Web3DBins.prototype.decalsMoveBegin);
                        //renderer.domElement.addEventListener('mouseup',Web3DBins.prototype.decalsMoveEnd);
                        //renderer.domElement.addEventListener('mouseleave',Web3DBins.prototype.decalsMoveEnd);//移出显示区域div时视为鼠标操作结束
                        //renderer.domElement.addEventListener('wheel',Web3DBins.prototype.decalswheel);
                    }
                    else if (data.power == 0 || ( data.power == 2 && interruptionState === "changeDecal")) {//关闭印花修改
                        // renderer.domElement.removeEventListener('mousedown',Web3DBins.prototype.decalsMoveBegin);
                        // renderer.domElement.removeEventListener('mouseup',Web3DBins.prototype.decalsMoveEnd);
                        // renderer.domElement.removeEventListener('mouseleave',Web3DBins.prototype.decalsMoveEnd);
                        // renderer.domElement.removeEventListener('wheel',Web3DBins.prototype.decalswheel);
                        floatingBox.i3.removeEventListener("mousedown", Web3DBins.prototype.auxiliaryMoveBegin);
                        floatingBox.i4.removeEventListener("mousedown", Web3DBins.prototype.auxiliaryRotateBegin);
                        floatingBox.i5.removeEventListener('mousedown', Web3DBins.prototype.auxiliaryZoomBegin);
                        containerElement.removeEventListener('mouseup', Web3DBins.prototype.auxiliaryEnd);
                        containerElement.removeEventListener('mouseleave', Web3DBins.prototype.auxiliaryEnd);
                        containerElement.removeChild(floatingBox);
                        if (areaType != 0) Web3DBins.prototype.showDecalAreaMesh(0);
                        Web3DBins.prototype.setControlsState(true);
                        Web3DBins.prototype.setInterruptionState(null);
                    }
                    else {
                    }//其它无效值
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }


                function mousePosition(event) {
                    // if (event.pageX || event.pageY) {
                    //     return {
                    //         x:event.pageX,
                    //         y:event.pageY
                    //     };
                    // }
                    // else{
                    return {
                        x: event.offsetX,
                        y: event.offsetY
                    };
                    //}
                };

            },

// checkIntersection2 :function(){

//     var decalMesh = decalMeshs.get(changeDecalData.decalID);//印花模型

//     var raycaster3 = new THREE.Raycaster();
//     raycaster3.setFromCamera( decalMeshs.get(changeDecalData.decalID).mouse.clone(), camera );

//     var intersects = raycaster3.intersectObjects( [ meshMap[decalMesh.assemblySceneName] ] );

//     if ( intersects.length > 0 ) {
//         scene.remove( decalMeshs.get(changeDecalData.decalID).mesh );

//         var p = intersects[ 0 ].point;
//         mouseHelper.position.copy( p );
//         intersection.point.copy( p );

//         var vv =intersects[ 0 ].uv;
//         console.log("vv");
//         console.log(vv);

//         var n = intersects[ 0 ].face.normal.clone();
//         n.multiplyScalar( 10 );
//         n.add( intersects[ 0 ].point );

//         intersection.normal.copy( intersects[ 0 ].face.normal );
//         mouseHelper.lookAt( n );

//         decalMesh.UVPosition = vv.clone();
//         //修改rotation

//         decalMeshs.set(changeDecalData.decalID,decalMesh);//更新数组数据

//         intersection.intersects = true;

//         Web3DBins.prototype.shoot({
//             "decalID":changeDecalData.decalID,
//             "assemblySceneName":decalMesh.assemblySceneName,
//             "decalScale":decalMesh.decalScale,
//             "nz":n.z
//         });

//     } else {

//         intersection.intersects = false;

//     }
// },
            /**
             * 帧跳转
             */
            frameChoose: function (data, callback) {
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    if (THREE.OrbitControls.prototype.controlType == 1) {
                        var distancetmp = 0, scaletmp = 1, angletmp = 0;
                        if (data.distance != undefined && data.distance != null) {
                            distancetmp = (parseFloat(data.distance) - controls.totalDistance) / 20;
                        }
                        if (data.scale != undefined && data.scale != null) {
                            scaletmp = Math.pow(parseFloat(data.scale) / controls.totalScale, 1 / 20);
                        }
                        if (data.angle != undefined && data.angle != null) {
                            var j = controls.getAzimuthalAngle() - Math.PI + parseFloat(data.angle);
                            //angletmp=(controls.getAzimuthalAngle()-Math.PI+data.angle)/20;
                            angletmp = j > Math.PI ? (j - 2 * Math.PI) / 20 : (j / 20);
                        }
                        var i = 0;
                        rendert();

                        function rendert() {
                            if (i == 20) {
                                if (callback != undefined) callback();
                                return;
                            }
                            i++;
                            setTimeout(rendert, 30);
                            controls.panUpByDistance(distancetmp);
                            controls.zoomAndUpdate(scaletmp);
                            controls.rotateLeftByAngle(angletmp);
                            for (var n in lightControlsGroup) {
                                lightControlsGroup[n].rotateLeftByAngle(angletmp);
                            }
                        }
                    }
                    else if (THREE.OrbitControls.prototype.controlType == 2) {
                        var distancetmp = 0, scaletmp = 1, angletmp = 0;
                        if (data.distance != undefined && data.distance != null) {
                            var j = controls.getAzimuthalPhi() - Math.PI + parseFloat(data.distance);
                            distancetmp = (j / 20);
                        }
                        if (data.scale != undefined && data.scale != null) {
                            scaletmp = Math.pow(parseFloat(data.scale) / controls.totalScale, 1 / 20);
                        }
                        if (data.angle != undefined && data.angle != null) {
                            var j = controls.getAzimuthalAngle() - Math.PI + parseFloat(data.angle);
                            //angletmp=(controls.getAzimuthalAngle()-Math.PI+data.angle)/20;
                            angletmp = j > Math.PI ? (j - 2 * Math.PI) / 20 : (j / 20);
                        }
                        var i = 0;
                        rendert();

                        function rendert() {
                            if (i == 20) {
                                if (callback != undefined) callback();
                                return;
                            }
                            i++;
                            setTimeout(rendert, 30);
                            controls.rotateUpByAngle(distancetmp);
                            controls.zoomAndUpdate(scaletmp);
                            controls.rotateLeftByAngle(angletmp);
                            for (var n in lightControlsGroup) {
                                lightControlsGroup[n].rotateLeftByAngle(angletmp);
                                lightControlsGroup[n].rotateUpByAngle(distancetmp);
                            }
                        }
                    }
                    else {
                        console.warn('interruption ' + interruptionState + ' is enable.');
                    }
                }
            },

            /**
             * 获取当前帧状态值
             */
            frameStatue: function (callback) {
                var obj = null;
                if (THREE.OrbitControls.prototype.controlType == 1) {
                    obj = {
                        "distance": controls.totalDistance,
                        "scale": controls.totalScale,
                        "angle": (Math.PI - controls.getAzimuthalAngle())
                    };
                }
                else if (THREE.OrbitControls.prototype.controlType == 2) {
                    obj = {
                        "distance": (Math.PI - controls.getAzimuthalPhi()),
                        "scale": controls.totalScale,
                        "angle": (Math.PI - controls.getAzimuthalAngle())
                    };
                }
                if (callback) {
                    callback(obj);
                }
                else return obj;
            },

            /**
             * 获取web3d实例
             */
            clone: function (divName, callback) {
                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {
                    var tmp = Web3DBin(divName);
                    var copy = new Object();
                    copy.meshMap = meshMap;
                    copy.camera = camera;
                    copy.renderer = renderer;
                    copy.receiveShadows = receiveShadows;
                    copy.geometryGroup = geometryGroup;
                    copy.receiveShadows = receiveShadows;
                    copy.blendMap = blendMap;
                    copy.scene = scene;
                    copy.lightControlsGroup = lightControlsGroup;
                    copy.lightGroup = lightGroup;
                    copy.controls = controls;
                    copy.name = divName;
                    copy.meshDecalAreaMap = meshDecalAreaMap;
                    copy.filePrefix = filePrefix;
                    copy.fileSuffix = fileSuffix;
                    var copyW = tmp.setParamter(copy);
                    tmp = null;
                    copy = null;
                    return copyW;
                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }
            },

            /**
             * 设置web3d实例对象属性（内部）
             */
            setParamter: function (copy) {

                interruptionState = null;
                filePrefix = copy.filePrefix;
                fileSuffix = copy.fileSuffix;
                copy.receiveShadows.forEach(function (value, key, map) {
                    var tmpMesh = value.clone();
                    geometryGroup.set(key, tmpMesh);
                });
                copy.geometryGroup.forEach(function (value, key, map) {
                    var tmpGeo = value.clone();
                    geometryGroup.set(key, tmpGeo);
                });
                copy.meshDecalAreaMap.forEach(function (value, key, map) {
                    var obj = new Object();
                    obj.decalArea = value.decalArea;
                    obj.assemblyUVMappingSRC = value.assemblyUVMappingSRC;
                    obj.areaRotation = value.areaRotation;
                    obj.areaCenter = value.areaCenter;
                    obj.decalType = value.decalType;
                    meshDecalAreaMap.set(key, obj);
                });
                copy.blendMap.forEach(function (value, key, map) {
                    var tmpMesh = value.clone();
                    scene.add(tmpMesh);
                    blendMap.set(key, tmpMesh);
                });
                for (var n in copy.meshMap) {
                    var tmpMesh = copy.meshMap[n].clone();
                    scene.add(tmpMesh);
                    meshMap[n] = tmpMesh;
                }
                for (var n in copy.lightControlsGroup) {
                    copy.lightControlsGroup[n].saveState1();
                }
                copy.controls.saveState1();
                for (var n in copy.lightControlsGroup) {
                    copy.lightControlsGroup[n].reset();
                }
                copy.controls.reset();
                for (var n in copy.lightGroup) {
                    var lightNow;
                    switch (copy.lightGroup[n].type) {
                        case "AmbientLight":
                            lightNow = new THREE.AmbientLight(copy.lightGroup[n].color);
                            break;
                        case "DirectionalLight":
                            lightNow = new THREE.DirectionalLight(copy.lightGroup[n].color);
                            break;
                        case "HemisphereLight":
                            lightNow = new THREE.HemisphereLight(copy.lightGroup[n].color);
                            break;
                        case "PointLight":
                            lightNow = new THREE.PointLight(copy.lightGroup[n].color);
                            break;
                        case "SpotLight":
                            lightNow = new THREE.SpotLight(copy.lightGroup[n].color);
                            break;
                        default:
                            break;
                    }
                    lightNow.position.copy(copy.lightGroup[n].position);
                    lightNow.intensity = copy.lightGroup[n].intensity;
                    lightNow.targetqs = new THREE.Vector3();
                    lightNow.targetqs.copy(copy.lightGroup[n].targetqs);
                    lightNow.name = copy.lightGroup[n].name;
                    lightGroup.push(lightNow);
                    var control2 = new THREE.OrbitControls(lightNow, renderer.domElement);
                    control2.updateControlType();
                    control2.enableZoom = false;
                    control2.maxPolarAngle = copy.controls.maxPolarAngle;
                    control2.name = lightNow.name;
                    scene.add(lightNow);
                    control2.saveState();
                    lightControlsGroup.push(control2);
                }
                camera = copy.camera.clone();
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.updateControlType();
                controls.maxPolarAngle = copy.controls.maxPolarAngle;
                controls.minDistance = copy.controls.minDistance;
                controls.maxDistance = copy.controls.maxDistance;
                controls.saveState();
                for (var n in copy.lightControlsGroup) {
                    copy.lightControlsGroup[n].reset1();
                }
                copy.controls.reset1();
                if (canEle == undefined) {
                    containerElement = document.body;
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
                else {
                    containerElement = document.getElementById(canEle);
                    renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
                }
                containerElement.appendChild(renderer.domElement);
                camera.aspect = renderer.domElement.width / renderer.domElement.height;
                camera.updateProjectionMatrix();
                if (copy.camera.isSetFocalLength != undefined) {
                    var f = copy.camera.getFocalLength();
                    var sc = copy.renderer.domElement.width / copy.renderer.domElement.height;
                    if (sc > 1) f = sc * f;
                    else f = f / sc;
                    var s = renderer.domElement.width / renderer.domElement.height;
                    if (s > 1) camera.setFocalLength(f / s);
                    else camera.setFocalLength(s * f);
                }
                renderer.render(scene, camera);
                controls.addEventListener('change', Web3DBins.prototype.renderanimate);
                window.addEventListener('resize', Web3DBins.prototype.onWindowResize, false);
                Web3DBins.prototype.onWindowResize();
                copy = null;
                cloneObj = null;
                return this;
            },

            /**
             * 根据绣花属性值重新进行印绣花（内部）
             */
            checkIntersection2: function (event) {

                var decalMesh = decalMeshs.get(changeDecalData.decalID);//印花
                /*if( ! Web3DBins.prototype.isEffectiveDecalInArea( decalMesh.UVPosition, meshMap[decalMesh.assemblySceneName].name ) ){
            //不在印花区域内
            return;
        }*/
                //Web3DBins.prototype.cacheClear(decalMesh.mesh);
                scene.remove(decalMesh.mesh);
                decalMesh.mesh.geometry.dispose();

                var p = decalMesh.worldPosition;
                mouseHelper.position.copy(p);
                intersection.point.copy(p);
                //decalOrderMap.get(changeDecalData.decalID).position.copy(p);

                var vv = decalMesh.UVPosition;
                // if( decalMesh.UVPositionMove !== undefined ){//存在UV偏移量
                //     vv.x = vv.x + decalMesh.UVPositionMove.x;
                //     vv.y = vv.y + decalMesh.UVPositionMove.y;
                // }

                var n = decalMesh.normal.clone();
                n.multiplyScalar(10);
                n.add(p);

                intersection.normal.copy(n);
                mouseHelper.lookAt(n);


                intersection.intersects = true;

                Web3DBins.prototype.shoot({
                    "decalID": changeDecalData.decalID,
                    "assemblySceneName": decalMesh.assemblySceneName,
                    "decalScale": decalMesh.decalScale,
                    "nz": n.z
                });

            },

            /**
             * 印绣花操作中放大（内部）
             */
            decalsScale: function (s) {
                if (decalMeshs.get(changeDecalData.decalID).scaleEnable == true) {
                    var scales = decalMeshs.get(changeDecalData.decalID).decalScale;
                    scales += s;
                    // console.log("event.wheelDelta"+event.wheelDelta);
                    if (scales < 0.1) {
                        scales = 0.1;
                    }
                    else if (scales > 3) {
                        scales = 3;
                    }
                    if (decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, undefined, scales)) return;
                    decalMeshs.get(changeDecalData.decalID).decalScale = scales;
                    floatingBox.style.transform = "scale(" + scales + "," + scales + ")";
                    Web3DBins.prototype.checkIntersection2();
                }
                else {
                    console.warn("this decal's scaleEnable is false");
                }
            },

            /**
             * 修改印绣花时滚轮动作（内部）
             */
            decalswheel: function (event) {

                if (decalMeshs.get(changeDecalData.decalID).scaleEnable == true) {
                    var scales = decalMeshs.get(changeDecalData.decalID).decalScale;
                    scales += event.wheelDelta / 1200.0;
                    // console.log("event.wheelDelta"+event.wheelDelta);
                    if (scales < 0.1) {
                        scales = 0.1;
                    }
                    else if (scales > 3) {
                        scales = 3;
                    }
                    if (decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, undefined, scales)) return;
                    decalMeshs.get(changeDecalData.decalID).decalScale = scales;
                    //去掉功能框 2019.1.09
                    //floatingBox.style.transform="scale(" + scales + ","+ scales +")";
                    Web3DBins.prototype.checkIntersection2();
                }
                else {
                    console.warn("this decal's scaleEnable is false");
                }
            },

            decalsmoveTest: function (event) {
                floatingBox.style.left = event.offsetX - relativeUV.x - floatingBox.widths / 2 + "px";
                floatingBox.style.top = eventPosition.y - relativeUV.y - floatingBox.heights / 2 + "px";
            },

            /**
             * 修改印绣花时右键动作（内部）
             */
            decalsRotate: function (angle) {
                console.log(angle);
                rotateOrigin = decalMeshs.get(changeDecalData.decalID).UVRotation;
                var rat = (rotateOrigin - angle);
                //var rz = (rotateOrigin - angle);
                if (decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, undefined, undefined, rat)) return;
                decalMeshs.get(changeDecalData.decalID).UVRotation = rat;
                //console.log(ttt);
                floatingBox.style.transform = "rotate(" + -rat / Math.PI * 180 + "deg)";
                Web3DBins.prototype.checkIntersection2();
            },

            /**
             * 修改印绣花时左键动作（内部）
             */
            decalsmove: function (event) {//内部函数，

                var decalMesh = decalMeshs.get(changeDecalData.decalID);
                switch (event.which) {
                    case 1:
                        //左键
                        if (decalMesh.translateEnable == true) {
                            //console.log(eventPosition);
                            eventPosition.x = event.offsetX;
                            eventPosition.y = event.offsetY;
                            mouse.x = ( (eventPosition.x - relativeUV.x) / renderer.domElement.width) * 2 - 1;
                            mouse.y = -( (eventPosition.y - relativeUV.y) / renderer.domElement.height ) * 2 + 1;
                            //去掉功能框 2019.1.09
                            //floatingBox.style.left = event.offsetX - relativeUV.x - floatingBox.widths/2 + "px";
                            //floatingBox.style.top = eventPosition.y-relativeUV.y - floatingBox.heights/2 + "px";


                            //floatingBox.style.left = event.offsetX - floatingBox.widths/2 + "px";
                            //floatingBox.style.top = event.offsetY - floatingBox.heights/2 + "px";
                            //decalMeshs.get(changeDecalData.decalID).mouse = mouse.clone();

                            var worldp = Web3DBins.prototype.elementPToWorldP(mouse.x, mouse.y, decalMesh.assemblySceneName);
                            if (worldp != null) {
                                if (decalMesh.areaType != 0 && !decalType && !Web3DBins.prototype.isEffectiveDecalInArea2(worldp.uv, decalMesh, event)) {
                                    //不在印花区域内
                                    return;
                                }
                                if (decalMesh.areaType != 0 && decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, worldp.uv)) {
                                    var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                                    vector.project(camera);
                                    vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                                    vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                                    relativeUV.x = event.offsetX - vector.x;
                                    relativeUV.y = event.offsetY - vector.y;
                                    return;
                                }
                                decalMeshs.get(changeDecalData.decalID).worldPosition = worldp.point;
                                decalMeshs.get(changeDecalData.decalID).UVPosition = worldp.uv;
                                decalMeshs.get(changeDecalData.decalID).normal = worldp.normal;
                                Web3DBins.prototype.checkIntersection2(event);
                            }
                        }
                        else {
                            console.warn("this decal's translateEnable is false");
                        }
                        break;
                    case 2:
                        //中键
                        break;
                    case 3:
                        //右键
                        if (decalMesh.rotateEnable == true) {
                            mouseRotation(event);
                            // eventPosition.x = event.offsetX;
                            // eventPosition.y = event.offsetY;
                            rotatePosition.x = event.offsetX;
                            rotatePosition.y = event.offsetY;


                            Web3DBins.prototype.checkIntersection2();
                        }
                        else {
                            console.warn("this decal's rotateEnable is false");
                        }
                        break;
                    default:
                        //其它，如键盘事件等
                        break;
                }

                function mouseRotation(event) {
                    mousePosLast = mousePosition(event);
                    // mousePosLast.x = mousePosLast.x - eventPosition.x;
                    // mousePosLast.y = mousePosLast.y - eventPosition.y;
                    // var originAngle=Math.atan2(mousePosOrigin.x,mousePosOrigin.y);
                    // var lastAngle=Math.atan2(mousePosLast.x,mousePosLast.y);
                    // decalMeshs.get(changeDecalData.decalID).UVRotation = (rotateOrigin + ( lastAngle - originAngle ));

                    rotateOrigin = decalMeshs.get(changeDecalData.decalID).UVRotation;

                    mousePosLast.x = mousePosLast.x - rotatePosition.x;
                    var rat = (rotateOrigin + ( Math.PI * mousePosLast.x / SCREEN_WIDTH ));
                    if (decalType && !Web3DBins.prototype.getFourPoint(changeDecalData.decalID, undefined, undefined, rat)) return;
                    decalMeshs.get(changeDecalData.decalID).UVRotation = rat;
                };

                function mousePosition(event) {
                    // if (event.pageX || event.pageY) {
                    //     return {
                    //         x:event.pageX,
                    //         y:event.pageY
                    //     };
                    // }
                    // else{
                    return {
                        x: event.offsetX,
                        y: event.offsetY
                    };
                    // }
                };
            },

            /**
             * 印绣花开始移动（内部）
             */
            decalsMoveBegin: function (event) {
                event.preventDefault();
                var decalMesh = decalMeshs.get(changeDecalData.decalID);
                if (event.button == THREE.MOUSE.LEFT) {
                    var vector = decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                    vector.project(camera);
                    //vector.x = ( vector.x + 1) * renderer.domElement.width / 2;
                    //vector.y = - ( vector.y - 1) * renderer.domElement.height / 2;
                    vector.x = Math.round((0.5 + vector.x / 2) * renderer.domElement.width);
                    vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                    relativeUV.x = event.offsetX - vector.x;
                    relativeUV.y = event.offsetY - vector.y;
                    mousePosOrigin = mousePosition(event);
                    mousePosOrigin.x = mousePosOrigin.x - eventPosition.x;
                    mousePosOrigin.y = mousePosOrigin.y - eventPosition.y;
                    //rotateOrigin = decalMeshs.get(changeDecalData.decalID).UVRotation;
                }
                else if (event.button == THREE.MOUSE.RIGHT) {
                    rotatePosition = mousePosition(event);
                }
                renderer.domElement.addEventListener('mousemove', Web3DBins.prototype.decalsmove);

                //containerElement.addEventListener('mousemove',Web3DBins.prototype.decalsmove);

                function mousePosition(event) {
                    return {
                        x: event.offsetX,
                        y: event.offsetY
                    };
                };
            },

            /**
             * 印绣花结束移动（内部）
             */
            decalsMoveEnd: function (event) {
                event.preventDefault();
                renderer.domElement.removeEventListener('mousemove', Web3DBins.prototype.decalsmove);
            },

            /**
             * 设置控制器状态（内部）
             */
            setControlsState: function (state) {
                controls.enabled = state;
                for (var i in lightControlsGroup) {
                    lightControlsGroup[i].enabled = state;
                }
            },

            /**
             * 删除印绣花
             * @param id 印绣花ID
             */
            deleteDecal: function (id) {

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {

                    if (!decalMeshs.get(id)) {//印花不存在
                        return false;
                    }
                    else {
                        scene.remove(decalMeshs.get(id).mesh);
                        scene.remove(scene.getObjectByName(id));
                        Web3DBins.prototype.cacheClear(decalMeshs.get(id).mesh);
                        //var tmpOrder = decalOrderMap.get(id);
                        //scene.remove(tmpOrder);
                        //Web3DBins.prototype.cacheClear(tmpOrder);
                        //composer.render();
                        renderer.render(scene, camera);
                        decalMeshs.delete(id);
                        return true;
                    }

                }
                else {
                    console.warn('interruption ' + interruptionState + ' is enable.');
                }

            },

            /**
             * 获取模型印花结果图
             * @param assemblySceneName 模型名称
             * @param callback 回调函数，返回结果数据
             */
            getDecal: function (assemblySceneName, callback) {
                var selectDecal = new Array();
                if (meshMap[assemblySceneName] != undefined && decalMeshs.size != 0) {
                    decalMeshs.forEach(function (data, index, arr) {
                        if (data.assemblySceneName == assemblySceneName) {
                            selectDecal.push(data);
                        }
                    });
                    if (selectDecal.length > 0) {
                        decalstest(selectDecal, callback);
                    }
                }
                else {
                    return null;
                }

                function decalstest(data, callback) {
                    //带UV图
                    var canvas = document.createElement('canvas');
                    canvas.style.position = "absolute";
                    var img = new Image();//UV图
                    //img.src=data[0].versionImgSRC;
                    img.crossOrigin = "anonymous";
                    img.src = filePrefix + data[0].versionImgSRC + fileSuffix;//version 1.5
                    img.onload = function () {
                        var decalsMessage = new Object();
                        decalsMessage.param = new Array();
                        canvas.width = img.width;
                        canvas.height = img.height;

                        var context = canvas.getContext("2d");
                        context.globalCompositeOperation = "destination-over";
                        context.drawImage(this, 0, 0);

                        var canvas2 = document.createElement('canvas');
                        canvas2.style.position = "absolute";
                        canvas2.width = img.width;
                        canvas2.height = img.height;
                        var context2 = canvas2.getContext("2d");

                        for (var i in data) {
                            decalsMessage.param[i] = {
                                "id": data[i].mesh.name,
                                "assemblySceneName": data[i].assemblySceneName,
                                "UVposition": data[i].UVPosition,
                                "UVRotation": data[i].UVRotation,
                                "worldPosition": data[i].worldPosition,
                                "normal": data[i].normal,
                                "decalScale": data[i].decalScale,
                                "rotateEnable": data[i].rotateEnable,
                                "scaleEnable": data[i].scaleEnable,
                                "translateEnable": data[i].translateEnable
                            };
                            if (data[i].htmlData) {
                                decalsMessage.param[i].htmlData = data[i].htmlData;
                            }
                            else {
                                decalsMessage.param[i].decalImageSRC = data[i].decalImage.src;
                            }
                            var cutDecalArea = data[i].decalArea;
                            var areaRotation = data[i].areaRotation != undefined ? data[i].areaRotation : 0;
                            var center = data[i].areaCenter != undefined ? data[i].areaCenter : {x: 0, y: 0};
                            var img2 = data[i].decalImage;//贴花图
                            context.globalCompositeOperation = "source-over";
                            //data[i].UVPosition.rotateAround(center,-areaRotation);
                            var tmpUV = data[i].UVPosition.clone();
                            tmpUV.rotateAround(center, -areaRotation);
                            var decalWidth = tmpUV.x * img.width;
                            var decalHeight = (1 - tmpUV.y) * img.height;//UV与canvas坐标系不同
                            //var scale = data.decalScale*S/(49*25.4);
                            //var scale = data[i].decalTextureScale;
                            var widthScale = data[i].width * data[i].decalScale * conversionRatio;
                            var heigthScale = data[i].height * data[i].decalScale * conversionRatio;
                            context.translate(decalWidth, decalHeight);
                            context.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                            //context.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                            context.translate(-decalWidth, -decalHeight);
                            context.drawImage(img2, decalWidth - img.width * widthScale * 0.5, decalHeight - img.height * heigthScale * 0.5, img.width * widthScale, img.height * heigthScale);
                            context.translate(decalWidth, decalHeight);
                            context.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                            //context.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                            context.translate(-decalWidth, -decalHeight);

                            //无uv图
                            context2.translate(decalWidth, decalHeight);
                            context2.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                            context2.translate(-decalWidth, -decalHeight);
                            context2.drawImage(img2, decalWidth - img.width * widthScale * 0.5, decalHeight - img.height * heigthScale * 0.5, img.width * widthScale, img.height * heigthScale);
                            context2.translate(decalWidth, decalHeight);
                            context2.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                            context2.translate(-decalWidth, -decalHeight);


                            if (cutDecalArea != undefined) {//有贴花区域
                                //alert(data[i].decalID);
                                var reImg = context.getImageData(cutDecalArea.minX * canvas.width, (1 - cutDecalArea.maxY) * canvas.width, (cutDecalArea.maxX - cutDecalArea.minX) * canvas.width, (cutDecalArea.maxY - cutDecalArea.minY) * canvas.width);
                                context.translate(decalWidth, decalHeight);
                                context.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                                context.translate(-decalWidth, -decalHeight);
                                context.clearRect(decalWidth - img.width * widthScale * 0.5, decalHeight - img.height * heigthScale * 0.5, img.width * widthScale, img.height * heigthScale);
                                context.translate(decalWidth, decalHeight);
                                context.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                                context.translate(-decalWidth, -decalHeight);
                                //context.clearRect( 0, 0, canvas.width, canvas.height );
                                //context.drawImage(this, 0, 0);
                                var canvastmp = document.createElement('canvas');
                                canvastmp.width = (cutDecalArea.maxX - cutDecalArea.minX) * canvas.width;
                                canvastmp.height = (cutDecalArea.maxY - cutDecalArea.minY) * canvas.width;
                                var tc = canvastmp.getContext("2d");
                                tc.putImageData(reImg, 0, 0);
                                //context.putImageData( reImg, cutDecalArea.minX*canvas.width, (1-cutDecalArea.maxY)*canvas.width);
                                context.translate(center.x * canvas.width, (1 - center.y) * canvas.height);
                                context.rotate(-areaRotation);
                                context.translate(-center.x * canvas.width, -(1 - center.y) * canvas.height);
                                context.drawImage(canvastmp, cutDecalArea.minX * canvas.width, (1 - cutDecalArea.maxY) * canvas.height);
                                context.translate(center.x * canvas.width, (1 - center.y) * canvas.height);
                                context.rotate(areaRotation);
                                context.translate(-center.x * canvas.width, -(1 - center.y) * canvas.height);

                                var reImg2 = context2.getImageData(cutDecalArea.minX * canvas.width, (1 - cutDecalArea.maxY) * canvas.width, (cutDecalArea.maxX - cutDecalArea.minX) * canvas.width, (cutDecalArea.maxY - cutDecalArea.minY) * canvas.width);
                                context2.translate(decalWidth, decalHeight);
                                context2.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                                context2.translate(-decalWidth, -decalHeight);
                                context2.clearRect(decalWidth - img.width * widthScale * 0.5, decalHeight - img.height * heigthScale * 0.5, img.width * widthScale, img.height * heigthScale);
                                context2.translate(decalWidth, decalHeight);
                                context2.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                                context2.translate(-decalWidth, -decalHeight);
                                //context2.clearRect( 0, 0, canvas.width, canvas.height );
                                context2.translate(center.x * canvas.width, (1 - center.y) * canvas.height);
                                context2.rotate(-areaRotation);
                                context2.translate(-center.x * canvas.width, -(1 - center.y) * canvas.height);
                                context2.drawImage(canvastmp, cutDecalArea.minX * canvas.width, (1 - cutDecalArea.maxY) * canvas.height);
                                context2.translate(center.x * canvas.width, (1 - center.y) * canvas.height);
                                context2.rotate(areaRotation);
                                context2.translate(-center.x * canvas.width, -(1 - center.y) * canvas.height);
                            }
                        }

                        //var strDataURI = canvas.toDataURL();
                        //var strDataURI2 = canvas2.toDataURL();
                        decalsMessage.UVData = canvas.toDataURL();
                        decalsMessage.decalData = canvas2.toDataURL();
                        /*var getCtx=canvas.getContext("2d");
            var theImgData = (getCtx.getImageData(0, 0, canvas.width, canvas.height));
            var encoder=new JPEGEncoder();
            var rawData = encoder.encode(theImgData, 100);
            var blob = new Blob([rawData.buffer], {type: 'image/jpeg'});
            var jpegURI = URL.createObjectURL(blob);*/


                        // callback({
                        //     "param":[
                        //         {
                        //             "id":data[0].mesh.name,
                        //             "UVposition":data[0].UVPosition,
                        //             "UVRotation":data[0].UVRotation,
                        //             "decalTextureScale":data[0].decalTextureScale
                        //         }
                        //     ],
                        //     "UVData":strDataURI,
                        //     "decalData":strDataURI2
                        // });
                        callback(decalsMessage);
                    };
                };

            },

            /**
             * 获取某个印花信息
             * @param decalID 印花ID
             */
            getDecalMSG: function (decalID) {

                var decalMeshDecalID;
                var decalMSG = new Object();

                if (!decalMeshs.get(decalID)) {//印花不存在
                    return false;
                }
                else {
                    decalMeshDecalID = decalMeshs.get(decalID);
                    decalMSG.UVPosition = decalMeshDecalID.UVPosition;
                    decalMSG.UVRotation = decalMeshDecalID.UVRotation;
                    decalMSG.worldPosition = decalMeshDecalID.worldPosition;
                    decalMSG.normal = decalMeshDecalID.normal;
                    decalMSG.assemblySceneName = decalMeshDecalID.assemblySceneName;
                    decalMSG.decalScale = decalMeshDecalID.decalScale;
                    decalMSG.rotateEnable = decalMeshDecalID.rotateEnable;
                    decalMSG.scaleEnable = decalMeshDecalID.scaleEnable;
                    decalMSG.id = decalMeshDecalID.sceneName;
                    decalMSG.translateEnable = decalMeshDecalID.translateEnable;
                    if (decalMeshDecalID.htmlData) {//绣字
                        decalMSG.htmlData = decalMeshDecalID.htmlData;
                    }
                    else {//非绣字
                        decalMSG.decalImageSRC = decalMeshDecalID.decalImage.src;
                    }
                    return decalMSG;
                }

            },

            /**
             * 确认当前使能（内部）
             * @param functionName 接口名称
             */
            checkInterruptionState: function (functionName) {

                if (interruptionState === null) {//无中断
                    return true;
                }
                else {
                    if (interruptionState == functionName) {//关闭中断
                        if (functionName == "changeDecal") {//修改印花是持续性操作
                            return true;
                        }
                        if (functionName == "magnifier") {
                            return true;
                        }
                        Web3DBins.prototype.setInterruptionState(null);
                        return true;
                    }
                    else {//某中断处于启用状态
                        return false;
                    }
                }
            },

            /**
             * 设置当前使能（内部）
             * @param state 接口名称
             */

            setInterruptionState: function (state) {

                interruptionState = state;
                if (state === null) {
                    controls.addEventListener('change', Web3DBins.prototype.renderanimate);
                }
                else {
                    controls.removeEventListener('change', Web3DBins.prototype.renderanimate);
                }

            },

            /**
             * 修改灯光
             * @param lightMessage 灯光数据
             */
            changeLights: function (lightMessage) {
                var lightChangeGroup = lightMessage.lights;
                for (var i = 0; i < lightChangeGroup.length; i++) {
                    var tmpLight = lightChangeGroup[i];
                    if (tmpLight.lightType == null) {
                        for (var n = 0; n < lightGroup.length; n++) {
                            if (lightGroup[n].name == tmpLight.lightCode) {
                                deleteLight(n);
                                break;
                            }
                        }
                        continue;
                    }
                    else {
                        var judge = 0;
                        for (var n = 0; n < lightGroup.length; n++) {
                            if (lightGroup[n].name == tmpLight.lightCode) {
                                if (lightGroup[n].type == tmpLight.lightType) {
                                    changeLight(tmpLight);
                                } else {
                                    deleteLight(n);
                                    addLight(tmpLight);
                                }
                                judge = 1;
                                break;
                            }
                        }
                        if (judge == 1) continue;
                        addLight(tmpLight);
                    }
                }
                Web3DBins.prototype.setCompareLightControl();
                //composer.render();
                renderer.render(scene, camera);

                function deleteLight(n) {
                    lightControlsGroup[n].dispose();
                    lightControlsGroup.splice(n, 1);
                    scene.remove(lightGroup[n]);
                    lightGroup.splice(n, 1);
                };

                function addLight(tmpLight) {
                    var lightNow;
                    switch (tmpLight.lightType) {
                        case "AmbientLight":
                            lightNow = new THREE.AmbientLight(tmpLight.lightColor);
                            break;
                        case "DirectionalLight":
                            lightNow = new THREE.DirectionalLight(tmpLight.lightColor);
                            break;
                        case "HemisphereLight":
                            lightNow = new THREE.HemisphereLight(tmpLight.lightColor);
                            break;
                        case "PointLight":
                            lightNow = new THREE.PointLight(tmpLight.lightColor);
                            break;
                        case "SpotLight":
                            lightNow = new THREE.SpotLight(tmpLight.lightColor);
                            break;
                        default:
                            break;
                    }
                    var dataIntArr = Web3DBins.prototype.splitArr(tmpLight.lightPosition);
                    lightNow.name = tmpLight.lightCode;
                    lightNow.position.set(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                    lightNow.intensity = parseFloat(tmpLight.lightIntensity);
                    scene.add(lightNow);
                    lightGroup.push(lightNow);
                    var control2 = new THREE.OrbitControls(lightNow, renderer.domElement);
                    control2.name = tmpLight.lightCode;
                    control2.updateControlType();
                    control2.enableZoom = false;
                    control2.maxPolarAngle = controls.minDistance;
                    control2.saveState();
                    control2.rotateLeftByAngle(Math.PI - controls.getAzimuthalAngle());
                    lightControlsGroup.push(control2);
                };

                function changeLight(tmpLight) {
                    var dataIntArr = Web3DBins.prototype.splitArr(tmpLight.lightPosition);
                    lightControlsGroup[n].reset();
                    lightGroup[n].position.set(dataIntArr[0], dataIntArr[1], dataIntArr[2]);
                    lightGroup[n].intensity = parseFloat(tmpLight.lightIntensity);
                    lightGroup[n].color.set(tmpLight.lightColor);
                    lightControlsGroup[n].saveState();
                    lightControlsGroup[n].rotateLeftByAngle(Math.PI - controls.getAzimuthalAngle());
                };
            },

            /**
             * 浏览器坐标转模型世界坐标（内部）
             * @param elementX x坐标
             * @param elementY y坐标
             * @param assemblySceneName 模型名称
             */
            elementPToWorldP: function (elementX, elementY, assemblySceneName) {
                var worldPoint = new Object();
                var elementMouse = new THREE.Vector2();
                elementMouse.x = elementX;
                elementMouse.y = elementY;
                var raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(elementMouse, camera);
                var intersects = raycaster.intersectObjects([meshMap[assemblySceneName]]);
                if (intersects.length > 0) {

                    worldPoint.point = intersects[0].point.clone();
                    worldPoint.uv = intersects[0].uv.clone();
                    worldPoint.normal = intersects[0].face.normal.clone();

                    return worldPoint;
                }
                else {
                    return null;
                }
            },

            /**
             * uv坐标转模型世界坐标（内部）
             * @param UVX uv x轴坐标
             * @param UVX uv y轴坐标
             * @param assemblySceneName 模型名称
             */
            UVPToWorldP: function (UVX, UVY, assemblySceneName) {
                var meshGeometry;
                meshGeometry = meshMap[assemblySceneName].geometry;

                var relativePos = meshMap[assemblySceneName].position;//模型所在区域在世界坐标中的相对坐标
                var facesUV = meshGeometry.faceVertexUvs[0];
                var faces = meshGeometry.faces;
                var vectors = meshGeometry.vertices;

                var facesUVI = null;

                var triangleArray = [];
                var p = new THREE.Vector2(UVX, UVY);

                var spacePoint;

                for (var i in facesUV) {//遍历“面-UV”
                    if (pointInTriangle(p, facesUV[i][0], facesUV[i][1], facesUV[i][2])) {//UV坐标在三角形内
                        facesUVI = i;

                        if (compareVector3(vectors[faces[i].a], vectors[faces[i].b]) || compareVector3(vectors[faces[i].a], vectors[faces[i].c]) || compareVector3(vectors[faces[i].b], vectors[faces[i].c])) {//三角形内有点同世界坐标
                            continue;
                        }
                        if (compareVector2(facesUV[i][0], facesUV[i][1]) || compareVector2(facesUV[i][0], facesUV[i][2]) || compareVector2(facesUV[i][1], facesUV[i][2])) {//三角形内有点同UV
                            continue;
                        }
                        if ((facesUV[i][0].x == facesUV[i][1].x && facesUV[i][0].x == facesUV[i][2].x) || (facesUV[i][0].y == facesUV[i][1].y && facesUV[i][0].y == facesUV[i][2].y)) {//三点UV同线
                            continue;
                        }

                        triangleArray.push({
                            "a": vectors[faces[i].a],
                            "b": vectors[faces[i].b],
                            "c": vectors[faces[i].c],
                            "auv": facesUV[i][0],
                            "buv": facesUV[i][1],
                            "cuv": facesUV[i][2]
                        });
                    }
                }
                if (facesUVI == null) {//模型几何体上没找到匹配该UV的点
                    console.error("there's no point in this model with the UV");
                    return null;
                }
                else {
                    if (triangleArray.length != 0) {
                        spacePoint = UVToSpace(p, triangleArray[0].auv, triangleArray[0].buv, triangleArray[0].cuv, triangleArray[0].a, triangleArray[0].b, triangleArray[0].c);
                        //spacePoint.point.add( relativePos );
                        var x = meshMap[assemblySceneName].getWorldScale();
                        spacePoint.point.multiply(x);
                        spacePoint.point.add(relativePos);
                        var judgeBox = new THREE.Box3().setFromObject(meshMap[assemblySceneName]);
                        var center = judgeBox.getCenter();
                        var direction = new THREE.Vector3(center.x - spacePoint.point.x, center.y - spacePoint.point.y, center.z - spacePoint.point.z).normalize();
                        if (direction.dot(spacePoint.normal) > 0) {
                            spacePoint.normal.negate();
                        }
                        return spacePoint;
                    }
                    else {//模型UV重叠
                        console.error("there's no point in this model with the UV");
                        return null;
                    }
                }


                function pointInTriangle(p, a, b, c) {
                    var ac = new THREE.Vector2();
                    var ab = new THREE.Vector2();
                    var ap = new THREE.Vector2();

                    ac.subVectors(c, a);
                    ab.subVectors(b, a);
                    ap.subVectors(p, a);

                    var fi = ap.dot(ac) * ab.dot(ab) - ap.dot(ab) * ac.dot(ab);
                    var fj = ap.dot(ab) * ac.dot(ac) - ap.dot(ac) * ab.dot(ac);
                    var fd = ac.dot(ac) * ab.dot(ab) - ac.dot(ab) * ac.dot(ab);

                    if (fd < 0) {
                        console.log("error:UVPToWorldP.pointInTriangle:fd<0");
                    }

                    if (fi >= 0 && fj >= 0 && fi + fj - fd <= 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                function compareVector3(v1, v2) {
                    var sameNum = 0;
                    for (var i = 0; i <= 2; i++) {
                        if (v1.getComponent(i) == v2.getComponent(i)) {
                            sameNum++;
                        }
                    }
                    if (sameNum == 3) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                function compareVector2(v1, v2) {
                    var sameNum = 0;
                    for (var i = 0; i <= 1; i++) {
                        if (v1.getComponent(i) == v2.getComponent(i)) {
                            sameNum++;
                        }
                    }
                    if (sameNum == 2) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                function UVToSpace(pUV, aUV, bUV, cUV, a, b, c) {
                    var ac2 = new THREE.Vector2();
                    var ab2 = new THREE.Vector2();
                    var ap2 = new THREE.Vector2();
                    var ac3 = new THREE.Vector3();
                    var ab3 = new THREE.Vector3();
                    var ap3 = new THREE.Vector3();
                    var spaceVector = a.clone();
                    var spacePoint = new Object();
                    spacePoint.normal = new THREE.Vector3();

                    ac2.subVectors(cUV, aUV);
                    ab2.subVectors(bUV, aUV);
                    ap2.subVectors(pUV, aUV);

                    ac3.subVectors(c, a);
                    ab3.subVectors(b, a);
                    ap3.subVectors(p, a);

                    var fi = ap2.dot(ac2) * ab2.dot(ab2) - ap2.dot(ab2) * ac2.dot(ab2);
                    var fj = ap2.dot(ab2) * ac2.dot(ac2) - ap2.dot(ac2) * ab2.dot(ac2);
                    var fd = ac2.dot(ac2) * ab2.dot(ab2) - ac2.dot(ab2) * ac2.dot(ab2);

                    spaceVector.addScaledVector(ac3, fi / fd);
                    spaceVector.addScaledVector(ab3, fj / fd);

                    spacePoint.point = spaceVector;
                    spacePoint.uv = pUV.clone();
                    spacePoint.normal.crossVectors(ac3, ab3).normalize();
                    spacePoint.normal.setZ(-spacePoint.normal.z);
                    spacePoint.normal.setY(-spacePoint.normal.y);
                    spacePoint.normal.setX(-spacePoint.normal.x);

                    return spacePoint;
                };
            },

            /**
             * 材质生成（内部）
             * @param materials 材质信息
             * @param texturePath 贴图路径
             * @param crossOrigin 贴图跨域信息
             * @param callback 回调函数
             * @param id 当前模型加载进程id
             */
            initMaterials: function (materials, texturePath, crossOrigin, callback, id) {

                var array = [];
                for (var i = 0; i < materials.length; ++i) {
                    Web3DBins.prototype.countPicture(materials[i], id);
                }
                for (var i = 0; i < materials.length; ++i) {
                    array[i] = Web3DBins.prototype.createMaterial(materials[i], texturePath, crossOrigin, callback, id);
                }
                return array;
            },

            /**
             * 贴图统计（内部）
             * @param materials 材质信息
             * @param id 当前模型加载进程id
             */
            countPicture: function (materials, id) {//内部函数，统计材质中贴图数量

                for (var name in materials) {

                    var value = materials[name];

                    switch (name) {
                        case 'mapDiffuse':
                        case 'mapEmissive':
                        case 'mapLight':
                        case 'mapAO':
                        case 'mapBump':
                        case 'mapNormal':
                        case 'mapSpecular':
                        case 'mapMetalness':
                        case 'mapRoughness':
                        case 'mapAlpha':
                            loadSurveillance[id].pictureNum += 1;
                            break;
                        default:
                            break;
                    }
                }
            },

            /**
             * 点击获取模型uv信息
             * @param assemblySceneName 模型名称
             * @param callback 回调函数，返回模型uv信息
             */
            getUVMSG: function (assemblySceneName, callback) {//

                function intersectionToUV() {

                    Web3DBins.prototype.setInterruptionState(null);
                    renderer.domElement.removeEventListener('click', intersectionToUV);
                    Web3DBins.prototype.setControlsState(true);
                    renderer.domElement.style.cursor = "default";

                    if (meshMap[assemblySceneName] == undefined) {//场景中没有该模型
                        console.warn('Web3DBins.prototype.getUVMSG:assemblySceneName is undefined');
                    }
                    else {

                        mouse.x = ( event.offsetX / renderer.domElement.width ) * 2 - 1;
                        mouse.y = -( event.offsetY / renderer.domElement.height ) * 2 + 1;
                        var raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera(mouse, camera);
                        var intersects = raycaster.intersectObjects([meshMap[assemblySceneName]]);
                        if (intersects.length > 0) {
                            callback(intersects[0].uv);
                        } else {
                            console.warn('Web3DBins.prototype.getUVMSG:position is error');
                        }
                    }
                };

                if (Web3DBins.prototype.checkInterruptionState(arguments.callee.name)) {

                    Web3DBins.prototype.setInterruptionState(arguments.callee.name);
                    renderer.domElement.style.cursor = "crosshair";
                    Web3DBins.prototype.setControlsState(false);
                    renderer.domElement.addEventListener('click', intersectionToUV);

                }
            },

            /**
             * 点击获取模型uv信息（内部）
             * @param data 模型数据
             * @param callback 回调函数，返回模型uv信息
             * @param texturePath 贴图路径null
             * @param jsonMaterials 材质信息null
             * @param jsonmodelHash 模型秘钥
             * @param jsonassemblyCode 模型编码
             */
            modelParseqs: function (data, callback, texturePath, jsonMaterials, jsonmodelHash, jsonassemblyCode) {//模型转换

                var Model = function () {

                    var scope = this,
                        currentOffset = 0,
                        md,
                        normals = [],
                        uvs = [],
                        start_tri_flat, start_tri_smooth, start_tri_flat_uv, start_tri_smooth_uv,
                        start_quad_flat, start_quad_smooth, start_quad_flat_uv, start_quad_smooth_uv,
                        tri_size, quad_size,
                        quad_uv_size, quad_normal_size, quad_vertex_size, quad_smooth_size,
                        end_tri_flat, end_tri_smooth, end_tri_flat_uv, end_tri_smooth_uv,
                        len_tri_flat, len_tri_smooth, len_tri_flat_uv, len_tri_smooth_uv,
                        len_quad_flat, len_quad_smooth, len_quad_flat_uv;


                    THREE.Geometry.call(this);

                    // console.log(parseUInt32( data, currentOffset + 20 + 4 * 10 ));
                    md = parseMetaData(data, currentOffset);
                    // console.log(md);

                    currentOffset += md.header_bytes;
                    /*
				md.vertex_index_bytes = Uint32Array.BYTES_PER_ELEMENT;
				md.material_index_bytes = Uint16Array.BYTES_PER_ELEMENT;
				md.normal_index_bytes = Uint32Array.BYTES_PER_ELEMENT;
				md.uv_index_bytes = Uint32Array.BYTES_PER_ELEMENT;
		*/
                    // buffers sizes

                    tri_size = md.vertex_index_bytes * 3 + md.material_index_bytes;
                    quad_size = md.vertex_index_bytes * 4 + md.material_index_bytes;

                    len_tri_flat = (md.ntri_flat - end_tri_smooth_uv) * ( tri_size );
                    len_tri_smooth = (md.ntri_smooth - end_tri_flat_uv) * ( tri_size + md.normal_index_bytes * 3 );
                    len_tri_flat_uv = (md.ntri_flat_uv - end_tri_smooth) * ( tri_size + md.uv_index_bytes * 3 );
                    len_tri_smooth_uv = (md.ntri_smooth_uv - end_tri_flat) * ( tri_size + md.normal_index_bytes * 3 + md.uv_index_bytes * 3 );

                    len_quad_flat = (md.nquad_flat - quad_smooth_size) * ( quad_size );
                    len_quad_smooth = (md.nquad_smooth - quad_vertex_size) * ( quad_size + md.normal_index_bytes * 4 );
                    len_quad_flat_uv = (md.nquad_flat_uv - quad_normal_size) * ( quad_size + md.uv_index_bytes * 4 );

                    // read buffers
                    currentOffset += init_normals(currentOffset);
                    currentOffset += handlePadding(md.nnormals * 3);

                    currentOffset += init_uvs(currentOffset);

                    currentOffset += init_vertices(currentOffset);


                    start_tri_flat = currentOffset;
                    start_tri_smooth = start_tri_flat + len_tri_flat + handlePadding((md.ntri_flat - end_tri_smooth_uv) * 2);
                    start_tri_flat_uv = start_tri_smooth + len_tri_smooth + handlePadding((md.ntri_smooth - end_tri_flat_uv) * 2);
                    start_tri_smooth_uv = start_tri_flat_uv + len_tri_flat_uv + handlePadding((md.ntri_flat_uv - end_tri_smooth) * 2);

                    start_quad_flat = start_tri_smooth_uv + len_tri_smooth_uv + handlePadding((md.ntri_smooth_uv - end_tri_flat) * 2);
                    start_quad_smooth = start_quad_flat + len_quad_flat + handlePadding((md.nquad_flat - quad_smooth_size) * 2);
                    start_quad_flat_uv = start_quad_smooth + len_quad_smooth + handlePadding((md.nquad_smooth - quad_vertex_size) * 2);
                    start_quad_smooth_uv = start_quad_flat_uv + len_quad_flat_uv + handlePadding((md.nquad_flat_uv - quad_normal_size) * 2);

                    // have to first process faces with uvs
                    // so that face and uv indices match

                    init_triangles_flat_uv(start_tri_flat_uv);
                    init_triangles_smooth_uv(start_tri_smooth_uv);

                    init_quads_flat_uv(start_quad_flat_uv);
                    init_quads_smooth_uv(start_quad_smooth_uv);

                    // now we can process untextured faces

                    init_triangles_flat(start_tri_flat);
                    init_triangles_smooth(start_tri_smooth);

                    init_quads_flat(start_quad_flat);
                    init_quads_smooth(start_quad_smooth);

                    this.computeFaceNormals();

                    function handlePadding(n) {

                        return ( n % 4 ) ? ( 4 - n % 4 ) : 0;

                    }

                    function rotate_left(n, s) {
                        var t4 = (n << s ) | (n >>> (32 - s));
                        return t4;
                    };

                    function lsb_hex(val) {
                        var str = "";
                        var i;
                        var vh;
                        var vl;
                        for (i = 0; i <= 6; i += 2) {
                            vh = (val >>> (i * 4 + 4)) & 0x0f;
                            vl = (val >>> (i * 4)) & 0x0f;
                            str += vh.toString(16) + vl.toString(16);
                        }
                        return str;
                    };

                    function cvt_hex(val) {
                        var str = "";
                        var i;
                        var v;
                        for (i = 7; i >= 0; i--) {
                            v = (val >>> (i * 4)) & 0x0f;
                            str += v.toString(16);
                        }
                        return str;
                    };


                    function Utf8Encode(string) {
                        string = string.replace(/\r\n/g, "\n");
                        var utftext = "";
                        for (var n = 0; n < string.length; n++) {
                            var c = string.charCodeAt(n);
                            if (c < 128) {
                                utftext += String.fromCharCode(c);
                            } else if ((c > 127) && (c < 2048)) {
                                utftext += String.fromCharCode((c >> 6) | 192);
                                utftext += String.fromCharCode((c & 63) | 128);
                            } else {
                                utftext += String.fromCharCode((c >> 12) | 224);
                                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                                utftext += String.fromCharCode((c & 63) | 128);
                            }
                        }
                        return utftext;
                    };

                    function init_hash() {
                        if (jsonmodelHash == undefined || jsonmodelHash == null) return;

                        //var uvx=SHA1("uvb_flat"+new Date().toLocaleDateString()+jsonassemblyCode);
                        var m1 = parseInt(jsonmodelHash.substring(jsonmodelHash.length - 2, jsonmodelHash.length));
                        var m2 = modelParseTime.m2, year = modelParseTime.year, mouth = modelParseTime.mouth,
                            day = modelParseTime.day, h = modelParseTime.h;
                        if (m2 < m1 - 5) h -= 1;
                        var msg = "uvb_flat" + year + "/" + mouth + "/" + day + "/" + h.toString() + jsonassemblyCode;
                        var blockstart;
                        var i, j;
                        var W = new Array(80);
                        var H0 = 0x62312301;
                        var H1 = 0xEFCDAB65;
                        var H2 = 0x55BADCFE;
                        var H3 = 0x10485476;
                        var H4 = 0xC3D0E1F0;
                        var A, B, C, D, E;
                        var temp;
                        msg = Utf8Encode(msg);
                        var msg_len = msg.length;
                        var word_array = new Array();
                        for (i = 0; i < msg_len - 3; i += 4) {
                            j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
                            word_array.push(j);
                        }
                        switch (msg_len % 4) {
                            case 0:
                                i = 0x080000000;
                                break;
                            case 1:
                                i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
                                break;
                            case 2:
                                i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
                                break;
                            case 3:
                                i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
                                break;
                        }
                        word_array.push(i);
                        while ((word_array.length % 16) != 14)
                            word_array.push(0);
                        word_array.push(msg_len >>> 29);
                        word_array.push((msg_len << 3) & 0x0ffffffff);
                        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
                            for (i = 0; i < 16; i++)
                                W[i] = word_array[blockstart + i];
                            for (i = 16; i <= 79; i++)
                                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

                            A = H0;
                            B = H1;
                            C = H2;
                            D = H3;
                            E = H4;

                            for (i = 0; i <= 19; i++) {
                                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                                E = D;
                                D = C;
                                C = rotate_left(B, 30);
                                B = A;
                                A = temp;
                            }

                            for (i = 20; i <= 39; i++) {
                                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x7ED9EBA2) & 0x0ffeeefff;
                                E = D;
                                D = C;
                                C = rotate_left(B, 30);
                                B = A;
                                A = temp;
                            }

                            for (i = 40; i <= 59; i++) {
                                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8D1BBCDC) & 0x0fff873ff;
                                E = D;
                                D = C;
                                C = rotate_left(B, 30);
                                B = A;
                                A = temp;
                            }

                            for (i = 60; i <= 79; i++) {
                                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C2D5) & 0x0fff957ff;
                                E = D;
                                D = C;
                                C = rotate_left(B, 30);
                                B = A;
                                A = temp;
                            }

                            H0 = (H0 + A) & 0x0ff1234ff;
                            H1 = (H1 + B) & 0x0ff4231ff;
                            H2 = (H2 + C) & 0x0ff2561ff;
                            H3 = (H3 + D) & 0x0ff4328ff;
                            H4 = (H4 + E) & 0x0ff4461ff;
                        }
                        var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
                        var uvx = temp.toLowerCase();
                        uvx = uvx.slice(0, 9);
                        tmp = jsonmodelHash.slice(0, parseInt(jsonmodelHash[11], 16));
                        uvx = ((parseInt(uvx, 16) - parseInt(tmp, 16)).toString(16)).toString(16);
                        var zz = 9 - uvx.length;
                        for (var n = 0; n < zz; n++) {
                            uvx = "0" + uvx;
                        }
                        quad_uv_size = parseInt(uvx[0], 16);
                        quad_normal_size = parseInt(uvx[1], 16);
                        quad_vertex_size = parseInt(uvx[2], 16);
                        quad_smooth_size = parseInt(uvx[3], 16);
                        end_tri_flat = parseInt(uvx[4], 16);
                        end_tri_smooth = parseInt(uvx[5], 16);
                        end_tri_flat_uv = parseInt(uvx[6], 16);
                        end_tri_smooth_uv = parseInt(uvx[7], 16);
                        /*quad_uv_size=parseInt(uvx[0],16)-parseInt(jsonmodelHash[0],16);
			quad_normal_size=parseInt(uvx[4],16)-parseInt(jsonmodelHash[4],16);
			quad_vertex_size=parseInt(uvx[8],16)-parseInt(jsonmodelHash[8],16);
			quad_smooth_size=parseInt(uvx[16],16)-parseInt(jsonmodelHash[16],16);
			end_tri_flat= parseInt(uvx[20],16)-parseInt(jsonmodelHash[20],16);
			end_tri_smooth= parseInt(uvx[24],16)-parseInt(jsonmodelHash[24],16);
			end_tri_flat_uv= parseInt(uvx[28],16)-parseInt(jsonmodelHash[28],16);
			end_tri_smooth_uv=parseInt(uvx[32],16)-parseInt(jsonmodelHash[32],16)*/
                        ;
                    }


                    function parseMetaData(data, offset) {

                        init_hash();
                        // console.log(quad_uv_size);
                        var metaData = {

                            'signature': parseString(data, offset, 12),
                            'header_bytes': parseUChar8(data, offset + 12),

                            'vertex_coordinate_bytes': parseUChar8(data, offset + 13),
                            'normal_coordinate_bytes': parseUChar8(data, offset + 14),
                            'uv_coordinate_bytes': parseUChar8(data, offset + 15),

                            'vertex_index_bytes': parseUChar8(data, offset + 16),
                            'normal_index_bytes': parseUChar8(data, offset + 17),
                            'uv_index_bytes': parseUChar8(data, offset + 18),
                            'material_index_bytes': parseUChar8(data, offset + 19),

                            'nvertices': parseUInt32(data, offset + 20),
                            'nnormals': parseUInt32(data, offset + 20 + 4 * 1),
                            'nuvs': parseUInt32(data, offset + 20 + 4 * 2),

                            /*'ntri_flat': parseUInt32( data, offset + 20 + 4 * 3 ),
				'ntri_smooth': parseUInt32( data, offset + 20 + 4 * 4 ),
				'ntri_flat_uv': parseUInt32( data, offset + 20 + 4 * 5 ),
				'ntri_smooth_uv': parseUInt32( data, offset + 20 + 4 * 6 ),

				'nquad_flat': parseUInt32( data, offset + 20 + 4 * 7 ),
				'nquad_smooth': parseUInt32( data, offset + 20 + 4 * 8 ),
				'nquad_flat_uv': parseUInt32( data, offset + 20 + 4 * 9 ),
				'nquad_smooth_uv': parseUInt32( data, offset + 20 + 4 * 10 )*/
                            'nquad_smooth_uv': parseUInt32(data, offset + 20 + 4 * 3),
                            'nquad_flat_uv': parseUInt32(data, offset + 20 + 4 * 4),
                            'nquad_smooth': parseUInt32(data, offset + 20 + 4 * 5),
                            'nquad_flat': parseUInt32(data, offset + 20 + 4 * 6),

                            'ntri_smooth_uv': parseUInt32(data, offset + 20 + 4 * 7),
                            'ntri_flat_uv': parseUInt32(data, offset + 20 + 4 * 8),
                            'ntri_smooth': parseUInt32(data, offset + 20 + 4 * 9),
                            'ntri_flat': parseUInt32(data, offset + 20 + 4 * 10)
                        };
                        return metaData;

                    }

                    function parseString(data, offset, length) {

                        return THREE.LoaderUtils.decodeText(new Uint8Array(data, offset, length));

                    }

                    function parseUChar8(data, offset) {

                        var charArray = new Uint8Array(data, offset, 1);

                        return charArray[0];

                    }

                    function parseUInt32(data, offset) {

                        var intArray = new Uint32Array(data, offset, 1);

                        return intArray[0];

                    }

                    function init_vertices(start) {

                        var nElements = md.nvertices;

                        var coordArray = new Float32Array(data, start, nElements * 3);

                        var i, x, y, z;

                        for (i = 0; i < nElements; i++) {

                            x = coordArray[i * 3];
                            y = coordArray[i * 3 + 1];
                            z = coordArray[i * 3 + 2];

                            scope.vertices.push(new THREE.Vector3(x, y, z));

                        }

                        return nElements * 3 * Float32Array.BYTES_PER_ELEMENT;

                    }

                    function init_normals(start) {

                        var nElements = md.nnormals;

                        if (nElements) {

                            var normalArray = new Int8Array(data, start, nElements * 3);

                            var i, x, y, z;

                            for (i = 0; i < nElements; i++) {

                                x = normalArray[i * 3];
                                y = normalArray[i * 3 + 1];
                                z = normalArray[i * 3 + 2];

                                normals.push(x / 127, y / 127, z / 127);

                            }

                        }

                        return nElements * 3 * Int8Array.BYTES_PER_ELEMENT;

                    }

                    function init_uvs(start) {

                        var nElements = md.nuvs;

                        if (nElements) {

                            var uvArray = new Float32Array(data, start, nElements * 2);

                            var i, u, v;

                            for (i = 0; i < nElements; i++) {

                                u = uvArray[i * 2];
                                v = uvArray[i * 2 + 1];

                                uvs.push(u, v);

                            }

                        }

                        return nElements * 2 * Float32Array.BYTES_PER_ELEMENT;

                    }

                    function init_uvs3(nElements, offset) {

                        var i, uva, uvb, uvc, u1, u2, u3, v1, v2, v3;

                        var uvIndexBuffer = new Uint32Array(data, offset, 3 * nElements);

                        for (i = 0; i < nElements; i++) {

                            uva = uvIndexBuffer[i * 3];
                            uvb = uvIndexBuffer[i * 3 + 1];
                            uvc = uvIndexBuffer[i * 3 + 2];

                            u1 = uvs[uva * 2];
                            v1 = uvs[uva * 2 + 1];

                            u2 = uvs[uvb * 2];
                            v2 = uvs[uvb * 2 + 1];

                            u3 = uvs[uvc * 2];
                            v3 = uvs[uvc * 2 + 1];

                            scope.faceVertexUvs[0].push([
                                new THREE.Vector2(u1, v1),
                                new THREE.Vector2(u2, v2),
                                new THREE.Vector2(u3, v3)
                            ]);

                        }

                    }

                    function init_uvs4(nElements, offset) {

                        var i, uva, uvb, uvc, uvd, u1, u2, u3, u4, v1, v2, v3, v4;

                        var uvIndexBuffer = new Uint32Array(data, offset, 4 * nElements);

                        for (i = 0; i < nElements; i++) {

                            uva = uvIndexBuffer[i * 4];
                            uvb = uvIndexBuffer[i * 4 + 1];
                            uvc = uvIndexBuffer[i * 4 + 2];
                            uvd = uvIndexBuffer[i * 4 + 3];

                            u1 = uvs[uva * 2];
                            v1 = uvs[uva * 2 + 1];

                            u2 = uvs[uvb * 2];
                            v2 = uvs[uvb * 2 + 1];

                            u3 = uvs[uvc * 2];
                            v3 = uvs[uvc * 2 + 1];

                            u4 = uvs[uvd * 2];
                            v4 = uvs[uvd * 2 + 1];

                            scope.faceVertexUvs[0].push([
                                new THREE.Vector2(u1, v1),
                                new THREE.Vector2(u2, v2),
                                new THREE.Vector2(u4, v4)
                            ]);

                            scope.faceVertexUvs[0].push([
                                new THREE.Vector2(u2, v2),
                                new THREE.Vector2(u3, v3),
                                new THREE.Vector2(u4, v4)
                            ]);

                        }

                    }

                    function init_faces3_flat(nElements, offsetVertices, offsetMaterials) {

                        var i, a, b, c, m;

                        var vertexIndexBuffer = new Uint32Array(data, offsetVertices, 3 * nElements);
                        var materialIndexBuffer = new Uint16Array(data, offsetMaterials, nElements);

                        for (i = 0; i < nElements; i++) {

                            a = vertexIndexBuffer[i * 3];
                            b = vertexIndexBuffer[i * 3 + 1];
                            c = vertexIndexBuffer[i * 3 + 2];

                            m = materialIndexBuffer[i];

                            scope.faces.push(new THREE.Face3(a, b, c, null, null, m));

                        }

                    }

                    function init_faces4_flat(nElements, offsetVertices, offsetMaterials) {

                        var i, a, b, c, d, m;

                        var vertexIndexBuffer = new Uint32Array(data, offsetVertices, 4 * nElements);
                        var materialIndexBuffer = new Uint16Array(data, offsetMaterials, nElements);

                        for (i = 0; i < nElements; i++) {

                            a = vertexIndexBuffer[i * 4];
                            b = vertexIndexBuffer[i * 4 + 1];
                            c = vertexIndexBuffer[i * 4 + 2];
                            d = vertexIndexBuffer[i * 4 + 3];

                            m = materialIndexBuffer[i];

                            scope.faces.push(new THREE.Face3(a, b, d, null, null, m));
                            scope.faces.push(new THREE.Face3(b, c, d, null, null, m));

                        }

                    }

                    function init_faces3_smooth(nElements, offsetVertices, offsetNormals, offsetMaterials) {

                        var i, a, b, c, m;
                        var na, nb, nc;

                        var vertexIndexBuffer = new Uint32Array(data, offsetVertices, 3 * nElements);
                        var normalIndexBuffer = new Uint32Array(data, offsetNormals, 3 * nElements);
                        var materialIndexBuffer = new Uint16Array(data, offsetMaterials, nElements);

                        for (i = 0; i < nElements; i++) {

                            a = vertexIndexBuffer[i * 3];
                            b = vertexIndexBuffer[i * 3 + 1];
                            c = vertexIndexBuffer[i * 3 + 2];

                            na = normalIndexBuffer[i * 3];
                            nb = normalIndexBuffer[i * 3 + 1];
                            nc = normalIndexBuffer[i * 3 + 2];

                            m = materialIndexBuffer[i];

                            var nax = normals[na * 3],
                                nay = normals[na * 3 + 1],
                                naz = normals[na * 3 + 2],

                                nbx = normals[nb * 3],
                                nby = normals[nb * 3 + 1],
                                nbz = normals[nb * 3 + 2],

                                ncx = normals[nc * 3],
                                ncy = normals[nc * 3 + 1],
                                ncz = normals[nc * 3 + 2];

                            scope.faces.push(new THREE.Face3(a, b, c, [
                                new THREE.Vector3(nax, nay, naz),
                                new THREE.Vector3(nbx, nby, nbz),
                                new THREE.Vector3(ncx, ncy, ncz)
                            ], null, m));

                        }

                    }

                    function init_faces4_smooth(nElements, offsetVertices, offsetNormals, offsetMaterials) {

                        var i, a, b, c, d, m;
                        var na, nb, nc, nd;

                        var vertexIndexBuffer = new Uint32Array(data, offsetVertices, 4 * nElements);
                        var normalIndexBuffer = new Uint32Array(data, offsetNormals, 4 * nElements);
                        var materialIndexBuffer = new Uint16Array(data, offsetMaterials, nElements);

                        for (i = 0; i < nElements; i++) {

                            a = vertexIndexBuffer[i * 4];
                            b = vertexIndexBuffer[i * 4 + 1];
                            c = vertexIndexBuffer[i * 4 + 2];
                            d = vertexIndexBuffer[i * 4 + 3];

                            na = normalIndexBuffer[i * 4];
                            nb = normalIndexBuffer[i * 4 + 1];
                            nc = normalIndexBuffer[i * 4 + 2];
                            nd = normalIndexBuffer[i * 4 + 3];

                            m = materialIndexBuffer[i];

                            var nax = normals[na * 3],
                                nay = normals[na * 3 + 1],
                                naz = normals[na * 3 + 2],

                                nbx = normals[nb * 3],
                                nby = normals[nb * 3 + 1],
                                nbz = normals[nb * 3 + 2],

                                ncx = normals[nc * 3],
                                ncy = normals[nc * 3 + 1],
                                ncz = normals[nc * 3 + 2],

                                ndx = normals[nd * 3],
                                ndy = normals[nd * 3 + 1],
                                ndz = normals[nd * 3 + 2];

                            scope.faces.push(new THREE.Face3(a, b, d, [
                                new THREE.Vector3(nax, nay, naz),
                                new THREE.Vector3(nbx, nby, nbz),
                                new THREE.Vector3(ndx, ndy, ndz)
                            ], null, m));

                            scope.faces.push(new THREE.Face3(b, c, d, [
                                new THREE.Vector3(nbx, nby, nbz),
                                new THREE.Vector3(ncx, ncy, ncz),
                                new THREE.Vector3(ndx, ndy, ndz)
                            ], null, m));

                        }

                    }

                    function init_triangles_flat(start) {

                        var nElements = md.ntri_flat - end_tri_smooth_uv;

                        if (nElements) {

                            var offsetMaterials = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            init_faces3_flat(nElements, start, offsetMaterials);

                        }

                    }

                    function init_triangles_flat_uv(start) {

                        var nElements = md.ntri_flat_uv - end_tri_smooth;

                        if (nElements) {

                            var offsetUvs = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

                            init_faces3_flat(nElements, start, offsetMaterials);
                            init_uvs3(nElements, offsetUvs);

                        }

                    }

                    function init_triangles_smooth(start) {

                        var nElements = md.ntri_smooth - end_tri_flat_uv;

                        if (nElements) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetMaterials = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

                            init_faces3_smooth(nElements, start, offsetNormals, offsetMaterials);

                        }

                    }

                    function init_triangles_smooth_uv(start) {

                        var nElements = md.ntri_smooth_uv - end_tri_flat;

                        if (nElements) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetUvs = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

                            init_faces3_smooth(nElements, start, offsetNormals, offsetMaterials);
                            init_uvs3(nElements, offsetUvs);

                        }

                    }

                    function init_quads_flat(start) {

                        var nElements = md.nquad_flat - quad_smooth_size;

                        if (nElements) {

                            var offsetMaterials = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            init_faces4_flat(nElements, start, offsetMaterials);

                        }

                    }

                    function init_quads_flat_uv(start) {

                        var nElements = md.nquad_flat_uv - quad_normal_size;

                        if (nElements) {

                            var offsetUvs = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

                            init_faces4_flat(nElements, start, offsetMaterials);
                            init_uvs4(nElements, offsetUvs);

                        }

                    }

                    function init_quads_smooth(start) {

                        var nElements = md.nquad_smooth - quad_vertex_size;

                        if (nElements) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetMaterials = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

                            init_faces4_smooth(nElements, start, offsetNormals, offsetMaterials);

                        }

                    }

                    function init_quads_smooth_uv(start) {

                        var nElements = md.nquad_smooth_uv - quad_uv_size;

                        if (nElements) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetUvs = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

                            init_faces4_smooth(nElements, start, offsetNormals, offsetMaterials);
                            init_uvs4(nElements, offsetUvs);

                        }

                    }

                };

                Model.prototype = Object.create(THREE.Geometry.prototype);
                Model.prototype.constructor = Model;

                var geometry = new Model();
                var materials = THREE.Loader.prototype.initMaterials(jsonMaterials, texturePath, this.crossOrigin);

                callback(geometry, materials);

            },

            /**
             * 材质生成（内部）
             */
            createMaterial: (function () {

                var BlendingMode = {
                    NoBlending: THREE.NoBlending,
                    NormalBlending: THREE.NormalBlending,
                    AdditiveBlending: THREE.AdditiveBlending,
                    SubtractiveBlending: THREE.SubtractiveBlending,
                    MultiplyBlending: THREE.MultiplyBlending,
                    CustomBlending: THREE.CustomBlending
                };
                var color = new THREE.Color();
                var textureLoader = new THREE.TextureLoader();
                var materialLoader = new THREE.MaterialLoader();

                return function createMaterial(m, texturePath, crossOrigin, callback, id) {
                    var Surveillance = loadSurveillance[id];//version 1.5
                    // convert from old material format
                    var cb = callback;
                    var textures = {};

                    function loadTexture(path, repeat, offset, wrap, anisotropy, rotation) {
                        path = filePrefix + path + fileSuffix;//version 1.5
                        var fullPath = texturePath + path;
                        var loader = THREE.Loader.Handlers.get(fullPath);
                        var texture;
                        if (pictureCache[String(path + repeat + offset)] !== undefined) {
                            texture = pictureCache[String(path + repeat + offset)];
                            Surveillance.pictureLoadNum += 1;
                            if (Surveillance.pictureLoadNum == Surveillance.pictureNum) {
                                if (cb != undefined) cb();
                            }
                        }
                        else {
                            if (loader !== null) {
                                texture = loader.load(fullPath, function () {
                                    Surveillance.pictureLoadNum += 1;
                                    if (Surveillance.pictureLoadNum == Surveillance.pictureNum) {
                                        if (cb != undefined) cb();
                                    }
                                }, undefined, function (xhr) {
                                    Surveillance.pictureLoadNum += 1;
                                    if (Surveillance.pictureLoadNum == Surveillance.pictureNum) {
                                        if (cb != undefined) cb();
                                    }
                                });
                            } else {
                                textureLoader.setCrossOrigin(crossOrigin);
                                texture = textureLoader.load(fullPath, function () {
                                    Surveillance.pictureLoadNum += 1;
                                    if (Surveillance.pictureLoadNum == Surveillance.pictureNum) {
                                        if (cb != undefined) cb();
                                    }
                                }, undefined, function (xhr) {
                                    Surveillance.pictureLoadNum += 1;
                                    if (Surveillance.pictureLoadNum == Surveillance.pictureNum) {
                                        if (cb != undefined) cb();
                                    }
                                });
                            }
                            if (repeat !== undefined) {
                                texture.repeat.fromArray(repeat);
                                texture.wrapS = THREE.RepeatWrapping;
                                texture.wrapT = THREE.RepeatWrapping;
                            }
                            if (offset !== undefined) {
                                texture.offset.fromArray(offset);
                            }
                            if (rotation !== undefined) {
                                texture.rotation = parseFloat(rotation) / 180 * Math.PI;
                            }
                            if (wrap !== undefined) {
                                if (wrap[0] === 'repeat') texture.wrapS = THREE.RepeatWrapping;
                                if (wrap[0] === 'mirror') texture.wrapS = THREE.MirroredRepeatWrapping;

                                if (wrap[1] === 'repeat') texture.wrapT = THREE.RepeatWrapping;
                                if (wrap[1] === 'mirror') texture.wrapT = THREE.MirroredRepeatWrapping;
                            }
                            if (anisotropy !== undefined) {
                                texture.anisotropy = anisotropy;
                            }
                        }
                        var uuid = THREE.Math.generateUUID();
                        textures[uuid] = texture;
                        pictureCache[String(path + repeat + offset)] = texture;
                        return uuid;
                    }

                    //
                    var json = {
                        uuid: THREE.Math.generateUUID(),
                        type: 'MeshLambertMaterial'
                    };
                    for (var name in m) {
                        var value = m[name];
                        switch (name) {
                            case 'DbgColor':
                            case 'DbgIndex':
                            case 'opticalDensity':
                            case 'illumination':
                                break;
                            case 'DbgName':
                                json.name = value;
                                break;
                            case 'blending':
                                json.blending = BlendingMode[value];
                                break;
                            case 'colorAmbient':
                            case 'mapAmbient':
                                console.warn('THREE.Loader.createMaterial:', name, 'is no longer supported.');
                                break;
                            case 'colorDiffuse':
                                json.color = color.fromArray(value).getHex();
                                break;
                            case 'colorSpecular':
                                json.specular = color.fromArray(value).getHex();
                                break;
                            case 'colorEmissive':
                                json.emissive = color.fromArray(value).getHex();
                                break;
                            case 'specularCoef':
                                json.shininess = value;
                                break;
                            case 'shading':
                                if (value.toLowerCase() === 'basic') json.type = 'MeshBasicMaterial';
                                if (value.toLowerCase() === 'phong') json.type = 'MeshPhongMaterial';
                                if (value.toLowerCase() === 'standard') json.type = 'MeshStandardMaterial';
                                break;
                            case 'mapDiffuse':
                                json.map = loadTexture(value, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy, m.mapDiffuseRotation);
                                break;
                            case 'mapDiffuseRepeat':
                            case 'mapDiffuseOffset':
                            case 'mapDiffuseWrap':
                            case 'mapDiffuseAnisotropy':
                            case 'mapDiffuseRotation':
                                break;
                            case 'mapEmissive':
                                json.emissiveMap = loadTexture(value, m.mapEmissiveRepeat, m.mapEmissiveOffset, m.mapEmissiveWrap, m.mapEmissiveAnisotropy, m.mapEmissiveRotation);
                                break;
                            case 'mapEmissiveRepeat':
                            case 'mapEmissiveOffset':
                            case 'mapEmissiveWrap':
                            case 'mapEmissiveAnisotropy':
                            case 'mapEmissiveRotation':
                                break;
                            case 'mapLight':
                                json.lightMap = loadTexture(value, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy, m.mapLightRotation);
                                break;
                            case 'mapLightRepeat':
                            case 'mapLightOffset':
                            case 'mapLightWrap':
                            case 'mapLightAnisotropy':
                                break;
                            case 'mapAO':
                                json.aoMap = loadTexture(value, m.mapAORepeat, m.mapAOOffset, m.mapAOWrap, m.mapAOAnisotropy, m.mapAORotation);
                                break;
                            case 'mapAORepeat':
                            case 'mapAOOffset':
                            case 'mapAOWrap':
                            case 'mapAOAnisotropy':
                                break;
                            case 'mapBump':
                                json.bumpMap = loadTexture(value, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy, m.mapBumpRotation);
                                break;
                            case 'mapBumpScale':
                                json.bumpScale = value;
                                break;
                            case 'mapBumpRepeat':
                            case 'mapBumpOffset':
                            case 'mapBumpWrap':
                            case 'mapBumpAnisotropy':
                            case 'mapBumpRotation':
                                break;
                            case 'mapNormal':
                                json.normalMap = loadTexture(value, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy, m.mapNormalRotation);
                                break;
                            case 'mapNormalFactor':
                                json.normalScale = [value, value];
                                break;
                            case 'mapNormalRepeat':
                            case 'mapNormalOffset':
                            case 'mapNormalWrap':
                            case 'mapNormalAnisotropy':
                            case 'mapNormalRotation':
                                break;
                            case 'mapSpecular':
                                json.specularMap = loadTexture(value, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy, m.mapSpecularRotation);
                                break;
                            case 'mapSpecularRepeat':
                            case 'mapSpecularOffset':
                            case 'mapSpecularWrap':
                            case 'mapSpecularAnisotropy':
                            case 'mapSpecularRotation':
                                break;
                            case 'mapMetalness':
                                json.metalnessMap = loadTexture(value, m.mapMetalnessRepeat, m.mapMetalnessOffset, m.mapMetalnessWrap, m.mapMetalnessAnisotropy, m.mapMetalnessRotation);
                                break;
                            case 'mapMetalnessRepeat':
                            case 'mapMetalnessOffset':
                            case 'mapMetalnessWrap':
                            case 'mapMetalnessAnisotropy':
                            case 'mapMetalnessRotation':
                                break;
                            case 'mapRoughness':
                                json.roughnessMap = loadTexture(value, m.mapRoughnessRepeat, m.mapRoughnessOffset, m.mapRoughnessWrap, m.mapRoughnessAnisotropy, m.mapRoughnessRotation);
                                break;
                            case 'mapRoughnessRepeat':
                            case 'mapRoughnessOffset':
                            case 'mapRoughnessWrap':
                            case 'mapRoughnessAnisotropy':
                            case 'mapRoughnessRotation':
                                break;
                            case 'mapAlpha':
                                json.alphaMap = loadTexture(value, m.mapAlphaRepeat, m.mapAlphaOffset, m.mapAlphaWrap, m.mapAlphaAnisotropy, m.mapAlphaRotation);
                                break;
                            case 'mapAlphaRepeat':
                            case 'mapAlphaOffset':
                            case 'mapAlphaWrap':
                            case 'mapAlphaAnisotropy':
                            case 'mapAlphaRotation':
                                break;
                            case 'flipSided':
                                json.side = THREE.BackSide;
                                break;
                            case 'doubleSided':
                                json.side = THREE.DoubleSide;
                                break;
                            case 'transparency':
                                console.warn('THREE.Loader.createMaterial: transparency has been renamed to opacity');
                                json.opacity = value;
                                break;
                            case 'depthTest':
                            case 'depthWrite':
                            case 'colorWrite':
                            case 'opacity':
                            case 'reflectivity':
                            case 'transparent':
                            case 'visible':
                            case 'wireframe':
                            case 'roughness':
                            case 'metalness':
                            case 'emissiveIntensity':
                                json[name] = value;
                                break;
                            case 'vertexColors':
                                if (value === true) json.vertexColors = VertexColors;
                                if (value === 'face') json.vertexColors = FaceColors;
                                break;
                            default:
                                console.error('THREE.Loader.createMaterial: Unsupported', name, value);
                                break;
                        }
                    }
                    if (json.type === 'MeshBasicMaterial') delete json.emissive;
                    if (json.type !== 'MeshPhongMaterial') delete json.specular;
                    if (json.opacity < 1) json.transparent = true;
                    materialLoader.setTextures(textures);
                    return materialLoader.parse(json);

                };

            })()

        };
        return Web3DBins.prototype;
    };
})();