/**
 * Created by 123456 on 2017/12/19.
 */
var salesRecordInit;
require(['jquery','eap','vue','codemodel','layer','tools'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-salesRecord',
        data:{
            orderLists:{},
            orderDetailLists:{},
            refundOrderDetaill:{},
            PAY_STATUS_:"2",
            startTime:null,
            endTime:null,
            channel : "",
            orderNo :"",
            goodsName : "",
            storeId:'',
            tenantId:'',
            tenantList:[],
            storeList:[],
            pageConfig:{},
            date:{
                startTime:{},
                endTime:{}
            },
            sumColumn:{}
        },
        methods:{
            loadRecords : function(params,cb){
                cb = cb || eap.emptyFn;
                params = params||{}
                var goodsName = vm.goodsName;
                var pickupStatus = vm.pickupStatus;
                if (!eap.isEmpty(goodsName) || !eap.isEmpty(pickupStatus)) {
                    var detailFilter = "T_SHOP_ORDER_DETAIL->ORDER_ID_?1=1";
                    if (!eap.isEmpty(goodsName)) {//关联查询
                        if (isNaN(parseFloat(goodsName))) {
                            detailFilter += "&GOODS_NAME_=%" + goodsName + "%#like";
                        } else {
                            detailFilter += "&GOODS_CODE_=" + goodsName ;
                        }
                    }
                    if (!eap.isEmpty(vm.pickupStatus)) {
                        detailFilter += "&PICKUP_STATUS_=" + vm.pickupStatus ;
                    }
                    params["ID_"] = detailFilter + "@exist";
                }
                var condition;
                if(vm.date.startTime.time&&vm.date.endTime.time) condition = vm.date.startTime.time+","+vm.date.endTime.time+"@between";
                else if(vm.date.startTime.time&&eap.isEmpty(vm.date.endTime.time)) condition = vm.date.startTime.time+"@ge"
                else if(vm.date.endTime.time&&eap.isEmpty(vm.date.startTime.time)) condition = vm.date.endTime.time+"@le"
                if(condition)params["CREATE_TIME_"] = condition;
                eap.call('shop@query',eap.copyApply({
                    dataModelName:'V_SHOP_ORDER',
                    sum:"PAY_AMOUNT_@SUM_PAY_AMOUNT_",
                    PAY_STATUS_:vm.PAY_STATUS_,
                    ORDER_NO_ : vm.orderNo,
                    PAY_CHANNEL_ : vm.channel,
                    STORE_ID_:vm.storeId,
                    TENANT_ID_:vm.tenantId,
                    orderBy:'CREATE_TIME_@DESC'
                },params),function (data) {
                    var datas = eap.parseJson(data);
                    if(datas){
                        vm.sumColumn ={
                            SUM_PAY_AMOUNT_LABEL:eap.toMoney(datas.head.SUM_PAY_AMOUNT_*0.01),
                        }
                        cb(datas);
                        if(datas.data){
                            eap.each(datas.data,function (e) {
                                e['PAY_AMOUNT_LABEL'] = eap.toMoney(e.PAY_AMOUNT_ * 0.01);
                                e['PAY_STATUS_LABEL'] = cm.payState.get(e.PAY_STATUS_);
                                e['PAY_CHANNEL_LABEL'] = cm.payChannel.get(e.PAY_CHANNEL_);
                            });
                            vm.orderLists = datas.data;
                        }
                    }
                })
            },
            showOrderDetail:function (sale) {
                if($("#detaill-"+sale.ID_).attr("class").indexOf("hidden")>=0){
                    $.ajax({
                        url:'/api/shop/order/'+sale.ID_+'/getOrderDetail',
                        type:'POST', dataType:'json', async :false,
                        data:{
                            accessToken:sessionStorage.getItem('AccessToken')
                        },
                        success:function (datas) {
                            if(eap.isEmpty(datas.data)){
                                return;
                            }
                            eap.each(datas.data,function (row) {
                                row['DELIVERY_TYPE_LABEL'] = cm.deliveryType.get(row.DELIVERY_TYPE_);
                                if(row.DELIVERY_TYPE_=="1") {
                                    if (row.COUNTER_DEVICE_TYPE_ != 'shelf'){
                                        row['GOODS_NAME_LABEL'] = row.GOODS_NAME_ + "[" + row.COUNTER_NAME_ + "  " + row.GOODS_PLACE_NUM_+ "货道]";
                                    } else {
                                        row['GOODS_NAME_LABEL'] = row.GOODS_NAME_;
                                    }
                                    row['STATUS_LABEL'] = cm.pickupStatus.get(row.PICKUP_STATUS_);
                                } else {
                                    row['GOODS_NAME_LABEL'] = row.GOODS_NAME_
                                    row['STATUS_LABEL'] = cm.deliveryStatus.get(row.DELIVERY_STATUS_);
                                }
                                row.canRefund =
                                    (
                                        (row.DELIVERY_TYPE_==1 && (row.PICKUP_STATUS_==1 || row.PICKUP_STATUS_==2 || row.PICKUP_STATUS_==4)) ||
                                        (row.DELIVERY_TYPE_==2 && (row.DELIVERY_STATUS_==1 || row.DELIVERY_STATUS_==2 || row.DELIVERY_STATUS_==3))
                                    ) && row.REFUND_STATUS_ != 2;
                                row['PRICE'] = eap.toMoney(row.GOODS_PRICE_*0.01)
                                row['PRICE_LABEL'] = eap.toMoney(row.COUNT_ * row.GOODS_PRICE_ * 0.01)
                                if(!eap.isEmpty(row.REFUND_TIME_)){
                                    row['REFUND_STATUS_LABEL'] = " ["+row.REFUND_REMARK_+" "+row.REFUND_TIME_+"]";
                                }
                            });
                            vm.orderDetailLists = datas.data
                        }
                    })
                    $("tr.hideCell").addClass('hidden');
                    $("#detaill-"+sale.ID_).removeClass('hidden');
                }else{
                    $("#detaill-"+sale.ID_).addClass('hidden');
                }
            },
            selectRefund:function (orderDetail) {
                vm.refundOrderDetaill = orderDetail;
            },
            change: function (flag) {
                switch(flag){
                    case "normal":
                        vm.PAY_STATUS_="2";
                        vm.pickupStatus="3";
                        break;
                    case "abnormal":
                        vm.PAY_STATUS_="1@not";
                        vm.pickupStatus="1,2,4#in";
                        break;
                    case "renew":
                        vm.pickupStatus="5";
                        break;
                    case "refund":
                        vm.PAY_STATUS_="3";
                        break;
                    default://all
                        vm.pickupStatus="";
                        vm.PAY_STATUS_="1@not";
                }
                vm.pageLoader();
            },
            submitRefund : function(){
                if(this.refundOrderDetaill == null){
                    return ;
                }
                var me = this;
                eap.post('/api/shop/oper/refund',{
                    ORDER_ID_:me.refundOrderDetaill.ORDER_ID_,
                    ORDER_DETAIL_ID_:me.refundOrderDetaill.ID_,
                    REFUND_REMARK_:me.refundOrderDetaill.REFUND_REMARK_,
                },function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.header.RETCODE != '0'){
                        layer.msg(cm.retMsg.get(datas.header.RETCODE))
                        return
                    }
                    $('#SaleRecordRefundForml').modal('hide');
                    vm.showOrderDetail({ID_:me.refundOrderDetaill.ORDER_ID_});
                })
            },
            doSearch : function(){
                vm.pageLoader();
            },
            TenantList : function () {
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
            selectTenant:function () {
                eap.post('/api/shop/data/query',{
                    dataModelName:'V_SHOP_STORE',
                    TENANT_ID_:vm.tenantId,
                    ignoreTenant:true
                },function (data) {
                    var datas = eap.parseJson(data)
                    if(!eap.isEmpty(datas.data)){
                        vm.storeList = datas.data
                        vm.storeId = vm.storeList[0].ID_
                        // vm.pageLoader();
                    }
                })
            },
            pageLoader:function (params,cb) {
                vm.loadRecords(eap.copyApply({
                    limit: vm.pageConfig.pageSize,
                    start: vm.pageConfig.index
                },params), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.head.COUNT_||0)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            }
        }
    });
    salesRecordInit = function(){
        vm.TenantList()
        vm.$refs.startTime.init()
        vm.$refs.endTime.init()
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        })
    }
});