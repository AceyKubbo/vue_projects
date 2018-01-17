/**
 * Created by only on 2016/10/23.
 */
var stockOrderInit;
require(['jquery','eap','vue','codemodel','tools'],function($,eap,Vue,cm){
    var vm = new Vue({
        el: '#section-stockOrder',
        data: {
            TotalCount: 0,
            RecordCount: 50,
            params: {limit: 50},
            stockOrderList: null,
            goodList: null,
            stockOrder: {},
            params:{
                start_time:{},
                end_time:{}
            },
            origin: {},
            checkboxGoodList: [],
            checkboxLabelList: [],
            labelList: null,
            pageConfig: {}
        },
        methods: {
            stockAllTab: function () {
                vm.params.type="";
                vm.pageLoader()
            },
            stockInTab: function () {
                vm.params.type="Int#1"
                vm.pageLoader();
            },
            stockOutTab: function () {
                vm.params.type="Int#2"
                vm.pageLoader();
            },
            addStockOut: function () {
                vm.stockOrder = {
                    title: "添加出库单",
                    type: 2,
                    details: []
                };
                vm.labelList = vm.origin.labelList.filter(function (e) {
                    return e.type == 2
                });
                vm.checkboxLabelList = []
            },
            addStockIn: function () {
                vm.stockOrder = {
                    title: "添加入库单",
                    type: 1,
                    details: []
                };
                vm.labelList = vm.origin.labelList.filter(function (e) {
                    return e.type == 1
                });
                vm.checkboxLabelList = []
            },
            submitStockOrder: function (stockOrder) {
                var stockAccessRequestDetail = [];
                eap.each(stockOrder.details, function (e) {
                    stockAccessRequestDetail.push({
                        itemCode: e.CODE_,
                        requestCount: e.requestCount.toString()
                    })
                });
                eap.call("stock@access", {
                    stockAccessRequest: {
                        requestType: stockOrder.type.toString(),
                        requestTime: new Date(),
                        remark: stockOrder.remark,
                        repertoryCode: sessionStorage.getItem("STORE_ID_"),
                        stockAccessRequestDetail: stockAccessRequestDetail
                    }
                }, function (data) {
                    layer.msg(cm.retMsg.get(data.retcode));
                    $('#stockOrder').modal('hide');
                    StockOrderList();
                })
            },
            submitStockList: function () {
                layer.confirm('确认要添加这些商品[' + vm.checkboxGoodList.map(function (v) {
                        return v.NAME_
                    }).join(',') + ']吗?', function () {
                    eap.each(vm.checkboxGoodList, function (e) {
                        vm.stockOrder.details.push(eap.copyApply(e, {
                            requestCount: 1
                        }))
                    });
                    $('#goodModal').modal('hide');
                    layer.msg("添加成功!");
                })
            },
            searchGood: function (condition) {
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
            searchGoodList: function () {
                var condi = eap.copyApply({}, vm.params);
                vm.searchGood(function (e) {
                    return condi.good_condi ? (e.CODE_.indexOf(condi.good_condi) >= 0 || e.NAME_.indexOf(condi.good_condi) >= 0) : true;
                })
            },
            openGoodList: function () {
                vm.checkboxGoodList = [];
                vm.searchGood(function (e) {
                    return vm.stockOrder.details ? vm.stockOrder.details.map(function (v) {
                        return v.CODE_
                    }).indexOf(e.CODE_) < 0 : true
                })
            },
            delDetailsItem: function (item) {
                vm.stockOrder.details.splice(vm.stockOrder.details.findIndex(function (e) {
                    return e.CODE_ == item.CODE_
                }), 1);
            },
            addLabel: function () {
                vm.stockOrder.remark = vm.checkboxLabelList.map(function (v) {
                    return v.label
                }).join('/')
            },
            getGoodName: function (good) {
                var goods = vm.origin.goodList ? vm.origin.goodList.find(function (e) {
                    return e.CODE_ == good;
                }) : null;
                return goods ? goods.NAME_ : good;
            },
            showDetails: function (stock) {
                if ($("#detail-" + stock.id).attr("class").indexOf("hidden") >= 0) {
                    $("tr.hideCell").addClass('hidden');
                    $("#detail-" + stock.id).removeClass('hidden');
                } else {
                    $("#detail-" + stock.id).addClass('hidden');
                }
            },
            pageLoader: function (params,cb) {
                params = params||{}
                var condition;
                if(vm.params.start_time.time&&vm.params.end_time.time) condition = "Date#"+
                    vm.params.start_time.time+","+vm.params.end_time.time+"@between";
                else if(vm.params.start_time.time&&eap.isEmpty(vm.params.end_time.time)) condition =  "Date#"+vm.params.start_time.time+"@ge"
                else if(vm.params.end_time.time&&eap.isEmpty(vm.params.start_time.time)) condition =  "Date#"+vm.params.end_time.time+"@le"
                if(condition)params[".requestTime"] = condition;
                if(vm.params.goods)params[".details.itemCode"]=vm.params.goods;
                if(!eap.isEmpty(vm.params.type))params[".type"]=vm.params.type;
                StockOrderList(eap.copyApply({
                    ".limit": vm.pageConfig.pageSize,
                    ".start": vm.pageConfig.index
                }, params), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.header.COUNT_||0)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            }
        }
    });
    var StockOrderList = function (params,cb) {
        eap.call("stock@query",eap.copyApply(params,{
            className:"stockAccess",
            ".repertoryCode":sessionStorage.getItem("STORE_ID_"),
            ".orderBy":"responseTime@desc"
        }),function(data) {
            var datas = eap.parseJson(data);
            if(datas.data){
                eap.each(datas.data,function (e) {
                    eap.each(e.details,function (d) {
                        d["itemId_label"] = vm.getGoodName(d.itemCode);
                    });
                    e["stock_time"] = eap.dateFormat(new Date(e.responseTime),"yyyy-MM-dd hh:mm:ss")
                });
                vm.stockOrderList = datas.data;
                if(eap.isFunction(cb))cb(datas);
            }
        })
    };
    var GoodsList = function () {
        eap.call("shop@query",{
            dataModelName:"V_SHOP_GOODS",
            STORE_ID_:sessionStorage.getItem("STORE_ID_")
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
    stockOrderInit = function () {
        vm.params.storeName = sessionStorage.getItem("STORE_NAME_");
        GoodsList();
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        });
        vm.$refs.start_time.init()
        vm.$refs.end_time.init()
    }
});