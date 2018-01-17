/**
 * Created by aixl on 2017/8/23.
 */
var shortageCountInit;
require(['jquery','eap','vue'],function($,eap,Vue){
    var vm = new Vue({
        el:'#section-shortage-count',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            origin:{},
            goodCountList:null
        },
        methods:{
            back:function () {
                eap.toModView("deviceMonitor");
                deviceMonitorInit();
            },
            openShortageDetail:function(good) {
                eap.toModView("shortage-details");
                shortageDetailsInit(good);
            }
        }
    });
    var ShortageCount = function () {
        eap.post('/api/shop/data/query',{
            dataModelName:"V_SHOP_GOODS_STATUS",
            STORE_ID_:sessionStorage.getItem("STORE_ID_"),
            COUNTER_TYPE_:"net@not",
            SHORT_COUNT_:"0@gt",
            selectColumns:"NAME_,PICTURE_",
            sum:"SHORT_COUNT_",
            groupBy:"CODE_"
        },function (data) {
            var datas = eap.parseJson(data);
            vm.origin.goodCountList = datas.data;
            vm.goodCountList = vm.origin.goodCountList;
        })
    }
    shortageCountInit = function () {
        ShortageCount();
    }
});