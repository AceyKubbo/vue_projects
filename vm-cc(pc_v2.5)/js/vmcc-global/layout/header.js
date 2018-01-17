require(['jquery','vue','eap'],function($, Vue,eap){
    var vm = new Vue({
        el: "#globalHeader",
        data:{
            userInfo:{}
        },
        methods:{
            logout :function () {
                sessionStorage.setItem("AccessToken","");
                sessionStorage.setItem("user","");
                if(eap.isEmpty(sessionStorage.getItem("user"),false))location.href = "login.html";
            },
            returnBiz:function () {
                location.href = "biz.html";
            }
        }
    });
    vm.userInfo = eap.getUserInfo()
});