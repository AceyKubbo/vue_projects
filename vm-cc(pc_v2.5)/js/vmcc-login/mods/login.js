/**
 * Changed by huangk on 2017-8-17.
 *
 */
require(['jquery','eap','vue','md5','layer'],function ($,eap,Vue,md5,layer) {
    var vm = new Vue({
        el:"#loginView",
        data:{},
        methods:{
            loginBtn:function () {
                var userName = $("#userName1").val();
                var userPwd = $("#userPwd1").val();
                if(eap.isEmpty(userName) || eap.isEmpty(userPwd)){
                    layer.msg("请输入用户名或者密码");
                    return
                }
                if(document.getElementById("switchRemeber").checked){
                    // 保存用户名、密码
                    window.localStorage.setItem("vm.user",userName);
                    window.localStorage.setItem("vm.password",userPwd);
                }else{//清除数据
                    window.localStorage.setItem("vm.user",null);
                    window.localStorage.setItem("vm.password",null);
                }
                var loginbtn = $('#Login');
                loginbtn.html('登录中...');
                loginbtn.attr("disabled", "disabled");
                eap.call("uum@authTenant",{
                    "authAccount":userName,
                    "authCode":md5.calcMD5(userPwd),
                    "authChannel":'account'
                },function (datas) {
                    if (datas.retcode == 0){
                        sessionStorage.setItem('LOGIN_ACCOUNT_',userName)
                        //存储用户访问令牌
                        sessionStorage.setItem("AccessToken",datas.accessToken);
                        //存储用户信息
                        sessionStorage.setItem('user',JSON.stringify(datas.userAuthInfo));
                        sessionStorage.setItem("userTenantInfo",JSON.stringify(datas.userTenantInfo));
                        sessionStorage.setItem("userLv",datas.userTenantInfo['tenantRoles']?datas.userTenantInfo['tenantRoles'].indexOf('Admin')>=0?0:1:'');
                        //清除管理账号多租户信息
                        if(sessionStorage.getItem("tenant"))sessionStorage.removeItem("tenant");
                        if(datas.userTenantInfo.tenantId == "t00000001"){
                            sessionStorage.setItem('STORE_ID_',-1)
                            window.location.href = "platform.html";
                        }else{
                            eap.call('shop@query',{
                                dataModelName:'V_SHOP_STORE'
                            },function (data) {
                                var datas = eap.parseJson(data).data
                                if(!eap.isEmpty(datas) && !eap.isEmpty(datas.data)){
                                    sessionStorage.setItem('STORE_ID_',datas[0].ID_)
                                    sessionStorage.setItem('STORE_NAME_',datas[0].NAME_)
                                }
                                window.location.href = "biz.html";
                            })
                        }
                    }else{
                        layer.msg('账号或密码不正确！')
                        loginbtn.html('登录');
                        loginbtn.removeAttr("disabled");
                    }
                },function (msg) {
                    alert(JSON.stringify(msg))
                    loginbtn.html('登录');
                    loginbtn.removeAttr("disabled");
                })
            },
            phoneloginBtn:function () {
                var userPhone = $("#userName2").val();
                var userVcode = $("#userPwd2").val();
                if(eap.isEmpty(userPhone) || eap.isEmpty(userVcode)){
                    layer.msg("请输入电话或者验证码");
                    return
                }
                var loginbtn = $('#phoneloginBtn');
                loginbtn.html('登录中...');
                loginbtn.attr("disabled", "disabled");
                eap.call("uum@authTenant",{
                    "authAccount":userPhone,
                    "authCode":userVcode,
                    "authChannel":'phone'
                },function (datas) {
                    loginbtn.html('登录');
                    loginbtn.removeAttr("disabled");
                    if (datas.retcode == 0) {
                        sessionStorage.setItem('LOGIN_ACCOUNT_',userPhone)
                        //存储用户访问令牌
                        sessionStorage.setItem("AccessToken",datas.accessToken);
                        //存储用户信息
                        sessionStorage.setItem('user',JSON.stringify(datas.userAuthInfo));
                        sessionStorage.setItem("userTenantInfo",JSON.stringify(datas.userTenantInfo));
                        sessionStorage.setItem("userLv",datas.userTenantInfo['tenantRoles']?datas.userTenantInfo['tenantRoles'].indexOf('Admin')>=0?0:1:'');
                        //清除管理账号多租户信息
                        if(sessionStorage.getItem("tenant"))sessionStorage.removeItem("tenant");
                        eap.call('shop@query',{
                            dataModelName:'V_SHOP_STORE'
                        },function (data) {
                            var datas = eap.parseJson(data).data
                            sessionStorage.setItem('STORE_ID_',datas[0].ID_)
                            sessionStorage.setItem('STORE_NAME_',datas[0].NAME_)
                            window.location.href = "biz.html";
                        })
                    }else{
                        layer.msg('账号或密码不正确！')
                        loginbtn.html('登录');
                        loginbtn.removeAttr("disabled");
                    }
                },function (msg) {
                    alert(JSON.stringify(msg))
                    loginbtn.html('登录');
                    loginbtn.removeAttr("disabled");
                })
            },
            getVcode:function () {
                $("#sendIn").removeClass('hidden')
                eap.call('uum@vcode',{
                    uumKey:"auth1b1add36200acd59",
                    phone:$('#userName2').val(),
                    type:'1',
                },function (data) {
                    if(data.retcode != '0'){
                        layer.alert(data.retmsg)
                        return
                    }
                    window.setTimeout(function(){
                        $('#sendIn').addClass('hidden')
                    },60000)
                    $("#sendIn").removeClass('hidden')
                    layer.alert('请接收短信验证码!')
                })
            },
            showForgetPasswordView:function () {
                $('#forgetPasswordViewId').removeClass('hidden')
                $('#loginView').addClass('hidden')
            }
        }

    })
    var loginInit= function () {
        var userName = window.localStorage.getItem("vm.user");
        var userPwd = window.localStorage.getItem("vm.password");
        //var userPhone = window.localStorage.getItem("vm.userPhone");
        //初始化用户名数据
        if(!eap.isEmpty(userName)){
            $("#userName1").val(userName);
            $("#userPwd1").val(userPwd);
            //$("#userName2").val(userPhone);
        }
    }
    loginInit();
})