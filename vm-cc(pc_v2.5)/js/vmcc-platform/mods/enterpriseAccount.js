/**
 * Created by apple on 17/11/16.
 */
var enterpriseAccountInit
require(['jquery','vue','eap','layer','md5'],function ($,Vue,eap,layer,md5) {
    var vm = new Vue({
        el:"#section-enterpriseAccount",
        data:{
            inviteInfo:{},
            enterpriseList:{},
            params:{},
            enterpriseDetail:{},
            createEnterprise:{},
            accountList:{},
            accountDetail:{},
            tenantId:null,
            accountInfo:{},
            origin:{},
            findAccountList:null,
            roleList:["Admin","Operator","Finance"],
            checkboxRoleList:[],
            paySet:{
                tenantId:"",
                tenantName:"",
                appId:"",
                alipayPrivateKey:"",
                alipayAappid:"",
                alipayPublickey:"",
                wxpayMchid:"",
                wxpayAppid:"",
                wxpaySecret:"",
                wxpayKey:"",
                wxpayapiClientCert:"",
                wxpayApiclientKey:""
            }
        },
        methods:{
            modifyEnterprise:function (enterprise) {
                $('#modifyEnterPrise').modal('toggle')
                if(enterprise){
                    vm.enterpriseDetail = enterprise
                }
            },
            submitModifyEnterprise:function () {
                var params = eap.copyApply({
                    dataModelName:'T_UUM_TENANT',
                    accessToken: sessionStorage.getItem('AccessToken')
                },vm.enterpriseDetail)
                $.ajax({
                    url: '/api/uum/data/crud',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    data: params,
                    success: function (datas) {
                        if(datas.head.RETCODE != '0'){
                            layer.msg(datas.head.RETMSG)
                        }
                        $("#modifyEnterPrise").modal('hide')
                    },
                    error: function (data) {
                    }
                })
            },
            submitCreateEnterprise:function () {
                vm.createEnterprise.adminPasswd = md5.calcMD5(vm.createEnterprise.adminPasswd)
                var params = eap.copyApply({
                    accessToken: sessionStorage.getItem('AccessToken')
                },vm.createEnterprise)
                $.ajax({
                    url:'/api/uum/tenant/createTenant',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(params),
                    success: function (datas) {
                        enterpriseList()
                        $('#createEnterPriseAccount').modal('hide')
                    },
                    error: function (data) {
                    }
                })
            },
            createEnterpriseAccount:function () {
                $('#createEnterPriseAccount').modal('toggle');
                vm.createEnterprise = {}
            },
            SonAccountManage:function (enterprise) {
                $('#SonAccountManage').modal('toggle')
                vm.tenantId = enterprise.ID_
                AccountList({
                    TENANT_ID_:enterprise.ID_
                },function () {
                    vm.accountList = vm.origin.accountList;
                })
            },
            createSonAccountManage:function () {
                $('#createSonAccountManage').modal('toggle')
                vm.accountDetail = {
                    userPhone :" ",
                    remark :" "
                }
            },
            submitSonAccount:function () {
                if(!(/^1[3|4|5|6|7|8][0-9]\d{4,8}$/.test(vm.accountDetail.account))){
                    layer.msg("请输入正确电话号码!");
                    return
                }
                var phoneNo = vm.accountDetail.account;
                var noLength = phoneNo.length;
                var defPwd = md5.calcMD5(phoneNo.substring(noLength - 6,noLength));
                var params = {
                    tenantId:vm.tenantId,
                    tenantRoles:'Admin',
                    authAccount:vm.accountDetail.account,
                    authChannel:"phone",
                    remark:vm.accountDetail.remark,
                    extra:[{key:"PASSWD_",value:defPwd}]
                }
                $.ajax({
                    url:'/api/uum/security/createAccount',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(params),
                    success: function (datas) {
                        if(datas.retcode != '0'){
                            layer.msg(datas.retmsg)
                            return
                        }
                        $('#createSonAccountManage').modal('hide')
                        var param = {
                            dataModelName: 'V_UUM_TENANT_USER',
                            accessToken: sessionStorage.getItem('AccessToken'),
                            TENANT_ID_:vm.tenantId
                        }
                        $.ajax({
                            url: '/api/uum/data/query',
                            type: 'POST',
                            dataType: 'json',
                            async: false,
                            data: param,
                            success: function (datas) {
                                vm.accountList = datas.data
                            },
                            error: function (data) {
                            }
                        })
                    },
                    error: function (data) {
                        layer.msg(data)
                    }
                })
            },
            modifyAccount:function (account) {
                $('#modifyAccountManage').modal('toggle')
                vm.accountInfo = account
            },
            submitModifyAccount:function () {
                var params = {
                    dataModelName:'T_UUM_TENANT_USER',
                    accessToken: sessionStorage.getItem('AccessToken'),
                    ID_:vm.accountInfo.ID_,
                    SECURITY_PHONE_:vm.accountInfo.SECURITY_PHONE_,
                    REMARK_:vm.accountInfo.REMARK_
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
                        $("#modifyAccountManage").modal('hide')
                    }
                })
            },
            deleteAccount:function (account) {
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
                            var param = {
                                dataModelName: 'V_UUM_TENANT_USER',
                                accessToken: sessionStorage.getItem('AccessToken'),
                                TENANT_ID_:vm.tenantId
                            }
                            $.ajax({
                                url: '/api/uum/data/query',
                                type: 'POST',
                                dataType: 'json',
                                async: false,
                                data: param,
                                success: function (datas) {
                                    eap.each(datas.data,function (e) {
                                        if(eap.isEmpty(e.REMARK_)){
                                            e['REMARK'] = e.USER_NAME_
                                        }
                                    })
                                    vm.accountList = datas.data
                                },
                                error: function (data) {
                                }
                            })
                        },
                        error: function (data) {
                        }
                    })
                })
            },
            search:function () {
                var conditions = eap.copyApply({},vm.params);
                vm.enterpriseList = vm.origin.enterpriseList.filter(function (e) {
                    var flag = true;
                    if(conditions.TENANT_NAME_) flag=flag&&e['TENANT_NAME_'].indexOf(conditions.TENANT_NAME_)>=0;
                    return flag;
                })

            },
            showPaySetView:function (enterprise) {
                vm.paySet = {}
                vm.paySet.tenantId = enterprise.ID_
                vm.paySet.tenantName = enterprise.TENANT_NAME_
                $('#paySetId').modal('toggle')
                eap.postWithRequestBody('/api/upay/config/getAppInfo',{
                    appCode:enterprise.ID_,
                    include:'channels',
                },function (data) {
                    var datas=eap.parseJson(data)
                    vm.paySet.appId = datas.appKey
                    if(datas.channels){
                        eap.each(datas.channels,function (e) {
                            if(e.type == "alipay_wap"){
                                eap.each(e.extra,function (ee) {
                                    switch (ee.key){
                                        case 'privateKey':
                                            vm.paySet.alipayPrivateKey = ee.value;
                                            break;
                                        case "appid":
                                            vm.paySet.alipayAappid = ee.value;
                                            break;
                                        case "publickey":
                                            vm.paySet.alipayPublickey = ee.value;
                                            break;
                                        default:
                                            break;
                                    }

                                })
                            }else if(e.type == 'wx_pub'){
                                eap.each(e.extra,function (ee) {
                                    switch (ee.key){
                                        case 'mchid':
                                            vm.paySet.wxpayMchid = ee.value;
                                            break;
                                        case "appid":
                                            vm.paySet.wxpayAppid = ee.value;
                                            break;
                                        case "secret":
                                            vm.paySet.wxpaySecret = ee.value;
                                            break;
                                        case 'key':
                                            vm.paySet.wxpayKey = ee.value;
                                            break;
                                        case "apiclient_cert":
                                            vm.paySet.wxpayapiClientCert = ee.value;
                                            break;
                                        case "apiclient_key":
                                            vm.paySet.wxpayApiclientKey = ee.value;
                                            break
                                        default:
                                            break;
                                    }
                                })
                            }
                        })
                    }
                },'text')
            },
            submitPayKeyButton:function () {
                if($('#aliPaySet').hasClass('active')){
                    if(eap.isEmpty(vm.paySet.alipayPrivateKey) || eap.isEmpty(vm.paySet.alipayAappid) || eap.isEmpty(vm.paySet.alipayPublickey)){
                        layer.msg('请填写完整支付宝相关信息!')
                        return
                    }
                    layer.confirm("支付信息变更会影响用户使用，请谨慎操作!",{btn:["确认","取消"]},function (index) {
                        layer.close(index);
                        eap.postWithRequestBody('/api/upay/config/updateAppInfo',{
                            appCode:vm.paySet.tenantId,
                            appName:vm.paySet.tenantName,
                            channels :[{
                                type:"alipay_wap",
                                extra :[
                                    {key:"privateKey",value:vm.paySet.alipayPrivateKey},
                                    {key:"appid",value:vm.paySet.alipayAappid},
                                    {key:"publickey",value:vm.paySet.alipayPublickey}
                                ]
                            }]
                        },function (data) {
                            $('#paySetId').modal('hide')
                            if(data.retcode != '0'){
                                layer.msg(data.retmsg)
                                return
                            }
                            layer.msg(data.retmsg)
                        },'json')
                    })
                }else if($('#wxPayset').hasClass('active')){
                    if(eap.isEmpty(vm.paySet.wxpayMchid) || eap.isEmpty(vm.paySet.wxpayAppid) || eap.isEmpty(vm.paySet.wxpaySecret)
                        ||eap.isEmpty(vm.paySet.wxpayKey) || eap.isEmpty(vm.paySet.wxpayapiClientCert) || eap.isEmpty(vm.paySet.wxpayApiclientKey)){
                        layer.msg('请填写完整微信相关信息!')
                        return
                    }
                    layer.confirm("支付信息变更会影响用户使用，请谨慎操作!",{btn:["确认","取消"]},function (index) {
                        layer.close(index);
                        eap.postWithRequestBody('/api/upay/config/updateAppInfo',{
                            appCode:vm.paySet.tenantId,
                            appName:vm.paySet.tenantName,
                            channels :[{
                                type:"wx_pub",
                                extra :[
                                    {key:"mchid",value:vm.paySet.wxpayMchid},
                                    {key:"appid",value:vm.paySet.wxpayAppid},
                                    {key:"secret",value:vm.paySet.wxpaySecret},
                                    {key:"key",value:vm.paySet.wxpayKey},
                                    {key:"apiclient_cert",value:vm.paySet.wxpayapiClientCert},
                                    {key:"apiclient_key",value:vm.paySet.wxpayApiclientKey}
                                ]
                            }]
                        },function (data) {
                            $('#paySetId').modal('hide')
                            if(data.retcode != '0'){
                                layer.msg(data.retmsg)
                                return
                            }
                            layer.msg(data.retmsg)
                        },'json')
                    })
                }
            },
            showAliPaySetView:function () {
                $('#aliPayHeader').addClass('active')
                $('#aliPaySet').addClass('active')
                $('#wxPayHeader').removeClass('active')
                $('#wxPayset').removeClass('active')
            },
            showWxPaysetView:function () {
                $('#wxPayset').addClass('active')
                $('#wxPayHeader').addClass('active')
                $('#aliPaySet').removeClass('active')
                $('#aliPayHeader').removeClass('active')
            },
            visitMemberButton:function () {
                vm.inviteInfo ={};
                vm.checkboxRoleList=[]
            },
            findAccount:function () {
                eap.postWithRequestBody('/api/uum/security/findAccount',{
                    account:vm.inviteInfo.account
                },function (datas) {
                    eap.each(datas.users,function (e) {
                        e['value'] = e.extra[0].value
                    })
                    vm.findAccountList = datas.users
                })
            },
            selectAccont:function (account) {
                vm.inviteInfo = eap.copyApply(account,{
                    remark:account.userName,
                    account:account.userName
                });
                vm.findAccountList = []
            },
            selectRole:function () {
                vm.inviteInfo.tenantRoles = vm.checkboxRoleList.join("_")
            },
            sendInvited:function () {
                if(eap.isEmpty(vm.inviteInfo)){
                    layer.msg('请选择运营者!')
                    return
                }
                eap.postWithRequestBody('/api/uum/tenant/inviteUser',eap.copyApply(vm.inviteInfo,{
                    tenantId:vm.tenantId,
                }),function (datas) {
                    if(datas.retcode != 0){
                        layer.msg(datas.retmsg)
                    }else{
                        $('#inviteMemberInfo').modal('hide')
                        AccountList({
                            TENANT_ID_:vm.tenantId
                        },function () {
                            vm.accountList = vm.origin.accountList;
                        })
                    }
                })
            }
        }
    })
    var AccountList = function (params,cb) {
        eap.post("/api/uum/data/query",eap.copyApply({
            dataModelName: 'V_UUM_TENANT_USER',
        },params),function (data) {
            var datas = eap.parseJson(data);
            if(datas.data){
                vm.origin.accountList = datas.data;
            }
            if(typeof cb==="function")cb();
        })
    }
    var enterpriseList = function (params) {
        params = eap.copyApply({
            dataModelName: 'T_UUM_TENANT',
            accessToken: sessionStorage.getItem('AccessToken'),
        },vm.params)
        $.ajax({
            url: '/api/uum/data/query',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: params,
            success: function (datas) {
                if(datas.head.RETCODE != '0'){
                    layer.msg(datas.head.RETMSG)
                }
                vm.enterpriseList = datas.data
                vm.origin.enterpriseList = datas.data
            },
            error: function (data) {
            }
        })
    }

    enterpriseAccountInit =function () {
        enterpriseList()
    }
})