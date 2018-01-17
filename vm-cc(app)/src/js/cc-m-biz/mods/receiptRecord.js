/**
 * Created by aixl on 2017/8/23.
 */
var receiptRecordInit;
require(['jquery','eap','vue','codeModel'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-receiptRecord',
        data:{
            TotalCount:0,
            RecordCount:50,
            origin:{},
            receiptList:null,
            receiptingCount:0
        },
        methods:{
            returnHome:function () {
                eap.toModView("menu")
            },
            search:function (condition) {
                var tempList = vm.origin.receiptList.filter(function (e) {
                    var flag = true;
                    if(eap.isFunction(condition)) flag = flag&&condition(e);
                    return flag;
                })
                vm.receiptList = tempList.slice(0,Number(tempList.length))
            },
            receipting:function () {
                $('a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('a[name="receipting"]').addClass('weui-bar__item--on');
                vm.search(function (e) {
                    return e.stauts=="3"
                })
                vm.receiptingCount = vm.receiptList.length
            },
            receipted:function () {
                $('a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('a[name="receipted"]').addClass('weui-bar__item--on');
                vm.search(function (e) {
                    return e.stauts=="4"
                })
            },
            completeReceipt:function (notice) {
                eap.postWithRequestBody("/api/delivery/orderShipped",{
                    orderId:notice.id,
                    receiptor:userInfo.userId,
                    receiptorInfo:userInfo.userName
                },function (data) {
                    alert(data.retmsg)
                    ReceiptList({},function () {
                        vm.receipting();
                    });
                })
            },
        }
    });
    var userInfo = eap.getUserInfo();
    var ReceiptList = function (params,cb) {
        eap.post('/api/delivery/query',{
            ".extra.STORE_ID_": sessionStorage.getItem("STORE_ID_"),
            ".extra.TENANT_ID_": eap.getTenantInfo().tenantId,
            ".bizType":'platform',
            ".orderBy":"requestTime@desc"
        },function (data) {
            var datas = eap.parseJson(data);
            if(datas){
                eap.each(datas.data,function (e) {
                    e['send_time'] = eap.dateFormat(new Date(e.requestTime),'yyyy-M-d hh:mm:ss')
                    e['goodsTotalCount']=0;
                    eap.each(e.DeliveryNoteDetail,function (ee) {
                        e.goodsTotalCount = e.goodsTotalCount+Number(ee.goodsCount)
                    })
                })
                vm.origin.receiptList = datas.data;
                if(eap.isFunction(cb))cb(datas);
            }
        })
    }
    receiptRecordInit = function () {
        ReceiptList({},function () {
            vm.receipting();
        });
    }
});