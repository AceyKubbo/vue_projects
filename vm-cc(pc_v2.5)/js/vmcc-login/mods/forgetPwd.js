/**
 * Created by apple on 17/11/30.
 */
require(['jquery','eap','vue','md5','layer'],function ($,eap,Vue,md5,layer) {
    var vm = new Vue({
        el:"#forgetPasswordViewId",
        data:{
            userInfo:{}
        },
        methods:{
            getVcode:function () {
                if(eap.isEmpty(vm.userInfo.authAccount)){
                    layer.msg('请输入手机号码!')
                    return
                }
                if(!(/^1[3|4|5|6|7|8][0-9]\d{4,8}$/.test(vm.userInfo.authAccount))){
                    layer.msg('请输入正确手机号码!')
                    return
                }
                eap.postWithRequestBody('/api/uum/security/vcode',{
                    uumKey:"auth1b1add36200acd59",
                    phone:vm.userInfo.authAccount,
                    type:'2',
                },function (data) {
                    if(data.retcode != '0'){
                        layer.alert(data.retmsg)
                        return
                    }
                    layer.msg('验证码发送成功!')
                    window.setTimeout(function(){
                        $('#grayButton').addClass('hidden')
                    },60000)
                    $('#grayButton').removeClass('hidden')

                })
            },
            confirmModifyPassword:function () {
                if(eap.isEmpty(vm.userInfo.authAccount)){
                    layer.msg('请输入手机号码!')
                    return
                }
                if(eap.isEmpty(vm.userInfo.authCode)){
                    layer.msg('请输入验证码!')
                    return
                }
                if(eap.isEmpty(vm.userInfo.newPasswd)){
                    layer.msg('请输入新密码!')
                    return
                }
                eap.postWithRequestBody('/api/uum/security/authUser',{
                    authAccount:vm.userInfo.authAccount,
                    authCode : vm.userInfo.authCode,
                    authChannel : "phone",
                    extra:[{key:'NEW_PASSWD_',value:md5.calcMD5( vm.userInfo.newPasswd)}],
                },function (data) {
                    if(data.retcode != '0'){
                        layer.alert(data.retmsg)
                        return
                    }
                    layer.msg("密码修改成功！")
                    $('#loginView').removeClass('hidden')
                    $('#forgetPasswordViewId').addClass('hidden')
                })
            },
            returnLogin:function () {
                $('#loginView').removeClass('hidden')
                $('#forgetPasswordViewId').addClass('hidden')
            }
        }

    })

})