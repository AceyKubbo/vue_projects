require(['jquery','eap','vue'],function($,eap,Vue){
    var vm = new Vue({
        el:'#section-index',
        data:{
        },
        method:{
        }
    });
    var params = eap.getUrlParams();
    sessionStorage.setItem('midParams',params)
    $.ajax({
        url:'/api/uum/security/sysinfo',
        type:'POST',
        dataType:'json',
        contentType: "application/json; charset=utf-8",
        data:JSON.stringify({
            url:location.origin
        }),
        success:function (data) {
            if(data.retcode == '0'){
                sessionStorage.setItem('authAccount',data.authAppId)
                if(eap.isWeiXin()){
                    var WeiXinRedirectConfig = {
                        appid:data.wxpubAppId,
                        redirect_uri:location.origin+"/vmui/shop/biz.html?" + eap.getParamsUrl(params),
                        response_type:'code',
                        scope:'snsapi_userinfo',
                    };
                    window.location.href = ["https://open.weixin.qq.com/connect/oauth2/authorize?",eap.getParamsUrl(WeiXinRedirectConfig),"#wechat_redirect"].join('');
                }else if(eap.isAliPay()){
                    var AliPayRedirectConfig = {
                        app_id:data.alipayAppId,
                        scope:'auth_user',
                        redirect_uri:location.origin+"/vmui/shop/biz.html?" + eap.getParamsUrl(params),
                    }
                    window.location.href = ["https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?",eap.getParamsUrl(AliPayRedirectConfig)].join('');
                }
            }
        }
    })
});