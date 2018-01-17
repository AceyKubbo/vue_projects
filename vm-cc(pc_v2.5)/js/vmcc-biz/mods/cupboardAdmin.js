/**
 * Created by apple on 17/11/5.
 */
var cupboardAdminInit
require(['jquery','eap','vue','layer','codemodel','tools'],function($,eap,Vue,layer,cm){
    var vm = new Vue({
        el:'#section-cupboardAdmin',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            passwayList:{},
            passwayDetail:{},
            aisleInfo:{},
            origin:{},
            goodSearchParams:{},
            counterList:{},
            selectOptions:{},
            counterInfo:{},
            addCounter:{},
            goodList:{},
            counterId:{},
            deviceList:[],
            pageConfig:{},
            deviceAmount:{}
        },
        methods:{
            searchCounter:function (condition) {
                if(vm.origin.counterList){
                    vm.counterList = vm.origin.counterList.filter(function (e) {
                        var flag = true;
                        if(typeof condition ==='function') flag = flag&&condition(e);
                        return flag;
                    });
                }else{
                    vm.counterList=[]
                }
            },
            searchCounterByCondition:function () {
                var con = vm.params.search_counter_condition;
                vm.searchCounter(function (e) {
                    return con?(e.NAME_.indexOf(con)>=0||e.DEVICE_CODE_.indexOf(con)>=0):true;
                })
            },
            change:function (flag) {
                Amount();
                switch(flag){
                    case 'enable':
                        vm.params={STATUS_:"1"}
                        break;
                    case 'disable':
                        vm.params={STATUS_:"2"};
                        break;
                    default:
                        break;
                }
                GridList(vm.params);
            },
            selectCounter:function (counter) {
                $('tr.SelectColor').removeClass('current')
                $('#counter-'+counter.ID_).addClass('current')
                vm.counterId = counter.ID_
                if(counter){
                  vm.counterInfo = counter
                    var loader = layer.open({type:3})
                    AisleList({
                        COUNTER_ID_:counter.ID_
                    },function () {
                        eap.each(vm.passwayList,function (e) {
                            e['CASH_PRICE_LABEL'] = eap.toMoney(e.CASH_PRICE_*0.01)
                            e['ALI_PRICE_LABEL'] = eap.toMoney(e.ALI_PRICE_*0.01)
                            e['WX_PRICE_LABEL'] = eap.toMoney(e.WX_PRICE_*0.01)
                        })
                        vm.passwayList = vm.passwayList.sort(function (a,b) {
                            return vm.counterInfo.DEVICE_TYPE_=="shelf"?Number(a.FLOOR_NUM_)-Number(b.FLOOR_NUM_):Number(a.PLACE_NUM_)-Number(b.PLACE_NUM_)
                        })
                        layer.close(loader);
                    });
                }
            },
            loadRecords:function (params,cb) {
                cb = cb || eap.emptyFn;
                eap.post('/api/shop/data/query',eap.copyApply({
                    dataModelName:"V_SHOP_COUNTER_GOODS",
                    STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                    COUNTER_ID_:vm.counterId
                },params),function(data) {
                    var datas = eap.parseJson(data).data
                    eap.each(datas,function (e) {
                        e['CASH_PRICE_LABEL'] = eap.toMoney(Number(e.CASH_PRICE_)*0.01);
                        e['WX_PRICE_LABEL'] = eap.toMoney(Number(e.WX_PRICE_)*0.01);
                        e['ALI_PRICE_LABEL'] = eap.toMoney(Number(e.ALI_PRICE_)*0.01);
                    })
                    vm.passwayList = datas
                    if(typeof cb==="function")cb();
                })
            },
            submitCounterInfo:function (counter) {
                if(eap.isEmpty(counter.DEVICE_SN_)){
                    layer.msg('请添加设备编号!')
                    return
                }
                if(eap.isEmpty(counter.NAME_)){
                    layer.msg('请添加设备名称!')
                    return
                }
                if(eap.isEmpty(counter.MAX_GOODS_COUNT_)){
                    layer.msg('请选择货道数量!')
                    return
                }
                counter['dataModelName'] = "T_SHOP_COUNTER"
                eap.post('/api/shop/counter/edit',eap.copyApply(counter,{
                    className:'shopCounter',
                    STORE_ID_:sessionStorage.getItem('STORE_ID_')
                }),function (data) {
                    var datas = eap.parseJson(data);
                    if(datas.head.RETCODE=="0"){
                        layer.msg("操作成功!");
                        GridList();
                        $('#modifyCounter').modal('hide')
                    }else{
                        layer.msg(datas.head.RETMSG);
                    }
                })
            },
            searchGood:function () {
                var conditions = eap.copyApply({},vm.goodSearchParams);
                vm.goodList= vm.origin.goodList.filter(function (e) {
                    var flag = true;
                    if(conditions.NAME_) flag=flag&&e['NAME_'].indexOf(conditions.NAME_)>=0;
                    if(conditions.CODE_) flag=flag&&e['CODE_'].indexOf(conditions.CODE_)>=0;
                    return flag;
                })
            },
            selectGoods:function () {
                GoodList()
            },
            addPassway:function () {
                vm.aisleInfo = {
                    title:vm.counterInfo.DEVICE_TYPE_=="shelf"?"添加货层":"添加货位",
                    oper:"addGoods",
                    ID_:"",
                    MAX_COUNT_:vm.counterInfo.DEVICE_TYPE_=="box"?0:vm.counterInfo.DEVICE_TYPE_=="shelf"?999:1,
                    WARNING_COUNT_:vm.counterInfo.DEVICE_TYPE_=="box"?0:vm.counterInfo.DEVICE_TYPE_=="shelf"?5:1
                }
            },
            editPassway:function(aisle) {
                vm.aisleInfo =eap.copyApply({
                    oper:"editGoods",
                    title:"编辑"+(vm.counterInfo.DEVICE_TYPE_=="shelf"?"货层["+aisle.FLOOR_NUM_:"货位["+aisle.PLACE_NUM_)+"]"
                },aisle);
            },
            aisleGoodAdd:function (good) {
                if(good){
                    good.GOODS_ID_ = good.ID_;
                    delete good["ID_"];
                    vm.aisleInfo = eap.copyApply(vm.aisleInfo,good);
                    vm.aisleInfo.CASH_PRICE_LABEL = eap.toMoney(good.CASH_PRICE_* 0.01);
                    vm.aisleInfo.WX_PRICE_LABEL = eap.toMoney(good.WX_PRICE_ * 0.01);
                    vm.aisleInfo.ALI_PRICE_LABEL = eap.toMoney(good.ALI_PRICE_ * 0.01);
                    $('#GoodSelectList').modal('hide');
                }
            },
            cleanGood:function (aisle) {
                if(aisle){
                    aisle.GOODS_ID_ = "";
                    aisle.CODE_="";
                    aisle.PICTURE_="";
                    aisle.NAME_="";
                    aisle.CASH_PRICE_=0;
                    aisle.WX_PRICE_=0;
                    aisle.ALI_PRICE_=0;
                    vm.aisleInfo.CASH_PRICE_LABEL = 0.00;
                    vm.aisleInfo.WX_PRICE_LABEL = 0.00;
                    vm.aisleInfo.ALI_PRICE_LABEL = 0.00;
                }
            },
            counterEnable:function (counter) {
                eap.post('/api/shop/data/crud',{
                    STATUS_:'1',
                    ID_:counter.ID_,
                    dataModelName:"T_SHOP_COUNTER",
                },function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.head.RETCODE != '0'){
                        layer.msg(cm.retMsg.get(datas.head.RETCODE))
                        return
                    }
                    vm.change('disable')
                })
            },
            counterDisable:function (counter) {
                eap.post('/api/shop/data/crud',{
                    STATUS_:'2',
                    ID_:counter.ID_,
                    dataModelName:"T_SHOP_COUNTER",
                },function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.head.RETCODE != '0'){
                        layer.msg(cm.retMsg.get(datas.head.RETCODE))
                        return;
                    }
                    vm.change('enable')
                })
            },
            stopPassway:function(aisle) {
                eap.post('/api/shop/data/crud',{
                    STATUS_:'2',
                    ID_:aisle.ID_,
                    dataModelName:"T_SHOP_COUNTER_GOODS",
                },function (data) {
                    var datas = eap.parseJson(data);
                    if(datas.head.RETCODE != '0'){
                        layer.msg(cm.retMsg.get(datas.head.RETCODE))
                        return
                    }
                    AisleList({COUNTER_ID_:aisle.COUNTER_ID_});
                })
            },
            startPassway:function(aisle){
                eap.post('/api/shop/data/crud',{
                    STATUS_:'1',
                    ID_:aisle.ID_,
                    dataModelName:"T_SHOP_COUNTER_GOODS",
                },function (data) {
                    var datas = eap.parseJson(data);
                    if(datas.head.RETCODE != '0'){
                        layer.msg(cm.retMsg.get(datas.head.RETCODE))
                        return
                    }
                    AisleList({COUNTER_ID_:aisle.COUNTER_ID_});
                })
            },
            submitAisle:function (detail) {
                detail.PLACE_NUM_ = eap.isEmpty(detail.PLACE_NUM_)?-1:detail.PLACE_NUM_
                detail.MAX_COUNT_ = vm.counterInfo.DEVICE_TYPE_=="shelf"?999:detail.MAX_COUNT_;
                eap.post("/api/shop/counter/"+vm.counterId+"/"+vm.aisleInfo.oper,eap.copyApply(detail,{
                    className:'shopCounterGoods',
                    STORE_ID_:sessionStorage.getItem('STORE_ID_')
                }),function (data) {
                    var datas = eap.parseJson(data);
                    if(datas.head.RETCODE=="0"){
                        layer.msg("操作成功!");
                        AisleList({ COUNTER_ID_:vm.counterId});
                        $('#AisleInfo').modal('hide')
                    }else{
                        layer.alert(cm.retMsg.get(datas.head.RETCODE));
                    }
                })
            },
            selectDevice:function (e) {
                var selectOp = vm.deviceList.find(function (op) {
                    return e.target.value==op.DEVICE_CODE_
                });
                if(selectOp){
                    if(vm.addCounter.DEVICE_CODE_&&vm.addCounter.DEVICE_SN_){
                        vm.addCounter.DEVICE_CODE_ =selectOp.DEVICE_CODE_
                        vm.addCounter.DEVICE_SN_ =selectOp.DEVICE_SN_
                    }else{
                        vm.$set(vm.addCounter,"DEVICE_CODE_",selectOp.DEVICE_CODE_)
                        vm.$set(vm.addCounter,"DEVICE_SN_",selectOp.DEVICE_SN_)
                    }
                    vm.addCounter.DEVICE_ID_=selectOp.ID_
                    vm.addCounter.SN_=selectOp.DEVICE_CODE_
                    vm.addCounter.AISLE_COUNT_ =selectOp.AISLE_COUNT_
                    vm.addCounter.DEVICE_NAME_ =selectOp.DEVICE_NAME_
                    vm.addCounter.DEVICE_TYPE_ =selectOp.DEVICE_TYPE_
                }
            },
            submitCounter:function(device){
                delete device["TYPE_"];
                var params = eap.copyApply({
                    className:'shopCounter',
                    STORE_ID_:sessionStorage.getItem("STORE_ID_"),
                    STATUS_:1,
                    TYPE_:"grid"
                },device)
                eap.post("/api/shop/counter/"+params.oper,params,function (data) {
                    var datas = eap.parseJson(data)
                    layer.msg(datas.head.RETMSG);
                    if(datas){
                        $("#DeviceInfo").modal('hide')
                        if(params.STATUS_==1){
                            vm.change("enable")
                        }else{
                            vm.change("disable")
                        }
                        vm.selectCounter(vm.origin.counterList.find(function (e) {
                            return e.ID_ == datas.head.ID_
                        }))
                    }
                })
            },
            addDevice:function () {
                vm.addCounter={title:"添加柜台设备",oper:"create"}
                getNotUsedDevice();
            },
            loadCounter:function (counter) {
                vm.addCounter=eap.copyApply({title:"调整柜台设备["+counter.DEVICE_CODE_+"]",oper:"edit"},counter);
                getNotUsedDevice();
            },
            copyCounterAisles:function() {
                sessionStorage.setItem("template_counter_aisles",JSON.stringify(vm.passwayList));
                sessionStorage.setItem("copy_counter_device_type",vm.counterInfo.DEVICE_TYPE_);
                layer.alert("复制成功!");
            },
            pasteCounterAisles:function(counter) {
                var loader = layer.open({type:3});
                var retMsg;
                console.log(sessionStorage.getItem("copy_counter_device_type"),vm.counterInfo.DEVICE_TYPE_)
                if(sessionStorage.getItem("copy_counter_device_type")==vm.counterInfo.DEVICE_TYPE_){
                    var aisles = JSON.parse(sessionStorage.getItem("template_counter_aisles"));
                    if(!aisles){
                        retMsg = "请先去复制相关货道信息!"
                    }else if(aisles.length<=Number(counter.AISLE_COUNT_)){
                        eap.each(aisles,function (e) {
                            eap.post("/api/shop/counter/"+vm.counterId+"/addGoods",eap.copyApply(e,{
                                className:'shopCounterGoods',
                                STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                                ID_:''
                            }));
                        })
                        retMsg = "货道复制成功!";
                        AisleList({COUNTER_ID_:vm.counterId});
                    }else{
                        retMsg = "设备货道数量不匹配,货道["+aisles.length+"-->"+Number(counter.AISLE_COUNT_)+"]"
                    }
                }else{
                    retMsg = "复制柜台["+sessionStorage.getItem("copy_counter_device_type")+"]-->目标柜台["+vm.counterInfo.DEVICE_TYPE_+"],设备类型不匹配"
                }
                layer.close(loader);
                layer.alert(retMsg);
            },
            pageLoader: function (cb) {
                // vm.loadRecords(eap.copyApply({
                //     ".limit": vm.pageConfig.pageSize,
                //     ".start": vm.pageConfig.index
                // }, vm.pageConfig), function (datas){
                //     console.info(datas,'kkk')
                //     vm.pageConfig.totalCounts = datas["head"].COUNT_
                //     if(eap.isFunction(cb))cb();
                // });
            }
        }
    });
    var getNotUsedDevice = function () {
        vm.deviceList = vm.origin.deviceList;
    }
    var DeviceList = function () {
        eap.post('/api/shop/data/query',{
            dataModelName:"T_SHOP_DEVICE",
            DEVICE_TYPE_:"net@not",
        },function(data){
            var datas = eap.parseJson(data);
            if(datas.data){
                vm.origin.deviceList = datas.data;
            }
        })
    }
    var GridList = function (params) {
        params = eap.copyApply(params,{
            dataModelName:"V_SHOP_COUNTER",
            STORE_ID_ :sessionStorage.getItem('STORE_ID_'),
            TYPE_:"net@not",
        })
        eap.post('/api/shop/data/query',params,function (datas) {
            var data = eap.parseJson(datas).data;
            if(data){
                eap.each(data,function (e) {
                    e["TYPE_LABEL"] = cm.counterType.get(e.TYPE_)
                    e["DEVICE_TYPE_LABEL"] = cm.deviceType.get(e.DEVICE_TYPE_)
                    var device = vm.origin.deviceList.find(function (d) {
                        return d.ID_==e.DEVICE_ID_
                    })
                    if(device){
                        e["DEVICE_NAME_"] = device.DEVICE_NAME_
                        e["DEVICE_CODE_"] = device.DEVICE_CODE_
                    }
                })
                vm.origin.counterList = data;
                vm.searchCounter()
            }
        })
    }
    var Amount = function () {
        eap.post('/api/shop/data/query',{
            dataModelName:"T_SHOP_COUNTER",
            STORE_ID_ :sessionStorage.getItem('STORE_ID_'),
            TYPE_:"net@not",
        },function (data) {
            var datas = eap.parseJson(data)
                var onlineAmount = datas.data.filter(function (e) {
                    return e.STATUS_ == '1'
                })
                vm.deviceAmount.onlineAmount = onlineAmount.length
                var offlineAmount = datas.data.filter(function (e) {
                    return e.STATUS_ ==  '2'
                })
                vm.deviceAmount.offlineAmount = offlineAmount.length
        })
    }
    var GoodList = function (params) {
        eap.post('/api/shop/data/query',eap.copyApply(params,{
            dataModelName:"V_SHOP_GOODS",
            STORE_ID_:sessionStorage.getItem('STORE_ID_'),
            STATUS_:'1'
        }),function (datas) {
            vm.origin.goodList = eap.parseJson(datas).data;
            vm.searchGood()
        })
    }
    var AisleList = function (params,cb) {
        // params = eap.copyApply({
        //     dataModelName:"V_SHOP_COUNTER_GOODS",
        //     STORE_ID_:sessionStorage.getItem('STORE_ID_'),
        // },params);
        eap.post('/api/shop/data/query',eap.copyApply({
            dataModelName:"V_SHOP_COUNTER_GOODS",
            STORE_ID_:sessionStorage.getItem('STORE_ID_'),
        },params),function(data) {
            var datas = eap.parseJson(data).data
            eap.each(datas,function (e) {
                e['CASH_PRICE_LABEL'] = eap.toMoney(Number(e.CASH_PRICE_)*0.01);
                e['WX_PRICE_LABEL'] = eap.toMoney(Number(e.WX_PRICE_)*0.01);
                e['ALI_PRICE_LABEL'] = eap.toMoney(Number(e.ALI_PRICE_)*0.01);
            })
            vm.passwayList = datas
            if(typeof cb==="function")cb();
        })
    }
    cupboardAdminInit = function () {
        DeviceList();
        Amount()
        vm.change("enable");
        vm.counterId = ""
        vm.counterInfo =  {
            NAME_:"",
            SN_:"",
            DEVICE_SN_:"",
            TYPE_:"",
        }
        vm.goodList = null
        vm.origin.goodList = null
    }
});