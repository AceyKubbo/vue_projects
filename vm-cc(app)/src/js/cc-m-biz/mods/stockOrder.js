/**
 * Created by aixl on 2017/8/23.
 */
var stockOrderInit;
require(['jquery','eap','vue','codeModel'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-stockOrder',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            origin:{},
            stockOrderList:null
        },
        methods:{
            returnHome:function () {
                eap.toModView("menu")
            },
            stockInTab:function () {
                $('a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('a[name="replenishGoods"]').addClass('weui-bar__item--on');
                vm.stockOrderFilter(function (e) {
                    return e.type=="1"
                })
            },
            stockOutTab:function () {
                $('a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('a[name="changeGoods"]').addClass('weui-bar__item--on');
                vm.stockOrderFilter(function (e) {
                    return e.type=="2"
                })
            },
            stockOrderFilter:function(condition) {
                if(vm.origin.stockOrderList){
                    vm.stockOrderList = vm.origin.stockOrderList.filter(function (e) {
                        var flag = true;
                        if(typeof condition==="function")flag=flag&&condition(e);
                        return flag;
                    })
                }else{
                    vm.stockOrderList = [];
                }
            },
            addStockOrder:function () {
                eap.toModView('addStockOrder');
                addStockOrderInit();
            },
            loadStockOrderDetails:function (order) {
                if($("#detail-"+order.id).attr("class").indexOf("hidden")>=0){
                    $('div.custom-cell-content').addClass("hidden");
                    $('#detail-'+order.id).removeClass("hidden");
                }else{
                    $('#detail-'+order.id).addClass("hidden");
                }
            }
        }
    });
    var StockOrderList = function (params) {
        eap.post("/api/stock/data/query",eap.copyApply(params,{
            className:"stockAccess",
            ".repertoryCode":sessionStorage.getItem("STORE_ID_"),
            ".orderBy": "requestTime@desc"
        }),function (data) {
            var datas = eap.parseJson(data);
            if(datas.data){
                eap.each(datas.data,function (e) {
                    e["type_label"] = cm.stockOrderType.get(e.type);
                    e["stock_time"] = eap.dateFormat(new Date(e.responseTime),"yyyy-MM-dd hh:mm:ss")
                    e["details"] = e.details?e.details:[]
                })
                vm.origin.stockOrderList = datas.data
                vm.stockInTab()
            }
        })
    }
    stockOrderInit = function() {
        StockOrderList();
    }
});