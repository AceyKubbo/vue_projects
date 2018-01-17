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
            accoutSetting:function () {
                window.location.href = "global.html"
            },
            returnMer:function () {
                sessionStorage.removeItem("mod")
                window.location.href = "biz.html"
            },
            refreshCurrentView : function(){
                var initMethod = (sessionStorage.getItem('mod')||"salesRecord") + "Init";
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
        var menu = setInterval(function (){
            if(eap.isFunction(MenuInit)){
                MenuInit();
                clearInterval(menu);
            }
        },50);
        vm.refreshCurrentView();
    }
    PageInit();
});