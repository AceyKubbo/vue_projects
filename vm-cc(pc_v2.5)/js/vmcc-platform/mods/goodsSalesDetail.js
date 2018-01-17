/**
 * Created by only on 2016/10/23.
 */
var goodsSalesDetailInit;
require(['jquery','eap','vue','codemodel','tools'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-goodsSalesDetail',
        data:{
            TotalCount:0,
            RecordCount:0,
            params:{
                startTime:{},
                endTime:{}
            },
            origin:{},
            goodsSalesList:null,
            pageConfig:{},
            sumColumn:{}
        },
        methods:{
            pageLoader:function (params, cb) {
                vm.loadgoodsSalesRecord(eap.copyApply({
                    limit: vm.pageConfig.pageSize,
                    start: vm.pageConfig.index
                }, params),function(datas){
                    vm.pageConfig.totalCounts = Number(datas.head.COUNT_||0);
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                })
            },
            loadgoodsSalesRecord:function (params, cb) {
                var condition;
                params = params||{};
                if(vm.params.startTime.time&&vm.params.endTime.time) condition = vm.params.startTime.time+","+vm.params.endTime.time+"@between";
                else if(vm.params.startTime.time&&eap.isEmpty(vm.params.endTime.time)) condition = vm.params.startTime.time+"@ge"
                else if(vm.params.endTime.time&&eap.isEmpty(vm.params.startTime.time)) condition = vm.params.endTime.time+"@le"
                eap.call("shop@query",eap.copyApply(params,{
                    dataModelName:"V_SHOP_ORDER_DETAIL",
                    sum:"GOODS_TOTAL_PRICE_@SUM_TOTAL_PRICE_#if(REFUND_STATUS_='2',GOODS_TOTAL_PRICE_,NULL)@SUM_REFUND_TOTAL_PRICE_",
                    // STORE_ID_:sessionStorage.getItem("STORE_ID_"),
                    orderBy:"ORDER_CREATE_TIME_@desc",
                    ORDER_CREATE_TIME_:condition||"",
                    GOODS_CODE_:vm.params.GOODS_CODE_?vm.params.GOODS_CODE_+"@like":"",
                    ORDER_PAY_STATUS_:"1@not",
                    REFUND_STATUS_:vm.params.refundState||""
                }),function (data) {
                    var datas = eap.parseJson(data)
                    if(datas){
                        vm.sumColumn ={
                            SUM_TOTAL_PRICE_LABEL:eap.toMoney(datas.head.SUM_TOTAL_PRICE_*0.01),
                            SUM_REFUND_TOTAL_PRICE_LABEL:eap.toMoney(datas.head.SUM_REFUND_TOTAL_PRICE_*0.01),
                        }
                        vm.sumColumn["TOTAL_PRICE_LABEL"] = eap.toMoney(vm.sumColumn.SUM_TOTAL_PRICE_LABEL-vm.sumColumn.SUM_REFUND_TOTAL_PRICE_LABEL)
                        eap.each(datas.data,function (e) {
                            e["GOODS_TOTAL_PRICE_LABEL"] = eap.toMoney(Number(e.GOODS_TOTAL_PRICE_||0)*0.01)
                            e["REFUND_PRICE_LABEL"] = eap.toMoney(e.REFUND_STATUS_=="2"?e.GOODS_TOTAL_PRICE_LABEL:0)
                            e["PRICE_LABEL"] = eap.toMoney(e.GOODS_TOTAL_PRICE_LABEL-e.REFUND_PRICE_LABEL)
                            e["ORDER_PAY_CHANNEL_LABEL"] = cm.payChannel.get(e.ORDER_PAY_CHANNEL_)
                        })
                        vm.goodsSalesList = datas.data
                    }
                    if(eap.isFunction(cb))cb(datas);
                })
            },
            exportExcel:function () {
                var condition;
                if(vm.params.startTime.time&&vm.params.endTime.time) condition = vm.params.startTime.time+","+vm.params.endTime.time+"@between";
                else if(vm.params.startTime.time&&eap.isEmpty(vm.params.endTime.time)) condition = vm.params.startTime.time+"@ge"
                else if(vm.params.endTime.time&&eap.isEmpty(vm.params.startTime.time)) condition = vm.params.endTime.time+"@le"
                eap.call("shop@excel",{
                    title:"商品明细",
                    method:"post",
                    dataModelName:"V_SHOP_ORDER_DETAIL",
                    params:{
                        dataModelName:"V_SHOP_ORDER_DETAIL",
                        sum:"GOODS_TOTAL_PRICE_@SUM_TOTAL_PRICE_#if(REFUND_STATUS_='2',GOODS_TOTAL_PRICE_,NULL)@SUM_REFUND_TOTAL_PRICE_",
                        // STORE_ID_:sessionStorage.getItem("STORE_ID_"),
                        orderBy:"ORDER_CREATE_TIME_@desc",
                        ORDER_CREATE_TIME_:condition||"",
                        GOODS_CODE_:vm.params.GOODS_CODE_?vm.params.GOODS_CODE_+"@like":""
                    }
                })
            }
        }
    });
    goodsSalesDetailInit = function () {
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        });
        vm.$refs.start_time.init()
        vm.$refs.end_time.init()
    }
});