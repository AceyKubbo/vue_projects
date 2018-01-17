/**
 * Created by aixl on 2017/8/23.
 */
var deviceItemInit;
require(['jquery','eap','vue','codeModel','weui'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-deviceItem',
        data:{
            params:{},
            origin:{},
            deviceItems:[],
            deviceInfo:{}
        },
        methods:{
            returnHome:function () {
                eap.toModView('menu')
            },
            search:function (condition) {
                var tempList = vm.origin.deviceItems?vm.origin.deviceItems.filter(function (e) {
                    var flag = true;
                    if(typeof condition ==='function') flag = flag&&condition(e);
                    return flag;
                }):[]
                vm.deviceItems = tempList.slice(0,Number(tempList.length))
            },
            allPassway:function (){
                $('#section-deviceItem a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('#allPassway').addClass('weui-bar__item--on');
                ItemList(vm.deviceInfo);
            },
            shortPassway:function () {
                $('#section-deviceItem a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('#shortPassway').addClass('weui-bar__item--on');
                vm.search(function (e) {
                    return e.count<e.max_count
                })
            },
            fullPassway:function () {
                $('#section-deviceItem a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('#fullPassway').addClass('weui-bar__item--on');
                vm.search(function (e) {
                    return e.count>=e.max_count
                })
            },
            openPassway:function (item) {
                if(item.count==item.max_count){
                    eap.toModView('goodsChange');
                    goodsChangeInit(item);
                }else{
                    $.showLoading("正在执行...");
                    eap.post("/api/shop/oper/replenishment",{
                        COUNTER_ID_:item.COUNTER_ID_,
                        COUNTER_GOODS_ID_:item.ID_,
                        COUNT_:1
                    },function (data) {
                        var datas = eap.parseJson(data);
                        $.hideLoading();
                        if(datas.head.RETCODE!="0")$.toast(cm.retMsg.get(datas.head.RETCODE),'text')
                        else {
                            $.toast("操作完毕!",'text')
                            ItemList(vm.deviceInfo,function () {
                                vm.shortPassway()
                            })
                        }
                    })
                }
            },
            openAllPassways:function () {
                $.showLoading("正在执行...");
                eap.post("/api/shop/oper/replenishments",{
                    COUNTER_ID_:vm.deviceInfo.COUNTER_ID_
                },function (data) {
                    var datas = eap.parseJson(data);
                    $.hideLoading();
                    if(datas.head.RETCODE!="0")$.toast(cm.retMsg.get(datas.head.RETCODE),'text')
                    else $.toast("操作完毕!",'text')
                });
            },
            addCount:function (detail) {
                detail.SHORT_COUNT_ = Number(detail.SHORT_COUNT_)+1
            },
            decCount:function (detail) {
                detail.SHORT_COUNT_ = Number(detail.SHORT_COUNT_)-1
                if(detail.SHORT_COUNT_<0){
                    detail.SHORT_COUNT_=0;
                }
            },
            submitActions:function () {
                $.showLoading("正在执行...");
                var details = [];
                eap.each(vm.deviceItems,function (e) {
                    if(Number(e.SHORT_COUNT_)>0){
                        details.push([e.ID_,e.COUNT_,e.SHORT_COUNT_].join("_"))
                    }
                })
                if(eap.isEmpty(details.join(','))){
                    $.hideLoading();
                    $.alert("没有补货信息,请确认补货信息!")
                    return;
                }else{
                    eap.post("/api/shop/oper/replenishments",{
                        COUNTER_ID_:vm.deviceInfo.COUNTER_ID_,
                        DETAIL_:details.join(',')
                    },function () {
                        $.hideLoading();
                        if(datas.head.RETCODE!="0")$.toast(cm.retMsg.get(datas.head.RETCODE),'text')
                        else {
                            $.confirm("补货成功,是否继续补货!",function () {
                                deviceItemInit({mid:vm.deviceInfo.mid})
                            },function() {
                                vm.returnHome();
                            })
                        }
                    });
                }
            }
        }
    });
    var ItemList = function (params,cb) {
        if(params['mid']){
            eap.postWithRequestBody('/api/shop/counter/'+params['mid']+'/queryGoods',{},function (data) {
                vm.deviceInfo = eap.copyApply(vm.deviceInfo,data.head);
                eap.each(data.data,function (e) {
                    e['count'] = Number(e.COUNT_)
                    e['max_count'] = Number(e.MAX_COUNT_)
                    if(vm.deviceInfo.DEVICE_TYPE_=="shelf")e.SHORT_COUNT_=null;
                })
                vm.origin.deviceItems=data.data.sort(function (a,b) {
                    return vm.deviceInfo.DEVICE_TYPE_=="shelf"?Number(a.FLOOR_NUM_)-Number(b.FLOOR_NUM_):Number(a.PLACE_NUM_)-Number(b.PLACE_NUM_)
                });
                if(typeof cb==="function")cb();
            })
        }else{
            $.alert("设备不存在!");
            vm.returnHome()
        }

    }
    deviceItemInit = function (params) {
        if(params){
            vm.deviceInfo.mid = params.mid;
            ItemList(params,setTimeout(function(){
                if(vm.deviceInfo.DEVICE_TYPE_=="grid"||vm.deviceInfo.DEVICE_TYPE_=="agrid"){
                    vm.shortPassway();
                }else{
                    vm.deviceItems = vm.origin.deviceItems.sort(function (a,b) {
                        return vm.deviceInfo.DEVICE_TYPE_=="shelf"?Number(a.FLOOR_NUM_)-Number(b.FLOOR_NUM_):Number(a.PLACE_NUM_)-Number(b.PLACE_NUM_)
                    })
                }
            },100));
        }
    }
});