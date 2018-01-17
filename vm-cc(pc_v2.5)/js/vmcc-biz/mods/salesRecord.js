var salesRecordInit;
require(['jquery','eap','vue','codemodel','tools'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:"#section-salesRecord",
        data:{
            orderList:null,
            orderDetailList:{},
            refundOrderDetail:{},
            PAY_STATUS_:"2",
            params:{
                startTime:{},
                endTime:{}
            },
            channel : "",
            orderNo :"",
            goodsName : "",
            pageConfig:{},
            pickupStatus:"",
            sumColumn:{}
        },
        methods:{
            loadRecords : function(params,cb) {
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
                if(vm.params.startTime.time&&vm.params.endTime.time) condition = vm.params.startTime.time+","+vm.params.endTime.time+"@between";
                else if(vm.params.startTime.time&&eap.isEmpty(vm.params.endTime.time)) condition = vm.params.startTime.time+"@ge"
                else if(vm.params.endTime.time&&eap.isEmpty(vm.params.startTime.time)) condition = vm.params.endTime.time+"@le"
                if(condition)params["CREATE_TIME_"] = condition;
                eap.call('shop@query',eap.copyApply({
                    dataModelName:'T_SHOP_ORDER',
                    sum:"PAY_AMOUNT_@SUM_PAY_AMOUNT_",
                    STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                    PAY_STATUS_:vm.PAY_STATUS_,// 过滤未支付订单
                    ORDER_NO_ : vm.orderNo,
                    PAY_CHANNEL_ : vm.channel,
                    CREATE_TIME_:condition||"",
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
                            vm.orderList = datas.data;
                        }
                    }
                })
            },
            showOrderDetail:function (sale) {
                if($("#detail-"+sale.ID_).attr("class").indexOf("hidden")>=0){
                    eap.call("shop@getOrderDetail#"+sale.ID_,{},function (data) {
                        var datas = eap.parseJson(data);
                        if(eap.isEmpty(datas.data)){
                            return;
                        }
                        eap.each(datas.data,function (row) {
                            row['DELIVERY_TYPE_LABEL'] = cm.deliveryType.get(row.DELIVERY_TYPE_);
                            if(row.DELIVERY_TYPE_=="1") {
                                if (row.COUNTER_DEVICE_TYPE_ != 'shelf'){
                                    row['GOODS_NAME_LABEL'] = row.GOODS_NAME_ + " [" + row.COUNTER_NAME_ + " " + row.GOODS_PLACE_NUM_ + "货道]";
                                } else {
                                    row['GOODS_NAME_LABEL'] = row.GOODS_NAME_;
                                }
                                row['STATUS_LABEL'] = cm.pickupStatus.get(row.PICKUP_STATUS_);
                            } else {
                                row['GOODS_NAME_LABEL'] = row.GOODS_NAME_
                                row['STATUS_LABEL'] = cm.deliveryStatus.get(row.DELIVERY_STATUS_);
                            }
                            row.canRefund =(
                                (row.DELIVERY_TYPE_==1 && (row.PICKUP_STATUS_==1 || row.PICKUP_STATUS_==2 || row.PICKUP_STATUS_==4)) ||
                                (row.DELIVERY_TYPE_==2 && (row.DELIVERY_STATUS_==1 || row.DELIVERY_STATUS_==2 || row.DELIVERY_STATUS_==3))
                            ) && row.REFUND_STATUS_ != 2;
                            row['PRICE'] = (row.GOODS_PRICE_*0.01).toFixed(2)
                            row['PRICE_LABEL'] = eap.toMoney(row.COUNT_ * row.GOODS_PRICE_ * 0.01)
                            if(!eap.isEmpty(row.REFUND_TIME_)){
                                row['REFUND_STATUS_LABEL'] = " ["+row.REFUND_REMARK_+" "+row.REFUND_TIME_+"]";
                            }
                        });
                        vm.orderDetailList = datas.data
                    })
                    $("tr.hideCell").addClass('hidden');
                    $("#detail-"+sale.ID_).removeClass('hidden');
                }else{
                    $("#detail-"+sale.ID_).addClass('hidden');
                }
            },
            selectRefund:function (orderDetail) {
                vm.refundOrderDetail = orderDetail;
            },
            submitRefund : function(){
                if(this.refundOrderDetail == null){
                    return ;
                }
                var me = this;
                eap.call("shop@refund",{
                    ORDER_ID_:me.refundOrderDetail.ORDER_ID_,
                    ORDER_DETAIL_ID_:me.refundOrderDetail.ID_,
                    REFUND_REMARK_:me.refundOrderDetail.REFUND_REMARK_,
                },function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.header.RETCODE != '0'){
                        layer.msg(cm.retMsg.get(datas.header.RETCODE))
                        return
                    }
                    $('#SaleRecordRefundForm').modal('hide');
                    vm.showOrderDetail({ID_:me.refundOrderDetail.ORDER_ID_});
                })
            },
            change: function (condition) {
                switch(condition){
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
            doSearch : function(){
                vm.pageLoader();
            },
            pageLoader:function (params,cb) {
                vm.loadRecords(eap.copyApply({
                    limit: vm.pageConfig.pageSize,
                    start: vm.pageConfig.index
                }, params),function(datas){
                    vm.pageConfig.totalCounts = Number(datas.head.COUNT_||0);
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                })
            },
            excelExport:function () {
                var condition;
                if(vm.params.startTime.time&&vm.params.endTime.time) condition = vm.params.startTime.time+","+vm.params.endTime.time+"@between";
                else if(vm.params.startTime.time&&eap.isEmpty(vm.params.endTime.time)) condition = vm.params.startTime.time+"@ge"
                else if(vm.params.endTime.time&&eap.isEmpty(vm.params.startTime.time)) condition = vm.params.endTime.time+"@le"
                eap.call("shop@excel",{
                    title:"销售记录",
                    method:"post",
                    dataModelName:"T_SHOP_ORDER",
                    params:{
                        STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                        CREATE_TIME_:condition||"",
                        PAY_STATUS_:vm.PAY_STATUS_,// 过滤未支付订单
                        ORDER_NO_ : vm.orderNo,
                        PAY_CHANNEL_ : vm.channel,
                        orderBy:'CREATE_TIME_@DESC'
                    }
                })
            }
        }
    })
    salesRecordInit = function(){
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        });
        vm.$refs.start_time.init()
        vm.$refs.end_time.init()
    }
});