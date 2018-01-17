/**
 * Created by apple on 17/12/21.
 */
var deliveryManageInit
require(['jquery','eap','vue','codemodel','tools'],function ($,eap,Vue,cm) {
    var vm = new Vue({
        el:'#section-deliveryManage',
        data:{
            origin:{},
            tenantList:{},
            storeList:{},
            deliveryDetail:{
                details:[],
                REPERTORY_ID_:'',
                TENANT_ID_:'',
                STORE_ID_:'',
                DELIVERY_:'',
                REMARK_:'',
            },
            deliveryList:{},
            params:{
                start_time:{},
                end_time:{}
            },
            goodList:null,
            stocks:{},
            deliveryMans:{},
            pageConfig:{},
            DELIVERY_STATUS_:""
        },
        methods:{
            selectTenant:function (e) {
                var selectOp = vm.tenantList.find(function (op) {
                    return e.target.value==op.ID_
                });
                if(eap.isEmpty(selectOp)){
                    layer.msg('租户不能为空！')
                }else{
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
                    vm.deliveryDetail.TENANT_ID_ =selectOp.ID_
                    vm.deliveryDetail.TENANT_ID_LABEL =selectOp.TENANT_NAME_
                }
            },
            showDetail:function (detail) {
                if($('#'+detail.id).hasClass('hidden')){
                    $('.hideCell').addClass('hidden')
                    $('#'+detail.id).removeClass('hidden')
                }else {
                    $('#'+detail.id).addClass('hidden')
                }
            },
            searchDelivery:function () {
                vm.pageLoader()
            },
            searchGood:function (condition) {
                if (vm.origin.goodList) {
                    var templist = vm.origin.goodList.filter(function (e) {
                        var flag = true;
                        if (typeof condition === 'function') flag = flag && condition(e);
                        return flag;
                    });
                    vm.goodList = templist
                } else {
                    vm.goodList = []
                }
            },
            searchGoodList:function () {
                var condi = eap.copyApply({}, vm.params);
                vm.searchGood(function (e) {
                    return condi.good_condi ? ((e.CODE_.indexOf(condi.good_condi) >= 0 || e.NAME_.indexOf(condi.good_condi) >= 0)&&e.STORE_ID_==vm.deliveryDetail.STORE_ID_) : true;
                })
            },
            addDelivery:function () {
                StockList();
                vm.deliveryDetail = {
                    details:[],
                    REPERTORY_ID_:'',
                    TENANT_ID_:'',
                    STORE_ID_:'',
                    DELIVERY_:'',
                    REMARK_:'',
                }
            },
            openGoodList:function () {
                if(eap.isEmpty(vm.deliveryDetail.STORE_ID_)){
                    layer.msg('请选择门店!')
                    return
                }
                eap.post("/api/shop/data/query",{
                    dataModelName:"V_SHOP_GOODS",
                    STORE_ID_:vm.deliveryDetail.STORE_ID_
                },function (data) {
                    var datas = eap.parseJson(data);
                    vm.origin.goodList = datas.data;
                })
                vm.checkboxGoodList = [];
                vm.searchGood(function (e) {
                    return vm.deliveryDetail.details ? vm.deliveryDetail.details.map(function (v) {
                        return v.CODE_
                    }).indexOf(e.CODE_) < 0 && e.STORE_ID_==vm.deliveryDetail.STORE_ID_ : true
                })
            },
            submitDeliveryGoodList:function () {
                layer.confirm('确认要添加这些商品[' + vm.checkboxGoodList.map(function (v) {
                    return v.NAME_
                }).join(',') + ']吗?', function () {
                    eap.each(vm.checkboxGoodList, function (e) {
                        vm.deliveryDetail.details.push(eap.copyApply(e, {
                            requestCount: 1
                        }))
                    });
                    $('#deliverySelectGoods').modal('hide');
                    layer.msg("添加成功!");
                })
            },
            delDetailsItem:function (item) {
                vm.deliveryDetail.details.splice(vm.deliveryDetail.details.findIndex(function (e) {
                    return e.CODE_ == item.CODE_
                }), 1);
            },
            selectDeliveryMan:function (e) {
                var selectOp = vm.deliveryMans.find(function (op) {
                    return e.target.value == op.REMARK_
                });
                if(selectOp){
                    vm.deliveryDetail.DELIVERY_MAN_LABEL = selectOp.REMARK_
                    vm.deliveryDetail.DELIVERY_ = selectOp.ID_
                    vm.deliveryDetail.DELIVERY_NAME_ = selectOp.REMARK_
                }
            },
            selectStock:function (e) {
                var selectOp = vm.stocks.find(function (op) {
                    return e.target.value==op.code
                });
                if(selectOp){
                    vm.deliveryDetail.REPERTORY_ID_ = selectOp.id
                    vm.deliveryDetail.STOCK_NAME_LABEL = selectOp.name
                }
            },
            selectStore:function (e) {
                var selectOp = vm.storeList.find(function (op) {
                    return e.target.value == op.NAME_
                })
                if(selectOp){
                    vm.deliveryDetail.STORE_NAME_LABEL = selectOp.NAME_
                    vm.deliveryDetail.STORE_ID_ = selectOp.ID_
                }
            },
            submitDelivery:function () {
                if(eap.isEmpty(vm.deliveryDetail.REPERTORY_ID_)){
                    layer.msg('请选择仓库!')
                    return
                }
                if(eap.isEmpty(vm.deliveryDetail.DELIVERY_)){
                    layer.msg('请选择送货人!')
                    return
                }
                if(eap.isEmpty(vm.deliveryDetail.TENANT_ID_)){
                    layer.msg('请选择商户!')
                    return
                }
                var DETAIL_ = []
                eap.each(vm.deliveryDetail.details,function (e) {
                    DETAIL_.push(e.CODE_+'_'+e.requestCount)
                })
                eap.post('/api/shop/oper/delivery',{
                    REPERTORY_ID_:vm.deliveryDetail.REPERTORY_ID_,
                    TENANT_ID_:vm.deliveryDetail.TENANT_ID_,
                    STORE_ID_:vm.deliveryDetail.STORE_ID_,
                    DELIVERY_:vm.deliveryDetail.DELIVERY_,
                    DELIVERY_NAME_:vm.deliveryDetail.DELIVERY_NAME_,
                    REMARK_:vm.deliveryDetail.remark,
                    DETAIL_:DETAIL_.join()
                },function (data) {
                    var datas =eap.parseJson(data)
                    if(datas.head.RETCODE == '0'){
                        //DeliveryList()
                        vm.pageLoader()
                        $('#deliveryId').modal('hide')
                        return
                    }
                    layer.msg(cm.retMsg.get(datas.head.RETCODE))
                })
            },
            pageLoader: function (params,cb) {
                params = eap.copyApply(vm.pageConfig,params);
                var condition;
                if(vm.params.start_time.time&&vm.params.end_time.time) condition = "Date#"+
                    vm.params.start_time.time+","+vm.params.end_time.time+"@between";
                else if(vm.params.start_time.time&&eap.isEmpty(vm.params.end_time.time)) condition =  "Date#"+vm.params.start_time.time+"@ge"
                else if(vm.params.end_time.time&&eap.isEmpty(vm.params.start_time.time)) condition =  "Date#"+vm.params.end_time.time+"@le"
                if(condition)params[".requestTime"] = condition;
                DeliveryList(eap.copyApply({
                    ".limit": vm.pageConfig.pageSize,
                    ".start": vm.pageConfig.index
                },params), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.header.COUNT_)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            }
        }
    })
    //商户查询
    var TenantList = function () {
        eap.post("/api/uum/data/query",{
            dataModelName:"T_UUM_TENANT",
            ignoreTenant:true
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas.data){
                vm.origin.tenantList = datas.data
                vm.tenantList = datas.data;
            }
        })
    }
    //采购单查询
    var DeliveryList = function (params,cb) {
        eap.post('/api/delivery/query',eap.copyApply(params,{
            className:'deliveryNote',
            '.orderBy':'requestTime@desc',
            '.bizType':'platform',
            ".extra.STORE_NAME_":vm.params.STORE_NAME_,
            '.stauts':vm.DELIVERY_STATUS_
        }),function (data) {
            var datas = eap.parseJson(data)
            if(datas.data){
                eap.each(datas.data,function (e) {
                    var tenantName = vm.origin.tenantList.filter(function (ee) {
                        return ee.ID_ == e.extra.TENANT_ID_
                    })
                    if(!eap.isEmpty(tenantName)){
                        e['tenantName'] = tenantName[0].TENANT_NAME_
                    }
                    e['storeName'] = e.extra.STORE_NAME_
                    e['stauts_label'] = cm.deliveryStatus.get(e.stauts)
                    e['requestTime'] = eap.dateFormat(new Date(e.requestTime),'yyyy-MM-dd hh:mm:ss')
                })
                vm.deliveryList = datas.data
                if(eap.isFunction(cb))cb(datas);
            }
        })
    }
    //选择的所有仓库
    var StockList = function () {
        eap.post('/api/stock/data/query',{
            className:'stockRepertory',
            '._id':'notNull@notNull',
            '.bizType':'platform'
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas.header.RETCODE != '0'){
                layer.msg(cm.get(datas.header.RETCODE))
                return
            }
            vm.origin.stocks = datas.data
            vm.stocks = datas.data
        })
    }
    //选择送货人
    var DeliveryManList = function () {
        eap.post("/api/uum/data/query",{
            dataModelName: 'V_UUM_TENANT_USER',
            TENANT_ID_:'t00000001'
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas.data){
                vm.deliveryMans = datas.data
            }
        })
    }
    deliveryManageInit = function () {
        //GoodsList()
        TenantList()
        //DeliveryList()
        DeliveryManList();
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        });
        vm.$refs.start_time.init()
        vm.$refs.end_time.init()
    }
})