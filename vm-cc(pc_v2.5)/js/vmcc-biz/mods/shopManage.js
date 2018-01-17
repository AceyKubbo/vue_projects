/**
 * Created by apple on 17/11/28.
 */
var shopManageInit
require(['jquery','vue','eap','layer'],function ($,Vue,eap,layer) {
    var vm = new Vue({
        el:'#section-shopManage',
        data:{
            goodSearchParams:{},
            origin:{},
            goodDetail:{},
            choosegoodList:{},
            shopInfo:{
                NAME_:""
            },
            shopGoodList:{},
            modifyGood:{}
        },
        methods:{
            showShopSet:function () {
                $('#shopSetId').modal('toggle')
            },
            showAddGoods:function () {
                if(!eap.isEmpty(vm.shopInfo.NAME_)){
                    $("#addGoodsId").modal('toggle')
                    chooseGoodWarehouse()
                }else {
                    layer.msg('请先修改添加商城名称!')
                }
                vm.goodDetail={
                    PICTURE_:"",
                    NAME_:"",
                    GOODS_ID_:"",
                    CODE_:"",
                    CASH_PRICE_:0,
                    WX_PRICE_:0,
                    ALI_PRICE_: 0
                };
            },
            searchGood:function () {
                var conditions = eap.copyApply({},vm.goodSearchParams);
                vm.choosegoodList = vm.origin.choosegoodList.filter(function (e) {
                    var flag = true;
                    if(conditions.NAME_) flag=flag&&e['NAME_'].indexOf(conditions.NAME_)>=0;
                    if(conditions.CODE_) flag=flag&&e['CODE_'].indexOf(conditions.CODE_)>=0;
                    return flag;
                })
            },
            shopGoodAdd:function (good,goodDetail,modifyGood) {
                if(good){
                    goodDetail.GOODS_ID_ = good.ID_;
                    goodDetail.CODE_=good.CODE_;
                    goodDetail.PICTURE_ = good.PICTURE_;
                    goodDetail.NAME_ = good.NAME_;
                    goodDetail.CASH_PRICE_ = good.CASH_PRICE_ * 0.01;
                    goodDetail.WX_PRICE_ = good.WX_PRICE_ * 0.01;
                    goodDetail.ALI_PRICE_ = good.ALI_PRICE_ * 0.01;
                    modifyGood.GOODS_ID_ = good.ID_;
                    modifyGood.CODE_=good.CODE_;
                    modifyGood.PICTURE_ = good.PICTURE_;
                    modifyGood.NAME_ = good.NAME_;
                    modifyGood.CASH_PRICE_ = good.CASH_PRICE_ * 0.01;
                    modifyGood.WX_PRICE_ = good.WX_PRICE_ * 0.01;
                    modifyGood.ALI_PRICE_ = good.ALI_PRICE_ * 0.01;
                    $("#shopChooseGoods").modal('hide')
                }
            },
            cleanGood:function (goodDetail) {
                if(goodDetail){
                    goodDetail.GOODS_ID_ = "";
                    goodDetail.CODE_="";
                    goodDetail.PICTURE_="";
                    goodDetail.NAME_="";
                    goodDetail.CASH_PRICE_=0;
                    goodDetail.WX_PRICE_=0;
                    goodDetail.ALI_PRICE_=0;
                    vm.goodDetail = goodDetail
                };
            },
            editType:function (shopInfo) {
                $('#modify').addClass('hidden')
                $('#keepShow').addClass('hidden')
                $('#modifyShow').removeClass('hidden')
                $('#keepModify').removeClass('hidden')
            },
            keepModifyShopName:function (shopInfo) {
                if(!eap.isEmpty(shopInfo.ID_)){
                    eap.post('/api/shop/data/crud',{
                        dataModelName:"T_SHOP_COUNTER",
                        STORE_ID_ :sessionStorage.getItem('STORE_ID_'),
                        TYPE_:"net",
                        NAME_:shopInfo.NAME_,
                        ID_:shopInfo.ID_
                    },function (datas) {
                        var data =eap.parseJson(datas)
                        if(data.head.RETCODE != "0"){
                            layer.msg(data.head.RETMSG)
                            return
                        }
                        layer.msg(data.head.RETMSG)
                        $('#keepShow').removeClass('hidden')
                        $('#modifyShow').addClass('hidden')
                        $('#keepModify').addClass('hidden')
                        $('#modify').removeClass('hidden')
                        shopManage()
                    })
                }else {
                    eap.post('/api/shop/counter/create',{
                        className:'shopCounter',
                        STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                        TYPE_:"net",
                        NAME_:shopInfo.NAME_,
                    },function (data) {
                        var datas = eap.parseJson(data)
                        if(datas.head.RETCODE != '0'){
                            layer.msg(datas.head.RETMSG)
                            return
                        }
                        layer.msg(datas.head.RETMSG)
                        shopManage()
                        $('#keepShow').removeClass('hidden')
                        $('#modifyShow').addClass('hidden')
                        $('#keepModify').addClass('hidden')
                        $('#modify').removeClass('hidden')
                    })
                }
            },
            submitAddGood:function (goodDetail) {
                if(eap.isEmpty(goodDetail.PLACE_NUM_)){

                }
                if(eap.isEmpty())
             var params = eap.copyApply({
                 accessToken:sessionStorage.getItem('AccessToken'),
                 COUNTER_ID_:vm.shopInfo.ID_,
                 className:'shopCounterGoods',
                 GOODS_ID_:goodDetail.GOODS_ID_,
                 PLACE_NUM_:goodDetail.PLACE_NUM_,
                 MAX_COUNT_:'999'
             },goodDetail)
                eap.post('/api/shop/counter/'+vm.shopInfo.ID_+'/addGoods',params,function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.head.RETCODE != '0'){
                        layer.msg(datas.head.RETMSG)
                        return
                    }
                    $('#addGoodsId').modal('hide')
                    shopGoodsList()
                })
            },
            modifyShopGoods:function (shopGood) {
                if(shopGood){
                    vm.modifyGood = shopGood
                    $('#modifyGoodsId').modal('toggle')
                    chooseGoodWarehouse()
                }
            },
            submitModifyShopGood:function (modifyGood) {
                eap.post("/api/shop/counter/"+vm.shopInfo.ID_+"/editGoods",eap.copyApply(modifyGood,{
                    className:'shopCounterGoods',
                    STORE_ID_:sessionStorage.getItem('STORE_ID_')
                }),function (data) {
                    var datas = eap.parseJson(data);
                    if(datas.head.RETCODE=="0"){
                        layer.msg("操作成功!");
                        shopGoodsList()
                        $('#modifyGoodsId').modal('hide')
                    }else{
                        layer.alert(datas.head.RETMSG);
                    }
                })
            }
        }
    })
    var chooseGoodWarehouse = function (params) {
        eap.post('/api/shop/data/query',eap.copyApply(params,{
            dataModelName:"V_SHOP_GOODS",
            STORE_ID_:sessionStorage.getItem('STORE_ID_'),
            STATUS_:'1'
        }),function (datas) {
            vm.origin.choosegoodList = eap.parseJson(datas).data;
            vm.searchGood()
        })
    }
    var shopManage = function () {
        vm.shopInfo = {
            NAME_:''
        }
        eap.post('/api/shop/data/query',{
            dataModelName:"T_SHOP_COUNTER",
            STORE_ID_ :sessionStorage.getItem('STORE_ID_'),
            TYPE_:"net"
        },function (data) {
            var datas = eap.parseJson(data).data
            if(datas.length != 0){
                $('#addShopButton').hide()
                vm.shopInfo = datas[0]
            }
        })
    }
    var shopGoodsList = function (params) {
        var params={
            dataModelName:"V_SHOP_COUNTER_GOODS",
            accessToken:sessionStorage.getItem('AccessToken'),
            COUNTER_ID_:vm.shopInfo.ID_,
            STORE_ID_:sessionStorage.getItem('STORE_ID_'),
            COUNTER_TYPE_:'net'
        }
        eap.post('/api/shop/data/query',params,function (data) {
            var datas = eap.parseJson(data)
            if(datas){
                eap.each(datas.data,function (e) {
                    e['CASH_PRICE_LABEL'] = parseFloat(e.CASH_PRICE_)*0.01
                    e['ALI_PRICE_LABEL']=parseFloat(e.ALI_PRICE_)*0.01
                    e['WX_PRICE_LABEL']=parseFloat(e.WX_PRICE_)*0.01

                })
                vm.shopGoodList = datas.data
            }
        })
    }
    shopManageInit =function () {
        shopManage()
        shopGoodsList()
    }
})