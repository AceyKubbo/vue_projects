/**
 * Created by aixl on 2017/8/23.
 */
var shortageDetailsInit;
require(['jquery','eap','vue'],function($,eap,Vue){
    var vm = new Vue({
        el:'#section-shortage-details',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            goodInfo:{},
            aisleList:null
        },
        methods:{
            back:function () {
                eap.toModView('shortage-count');
                shortageCountInit();
            }
        }
    });
    var GoodShortDetail = function (good) {
        eap.post('/api/shop/data/query',{
            dataModelName:'V_SHOP_COUNTER_GOODS',
            STORE_ID_:sessionStorage.getItem("STORE_ID_"),
            CODE_: good.CODE_,
            STATUS_:1,
            SHORT_COUNT_:"0@gt",
            COUNTER_TYPE_:"net@not"
        },function (data) {
            var datas = eap.parseJson(data)
            vm.goodInfo.aisleList = datas.data;
            vm.aisleList = vm.goodInfo.aisleList;
        })
    }
    shortageDetailsInit = function(good) {
        vm.goodInfo = good;
        GoodShortDetail(good);
    }
});