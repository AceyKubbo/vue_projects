/**
 * Created by only on 2016/10/23.
 */
var StoreInit;
require(['jquery','eap','vue','weui'],function($,eap,Vue){
    var vm = new Vue({
        el:'#section-store',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            origin:{},
            storeList:null
        },
        methods:{
            search:function (condition) {
                var conditions =eap.copyApply({},vm.params);
                vm.RecordCount=50;
                var tempList = vm.origin.storeList.filter(function (e) {
                    var flag = true;
                    if(typeof condition ==='function') flag = flag&&condition(e);
                    if(conditions.deliver) flag = flag&&e['consignee'].indexOf(conditions.deliver)>=0;
                    return flag;
                })
                vm.TotalCount = tempList.length;
                vm.RecordCount = vm.RecordCount>vm.TotalCount?vm.TotalCount:vm.RecordCount;
                vm.storeList = tempList.slice(0,Number(vm.RecordCount))
            },
            toMenu:function (store) {
                sessionStorage.setItem("STORE_ID_",store.ID_);
                sessionStorage.setItem("STORE_NAME_",store.NAME_);
                location.href="biz.html"
            },
            toSelectTenant:function () {
                eap.toModView('tenant');
                selectTenantInit();
            }
        }
    });
    var StoreList = function (cb) {
        eap.post('/api/shop/data/query',{
            dataModelName:'V_SHOP_STORE',
        },function (data) {
            var datas = eap.parseJson(data);
            vm.origin.storeList = datas.data
            if(eap.isFunction(cb)){
                cb();
            }
        })
    }
    StoreInit = function () {
        StoreList(function () {
            if(vm.origin.storeList.length==1) {
                vm.toMenu(vm.origin.storeList[0]);
            }else {
                vm.search()
            }
        });
    }
});