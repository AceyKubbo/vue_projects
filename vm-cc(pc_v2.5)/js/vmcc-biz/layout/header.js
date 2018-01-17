/**
 * Created by only on 2016/10/23.
 */
require(['jquery','vue','eap','codemodel'],function($, Vue,eap,cm){
    var vm = new Vue({
        el: "#header",
        data:{
            userInfo:{},
            params:{},
            tenantList:{},
            origin:{},
            storeList:{}
        },
        methods:{
            logout :function () {
                sessionStorage.removeItem("AccessToken","");
                sessionStorage.removeItem("user","");
				sessionStorage.removeItem('STORE_NAME_');
                sessionStorage.removeItem('STORE_ID_');
                if(eap.isEmpty(sessionStorage.getItem("user"),false))location.href = "login.html";
            },
            // returnStoreList:function () {
            //     window.location.href = "dashboard.html"
            // },
            accoutSetting:function () {
                window.location.href = "global.html"
            },
            selectTenant:function (tenant) {
                sessionStorage.removeItem('STORE_NAME_');
                sessionStorage.removeItem('STORE_ID_');
                vm.$set(vm.userInfo,"STORE_NAME_",sessionStorage.getItem('STORE_NAME_'));
                vm.userInfo.tenantName = tenant.tenantName
                eap.postWithRequestBody('/api/uum/user/changeTenant',{
                    tenantId:tenant.tenantId
                },function (datas){
                    if(datas.retcode !='0'){
                        layer.msg(cm.retMsg.get(datas.retcode));
                        return;
                    }
                    sessionStorage.setItem("userTenantInfo",JSON.stringify(datas.userTenantInfo));
                    sessionStorage.setItem('AccessToken',datas.accessToken);
                    if(tenant.tenantId == "t00000001"){
                        sessionStorage.removeItem("mod")
                        window.location.href = "platform.html";
                    }else{
                        vm.loadTenantStore();
                    }
                })
            },
            searchTenant:function () {
                var condi = vm.params.tenantName;
                if(eap.isEmpty(condi)){
                    vm.tenantList = vm.origin.tenantList;
                }else{
                    vm.tenantList = vm.origin.tenantList.filter(function (e) {
                        return e.tenantName.indexOf(condi)>=0
                    })
                }
            },
            searchStore:function () {
                var condi = vm.params.NAME_;
                if(eap.isEmpty(condi)){
                    vm.storeList = vm.origin.storeList;
                }else{
                    vm.storeList = vm.origin.storeList.filter(function (e) {
                        return e.NAME_.indexOf(condi)>=0
                    })
                }
            },
            selectStore:function (store) {
                if(store){
                    sessionStorage.setItem('STORE_NAME_',store.NAME_);
                    sessionStorage.setItem('STORE_ID_',store.ID_);
                    vm.userInfo.STORE_NAME_ = store.NAME_;
                    vm.refreshCurrentView();
                }
            },
            loadTenantInfo : function(){
                eap.postWithRequestBody('/api/uum/user/queryTenant',{},function (datas) {
                    if(datas.retcode !='0'){
                        layer.msg(datas.retmsg);
                        return;
                    }
                    vm.origin.tenantList = datas.userTenantInfos
                    vm.tenantList = vm.origin.tenantList
                })
            },
            loadTenantStore : function(){
                var menu = setInterval(function (){
                    if(eap.isFunction(MenuInit)){
                        MenuInit();
                        clearInterval(menu);
                    }
                },50);
                eap.post('/api/shop/data/query',{
                    dataModelName:'V_SHOP_STORE',
                },function (data) {
                    var datas = eap.parseJson(data);
                    if(datas.head.RETCODE !='0'){
                        layer.msg(cm.retMsg.get(datas.head.RETCODE));
                        return;
                    }
                    if(!eap.isEmpty(datas.data)){
                        vm.origin.storeList = datas.data;
                        vm.storeList = vm.origin.storeList ;
                        vm.selectStore(vm.storeList[0]);
                    }else{
                        sessionStorage.setItem("STORE_ID_",-1);
                        vm.refreshCurrentView();
                    }
                });
            },
            refreshCurrentView : function(){
                var initMethod = (sessionStorage.getItem('mod') || "storeOverview") + "Init";
                var modInterval = setInterval(function (){
                    if(eap.isFunction(window[initMethod])){
                        eap.toModView(sessionStorage.getItem('mod'))
                        eval(initMethod + "();");
                        clearInterval(modInterval);
                    }
                },50)
            }
        }
    });
    vm.userInfo = eap.copyApply(eap.getUserInfo(),eap.getTenantInfo());
    vm.$set(vm.userInfo,"STORE_NAME_",sessionStorage.getItem('STORE_NAME_'));
    /**
     * 全局js
     */
    var PageInit = function () {
        //返回顶部js
        $(function(){
            $(window).scroll(function(){
                if($(window).scrollTop()>=100){//向下滚动像素大于这个值时，即出现小火箭~
                    $('.actGotop').fadeIn(300);//箭头淡入的时间，越小出现的越快~
                }else{
                    $('.actGotop').fadeOut(300);//箭头淡出的时间，越小消失的越快~
                }
            });
            $('.actGotop').click(function(){$('html,body').animate({scrollTop:'0px'},800);});
        });
        vm.loadTenantInfo();
        vm.loadTenantStore();
    }
    PageInit();
});