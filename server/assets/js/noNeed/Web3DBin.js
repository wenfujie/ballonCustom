/**
 * Web3D-bin-V1.4.13
 * 2018-05-04
 * by hailong.zhuang
 */
;(function() {
    Web3DBin = function(canvasEleName){
        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();//判断当前显卡和浏览器是否支持webgl

        $(document).bind("contextmenu",function(e){
            return false;
        });

        var canEle = canvasEleName;
        if (document.getElementById(canvasEleName) === undefined) {
            //参数元素不存在
            console.error( 'Web3DBins: Element ', canvasEleName, ' not found' );
        }

        var containerElement = null;

        var meshMap = new Map();//存储当前展示模型(几何体加材质)
        var decalAreaMesh = null;//印花区域模型
        var geometryGroup = new Map();//存储几何体
        var meshDecalAreaMap = new Map();//存储部件几何体的印绣花区域(UV点+UV偏移量)
        var receiveShadows = new Map();//存储部件间投射阴影(几何体加材质)，键名为复合部件编码，a_b
        var pictureCache=new Map();//图片缓存
        var blendMap = new Map();//存储当前展示(几何体加材质),键名为复合场景名,a_b
        var scene = new THREE.Scene();
        var lightControlsGroup = new Array();
        var lightGroup = new Array();
        var controls = null;
        var camera = null;
        var renderer = new THREE.WebGLRenderer({
            antialias:true,       //是否开启反锯齿
            precision:"highp",    //着色精度选择
            alpha:true,           //是否可以设置背景色透明
            preserveDrawingBuffer: true//是否保存绘图缓冲，若设为true，则可以提取canvas绘图的缓冲
        });
        var accelerometerPowerFlag = 0;//重力感应开关
        var rotateSelfFlag = 0;
        var interruptionState = "initScene";//"中断"状态
        var decalClientPosition = new Map();//存放印绣花鼠标事件值
        var decalMeshs = new Map();//存放场景内印绣花信息模型
        var relativeUV=new THREE.Vector2(0,0);

        var eventPosition = new THREE.Vector2();
        var mouse = new THREE.Vector2();

        var mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
        mouseHelper.visible = false;
        scene.add( mouseHelper );
        // var map = new THREE.TextureLoader().load( 'data/img/UV4_4.png' );
        // map.wrapS = map.wrapT = THREE.RepeatWrapping;
        // map.anisotropy = 16;
        // map.repeat.x=1;
        // map.repeat.y=1;

        // UVMaterial = new THREE.MeshPhongMaterial( { map: map, side: THREE.DoubleSide } );

        var textureDecal = new THREE.Texture();
        var textureVersion = new THREE.Texture();

        var check = new THREE.Vector3( 1, 1, 1 );
        var p = new THREE.Vector3( 0, 0, 0 );
        var r = new THREE.Vector3( 0, 0, 0 );
        var S =40;
        var s = new THREE.Vector3( S, S, S );
        var normalN = new THREE.Vector3();

        var changeDecalData = {
            decalID: null,
            power: 0
        };
        var mousePosOrigin = new THREE.Vector2();
        var rotateOrigin = 0;

        var conversionRatio = 0.0012;//印绣花世界比例转UV图比例的转换率，暂时使用定值(分部件0.0012)

        var SCREEN_WIDTH;
        var SCREEN_HEIGHT;
        var pictureLoadNum=0;
        var pictureNum=0;
        var meshLoadStatue="start";
        var meshBlendNum=0;
        var meshBlendLoadNum=0;
        var compareLightControlGroup=new Object();
        var compareCameraControlGroup=new Array();
        var magnifierCamera=null;
        var magnifierRender=null;
        var magnifierControl=null;
        var  magnifierContainerElement=null;
        var zoomScale=1;
        var userDevice="";
        var totalCallback=null;
        var totalObj=null;
        var loadSurveillance = new Map();
        var filePrefix = "";
        var fileSuffix = "";
        var Web3DBins=new Object();



        Web3DBins.prototype={
            ID :new Date().getTime(),

            compareList :new Array(),

            getInfo:function(){
                var info={'domElement':renderer.domElement,'controls':controls,'lightControlsGroup':lightControlsGroup};
                return info;
            },

            dispose:function(){
                Web3DBins.prototype.clearAll();
                containerElement.removeChild( renderer.domElement );
                containerElement = null;
                window.removeEventListener('resize', Web3DBins.prototype.onWindowResize);
                for(var n in lightControlsGroup){
                    lightControlsGroup[n].dispose();
                    lightControlsGroup[n]=null;
                }
                lightControlsGroup=[];
                if(controls!=null){
                    controls.removeEventListener( 'change',Web3DBins.prototype.renderanimate);
                    controls.dispose();
                    controls=null;
                }
                for(var n in lightGroup){
                    scene.remove(lightGroup[n]);
                    lightGroup[n]=undefined;
                }
                lightGroup=[];
                meshMap =null;
                geometryGroup =null;
                meshDecalAreaMap =null;
                receiveShadows =null;
                blendMap =null;
                scene =null;
                lightControlsGroup =null;
                lightGroup =null;
                controls = null;
                camera = null;
                renderer.forceContextLoss();
                renderer.context = null;
                renderer.domElement = null;
                renderer.dispose();
                renderer = null;
                accelerometerPowerFlag =null;
                interruptionState =null;
                decalClientPosition =null;
                decalMeshs =null;
                intersection =null;
                eventPosition =null;
                mouse =null;
                mouseHelper =null;
                textureDecal = null;
                textureVersion = null;
                check = null;
                p = null;
                r = null;
                S =null;
                s = null;
                normalN = null;
                changeDecalData =null;
                mousePosOrigin = null;
                rotateOrigin = null;
                conversionRatio = null;
                this.ID=null;
                this.compareList=null;
                pictureLoadNum=null;
                pictureNum=null;
                meshLoadStatue=null;
                for(var n in Web3DBins.prototype){
                    Web3DBins.prototype[n]=null;
                }
                Web3DBins.prototype=null;
                Web3DBins=null;
                compareLightControlGroup=null;
                compareCameraControlGroup=null;
                magnifierCamera=null;
                magnifierRender=null;
                magnifierControl=null;
                magnifierContainerElement=null;
                zoomScale=null;
                userDevice=null;
            },

            bindingCouple:function(list,switchs){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    if(switchs==1){
                        for(var n=0;n<list.length;n++){
                            for(var x=n+1;x<list.length;x++)
                            {
                                list[n].compareWithOther(list[x],'on');
                            }
                        }
                    }
                    if(switchs==0){
                        for(var n=0;n<list.length;n++){
                            for(var x=n+1;x<list.length;x++)
                            {
                                list[n].compareWithOther(list[x],'off');
                            }
                        }
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
            },

            removeCompare:function(name){
                for(var n in compareLightControlGroup[name.ID]){
                    var tmp=compareLightControlGroup[name.ID][n];
                    tmp.dispose();
                    tmp=null;
                }
                delete compareLightControlGroup[name.ID];
                for(var n=0;n<compareCameraControlGroup.length;n++){
                    if(compareCameraControlGroup[n].web3dID==name.ID){
                        compareCameraControlGroup[n].dispose();
                        compareCameraControlGroup[n].removeEventListener('change',Web3DBins.prototype.renderanimate);
                        compareCameraControlGroup[n]=null;
                        compareCameraControlGroup.splice(n,1);
                        break;
                    }
                }
                for(var n in this.compareList){
                    if (this.compareList[n].ID==name.ID){
                        this.compareList[n]=null;
                        this.compareList.splice(n,1);
                        break;
                    }
                }
            },

            compareWithOther:function(name,switchs){
                if(switchs=="on"){
                    for(var n in this.compareList){
                        if(this.compareList[n].ID==name.ID)return;
                    }
                    this.compareList.push(name);
                    var scope=this;
                    name.compareList.push(scope);
                    controls.reset();
                    name.getInfo().controls.reset();
                    for(var n in lightControlsGroup){
                        lightControlsGroup[n].reset();
                    }
                    tmplcg=name.getInfo().lightControlsGroup;
                    for(var n in tmplcg){
                        tmplcg[n].reset();
                    }
                    Web3DBins.prototype.setCompareCameraControl();
                    Web3DBins.prototype.setCompareLightControl();
                    name.setCompareCameraControl();
                    name.setCompareLightControl();
                }
                else if(switchs=="off"){
                    Web3DBins.prototype.removeCompare(name);
                    var scope=this;
                    name.removeCompare(scope);
                }
            },

            setCompareCameraControl:function(){
                for(var n in compareCameraControlGroup){
                    compareCameraControlGroup[n].dispose();
                    compareCameraControlGroup[n].removeEventListener( 'change',Web3DBins.prototype.renderanimate);
                    compareCameraControlGroup[n]=null;
                    delete compareCameraControlGroup[n];
                }
                for(var n in this.compareList){
                    var tmp=this.compareList[n].getInfo().domElement;
                    var tmpcontrol2= new THREE.OrbitControls( camera, tmp);
                    tmpcontrol2.updateControlType();
                    tmpcontrol2.maxPolarAngle = controls.maxPolarAngle ;
                    tmpcontrol2.minDistance = controls.minDistance;
                    tmpcontrol2.maxDistance = controls.maxDistance;
                    tmpcontrol2.addEventListener( 'change',Web3DBins.prototype.renderanimate);
                    tmpcontrol2.web3dID=this.compareList[n].ID;
                    compareCameraControlGroup.push(tmpcontrol2);
                }
            },

            setCompareLightControl:function(){
                for(var n in compareLightControlGroup){
                    var tmp=compareLightControlGroup[n];
                    for(var x in tmp){
                        tmp[x].dispose();
                        tmp[x]=null;
                    }
                    tmp=[];
                    delete compareLightControlGroup[n];
                }
                for(var n in this.compareList){
                    tmp=this.compareList[n].getInfo().domElement;
                    var compareObject=new Array();
                    for(var x in lightGroup){
                        var tmpcontrol2 = new THREE.OrbitControls( lightGroup[x], tmp);
                        tmpcontrol2.maxPolarAngle = controls.maxPolarAngle ;
                        tmpcontrol2.enableZoom = false;
                        compareObject.push(tmpcontrol2);
                    }
                    compareLightControlGroup[this.compareList[n].ID]=compareObject;
                }
            },

            setFilePrefix:function(str1,str2){
                if(str1!=null&&str1!=undefined){
                    filePrefix = str1;
                }
                if(str2!=null&&str2!=undefined){
                    fileSuffix = str2;
                }
            },

            clearAll : function(){

                pictureCache={};
                renderer.clear();
                renderer.renderLists.dispose();
                //renderer.forceContextLoss();
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    for(var n in meshMap){
                        scene.remove(meshMap[n]);
                        Web3DBins.prototype.cacheClear(meshMap[n]);
                    }
                    decalMeshs.forEach(function(data,index,arr){
                        scene.remove(data.mesh);
                        Web3DBins.prototype.cacheClear(data.mesh);
                    });
                    for(var n in blendMap){
                        scene.remove(blendMap[n]);
                        Web3DBins.prototype.cacheClear(blendMap[n]);
                    }
                    renderer.render( scene, camera );
                    //composer.render();
                    meshMap={};
                    blendMap.clear();
                    geometryGroup.clear();
                    decalMeshs.clear();
                    //renderer.forceContextRestore();

                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

            },

            cacheClear: function(mesh){
                if(mesh.material==undefined)return;
                else if(mesh.material instanceof Array){
                    for(var n in mesh.material){
                        var material=mesh.material[n];
                        if(material.map!=null){material.map.dispose();}
                        if(material.aoMap!=null){material.aoMap.dispose();}
                        if(material.normalMap!=null){material.normalMap.dispose();}
                        if(material.specularMap!=null){material.specularMap.dispose();}
                        if(material.bumpMap!=null){material.bumpMap.dispose();}
                        if(material.emissiveMap!=null){material.bumpMap.dispose();}
                        if(material.alphaMap!=null){material.alphaMap.dispose();}
                        if(material.metalnessMap!=null){material.metalnessMap.dispose();}
                        if(material.roughnessMap!=null){material.roughnessMap.dispose();}
                        if(material.lightMap!=null){material.lightMap.dispose();}
                        material.dispose();
                        //material=undefined;
                    }
                }else if(mesh.material instanceof Object){
                    var material=mesh.material;
                    if(material.map!=null){material.map.dispose();}
                    if(material.aoMap!=null){material.aoMap.dispose();}
                    if(material.normalMap!=null){material.normalMap.dispose();}
                    if(material.specularMap!=null){material.specularMap.dispose();}
                    if(material.bumpMap!=null){material.bumpMap.dispose();}
                    if(material.emissiveMap!=null){material.bumpMap.dispose();}
                    if(material.alphaMap!=null){material.alphaMap.dispose();}
                    if(material.metalnessMap!=null){material.metalnessMap.dispose();}
                    if(material.roughnessMap!=null){material.roughnessMap.dispose();}
                    if(material.lightMap!=null){material.lightMap.dispose();}
                    material.dispose();
                    //material=undefined;
                }
                mesh.geometry.dispose();
                //mesh.geometry=undefined;
                //mesh=undefined;
            },

            initScene: function(json){
                interruptionState = null;

                for(var n in lightControlsGroup){
                    lightControlsGroup[n].dispose();
                    lightControlsGroup[n]=null;
                }
                lightControlsGroup=[];
                if(controls!=null){
                    controls.removeEventListener( 'change',Web3DBins.prototype.renderanimate);
                    controls.dispose();
                    controls=null;
                }
                for(var n in lightGroup){
                    scene.remove(lightGroup[n]);
                }
                lightGroup=[];
                camera=null;

                var CONTROLS=json.controls;
                var lights=json.lights;
                var CAMERA=json.camera;
                var dataIntArr = [];

                if(window.devicePixelRatio>=3)renderer.setPixelRatio( window.devicePixelRatio-1 );
                else if(window.devicePixelRatio<3&&window.devicePixelRatio>=2)renderer.setPixelRatio( window.devicePixelRatio );
                else renderer.setPixelRatio( window.devicePixelRatio);
                //renderer.setPixelRatio( window.devicePixelRatio );
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
                if(canEle == undefined){
                    containerElement = document.body;
                    renderer.setSize( window.innerWidth, window.innerHeight );
                }
                else{
                    containerElement = document.getElementById(canEle);
                    renderer.setSize( containerElement.clientWidth, containerElement.clientHeight );
                }
                renderer.domElement.style.zIndex=1;
                renderer.domElement.position="absolute";
                containerElement.appendChild( renderer.domElement );

                if( CONTROLS.controlType !== undefined ){//未传参默认值为0
                    THREE.OrbitControls.prototype.controlType = CONTROLS.controlType;
                }

                for(var lig=0;lig<lights.length;lig++){

                    var lightNow;
                    switch(lights[lig].lightType)
                    {
                        case "AmbientLight":
                            lightNow = new THREE.AmbientLight( lights[lig].lightColor );
                            break;
                        case "DirectionalLight":
                            lightNow = new THREE.DirectionalLight( lights[lig].lightColor );
                            break;
                        case "HemisphereLight":
                            lightNow = new THREE.HemisphereLight( lights[lig].lightColor );
                            break;
                        case "PointLight":
                            lightNow = new THREE.PointLight( lights[lig].lightColor );
                            break;
                        case "SpotLight":
                            lightNow = new THREE.SpotLight( lights[lig].lightColor );
                            break;
                        default:
                            break;
                    }

                    dataIntArr = Web3DBins.prototype.splitArr(lights[lig].lightPosition);
                    lightNow.position.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);

                    // dataIntArr = Web3DBins.prototype.splitArr(lights[lig].lightRotation);
                    // lightNow.rotation.set(Math.PI*dataIntArr[0],Math.PI*dataIntArr[1],Math.PI*dataIntArr[2]);

                    lightNow.intensity = parseFloat(lights[lig].lightIntensity);
                    lightNow.name=lights[lig].lightCode;

                    lightGroup.push(lightNow);

                    var control2=new THREE.OrbitControls(lightNow,renderer.domElement);
                    control2.updateControlType();
                    control2.enableZoom = false;
                    control2.maxPolarAngle = Math.PI * CONTROLS.controlsMaxPolarAnglePI;
                    control2.name=lights[lig].lightCode;

                    control2.saveState();
                    lightControlsGroup.push(control2);

                    scene.add(lightNow);
                }

                //camera = new THREE.PerspectiveCamera(parseFloat(CAMERA.fov), window.innerWidth / window.innerHeight, parseFloat(CAMERA.near), parseFloat(CAMERA.far));
                camera = new THREE.PerspectiveCamera(parseFloat(CAMERA.fov), renderer.domElement.width / renderer.domElement.height, parseFloat(CAMERA.near), parseFloat(CAMERA.far));

                dataIntArr = Web3DBins.prototype.splitArr(CAMERA.cameraPosition);
                camera.position.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);

                if(CAMERA.FocalLength!=null){
                    var s=renderer.domElement.width/renderer.domElement.height;
                    if(s>1){
                        camera.setFocalLength(parseFloat(CAMERA.FocalLength)/s);
                    }
                    else camera.setFocalLength(s*parseFloat(CAMERA.FocalLength));
                    camera.isSetFocalLength=true;
                }

                controls = new THREE.OrbitControls( camera, renderer.domElement);
                controls.updateControlType();
                controls.maxPolarAngle = Math.PI * parseFloat(CONTROLS.controlsMaxPolarAnglePI);
                controls.minDistance = parseFloat(CONTROLS.controlsMinDistance);
                controls.maxDistance = parseFloat(CONTROLS.controlsMaxDistance);

                controls.saveState();

                Web3DBins.prototype.setCompareLightControl();
                Web3DBins.prototype.setCompareCameraControl();

                controls.addEventListener( 'change',Web3DBins.prototype.renderanimate);

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

            onWindowResize:function(){
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
            },

            magnifier:function(data){
                var j=typeof data;
                if(j=="number"&&magnifierCamera!=null){
                    //var q=new THREE.Vector3();
                    //q.copy(magnifierCamera.targetqs);
                    //magnifierCamera.lookAt(q);
                    //magnifierCamera.targetqs.copy(q);
                    magnifierControl.zoomAndUpdate(data);
                    //magnifierCamera.position.x=q.x;
                    //magnifierCamera.position.y=q.y;

                }
                else if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    if( data.power == 1 || ( data.power == 2 && interruptionState === null ) ){
                        if(magnifierCamera==null){
                            Web3DBins.prototype.setInterruptionState( "magnifier" );
                            Web3DBins.prototype.setControlsState(false);
                            renderer.domElement.style.cursor = "crosshair";
                            setMagnifier();
                            magnifierControl.addEventListener('change',Web3DBins.prototype.magnifierrenderanimate);
                            renderer.domElement.addEventListener('click',Web3DBins.prototype.getMaginifier);
                        }
                    }
                    else if( data.power == 0 || ( data.power == 2 && interruptionState === "magnifier")){
                        Web3DBins.prototype.setControlsState(true);
                        renderer.domElement.style.cursor = "default";
                        Web3DBins.prototype.setInterruptionState( null );
                        magnifierControl.removeEventListener('change',Web3DBins.prototype.magnifierrenderanimate);
                        renderer.domElement.removeEventListener('click',Web3DBins.prototype.getMaginifier);
                        disposeMagnifier();
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
                function setMagnifier(){
                    magnifierRender = new THREE.WebGLRenderer({
                        antialias:true,       //是否开启反锯齿
                        precision:"highp",    //着色精度选择
                        alpha:true,          //是否可以设置背景色透明
                    });
                    zoomScale=data.scale;
                    magnifierContainerElement = document.getElementById(data.elementID);
                    magnifierCamera=camera.clone();
                    magnifierCamera.targetqs=new THREE.Vector3();
                    magnifierCamera.targetqs.copy(camera.targetqs);
                    magnifierContainerElement.appendChild( magnifierRender.domElement );
                    magnifierRender.setSize( magnifierContainerElement.clientWidth, magnifierContainerElement.clientHeight );
                    magnifierRender.setPixelRatio( window.devicePixelRatio );
                    magnifierControl=new THREE.OrbitControls( magnifierCamera, magnifierRender.domElement);
                    magnifierControl.minDistance=2;
                    THREE.OrbitControls.prototype.controlType=1;
                    magnifierControl.updateControlType();
                    magnifierControl.rotateLeftEnable=false;
                    for(var n in magnifierRender.domElement.style){
                        magnifierRender.domElement.style[n]=magnifierContainerElement.style[n];
                    }
                };
                function disposeMagnifier(){
                    magnifierContainerElement.removeChild(magnifierRender.domElement);
                    magnifierControl.dispose();
                    magnifierContainerElement=null;
                    magnifierControl=null;
                    magnifierCamera=null;
                    magnifierRender.forceContextLoss();
                    magnifierRender.context = null;
                    magnifierRender.domElement = null;
                    magnifierRender.dispose();
                    magnifierRender=null;
                };
            },

            magnifierrenderanimate:function(){
                requestAnimationFrame(render);
                function render(){
                    magnifierRender.render(scene,magnifierCamera);
                }
            },

            getMaginifier:function(evnet){
                mouse.x = ( event.offsetX / renderer.domElement.width ) * 2 - 1;
                mouse.y = - ( event.offsetY / renderer.domElement.height ) * 2 + 1;
                var raycaster = new THREE.Raycaster();
                raycaster.setFromCamera( mouse, camera );
                var intersects = raycaster.intersectObjects(  scene.children );
                if ( intersects.length > 0 ) {
                    //magnifierCamera.copy(camera);
                    /*var q=new THREE.Vector3();
        magnifierCamera.getWorldPosition(q);
        var camreaToTarget=q.distanceTo(magnifierCamera.targetqs);
        magnifierControl.maxDistance=camreaToTarget;
        magnifierControl.minDistance=2;*/
                    var p = intersects[ 0 ].point;
                    magnifierControl.reset();
                    magnifierCamera.position.x+=(p.x-magnifierCamera.targetqs.x);
                    magnifierCamera.position.y+=(p.y-magnifierCamera.targetqs.y);
                    magnifierCamera.position.z+=(p.z-magnifierCamera.targetqs.z);
                    //magnifierCamera.lookAt(p);
                    magnifierCamera.targetqs.copy(p);
                    //magnifierControl.update();
                    magnifierControl.zoomAndUpdate(zoomScale);
                    //zoomScale=1;
                    //magnifierRender.render(scene,magnifierCamera);
                }
            },

            goCallback :function(id){
                var s = loadSurveillance[id];
                if(s.totalCallback!=null){
                    s.totalCallback(s.totalObj);
                    s.totalCallback=null;
                    s.totalObj=null;
                    s = null;
                }
            },

            changeMeshArea :function(data){
                var code = meshMap[data.assemblySceneName].name;
                if(meshDecalAreaMap.get(code)){
                    meshDecalAreaMap.get(code).decalArea=data.decalArea;
                    meshDecalAreaMap.get(code).assemblyUVMappingSRC = data.uvMap;
                }
            },

            chooseModel :function(modelData,callback){
                console.log(scene.children);
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    var id = new Date().getTime();
                    loadSurveillance[id] = new Object();
                    var modellist=modelData.modelList;
                    var modelSLength = modellist.length;
                    loadSurveillance[id].chooseMeshLength = modelSLength;
                    loadSurveillance[id].meshLength = 0;
                    loadSurveillance[id].meshLoadStatue="start";
                    loadSurveillance[id].meshBlendNum = 0;
                    loadSurveillance[id].meshBlendLoadNum = 0;
                    loadSurveillance[id].pictureLoadNum = 0;
                    loadSurveillance[id].pictureNum = 0;
                    for(var n=0; n<modelSLength;n++)
                    {
                        if(modellist[n].projectionIn !== undefined && modellist[n].projectionIn !== null){
                            loadSurveillance[id].meshBlendNum+=modellist[n].projectionIn.length;
                        }
                    }
                    for(var mlt=0;mlt<modelSLength;mlt++){
                        var json=modellist[mlt];
                        Model(json,callback);
                    }

                }
                else{
                    console.warn( 'Web3DBins.chooseModel:interruption ' + interruptionState + ' is enable.' );
                }

                //单模型创建函数
                //注：涉及内部数据，函数接口不应该暴露，所以放在内部
                function Model(modelData,callback){
                    var json=modelData;
                    var mtls=json.mtls;
                    //var materials=new Array(mtls.length);
                    var projectionInConter = 0;
                    var extnedMaterial=new Object();
                    var matertemp;
                    if(mtls==undefined||mtls==null||mtls==""||mtls.length==0){
                        matertemp=new THREE.MeshLambertMaterial({color:0x444444});
                    }
                    else{
                        var materials=new Array(mtls.length);
                        for(var i=0;i<mtls.length;i++){
                            var materialCreator=new Object();
                            materialCreator["DbgIndex"]=mtls[i].materiaIndex;
                            materialCreator["DbgName"]=mtls[i].materialName;
                            var extendAttributeList=mtls[i].extendAttributeList;
                            var attributeList=mtls[i].attributeList;
                            for(var x=0;x<attributeList.length;x++){
                                var valueType = attributeList[x].attributeValueType;
                                var valueName = attributeList[x].attributeName;
                                var value = attributeList[x].attributeValue;
                                if(!value)continue;
                                switch(valueType)
                                {
                                    case "NUM":
                                        materialCreator[valueName]=parseFloat(value);
                                        break;
                                    case "STR":
                                        materialCreator[valueName]=value;
                                        break;
                                    case "BOOL":
                                        if(value=="1"){
                                            materialCreator[valueName]=true;
                                        }
                                        else if(value=="0"){
                                            materialCreator[valueName]=false;
                                        }
                                        else{
                                            console.error( 'Web3DBins.chooseModel: Unsupported', name, value );
                                        }
                                        break;
                                    case "ARR":
                                        materialCreator[valueName] = Web3DBins.prototype.splitArr(value);
                                        break;
                                    default:
                                        console.error( 'Web3DBins.chooseModel: Unsupported', name, value );
                                        break;
                                }
                            }
                            materials[mtls[i].materiaIndex]=materialCreator;
                            if(extendAttributeList!=undefined&&extendAttributeList!=null){
                                var tmpMaterial=new Object();
                                for(var n=0;n<extendAttributeList.length;n++){
                                    tmpMaterial[extendAttributeList[n].attributeName]=parseFloat(extendAttributeList[n].attributeValue);
                                }
                                extnedMaterial[mtls[i].materiaIndex]=tmpMaterial;
                            }
                        }
                        //var matertemp = THREE.Loader.prototype.initMaterials( materials, "", this.crossOrigin );
                        matertemp =Web3DBins.prototype.initMaterials( materials, "", "Anonymous" ,function(){
                            if(loadSurveillance[id].meshLoadStatue=="over"){
                                //renderer.domElement.style.visibility="";
                                renderer.render(scene,camera);
                                Web3DBins.prototype.goCallback(id);
                            }
                            //composer.render();
                        },id);
                    }
                    for(var n in extnedMaterial){
                        for(var z in extnedMaterial[n]){
                            matertemp[n][z]=extnedMaterial[n][z];
                        }
                    }
                    //var matertemp = UVMaterial;

                    if(meshMap[json.sceneName]==undefined){//未创立此部件组（相同场景名）
                        if(geometryGroup.get(json.assemblyCode)!=undefined){//已缓存几何体
                            changeMesh(geometryGroup.get(json.assemblyCode),callback);
                        }else{//未缓存几何体
                            if(json.decalArea != undefined){
                                meshDecalAreaMap.set(json.assemblyCode,{
                                    "decalArea":json.decalArea,
                                    "assemblyUVMappingSRC":json.assemblyUVMapping,
                                    "assemblyUVMapping":null
                                });
                            }
                            loadGeo( json.modelPath,function(geometry){
                                geometry.faceVertexUvs[1] = geometry.faceVertexUvs[0];//--------------
                                //var tmpBuffer=new THREE.BufferGeometry().fromGeometry( geometry );
                                geometryGroup.set(json.assemblyCode,geometry);
                                changeMesh(geometry,callback);
                            });
                        }
                    }
                    else{//已创立此部件组（相同场景名）
                        if(meshMap[json.sceneName].name==json.assemblyCode){//与场景中展示属同一部件
                            Web3DBins.prototype.cacheClear(meshMap[json.sceneName]);
                            meshMap[json.sceneName].material=matertemp;
                            //投射阴影
                            if( json.projectionIn !== undefined && json.projectionIn !== null ){
                                for (var i = 0; i < json.projectionIn.length; i++) {
                                    addReceiveShadow(geometryGroup.get(json.assemblyCode),json.projectionIn[i]);
                                };
                            }
                            finishedAssembly(callback);//模型计数加一
                            //执行单帧渲染
                            //renderer.render( scene, camera );
                            //composer.render();
                        }
                        else{//新部件
                            for(var i = 0; i < scene.children.length; i++){
                                if(scene.children[i].name == meshMap[json.sceneName].name){
                                    scene.remove(scene.children[i]);
                                    i--;
                                }
                            }
                            Web3DBins.prototype.cacheClear(meshMap[json.sceneName]);
                            if(geometryGroup.get(json.assemblyCode)!=undefined){
                                changeMesh(geometryGroup.get(json.assemblyCode),callback);
                            }
                            else{

                                if(json.decalArea != undefined){
                                    meshDecalAreaMap.set(json.assemblyCode,{
                                        "decalArea":json.decalArea,
                                        "assemblyUVMappingSRC":json.assemblyUVMapping,
                                        "assemblyUVMapping":null
                                    });
                                }
                                loadGeo( json.modelPath,function(geometry){
                                    geometry.faceVertexUvs[1] = geometry.faceVertexUvs[0];//--------------
                                    //var tmpBuffer=new THREE.BufferGeometry().fromGeometry( geometry );
                                    geometryGroup.set(json.assemblyCode,geometry);
                                    changeMesh(geometry,callback);
                                });
                            }
                        }
                    }

                    //更换模型函数
                    //注：涉及内部数据，函数接口不应该暴露，所以放在内部
                    function changeMesh(geometrys,callback){
                        var mesh=new THREE.Mesh(geometrys,matertemp);
                        //var mesh=new THREE.Mesh(geometrys,UVMaterial);

                        if(json.modelPosition!=undefined&&json.modelPosition!=null){
                            var dataIntArr = Web3DBins.prototype.splitArr(json.modelPosition);
                            mesh.position.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                        }

                        if(json.modelRotation!=undefined&&json.modelRotation!=null){
                            dataIntArr = Web3DBins.prototype.splitArr(json.modelRotation);
                            mesh.rotation.set(Math.PI*dataIntArr[0],Math.PI*dataIntArr[1],Math.PI*dataIntArr[2]);
                        }

                        if(json.modelScale!=undefined&&json.modelScale!=null){
                            dataIntArr = Web3DBins.prototype.splitArr(json.modelScale);
                            mesh.scale.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                        }

                        // 模型透明化
                        // mesh.visible = false;
                        mesh.name=json.assemblyCode;
                        meshMap[json.sceneName]=mesh;
                        scene.add(mesh);

                        //投射阴影
                        if( json.projectionIn !== undefined && json.projectionIn !== null ){
                            for (var i = 0; i < json.projectionIn.length; i++) {
                                addReceiveShadow(geometrys,json.projectionIn[i]);
                            };
                        }

                        // renderer.domElement.style.visibility="hidden";
                        renderer.render(scene,camera);
                        //单部件加载完毕执行统计与回调
                        finishedAssembly(callback);
                    };

                    //
                    function addReceiveShadow(geometry,projectionIn){
                        var shSceneName = json.sceneName+"_"+projectionIn.sceneName;
                        var shSaveName = json.assemblyCode+"_"+projectionIn.assemblyCode;

                        if( blendMap.get(shSceneName) !== undefined ){//场景中已经存在该场景名则替换
                            if( receiveShadows.get( shSaveName ) !== undefined ){//已缓存
                                scene.remove( blendMap.get(shSceneName) );
                                Web3DBins.prototype.cacheClear(blendMap.get(shSceneName));
                                scene.add( receiveShadows.get( shSaveName ) );
                                blendMap.set(shSceneName,receiveShadows.get( shSaveName ));
                                projectionConter();
                            }
                            else{//未缓存
                                loadreceiveShadow(shSceneName,geometry,projectionIn.picturePath,function(shadowmesh){
                                    receiveShadows.set(shSaveName,shadowmesh);
                                    scene.remove( blendMap.get(shSceneName) );
                                    Web3DBins.prototype.cacheClear(blendMap.get(shSceneName));
                                    scene.add( shadowmesh );
                                    blendMap.set(shSceneName,shadowmesh);
                                    projectionConter();
                                });
                                //
                            }
                        }
                        else{//场景中不存在则添加
                            if( receiveShadows.get( shSaveName ) !== undefined ){//已缓存
                                scene.add( receiveShadows.get( shSaveName ) );
                                blendMap.set(shSceneName,receiveShadows.get( shSaveName ));
                                projectionConter();
                            }
                            else{//未缓存
                                loadreceiveShadow(shSceneName,geometry,projectionIn.picturePath,function(shadowmesh){
                                    receiveShadows.set(shSaveName,shadowmesh);
                                    scene.add( shadowmesh );
                                    blendMap.set(shSceneName,shadowmesh);
                                    projectionConter();
                                });
                            }
                        }
                    };

                    function projectionConter(){
                        /*projectionInConter ++;
            if( projectionInConter == json.projectionIn.length ){
                //执行单帧渲染
                renderer.render( scene, camera );
                //composer.render();
            }*/
                        loadSurveillance[id].meshBlendLoadNum+=1;
                        var Surveillance = loadSurveillance[id];
                        if(Surveillance.meshLength == Surveillance.chooseMeshLength&&Surveillance.meshBlendLoadNum==Surveillance.meshBlendNum){
                            //执行单帧渲染
                            Surveillance.meshLoadStatue="over";
                            if(Surveillance.pictureLoadNum==Surveillance.pictureNum){
                                //renderer.domElement.style.visibility="";
                                renderer.render( scene, camera );
                                Web3DBins.prototype.goCallback(id);
                                //alert("render");
                            }
                        }
                    };

                    function loadreceiveShadow(shSceneName,geometry,picturePath,callback){
                        var textureLoader = new THREE.TextureLoader();
                        textureLoader.load(picturePath,function(currentMaps){
                            var shadowmaterial = new THREE.MeshLambertMaterial( { map: currentMaps} );
                            shadowmaterial.transparent = true;
                            var blending = "MultiplyBlending";
                            shadowmaterial.blending = THREE[ blending ];
                            shadowmaterial.blendEquation = THREE.MaxEquatxion;
                            var shadowmesh = new THREE.Mesh(geometry,shadowmaterial);
                            shadowmesh.name = shSceneName;
                            var selfMesh = meshMap[json.sceneName];
                            shadowmesh.position.copy(selfMesh.position);
                            shadowmesh.updateMatrix();
                            callback(shadowmesh);
                        });
                    };

                    //执行加载统计与回调
                    function finishedAssembly(callback){

                        var returnObj ={
                            loadCount:0,
                            sceneName:json.sceneName
                        };

                        //计算更换数量
                        var Surveillance = loadSurveillance[id];
                        Surveillance.meshLength = Surveillance.meshLength+1;
                        returnObj.loadCount = Surveillance.meshLength;

                        //执行回调函数
                        if(callback != undefined){
                            //callback(json.sceneName,returnObj);
                            if(Surveillance.meshLength == Surveillance.chooseMeshLength){
                                Surveillance.totalCallback = callback;
                                Surveillance.totalObj = returnObj;
                            }
                            else callback(returnObj);
                        }
                        //renderer.domElement.style.visibility="hidden";
                        //console.log(2);
                        //renderer.render(scene,camera);
                        //renderer.compile(scene,camera);
                        //更换结束
                        if(Surveillance.meshLength == Surveillance.chooseMeshLength&&Surveillance.meshBlendLoadNum==Surveillance.meshBlendNum){
                            //执行单帧渲染
                            Surveillance.meshLoadStatue="over";
                            if(Surveillance.pictureLoadNum==Surveillance.pictureNum){
                                //renderer.domElement.style.visibility="";
                                renderer.render( scene, camera );
                                Web3DBins.prototype.goCallback(id);
                            }
                            //composer.render();
                        }

                        // renderer.render( scene, camera );
                        // //composer.render();
                    };

                    //获取几何体函数
                    function loadGeo( binPath,callback ){
                        //var loader = new THREE.BinaryLoader();
                        //var bufferLoader = new THREE.FileLoader( loader.manager );
                        var bufferLoader = new THREE.FileLoader( THREE.DefaultLoadingManager );
                        bufferLoader.setResponseType( 'arraybuffer' );
                        bufferLoader.load( filePrefix+binPath+fileSuffix, function ( bufData ) {
                            //loader.parse( bufData, callback, "", [] );
                            Web3DBins.prototype.modelParseqs(bufData, callback, "", [],json.modelHash,json.modelCode,binPath);
                        });
                    };
                };
            },

            deleteMesh:function(sceneName){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    if(meshMap[sceneName]!=undefined){
                        scene.remove(meshMap[sceneName]);
                        Web3DBins.prototype.cacheClear(meshMap[sceneName]);
                        delete meshMap[sceneName];
                        Web3DBins.prototype.renderanimate();
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
            },

            prototypeOperate:function(data,callback){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    if(meshMap[data.sceneName]!=undefined){
                        if(meshMap[data.sceneName].material instanceof Array){
                            for(var n in meshMap[data.sceneName].material){
                                var tmp=meshMap[data.sceneName].material[n];
                                if(tmp.name==data.materialName){
                                    setPrototype(tmp,parseInt(n));
                                    return;
                                }
                            }
                            console.warn("material "+data.materialName+" is not exist");
                        }
                        else{
                            setPrototype(meshMap[data.sceneName].material);
                        }
                    }
                    else{
                        console.warn("sceneName "+data.sceneName+" is undefind");
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

                function setPrototype(material,materiaIndex){
                    if(data.type=="colorDiffuse"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.color.setRGB(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                    }
                    else if(data.type=="emissive"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.emissive.setRGB(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                    }
                    else if(data.type=="colorSpecular"){
                        if(material.type!="meshPhongMaterial"){
                            console.warn(material.type+" not support speuclar");
                            return;
                        }
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.specular.setRGB(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                    }
                    else if(data.type=="doubleSided"){
                        if(parseFloat(data.value)==1)material.side=2;
                        else material.side=0;
                    }
                    else if(data.type=="transparent"){
                        material.transparent=Boolean(parseFloat(data.value));
                    }
                    else if(data.type=="opacity"){
                        material.opacity=parseFloat(data.value);
                    }
                    else if(data.type=="mapDiffuseRepeat"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.map.repeat.set(dataIntArr[0],dataIntArr[1]);
                    }
                    else if(data.type=="mapDiffuseOffset"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.map.offset.set(dataIntArr[0],dataIntArr[1]);
                    }
                    else if(data.type=="mapSpecularRepeat"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.specularMap.repeat.set(dataIntArr[0],dataIntArr[1]);
                    }
                    else if(data.type=="mapSpecularOffset"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.specularMap.offset.set(dataIntArr[0],dataIntArr[1]);
                    }
                    else if(data.type=="mapBumpRepeat"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.bumpMap.repeat.set(dataIntArr[0],dataIntArr[1]);
                    }
                    else if(data.type=="mapBumpOffset"){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        material.bumpMap.offset.set(dataIntArr[0],dataIntArr[1]);
                    }
                    else if(data.type=="roughness"){
                        if(material.type!="MeshStandardMaterial")return;
                        material.roughness=parseFloat(data.value);
                    }
                    else if(data.type=="metalness"){
                        if(material.type!="MeshStandardMaterial")return;
                        material.metalness=parseFloat(data.value);
                    }
                    else if(data.type=="emissiveIntensity"){
                        material.emissiveIntensity=parseFloat(data.value);
                    }
                    else if(data.type=="Shading"){
                        if(data.value=="basic"){
                            if (material.type=="MeshBasicMaterial")return;
                            var tmp=new THREE.MeshBasicMaterial();
                            clonePrototype(tmp,material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex]=tmp;
                        }
                        else if(data.value=="phong"){
                            if (material.type=="MeshPhongMaterial")return;
                            var tmp=new THREE.MeshPhongMaterial();
                            clonePrototype(tmp,material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex]=tmp;
                        }
                        else if(data.value=="standard"){
                            if (material.type=="MeshStandardMaterial")return;
                            var tmp=new THREE.MeshStandardMaterial();
                            clonePrototype(tmp,material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex]=tmp;
                        }
                        else if(data.value=="lambert"){
                            if (material.type=="MeshLambertMaterial")return;
                            var tmp=new THREE.MeshLambertMaterial();
                            clonePrototype(tmp,material);
                            material.dispose();
                            meshMap[data.sceneName].material[materiaIndex]=tmp;
                        }
                    }
                    Web3DBins.prototype.renderanimate();
                }

                function clonePrototype(materialA,materialB){
                    materialA.color.copy (materialB.color);
                    materialA.map=materialB.map;
                    materialA.aoMap=materialB.aoMap;
                    materialA.bumpMap=materialB.bumpMap;
                    materialA.bumpScale=materialB.bumpScale;
                    materialA.normalMap=materialB.normalMap;
                    materialA.normalScale=materialB.normalScale;
                    materialA.opacity=materialB.opacity;
                    materialA.side=materialB.side;
                    materialA.transparent=materialB.transparent;
                    if(materialB.specularMap!=undefined&&materialA.type!="MeshStandardMaterial")materialA.specularMap=materialB.specularMap;
                    materialA.name=materialB.name;
                    materialA.needsUpdate=true;
                }
            },

            textureOperate:function(data,callback){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    if(meshMap[data.sceneName]!=undefined){
                        if(meshMap[data.sceneName].material instanceof Array){
                            for(var n in meshMap[data.sceneName].material){
                                var tmp=meshMap[data.sceneName].material[n];
                                if(tmp.name==data.materialName){
                                    setTextures(tmp,callback);
                                    return;
                                }
                            }
                            console.warn("material "+data.materialName+" is not exist");
                        }
                        else{
                            setTextures(meshMap[data.sceneName].material,callback);
                        }
                    }
                    else{
                        console.warn("sceneName "+data.sceneName+" is undefind");
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
                function setTextures(material,callback){
                    var tmpMap;
                    if(data.textureType=="mapDiffuse")tmpMap="map";
                    else if(data.textureType=="mapAO")tmpMap="aomap";
                    else if(data.textureType=="mapEmissive")tmpMap="emissiveMap";
                    else if(data.textureType=="mapSpecular")tmpMap="specularMap";
                    else if(data.textureType=="mapBump")tmpMap="bumpMap";
                    else {
                        console.warn(data.textureType+" :is not support");
                        return;
                    }
                    if(data.texturePath==null||data.texturePath=="null"){
                        if(material[tmpMap]!=null)material[tmpMap].dispose();
                        material[tmpMap]=null;
                        renderAndCallback(material,callback);
                    }
                    else{
                        var textureLoader= new THREE.TextureLoader();
                        textureLoader.setCrossOrigin("");
                        textureLoader.load( data.texturePath,function(texture){
                            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                            if(material[tmpMap]!=undefined&&material[tmpMap]!=null){
                                texture.offset.set(material[tmpMap].offset.x, material[tmpMap].offset.y);
                                texture.repeat.set(material[tmpMap].repeat.x, material[tmpMap].repeat.y);
                            }
                            if(material[tmpMap]!=null)material[tmpMap].dispose();
                            material[tmpMap]=texture;
                            renderAndCallback(material,callback);

                        });
                    }
                }
                function renderAndCallback(material,callback){
                    material.needsUpdate=true;
                    Web3DBins.prototype.renderanimate();
                    if(callback!=undefined)callback();
                };
            },

            /*textureOperate:function(data,callback){
   if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
       if(meshMap[data.sceneName]!=undefined){
           if(meshMap[data.sceneName].material instanceof Array){
               for(var n in meshMap[data.sceneName].material){
                   var tmp=meshMap[data.sceneName].material[n];
                   if(tmp.name==data.materialName){
                        setTextures(tmp,callback);
                        return;
                    }
               }
               console.warn("material "+data.materialName+" is not exist");
           }
           else{
                setTextures(meshMap[data.sceneName].material,callback);
           }
       }
       else{
           console.warn("sceneName "+data.sceneName+" is undefind");
       }
   }
   else{
       console.warn( 'interruption ' + interruptionState + ' is enable.' );
   }
   function setTextures(material,callback){
		if(data.texturePath==undefined||data.texturePath==null||data.texturePath==""){
			var tmpMap;
			if(data.textureType=="mapDiffuse")tmpMap=material.map;
			else if(data.textureType=="mapAO")tmpMap=material.aomap
			else if(data.textureType=="mapEmissive")tmpMap=material.emissiveMap;
			else if(data.textureType=="mapSpecular")tmpMap=material.specularMap;
			else if(data.textureType=="mapBump")tmpMap=material.bumpMap;
			else return;
			if (tmpMap==null)return;
			if(data.textureRepeat!=undefined&&data.textureRepeat!=null){
				var tmps=data.textureRepeat.split(",");
				tmpMap.repeat.set(parseFloat(tmps[0]),parseFloat(tmps[1]));
			}
			if(data.textureOffset!=undefined&&data.textureOffset!=null){
				var tmps=data.textureOffset.split(",");
				tmpMap.offset.set(parseFloat(tmps[0]),parseFloat(tmps[1]));
			}
			renderAndCallback(material,callback);
		}
		else{
			var textureLoader= new THREE.TextureLoader();
			textureLoader.setCrossOrigin("");
			textureLoader.load( data.texturePath,function(texture){
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				texture.offset.set( 0, 0 );
				texture.repeat.set(1, 1);
				if(data.textureRepeat!=undefined&&data.textureRepeat!=null){
					var tmps=data.textureRepeat.split(",");
					texture.repeat.set(parseFloat(tmps[0]),parseFloat(tmps[1]));
				}
				if(data.textureOffset!=undefined&&data.textureOffset!=null){
					var tmps=data.textureOffset.split(",");
					texture.offset.set(parseFloat(tmps[0]),parseFloat(tmps[1]));
				}
				if(data.textureType=="diffuse"){
					material.map.dispose();
					material.map=texture;
					renderAndCallback(material,callback);
				}
				else if(data.textureType=="ao"){
					material.aomap.dispose();
					material.aomap=texture;
					renderAndCallback(material,callback);
				}
				else if(data.textureType=="emissive"){
					material.emissiveMap.dispose();
					material.emissiveMap=texture;
					renderAndCallback(material,callback);
				}
				else if(data.textureType=="specular"){
					material.specularMap.dispose();
					material.specularMap=texture;
					renderAndCallback(material,callback);
				}
				else if(data.textureType=="bump"){
					material.bumpMap.dispose();
					material.bumpMap=texture;
					renderAndCallback(material,callback);
				}
				else {
					console.warn("textureType "+data.textureType+" is not support" );
				}
			});
		}
   };
   function renderAndCallback(material,callback){
        material.needsUpdate=true;
        Web3DBins.prototype.renderanimate();
        if(callback!=undefined)callback();
   };
},*/

            meshOperate:function(data){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    if(meshMap[data.sceneName]!=undefined){
                        var dataIntArr = Web3DBins.prototype.splitArr(data.value);
                        if(data.type=="position"){
                            meshMap[data.sceneName].position.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                        }
                        else if(data.type=="rotation"){
                            meshMap[data.sceneName].rotation.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                        }
                        else if(data.type=="scale"){
                            meshMap[data.sceneName].scale.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                        }
                        Web3DBins.prototype.renderanimate();
                    }
                    else{
                        console.warn("sceneName "+data.sceneName+" is undefind");
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
            },

            addDecalText:function(data,callback){
                var textGroup=document.createElement("div");
                textGroup.innerHTML=data.textstr;
                var canvas = document.createElement('canvas');
                canvas.width=1024;
                canvas.height=1024;
                var ctx = canvas.getContext("2d");
                var ctxX=0,ctxY=0;
                var ycount=0;
                var ysize=0.8;
                for(var z=0;z<textGroup.children.length;z++){
                    var ele=$(textGroup.children[z]);
                    var color=ele.css("color");
                    var fSize=parseInt(ele.css("font-size"));
                    var str=ele.text();
                    var fStyle=ele.css("font-family");
                    if(z==0)ctxY=fSize/1.2;
                    ctx.fillStyle=color;
                    ctx.font=fSize+"px "+fStyle;
                    for(var i=0;i<str.length;i++){
                        ctxX+=ctx.measureText(str[i]).width;
                        if((str[i]>'a'&&str[i]<'z')||(str[i]>'A'&&str[i]<'Z')||str.charCodeAt(i) > 255)ysize=1.1;
                        if(ctxX>canvas.width){
                            ycount+=1;
                            ctxY+=fSize*ysize;
                            if(ctxY*1.2>ctxX) { ctxY-=fSize*ysize;break;}
                            ysize=0.8;
                            ctxX=ctx.measureText(str[i]).width;
                            lastSubStrIndex=i;
                            ctx.fillText(str[i],0,ctxY);
                        }
                        else{
                            ctx.fillText(str[i],(ctxX-ctx.measureText(str[i]).width),ctxY);
                        }
                    }
                }
                var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
                if(ycount==0){
                    canvas.height=canvas.width;
                    ctx.putImageData(imgData,(canvas.width-ctxX)/2,(canvas.width-ctxY*1.2)/2);
                }
                else{
                    canvas.height=canvas.width;
                    ctx.putImageData(imgData,0,(canvas.width-ctxY*1.2)/2);
                }
                data.decalImgSrc=canvas.toDataURL();
                Web3DBins.prototype.addDecalPic(data,callback,data.textstr);
            },

            splitArr :function (inData){

                var inDataArr = inData.split(',');
                var outDataArr = [];
                inDataArr.forEach(function(data,index,arr){
                    outDataArr.push(parseFloat(data));
                });
                return outDataArr;
            },

            shineAssembly :function (sceneName,time){
                console.warn( 'Web3DBins.prototype.shineAssembly:Interface is not completed' );
                return ;

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){

                    var shineTime = time !== undefined ? time : 2;
                    if(meshMap[sceneName]!=undefined){
                        selectedObjects = [];
                        selectedObjects.push(meshMap[sceneName]);
                        blendMap.forEach(function (value, key, map) {
                            var temp=key.split("_");
                            if(temp[0]==sceneName)selectedObjects.push(value);
                        });
                        outlinePass.pulsePeriod=1;
                        outlinePass.selectedObjects=selectedObjects;
                        controls.removeEventListener( 'change',Web3DBins.prototype.renderanimate);
                        var clock = new THREE.Clock(true);
                        clock.start();
                        animate();
                        function animate(){
                            if(clock.getElapsedTime()>shineTime){
                                outlinePass.selectedObjects=[];
                                renderer.render(scene,camera);
                                //composer.render();
                                controls.addEventListener( 'change',Web3DBins.prototype.renderanimate);
                                return;
                            }
                            requestAnimationFrame(animate);
                            renderer.render(scene,camera);
                            //composer.render();
                        };
                    }
                    else{
                        console.warn( 'sceneName ' + sceneName + ' is undefined.' );
                    }

                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

            },

            frameskip :function (angle){

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    var tmp=controls.getAzimuthalAngle()-Math.PI+angle/180*Math.PI;
                    controls.rotateLeftByAngle(tmp);
                    for(var n=0;n<lightControlsGroup.length;n++){
                        lightControlsGroup[n].rotateLeftByAngle(tmp);
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

            },

            rotateSelf : function(data){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    if( data.power != 1 && data.power != 0 ){
                        return;
                    }
                    else {
                        var anglePerFrame = data.angle !== undefined? data.angle : 1.0;
                        rotateSelfFlag = data.power;
                        if( rotateSelfFlag == 1 ){
                            animate();
                        }
                    }

                }
                else{
                    console.warn( 'Web3DBins.accelerometer:interruption ' + interruptionState + ' is enable.' );
                }

                function animate(){
                    if( rotateSelfFlag == 0 ){
                        return;
                    }
                    requestAnimationFrame(animate);
                    if( typeof(controls) !== "undefined" ){//防止初始化异步带来的问题
                        Web3DBins.prototype.rotateFrame( anglePerFrame );
                    }
                };
            },

            renderanimate : function(){

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){

                    requestAnimationFrame(animate);
                    function animate(){
                        renderer.render(scene,camera);
                        //composer.render();
                    };

                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

            },

            rotateFrame :function (angle){

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){

                    controls.rotateLeftByAngle(angle/180*Math.PI);
                    for(var n=0;n<lightControlsGroup.length;n++){
                        lightControlsGroup[n].rotateLeftByAngle(angle/180*Math.PI);
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

            },

            rotateAndZoom:function(angle,scale){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    controls.zoomAndUpdate(scale);
                    controls.rotateLeftByAngle(angle/180*Math.PI);
                    for(var n in lightControlsGroup){
                        lightControlsGroup[n].rotateLeftByAngle(angle/180*Math.PI);
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
            },

            getScreen :function (angle){

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    angle=angle!=undefined&&angle!=null?angle:0;
                    controls.saveState1();
                    for(var n=0;n<lightControlsGroup.length;n++){
                        lightControlsGroup[n].saveState1();
                    }

                    controls.reset();
                    for(var n=0;n<lightControlsGroup.length;n++){
                        lightControlsGroup[n].reset();
                    }
                    Web3DBins.prototype.rotateFrame(angle);
                    renderer.render(scene,camera);
                    //composer.render();
                    var strDataURI = renderer.domElement.toDataURL();

                    var w =  renderer.domElement.width, h = renderer.domElement.height,z=0;
                    var canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(renderer.domElement,0,0,w,h);
                    var data = ctx.getImageData(0, 0, w, h).data;
                    var left,top,bottom,right;
                    for (var col = 0; col < w; col++) {
                        for (var row = 0; row < h; row++) {
                            if(data[(col + row * w) * 4 + 3] != 0){
                                left = col+1;
                                break;
                            }
                        }
                    }
                    for (var col = w; col > 0; col--) {
                        for (var row = 0; row < h; row++) {
                            if(data[(col + row * w) * 4 + 3] != 0){
                                right = col-1;
                                break;
                            }
                        }
                    }
                    for (var row = 0; row < h; row++) {
                        for (var col = 0; col < w; col++) {
                            if(data[(col + row * w) * 4 + 3] != 0){
                                top = row+1;
                                break;
                            }
                        }
                    }
                    for (var row = h; row >0; row--) {
                        for (var col = 0; col < w; col++) {
                            if(data[(col + row * w) * 4 + 3] != 0){
                                bottom = row-1;
                                break;
                            }
                        }
                    }
                    w = -right + left;
                    h = -bottom + top;
                    z = w>h?w:h;
                    canvas.width = z;
                    canvas.height = z;
                    ctx.drawImage(renderer.domElement,right,bottom,w,h,(z-w)/2,(z-h)/2,w,h);
                    // z = w>h?w:h;
                    // canvas.width = z;
                    // canvas.height = z;
                    // var ctx = canvas.getContext("2d");
                    // ctx.drawImage(renderer.domElement,0,0,w,h,(z-w)/2,(z-h)/2,w,h);

                    controls.reset1();

                    for(var n=0;n<lightControlsGroup.length;n++){
                        lightControlsGroup[n].reset1();
                    }

                    return canvas.toDataURL();
                    //return strDataURI;

                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

            },

            accelerometer :function (data){

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){

                    if( !window.DeviceOrientationEvent ){//检测
                        alert("对不起，您的浏览器还不支持Device Orientation!");
                    }
                    else if( data.accelerometerPower != 1 && data.accelerometerPower != 0 ){
                        return;
                    }
                    else {
                        var speedRatio = data.speedRatio !== undefined? data.speedRatio : 1.0;
                        accelerometerPowerFlag = data.accelerometerPower;
                        speed=0.00;
                        if( accelerometerPowerFlag == 1 ){
                            window.addEventListener('deviceorientation', rotate,false );
                            animate();
                        }
                        else{
                            window.removeEventListener('deviceorientation', rotate,false );
                        }
                    }

                }
                else{
                    console.warn( 'Web3DBins.accelerometer:interruption ' + interruptionState + ' is enable.' );
                }

                function rotate(event){
                    var gamma = event.gamma;
                    if(gamma>10||gamma<-10){
                        speed=gamma*0.1;
                    }
                    else {
                        speed=0.0;
                    }
                };

                function animate(){
                    if( accelerometerPowerFlag == 0 ){
                        return;
                    }
                    requestAnimationFrame(animate);
                    if( typeof(controls) !== "undefined" ){//防止初始化异步带来的问题
                        Web3DBins.prototype.rotateFrame( speed * speedRatio );
                    }
                };
            },

            getAccelerometerPowerFlag :function(){
                return accelerometerPowerFlag;
            },

            isEffectiveDecalInArea :function(uv, assemblyCode,event){
                var meshDecalArea = meshDecalAreaMap.get(assemblyCode);
                var decalArea;
                if( meshDecalArea == undefined ){//未定义区域说明不可贴花
                    return false;
                }
                else{
                    decalArea = meshDecalArea.decalArea;
                    if( decalArea != undefined ){
                        if( uv.x >= decalArea.minX && uv.x <= decalArea.maxX && uv.y >= decalArea.minY && uv.y <= decalArea.maxY ){
                            return true;
                        }
                        else{
                            if(event!=undefined&&event!=null){
                                var vector=decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                                vector.project(camera);
                                //vector.x = ( vector.x + 1) * renderer.domElement.width / 2;
                                //vector.y = - ( vector.y - 1) * renderer.domElement.height / 2;
                                vector.x = Math.round((0.5 + vector.x / 2) *renderer.domElement.width );
                                vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                                relativeUV.x=event.offsetX-vector.x;
                                relativeUV.y=event.offsetY-vector.y;
                            }
                            return false;
                        }
                    }else{
                        return false;
                    }
                }
            },

            addDecalPic :function (data,callback,textData){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    var intersection = {
                        intersects: false,
                        point: new THREE.Vector3(),
                        normal: new THREE.Vector3()
                    };//交叉情况（碰撞）
                    Web3DBins.prototype.setInterruptionState("addDec");
                    if( data.UVPosition !== undefined ){//有传UV位置参数
                        addDeclWithUV();
                    }
                    else{//没有UV位置参数，采取鼠标监听
                        renderer.domElement.style.cursor = "crosshair";
                        Web3DBins.prototype.setControlsState(false);
                        Web3DBins.prototype.showDecalAreaMesh(1,data.assemblySceneName);//点击前显示贴花区域，贴花生成后或贴花无法生成时消除贴花区域
                        renderer.domElement.addEventListener('click',checkIntersection);
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                    if( callback !== undefined ){
                        callback("failed");
                    }
                }

                function checkIntersection(event) {

                    renderer.domElement.removeEventListener('click',checkIntersection);
                    Web3DBins.prototype.setControlsState(true);
                    Web3DBins.prototype.setInterruptionState(null);
                    renderer.domElement.style.cursor = "default";

                    if( meshMap[data.assemblySceneName] == undefined ){//场景中没有该模型
                        console.warn( 'Web3DBins.prototype.addDecalPic:assemblySceneName is undefined' );
                        Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                    }
                    else if( meshDecalAreaMap.get(meshMap[data.assemblySceneName].name) == undefined ){
                        console.warn( 'Web3DBins.prototype.addDecalPic:assemblyUVMapping is undefined' );
                        Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                    }
                    else{

                        // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                        // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                        mouse.x = ( event.offsetX / renderer.domElement.width ) * 2 - 1;
                        mouse.y = - ( event.offsetY / renderer.domElement.height ) * 2 + 1;
                        // console.log("== mouse x="+mouse.x +",y="+mouse.y);
                        decalClientPosition.set(data.decalID,{
                            x :event.offsetX,
                            y :event.offsetY
                        });//保存印花事件坐标
                        var raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera( mouse, camera );
                        var intersects = raycaster.intersectObjects( [ meshMap[data.assemblySceneName] ] );
                        if ( intersects.length > 0 ) {

                            var p = intersects[ 0 ].point;
                            mouseHelper.position.copy( p );
                            intersection.point.copy( p );

                            var vv =intersects[ 0 ].uv;
                            // console.log("vv");
                            // console.log(vv);

                            var n = intersects[ 0 ].face.normal.clone();
                            n.multiplyScalar( 10 );
                            n.add( intersects[ 0 ].point );
                            normalN.addScaledVector(n,-1);//法向量的反方向
                            data.nz = n.z;

                            intersection.normal.copy( intersects[ 0 ].face.normal );
                            mouseHelper.lookAt( n );

                            if( ! Web3DBins.prototype.isEffectiveDecalInArea( vv, meshMap[data.assemblySceneName].name ) ){
                                //不在印花区域内
                                Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                                if( callback !== undefined ){
                                    callback("failed");
                                }
                                return;
                            }

                            //删除历史记录
                            if( decalMeshs.get(data.decalID) ){//印花存在
                                scene.remove(decalMeshs.get(data.decalID).mesh);
                                Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).mesh);
                                decalMeshs.delete(data.decalID);
                            }
                            decalMeshs.set( data.decalID, {
                                "mesh": null,
                                "material": null,
                                "sceneName": data.decalID,
                                "assemblySceneName": data.assemblySceneName,
                                "UVPosition": vv.clone(),
                                "UVRotation": 0,
                                "UVRotationDeviation": 0,
                                "decalImage": null,
                                "versionImgSRC": meshDecalAreaMap.get(meshMap[data.assemblySceneName].name).assemblyUVMappingSRC,
                                "decalScale": 1.0,
                                "decalTextureScale": null,
                                "worldPosition": p.clone(),
                                "normal": intersects[ 0 ].face.normal.clone(),
                                "translateEnable":data.translateEnable === undefined ? true : data.translateEnable,
                                "rotateEnable":data.rotateEnable === undefined ? true : data.rotateEnable,
                                "scaleEnable":data.scaleEnable === undefined ? true : data.scaleEnable
                            } );

                            if( textData!=null ){//绣字
                                decalMeshs.get(data.decalID).htmlData = textData;
                            }

                            intersection.intersects = true;

                            var textureLoader = new THREE.TextureLoader();
                            var img=new Image();
                            img.setAttribute('crossOrigin', 'anonymous');
                            img.onload=function(){
                                //获取贴花图片
                                //textureDecal = textureLoader.load(data.decalImgSrc,function(textureDecal){
                                var canvas=document.createElement("canvas");
                                canvas.width=img.width;
                                canvas.height=img.height;
                                var ctx=canvas.getContext('2d');
                                ctx.drawImage(img,0,0);
                                var textureDecal = new THREE.Texture( canvas );
                                textureDecal.needsUpdate = true;
                                // textureDecal.repeat.x=1;
                                // textureDecal.repeat.y=1;
                                decalMeshs.get(data.decalID).decalImage = textureDecal.image;
                                decalMaterial = new THREE.MeshBasicMaterial( {
                                    //specular: 0x444444,
                                    map: textureDecal,
                                    //normalMap: decalNormal,
                                    //normalScale: new THREE.Vector2( 1, 1 ),
                                    //shininess: 40,
                                    transparent: true,
                                    depthTest: true,
                                    depthWrite: false,
                                    polygonOffset: true,
                                    polygonOffsetFactor: - 4,
                                    wireframe: false
                                } );
                                decalMeshs.get(data.decalID).material = decalMaterial;

                                //获取部件版型图
                                textureVersion = textureLoader.load(filePrefix + meshDecalAreaMap.get(meshMap[data.assemblySceneName].name).assemblyUVMappingSRC + fileSuffix,function(textureVersion){
                                    Web3DBins.prototype.shoot(data,callback);
                                });
                                //});
                            }

                        } else {

                            intersection.intersects = false;
                            Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域

                        }

                    }
                };
                function addDeclWithUV(){
                    Web3DBins.prototype.setInterruptionState(null);
                    if( meshMap[data.assemblySceneName] == undefined ){//场景中没有该模型
                        console.warn( 'Web3DBins.prototype.addDecal:assemblySceneName is undefined' );
                    }
                    else{
                        var UVP = new THREE.Vector2( data.UVPosition.x, data.UVPosition.y );
                        // if( data.UVPositionMove !== undefined ){
                        //     UVP.x = UVP.x + data.UVPositionMove.x;
                        //     UVP.y = UVP.y + data.UVPositionMove.y;
                        // }
                        var UVR = data.UVRotation==undefined?0:data.UVRotation;
                        // var UVTS = data.decalTextureScale==undefined?null:data.decalTextureScale;
                        // var UVS = UVTS == undefined?1.0:UVTS/conversionRatio/S;
                        var UVS = data.decalScale == undefined?1.0:data.decalScale;
                        var UVTS = UVS*conversionRatio*S;

                        if(data.worldPosition!=undefined&&data.worldPosition!=null&&data.normal!=undefined&&data.normal!=null){
                            var vector=new Object();
                            vector.point=new THREE.Vector3(Number(data.worldPosition.x),Number(data.worldPosition.y),Number(data.worldPosition.z));
                            vector.normal=new THREE.Vector3(Number(data.normal.x),Number(data.normal.y),Number(data.normal.z));
                            vector.uv=new THREE.Vector2( Number(data.UVPosition.x), Number(data.UVPosition.y) );
                        }
                        else{
                            var vector = Web3DBins.prototype.UVPToWorldP(UVP.x,UVP.y,data.assemblySceneName);
                        }
                        if( vector != null ){//有效点

                            var p = vector.point;
                            mouseHelper.position.copy( p );
                            intersection.point.copy( p );

                            var n = vector.normal.clone();
                            n.multiplyScalar( 10 );
                            n.add( p );
                            normalN.addScaledVector(n,1);//法向量的反方向
                            data.nz = n.z;


                            intersection.normal.copy( n );
                            mouseHelper.lookAt( n );

                            if( ! Web3DBins.prototype.isEffectiveDecalInArea( UVP, meshMap[data.assemblySceneName].name ) ){
                                //不在印花区域内
                                if( callback !== undefined ){
                                    callback("failed");
                                }
                                return;
                            }

                            //删除历史记录
                            if( decalMeshs.get(data.decalID) ){//印花存在
                                scene.remove(decalMeshs.get(data.decalID).mesh);
                                Web3DBins.prototype.cacheClear(decalMeshs.get(data.decalID).mesh);
                                decalMeshs.delete(data.decalID);
                            }

                            decalMeshs.set( data.decalID, {
                                "mesh": null,
                                "material": null,
                                "sceneName": data.decalID,
                                "assemblySceneName": data.assemblySceneName,
                                "UVPosition": vector.uv.clone(),
                                "UVRotation": UVR,
                                "UVRotationDeviation": 0,
                                "decalImage": null,
                                "versionImgSRC": meshDecalAreaMap.get(meshMap[data.assemblySceneName].name).assemblyUVMappingSRC,
                                "decalScale": UVS,
                                "decalTextureScale": UVTS,
                                "worldPosition": p.clone(),
                                "normal": vector.normal.clone(),
                                "translateEnable":data.translateEnable === undefined ? true : data.translateEnable,
                                "rotateEnable":data.rotateEnable === undefined ? true : data.rotateEnable,
                                "scaleEnable":data.scaleEnable === undefined ? true : data.scaleEnable,
                                "point":intersection.point,
                                "rotate": mouseHelper.rotation
                            } );


                            if( textData ){//绣字
                                decalMeshs.get(data.decalID).htmlData = textData;
                            }

                            data.point = intersection.point;
                            data.rotate = mouseHelper.rotation;
                            intersection.intersects = true;

                            var textureLoader = new THREE.TextureLoader();
                            var img=new Image();
                            img.setAttribute('crossOrigin', 'anonymous');
                            img.onload=function(){
                                //获取贴花图片
                                //textureDecal = textureLoader.load(data.decalImgSrc,function(textureDecal){
                                var canvas=document.createElement("canvas");
                                canvas.width=img.width;
                                canvas.height=img.height;
                                var ctx=canvas.getContext('2d');
                                ctx.drawImage(img,0,0);
                                var textureDecal = new THREE.Texture( canvas );
                                textureDecal.needsUpdate = true;
                                decalMeshs.get(data.decalID).decalImage = textureDecal.image;
                                decalMaterial = new THREE.MeshBasicMaterial( {
                                    //specular: 0x444444,
                                    map: textureDecal,
                                    //normalMap: decalNormal,
                                    //normalScale: new THREE.Vector2( 1, 1 ),
                                    //shininess: 40,
                                    transparent: true,
                                    depthTest: true,
                                    depthWrite: false,
                                    polygonOffset: true,
                                    polygonOffsetFactor: - 4,
                                    wireframe: false
                                } );
                                decalMeshs.get(data.decalID).material = decalMaterial;

                                //获取部件版型图
                                textureVersion = textureLoader.load(filePrefix + meshDecalAreaMap.get(meshMap[data.assemblySceneName].name).assemblyUVMappingSRC + fileSuffix,function(textureVersion){
                                    Web3DBins.prototype.shoot(data,callback);
                                });
                                //});
                            }
                            img.src=data.decalImgSrc;

                        }
                        else{//无效点
                        }
                    }
                };

            },

            showDecalAreaMesh:function( power, sceneName ){
                if( power == 0 ){//off
                    if( decalAreaMesh != null ){
                        scene.remove( decalAreaMesh );
                        Web3DBins.prototype.cacheClear(decalAreaMesh);
                        renderer.render( scene, camera );
                        //composer.render();
                        decalAreaMesh = null;
                    }
                }else if( power == 1 ){//on
                    if(meshMap[sceneName]==null&&meshMap[sceneName]==undefined){
                        console.warn("Web3DBins.prototype.showDecalAreaMesh:assemblySceneName is undefined");
                        return;
                    }
                    var assemblyCode = meshMap[sceneName].name;
                    var decalArea = meshDecalAreaMap.get(assemblyCode).decalArea;

                    var canvas = document.createElement('canvas');
                    canvas.style.position = "absolute";
                    var img =  new Image();//UV图
                    img.src=meshDecalAreaMap.get(assemblyCode).assemblyUVMappingSRC;
                    img.onload=function(){

                        canvas.width=img.width * ( decalArea.maxX - decalArea.minX );
                        canvas.height=img.height * ( decalArea.maxY - decalArea.minY );

                        var context = canvas.getContext("2d");
                        context.globalCompositeOperation="source-over";
                        //context.fillStyle="#FFAAAA";
                        context.fillStyle="rgba(100%,66%,66%,0.6)";
                        context.fillRect(0,0,canvas.width,canvas.height);

                        var textureLoader = new THREE.TextureLoader();
                        textureLoader.load(canvas.toDataURL(),function(currentMaps){
                            var vector = Web3DBins.prototype.UVPToWorldP(( decalArea.maxX + decalArea.minX )/2,( decalArea.maxY + decalArea.minY )/2,sceneName);
                            if( vector != null ){//有效点

                                var p = vector.point;
                                mouseHelper.position.copy( p );
                                intersection.point.copy( p );

                                var n = vector.normal.clone();
                                n.multiplyScalar( 10 );
                                n.add( p );
                                normalN.addScaledVector(n,1);//法向量的反方向

                                intersection.normal.copy( n );
                                mouseHelper.lookAt( n );

                                intersection.intersects = true;

                                var textureLoader = new THREE.TextureLoader();

                                decalMaterial = new THREE.MeshBasicMaterial( {
                                    //specular: 0x000000,
                                    map: currentMaps,
                                    //normalMap: decalNormal,
                                    //normalScale: new THREE.Vector2( 1, 1 ),
                                    //shininess: 40,
                                    transparent: true,
                                    depthTest: true,
                                    depthWrite: false,
                                    polygonOffset: true,
                                    polygonOffsetFactor: - 4,
                                    wireframe: false
                                } );
                                p = intersection.point;
                                r.copy( mouseHelper.rotation );

                                //印花旋转值对法线旋转信息进行了修正
                                /*if( n.z < 0 ){
                        r.x = r.x > 0 ? r.x - Math.PI : r.x + Math.PI;
                        r.y = r.y > 0 ? r.y - Math.PI : r.y + Math.PI;
                        r.z = r.z > 0 ? r.z - Math.PI : r.z + Math.PI;
                        //r.multiply( new THREE.Vector3(-1,-1,-1) );
                    }
                    r.z = 0;*/
                                var s2 = new THREE.Vector3( (decalArea.maxX - decalArea.minX)/conversionRatio, ( decalArea.maxY - decalArea.minY )/conversionRatio, 1/conversionRatio );
                                var m = new THREE.Mesh( new THREE.DecalGeometry( meshMap[sceneName], p, r, s2, check ), decalMaterial );
                                decalAreaMesh = m;

                                scene.add(decalAreaMesh);
                                renderer.render( scene, camera );
                                //composer.render();
                            }
                            else{//无效点
                            }

                        });
                    };
                }
            },

            shoot :function(data,callback){
                var p = data.point.clone();
                var r = data.rotate.clone();
                var s = new THREE.Vector3(1,1,1);
                var dataDScale = data.decalScale;
                var decalMeshDScale = decalMeshs.get(data.decalID).decalScale;
                if( dataDScale !== undefined ){
                    s.set(dataDScale*40,dataDScale*40,dataDScale*40);
                    //decalMeshs.get(data.decalID).decalScale = data.scale*10;
                }
                else if( decalMeshDScale !== undefined ){
                    s.set(decalMeshDScale*40,decalMeshDScale*40,decalMeshDScale*40);
                }
                else{
                    //decalMeshs.get(data.decalID).decalScale = 10;
                    s.set(40,40,40);
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
                //var material = new THREE.MeshBasicMaterial({color:0xffffff});
                var shootGeometry = decalAreaMesh == null ? meshMap[data.assemblySceneName] : decalAreaMesh;
                var m = new THREE.Mesh( new THREE.DecalGeometry( shootGeometry, p, r, s, check ), material );
                //decalMeshs.get(data.decalID).decalTextureScale = getDecalScale( m, decalMeshs.get(data.decalID).UVPosition );//动态计算缩放比
                decalMeshs.get(data.decalID).decalTextureScale = S * decalMeshs.get(data.decalID).decalScale*conversionRatio;
                m.name = data.decalID;
                decalMeshs.get( data.decalID ).mesh= m;

                if( Web3DBins.prototype.checkInterruptionState(null) ){//贴花模型生成完毕且中断状态为null(非“持续修改贴花”状态)
                    Web3DBins.prototype.showDecalAreaMesh(0);//清除印花区域
                }

                scene.add( m );
                renderer.render( scene, camera );
                //composer.render();
                if( callback != undefined ){
                    callback("success");
                }

                function getDecalScale( mes,poi ){

                    var minPoiV2,minPoiV3;
                    var mousePoi = new THREE.Vector2();
                    var uvs = mes.geometry.uvs;
                    var poiIntersects;
                    var realUV = new THREE.Vector2();
                    for( var point0 in uvs ){
                        if( uvs[point0].x == 0 && uvs[point0].y == 0 ){
                            minPoiV2 = uvs[point0];//印花上的UV坐标
                            minPoiV3 = mes.geometry.vertices[point0];//点的空间坐标

                            //创建射线
                            var raycaster2 = new THREE.Raycaster();
                            raycaster2.set( minPoiV3, normalN.normalize() );
                            var intersects2 = raycaster2.intersectObjects( [ meshMap[decalMeshs.get(data.decalID).assemblySceneName] ] );
                            if(intersects2.length > 0){//碰撞
                                realUV = intersects2[ 0 ].uv;
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
                    for( var point2 in uvs ){
                        if( uvs[point2].x == 1 && uvs[point2].y == 0 ){
                            minPoiV3_2 = mes.geometry.vertices[point2];//点的空间坐标

                            //创建射线
                            var raycaster3 = new THREE.Raycaster();
                            raycaster3.set( minPoiV3_2, normalN.normalize() );
                            var intersects3 = raycaster3.intersectObjects( [ meshMap[decalMeshs.get(data.decalID).assemblySceneName] ] );
                            if(intersects3.length > 0){//存在遮挡物
                                realUV2 = intersects3[ 0 ].uv;
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

            changeDecal :function (data){//data里面包括开关和id

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){

                    if( ! decalMeshs.get(data.decalID) ){//印花不存在
                        console.warn( 'Web3DBins.prototype.changeDecal:decal '+ data.decalID + ' is not exit' );
                        return;
                    }

                    changeDecalData = data;

                    //0:off 1:on 2:reverse
                    if( data.power == 1 || ( data.power == 2 && interruptionState === null ) ){//开启印花修改

                        Web3DBins.prototype.setInterruptionState( "changeDecal" );
                        Web3DBins.prototype.setControlsState(false);
                        Web3DBins.prototype.showDecalAreaMesh(1,decalMeshs.get(data.decalID).assemblySceneName);
                        renderer.domElement.addEventListener('mousedown',Web3DBins.prototype.decalsMoveBegin);
                        renderer.domElement.addEventListener('mouseup',Web3DBins.prototype.decalsMoveEnd);
                        renderer.domElement.addEventListener('mouseleave',Web3DBins.prototype.decalsMoveEnd);//移出显示区域div时视为鼠标操作结束
                        renderer.domElement.addEventListener('wheel',Web3DBins.prototype.decalswheel);
                    }
                    else if( data.power == 0 || ( data.power == 2 && interruptionState === "changeDecal")){//关闭印花修改
                        renderer.domElement.removeEventListener('mousedown',Web3DBins.prototype.decalsMoveBegin);
                        renderer.domElement.removeEventListener('mouseup',Web3DBins.prototype.decalsMoveEnd);
                        renderer.domElement.removeEventListener('mouseleave',Web3DBins.prototype.decalsMoveEnd);
                        renderer.domElement.removeEventListener('wheel',Web3DBins.prototype.decalswheel);
                        Web3DBins.prototype.showDecalAreaMesh(0);
                        Web3DBins.prototype.setControlsState(true);
                        Web3DBins.prototype.setInterruptionState( null );
                    }
                    else{}//其它无效值
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }


                function mousePosition(event){
                    // if (event.pageX || event.pageY) {
                    //     return {
                    //         x:event.pageX,
                    //         y:event.pageY
                    //     };
                    // }
                    // else{
                    return{
                        x:event.offsetX,
                        y:event.offsetY
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

            frameChoose:function(data,callback){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    var distancetmp=0,scaletmp=1,angletmp=0;
                    if(data.distance!=undefined&&data.distance!=null){
                        distancetmp=(parseFloat(data.distance)-controls.totalDistance)/20;
                    }
                    if(data.scale!=undefined&&data.scale!=null){
                        scaletmp= Math.pow(parseFloat(data.scale)/controls.totalScale, 1/20);
                    }
                    if(data.angle!=undefined&&data.angle!=null){
                        var j=controls.getAzimuthalAngle()-Math.PI+parseFloat(data.angle);
                        //angletmp=(controls.getAzimuthalAngle()-Math.PI+data.angle)/20;
                        angletmp=j>Math.PI?(j-2*Math.PI)/20:(j/20);
                    }
                    var i=0;
                    rendert();
                    function rendert(){
                        if(i==20){
                            if(callback!=undefined)callback();
                            return;
                        }
                        i++;
                        setTimeout(rendert,30);
                        controls.panUpByDistance(distancetmp);
                        controls.zoomAndUpdate(scaletmp);
                        controls.rotateLeftByAngle(angletmp);
                        for(var n in lightControlsGroup){
                            lightControlsGroup[n].rotateLeftByAngle(angletmp);
                        }
                    }
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
            },

            frameStatue:function(){
                return {"distance":controls.totalDistance,"scale":controls.totalScale,"angle":(Math.PI-controls.getAzimuthalAngle())};
            },

            clone:function(divName,callback){
                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){
                    var tmp=Web3DBin(divName);
                    var copy=new Object();
                    copy.meshMap=meshMap;
                    copy.camera=camera;
                    copy.renderer=renderer;
                    copy.receiveShadows=receiveShadows;
                    copy.geometryGroup =geometryGroup;
                    copy.receiveShadows =  receiveShadows;
                    copy.blendMap =  blendMap;
                    copy.scene =  scene;
                    copy.lightControlsGroup =  lightControlsGroup;
                    copy.lightGroup =  lightGroup;
                    copy.controls =  controls;
                    copy.name=divName;
                    copy.meshDecalAreaMap=meshDecalAreaMap;
                    copy.filePrefix = filePrefix;
                    copy.fileSuffix = fileSuffix;
                    var copyW=tmp.setParamter(copy);
                    tmp=null;
                    copy=null;
                    return copyW;
                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }
            },

            setParamter:function(copy){

                var cloneObj = function (obj) {
                    var newObj = {};
                    if (obj instanceof Array) {
                        newObj = [];
                    }
                    for (var key in obj) {
                        var val = obj[key];
                        //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。
                        newObj[key] = typeof val === 'object' ? cloneObj(val): val;
                    }
                    return newObj;
                };

                interruptionState = null;
                filePrefix = copy.filePrefix;
                fileSuffix = copy.fileSuffix;
                copy.receiveShadows.forEach(function(value,key,map){
                    var tmpMesh=value.clone();
                    geometryGroup.set(key,tmpMesh);
                });
                copy.geometryGroup.forEach(function(value,key,map){
                    var tmpGeo=value.clone();
                    geometryGroup.set(key,tmpGeo);
                });
                copy.meshDecalAreaMap.forEach(function(value,key,map){
                    var obj=cloneObj(value);
                    meshDecalAreaMap.set(key,obj);
                });
                copy.blendMap.forEach(function(value,key,map){
                    var tmpMesh=value.clone();
                    scene.add(tmpMesh);
                    blendMap.set(key,tmpMesh);
                });
                for(var n in copy.meshMap)
                {
                    var tmpMesh=copy.meshMap[n].clone();
                    scene.add(tmpMesh);
                    meshMap[n]=tmpMesh;
                }
                for(var n in copy.lightControlsGroup){
                    copy.lightControlsGroup[n].saveState1();
                }
                copy.controls.saveState1();
                for(var n in copy.lightControlsGroup){
                    copy.lightControlsGroup[n].reset();
                }
                copy.controls.reset();
                for(var n in copy.lightGroup){
                    var lightNow;
                    switch(copy.lightGroup[n].type)
                    {
                        case "AmbientLight":
                            lightNow = new THREE.AmbientLight( copy.lightGroup[n].color);
                            break;
                        case "DirectionalLight":
                            lightNow = new THREE.DirectionalLight( copy.lightGroup[n].color );
                            break;
                        case "HemisphereLight":
                            lightNow = new THREE.HemisphereLight( copy.lightGroup[n].color );
                            break;
                        case "PointLight":
                            lightNow = new THREE.PointLight( copy.lightGroup[n].color );
                            break;
                        case "SpotLight":
                            lightNow = new THREE.SpotLight( copy.lightGroup[n].color );
                            break;
                        default:
                            break;
                    }
                    lightNow.position.copy(copy.lightGroup[n].position);
                    lightNow.intensity=copy.lightGroup[n].intensity;
                    lightNow.targetqs=new THREE.Vector3();
                    lightNow.targetqs.copy(copy.lightGroup[n].targetqs);
                    lightNow.name=copy.lightGroup[n].name;
                    lightGroup.push(lightNow);
                    var control2=new THREE.OrbitControls(lightNow,renderer.domElement);
                    control2.updateControlType();
                    control2.enableZoom = false;
                    control2.maxPolarAngle = copy.controls.maxPolarAngle;
                    control2.name=lightNow.name;
                    scene.add(lightNow);
                    control2.saveState();
                    lightControlsGroup.push(control2);
                }
                camera =  copy.camera.clone();
                controls = new THREE.OrbitControls( camera, renderer.domElement);
                controls.updateControlType();
                controls.maxPolarAngle = copy.controls.maxPolarAngle;
                controls.minDistance = copy.controls.minDistance;
                controls.maxDistance = copy.controls.maxDistance;
                controls.saveState();
                for(var n in copy.lightControlsGroup){
                    copy.lightControlsGroup[n].reset1();
                }
                copy.controls.reset1();
                if(canEle == undefined){
                    containerElement = document.body;
                    renderer.setSize( window.innerWidth, window.innerHeight );
                }
                else{
                    containerElement = document.getElementById(canEle);
                    renderer.setSize( containerElement.clientWidth, containerElement.clientHeight );
                }
                containerElement.appendChild( renderer.domElement );
                camera.aspect=renderer.domElement.width/renderer.domElement.height;
                camera.updateProjectionMatrix();
                if(copy.camera.isSetFocalLength!=undefined){
                    var f=copy.camera.getFocalLength();
                    var sc=copy.renderer.domElement.width/copy.renderer.domElement.height;
                    if(sc>1) f=sc*f;
                    else f=f/sc;
                    var s=renderer.domElement.width/renderer.domElement.height;
                    if(s>1)camera.setFocalLength(f/s);
                    else camera.setFocalLength(s*f);
                }
                renderer.render(scene,camera);
                controls.addEventListener( 'change',Web3DBins.prototype.renderanimate);
                window.addEventListener('resize', Web3DBins.prototype.onWindowResize, false);
                copy=null;
                cloneObj=null;
                return this;
            },

            checkIntersection2 :function(){

                var decalMesh = decalMeshs.get(changeDecalData.decalID);//印花

                if( ! Web3DBins.prototype.isEffectiveDecalInArea( decalMesh.UVPosition, meshMap[decalMesh.assemblySceneName].name ) ){
                    //不在印花区域内
                    return;
                }
                //Web3DBins.prototype.cacheClear(decalMesh.mesh);
                scene.remove( decalMesh.mesh );
                decalMesh.mesh.geometry.dispose();

                var p = decalMesh.worldPosition;
                mouseHelper.position.copy( p );
                intersection.point.copy( p );

                var vv =decalMesh.UVPosition;
                // if( decalMesh.UVPositionMove !== undefined ){//存在UV偏移量
                //     vv.x = vv.x + decalMesh.UVPositionMove.x;
                //     vv.y = vv.y + decalMesh.UVPositionMove.y;
                // }

                var n = decalMesh.normal.clone();
                n.multiplyScalar( 10 );
                n.add( p );

                intersection.normal.copy( n );
                mouseHelper.lookAt( n );


                intersection.intersects = true;

                Web3DBins.prototype.shoot({
                    "decalID":changeDecalData.decalID,
                    "assemblySceneName":decalMesh.assemblySceneName,
                    "decalScale":decalMesh.decalScale,
                    "nz":n.z
                });

            },

            decalswheel :function(event){

                if( decalMeshs.get(changeDecalData.decalID).scaleEnable ==true ){
                    decalMeshs.get(changeDecalData.decalID).decalScale += event.wheelDelta / 1200.0;
                    // console.log("event.wheelDelta"+event.wheelDelta);
                    if(decalMeshs.get(changeDecalData.decalID).decalScale < 0.1){
                        decalMeshs.get(changeDecalData.decalID).decalScale = 0.1;
                    }
                    else if(decalMeshs.get(changeDecalData.decalID).decalScale > 3){
                        decalMeshs.get(changeDecalData.decalID).decalScale = 3;
                    }
                    Web3DBins.prototype.checkIntersection2();
                }
                else{
                    console.warn("this decal's scaleEnable is false");
                }
            },

            decalsmove :function(event){

                var decalMesh = decalMeshs.get(changeDecalData.decalID);
                switch(event.which){
                    case 1:
                        //左键
                        if( decalMesh.translateEnable == true ){
                            eventPosition.x = event.offsetX;
                            eventPosition.y = event.offsetY;
                            mouse.x = ( (eventPosition.x-relativeUV.x)/ renderer.domElement.width) * 2 - 1;
                            mouse.y = - ( (eventPosition.y-relativeUV.y)/ renderer.domElement.height ) * 2 + 1;
                            //decalMeshs.get(changeDecalData.decalID).mouse = mouse.clone();

                            var worldp = Web3DBins.prototype.elementPToWorldP(mouse.x,mouse.y,decalMesh.assemblySceneName);
                            if( worldp != null ){
                                if( ! Web3DBins.prototype.isEffectiveDecalInArea( worldp.uv, meshMap[decalMesh.assemblySceneName].name,event ) ){
                                    //不在印花区域内
                                    return;
                                }
                                decalMeshs.get(changeDecalData.decalID).worldPosition = worldp.point;
                                decalMeshs.get(changeDecalData.decalID).UVPosition = worldp.uv;
                                decalMeshs.get(changeDecalData.decalID).normal = worldp.normal;
                                Web3DBins.prototype.checkIntersection2();
                            }
                        }
                        else{
                            console.warn("this decal's translateEnable is false");
                        }
                        break;
                    case 2:
                        //中键
                        break;
                    case 3:
                        //右键
                        if( decalMesh.rotateEnable == true ){
                            mouseRotation(event);
                            // eventPosition.x = event.offsetX;
                            // eventPosition.y = event.offsetY;
                            rotatePosition.x = event.offsetX;
                            rotatePosition.y = event.offsetY;


                            Web3DBins.prototype.checkIntersection2();
                        }
                        else{
                            console.warn("this decal's rotateEnable is false");
                        }
                        break;
                    default:
                        //其它，如键盘事件等
                        break;
                }

                function mouseRotation(event){
                    mousePosLast = mousePosition(event);
                    // mousePosLast.x = mousePosLast.x - eventPosition.x;
                    // mousePosLast.y = mousePosLast.y - eventPosition.y;
                    // var originAngle=Math.atan2(mousePosOrigin.x,mousePosOrigin.y);
                    // var lastAngle=Math.atan2(mousePosLast.x,mousePosLast.y);
                    // decalMeshs.get(changeDecalData.decalID).UVRotation = (rotateOrigin + ( lastAngle - originAngle ));

                    rotateOrigin = decalMeshs.get(changeDecalData.decalID).UVRotation;

                    mousePosLast.x = mousePosLast.x - rotatePosition.x;
                    decalMeshs.get(changeDecalData.decalID).UVRotation = (rotateOrigin + ( Math.PI * mousePosLast.x / SCREEN_WIDTH ));
                };

                function mousePosition(event){
                    // if (event.pageX || event.pageY) {
                    //     return {
                    //         x:event.pageX,
                    //         y:event.pageY
                    //     };
                    // }
                    // else{
                    return{
                        x:event.offsetX,
                        y:event.offsetY
                    };
                    // }
                };
            },

            decalsMoveBegin :function(event){
                event.preventDefault();
                var decalMesh = decalMeshs.get(changeDecalData.decalID);
                if (event.button==THREE.MOUSE.LEFT){
                    var vector=decalMeshs.get(changeDecalData.decalID).worldPosition.clone();
                    vector.project(camera);
                    //vector.x = ( vector.x + 1) * renderer.domElement.width / 2;
                    //vector.y = - ( vector.y - 1) * renderer.domElement.height / 2;
                    vector.x = Math.round((0.5 + vector.x / 2) *renderer.domElement.width );
                    vector.y = Math.round((0.5 - vector.y / 2) * renderer.domElement.height);
                    relativeUV.x=event.offsetX-vector.x;
                    relativeUV.y=event.offsetY-vector.y;
                    mousePosOrigin = mousePosition(event);
                    mousePosOrigin.x=mousePosOrigin.x-eventPosition.x;
                    mousePosOrigin.y=mousePosOrigin.y-eventPosition.y;
                    rotateOrigin = decalMeshs.get(changeDecalData.decalID).UVRotation;
                }
                else if( event.button == THREE.MOUSE.RIGHT ){
                    rotatePosition = mousePosition(event);
                }
                renderer.domElement.addEventListener('mousemove',Web3DBins.prototype.decalsmove);

                function mousePosition(event){
                    return{
                        x:event.offsetX,
                        y:event.offsetY
                    };
                };
            },

            decalsMoveEnd :function(event){
                event.preventDefault();
                renderer.domElement.removeEventListener('mousemove',Web3DBins.prototype.decalsmove);
            },

            setControlsState :function( state ){
                controls.enabled = state;
                for( var i in lightControlsGroup ){
                    lightControlsGroup[i].enabled = state;
                }
            },

            deleteDecal :function (id){//id

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){

                    if( ! decalMeshs.get(id) ){//印花不存在
                        return false;
                    }
                    else{
                        scene.remove(decalMeshs.get(id).mesh);
                        scene.remove(scene.getObjectByName(id));
                        Web3DBins.prototype.cacheClear(decalMeshs.get(id).mesh);
                        //composer.render();
                        renderer.render( scene, camera );
                        decalMeshs.delete(id);
                        return true;
                    }

                }
                else{
                    console.warn( 'interruption ' + interruptionState + ' is enable.' );
                }

            },

            getDecal :function (assemblySceneName,callback){//部件场景名
                var selectDecal = new Array();
                if( meshMap[assemblySceneName] !=undefined && decalMeshs.size !=0 ){
                    decalMeshs.forEach(function(data,index,arr){
                        if( data.assemblySceneName == assemblySceneName ){
                            selectDecal.push(data);
                        }
                    });
                    if( selectDecal.length >0 ){
                        decalstest(selectDecal,callback);
                    }
                }
                else{
                    return null;
                }

                function decalstest(data,callback){
                    //带UV图
                    var canvas = document.createElement('canvas');
                    canvas.style.position = "absolute";
                    var img =  new Image();//UV图
                    img.src=filePrefix + data[0].versionImgSRC + fileSuffix;
                    img.onload=function(){
                        var decalsMessage = new Object();
                        decalsMessage.param = new Array();
                        canvas.width=img.width;
                        canvas.height=img.height;

                        var context = canvas.getContext("2d");
                        //context.globalCompositeOperation="destination-over";
                        context.drawImage(img, 0, 0);

                        var canvas2 = document.createElement('canvas');
                        canvas2.style.position = "absolute";
                        canvas2.width=img.width;
                        canvas2.height=img.height;
                        var context2 = canvas2.getContext("2d");

                        for( var i in data ){
                            decalsMessage.param[i] = {
                                "id":data[i].mesh.name,
                                "assemblySceneName":data[i].assemblySceneName,
                                "UVposition":data[i].UVPosition,
                                "UVRotation":data[i].UVRotation,
                                "worldPosition":data[i].worldPosition,
                                "normal":data[i].normal,
                                "decalScale":data[i].decalScale,
                                "rotateEnable":data[i].rotateEnable,
                                "scaleEnable":data[i].scaleEnable,
                                "translateEnable":data[i].translateEnable
                            };
                            if( data[i].htmlData ){
                                decalsMessage.param[i].htmlData = data[i].htmlData;
                            }
                            else{
                                decalsMessage.param[i].decalImageSRC = data[i].decalImage.src;
                            }

                            var img2=data[i].decalImage;//贴花图
                            //context.globalCompositeOperation="source-over";
                            var decalWidth = data[i].UVPosition.x*img.width;
                            var decalHeight = (1-data[i].UVPosition.y)*img.height;//UV与canvas坐标系不同
                            //var scale = data.decalScale*S/(49*25.4);
                            var scale = data[i].decalTextureScale;
                            context.translate( decalWidth, decalHeight);
                            context.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                            //context.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                            context.translate( -decalWidth, -decalHeight);
                            context.drawImage(img2, decalWidth-img.width*scale*0.5, decalHeight-img.height*scale*0.5,img.width*scale,img.height*scale);
                            context.translate( decalWidth, decalHeight);
                            context.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                            //context.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                            context.translate( -decalWidth, -decalHeight);

                            //无uv图
                            //context2.globalCompositeOperation="source-over";
                            context2.translate( decalWidth, decalHeight);
                            context2.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                            //context2.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                            context2.translate( -decalWidth, -decalHeight);
                            context2.drawImage(img2, decalWidth-img.width*scale*0.5, decalHeight-img.height*scale*0.5,img.width*scale,img.height*scale);
                            context2.translate( decalWidth, decalHeight);
                            context2.rotate(data[i].UVRotation - data[i].UVRotationDeviation);
                            //context2.rotate(data[i].UVRotationDeviation - data[i].UVRotation);
                            context2.translate( -decalWidth, -decalHeight);

                        }

                        var cutDecalArea = meshDecalAreaMap.get( meshMap[data[0].assemblySceneName].name ).decalArea;
                        if( cutDecalArea != undefined){//有贴花区域
                            //var reImg = context2.getImageData(cutDecalArea.minX*canvas.width,(1-cutDecalArea.maxY)*canvas.width,(cutDecalArea.maxX-cutDecalArea.minX)*canvas.width,(cutDecalArea.maxY-cutDecalArea.minY)*canvas.width);
                            //context.clearRect( 0, 0, canvas.width, canvas.height );
                            //context.drawImage(this, 0, 0);
                            //context.putImageData( reImg, cutDecalArea.minX*canvas.width, (1-cutDecalArea.maxY)*canvas.width);

                            var reImg2 = context2.getImageData(cutDecalArea.minX*canvas.width,(1-cutDecalArea.maxY)*canvas.width,(cutDecalArea.maxX-cutDecalArea.minX)*canvas.width,(cutDecalArea.maxY-cutDecalArea.minY)*canvas.width);
                            context2.clearRect( 0, 0, canvas2.width, canvas2.height );
                            context2.putImageData( reImg2, cutDecalArea.minX*canvas.width, (1-cutDecalArea.maxY)*canvas.width);
                        }

                        //var strDataURI = canvas.toDataURL();
                        //var strDataURI2 = canvas2.toDataURL();
                        //decalsMessage.UVData = canvas.toDataURL();
                        decalsMessage.UVData = decalsMessage.decalData = canvas2.toDataURL();
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

            getDecalMSG :function ( decalID ){//获取某个印花信息

                var decalMeshDecalID;
                var decalMSG = new Object();

                if( ! decalMeshs.get(decalID) ){//印花不存在
                    return false;
                }
                else{
                    decalMeshDecalID = decalMeshs.get(decalID);
                    decalMSG.UVPosition = decalMeshDecalID.UVPosition;
                    decalMSG.UVRotation = decalMeshDecalID.UVRotation;
                    decalMSG.worldPosition=decalMeshDecalID.worldPosition;
                    decalMSG.normal=decalMeshDecalID.normal;
                    decalMSG.assemblySceneName = decalMeshDecalID.assemblySceneName;
                    decalMSG.decalScale = decalMeshDecalID.decalScale;
                    decalMSG.rotateEnable = decalMeshDecalID.rotateEnable;
                    decalMSG.scaleEnable = decalMeshDecalID.scaleEnable;
                    decalMSG.id = decalMeshDecalID.sceneName;
                    decalMSG.translateEnable = decalMeshDecalID.translateEnable;
                    if( decalMeshDecalID.htmlData ){//绣字
                        decalMSG.htmlData = decalMeshDecalID.htmlData;
                    }
                    else{//非绣字
                        decalMSG.decalImageSRC = decalMeshDecalID.decalImage.src;
                    }
                    return decalMSG;
                }

            },

            checkInterruptionState : function (functionName){//确认当前使能

                if( interruptionState === null ){//无中断
                    return true;
                }
                else{
                    if( interruptionState == functionName ){//关闭中断
                        if( functionName == "changeDecal" ){//修改印花是持续性操作
                            return true;
                        }
                        if( functionName == "magnifier" ){
                            return true;
                        }
                        Web3DBins.prototype.setInterruptionState(null);
                        return true;
                    }
                    else{//某中断处于启用状态
                        return false;
                    }
                }
            },

            setInterruptionState : function (state){

                interruptionState = state;
                if( state === null ){
                    controls.addEventListener( 'change',Web3DBins.prototype.renderanimate);
                }
                else{
                    controls.removeEventListener( 'change',Web3DBins.prototype.renderanimate);
                }

            },

            changeLights :function(lightMessage){
                var lightChangeGroup=lightMessage.lights;
                for(var i=0;i<lightChangeGroup.length;i++){
                    var tmpLight=lightChangeGroup[i];
                    if(tmpLight.lightType==null){
                        for(var n=0;n<lightGroup.length;n++){
                            if(lightGroup[n].name==tmpLight.lightCode){
                                deleteLight(n);
                                break;
                            }
                        }
                        continue;
                    }
                    else{
                        var judge=0;
                        for(var n=0;n<lightGroup.length;n++){
                            if(lightGroup[n].name==tmpLight.lightCode){
                                if(lightGroup[n].type==tmpLight.lightType){
                                    changeLight(tmpLight);
                                }else{
                                    deleteLight(n);
                                    addLight(tmpLight);
                                }
                                judge=1;
                                break;
                            }
                        }
                        if(judge==1)continue;
                        addLight(tmpLight);
                    }
                }
                Web3DBins.prototype.setCompareLightControl();
                //composer.render();
                renderer.render( scene, camera );

                function deleteLight(n){
                    lightControlsGroup[n].dispose();
                    lightControlsGroup.splice(n,1);
                    scene.remove(lightGroup[n]);
                    lightGroup.splice(n,1);
                };

                function addLight(tmpLight){
                    var lightNow;
                    switch(tmpLight.lightType)
                    {
                        case "AmbientLight":
                            lightNow = new THREE.AmbientLight( tmpLight.lightColor );
                            break;
                        case "DirectionalLight":
                            lightNow = new THREE.DirectionalLight( tmpLight.lightColor );
                            break;
                        case "HemisphereLight":
                            lightNow = new THREE.HemisphereLight( tmpLight.lightColor );
                            break;
                        case "PointLight":
                            lightNow = new THREE.PointLight( tmpLight.lightColor );
                            break;
                        case "SpotLight":
                            lightNow = new THREE.SpotLight( tmpLight.lightColor );
                            break;
                        default:
                            break;
                    }
                    var dataIntArr = Web3DBins.prototype.splitArr(tmpLight.lightPosition);
                    lightNow.name=tmpLight.lightCode;
                    lightNow.position.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                    lightNow.intensity = parseFloat(tmpLight.lightIntensity);
                    scene.add(lightNow);
                    lightGroup.push(lightNow);
                    var control2=new THREE.OrbitControls(lightNow,renderer.domElement);
                    control2.name=tmpLight.lightCode;
                    control2.updateControlType();
                    control2.enableZoom = false;
                    control2.maxPolarAngle = controls.minDistance;
                    control2.saveState();
                    control2.rotateLeftByAngle(Math.PI-controls.getAzimuthalAngle());
                    lightControlsGroup.push(control2);
                };

                function changeLight(tmpLight){
                    var dataIntArr = Web3DBins.prototype.splitArr(tmpLight.lightPosition);
                    lightControlsGroup[n].reset();
                    lightGroup[n].position.set(dataIntArr[0],dataIntArr[1],dataIntArr[2]);
                    lightGroup[n].intensity = parseFloat(tmpLight.lightIntensity);
                    lightGroup[n].color.set(tmpLight.lightColor);
                    lightControlsGroup[n].saveState();
                    lightControlsGroup[n].rotateLeftByAngle(Math.PI-controls.getAzimuthalAngle());
                };
            },

            elementPToWorldP :function( elementX, elementY, assemblySceneName ){
                var worldPoint = new Object();
                var elementMouse = new THREE.Vector2();
                elementMouse.x = elementX;
                elementMouse.y = elementY;
                var raycaster = new THREE.Raycaster();
                raycaster.setFromCamera( elementMouse, camera );
                var intersects = raycaster.intersectObjects( [ meshMap[assemblySceneName] ] );
                if( intersects.length > 0 ){

                    worldPoint.point = intersects[ 0 ].point.clone();
                    worldPoint.uv = intersects[ 0 ].uv.clone();
                    worldPoint.normal = intersects[ 0 ].face.normal.clone();

                    return worldPoint;
                }
                else{
                    return null;
                }
            },

            UVPToWorldP :function( UVX, UVY, assemblySceneName ){
                var meshGeometry = meshMap[assemblySceneName].geometry;
                var relativePos = meshMap[assemblySceneName].position;//模型所在区域在世界坐标中的相对坐标
                var facesUV = meshGeometry.faceVertexUvs[0];
                var faces = meshGeometry.faces;
                var vectors = meshGeometry.vertices;

                var facesUVI = null;

                var triangleArray =[];
                var p =new THREE.Vector2( UVX,UVY );

                var spacePoint;

                for( var i in facesUV ){//遍历“面-UV”
                    if( pointInTriangle( p,facesUV[i][0],facesUV[i][1],facesUV[i][2] ) ){//UV坐标在三角形内
                        facesUVI = i;

                        if( compareVector3(vectors[faces[i].a],vectors[faces[i].b]) || compareVector3(vectors[faces[i].a],vectors[faces[i].c]) || compareVector3(vectors[faces[i].b],vectors[faces[i].c]) ){//三角形内有点同世界坐标
                            continue;
                        }
                        if( compareVector2(facesUV[i][0],facesUV[i][1]) || compareVector2(facesUV[i][0],facesUV[i][2]) || compareVector2(facesUV[i][1],facesUV[i][2]) ){//三角形内有点同UV
                            continue;
                        }
                        if( (facesUV[i][0].x==facesUV[i][1].x && facesUV[i][0].x==facesUV[i][2].x) || (facesUV[i][0].y==facesUV[i][1].y && facesUV[i][0].y==facesUV[i][2].y) ){//三点UV同线
                            continue;
                        }

                        triangleArray.push({
                            "a":vectors[faces[i].a],
                            "b":vectors[faces[i].b],
                            "c":vectors[faces[i].c],
                            "auv":facesUV[i][0],
                            "buv":facesUV[i][1],
                            "cuv":facesUV[i][2]
                        });
                    }
                }
                if( facesUVI == null ){//模型几何体上没找到匹配该UV的点
                    console.error("there's no point in this model with the UV");
                    return null;
                }
                else{
                    if( triangleArray.length !=0  ){
                        spacePoint = UVToSpace( p,triangleArray[0].auv,triangleArray[0].buv,triangleArray[0].cuv,triangleArray[0].a,triangleArray[0].b,triangleArray[0].c );
                        //spacePoint.point.add( relativePos );
                        var x = meshMap[assemblySceneName].getWorldScale();
                        spacePoint.point.multiply(x);
                        spacePoint.point.add( relativePos );
                        var judgeBox = new THREE.Box3().setFromObject( meshMap[assemblySceneName] );
                        var center = judgeBox.getCenter();
                        var direction = new THREE.Vector3(center.x-spacePoint.point.x,center.y-spacePoint.point.y,center.z-spacePoint.point.z).normalize();
                        if(direction.dot(spacePoint.normal)>0){
                            spacePoint.normal.negate();
                        }
                        return spacePoint;
                    }
                    else{//模型UV重叠
                        console.error("there's no point in this model with the UV");
                        return null;
                    }
                }

                function pointInTriangle( p,a,b,c ){
                    var ac =new THREE.Vector2();
                    var ab =new THREE.Vector2();
                    var ap =new THREE.Vector2();

                    ac.subVectors(c,a);
                    ab.subVectors(b,a);
                    ap.subVectors(p,a);

                    var fi = ap.dot(ac)*ab.dot(ab) - ap.dot(ab)*ac.dot(ab);
                    var fj = ap.dot(ab)*ac.dot(ac) - ap.dot(ac)*ab.dot(ac);
                    var fd = ac.dot(ac)*ab.dot(ab) - ac.dot(ab)*ac.dot(ab);

                    if(fd < 0){
                        console.log("error:UVPToWorldP.pointInTriangle:fd<0");
                    }

                    if( fi >= 0 && fj >= 0 && fi + fj - fd <= 0 ){
                        return true;
                    }
                    else{
                        return false;
                    }
                };

                function compareVector3( v1, v2 ){
                    var sameNum = 0;
                    for( var i = 0; i <= 2; i++ ){
                        if( v1.getComponent(i) == v2.getComponent(i) ){
                            sameNum++;
                        }
                    }
                    if( sameNum == 3 ){
                        return true;
                    }
                    else{
                        return false;
                    }
                };

                function compareVector2( v1, v2 ){
                    var sameNum = 0;
                    for( var i = 0; i <= 1; i++ ){
                        if( v1.getComponent(i) == v2.getComponent(i) ){
                            sameNum++;
                        }
                    }
                    if( sameNum == 2 ){
                        return true;
                    }
                    else{
                        return false;
                    }
                };

                function UVToSpace( pUV,aUV,bUV,cUV,a,b,c ){
                    var ac2 = new THREE.Vector2();
                    var ab2 = new THREE.Vector2();
                    var ap2 = new THREE.Vector2();
                    var ac3 = new THREE.Vector3();
                    var ab3 = new THREE.Vector3();
                    var ap3 = new THREE.Vector3();
                    var spaceVector = a.clone();
                    var spacePoint = new Object();
                    spacePoint.normal = new THREE.Vector3();

                    ac2.subVectors(cUV,aUV);
                    ab2.subVectors(bUV,aUV);
                    ap2.subVectors(pUV,aUV);

                    ac3.subVectors(c,a);
                    ab3.subVectors(b,a);
                    ap3.subVectors(p,a);

                    var fi = ap2.dot(ac2)*ab2.dot(ab2) - ap2.dot(ab2)*ac2.dot(ab2);
                    var fj = ap2.dot(ab2)*ac2.dot(ac2) - ap2.dot(ac2)*ab2.dot(ac2);
                    var fd = ac2.dot(ac2)*ab2.dot(ab2) - ac2.dot(ab2)*ac2.dot(ab2);

                    spaceVector.addScaledVector( ac3, fi/fd );
                    spaceVector.addScaledVector( ab3, fj/fd );

                    spacePoint.point = spaceVector;
                    spacePoint.uv = pUV.clone();
                    spacePoint.normal.crossVectors( ac3,ab3 ).normalize();
                    spacePoint.normal.setZ( -spacePoint.normal.z );
                    spacePoint.normal.setY( -spacePoint.normal.y );
                    spacePoint.normal.setX( -spacePoint.normal.x );

                    return spacePoint;
                };
            },

            initMaterials: function ( materials, texturePath, crossOrigin,callback,id) {

                var array = [];
                for ( var i = 0; i < materials.length; ++ i ) {
                    Web3DBins.prototype.countPicture( materials[ i ],id);
                }
                for ( var i = 0; i < materials.length; ++ i ) {
                    array[ i ] = Web3DBins.prototype.createMaterial( materials[ i ], texturePath, crossOrigin,callback,id);
                }
                return array;
            },

            countPicture:function(materials,id){

                for( var name in materials) {

                    var value = materials[ name ];

                    switch ( name ) {
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
                            loadSurveillance[id].pictureNum+=1;
                            break;
                        default:
                            break;
                    }
                }
            },

            getUVMSG :function( assemblySceneName, callback ){

                function intersectionToUV(){

                    Web3DBins.prototype.setInterruptionState(null);
                    renderer.domElement.removeEventListener('click',intersectionToUV);
                    Web3DBins.prototype.setControlsState(true);
                    renderer.domElement.style.cursor = "default";

                    if( meshMap[assemblySceneName] == undefined ){//场景中没有该模型
                        console.warn( 'Web3DBins.prototype.getUVMSG:assemblySceneName is undefined' );
                    }
                    else{

                        mouse.x = ( event.offsetX / renderer.domElement.width ) * 2 - 1;
                        mouse.y = - ( event.offsetY / renderer.domElement.height ) * 2 + 1;
                        var raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera( mouse, camera );
                        var intersects = raycaster.intersectObjects( [ meshMap[assemblySceneName] ] );
                        if ( intersects.length > 0 ) {
                            callback(intersects[ 0 ].uv);
                        }else{
                            console.warn( 'Web3DBins.prototype.getUVMSG:position is error' );
                        }
                    }
                };

                if( Web3DBins.prototype.checkInterruptionState( arguments.callee.name ) ){

                    Web3DBins.prototype.setInterruptionState( arguments.callee.name );
                    renderer.domElement.style.cursor = "crosshair";
                    Web3DBins.prototype.setControlsState(false);
                    renderer.domElement.addEventListener('click', intersectionToUV );

                }
            },

            modelParseqs: function ( data, callback, texturePath, jsonMaterials,jsonmodelHash,jsonassemblyCode) {
                var Model = function () {

                    var scope = this,
                        currentOffset = 0,
                        md,
                        normals = [],
                        uvs = [],
                        start_tri_flat, start_tri_smooth, start_tri_flat_uv, start_tri_smooth_uv,
                        start_quad_flat, start_quad_smooth, start_quad_flat_uv, start_quad_smooth_uv,
                        tri_size, quad_size,
                        quad_uv_size,quad_normal_size,quad_vertex_size,quad_smooth_size,
                        end_tri_flat,end_tri_smooth,end_tri_flat_uv,end_tri_smooth_uv,
                        len_tri_flat, len_tri_smooth, len_tri_flat_uv, len_tri_smooth_uv,
                        len_quad_flat, len_quad_smooth, len_quad_flat_uv;


                    THREE.Geometry.call( this );

                    //console.log(parseUInt32( data, currentOffset + 20 + 4 * 10 ));
                    md = parseMetaData( data, currentOffset );
                    //console.log(md);

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

                    len_tri_flat = (md.ntri_flat-end_tri_smooth_uv) * ( tri_size );
                    len_tri_smooth = (md.ntri_smooth-end_tri_flat_uv) * ( tri_size + md.normal_index_bytes * 3 );
                    len_tri_flat_uv = (md.ntri_flat_uv-end_tri_smooth) * ( tri_size + md.uv_index_bytes * 3 );
                    len_tri_smooth_uv = (md.ntri_smooth_uv-end_tri_flat) * ( tri_size + md.normal_index_bytes * 3 + md.uv_index_bytes * 3 );

                    len_quad_flat = (md.nquad_flat-quad_smooth_size) * ( quad_size );
                    len_quad_smooth = (md.nquad_smooth-quad_vertex_size) * ( quad_size + md.normal_index_bytes * 4 );
                    len_quad_flat_uv = (md.nquad_flat_uv-quad_normal_size) * ( quad_size + md.uv_index_bytes * 4 );

                    // read buffers
                    currentOffset += init_normals( currentOffset );
                    currentOffset += handlePadding( md.nnormals * 3 );

                    currentOffset += init_uvs( currentOffset );

                    currentOffset += init_vertices( currentOffset );






                    start_tri_flat = currentOffset;
                    start_tri_smooth = start_tri_flat + len_tri_flat + handlePadding( (md.ntri_flat-end_tri_smooth_uv) * 2 );
                    start_tri_flat_uv = start_tri_smooth + len_tri_smooth + handlePadding( (md.ntri_smooth-end_tri_flat_uv) * 2 );
                    start_tri_smooth_uv = start_tri_flat_uv + len_tri_flat_uv + handlePadding( (md.ntri_flat_uv-end_tri_smooth) * 2 );

                    start_quad_flat = start_tri_smooth_uv + len_tri_smooth_uv + handlePadding( (md.ntri_smooth_uv-end_tri_flat) * 2 );
                    start_quad_smooth = start_quad_flat + len_quad_flat	+ handlePadding( (md.nquad_flat-quad_smooth_size) * 2 );
                    start_quad_flat_uv = start_quad_smooth + len_quad_smooth + handlePadding( (md.nquad_smooth-quad_vertex_size) * 2 );
                    start_quad_smooth_uv = start_quad_flat_uv + len_quad_flat_uv + handlePadding( (md.nquad_flat_uv-quad_normal_size) * 2 );

                    // have to first process faces with uvs
                    // so that face and uv indices match

                    init_triangles_flat_uv( start_tri_flat_uv );
                    init_triangles_smooth_uv( start_tri_smooth_uv );

                    init_quads_flat_uv( start_quad_flat_uv );
                    init_quads_smooth_uv( start_quad_smooth_uv );

                    // now we can process untextured faces

                    init_triangles_flat( start_tri_flat );
                    init_triangles_smooth( start_tri_smooth );

                    init_quads_flat( start_quad_flat );
                    init_quads_smooth( start_quad_smooth );

                    this.computeFaceNormals();

                    function handlePadding( n ) {

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
                        for ( i = 0; i <= 6; i += 2) {
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
                        for ( i = 7; i >= 0; i--) {
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

                    function init_hash(){
                        if(jsonmodelHash==undefined||jsonmodelHash==null)return;

                        //var uvx=SHA1("uvb_flat"+new Date().toLocaleDateString()+jsonassemblyCode);
                        var m1=parseInt(jsonmodelHash.substring(jsonmodelHash.length-2,jsonmodelHash.length));
                        var m2=new Date().getMinutes();
                        var h=new Date().getHours();
                        if(m2<m1-5)h-=1;
                        var year = new Date().getFullYear();
                        var mouth = new Date().getMonth()+1;
                        var day = new Date().getDate();
                        if(day<10)day= "0" + day;
                        var msg="uvb_flat"+year+"/"+mouth+"/"+day+"/"+h.toString()+jsonassemblyCode;
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
                        for ( i = 0; i < msg_len - 3; i += 4) {
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
                        for ( blockstart = 0; blockstart < word_array.length; blockstart += 16) {
                            for ( i = 0; i < 16; i++)
                                W[i] = word_array[blockstart + i];
                            for ( i = 16; i <= 79; i++)
                                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

                            A = H0;
                            B = H1;
                            C = H2;
                            D = H3;
                            E = H4;

                            for ( i = 0; i <= 19; i++) {
                                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                                E = D;
                                D = C;
                                C = rotate_left(B, 30);
                                B = A;
                                A = temp;
                            }

                            for ( i = 20; i <= 39; i++) {
                                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x7ED9EBA2) & 0x0ffeeefff;
                                E = D;
                                D = C;
                                C = rotate_left(B, 30);
                                B = A;
                                A = temp;
                            }

                            for ( i = 40; i <= 59; i++) {
                                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8D1BBCDC) & 0x0fff873ff;
                                E = D;
                                D = C;
                                C = rotate_left(B, 30);
                                B = A;
                                A = temp;
                            }

                            for ( i = 60; i <= 79; i++) {
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
                        uvx=uvx.slice(0,9);
                        tmp=jsonmodelHash.slice(0,parseInt(jsonmodelHash[11],16));
                        uvx=((parseInt(uvx,16)-parseInt(tmp,16)).toString(16)).toString(16);
                        // console.log(jsonassemblyCode);
                        var zz = 9-uvx.length;
                        for(var n=0;n<zz;n++){
                            uvx="0"+uvx;
                        }
                        // console.log(uvx);
                        quad_uv_size=parseInt(uvx[0],16);
                        quad_normal_size=parseInt(uvx[1],16);
                        quad_vertex_size=parseInt(uvx[2],16);
                        quad_smooth_size=parseInt(uvx[3],16);
                        end_tri_flat=parseInt(uvx[4],16);
                        end_tri_smooth=parseInt(uvx[5],16);
                        end_tri_flat_uv=parseInt(uvx[6],16);
                        end_tri_smooth_uv=parseInt(uvx[7],16);
                        /*quad_uv_size=parseInt(uvx[0],16)-parseInt(jsonmodelHash[0],16);
			quad_normal_size=parseInt(uvx[4],16)-parseInt(jsonmodelHash[4],16);
			quad_vertex_size=parseInt(uvx[8],16)-parseInt(jsonmodelHash[8],16);
			quad_smooth_size=parseInt(uvx[16],16)-parseInt(jsonmodelHash[16],16);
			end_tri_flat= parseInt(uvx[20],16)-parseInt(jsonmodelHash[20],16);
			end_tri_smooth= parseInt(uvx[24],16)-parseInt(jsonmodelHash[24],16);
			end_tri_flat_uv= parseInt(uvx[28],16)-parseInt(jsonmodelHash[28],16);
			end_tri_smooth_uv=parseInt(uvx[32],16)-parseInt(jsonmodelHash[32],16)*/;
                    }


                    function parseMetaData( data, offset ) {

                        init_hash();
                        //console.log(quad_uv_size);
                        var metaData = {

                            'signature': parseString( data, offset, 12 ),
                            'header_bytes': parseUChar8( data, offset + 12 ),

                            'vertex_coordinate_bytes': parseUChar8( data, offset + 13 ),
                            'normal_coordinate_bytes': parseUChar8( data, offset + 14 ),
                            'uv_coordinate_bytes': parseUChar8( data, offset + 15 ),

                            'vertex_index_bytes': parseUChar8( data, offset + 16 ),
                            'normal_index_bytes': parseUChar8( data, offset + 17 ),
                            'uv_index_bytes': parseUChar8( data, offset + 18 ),
                            'material_index_bytes': parseUChar8( data, offset + 19 ),

                            'nvertices': parseUInt32( data, offset + 20 ),
                            'nnormals': parseUInt32( data, offset + 20 + 4 * 1 ),
                            'nuvs': parseUInt32( data, offset + 20 + 4 * 2 ),

                            /*'ntri_flat': parseUInt32( data, offset + 20 + 4 * 3 ),
				'ntri_smooth': parseUInt32( data, offset + 20 + 4 * 4 ),
				'ntri_flat_uv': parseUInt32( data, offset + 20 + 4 * 5 ),
				'ntri_smooth_uv': parseUInt32( data, offset + 20 + 4 * 6 ),

				'nquad_flat': parseUInt32( data, offset + 20 + 4 * 7 ),
				'nquad_smooth': parseUInt32( data, offset + 20 + 4 * 8 ),
				'nquad_flat_uv': parseUInt32( data, offset + 20 + 4 * 9 ),
				'nquad_smooth_uv': parseUInt32( data, offset + 20 + 4 * 10 )*/
                            'nquad_smooth_uv': parseUInt32( data, offset + 20 + 4 * 3 ),
                            'nquad_flat_uv': parseUInt32( data, offset + 20 + 4 * 4 ),
                            'nquad_smooth': parseUInt32( data, offset + 20 + 4 * 5 ),
                            'nquad_flat': parseUInt32( data, offset + 20 + 4 * 6 ),

                            'ntri_smooth_uv': parseUInt32( data, offset + 20 + 4 * 7 ),
                            'ntri_flat_uv': parseUInt32( data, offset + 20 + 4 * 8 ),
                            'ntri_smooth': parseUInt32( data, offset + 20 + 4 * 9 ),
                            'ntri_flat': parseUInt32( data, offset + 20 + 4 * 10 )
                        };
                        return metaData;

                    }

                    function parseString( data, offset, length ) {

                        return THREE.LoaderUtils.decodeText( new Uint8Array( data, offset, length ) );

                    }

                    function parseUChar8( data, offset ) {

                        var charArray = new Uint8Array( data, offset, 1 );

                        return charArray[ 0 ];

                    }

                    function parseUInt32( data, offset ) {

                        var intArray = new Uint32Array( data, offset, 1 );

                        return intArray[ 0 ];

                    }

                    function init_vertices( start ) {

                        var nElements = md.nvertices;

                        var coordArray = new Float32Array( data, start, nElements * 3 );

                        var i, x, y, z;

                        for ( i = 0; i < nElements; i ++ ) {

                            x = coordArray[ i * 3 ];
                            y = coordArray[ i * 3 + 1 ];
                            z = coordArray[ i * 3 + 2 ];

                            scope.vertices.push( new THREE.Vector3( x, y, z ) );

                        }

                        return nElements * 3 * Float32Array.BYTES_PER_ELEMENT;

                    }

                    function init_normals( start ) {

                        var nElements = md.nnormals;

                        if ( nElements ) {

                            var normalArray = new Int8Array( data, start, nElements * 3 );

                            var i, x, y, z;

                            for ( i = 0; i < nElements; i ++ ) {

                                x = normalArray[ i * 3 ];
                                y = normalArray[ i * 3 + 1 ];
                                z = normalArray[ i * 3 + 2 ];

                                normals.push( x / 127, y / 127, z / 127 );

                            }

                        }

                        return nElements * 3 * Int8Array.BYTES_PER_ELEMENT;

                    }

                    function init_uvs( start ) {

                        var nElements = md.nuvs;

                        if ( nElements ) {

                            var uvArray = new Float32Array( data, start, nElements * 2 );

                            var i, u, v;

                            for ( i = 0; i < nElements; i ++ ) {

                                u = uvArray[ i * 2 ];
                                v = uvArray[ i * 2 + 1 ];

                                uvs.push( u, v );

                            }

                        }

                        return nElements * 2 * Float32Array.BYTES_PER_ELEMENT;

                    }

                    function init_uvs3( nElements, offset ) {

                        var i, uva, uvb, uvc, u1, u2, u3, v1, v2, v3;

                        var uvIndexBuffer = new Uint32Array( data, offset, 3 * nElements );

                        for ( i = 0; i < nElements; i ++ ) {

                            uva = uvIndexBuffer[ i * 3 ];
                            uvb = uvIndexBuffer[ i * 3 + 1 ];
                            uvc = uvIndexBuffer[ i * 3 + 2 ];

                            u1 = uvs[ uva * 2 ];
                            v1 = uvs[ uva * 2 + 1 ];

                            u2 = uvs[ uvb * 2 ];
                            v2 = uvs[ uvb * 2 + 1 ];

                            u3 = uvs[ uvc * 2 ];
                            v3 = uvs[ uvc * 2 + 1 ];

                            scope.faceVertexUvs[ 0 ].push( [
                                new THREE.Vector2( u1, v1 ),
                                new THREE.Vector2( u2, v2 ),
                                new THREE.Vector2( u3, v3 )
                            ] );

                        }

                    }

                    function init_uvs4( nElements, offset ) {

                        var i, uva, uvb, uvc, uvd, u1, u2, u3, u4, v1, v2, v3, v4;

                        var uvIndexBuffer = new Uint32Array( data, offset, 4 * nElements );

                        for ( i = 0; i < nElements; i ++ ) {

                            uva = uvIndexBuffer[ i * 4 ];
                            uvb = uvIndexBuffer[ i * 4 + 1 ];
                            uvc = uvIndexBuffer[ i * 4 + 2 ];
                            uvd = uvIndexBuffer[ i * 4 + 3 ];

                            u1 = uvs[ uva * 2 ];
                            v1 = uvs[ uva * 2 + 1 ];

                            u2 = uvs[ uvb * 2 ];
                            v2 = uvs[ uvb * 2 + 1 ];

                            u3 = uvs[ uvc * 2 ];
                            v3 = uvs[ uvc * 2 + 1 ];

                            u4 = uvs[ uvd * 2 ];
                            v4 = uvs[ uvd * 2 + 1 ];

                            scope.faceVertexUvs[ 0 ].push( [
                                new THREE.Vector2( u1, v1 ),
                                new THREE.Vector2( u2, v2 ),
                                new THREE.Vector2( u4, v4 )
                            ] );

                            scope.faceVertexUvs[ 0 ].push( [
                                new THREE.Vector2( u2, v2 ),
                                new THREE.Vector2( u3, v3 ),
                                new THREE.Vector2( u4, v4 )
                            ] );

                        }

                    }

                    function init_faces3_flat( nElements, offsetVertices, offsetMaterials ) {

                        var i, a, b, c, m;

                        var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 3 * nElements );
                        var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

                        for ( i = 0; i < nElements; i ++ ) {

                            a = vertexIndexBuffer[ i * 3 ];
                            b = vertexIndexBuffer[ i * 3 + 1 ];
                            c = vertexIndexBuffer[ i * 3 + 2 ];

                            m = materialIndexBuffer[ i ];

                            scope.faces.push( new THREE.Face3( a, b, c, null, null, m ) );

                        }

                    }

                    function init_faces4_flat( nElements, offsetVertices, offsetMaterials ) {

                        var i, a, b, c, d, m;

                        var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 4 * nElements );
                        var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

                        for ( i = 0; i < nElements; i ++ ) {

                            a = vertexIndexBuffer[ i * 4 ];
                            b = vertexIndexBuffer[ i * 4 + 1 ];
                            c = vertexIndexBuffer[ i * 4 + 2 ];
                            d = vertexIndexBuffer[ i * 4 + 3 ];

                            m = materialIndexBuffer[ i ];

                            scope.faces.push( new THREE.Face3( a, b, d, null, null, m ) );
                            scope.faces.push( new THREE.Face3( b, c, d, null, null, m ) );

                        }

                    }

                    function init_faces3_smooth( nElements, offsetVertices, offsetNormals, offsetMaterials ) {

                        var i, a, b, c, m;
                        var na, nb, nc;

                        var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 3 * nElements );
                        var normalIndexBuffer = new Uint32Array( data, offsetNormals, 3 * nElements );
                        var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

                        for ( i = 0; i < nElements; i ++ ) {

                            a = vertexIndexBuffer[ i * 3 ];
                            b = vertexIndexBuffer[ i * 3 + 1 ];
                            c = vertexIndexBuffer[ i * 3 + 2 ];

                            na = normalIndexBuffer[ i * 3 ];
                            nb = normalIndexBuffer[ i * 3 + 1 ];
                            nc = normalIndexBuffer[ i * 3 + 2 ];

                            m = materialIndexBuffer[ i ];

                            var nax = normals[ na * 3 ],
                                nay = normals[ na * 3 + 1 ],
                                naz = normals[ na * 3 + 2 ],

                                nbx = normals[ nb * 3 ],
                                nby = normals[ nb * 3 + 1 ],
                                nbz = normals[ nb * 3 + 2 ],

                                ncx = normals[ nc * 3 ],
                                ncy = normals[ nc * 3 + 1 ],
                                ncz = normals[ nc * 3 + 2 ];

                            scope.faces.push( new THREE.Face3( a, b, c, [
                                new THREE.Vector3( nax, nay, naz ),
                                new THREE.Vector3( nbx, nby, nbz ),
                                new THREE.Vector3( ncx, ncy, ncz )
                            ], null, m ) );

                        }

                    }

                    function init_faces4_smooth( nElements, offsetVertices, offsetNormals, offsetMaterials ) {

                        var i, a, b, c, d, m;
                        var na, nb, nc, nd;

                        var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 4 * nElements );
                        var normalIndexBuffer = new Uint32Array( data, offsetNormals, 4 * nElements );
                        var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

                        for ( i = 0; i < nElements; i ++ ) {

                            a = vertexIndexBuffer[ i * 4 ];
                            b = vertexIndexBuffer[ i * 4 + 1 ];
                            c = vertexIndexBuffer[ i * 4 + 2 ];
                            d = vertexIndexBuffer[ i * 4 + 3 ];

                            na = normalIndexBuffer[ i * 4 ];
                            nb = normalIndexBuffer[ i * 4 + 1 ];
                            nc = normalIndexBuffer[ i * 4 + 2 ];
                            nd = normalIndexBuffer[ i * 4 + 3 ];

                            m = materialIndexBuffer[ i ];

                            var nax = normals[ na * 3 ],
                                nay = normals[ na * 3 + 1 ],
                                naz = normals[ na * 3 + 2 ],

                                nbx = normals[ nb * 3 ],
                                nby = normals[ nb * 3 + 1 ],
                                nbz = normals[ nb * 3 + 2 ],

                                ncx = normals[ nc * 3 ],
                                ncy = normals[ nc * 3 + 1 ],
                                ncz = normals[ nc * 3 + 2 ],

                                ndx = normals[ nd * 3 ],
                                ndy = normals[ nd * 3 + 1 ],
                                ndz = normals[ nd * 3 + 2 ];

                            scope.faces.push( new THREE.Face3( a, b, d, [
                                new THREE.Vector3( nax, nay, naz ),
                                new THREE.Vector3( nbx, nby, nbz ),
                                new THREE.Vector3( ndx, ndy, ndz )
                            ], null, m ) );

                            scope.faces.push( new THREE.Face3( b, c, d, [
                                new THREE.Vector3( nbx, nby, nbz ),
                                new THREE.Vector3( ncx, ncy, ncz ),
                                new THREE.Vector3( ndx, ndy, ndz )
                            ], null, m ) );

                        }

                    }

                    function init_triangles_flat( start ) {

                        var nElements = md.ntri_flat-end_tri_smooth_uv;

                        if ( nElements ) {

                            var offsetMaterials = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            init_faces3_flat( nElements, start, offsetMaterials );

                        }

                    }

                    function init_triangles_flat_uv( start ) {

                        var nElements = md.ntri_flat_uv-end_tri_smooth;

                        if ( nElements ) {

                            var offsetUvs = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

                            init_faces3_flat( nElements, start, offsetMaterials );
                            init_uvs3( nElements, offsetUvs );

                        }

                    }

                    function init_triangles_smooth( start ) {

                        var nElements = md.ntri_smooth-end_tri_flat_uv;

                        if ( nElements ) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetMaterials = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

                            init_faces3_smooth( nElements, start, offsetNormals, offsetMaterials );

                        }

                    }

                    function init_triangles_smooth_uv( start ) {

                        var nElements = md.ntri_smooth_uv-end_tri_flat;

                        if ( nElements ) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetUvs = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

                            init_faces3_smooth( nElements, start, offsetNormals, offsetMaterials );
                            init_uvs3( nElements, offsetUvs );

                        }

                    }

                    function init_quads_flat( start ) {

                        var nElements = md.nquad_flat-quad_smooth_size;

                        if ( nElements ) {

                            var offsetMaterials = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            init_faces4_flat( nElements, start, offsetMaterials );

                        }

                    }

                    function init_quads_flat_uv( start ) {

                        var nElements = md.nquad_flat_uv-quad_normal_size;

                        if ( nElements ) {

                            var offsetUvs = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

                            init_faces4_flat( nElements, start, offsetMaterials );
                            init_uvs4( nElements, offsetUvs );

                        }

                    }

                    function init_quads_smooth( start ) {

                        var nElements = md.nquad_smooth-quad_vertex_size;

                        if ( nElements ) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetMaterials = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

                            init_faces4_smooth( nElements, start, offsetNormals, offsetMaterials );

                        }

                    }

                    function init_quads_smooth_uv( start ) {

                        var nElements = md.nquad_smooth_uv-quad_uv_size;

                        if ( nElements ) {

                            var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetUvs = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
                            var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

                            init_faces4_smooth( nElements, start, offsetNormals, offsetMaterials );
                            init_uvs4( nElements, offsetUvs );

                        }

                    }

                };

                Model.prototype = Object.create( THREE.Geometry.prototype );
                Model.prototype.constructor = Model;

                var geometry = new Model();
                var materials = THREE.Loader.prototype.initMaterials( jsonMaterials, texturePath, this.crossOrigin );

                callback( geometry, materials );

            },

            createMaterial: ( function () {

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

                return function createMaterial( m, texturePath, crossOrigin,callback,id) {
                    var Surveillance = loadSurveillance[id];
                    // convert from old material format
                    var cb=callback;
                    var textures = {};
                    function loadTexture( path, repeat, offset, wrap, anisotropy ) {
                        path = filePrefix + path + fileSuffix;
                        var fullPath = texturePath + path;
                        var loader = THREE.Loader.Handlers.get( fullPath );
                        var texture;
                        if(pictureCache[String(path+repeat+offset)]!==undefined){
                            texture=pictureCache[String(path+repeat+offset)];
                            Surveillance.pictureLoadNum+=1;
                            if(Surveillance.pictureLoadNum==Surveillance.pictureNum){
                                if(cb!=undefined)cb();
                            }
                        }
                        else{
                            if ( loader !== null ) {
                                texture = loader.load( fullPath, function(){
                                    Surveillance.pictureLoadNum+=1;
                                    if(Surveillance.pictureLoadNum==Surveillance.pictureNum){
                                        if(cb!=undefined)cb();
                                    }
                                },undefined,function(xhr){
                                    Surveillance.pictureLoadNum+=1;
                                    if(Surveillance.pictureLoadNum==Surveillance.pictureNum){
                                        if(cb!=undefined)cb();
                                    }
                                } );
                            } else {
                                textureLoader.setCrossOrigin( crossOrigin );
                                texture = textureLoader.load( fullPath, function(){
                                    Surveillance.pictureLoadNum+=1;
                                    if(Surveillance.pictureLoadNum==Surveillance.pictureNum){
                                        if(cb!=undefined)cb();
                                    }
                                },undefined,function(xhr){
                                    Surveillance.pictureLoadNum+=1;
                                    if(Surveillance.pictureLoadNum==Surveillance.pictureNum){
                                        if(cb!=undefined)cb();
                                    }
                                });
                            }
                            if ( repeat !== undefined ) {
                                texture.repeat.fromArray( repeat );
                                texture.wrapS = THREE.RepeatWrapping;
                                texture.wrapT = THREE.RepeatWrapping;
                            }
                            if ( offset !== undefined ) {
                                texture.offset.fromArray( offset );
                            }
                            if ( wrap !== undefined ) {
                                if ( wrap[ 0 ] === 'repeat' ) texture.wrapS = THREE.RepeatWrapping;
                                if ( wrap[ 0 ] === 'mirror' ) texture.wrapS = THREE.MirroredRepeatWrapping;

                                if ( wrap[ 1 ] === 'repeat' ) texture.wrapT = THREE.RepeatWrapping;
                                if ( wrap[ 1 ] === 'mirror' ) texture.wrapT = THREE.MirroredRepeatWrapping;
                            }
                            if ( anisotropy !== undefined ) {
                                texture.anisotropy = anisotropy;
                            }
                        }
                        var uuid = _Math.generateUUID();
                        textures[ uuid ] = texture;
                        pictureCache[String(path+repeat+offset)]=texture;
                        return uuid;
                    }

                    //

                    var _Math = {

                        DEG2RAD: Math.PI / 180,
                        RAD2DEG: 180 / Math.PI,

                        generateUUID: function () {
                            // http://www.broofa.com/Tools/Math.uuid.htm
                            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
                            var uuid = new Array( 36 );
                            var rnd = 0, r;
                            return function generateUUID() {
                                for ( var i = 0; i < 36; i ++ ) {
                                    if ( i === 8 || i === 13 || i === 18 || i === 23 ) {
                                        uuid[ i ] = '-';
                                    } else if ( i === 14 ) {
                                        uuid[ i ] = '4';
                                    } else {

                                        if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                                        r = rnd & 0xf;
                                        rnd = rnd >> 4;
                                        uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];
                                    }
                                }
                                return uuid.join( '' );
                            };
                        }()
                    };
                    //
                    var json = {
                        uuid: _Math.generateUUID(),
                        type: 'MeshLambertMaterial'
                    };
                    for ( var name in m ) {
                        var value = m[ name ];
                        switch ( name ) {
                            case 'DbgColor':
                            case 'DbgIndex':
                            case 'opticalDensity':
                            case 'illumination':
                                break;
                            case 'DbgName':
                                json.name = value;
                                break;
                            case 'blending':
                                json.blending = BlendingMode[ value ];
                                break;
                            case 'colorAmbient':
                            case 'mapAmbient':
                                console.warn( 'THREE.Loader.createMaterial:', name, 'is no longer supported.' );
                                break;
                            case 'colorDiffuse':
                                json.color = color.fromArray( value ).getHex();
                                break;
                            case 'colorSpecular':
                                json.specular = color.fromArray( value ).getHex();
                                break;
                            case 'colorEmissive':
                                json.emissive = color.fromArray( value ).getHex();
                                break;
                            case 'specularCoef':
                                json.shininess = value;
                                break;
                            case 'shading':
                                if ( value.toLowerCase() === 'basic' ) json.type = 'MeshBasicMaterial';
                                if ( value.toLowerCase() === 'phong' ) json.type = 'MeshPhongMaterial';
                                if ( value.toLowerCase() === 'standard' ) json.type = 'MeshStandardMaterial';
                                break;
                            case 'mapDiffuse':
                                json.map = loadTexture( value, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy,m.mapDiffuseRotation );
                                break;
                            case 'mapDiffuseRepeat':
                            case 'mapDiffuseOffset':
                            case 'mapDiffuseWrap':
                            case 'mapDiffuseAnisotropy':
                            case 'mapDiffuseRotation':
                                break;
                            case 'mapEmissive':
                                json.emissiveMap = loadTexture( value, m.mapEmissiveRepeat, m.mapEmissiveOffset, m.mapEmissiveWrap, m.mapEmissiveAnisotropy,m.mapEmissiveRotation );
                                break;
                            case 'mapEmissiveRepeat':
                            case 'mapEmissiveOffset':
                            case 'mapEmissiveWrap':
                            case 'mapEmissiveAnisotropy':
                            case 'mapEmissiveRotation':
                                break;
                            case 'mapLight':
                                json.lightMap = loadTexture( value, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy,m.mapLightRotation );
                                break;
                            case 'mapLightRepeat':
                            case 'mapLightOffset':
                            case 'mapLightWrap':
                            case 'mapLightAnisotropy':
                                break;
                            case 'mapAO':
                                json.aoMap = loadTexture( value, m.mapAORepeat, m.mapAOOffset, m.mapAOWrap, m.mapAOAnisotropy,m.mapAORotation );
                                break;
                            case 'mapAORepeat':
                            case 'mapAOOffset':
                            case 'mapAOWrap':
                            case 'mapAOAnisotropy':
                                break;
                            case 'mapBump':
                                json.bumpMap = loadTexture( value, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy, m.mapBumpRotation);
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
                                json.normalMap = loadTexture( value, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy,m.mapNormalRotation );
                                break;
                            case 'mapNormalFactor':
                                json.normalScale = [ value, value ];
                                break;
                            case 'mapNormalRepeat':
                            case 'mapNormalOffset':
                            case 'mapNormalWrap':
                            case 'mapNormalAnisotropy':
                            case 'mapNormalRotation':
                                break;
                            case 'mapSpecular':
                                json.specularMap = loadTexture( value, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy,m.mapSpecularRotation );
                                break;
                            case 'mapSpecularRepeat':
                            case 'mapSpecularOffset':
                            case 'mapSpecularWrap':
                            case 'mapSpecularAnisotropy':
                            case 'mapSpecularRotation':
                                break;
                            case 'mapMetalness':
                                json.metalnessMap = loadTexture( value, m.mapMetalnessRepeat, m.mapMetalnessOffset, m.mapMetalnessWrap, m.mapMetalnessAnisotropy,m.mapMetalnessRotation );
                                break;
                            case 'mapMetalnessRepeat':
                            case 'mapMetalnessOffset':
                            case 'mapMetalnessWrap':
                            case 'mapMetalnessAnisotropy':
                            case 'mapMetalnessRotation':
                                break;
                            case 'mapRoughness':
                                json.roughnessMap = loadTexture( value, m.mapRoughnessRepeat, m.mapRoughnessOffset, m.mapRoughnessWrap, m.mapRoughnessAnisotropy,m.mapRoughnessRotation );
                                break;
                            case 'mapRoughnessRepeat':
                            case 'mapRoughnessOffset':
                            case 'mapRoughnessWrap':
                            case 'mapRoughnessAnisotropy':
                            case 'mapRoughnessRotation':
                                break;
                            case 'mapAlpha':
                                json.alphaMap = loadTexture( value, m.mapAlphaRepeat, m.mapAlphaOffset, m.mapAlphaWrap, m.mapAlphaAnisotropy,m.mapAlphaRotation );
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
                                console.warn( 'THREE.Loader.createMaterial: transparency has been renamed to opacity' );
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
                                json[ name ] = value;
                                break;
                            case 'vertexColors':
                                if ( value === true ) json.vertexColors = VertexColors;
                                if ( value === 'face' ) json.vertexColors = FaceColors;
                                break;
                            default:
                                console.error( 'THREE.Loader.createMaterial: Unsupported', name, value );
                                break;
                        }
                    }
                    if ( json.type === 'MeshBasicMaterial' ) delete json.emissive;
                    if ( json.type !== 'MeshPhongMaterial' ) delete json.specular;
                    if ( json.opacity < 1 ) json.transparent = true;
                    materialLoader.setTextures( textures );
                    return materialLoader.parse( json );

                };

            } )()

        };
        return Web3DBins.prototype;
    };
})();