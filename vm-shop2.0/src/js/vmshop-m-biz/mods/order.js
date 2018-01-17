/**
 * Created by apple on 17/10/18.
 */
var orderInit
require(['jquery','eap','vue','layer'],function ($,eap,Vue,layer) {
    var order = new Vue({
        el:'#section-orderpage',
        data:{
            orderList:[],
            orderDetails:{},
            orderDetailsList:[]
        },
        methods:{
            showOrderDetail:function (e) {
                if($(event.currentTarget.parentNode.parentNode.nextElementSibling).is(':hidden')){
                    $('.goods_purchased').hide()
                    $(event.currentTarget.parentNode.parentNode.nextElementSibling).show()
                    $.ajax({
                        url:'/api/shop/order/'+e.ID_+'/getOrderDetail',
                        type:'POST',
                        dataType:'json',
                        async :false,
                        data:{
                            accessToken:sessionStorage.getItem('AccessToken')
                        },
                        success:function (data) {
                            var totalCount = 0
                            eap.each(data.data,function (ee) {
                                ee['GOODS_PRICE_UNIT'] = ee.GOODS_PRICE_*0.01
                                ee['GOODS_PRICE_LABEL'] = ee.COUNT_ * (ee.GOODS_PRICE_*0.01)
                            })
                            order.orderDetails = data.data
                        },
                        error:function (msg) {
                            alert(JSON.stringify(msg))
                        }
                    })
                }else {
                    $(event.currentTarget.parentNode.parentNode.nextElementSibling).hide()
                }

            },
            toPay:function (order) {
                eap.toModView('orderToPay')
                sessionStorage.setItem('orderId',order.ID_)
                sessionStorage.setItem('orderSubject',order.ORDER_SUBJECT_)
                orderToPayInit()
            },
            returnPersonalCenter:function () {
                eap.toModView('personalCenter')
            }
        },
        // updated:function () {
        //     $($(".order-cells")[0].firstChild.firstChild.nextElementSibling).show()
        // }

    })
    var orderList = function () {
        $.ajax({
            url:'/api/shop/order/queryUserOrders',
            type: 'POST',
            dataType: 'json',
            data:{
                accessToken:sessionStorage.getItem('AccessToken'),
                STATUS_:"2",
                orderBy:"CREATE_TIME_@desc",
                start : "0",
                limit : "20",
                PAY_STATUS_:"2||3"
            },
            success:function (data) {
                if(data.head.RETCODE != "0"){
                    $.toast(data.head.RETMSG, "text")
                    return;
                }
                var orderArr = []
                console.info(data.data)
                if(data.data.length != 0){
                    //$('#orderLoadmore').hide()
                    eap.each(data.data,function (e) {
                        e['ORDER_SUBJECT_'] = e.ORDER_SUBJECT_;
                        e['PAY_AMOUNT_'] = e.PAY_AMOUNT_ * 0.01
                    })
                    order.orderList = orderArr.sort(function (a,b) {
                        return (new Date(b.CREATE_TIME_).getTime() - new Date(a.CREATE_TIME_).getTime())
                    })
                    order.orderList = data.data
                }else {
                    $('#noOrder').removeClass('hidden')
                    //$('#orderNothing').show()
                }

            }
        })
    }
    orderInit = function () {
        orderList()

    }
})