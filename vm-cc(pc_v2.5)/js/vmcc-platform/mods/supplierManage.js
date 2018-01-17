/**
 * Created by apple on 17/12/18.
 */
var supplierManageInit
require(['jquery','eap','vue','codemodel','tools'],function ($,eap,Vue,cm) {
    var vm = new Vue({
        el:'#section-supplierManage',
        data:{
            origin:{},
            supplierList:{},
            supplierDetail:{},
            params:{},
            pageConfig:{}
        },
        methods:{
            modifySupplierList:function (record) {
                vm.supplierDetail = record
                $('#addSupplierManageId').modal('toggle')
            },
            submitSupplier:function (record) {
                if(eap.isEmpty(record.supplierCode)){
                    layer.msg('请填写供应商编号!')
                    return
                }
                if(eap.isEmpty(record.supplierName)){
                    layer.msg('请填写供应商名字!')
                    return
                }
                eap.post('/api/stock/data/object',{
                    className: 'supplier',
                    ID_:record.id,
                    SUPPLIER_NAME_:record.supplierName,
                    SUPPLIER_CODE_:record.supplierCode,
                    SUPPLIER_DESC_:record.supplierDesc
                },function (data) {
                    var datas =eap.parseJson(data)
                    if(datas.head.RETCODE == '0'){
                        $('#addSupplierManageId').modal('hide')
                        supplierList()
                    }
                    layer.msg(cm.retMsg.get(datas.head.RETCODE))
                })
            },
            addSupplier:function () {
                vm.supplierDetail = {}
            },
            search:function (condition) {
                if(vm.origin.supplierList){
                    var templist= vm.origin.supplierList.filter(function (e) {
                        var flag = true;
                        if(typeof condition ==='function') flag = flag&&condition(e);
                        return flag;
                    });
                    vm.supplierList = templist
                }
            },
            searchSupplier:function () {
                var con = vm.params.searchCondition;
                vm.search(function (e) {
                    return con?(e.supplierCode.indexOf(con)>=0||e.supplierName.indexOf(con)>=0):true
                })
            },
            pageLoader: function (cb) {
                supplierList(eap.copyApply({
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
    var supplierList = function (params,cb) {
        eap.post('/api/stock/data/query',eap.copyApply(params,{
            className:'supplier',
            '._id':'notNull@notNull'
        }),function (data) {
            var datas = eap.parseJson(data)
            if(datas.header.RETCODE != '0'){
                layer.msg(cm.get(datas.header.RETCODE))
                return
            }
            vm.origin.supplierList = datas.data
            vm.supplierList = datas.data
            if(eap.isFunction(cb))cb(datas);
        })
    }
    supplierManageInit =function () {
        supplierList()
        vm.pageLoader(function () {
            vm.$refs.pageInit.init();
        });
    }
})