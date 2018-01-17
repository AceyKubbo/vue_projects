/**
 * Created by apple on 17/12/18.
 */
var purchaseManageInit
require(['jquery','eap','vue','codemodel','tools'],function ($,eap,Vue,cm) {
    var vm = new Vue({
        el:'#section-purchaseManage',
        data:{
            origin:{},
            suppliers:{},
            purchaseDetail:{
                SUPPLIER_NAME_LABEL:null,
                STOCK_NAME_LABEL:null,
                details:[]
            },
            goodList:{},
            checkboxGoodList:{},
            params:{
                start_time:{},
                end_time:{}
            },
            stocks:{},
            purchaseList:{},
            storageDetail:{},
            pageConfig:{}
        },
        methods:{
            addPurchase:function () {
                vm.purchaseDetail = {
                    SUPPLIER_NAME_LABEL:null,
                    STOCK_NAME_LABEL:null,
                    details:[]
                }
                supplierList();
                StockList()
            },
            selectSupplier:function (e) {
                var selectOp = vm.suppliers.find(function (op) {
                    return e.target.value==op.supplierCode
                });
                if(selectOp){
                    vm.purchaseDetail.channelName = selectOp.supplierName
                    vm.purchaseDetail.channelCode = selectOp.supplierCode
                    vm.purchaseDetail.SUPPLIER_NAME_LABEL = selectOp.supplierName
                    //vm.$set(vm.purchaseDetail,'SUPPLIER_NAME_LABEL',selectOp.supplierName)
                }
            },
            selectStock:function (e) {
                var selectOp = vm.stocks.find(function (op) {
                    return e.target.value==op.code
                });
                if(selectOp){
                    vm.purchaseDetail.repertoryId = selectOp.id
                    vm.purchaseDetail.STOCK_NAME_LABEL = selectOp.name
                    //vm.$set(vm.purchaseDetail,'STOCK_NAME_LABEL',selectOp.name)
                }
            },
            openGoodList:function () {
                vm.checkboxGoodList=[]
                vm.searchGood(function (e) {
                    return vm.purchaseDetail.details?vm.purchaseDetail.details.map(function (v) {return v.CODE_}).indexOf(e.CODE_)<0:true
                })
                $("#purchaseChooseGoodsId").modal('toggle')
            },
            searchGood:function (condition) {
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
            searchGoodList:function () {
                var condi = eap.copyApply({},vm.params)
                vm.searchGood(function (e) {
                    return  condi.good_condi?(e.CODE_.indexOf(condi.good_condi)>=0||e.NAME_.indexOf(condi.good_condi)>=0):true;
                })
            },
            submitGoodsList:function () {
                layer.confirm('确认要添加这些商品['+vm.checkboxGoodList.map(function (v) {return v.NAME_}).join(',')+']吗?',function() {
                    eap.each(vm.checkboxGoodList,function (e) {
                        vm.purchaseDetail.details.push(eap.copyApply(e,{
                            price:'',
                            quantity:''
                        }))
                    })
                    $('#purchaseChooseGoodsId').modal('hide');
                    layer.msg("添加成功!");
                })
            },
            delDetailsItem:function (item) {
                vm.purchaseDetail.details.splice(vm.purchaseDetail.details.findIndex(function (e) {
                    return e.CODE_ == item.CODE_
                }),1);
            },
            showDetail:function (detail) {
                if($('#'+detail.id).hasClass('hidden')){
                    $('.hideCell').addClass('hidden')
                    $('#'+detail.id).removeClass('hidden')
                }else {
                    $('#'+detail.id).addClass('hidden')
                }
            },
            search:function (condition) {
                if(vm.origin.purchaseList){
                    var templist= vm.origin.purchaseList.filter(function (e) {
                        var flag = true;
                        if(typeof condition ==='function') flag = flag&&condition(e);
                        return flag;
                    });
                    vm.purchaseList = templist
                }
            },
            searchPurchase:function () {
                vm.pageLoader()
            },
            //提交采购单
            submitPurchase:function (record) {
                var purchaseRequestDetail = []
                eap.each(record.details,function (e) {
                    purchaseRequestDetail.push({
                        itemCode:e.CODE_,
                        itemName:e.NAME_,
                        itemPicture:e.PICTURE_,
                        price:(e.price*100).toString(),
                        quantity:e.quantity.toString(),
                    })
                })
                eap.postWithRequestBody('/api/stock/operator/purchaseRequest',{purchaseRequest:{
                    repertoryId:record.repertoryId,
                    channelName:record.channelName,
                    channelCode:record.channelCode,
                      purchaser:record.purchaser,
                         remark:record.remark,
                    purchaseRequestDetail:purchaseRequestDetail
                }},function (data) {
                    if(data.retcode == '0'){
                        layer.msg(cm.retMsg.get(data.retcode))
                        $('#addPurchaseId').modal('hide')
                        purchaseList()
                    }
                    layer.msg(cm.retMsg.get(data.retcode))
                })
            },
            storageButton:function (record) {
                record.remark = ''
                eap.each(record.details,function (e) {
                    e.storageQuantity = ''
                })
                vm.storageDetail = record
            },
            //提交入库单(可分次入库)
            submitstorage:function () {
                var purchaseStockDetail = []
                var judgeQuantity = 0
                eap.each(vm.storageDetail.details,function (e) {
                    if(e.storageQuantity == '' || e.storageQuantity == null){
                        judgeQuantity = judgeQuantity + 1
                    }
                    if(parseInt(e.storageQuantity) > 0){
                        purchaseStockDetail.push({
                            detailId:e.id,
                            quantity:e.storageQuantity
                        })
                    }
                })
                if(judgeQuantity == vm.storageDetail.details.length){
                    layer.msg('入库量不能全为空!')
                    return
                }
                if(eap.isEmpty(vm.storageDetail.remark)){
                    layer.msg('请填写入库说明!')
                    return
                }
                eap.postWithRequestBody('/api/stock/operator/purchaseStock',{
                    purchaseOrderId:vm.storageDetail.id,
                    remark:vm.storageDetail.remark,
                    purchaseStockDetail:purchaseStockDetail
                },function (data) {
                    if(data.retcode == '0'){
                        layer.msg(cm.retMsg.get(data.retcode))
                        $('#storageId').modal('hide')
                        purchaseList()
                    }
                    layer.msg(cm.retMsg.get(data.retcode))
                })
            },
            judgeCount:function (record) {
                if(record.storageQuantity == '0'){
                    layer.msg('入库量不能为0')
                    return
                }
                if(record.storageQuantity > record.remainingCount){
                    layer.msg('超出库存量!')
                    return
                }
            },
            pageLoader: function (params,cb) {
                params = eap.copyApply(vm.pageConfig,params);
                var condition;
                if(vm.params.start_time.time&&vm.params.end_time.time) condition = "Date#"+
                    vm.params.start_time.time+","+vm.params.end_time.time+"@between";
                else if(vm.params.start_time.time&&eap.isEmpty(vm.params.end_time.time)) condition =  "Date#"+vm.params.start_time.time+"@ge"
                else if(vm.params.end_time.time&&eap.isEmpty(vm.params.start_time.time)) condition =  "Date#"+vm.params.end_time.time+"@le"
                if(condition)params[".createTime"] = condition;
                purchaseList(eap.copyApply({
                    ".limit": vm.pageConfig.pageSize,
                    ".start": vm.pageConfig.index
                },params), function (datas) {
                    vm.pageConfig.totalCounts = Number(datas.header.COUNT_)
                    if(eap.isFunction(cb))cb();
                    if(vm.pageConfig.exist)vm.pageConfig.changeOption();
                });
            }
        }
    })
    //选择的所有供应商
    var supplierList = function () {
        eap.post('/api/stock/data/query',{
            className:'supplier',
            '._id':'notNull@notNull'
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas.header.RETCODE != '0'){
                layer.msg(cm.get(datas.header.RETCODE))
                return
            }
            vm.origin.suppliers = datas.data
            vm.suppliers = datas.data
        })
    }
    //选择的所有商品
    var GoodsList = function () {
        eap.post("/api/shop/data/query",{
            dataModelName:"T_SHOP_GOODS_LIB",
        },function (data) {
            var datas = eap.parseJson(data);
            vm.origin.goodList = datas.data;
        })
    }
    //选择的所有仓库
    var StockList = function () {
        eap.post('/api/stock/data/query',{
            className:'stockRepertory',
            '._id':'notNull@notNull',
            '.bizType':'platform'
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas.header.RETCODE != '0'){
                layer.msg(cm.get(datas.header.RETCODE))
                return
            }
            vm.origin.stocks = datas.data
            vm.stocks = datas.data
        })
    }
    //采购单
    var purchaseList = function (params,cb) {
        eap.post('/api/stock/data/query',eap.copyApply(params,{
                className:'purchaseOrder',
                '._id':'notNull@notNull',
                '.orderBy':'createTime@desc',
                '.channelName':vm.params.channelName?vm.params.channelName:null,
            }),function (data) {
            var datas = eap.parseJson(data)
            if(datas.header.RETCODE != '0'){
                layer.msg(cm.get(datas.header.RETCODE))
                return
            }
            if(datas.data){
                eap.each(datas.data,function (e) {
                    e['createTime'] = eap.dateFormat(new Date(e.createTime),'yyyy-MM-dd hh:mm:ss')
                    //仓库id转换成仓库名
                    var stocks = vm.origin.stocks.filter(function (ee) {
                        return ee.id==e.repertoryId
                    })
                    if(!eap.isEmpty(stocks[0])){
                        e['stock_label'] = stocks[0].name +"("+stocks[0].code+")"
                    }
                    var totalRemainingCount = 0
                    eap.each(e.details,function (ee) {
                        totalRemainingCount = totalRemainingCount+parseInt(ee.remainingCount)
                    })
                    if(totalRemainingCount == 0){
                        $('#storageButton-'+e.id).addClass('hidden')
                        vm.$set($('#storageButton-'+e.id),'class','hidden')
                    }
                })
                vm.origin.purchaseList = datas.data
                vm.purchaseList = datas.data
                if(eap.isFunction(cb))cb(datas);
            }
        })

    }
    purchaseManageInit =function () {
        //仓库名字转换模型
        StockList()
        GoodsList()
        vm.pageLoader({},function () {
            vm.$refs.pageInit.init();
        });
        vm.$refs.start_time.init()
        vm.$refs.end_time.init()
    }
})