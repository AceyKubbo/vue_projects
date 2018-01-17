/**
 * Created by aixl on 2017/8/23.
 */
var goodsChangeInit;
require(['jquery','eap','vue','codeModel','weui'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-goodsChange',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            origin:{},
            passwayInfo:{},
            goodList:null
        },
        methods:{
            back:function () {
                eap.toModView('deviceItem');
                deviceItemInit({mid:vm.passwayInfo.COUNTER_DEVICE_CODE_})
            },
            searchFun:function (condition) {
                var tempList = vm.origin.goodList.filter(function (e) {
                    var flag = true;
                    if(typeof condition ==='function') flag = flag&&condition(e);
                    return flag;
                })
                vm.goodList = tempList.slice(0,Number(tempList.length))
            },
            search:function () {
                var search_condition = vm.params.search_condition;
                vm.searchFun(function (e) {
                    return search_condition?e.NAME_.indexOf(search_condition)>=0||e.CODE_.indexOf(search_condition)>=0:true
                })
            },
            submitPassway:function (good) {
                $.showLoading()
                eap.post("/api/shop/oper/exchangeGoods",{
                    TARGET_GOODS_ID_:good.ID_,
                    COUNTER_GOODS_ID_:vm.passwayInfo.ID_,
                    COUNT_:1
                },function (data) {
                    var datas = eap.parseJson(data)
                    $.hideLoading()
                    if(datas.head.RETCODE=="0"){
                        vm.back();
                    }else{
                        $.toast(cm.retMsg.get(datas.head.RETCODE),"cancel");
                    }
                })
            },
            clearCondition:function () {
                vm.params.search_condition = "";
            }
        }
    });
    var GoodList = function () {
        eap.post("/api/shop/data/query",{
            dataModelName:'V_SHOP_GOODS',
            STORE_ID_:sessionStorage.getItem('STORE_ID_'),
            orderBy:'CODE_',
        },function (data) {
            var datas = eap.parseJson(data)
            vm.origin.goodList = datas.data
            vm.search()
        })
    }
    goodsChangeInit = function (aisle) {
        vm.passwayInfo = aisle;
        GoodList();
    }
});