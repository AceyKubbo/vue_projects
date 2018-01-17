/**
 * Created by apple on 17/10/16.
 */
var HomepageInit,ReturnHomepage
require(['jquery','eap','vue','weui','codeModel'],function ($,eap,Vue,weui,codeModel) {
    var pageParams = eap.getUrlParams();
    var counterSn = pageParams['mid'] || 's00000002';
    var homepage = new Vue({
        el:'#section-homepage',
        data:{
            homepageData:{},
            goodsList:null,
            origin:{},
            shoppingcartDetailList:null,
            goodsDetail:{},
            params:{}
        },
        methods:{
            jumpMogeGrid:function () {
                $('#mogeGrid').show()
                $('#mogeNet').hide()
                $('#mogeGridHeader').addClass('weui-bar__item--on')
                $('#mogeNetHeader').removeClass('weui-bar__item--on')
                $("#totalFloor").addClass('side-navbar__item--on')
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "grid"
                })
            },
            jumpMogeNet:function () {
                $('#mogeNet').show()
                $('#mogeGrid').hide()
                $('#mogeGridHeader').removeClass('weui-bar__item--on')
                $('#mogeNetHeader').addClass('weui-bar__item--on')
                $(".side-navbar__item").removeClass('side-navbar__item--on')
                $("#totalSort").addClass('side-navbar__item--on')
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "net"
                })
            },
            jumpHomepage:function () {
                eap.toModView("homepage")
            },
            jumpPersonalCenter:function () {
                eap.toModView('personalCenter')
                personalCenterInit()
            },
            jumpPayment:function () {
                eap.toModView('payment')
                PaymentInit()
            },
            shoppingDetail:function () {
                if($("#shoppingCartDetail").hasClass("weui-popup__container--visible")){
                    $.closePopup()
                }else{
                    $("#shoppingCartDetail").popup()
                }
            },
            goodsDetailShow:function (goods) {
                if(goods){
                    if(goods.COUNTER_TYPE_ == 'grid'){
                        $("#elseDetailStockId").addClass('hidden')
                        $("#gridDetailStockId").removeClass('hidden')
                    }else {
                        $("#gridDetailStockId").addClass('hidden')
                        $("#elseDetailStockId").removeClass('hidden')
                    }
                    homepage.goodsDetail = goods
                }
               $("#goodsDetailBackground").addClass("vmshop-mask--visible")
               $("#goodsDetail").addClass("vmshop-dialog--visible")
            },
            //net分类切换
            switchSort:function () {
                $(".side-navbar__item").removeClass('side-navbar__item--on')
                $(event.currentTarget).addClass('side-navbar__item--on')
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "net" &&  e.TYPE_ == $(event.currentTarget).attr('value')
                })
            },
            switchSTotalSort:function () {
                $(".side-navbar__item").removeClass('side-navbar__item--on')
                $(event.currentTarget).addClass('side-navbar__item--on')
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "grid"
                })
            },
            //shelf层数切换
            switchFloor:function () {
                $(".side-navbar__item").removeClass('side-navbar__item--on')
                $(event.currentTarget).addClass('side-navbar__item--on')
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "grid" &&  e.FLOOR_NUM_ == $(event.currentTarget).attr('value')
                })
            },
            switchTotalFloor:function () {
                $(".side-navbar__item").removeClass('side-navbar__item--on')
                $(event.currentTarget).addClass('side-navbar__item--on')
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "grid"
                })
            },
            reduceNumber:function (goods) {
                var datas=eap.parseJson(sessionStorage.data)
                $.ajax({
                    url: '/api/shop/cart/'+counterSn+'/editGoods',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        accessToken: sessionStorage.getItem('AccessToken'),
                        className: "shopOrderDetail",
                        COUNTER_GOODS_ID_: goods.ID_,
                        COUNT_: -1,
                        COUNTER_SN_: goods.COUNTER_SN_,

                    }, success: function (data) {
                        if(data.head.RETCODE != "0"){
                            $.toast(codeModel.retMsg.get(data.head.RETCODE), "text")
                            return;
                        }
                        if(datas.head.GOODS_COUNT_ == 1){
                            goods.BUY_COUNT_ = goods.BUY_COUNT_ - 1
                            $.closePopup()
                            $("#shoppingCart").addClass('hidden')
                        }else {
                            goods.BUY_COUNT_ = goods.BUY_COUNT_ - 1
                        }
                        ShoppingcartList();
                    }
                })

            },
            addNumber:function (goods) {
                $.ajax({
                    url:'/api/shop/cart/'+counterSn+'/editGoods',
                    type:'POST',
                    dataType:'json',
                    data:{
                        accessToken:sessionStorage.getItem('AccessToken'),
                        className:"shopOrderDetail",
                        COUNTER_GOODS_ID_ : goods.ID_,
                        COUNT_:1,
                    },success:function (data) {
                        if(data.head.RETCODE != "0"){
                            $.toast(codeModel.retMsg.get(data.head.RETCODE), "text")
                            return;
                        }
                        goods.BUY_COUNT_ = goods.BUY_COUNT_ + 1
                        ShoppingcartList()
                    }
                })
            },
            hideBackground:function () {
                $("#goodsDetailBackground").removeClass("vmshop-mask--visible")
                $("#goodsDetail").removeClass("vmshop-dialog--visible")
            },
            shoppingcartGoodsreduce:function (goods) {
                //var datas=eap.parseJson(sessionStorage.data)
                $.ajax({
                    url: '/api/shop/cart/'+counterSn+'/editGoods',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        accessToken: sessionStorage.getItem('AccessToken'),
                        className: "shopOrderDetail",
                        COUNTER_GOODS_ID_: goods.COUNTER_GOODS_ID_,
                        COUNT_: -1,
                        COUNTER_SN_: goods.COUNTER_SN_,

                    }, success: function (data) {
                        if(data.head.RETCODE != "0"){
                            $.toast(codeModel.retMsg.get(data.head.RETCODE), "text")
                            return;
                        }
                        if(homepage.shoppingcartDetailList.length == 1){
                            eap.each(homepage.shoppingcartDetailList,function (e) {
                                e['COUNT_'] = 0
                            })
                        }
                        HomepageInit()
                    }
                })
            },
            shoppingcartGoodsAdd:function (goods) {
                $.ajax({
                    url:'/api/shop/cart/'+counterSn+'/editGoods',
                    type:'POST',
                    dataType:'json',
                    data:{
                        accessToken:sessionStorage.getItem('AccessToken'),
                        className:"shopOrderDetail",
                        COUNTER_GOODS_ID_ : goods.COUNTER_GOODS_ID_,
                        COUNT_:1,

                    },success:function (data) {
                        if(data.head.RETCODE != "0"){
                            $.toast(codeModel.retMsg.get(data.head.RETCODE), "text")
                            return;
                        }
                        //goods.COUNT_ = goods.COUNT_ + 1
                        HomepageInit()
                    }
                })
            },
            cleanshoppingCart:function () {
                $.ajax({
                    url:'/api/shop/cart/'+counterSn+'/clean',
                    type:'POST',
                    dataType:'json',
                    data:{
                        accessToken:sessionStorage.getItem('AccessToken'),
                        className:"shopOrderDetail",
                        COUNTER_SN_:counterSn
                    },success:function (data) {
                        $("#shoppingCart").addClass('hidden')
                        $.closePopup()
                        eap.each(homepage.shoppingcartDetailList,function (e) {
                            e['COUNT_'] = 0
                        })
                        HomepageInit()
                    }
                })
            }
        }
    })
    var GoodList = function (params) {
        eap.ajax('/api/shop/counter/'+counterSn+'/queryGoods','POST',true,{
            goodsRange :'net'
        },function (data) {
            var datas = eap.parseJson(data)
            console.info(datas)
            //二维码不是柜台二维码
            if(datas.head.RETCODE == '107'){
                $('#noCounter').removeClass('hidden')
                return
            }
            homepage.homepageData.DEVICE_TYPE_ = datas.head.DEVICE_TYPE_
            var shelfData = [];
            eap.each(datas.data,function (ee) {
                //
                ee['WX_PRICE_'] = (ee.WX_PRICE_ * 0.01).toFixed(2)
                var buyGoodsCount = 0
                if(homepage.shoppingcartDetailList){
                    eap.each(homepage.shoppingcartDetailList,function (e) {
                        if(ee.COUNTER_TYPE_ == e.COUNTER_TYPE_ && ee.ID_ == e.COUNTER_GOODS_ID_){
                            buyGoodsCount =  buyGoodsCount + parseInt(e.COUNT_)
                        }
                    })
                }
                ee['BUY_COUNT_'] = buyGoodsCount
                if(ee.SHOP_COUNT_ < 0){
                    ee['SHOP_COUNT_'] = 0
                }

                //货架数据
                // var floorData;
                // if(!eap.isEmpty(ee.FLOOR_NUM_)){
                //     floorData = shelfData.find(function(data){
                //         return data["floorNum"] == ee.FLOOR_NUM_;
                //     });
                //     if(floorData == null){
                //         floorData = {floorNum:ee.FLOOR_NUM_,list : []};
                //         shelfData.push(floorData);
                //     }
                //     floorData.list.push(ee);
                // }
            });
            homepage.homepageData.STORE_NAME_ = datas.head.STORE_NAME_
            homepage.origin.goodsList = datas.data
            if($('#mogeGridHeader').hasClass('weui-bar__item--on')){
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "grid"
                })
            }else if($('#mogeNetHeader').hasClass('weui-bar__item--on')){
                homepage.goodsList = homepage.origin.goodsList.filter(function (e) {
                    return e.COUNTER_TYPE_ == "net"
                })
            }
        })
    }

    var authInfo = {
        "authAccount":sessionStorage.getItem('authAccount'),
        "authCode":pageParams[eap.isAliPay()?"auth_code":"code"],
        "authChannel":eap.isAliPay() ? "alipay" : "wx_pub"
    }

    if(eap.isWeiXin() || eap.isAliPay()){
        $.ajax({
            url:'/api/uum/security/authUser',
            type:'POST',
            dataType:'json',
            async :false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(authInfo),
            success:function (datas) {
                if(datas.retcode == 0){
                    sessionStorage.setItem('AccessToken',datas.accessToken);
                    sessionStorage.setItem('openid',datas.userAuthInfo.authId);
                    //读取用户认证扩展信息
                    eap.each(datas.userAuthInfo.extra,function(entry){
                        if(entry.key=="userId"){
                            sessionStorage.setItem('buyerid',entry.value);
                        }
                        if(entry.key == 'name'){
                            sessionStorage.setItem('userName',entry.value)
                        }
                        if(entry.key == 'avatar'){
                            sessionStorage.setItem('userPicture',entry.value)
                        }

                    });
                }
            },
            error:function (msg) {
            }
        })
    }else {
        sessionStorage.setItem('AccessToken','Uwpy3jN+I6316fCuu0eLi+VNG406AtV0AlCFfu0V9xc=')
        sessionStorage.setItem('openid','o2e7DwO8LJO_gHbUGkOaWmes6kM8')
    }
    var ShoppingcartList = function (params) {
        eap.ajax('/api/shop/cart/'+counterSn+'/queryGoods','POST',true,{
            accessToken:sessionStorage.getItem('AccessToken')
        },function (data) {
            var datas = eap.parseJson(data)
            sessionStorage.data = data
            homepage.homepageData.GOODS_COUNT_ = datas.head.GOODS_COUNT_
            homepage.homepageData.QR_NAME_ = datas.head.QR_NAME_
            homepage.homepageData.STORE_NAME_ = datas.head.STORE_NAME_
            if(datas.head.COUNTER_TYPE_ == 'grid'   && datas.head.NET_FLAG_ == '1'){
                if($('#mogeGridHeader').hasClass('weui-bar__item--on')){
                    $('#mogeNetHeader').removeClass('weui-bar__item--on')
                }else if($('#mogeNetHeader').hasClass('weui-bar__item--on')){
                    $('#mogeGridHeader').removeClass('weui-bar__item--on')
                }else{
                    $('#mogeGridHeader').addClass('weui-bar__item--on')
                    $('#mogeGrid').addClass('weui-tab__bd-item--active')
                }
                if(datas.head.DEVICE_TYPE_ == 'grid' || datas.head.DEVICE_TYPE_ == 'agrid'){
                    $('#gridDetailsId').removeClass('hidden')
                    $('#shelfDetailsId').addClass('hidden')
                }else if(datas.head.DEVICE_TYPE_ == 'shelf'){
                    $('#gridDetailsId').addClass('hidden')
                    $('#shelfDetailsId').removeClass('hidden')
                }
            }
            if(datas.head.COUNTER_TYPE_ == 'grid'   && datas.head.NET_FLAG_ == '0'){
                $('#mogeGridHeader').addClass('weui-bar__item--on')
                $('#mogeGrid').addClass('weui-tab__bd-item--active')
                $('#mogeNetHeader').addClass('hidden')
                if(datas.head.DEVICE_TYPE_ == 'grid'|| datas.head.DEVICE_TYPE_ == 'agrid'){
                    $('#gridDetailsId').removeClass('hidden')
                    $('#shelfDetailsId').addClass('hidden')
                }else if(datas.head.DEVICE_TYPE_ == 'shelf'){
                    $('#gridDetailsId').addClass('hidden')
                    $('#shelfDetailsId').removeClass('hidden')
                }
            }
            if(datas.head.COUNTER_TYPE_ == 'net'){
                $('#mogeNetHeader').addClass('weui-bar__item--on')
                $('#mogeNet').addClass('weui-tab__bd-item--active')
                $('#mogeGridHeader').addClass('hidden')
            }
            if(!eap.isEmpty(datas.data)){
                $("#shoppingCart").removeClass('hidden')
                var totalMoney = 0
                eap.each(datas.data,function (e) {
                    e.GOODS_PRICE_LABEL = e.COUNT_ * ((e.GOODS_PRICE_*0.01)).toFixed(2)
                    totalMoney = totalMoney + e.GOODS_PRICE_LABEL
                })
                homepage.homepageData.totalMoney = totalMoney.toFixed(2)
                homepage.shoppingcartDetailList = datas.data
            }else{
                $("#shoppingCart").addClass('hidden')
                $.closePopup()
                eap.each(datas.data,function (e) {
                    e['COUNT_'] = 0
                })
                eap.each(homepage.goodsList,function (e) {
                    e['BUY_COUNT_'] = 0
                })
            }
        })
    }
    HomepageInit = function () {
        ShoppingcartList()
        GoodList()
    }
    ReturnHomepage=function () {
        location.reload()
        $("#shoppingCart").addClass('hidden')
        $.closePopup()
    }
    HomepageInit()
})