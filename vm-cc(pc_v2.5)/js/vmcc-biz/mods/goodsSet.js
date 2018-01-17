var goodsSetInit;
require(['jquery','eap','vue','aliyun-oss','fileinput','jstree'],function($,eap,Vue,OSS){
    //阿里OSS js客户端
    var OssClient;
    var  vm = new Vue({
        el:'#section-goodsSet',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{
                limit:50,
            },
            goodParams:{},
            goodList:null,
            goodLib:null,
            goodDetail:{},
            goodTypeOptions:null,
            goodUnitOptions:null,
            checkboxGoodLibList:[],
            origin:{}
        },
        methods:{
            changeTab:function (flag) {
                switch(flag){
                    case 'normal':
                        vm.RecordCount=50;
                        vm.search(function (e) {
                            return e.STATUS_ == 1
                        })
                        break;
                    case 'stop':
                        vm.RecordCount=50;
                        vm.search(function (e) {
                            return e.STATUS_ == 2
                        })
                        break;
                    default:
                        vm.GoodList();
                        break;
                }

            },
            loadMore:function () {
                vm.RecordCount+=50;
                vm.searchGood()
            },
            startGood:function (good) {
                if(good){
                    eap.post('/api/shop/data/crud',eap.copyApply(good,{
                        dataModelName:'T_SHOP_GOODS',
                        STATUS_:1
                    }),function() {
                        layer.msg('商品已启用!');
                        vm.GoodList();
                    })
                }
            },
            stopGood:function (good) {
                if(good){
                    eap.post('/api/shop/data/crud',eap.copyApply(good,{
                        dataModelName:'T_SHOP_GOODS',
                        STATUS_:2
                    }),function() {
                        layer.msg('商品已停用!');
                        vm.GoodList();
                    })
                }
            },
            addGood:function () {
                $('#GoodsAdd').modal('toggle')
                vm.checkboxGoodLibList=[]
            },
            editGood:function (good) {
                if(good){
                    good['title']='编辑商品';
                    good.COST_PRICE_LABEL =eap.toMoney(good.COST_PRICE_*0.01)
                    good.WX_PRICE_LABEL =eap.toMoney(good.WX_PRICE_*0.01)
                    good.ALI_PRICE_LABEL =eap.toMoney(good.ALI_PRICE_*0.01)
                    vm.goodDetail = good;
                }
            },
            submitGood:function (goodInfo) {
                goodInfo.CASH_PRICE_ = Math.round(goodInfo.CASH_PRICE_LABEL*100)
                goodInfo.COST_PRICE = Math.round(goodInfo.COST_PRICE_LABEL*100)
                goodInfo.WX_PRICE_ = Math.round(goodInfo.WX_PRICE_LABEL*100)
                goodInfo.ALI_PRICE_ = Math.round(goodInfo.ALI_PRICE_LABEL*100)
                if(goodInfo){
                    if(eap.isEmpty(goodInfo.NAME_,false)){
                        layer.alert('请填写商品名称!');
                        return;
                    }
                    if(goodInfo.CASH_PRICE_ == 0 || goodInfo.WX_PRICE_ == 0 || goodInfo.ALI_PRICE_ == 0){
                        layer.alert('现金支付/微信支付/支付宝售价不能为0!');
                        return;
                    }
                    if(eap.isEmpty(goodInfo.CASH_PRICE_,false)||eap.isEmpty(goodInfo.WX_PRICE_,false)||eap.isEmpty(goodInfo.ALI_PRICE_,false)){
                        layer.alert('请填写现金支付/微信支付/支付宝售价且价格!');
                        return;
                    }
                    eap.post('/api/shop/data/crud',eap.copyApply(goodInfo,{
                        dataModelName:'T_SHOP_GOODS',
                    }),function (data) {
                        var datas = eap.parseJson(data)
                        layer.msg(datas.head.RETMSG);
                        $('#GoodInfo').modal('hide');
                        vm.GoodList();
                    })
                }
            },
            // delGood:function (good) {
            //     if(good){
            //         eap.post('/api/shop/data/crud',{
            //             dataModelName:'T_SHOP_GOODS',
            //             deleteKey:good.ID_
            //         },function (data) {
            //             var datas = eap.parseJson(data)
            //             layer.msg(datas.head.RETMSG);
            //             vm.GoodList();
            //         })
            //     }
            // },
            search:function (condition) {
                var conditions = eap.copyApply({},vm.params);
                if(vm.origin.goodList){
                    var templist= vm.origin.goodList.filter(function (e) {
                        var flag = true;
                        if(typeof condition ==='function') flag = flag&&condition(e);
                        return flag;
                    });
                    vm.goodList = templist
                }else{
                    vm.goodList = []
                }
            },
            searchGood:function () {
                var conditions = eap.copyApply({},vm.params);
                vm.search(function (e) {
                    var flag = true;
                        if(conditions.NAME_) flag=flag&&e['NAME_'].indexOf(conditions.NAME_)>=0;
                        if(conditions.CODE_) flag=flag&&e['CODE_'].indexOf(conditions.CODE_)>=0;
                        return flag;
                })
            },
            searchGoodLib:function () {
                var conditions = vm.goodParams;
                vm.goodLib= vm.origin.goodLib.filter(function (e) {
                    var flag = true;
                    if(conditions.searchCondition) flag=flag&&(e['NAME_'].indexOf(conditions.searchCondition)>=0 || e['CODE_'].indexOf(conditions.searchCondition)>=0);
                    return flag;
                })
            },
            importGoods:function () {
                layer.confirm('确认要添加这些商品['+vm.checkboxGoodLibList.map(function (v) {return v.NAME_}).join(',')+']吗?',function () {
                    eap.each(vm.checkboxGoodLibList,function (e) {
                        var good ={
                            STATUS_:'1',
                            //COST_PRICE_:(e.COST_PRICE_*0.01),
                            CODE_:e.CODE_,
                            NAME_:e.NAME_,
                            //GOODS_CASH_PRICE_:e.CASH_PRICE_,
                            //GOODS_ALI_PRICE_:e.ALI_PRICE_,
                            //GOODS_WX_PRICE_:e.WX_PRICE_,
                            STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                            className:'shopGoods',
                        }
                        eap.post('/api/shop/store/'+sessionStorage.getItem('STORE_ID_')+'/addGoods',good,function (data) {
                            var datas = eap.parseJson(data)
                            layer.alert(datas.head.RETMSG);
                            $('#GoodsAdd').modal('hide');
                            setTimeout(function () {
                                vm.GoodList();
                            },500)
                        })
                    })
                });
            },
            GoodList:function (params) {
                var lorder = layer.load();
                params = eap.copyApply({
                    dataModelName:'V_SHOP_GOODS',
                    STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                    orderBy:'CODE_',
                },params)
                eap.post('/api/shop/data/query',params,function (data) {
                    var datas = eap.parseJson(data)
                    if(datas){
                        vm.TotalCount = datas?datas.head.totalCount:0;
                        vm.RecordCount = 50;
                        var data = datas.data;
                        eap.each(data,function (e) {
                            e['CASH_PRICE_LABEL'] = eap.toMoney(e.CASH_PRICE_ * 0.01)
                            e['ALI_PRICE_LABEL'] = eap.toMoney(e.ALI_PRICE_ * 0.01)
                            e['WX_PRICE_LABEL'] = eap.toMoney(e.WX_PRICE_ * 0.01)
                        })
                        vm.origin.goodList = data;
                        GoodLib();
                        vm.searchGood()
                        layer.close(lorder);
                    }
                })
            }
        }
    });

   //数据加载
    var treeData= new Array();
    //商品类型
    var GoodTypeList = function (params) {
        params = eap.copyApply({
            dataModelName:"T_SHOP_GOODS_TYPE",
        },params)
        eap.post('/api/shop/data/query',params,function (data) {
            var datas = eap.parseJson(data);
            if(datas){
                eap.each(datas.data, function (e) {
                    e['key']=e['ID_'];
                    e['value']=e['TYPE_NAME_'];
                    if(eap.isEmpty(e.PARENT_TYPE_ID_,false)){
                        treeData.push({
                            'id' : e.ID_,
                            'text' : e.TYPE_NAME_,
                            'state' : { 'opened' : true},
                            'children' :new Array()
                        })
                    }
                })
                // 加载树菜单子节点
                eap.each(datas.data,function (e) {
                    if(!eap.isEmpty(e.PARENT_TYPE_ID_,false)){
                        for(var k in treeData){
                            if(treeData[k]['id']== e.PARENT_TYPE_ID_ ){
                                treeData[k]['children'].push({
                                    'id' : e.ID_,
                                    'text' : e.TYPE_NAME_,
                                    'state' : { 'opened' : true},
                                    'children' :new Array()
                                })
                            }
                        }
                    }
                })
                vm.goodTypeOptions =  datas.data;
                // 树菜单初始化
                $('.tree-menu').jstree({
                    'core':{
                        data:[{
                            'id' : 'root',
                            'text' : '所有分类',
                            'state' : { 'opened' : true, 'selected' : true },
                            'children' :treeData
                        }]
                    },
                    'conditionalselect':function (node,e) {
                        if(node.id=='root'){
                            vm.GoodList();
                        }else{
                            vm.goodList=vm.origin.goodList.filter (function (ee) {
                                return ee.TYPE_ ==  node.id
                            })
                        }
                    },
                    'plugins':["conditionalselect", "sort","state"]
                });
            }
        })
    }
    var GoodLib = function () {
        eap.post('/api/shop/data/query',{
            dataModelName:"T_SHOP_GOODS_LIB",
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas.data){
                vm.origin.goodLib = datas.data
            }
        })
    }
    goodsSetInit=function () {
        OssClient = new OSS.Wrapper({
            region: 'oss-cn-hangzhou',
            accessKeyId: 'id9o2U3302dkaHyG',
            accessKeySecret: 'E9Se39NNmbXK7SaoO1jqbvbw1uaB51',
            bucket: 'itopvm'
        });
        vm.GoodList();
        vm.searchGoodLib();
        GoodTypeList({});
    }
});