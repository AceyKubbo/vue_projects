/**
 * Created by apple on 17/12/14.
 */
var personalCenterInit
require(['jquery','eap','vue','layer'],function ($,eap,Vue,layer) {
    var personalCenter = new Vue({
        el:'#section-personalCenter',
        data:{
            userInfo:{}
        },
        methods: {
            returnHomepage:function () {
                eap.toModView('homepage')
                HomepageInit()
            },
            jumpOrder:function () {
                eap.toModView('orderpage')
                orderInit()
            }
        }
    })
    personalCenterInit=function () {
        if(sessionStorage.getItem('userName')){
            personalCenter.$set(personalCenter.userInfo,"userName",sessionStorage.getItem('userName'));
        }else {
            personalCenter.$set(personalCenter.userInfo,"userName",'魔格用户');
        }
        if(sessionStorage.getItem('userPicture')){
            personalCenter.$set(personalCenter.userInfo,"userPicture",sessionStorage.getItem('userPicture'));
        }else {
            personalCenter.$set(personalCenter.userInfo,"userPicture",'img/default-avatar.png');
        }
    }
})
