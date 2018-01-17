/**
 * Created by aixl on 2017/8/23.
 */
require(['jquery','eap','vue','jweixin'],function($,eap,Vue,wx){
    var vm = new Vue({
        el:'#section-menu',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            origin:{},
            menuList:[
                {name:"缺货查询",mod:"deviceMonitor",init:'deviceMonitorInit',code:'1',icon:"lackStock"},
                {name:"补换货记录",mod:"actionsRecord",init:'actionsRecordInit',code:'2',icon:"replen"},
                {name:"送货提醒",mod:"sellerAlert",init:'sellerAlertInit',code:'3',icon:"deliveryRecord"},
                {name:"出入库操作",mod:"stockOrder",init:'stockOrderInit',code:'4',icon:"goOut"},
                {name:"收货管理",mod:"receiptRecord",init:'receiptRecordInit',code:'5',icon:"receipt"},
                {name:"销售记录",mod:"salesRecord",init:'salesRecordInit',code:'6',icon:"sell"},
            ]
        },
        methods:{
            toMod:function (modName,mod_init) {
                eap.toModView(modName);
                eval(mod_init+"();");
            },
            back:function () {
                sessionStorage.removeItem("page");//清除外面引入影响
                sessionStorage.removeItem("STORE_ID_");//清除外面引入影响
                sessionStorage.removeItem("STORE_NAME_");//清除外面引入影响
                location.href="home.html";
            },
            openScanner:function () {
                wx.scanQRCode({
                    needResult:1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                    scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
                    success: function (res) {
                        var result = res.resultStr.split("?"); //当needResult 为 1 时，扫码返回的结果
                        if(result.length==2){
                            var params = result[1].split('&');
                            for(var p in params){
                                if(params[p].split('=')[0]=='mid'){
                                    eap.toModView('deviceItem');
                                    eval("deviceItemInit({mid:'"+params[p].split('=')[1].substring(0,10)+"'})");
                                }
                            }
                        }
                    }
                })
            },
            testScanner:function () {
                eap.toModView('deviceItem');
                eval('deviceItemInit({"mid":"g000000045"})')
            }
        }
    });
    vm.$set(vm.origin,"storeName",sessionStorage.getItem("STORE_NAME_"));
    //全局js
    eap.postWithRequestBody("/api/uum/security/wxJsTicket",{
        authAccount:"auth1b1add36200acd59",
        checkurl:location.href.split('#')[0]
    },function (data) {
        if(data.head&&data.head.RETCODE==-1){
            console.error(data.head.RETMSG)
        }else{
            wx.config(eap.copyApply(data,{
                jsApiList:['scanQRCode']
            }))
            wx.error(function(res) {
                alert("微信异常：" + res.errMsg);
            });
        }
    })
    $(function(){
        $(window).scroll(function(){
            if($(window).scrollTop()>=100){//向下滚动像素大于这个值时，即出现小火箭~
                $('.actGotop').fadeIn(300);//火箭淡入的时间，越小出现的越快~
            }else{
                $('.actGotop').fadeOut(300);//火箭淡出的时间，越小消失的越快~
            }
        });
        $('.actGotop').click(function(){$('html,body').animate({scrollTop:'0px'},800);});
    });
});