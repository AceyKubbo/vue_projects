/**
 * Created by apple on 17/12/19.
 */
var storeHouseInit
require(['jquery','eap','vue','codemodel','tools'],function ($,eap,Vue,cm) {
    var vm = new Vue({
        el:'#section-storeHouse',
        data:{
            origin:{},
            stockList:{},
            stockDetail:{},
            params:{},
            pageConfig:{}
        },
        methods:{
            modifyStockList:function (record) {
                vm.stockDetail = record
                $('#addStockId').modal('toggle')
            },
            submitStock:function (record) {
                if(eap.isEmpty(record.code)){
                    layer.msg('请填写仓库编号!')
                    return
                }
                var reperoryInfo ={
                    id:record.id,
                    name:record.name,
                    code:record.code,
                    bizType:'platform',
                    remark:record.remark}
                eap.postWithRequestBody('/api/stock/operator/cuRepertory',{
                    repertoryInfo:reperoryInfo
                },function (data) {
                    if(data.retcode == '0'){
                        $('#addStockId').modal('hide')
                        stockList()
                    }
                    layer.msg(cm.retMsg.get(data.retcode))
                })
            },
            addStock:function () {
                vm.stockDetail = {}
            },
            search:function (condition) {
                if(vm.origin.stockList){
                    var templist= vm.origin.stockList.filter(function (e) {
                        var flag = true;
                        if(typeof condition ==='function') flag = flag&&condition(e);
                        return flag;
                    });
                    vm.stockList = templist
                }
            },
            searchStock:function () {
                var con = vm.params.searchCondition;
                vm.search(function (e) {
                    return con?(e.code.indexOf(con)>=0 || e.name.indexOf(con)>=0):true
                })
            },
            pageLoader: function (cb) {
                stockList(eap.copyApply({
                    ".limit": vm.pageConfig.pageSize,
                    ".start": vm.pageConfig.index
                }, vm.pageConfig), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.header.COUNT_)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            }
        }
    })
     var stockList = function (params,cb) {
         eap.post('/api/stock/data/query',eap.copyApply(params,{
             className:'stockRepertory',
             '._id':'notNull@notNull',
             '.bizType':'platform'
         }),function (data) {
             var datas = eap.parseJson(data)
             if(datas.header.RETCODE != '0'){
                 layer.msg(cm.get(datas.header.RETCODE))
                 return
             }
             vm.origin.stockList = datas.data
             vm.stockList = datas.data
             if(eap.isFunction(cb))cb(datas);
         })
     }
    storeHouseInit =function () {
        stockList()
        vm.pageLoader(function () {
            vm.$refs.pageInit.init();
        });
    }
})