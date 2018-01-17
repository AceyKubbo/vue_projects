/**
 * Created by aixl on 2017/8/23.
 */
var sellerAlertInit;
require(['jquery','eap','vue','codeModel'],function($,eap,Vue,cm){
    var vm = new Vue({
        el:'#section-sellerAlert',
        data:{
            params:{limit:50},
            origin:{},
            noticeList:null,
            bookFlag:false,
            waitingNoteCount:0
        },
        methods:{
            returnHome:function () {
                eap.toModView('menu')
            },
            search:function (condition) {
                vm.noticeList = vm.origin.noticeList.filter(function (e) {
                    var flag = true;
                    if(typeof condition ==='function') flag = flag&&condition(e);
                    return flag;
                })
            },
            waitingNote:function () {
                $('#section-sellerAlert a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('#section-sellerAlert a[name="waitingNote"]').addClass('weui-bar__item--on');
                vm.search(function (e) {
                    return e.stauts=="1"
                })
                vm.waitingNoteCount = vm.noticeList.length
            },
            deliveringNote:function () {
                $('#section-sellerAlert a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('#section-sellerAlert a[name="deliveringNote"]').addClass('weui-bar__item--on');
                vm.search(function (e) {
                    return e.stauts=="3"&&e.delivery==userInfo.userId
                })
            },
            closedNote:function () {
                $('#section-sellerAlert a.weui-navbar__item').removeClass('weui-bar__item--on');
                $('#section-sellerAlert a[name="closedNote"]').addClass('weui-bar__item--on');
                vm.search(function (e) {
                    return e.stauts=="4"&&e.delivery==userInfo.userId
                })
            },
            acceptNote:function(notice) {
                eap.postWithRequestBody("/api/delivery/orderTaking",{
                    orderId:notice.id
                },function (data) {
                    console.log(data)
                    alert(data.retmsg)
                    NoticeList(function () {
                        vm.waitingNote();
                    });
                })
            },
            completeNote:function (notice) {
                eap.postWithRequestBody("/api/delivery/orderShipped",{
                    orderId:notice.id,
                    receiptor:userInfo.userId,
                    receiptorInfo:userInfo.userName
                },function (data) {
                    alert(data.retmsg)
                    NoticeList(function () {
                        vm.deliveringNote();
                    });
                })
            },
            book:function () {
                if(vm.bookFlag){
                    eap.post("/api/shop/oper/removeSubscribe",{
                        STORE_ID_:sessionStorage.getItem("STORE_ID_"),
                        OPEN_ID_:userInfo.authId,
                        NOTIFY_TYPE_:'1'
                    },function (data) {
                        alert('取消订阅!')
                        vm.bookFlag=false
                    })
                }else{
                    eap.post("/api/shop/oper/addSubscribe",{
                        STORE_ID_:sessionStorage.getItem("STORE_ID_"),
                        OPEN_ID_:userInfo.authId,
                        NOTIFY_TYPE_:'1'
                    },function (data) {
                        alert('订阅成功')
                        vm.bookFlag=true
                    })
                }
            }
        }
    });
    var userInfo = eap.getUserInfo()
    var NoticeList = function (cb) {
        eap.post('/api/delivery/query',{
            ".extra.STORE_ID_": sessionStorage.getItem("STORE_ID_"),
            // ".extra.TENANT_ID_": eap.getTenantInfo().tenantId,
            ".bizType":'tenant',
            ".orderBy":"requestTime@desc"
        },function (data) {
            var datas = eap.parseJson(data).data;
            eap.each(datas,function (e) {
                e['send_time'] = eap.dateFormat(new Date(e.requestTime),'yyyy-M-d hh:mm:ss')
                e['goodsTotalCount']=0;
                eap.each(e.DeliveryNoteDetail,function (ee) {
                    e.goodsTotalCount = e.goodsTotalCount+Number(ee.goodsCount)
                })
            })
            vm.origin.noticeList = datas;
            vm.search()
            if(typeof cb =="function"){
                cb();
            }
        });
    }
    sellerAlertInit=function () {
        eap.post("/api/shop/oper/isSubscribe",{
            STORE_ID_:sessionStorage.getItem("STORE_ID_"),
            OPEN_ID_:userInfo.authId,
            NOTIFY_TYPE_:'1'
        },function (data) {
            var datas = eap.parseJson(data);
            if(datas.head.RESULT_=="true"){
                vm.bookFlag=true
            }
        })
        NoticeList(function () {
            vm.waitingNote();
        });
    }
    if(sessionStorage.getItem("page")=="delivery"){
        eap.toModView('sellerAlert');
        sellerAlertInit();
    }
});