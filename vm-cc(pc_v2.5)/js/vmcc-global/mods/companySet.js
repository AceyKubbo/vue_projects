/**
 * Created by apple on 17/11/16.
 */
var companySetInit
require(['jquery','vue','eap','md5','layer'],function ($,Vue,eap,md5,layer) {
    var companySet = new Vue({
        el:"#section-companySet",
        data:{
            enterpriseDetail:{},
            enterprise:{},
            accountList:{},
            findAccountParams:{},
            findAccountList:{},
            changeRole:{},
            origin:{},
            userInfo:{}
        },
        methods:{
            modifyCompanySet:function (enterpriseDetail) {
                companySet.enterprise = enterpriseDetail
                $('#changeCompanyInfo').modal('toggle')
            },
            submitModifyEnterprise:function (enterprise) {
                var params = eap.copyApply({
                    dataModelName:'T_UUM_TENANT',
                    accessToken: sessionStorage.getItem('AccessToken')
                },companySet.enterprise)
                $.ajax({
                    url: '/api/uum/data/crud',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    data: params,
                    success: function (datas) {
                        $("#changeCompanyInfo").modal('hide')
                    },
                    error: function (data) {
                    }
                })
            },
            visitMemberButton:function () {
                $('#visitMember').modal('toggle')
                $("#findAccountParamsAccount").val('')
                $("#findAccountRemark").val('')
            },
            findAccount:function () {
                params = {
                    accessToken:sessionStorage.getItem('AccessToken'),
                    account:companySet.findAccountParams.account
                }
                $.ajax({
                    url: '/api/uum/security/findAccount',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    data:JSON.stringify(params),
                    success: function (datas) {
                        $('#findAccount').show()
                        eap.each(datas.users,function (e) {
                                e['value'] = e.extra[0].value
                        })
                        companySet.findAccountList = datas.users
                    },
                    error: function (data) {

                    }
                })
            },
            clickFindAccount:function (findAccount) {
                companySet.findAccountParams.account = findAccount.userName
                $("#findAccountParamsAccount").val(findAccount.userName)
                $("#findAccountRemark").val(findAccount.userName)
                this.inviteUser = findAccount;
                $('#findAccount').hide()
            },
            visitmember:function () {
                var Admin,Operator,Finance,tenantRole
               if($('#Admin').is(':checked')) {
                   Admin = 'Admin_'
               }else {
                   Admin = ''
               }
               if($('#Operator').is(':checked')) {
                   Operator = 'Operator_'
                }else {
                   Operator = ''
                }
                if($('#Finance').is(':checked')) {
                    Finance = 'Finance_'
                }else {
                    Finance = ''
                }
                tenantRole = Admin+Operator+Finance
                companySet.findAccountParams.account = tenantRole.substring(0,tenantRole.length-1)
                if(eap.isEmpty(this.inviteUser)){
                    layer.msg('请选择运营者！')
                    return
                }
               var params = {
                    accessToken:sessionStorage.getItem('AccessToken'),
                    authId:this.inviteUser.authId,
                    authChannel:this.inviteUser.authChannel,
                    tenantId:eap.parseJson(sessionStorage.getItem('userTenantInfo')).tenantId,
                    tenantRoles:tenantRole.substring(0,tenantRole.length-1),
                    remark:$("#findAccountRemark").val()
                }
                $.ajax({
                    url: '/api/uum/tenant/inviteUser',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    data:JSON.stringify(params),
                    success: function (datas) {
                        if(datas.retcode != 0){
                            layer.msg(datas.retmsg)
                        }
                        $('#visitMember').modal('hide')
                        companySetInit()
                    },
                    error: function (data) {
                    }
                })

            },
            changeTenantRole:function (account) {
                $('.input').attr("checked",false)
                companySet.changeRole = account
                if(account.TENANT_ROLES.indexOf('Admin')>=0){
                    $('#changeAdmin').attr("checked","checked")
                }
                if(account.TENANT_ROLES.indexOf('Operator')>=0){
                    $('#changeOperator').attr("checked","checked");
                }
                if(account.TENANT_ROLES.indexOf('Finance')>=0){
                    $('#changeFinance').attr("checked","checked")
                }
                $("#changeTenantRole").modal('toggle')
            },
            submitChangeRole:function () {
                var changeAdmin,changeOperator,changeFinance,changeTenantRole
                if($('#changeAdmin').is(':checked')) {
                    changeAdmin = 'Admin_'
                }else {
                    changeAdmin = ''
                }
                if($('#changeOperator').is(':checked')) {
                    changeOperator = 'Operator_'
                }else {
                    changeOperator = ''
                }
                if($('#changeFinance').is(':checked')) {
                    changeFinance = 'Finance_'
                }else {
                    changeFinance = ''
                }
                changeTenantRole = changeAdmin + changeOperator + changeFinance
                var params = {
                    dataModelName: 'T_UUM_TENANT_USER',
                    accessToken: sessionStorage.getItem('AccessToken'),
                    TENANT_ROLES: changeTenantRole.substring(0,changeTenantRole.length-1),
                    ID_:companySet.changeRole.ID_,
                    REMARK_:companySet.changeRole.REMARK_
                }
                $.ajax({
                    url: '/api/uum/data/crud',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    data: params,
                    success: function (datas) {
                        if(datas.head.RETCODE != '0'){
                            layer.msg(datas.head.RETMSG)
                            return
                        }
                        companySetInit()
                        $("#changeTenantRole").modal('hide')
                    },
                    error: function (data) {
                    }
                })

            },
            deleteTenantRole:function (account) {
                layer.confirm("是否删除此账号?",{btn:["确认","取消"]},function (index) {
                    layer.close(index);
                    $.ajax({
                        url: '/api/uum/data/crud',
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            dataModelName:'T_UUM_TENANT_USER',
                            accessToken: sessionStorage.getItem('AccessToken'),
                            deleteKey:account.ID_,
                        },
                        success: function (datas) {
                            if(datas.head.RETCODE != '0'){
                                layer.msg(datas.head.RETMSG)
                                return
                            }
                            companySetInit()
                        },
                        error: function (data) {
                        }
                    })
                })
            },
            showChangePassWordView:function () {
                companySet.userInfo = {
                    bindPhone:companySet.userInfo.bindPhone,
                    userName:companySet.userInfo.userName,
                    vcode:"",
                    newPasswd:""
                }
                // companySet.userInfo.vcode='';
                // companySet.userInfo.newPasswd='';
                $('#changeAccountPassword').modal('toggle');
            },
            getVcode:function () {
                if(!(/^1[3|4|5|6|7|8][0-9]\d{4,8}$/.test(companySet.userInfo.bindPhone))){
                    layer.msg('请输入正确手机号码!')
                    return
                }
                eap.postWithRequestBody('/api/uum/security/vcode',{
                    uumKey:"auth1b1add36200acd59",
                    phone:companySet.userInfo.bindPhone,
                    type:'2',
                },function (data) {
                    if(data.retcode != '0'){
                        layer.alert(data.retmsg)
                        return
                    }
                    layer.msg('验证码发送成功!')
                })
            },
            submitChangePassword:function () {
                eap.postWithRequestBody('/api/uum/security/authUser',{
                    authAccount:companySet.userInfo.bindPhone,
                    authCode : companySet.userInfo.vcode,
                    authChannel : "phone",
                    extra:[{key:'NEW_PASSWD_',value:md5.calcMD5(companySet.userInfo.newPasswd)}],
                },function (data) {
                    if(data.retcode != '0'){
                        layer.alert(data.retmsg)
                        return
                    }
                    layer.msg("密码修改成功！")
                    $('#changeAccountPassword').modal('hide');
                })
            },
            loadUserInfo : function(){
                eap.postWithRequestBody('/api/uum/user/getUserInfo',{
                    accessToken:sessionStorage.getItem('AccessToken')
                },function (datas) {
                    if(datas.retcode !='0'){
                        layer.msg(datas.retmsg);
                        return;
                    }
                    companySet.userInfo["userName"] = datas.userName;
                    eap.each(datas.binders,function(binder){
                        if(binder.bindType=="phone"){
                            companySet.userInfo["bindPhone"] = binder.bindId;
                        }
                    });
                })
            },
            loadTenantInfo: function(){
                //
                var enterpriseParams = {
                    dataModelName: 'T_UUM_TENANT',
                    accessToken: sessionStorage.getItem('AccessToken'),
                    ID_:eap.parseJson(sessionStorage.getItem('userTenantInfo')).tenantId
                }
                $.ajax({
                    url: '/api/uum/data/query',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    data: enterpriseParams,
                    success: function (datas) {
                        companySet.enterpriseDetail = datas.data[0]
                    },
                    error: function (data) {
                    }
                });
                //
                var accountParams = {
                    dataModelName: 'V_UUM_TENANT_USER',
                    accessToken: sessionStorage.getItem('AccessToken'),
                    TENANT_ID_: eap.parseJson(sessionStorage.getItem('userTenantInfo')).tenantId
                }
                $.ajax({
                    url: '/api/uum/data/query',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    data: accountParams,
                    success: function (datas) {
                        eap.each(datas.data,function (e) {
                            if(eap.isEmpty(e.REMARK_)){
                                e['REMARK_'] = e.USER_NAME_
                            }
                        })
                        companySet.accountList = datas.data
                    },
                    error: function (data) {
                    }
                })
            }
        }
    })
    var changePWD = function () {

    }
    companySetInit = function (params) {
        companySet.loadUserInfo();
        companySet.loadTenantInfo();
    }
    companySetInit()
})