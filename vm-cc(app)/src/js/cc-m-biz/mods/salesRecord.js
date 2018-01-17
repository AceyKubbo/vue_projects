/**
 * Created by apple on 17/9/8.
 */
var salesRecordInit
require(['jquery','eap','vue','codeModel','weui',"layer"],function ($,eap,vue,cm) {
    var vm = new vue({
        el:"#section-salesRecord",
        data:{
            salesRecordList:null,
            params:{
                dataPos:0,
                startTime:"",
                endTime:""
            },
            channelOptions:null,
            saleStatusOptions:null,
            origin:{},
            radios:{
                status:"",
                payway:"",
                statusGroup:[
                    {label:"全部",value:""},
                    {label:"交易成功",value:"normal"},
                    {label:"出货异常",value:"abnormal"},
                    {label:"异常恢复",value:"renew"},
                    {label:"已退款",value:"refund"},
                ],
                paywayGroup:[
                    {label:"全部",value:""},
                    {label:"微信支付",value:"wx_pub"},
                    {label:"支付宝",value:"alipay_wap"},
                    {label:"现金支付",value:"cash"},
                ]
            }
        },
        methods:{
            returnHome:function () {
                eap.toModView("menu")
            },
            loadSalesRecord:function (params,cb) {
                params = params||{}
                if(!eap.isEmpty(vm.params.pickupStatus)){
                    var detailFilter = "T_SHOP_ORDER_DETAIL->ORDER_ID_?1=1";
                    detailFilter += "&PICKUP_STATUS_=" + vm.params.pickupStatus;
                    params["ID_"] = detailFilter + "@exist";
                }
                var condition;
                if(vm.params.startTime&&vm.params.endTime) condition = vm.params.startTime+","+vm.params.endTime+"@between";
                else if(vm.params.startTime&&eap.isEmpty(vm.params.endTime)) condition = vm.params.startTime+"@ge"
                else if(vm.params.endTime&&eap.isEmpty(vm.params.startTime)) condition = vm.params.endTime+"@le"
                params = eap.copyApply({
                    dataModelName:"T_SHOP_ORDER",
                    STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                    PAY_CHANNEL_:vm.radios.payway||"",
                    PAY_STATUS_:vm.params.payState||"",
                    CREATE_TIME_:condition||"",
                    ORDER_NO_:vm.params.orderNo||"",
                    orderBy:'CREATE_TIME_@DESC',
                    start:vm.params.dataPos,
                    limit:10
                },params||{})
                eap.call('shop@query',params,function (data) {
                    var datas = eap.parseJson(data)
                    vm.origin.total = datas.head.COUNT_
                    if(datas.data){
                        eap.each(datas.data,function (e) {
                            e['PAY_AMOUNT_LABEL'] = eap.toMoney(e.PAY_AMOUNT_ * 0.01);
                            e['PAY_STATUS_LABEL'] = cm.payState.get(e.PAY_STATUS_);
                            e['PAY_CHANNEL_LABEL'] = cm.payChannel.get(e.PAY_CHANNEL_);
                            e["details"] = [];
                            eap.call("shop@query",{
                                dataModelName:"V_SHOP_ORDER_DETAIL",
                                ORDER_ID_:e.ID_||-1,
                            },function (data) {
                                var ds = eap.parseJson(data)
                                if(ds){
                                    eap.each(ds.data,function (d) {
                                        d["DELIVERY_TYPE_LABEL"] = cm.deliveryType.get(d.DELIVERY_TYPE_)
                                        d["PICKUP_STATUS_LABEL"] = cm.pickupStatus.get(d.PICKUP_STATUS_)
                                        d["GOODS_PRICE_LABEL"] = eap.toMoney(Number(d.COUNT_)*Number(d.GOODS_PRICE_)*0.01)
                                    })
                                    e.details = ds.data
                                }
                            })
                        })
                        vm.origin.salesRecordList = (vm.origin.salesRecordList||[]).concat(datas.data)
                        vm.salesRecordList = vm.origin.salesRecordList
                        if(eap.isFunction(cb))cb();
                    }
                })
            },
            refreshSalesRecord:function () {
                switch (vm.radios.status){
                    case "normal":
                        vm.params.payState="2";
                        vm.params.pickupStatus="3";
                        break;
                    case "abnormal":
                        vm.params.payState="1@not";
                        vm.params.pickupStatus="1,2,4#in";
                        break;
                    case "refund":
                        vm.params.payState="3";
                        vm.params.pickupStatus="";
                        break;
                    case "renew":
                        vm.params.payState="1@not";
                        vm.params.pickupStatus="5";
                        break;
                    default:
                        vm.params.payState="1@not";
                        vm.params.pickupStatus="";
                }
                vm.params.dataPos=0
                vm.origin.salesRecordList=null
                vm.loadSalesRecord()
                $("#openFilterBtn").removeClass("hidden")
            },
            cleanFilter:function () {
                vm.radios.status="";
                vm.radios.payway="";
                vm.params.startTime="";
                vm.params.endTime="";
                vm.refreshSalesRecord();
            },
            openFilter:function () {
                $("#searchFilter").popup();
                $("#openFilterBtn").addClass("hidden")
            }
        }
    })
    salesRecordInit = function () {
        vm.params.dataPos=0
        vm.loadSalesRecord();
        $(document.body).infinite(10).on('infinite',function () {
            if(Number(vm.params.dataPos)<Number(vm.origin.total)){
                vm.loadSalesRecord({},function () {
                    vm.params.dataPos += 10;
                })
            }
        });
        $("#section-salesRecord .startTime").datetimePicker({onClose:function (v) {
            vm.params.startTime = v.input[0].value+":00"
        }});
        $("#section-salesRecord .endTime").datetimePicker({onClose:function (v) {
            vm.params.endTime = v.input[0].value+":00"
        }});
    }
})
