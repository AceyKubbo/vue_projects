/**
 * Created by aixl on 2017/8/23.
 */
var selectTenantInit;
require(['jquery','eap','vue'],function($,eap,Vue){
    var vm = new Vue({
        el:'#section-tenant',
        data: {
            TotalCount: 0,
            RecordCount: 50,
            params: {limit: 50},
            origin: {},
            tenantList:null
        },
        methods:{
            switchTenant:function (tenant) {
                eap.postWithRequestBody( '/api/uum/user/changeTenant',{
                    tenantId:tenant.tenantId
                },function (data) {
                    if(data&&data.retcode=='0'){
                        sessionStorage.setItem('AccessToken',data.accessToken);
                        sessionStorage.setItem('tenant',JSON.stringify(tenant));
                        eap.toModView("store");
                        StoreInit();
                    }else{
                        alert(data.retmsg);
                    }
                })
            },
            search:function (condition) {
                var tempList = vm.origin.tenantList.filter(function (e) {
                    var flag = true;
                    if(typeof condition ==='function') flag = flag&&condition(e);
                    return flag;
                })
                vm.tenantList = tempList.slice(0,Number(tempList.length))
            },
            searchTenant:function () {
                if(vm.params.tenantName){
                    vm.search(function (e) {
                        return e.tenantName.indexOf(vm.params.tenantName)>0;
                    })
                }else{
                    vm.search();
                }
            }
        }
    });
    var TenantList = function (cb) {
        eap.postWithRequestBody('/api/uum/user/queryTenant',{},function (data) {
            var datas = eap.parseJson(data);
            vm.origin.tenantList = datas.userTenantInfos;
            if(eap.isFunction(cb)){
                cb();
            }
        },
        function (data) {
            alert(data.statusText)
        },'text');
    }
    selectTenantInit = function () {
        TenantList(function () {
            if(vm.origin.tenantList&&vm.origin.tenantList.length==1){
                eap.toModView('store');
                eval('StoreInit();')
            }else{
                vm.search()
            }
        })
    }
    // alert(location.href)
    HomeInit=function () {
        var params = eap.getUrlParams();
        var authInfo = {
            "authAccount":"auth1b1add36200acd59",
            "authCode":params?params[eap.isAliPay()?"auth_code":"code"]:null,
            "authChannel":eap.isAliPay()?"alipay" : "wx_pub",
        }
        vm.params = eap.copyApply(vm.params,eap.getUrlParams());
        if(vm.params["TENANT_ID_"])authInfo = eap.copyApply({"tenantId":eap.getUrlParams()["TENANT_ID_"]},authInfo);
        if(authInfo.authCode){
            eap.postWithRequestBody('/api/uum/security/authTenant',authInfo,function (datas) {
                if(datas.retcode == 0){
                    sessionStorage.setItem('AccessToken',datas.accessToken)
                    if(datas.userTenantInfo){
                        sessionStorage.setItem('user',JSON.stringify(datas.userAuthInfo))
                        sessionStorage.setItem('tenant',JSON.stringify(datas.userTenantInfo))
                        if(vm.params["page"]){//外部调取模块,验证获取token后直接跳转模块
                            sessionStorage.setItem("STORE_ID_",vm.params["STORE_ID_"])
                            sessionStorage.setItem("page",vm.params["page"])
                            location.href="biz.html"
                        }else{
                            TenantList(function () {
                                if(vm.params["STORE_ID_"]&&vm.params["page"]){
                                    sessionStorage.setItem("STORE_ID_",vm.params["STORE_ID_"])
                                    sessionStorage.setItem("page",vm.params["page"])
                                    location.href="biz.html"
                                }else{
                                    if(vm.origin.tenantList&&vm.origin.tenantList.length==1){
                                        eap.toModView('store');
                                        setTimeout(function(){StoreInit();},100);
                                    }else{
                                        vm.search()
                                    }
                                }
                            })
                        }
                    }else{
                        alert('该用户未绑定租户!')
                    }
                }
            })
        }else{
            if(eap.isWeiXin()){
                eap.postWithRequestBody("/api/uum/security/sysinfo",{
                    url:location.origin
                },function (data) {
                    window.location.href = ["https://open.weixin.qq.com/connect/oauth2/authorize?",eap.getParamsUrl({
                        appid:data.wxpubAppId,
                        redirect_uri:eap.UniToStr(location.href),
                        response_type:'code',
                        scope:'snsapi_userinfo',
                    }),"#wechat_redirect"].join('');
                })
            }
        }
    }
    HomeInit();
});