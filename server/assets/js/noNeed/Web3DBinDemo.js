var test=new Web3DBin("aa");//参数为canvas要加入的元素id，若无参则默认元素为body。注：元素必须事先定好大小尺寸
var params = {
    清空场景 : function(){test.clearAll();},
    添加模型 : newChoose,
    截图 : outScreen,
    右转20度 : rtR,
    左转20度: rtL,
    跳转至45度 : rotateTo45,
    改变前片颜色:colorOperate,
    改变前片贴图:textureOperate,
    改变前片位置:meshOperate,
    获取当前帧参数值:frameStatue,
    跳转到袖口位置:frameChoose,
    /*闪烁部件 : shine,*/
    重力感应 : accelerometer,
    放大镜1 : magnifier,
    //放大镜2 : magnifier3,
    放大:magnifier1,
    缩小:magnifier2,
    添加印花A : addDecalA,
    修改印花A : changeDecalA,
    删除印花A : deleteDecalA,
    添加印花B : addDecalB,
    修改印花B : changeDecalB,
    删除印花B : deleteDecalB,
    获取印花 : getDecal,
    获取印花B信息 : getDecalBMSG,
    获取绣字C信息 : getDecalCMSG,
    增加灯光l3 : addLightl3,
    修改灯光l3 : changeLightl3,
    删除灯光l3: deleteLightl3,
    模型对比:modelCompare,
    放大两倍向左旋转90度:zoomAndRotate,
    create : decalTexts,
    changec : changeDC,
    deletec : deleteDC,
    size : 160,
    text : "qishon",
    鼠标获取大身UV值 : getUVMSG
}

init();
function init()
{
    /*var gui = new dat.GUI();
    gui.add(params,'清空场景');
    gui.add(params,'添加模型');
    gui.add(params,'截图');
    gui.add(params,'右转20度');
    gui.add(params,'左转20度');
    gui.add(params,'跳转至45度');
    gui.add(params,'放大两倍向左旋转90度');
    // gui.add(params,'闪烁部件');
    //gui.add(params,'重力感应');
    var f2=gui.addFolder('放大镜');
    f2.add(params,'放大镜1');
    f2.add(params,'放大');
    f2.add(params,'缩小');
    var f3=gui.addFolder('U3D接口');
    f3.add(params,'改变前片颜色');
    f3.add(params,'改变前片贴图');
    f3.add(params,'改变前片位置');
    gui.add(params,'获取当前帧参数值');
    gui.add(params,'跳转到袖口位置');
    gui.add(params,'添加印花A');
    gui.add(params,'修改印花A');
    gui.add(params,'删除印花A');
    gui.add(params,'添加印花B');
    gui.add(params,'修改印花B');
    gui.add(params,'删除印花B');
    gui.add(params,'获取印花');
    gui.add(params,'获取印花B信息');
    gui.add(params,'获取绣字C信息');
    gui.add(params,'增加灯光l3');
    gui.add(params,'修改灯光l3');
    gui.add(params,'删除灯光l3');
    var f1=gui.addFolder("文字印花");
    f1.add(params,'size').name('文字大小');
    f1.add(params,'text').name('文字内容');
    f1.add(params,'create');
    f1.add(params,'changec');
    f1.add(params,'deletec');
    gui.add(params,'鼠标获取大身UV值');
    gui.add(params,'模型对比');*/
    gdj_url = "/static/data/json/init.json";
    gdj_type = "get";
    gdj_data = null;
    $.ajax({
        url: gdj_url,
        type: gdj_type,
        data: gdj_data,
        dataType: "json",
        success: function(data)
        {
            var json;
            json = eval(data);
            //调用初始化接口
            test.initScene(json);
            //开启重力感应
            test.accelerometer({
                accelerometerPower: /*!*/test.getAccelerometerPowerFlag(),
                speedRatio: 1.0
            });
            //添加模型
            addbin();
        }
    });
}

