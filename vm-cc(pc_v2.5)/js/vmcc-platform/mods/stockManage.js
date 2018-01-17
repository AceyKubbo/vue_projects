/**
 * Created by 123456 on 2017/12/21.
 */

var stockManageInit
require(['jquery', 'vue', 'eap', 'codemodel','tools','layer'], function ($, Vue, eap, cm) {
    var vm = new Vue({
        el: "#section-stockManage",
        data: {
            TotalCount: 0,
            RecordCount: 50,
            origin: {},
            repertoryList:[],
            repertoryItemList:[],
            repertoryInfo: {},
            params:{},
            pageConfig:{}
        },
        methods: {
            selectRepertory: function (e) {
                vm.repertoryInfo = eap.copyApply({},vm.repertoryList.find(function (op) {
                    return e.target.value==op.code
                }));
                vm.search();
            },
            search:function(){
                vm.params["itemCode"] =vm.params.code?vm.params.code+"@like":""
                vm.pageLoader();
            },
            pageLoader: function (cb) {
                var extra = []
                extra.push({key:"limit",value:vm.pageConfig.pageSize})
                extra.push({key:"start",value:vm.pageConfig.index})
                extra.push({key:"itemCode",value:vm.params.itemCode})
                RepertoryItemList(eap.copyApply({
                    "extra":extra
                }, vm.pageConfig),function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.count)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            },
        }
    });
    var RepertoryItemList = function (params,cb) {
        vm.params = eap.copyApply(vm.params,params)
        eap.postWithRequestBody('/api/stock/operator/query', eap.copyApply({
            repertoryId: vm.repertoryInfo?vm.repertoryInfo.id:""
        },vm.params), function (data) {
            if(data.StockInfos) {
                eap.each(data.StockInfos, function (e) {
                    e["repo_label"] =vm.repertoryInfo?vm.repertoryInfo.name:""
                    e["repo_code"] =vm.repertoryInfo?vm.repertoryInfo.code:""
                    e['count'] = e.currentCount
                    e['itemCode'] = e.itemCode
                    e['update_time_label'] = e.updateTime?eap.dateFormat(new Date(Number(e.updateTime)),"yyyy-MM-dd hh:mm:ss"):""
                });
                vm.origin.repertoryItemList = data.StockInfos;
                vm.repertoryItemList = vm.origin.repertoryItemList;
                if(eap.isFunction(cb))cb(data);
            }
        });
    }
    var repertoryList = function () {
        eap.post('/api/stock/data/query', {
            className: 'stockRepertory',
            '.bizType':'platform'
        }, function (data) {
            var datas = eap.parseJson(data)
            eap.each(datas.data,function (e) {
                e["name"] = e.name||""
            })
            vm.repertoryList = datas.data
        })
    }

    stockManageInit = function () {
        repertoryList();
        vm.pageLoader(function () {
            vm.$refs.pageInit.init();
        });
    };
});

