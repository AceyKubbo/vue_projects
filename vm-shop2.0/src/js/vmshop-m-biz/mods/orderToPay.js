/**
 * Created by apple on 17/10/17.
 */
var orderToPayInit
require(['jquery','eap','vue','layer'],function ($,eap,Vue,layer) {
    var pageParams = eap.getUrlParams();
    var counterSn = pageParams['mid'];
    var payment = new Vue({
        el:'#section-orderToPay',
        data:{
            paymentDetailList:{},
            paymentData:{}
        },
        methods:{
            returnHomepage:function () {
                eap.toModView('homepage')
            },
            pay:function () {
                switch (payment.getChannel()){
                    case 1://微信
                        startPayTool()
                        break;
                    case 2://支付宝
                        startPayTool();
                        break;
                    default:
                        startPayTool();
                        break

                }
            },
            getChannel:function () {
                return eap.isAliPay()?2:eap.isWeiXin()?1:0;
            },
            back:function () {
                window.location.href='biz.html'
            }
        }
    })
    var startPayTool = function () {
        switch(payment.getChannel()){
            case 1://微信
                $.ajax({
                    url:'/api/shop/order/'+counterSn+'/topay',
                    type:'POST', dataType:'json',
                    data:{
                        accessToken:sessionStorage.getItem('AccessToken'),
                        channel:'wx_pub',
                        COUNTER_SN_:counterSn,
                        openid:sessionStorage.getItem('openid'),
                        subject:payment.paymentData.NAME_
                    },success:function (data) {
                        $('#showOrderToPayMasklayer').addClass('hidden')
                        if(data.head.RETCODE != "0"){
                            if(data.head.RETCODE == '99'){
                                $.toast("设备不在线请稍后再试！", "text")
                                return;
                            }
                            $.toast(data.head.RETMSG, "text")
                            return;
                        }
                        var credential = eap.parseJson(data.head.credential);
                        WeixinJSBridge.invoke("getBrandWCPayRequest",credential,
                            function(res){
                                switch(res.err_msg){
                                    case "get_brand_wcpay_request:ok":
                                        eap.toModView('homepage');
                                        ReturnHomepage();
                                        break;
                                    case "get_brand_wcpay_request:fail":
                                        $('#showOrderToPayMasklayer').addClass('hidden')
                                        $.toast(res.err_desc, "text")
                                        eap.toModView('orderpage');
                                        orderInit()
                                        break;
                                    case "get_brand_wcpay_request:cancel":
                                        $('#showOrderToPayMasklayer').addClass('hidden')
                                        $.toast("支付过程中用户取消!", "text")
                                        eap.toModView('homepage');
                                        break;
                                    default:
                                        break;
                                }
                            }
                        );
                    },
                    error:function () {
                        layer.msg('服务不可用!')
                        $('#showOrderToPayMasklayer').addClass('hidden')
                    }
                });
                break;
            case 2:
                $.ajax({
                    url:'/api/shop/cart/'+counterSn+'/topay',
                    type:'POST',  dataType:'json',
                    data:{
                        accessToken:sessionStorage.getItem('AccessToken'),
                        channel:'alipay_wap',
                        COUNTER_SN_:counterSn,
                        subject:payment.paymentData.NAME_,
                        buyerid:sessionStorage.getItem('buyerid')
                    },success:function (data) {
                        $('#showOrderToPayMasklayer').addClass('hidden');
                        if(data.head.RETCODE != "0"){
                            if(data.head.RETCODE == '99'){
                                $.toast("设备不在线请稍后再试！", "text")
                                return;
                            }
                            $.toast(data.head.RETMSG, "text")
                            $('#showOrderToPayMasklayer').addClass('hidden')
                            return;
                        }
                        AlipayJSBridge.call("tradePay", {
                            tradeNO: data.head.credential
                        }, function (data) {
                            if(data.resultCode=="9000"){
                                eap.toModView('homepage');
                                ReturnHomepage();
                            } else {
                                $.toast(data.memo, "text");
                            }
                        });
                    },
                    error:function () {
                        layer.msg('服务不可用!')
                        $('#showOrderToPayMasklayer').addClass('hidden')
                    }
                })
                break
            default:
                break;
        }
    }
    orderToPayInit = function () {
        $.ajax({
            url:'/api/shop/order/'+sessionStorage.getItem('orderId')+'/getOrderDetail',
            type:'POST',
            dataType:'json',
            data:{
                accessToken:sessionStorage.getItem('AccessToken')
            },
            success:function (datas) {
                console.info(datas)
                var totalMoney = 0
                eap.each(datas.data,function (e) {
                    e['GOODS_PRICE_LABEL'] = e.COUNT_ * (e.GOODS_PRICE_*0.01)
                    totalMoney = totalMoney + e.GOODS_PRICE_LABEL
                    e['GOODS_PRICE_'] = e.GOODS_PRICE_ * 0.01
                })
                //payment.paymentData.NAME_ = datas.head.NAME_.replace(/[^0-9]/ig,"")
                payment.paymentData.NAME_ = sessionStorage.getItem('orderSubject')
                payment.paymentData.totalMoney = totalMoney.toFixed(2);
                payment.paymentDetailList = datas.data;
            }
        })
    }
})