function addbin()
{
    var onProgress = function(xhr){
        if(xhr.lengthComputable){
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete,2)+'%downloaded');
        }
    }
    var onError = function(xhr){};
    gdj_url = "/static/data/json/mall.json";
    gdj_type = "get";
    gdj_data = null;
    $.ajax(
    {
        url: gdj_url,
        type: gdj_type,
        data: gdj_data,
        dataType: "json",
        success: function(data)
        {
            var json;
            json = eval(data);
            test.chooseModel(json,testt);
        }
    });
}
function testt(){
    console.log("---");
    console.log(test);
}
function getJson(str,callback) {
    gdj_url = str;
    gdj_type = "get";
    gdj_data = null;
    var json;
    $.ajax({
        url: gdj_url,
        type: gdj_type,
        data: gdj_data,
        dataType: "json",
        success: function(data) {
            json = eval(data);
            callback(json);
        }
    });
};
function newChoose(){
    var chooseStr = "/static/data/json/add.json";
    getJson(chooseStr,function(json){
        test.chooseModel(json,null);
    });
};
function outScreen(){
    console.log(test.getScreen());

    // var data = test.getScreen();
    // var jsondata = '{"imageName":"12345","image":"'+data+'"}'
    // ajaxPost("http://1.1.7.48:8064/base64Image/web3dImage?",jsondata,function(msg){
    //     console.log(msg);
    // },function(msg){
    //     console.log(msg);
    // },function(){
    //     console.log("loading...");
    // });
};
function rtR(){
    test.rotateFrame(20);
};
function rtL(){
    test.rotateFrame(-20);
};
function rotateTo45(){
    test.frameskip(-45);
};
function colorOperate(){
    test.colorOperate({sceneName:"front",materialName:"mian_1_m",colorType:"diffuse",value:"0,0,0"});
};
function textureOperate(){
    test.textureOperate({sceneName:"front",materialName:"mian_1_m",textureType:"diffuse",texturePath:"/static/data/img/Color.jpg",textureRepeat:"20,20"});
};
function meshOperate(){
    test.meshOperate({sceneName:"front",type:"position",value:"0,-50,0"});
};
function frameStatue(){
    console.log(test.frameStatue());
};
function frameChoose(){
    test.frameChoose({distance: -291.1411431175523, scale: 2.940367562500004, angle: 4.857974981404713},testt);
};
function shine(){
    test.shineAssembly("collar");
};
var choose=1;
function magnifier(){
    if(choose==1){
    document.getElementById("dd").style.display="";
    var data={"power":1,"scale":8,"elementID":"dd"};
    test.magnifier(data);
    }
    else if(choose==-1){
        document.getElementById("dd").style.display="none";
        var data={"power":0,"way":2};
        test.magnifier(data);
    }
    choose=-choose;
};
function magnifier1(){
    test.magnifier(1.1);
};
function magnifier2(){
    test.magnifier(0.9);
};
function magnifier3(){
    document.getElementById("dd").style.display="";
    var data={"power":2,"scale":8,"elementID":"dd","way":1};
    test.magnifier(data);
};
function accelerometer(){
    test.accelerometer({
        "accelerometerPower": !test.getAccelerometerPowerFlag(),
        "speedRatio": 1.0
    });
};
function addDecalA(){
var t={distance: -201.66557956594048, scale: 4.000000000000003, angle: 5.85408972522586};
    test.frameChoose(t,add);
    function add(){
        test.addDecalPic({
            "assemblySceneName": "front",
            "decalImgSrc": "/static/data/img/ryb.png",
            "decalID": "decalA",
            "translateEnable": 1,
            "scaleEnable":false
        },addDecalACallback)
    }
};
function addDecalACallback(data){
    console.log(data);
};
function changeDecalA(){
    test.changeDecal({
        "decalID": "decalA",
        "power": 2
    });
};
function changeDecalB(){
    test.changeDecal({
        "decalID": "decalB",
        "power": 2
    });
};
var x=1;
function modelCompare(){
    x=-x;
    if(x==-1){
        document.getElementById("aa").style.left="5%";
        document.getElementById("bb").style.display="";
        document.getElementById("cc").style.display="";
        test1=test.clone("bb");
        getJson("/static/data/json/mall1.json",function(json){
            test1.chooseModel(json,null);
        });
        test2=test.clone("cc");
        getJson("/static/data/json/mall2.json",function(json){
            test2.chooseModel(json,null);
        });

        test.bindingCouple([test1,test2],1);
    }
    else if(x==1){
        document.getElementById("aa").style.left="35%";
        document.getElementById("bb").style.display="none";
        document.getElementById("cc").style.display="none";
        test1.bindingCouple([test1,test2],0);
        test1.dispose();
        test2.dispose();
        test1={};
        test2={};
    }
};
function zoomAndRotate(){
    test.rotateAndZoom(90,2);
};
function getDecal(){
    test.getDecal("front",getDecalACallback);
};
function getDecalBMSG(){
    console.log(test.getDecalMSG("decalB"));
};
function getDecalCMSG(){
    console.log(test.getDecalMSG("decalC"));
};
function getDecalACallback(data){
    console.log(data);
    window.open(data.UVData);
    window.open(data.decalData);
};
function deleteDecalA(){
    test.deleteDecal("decalA");
};

