/**
 * Created by only on 2016/10/23.
 */
var deviceSetInit;
require(['jquery','eap','vue','codemodel','utils','datetimepicker','tools'],function($,eap,Vue,cm,utils){
    var vm = new Vue({
        el:'#section-deviceSet',
        data:{
            params:{},
            origin:{},
            deviceList:null,
            tenantList:null,
            deviceDetail:{},
            selectOptions:{},
            storeList:{},
            storeDetail:{},
            tenantId:null,
            deviceStatic:{},
            USE_STATUS_:'',
            pageConfig:{},
        },
        methods:{
            changeTab:function (status) {
                this.USE_STATUS_ = status
                vm.pageLoader();
            },
            addDevice:function() {
                vm.deviceDetail = {
                    title:"添加设备",
                    type:"new",
                }
            },
            editDevice:function (device) {
                vm.deviceDetail = eap.copyApply(device,{
                    title:'编辑设备['+device.DEVICE_CODE_+']',
                    type:"edit",
                })
            },
            searchDevice:function () {
                // var con = vm.params.search_condition;
                // vm.search(function (e) {
                //     return con?(e.DEVICE_CODE_.indexOf(con)>=0||e.DEVICE_NAME_.indexOf(con)>=0||e.DEVICE_SN_.indexOf(con)>=0):true
                // })
                vm.pageLoader()
            },
            stopDevice:function (device) {
                eap.post("/api/shop/data/crud",eap.copyApply(device,{
                    dataModelName:"T_SHOP_DEVICE",
                    USE_STATUS_:"2"
                }),function () {
                    layer.msg("停用成功!")
                    vm.pageLoader();
                })
            },
            startDevice:function (device) {
                eap.post("/api/shop/data/crud",eap.copyApply(device,{
                    dataModelName:"T_SHOP_DEVICE",
                    USE_STATUS_:"1"
                }),function () {
                    layer.msg("启用成功!")
                    vm.pageLoader();
                })
            },
            submitDevice:function (device) {
                if(device){
                    if(eap.isEmpty(device.ID_,false)){//新建
                        device['USE_STATUS_']=1;
                    }
                    if(eap.isEmpty(device.DEVICE_SN_,false)){
                        layer.msg('请填写设备序列号');
                        return;
                    }
                    eap.post("/api/shop/data/crud",eap.copyApply(device,{
                        dataModelName:"T_SHOP_DEVICE",
                    }),function (data) {
                        var datas = eap.parseJson(data);
                        layer.msg(datas.head.RETMSG);
                        $('#add_device_info').modal('hide');
                        vm.pageLoader()
                    })
                }
            },
            selectTenant:function (e) {
                var selectOp = vm.tenantList.find(function (op) {
                    return e.target.value==op.ID_
                });
                if(eap.isEmpty(selectOp)){
                    layer.msg('租户不能为空！')
                    vm.deviceDetail.STORE_NAME_ = ''
                    vm.storeList = null
                }else{
                    vm.tenantId = selectOp.ID_
                    eap.postWithRequestBody('/api/uum/user/changeTenant',{
                        tenantId:selectOp.ID_
                    },function (datas){
                        if(datas){
                            $.ajax({
                                url:'/api/shop/data/query',
                                type:'POST',
                                async:false,
                                dataType:'json',
                                data:{
                                    dataModelName:'V_SHOP_STORE',
                                    accessToken:datas.accessToken
                                },
                                success:function (datas) {
                                    vm.storeList = datas.data
                                },
                            })
                        }
                    })
                }
                if(selectOp){
                    vm.deviceDetail.TENANT_ID_ =selectOp.ID_
                    vm.deviceDetail.TENANT_ID_LABEL =selectOp.TENANT_NAME_
                }
            },
            selectStore:function () {

            },
            addStoreButton:function () {
                if(eap.isEmpty(vm.tenantId)){
                    layer.msg('请先选择商户!')
                    return
                }
                vm.storeDetail = {}
                $('#deviceSetAddStoreId').modal('toggle')
            },
            submitDeviceAddStore:function () {
                if(eap.isEmpty(vm.storeDetail.NAME_)){
                    layer.msg('门店名称不能为空!')
                    return
                }
                if(eap.isEmpty(vm.storeDetail.PAY_KEY_)){
                    layer.msg('支付key不能为空!')
                    return
                }
                vm.storeDetail.NET_FLAG_ = vm.storeDetail.NET_FLAG_ ? '1' :'0'
                var storeModel = eap.copyApply(vm.storeDetail,{
                    TENANT_ID_ : vm.tenantId,
                    className:'shopStore'
                })
                eap.post('/api/shop/store/create',storeModel,function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.head.RETCODE != '0'){
                        layer.msg(datas.head.RETMSG)
                        return
                    }
                    vm.$set(vm.deviceDetail,'STORE_NAME_',vm.storeDetail.NAME_)
                    $('#deviceSetAddStoreId').modal('hide')
                })
            },
            loadTenant:function () {
                eap.post("/api/uum/data/query",{
                    dataModelName:"T_UUM_TENANT",
                    ignoreTenant:true
                },function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.data){
                        vm.tenantList = datas.data;
                    }
                })
            },
            deviceSetSelectTenant:function (e) {
                // var selectOp = vm.tenantList.find(function (op) {
                //     return e.target.value==op.TENANT_NAME_
                // });
                // if(selectOp){
                //     vm.params.tenantId = selectOp.ID_
                //     vm.params.tenantId_label = selectOp.TENANT_NAME_
                // }
                vm.pageLoader()
            },
            loadRecords:function (params,cb) {
                var deviceCode,deviceName
                if(!eap.isEmpty(vm.params.searchCondition)){
                    if( /.*[\u4e00-\u9fa5]+.*$/.test(vm.params.searchCondition)){
                        deviceName = vm.params.searchCondition;
                        deviceCode = '';
                    } else {
                        deviceName = '';
                        deviceCode = vm.params.searchCondition;
                    }
                } else {
                    deviceCode = ''
                    deviceName = ''
                }
                cb = cb || eap.emptyFn;
                eap.call('shop@query',eap.copyApply(params,{
                    dataModelName:"T_SHOP_DEVICE",
                    ignoreTenant:true,
                    USE_STATUS_:vm.USE_STATUS_, //tab标签删选
                    DEVICE_CODE_:deviceCode,
                    DEVICE_NAME_:deviceName,
                    TENANT_ID_:vm.params.tenantId
                }),function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.data){
                        eap.each(datas.data,function (e) {
                            var tenant = vm.tenantList.find(function (t) {
                                return t.ID_==e.TENANT_ID_
                            })
                            e["TENANT_ID_LABEL"] = tenant?tenant.TENANT_NAME_:"";
                            e["USE_STATUS_LABEL"] = cm.deviceState.get(e.USE_STATUS_)
                            e["DEVICE_TYPE_LABEL"] = cm.deviceType.get(e.DEVICE_TYPE_)
                            e["DEVICE_MODEL_LABEL"] = cm.deviceModel.get(e.DEVICE_MODEL_)
                        })
                        cb(datas);
                        vm.deviceList = datas.data
                    }
                })

            },
            pageLoader:function (params,cb) {
                var condition;
                params = params||{};
                vm.loadRecords(eap.copyApply({
                    limit: vm.pageConfig.pageSize,
                    start: vm.pageConfig.index
                }, params),function(datas){
                    vm.pageConfig.totalCounts = Number(datas.head.COUNT_);
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                })
            }
        }
    });
    var deviceStatic = function () {
        eap.call('shop@query',{
            dataModelName:"T_SHOP_DEVICE",
            ignoreTenant:true,
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas.data){
                vm.deviceStatic.count = datas.head.COUNT_
                var enableCount = datas.data.filter(function (e) {
                    return e.USE_STATUS_ == '1'
                })
                vm.deviceStatic.enableCount = enableCount.length
                var disableCount = datas.data.filter(function (e) {
                    return e.USE_STATUS_ == '2'
                })
                vm.deviceStatic.disableCount = disableCount.length
            }
        })
    }
    deviceSetInit = function () {
        vm.loadTenant()
         deviceStatic()
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        });
        vm.selectOptions.typeOptions = cm.deviceType.toJsonObject();
        vm.selectOptions.modelOptions = cm.deviceModel.toJsonObject();
        vm.selectOptions.telecomTypeOps = cm.deviceTelecomType.toJsonObject();
        //时间控件
        $('#productDatetimePicker').datetimepicker({
            minView:2,
            autoclose: true,
            todayBtn: true,
            language:'cn',
        }).on('changeDate',function (e) {
            if(vm.deviceDetail.PRODUCTION_DATE_){
                vm.deviceDetail.PRODUCTION_DATE_ = eap.dateFormat(e.date,'yyyy-MM-dd 00:00:00');
            }else{
                vm.$set(vm.deviceDetail,"PRODUCTION_DATE_",eap.dateFormat(e.date,'yyyy-MM-dd 00:00:00'));
            }
        })
    }
});