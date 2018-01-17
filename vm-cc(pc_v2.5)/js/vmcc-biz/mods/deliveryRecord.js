/**
 * Created by only on 2016/10/23.
 */
var deliveryRecordInit;
require(['jquery','eap','vue','codemodel','tools'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-deliveryRecord',
        data:{
            TotalCount:0,
            RecordCount:50,
            origin:{},
            deliveryList:null,
            params:{
                startTime:{},
                endTime:{}
            },
            deliveryStatus:{},
            pageConfig:{}
        },
        methods:{
            searchDelivery:function () {
                vm.pageLoader({
                    ".stauts":vm.params.stauts,
                    ".deliver":vm.params.deliver+"@like"
                })
            },
            pageLoader:function (params,cb) {
                params = params||{}
                DeliveryRecordList(eap.copyApply({
                    ".limit": vm.pageConfig.pageSize,
                    ".start": vm.pageConfig.index
                },params), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.header.COUNT_)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            }
        }
    });
    var DeliveryRecordList = function (params,cb) {
        eap.call('delivery@query',eap.copyApply({
            ".extra.STORE_ID_":sessionStorage.getItem("STORE_ID_"),
            ".orderBy":"requestTime@desc"
        },params),function (data) {
            var datas = eap.parseJson(data);
            eap.each(datas.data,function (e) {
                e['send_time'] = eap.dateFormat(new Date(e.requestTime),'yyyy-M-d hh:mm:ss')
                e['stauts_label'] = cm.deliveryState.get(e.stauts)
            })
            vm.deliveryList = datas.data
            if(eap.isFunction(cb))cb(datas);
            if(vm.pageConfig.exist)vm.pageConfig.changeOption();
        })
    }
    deliveryRecordInit = function () {
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init()
        })
        vm.$refs.startTime.init();
        vm.$refs.endTime.init();
    }
});