function addDecalB(){
    test.addDecalPic({
        "assemblySceneName": "front",
        "decalImgSrc": "/static/data/img/logo1.png",
        "decalID": "decalB",
        "UVPosition":{
            "x": 0.7425079183645074,
            "y": 0.2926377877176458
        },
        /*"UVPositionMove":{
            "x": 0.0,
            "y": 0.0
        },*/
        "UVRotation":0.0/**/,
        "decalScale":1.0/**/
    },addDecalACallback);
};
function addDecalBCallback(data){
    console.log(data);
};
function deleteDecalB(){
    test.deleteDecal("decalB");
};
function deleteLightl3(){
     var chooseStr = "/static/data/json/removeLight.json";
        getJson(chooseStr,function(json){
            test.changeLights(json);
        });
};
function addLightl3(){
     var chooseStr = "/static/data/json/addLight.json";
        getJson(chooseStr,function(json){
            test.changeLights(json);
        });
};
function changeLightl3(){
     var chooseStr = "/static/data/json/changeLight.json";
        getJson(chooseStr,function(json){
            test.changeLights(json);
        });
};

function decalTexts(){
    var str='<font style="font-size:'+params.size+"px"+';color:red;font-family:Times New Roman">'+params.text+'</font>'+
    '<font style="font-size:'+params.size+"px"+';color:yellow;font-family:Times New Roman">'+params.text+'</font>';
    test.addDecalText({
        "textstr":str,
        assemblySceneName: "front",
        "decalID": "decalC",
        "translateEnable": 1

    });

};

function changeDC(){
    test.changeDecal({
        "decalID": "decalC",
        "power": 2
    });
};
function deleteDC(){
    test.deleteDecal("decalC");
};

function getUVMSG(){
    test.getUVMSG( "front", consoleUV );
    function consoleUV( data ){
        console.log(data);
    }
};

// ajax 对象
function ajaxObject() {
    var xmlHttp;
    try {
        // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
        }
    catch (e) {
        // Internet Explorer
        try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                alert("您的浏览器不支持AJAX！");
                return false;
            }
        }
    }
    return xmlHttp;
}

// ajax post请求：
function ajaxPost ( url , data , fnSucceed , fnFail , fnLoading ) {
    var ajax = ajaxObject();
    ajax.open( "post" , url , true );
    ajax.setRequestHeader( "Content-Type" , "application/x-www-form-urlencoded" );
    ajax.onreadystatechange = function () {
        if( ajax.readyState == 4 ) {
            if( ajax.status == 200 ) {
                fnSucceed( ajax.responseText );
            }
            else {
                fnFail( "HTTP请求错误！错误码："+ajax.status );
            }
        }
        else {
            fnLoading();
        }
    }
    ajax.send( data );

}
