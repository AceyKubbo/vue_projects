/**
 * Created by aixl on 2017/8/23.
 */
var addStockOrderInit;
require(['jquery','eap','vue','codeModel'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-addStockOrder',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            origin:{},
            stockOrder:{},
            labelList:null,
            checkbox:{
                labelList:[],
                goodList:[],
            },
            goodList:null,
        },
        methods:{
            back:function () {
                eap.toModView("stockOrder")
                stockOrderInit();
            },
            stockInTab:function () {
                vm.stockOrder = {
                    requestType:"1"
                }
                $("a.weui-navbar__item").removeClass("weui-bar__item--on");
                $("a[name='stockIn']").addClass("weui-bar__item--on");
                vm.labelList = vm.origin.labelList.filter(function (e) {
                    return e.type=="1"
                })
                vm.checkbox.labelList=[]
            },
            stockOutTab:function () {
                vm.stockOrder = {
                    requestType:"2"
                }
                $("a.weui-navbar__item").removeClass("weui-bar__item--on");
                $("a[name='stockOut']").addClass("weui-bar__item--on");
                vm.labelList = vm.origin.labelList.filter(function (e) {
                    return e.type=="2"
                })
                vm.checkbox.labelList=[]
            },
            addLabel:function () {
                vm.stockOrder.remark = vm.checkbox.labelList.map(function (v) {
                    return v.label
                }).join('/')
            },
            addCount:function (detail) {
                detail.requestCount = detail.requestCount+1
            },
            decCount:function (detail) {
                detail.requestCount = detail.requestCount-1
                if(detail.requestCount==0){
                    vm.stockOrder.details.splice(vm.stockOrder.details.indexOf(detail),1)
                }
            },
            addDetails:function () {
                var usedGood =vm.stockOrder.details?vm.stockOrder.details.map(function (v) {
                    return v.itemCode
                }):[]
                vm.checkbox.goodList=[]
                GoodsList(function () {
                    vm.origin.goodList = vm.origin.goodList.filter(function (e) {
                        return eap.isEmpty(usedGood)?true:!usedGood.includes(e.CODE_)
                    })
                    vm.searchGood();
                    $("#goodListView").removeClass("hidden");
                    $("#stockOrderView").addClass("hidden");
                });
            },
            showStockOrder:function () {
                $("#stockOrderView").removeClass("hidden");
                $("#goodListView").addClass("hidden");
            },
            searchGood:function () {
                var condi = vm.params.search_good_condition;
                vm.goodList = vm.origin.goodList.filter(function (e) {
                    return eap.isEmpty(condi)?true:(e.NAME_.indexOf(condi)>=0||e.CODE_.indexOf(condi)>=0)
                })
            },
            cleanSearch:function () {
                vm.params.search_good_condition = "";
            },
            selectGood:function () {
                if(eap.isEmpty(vm.stockOrder.details))vm.$set(vm.stockOrder,"details",[]);
                eap.each(vm.checkbox.goodList,function (e) {
                    vm.stockOrder.details.push({
                        itemCode:e.CODE_,
                        requestCount:1
                    })
                })
                vm.showStockOrder()
            },
            submitStockOrder:function () {
                var stockAccessRequestDetail =[]
                eap.each(vm.stockOrder.details,function (e) {
                    stockAccessRequestDetail.push(eap.copyApply(e,{
                        requestCount:e.requestCount.toString()
                    }))
                })
                var stockOrder = eap.copyApply({
                    requestTime:new Date(),
                    repertoryCode:sessionStorage.getItem("STORE_ID_"),
                    stockAccessRequestDetail:stockAccessRequestDetail
                },vm.stockOrder);
                eap.postWithRequestBody("/api/stock/operator/access",{
                    stockAccessRequest:stockOrder
                },function (data) {
                    vm.back();
                })
            }
        }
    });
    vm.origin.labelList = [
        {type:1,label:"测试入库"},
        {type:1,label:"采购入库"},
        {type:1,label:"退货入库"},
        {type:2,label:"测试出库"},
        {type:2,label:"销售出库"},
        {type:2,label:"过期出库"},
    ]
    var GoodsList = function (cb) {
        eap.post("/api/shop/data/query",{
            dataModelName:"V_SHOP_GOODS",
            STORE_ID_:sessionStorage.getItem("STORE_ID_")
        },function (data) {
            var datas = eap.parseJson(data);
            vm.origin.goodList = datas.data;
            if(typeof cb ==="function")cb();
        })
    }
    addStockOrderInit = function () {
        GoodsList();
        vm.stockOutTab()
    }
});