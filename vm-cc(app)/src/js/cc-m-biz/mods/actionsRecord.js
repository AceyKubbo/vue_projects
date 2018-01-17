/**
 * Created by apple on 17/9/14.
 */
var actionsRecordInit
require(['jquery','vue','eap','codeModel'],function ($,vue,eap,cm) {
    var vm = new vue({
        el:"#section-actionsRecord",
        data:{
            actionsList:null,
            params:{},
            origin:{}
        },
        methods:{
            returnHome:function () {
                eap.toModView('menu')
            },
            search:function (condition) {
                if(vm.origin.actionsList){
                    vm.actionsList = vm.origin.actionsList.filter(function (e) {
                        var flag = true;
                        if(typeof condition ==='function') flag = flag&&condition(e);
                        return flag;
                    });
                }else{
                    vm.actionsList=[]
                }
            },
            replenishGoods:function () {
                $('.weui-navbar__item').removeClass("weui-bar__item--on");
                $('a[name="replenishGoods"]').addClass("weui-bar__item--on");
                vm.search(function (e) {
                    return e.operator == "replenishment"
                })
            },
            changeGoods:function () {
                $('.weui-navbar__item').removeClass("weui-bar__item--on");
                $('a[name="changeGoods"]').addClass("weui-bar__item--on");
                vm.search(function (e) {
                    return e.operator == "exchange"
                })
            },
            batchSupply:function () {
                $('.weui-navbar__item').removeClass("weui-bar__item--on");
                $('a[name="batchSupply"]').addClass("weui-bar__item--on");
                vm.search(function (e) {
                    return e.operator == "batch_supply"
                })
            },
            showDetails:function (action) {
                $('.custom-cell-content').addClass("hidden");
                $('#detail-'+action.id).removeClass("hidden");
            }
        }
    })
    var ActionRecords = function (cb) {
        eap.post("/api/shop/oper/query",{
            ".storeId":sessionStorage.getItem("STORE_ID_"),
            ".orderBy":"createTime@desc"
        },function (data) {
            var datas = eap.parseJson(data)
            eap.each(datas.data,function (e) {
                e['operTime'] = eap.dateFormat(new Date(e.createTime),'yyyy-MM-dd hh:mm:ss')
            })
            vm.origin.actionsList = datas.data
            if(typeof cb ==="function")cb();
        })
    }

    actionsRecordInit = function () {
        ActionRecords(setTimeout(function () {
            vm.replenishGoods();
        },100));
   }
})
