
 var operationRecordInit;
require(['jquery','eap','vue','layer','tools'],function($,eap,Vue,layer){
    var vm = new Vue({
        el:'#section-operationRecord',
        data:{
            origin:{},
            params:{},
            RecordCount:50,
            TotalCount:0,
            operationList:{},
            detial:{},
            pageConfig:{},
            operator:''
        },
        methods:{
            loadRecords:function (params,cb) {
                cb = cb || eap.emptyFn;
                    eap.post("/api/shop/oper/query",eap.copyApply(params,{
                        ".storeId":sessionStorage.getItem("STORE_ID_"),
                        ".orderBy":'createTime@desc',
                        '.deviceSn':vm.params.deviceSn,
                        '.details.goodsCode':vm.params.goodsCode,
                        '.operator':vm.operator
                    }),function (data) {
                        var datas = eap.parseJson(data)
                        cb(datas);
                        eap.each(datas.data,function (e) {
                            eap.each(e.details,function (d) {
                            })
                            e['operTime'] = eap.dateFormat(new Date(e.createTime),'yyyy-MM-dd hh:mm:ss')
                        })
                        vm.origin.operationList = datas.data;
                        vm.operationList=datas.data;
                    })
            },
            searchDevice:function(){
                vm.pageLoader()
            },
            showOperDetial:function(opera){
                if($("#detail_"+opera.id).attr("class").indexOf("hidden")>=0){
                    $("tr.hideCell").addClass('hidden');
                    $("#detail_"+opera.id).removeClass('hidden');
                }else{
                    $("#detail_"+opera.id).addClass('hidden');
                }
            },
            change:function(e){
                this.operator = e
                vm.pageLoader()
            },
            pageLoader: function (cb) {
                vm.loadRecords(eap.copyApply({
                    ".limit": vm.pageConfig.pageSize,
                    ".start": vm.pageConfig.index
                }, vm.pageConfig), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.header.COUNT_)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            }

        }
    });

    operationRecordInit = function () {
        vm.pageLoader(function () {
            vm.$refs.pageInit.init();
        });
    }
});
