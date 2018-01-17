var stockOrderInit;
require(['jquery','eap','vue','codemodel','tools'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-stockOrder',
        data:{
            TotalCount:0,
            RecordCount:0,
            params:{
                start_time:{},
                end_time:{}
            },
            origin:{},
            repoList:[],
            repoInfo:{},
            stockOrderList:[],
            stockOrderInfo:{},
            pageConfig:{},
            goodList:[],
            labelList:[],
            chbLabelList:[],
            chbGoodList:[]
        },
        methods:{
            stockAll:function () {
                vm.params.type="";
                vm.pageLoader()
            },
            stockIn:function (){
                vm.params.type="Int#1";
                vm.pageLoader();
            },
            stockOut:function () {
                vm.params.type="Int#2"
                vm.pageLoader();
            },
            pageLoader:function (params,cb) {
                params = params||{};
                var condition;
                if(vm.params.start_time.time&&vm.params.end_time.time) condition = "Date#"+
                    vm.params.start_time.time+","+vm.params.end_time.time+"@between";
                else if(vm.params.start_time.time&&eap.isEmpty(vm.params.end_time.time)) condition =  "Date#"+vm.params.start_time.time+"@ge"
                else if(vm.params.end_time.time&&eap.isEmpty(vm.params.start_time.time)) condition =  "Date#"+vm.params.end_time.time+"@le"
                if(condition)params[".requestTime"] = condition;
                if(!eap.isEmpty(vm.params.type))params[".type"]=vm.params.type;
                StockOrderList(eap.copyApply({
                    ".limit": vm.pageConfig.pageSize,
                    ".start": vm.pageConfig.index
                },params), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.header.COUNT_)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            },
            selectRepo:function (e) {
                console.log(e.target.index)
                vm.repoInfo = eap.copyApply({},vm.repoList.find(function (op) {
                    return e.target.value==op.code
                }));
                vm.pageLoader();
            },
            addStockOut:function () {
                if(eap.isEmpty(vm.repoInfo.code)){
                    layer.msg("请先选择仓库")
                    return;
                }
                vm.stockOrderInfo={
                    title:"添加出库单",
                    type:2,
                    details:[]
                }
                $("#stockOrderInfo_platform").modal('show');
                vm.labelList = vm.origin.labelList.filter(function (e) {
                    return e.type == 2
                });
                vm.chbLabelList = []
            },
            showDetails: function (stock) {
                if ($("#detail-" + stock.id).attr("class").indexOf("hidden") >= 0) {
                    $("tr.hideCell").addClass('hidden');
                    $("#detail-" + stock.id).removeClass('hidden');
                } else {
                    $("#detail-" + stock.id).addClass('hidden');
                }
            },
            addLabel:function () {
                vm.stockOrderInfo.remark = vm.chbLabelList.map(function (v) {
                    return v.label
                }).join('/')
            },
            delDetailsItem:function () {
                vm.stockOrderInfo.details.splice(vm.stockOrderInfo.details.findIndex(function (e) {
                    return e.CODE_ == item.CODE_
                }), 1);
            },
            submitStockOrder:function (stockOrder) {
                var stockAccessRequestDetail = [];
                eap.each(stockOrder.details, function (e) {
                    stockAccessRequestDetail.push({
                        itemCode: e.CODE_,
                        requestCount: e.requestCount.toString()
                    })
                });
                console.log(eap.copyApply({},vm.repoInfo))
                eap.postWithRequestBody("/api/stock/operator/access", {
                    stockAccessRequest: {
                        requestType: stockOrder.type.toString(),
                        requestTime: new Date(),
                        remark: stockOrder.remark,
                        repertoryCode: vm.repoInfo.code,
                        stockAccessRequestDetail: stockAccessRequestDetail
                    }
                }, function (data) {
                    layer.msg(cm.retMsg.get(data.retcode));
                    $('#stockOrderInfo_platform').modal('hide');
                    vm.pageLoader();
                })
            },
            submitAddGoods: function () {
                layer.confirm('确认要添加这些商品[' + vm.chbGoodList.map(function (v) {
                    return v.NAME_
                }).join(',') + ']吗?', function () {
                    eap.each(vm.chbGoodList, function (e) {
                        vm.stockOrderInfo.details.push(eap.copyApply(e, {
                            requestCount: 1
                        }))
                    });
                    $('#stockOrder_platform_goodInfo').modal('hide');
                    layer.msg("添加成功!");
                })
            },
            openGoodList: function () {
                vm.chbGoodList = [];
                vm.searchGood(function (e) {
                    return vm.stockOrderInfo.details ? vm.stockOrderInfo.details.map(function (v) {
                        return v.CODE_
                    }).indexOf(e.CODE_) < 0 : true
                })
            },
            searchGood: function (condition) {
                vm.goodList =vm.origin.goodList?vm.origin.goodList.filter(function (e) {
                    var flag = true;
                    if (typeof condition === 'function') flag = flag && condition(e);
                    return flag;
                }):[];
            },
            searchGoodList:function () {
                vm.searchGood(function (e) {
                    return e.CODE_.indexOf(vm.params.goodCondi)>=0 || e.NAME_.indexOf(vm.params.goodCondi)>=0
                })
            }
        }
    });
    var RepoList = function () {
        eap.post("/api/stock/data/query",{
            className:"stockRepertory",
            ".bizType":"platform"
        },function (data) {
            var datas = eap.parseJson(data);
            if(datas.data){
                vm.repoList = datas.data;
            }
        })
    }
    var StockOrderList = function (params,cb) {
        eap.post("/api/stock/data/query",eap.copyApply({
            className:"stockAccess",
            ".repertoryId":vm.repoInfo?vm.repoInfo.id:null,
            ".bizType":"platform",
            ".orderBy":"requestTime@desc"
        },params),function (data) {
            var datas = eap.parseJson(data);
            if(datas.data){
                eap.each(datas.data,function (e) {
                    e["requestTime_label"] = eap.dateFormat(new Date(e.requestTime),"yyyy-MM-dd hh:mm:ss")
                    eap.each(e.extra,function (d) {
                        e[d.key] = e.value
                    })
                })
                vm.stockOrderList = datas.data
                if(eap.isFunction(cb))cb(datas);
            }
        })
    }
    var GoodsList = function () {
        eap.post("/api/shop/data/query",{
            dataModelName:"T_SHOP_GOODS_LIB",
        },function (data) {
            var datas = eap.parseJson(data);
            vm.origin.goodList = datas.data;
        })
    };
    vm.origin.labelList = [
        {type:1,label:"测试入库"},
        {type:1,label:"采购入库"},
        {type:1,label:"退货入库"},
        {type:2,label:"测试出库"},
        {type:2,label:"销售出库"},
        {type:2,label:"过期出库"},
    ];
    stockOrderInit=function () {
        GoodsList();
        RepoList();
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        })
        vm.$refs.start_time.init()
        vm.$refs.end_time.init()
    }
});