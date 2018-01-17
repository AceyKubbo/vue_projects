/**
 * Created by apple on 18/1/11.
 */
var merchantOverviewInit
require(['jquery','eap','vue','highcharts','tools','counterup'],function ($,eap,Vue,highcharts) {
    var vm = new Vue({
        el:'#section-merchantOverview',
        data:{
            params:{
                start_time:{},
                end_time:{},
            },
            storeList : {},
            goodsSaleStatList:{},
            storeId:'',
            tenantList:{},
            accessToken:''
        },
        methods:{
            pageLoader:function () {
                $('.btn').removeClass('default')
                vm.loadRecords()
            },
            week:function () {
                $('.btn').removeClass('default')
                //$('#storeOverviewWeekClick').removeClass('btn-default')
                $('#storeOverviewWeekClick').addClass('default')
                vm.params.start_time.time = oneWeekAgo
                vm.params.end_time.time = yesterday
                vm.loadRecords()
            },
            fifteen:function () {
                $('.btn').removeClass('default')
                //$('#storeOverviewFifteenClick').removeClass('btn-default')
                $('#storeOverviewFifteenClick').addClass('default')
                vm.params.start_time.time = fifteenAgo
                vm.params.end_time.time = yesterday
                vm.loadRecords()
            },
            month:function () {
                $('.btn').removeClass('default')
                //$('#storeOverviewMonthClick').removeClass('btn-default')
                $('#storeOverviewMonthClick').addClass('default')
                vm.params.start_time.time = oneMonthAgo
                vm.params.end_time.time = yesterday
                vm.loadRecords()
            },
            getTimeRange:function(){
                var startTimeXAxis = new Date(vm.params.start_time.time).getTime()
                var endTimeXAxis = new Date(vm.params.end_time.time).getTime()
                var limitLength = (endTimeXAxis - startTimeXAxis)/aDayTimeRange
                var xAxis = []
                for (var i=0;i<limitLength;i++){
                    var time = eap.dateFormat(new Date(startTimeXAxis+i*aDayTimeRange), 'yyyy-MM-dd')
                    xAxis.push(time.replace(/\-/g, ""))
                }
                return xAxis;
            },
            loadRecords : function () {
                //if(sessionStorage.getItem('STORE_ID_') != null){
                    //数据
                    var startTime = vm.params.start_time.time.substr(0,10).replace(/\-/g, "")
                    var endTime = vm.params.end_time.time.substr(0,10).replace(/\-/g, "")
                    var statsTime = startTime+','+endTime+'@between'
                    var statsDatas = {}
                    eap.call('stats@query',{
                        dataModelName : 'T_STATS_SHOP_SALE',
                        ignoreStat : 'true',
                        STATS_TIME_: statsTime,
                        STORE_ID_ : storeIdList.join() + '@in',
                        orderBy : 'STORE_ID_@desc#STATS_TIME_@asc',
                    },function (data) {
                        var datas = eap.parseJson(data)
                        eap.each(datas.data,function (e) {
                            var amountData = statsDatas["amount_" + e.STORE_ID_];
                            var turnOverData = statsDatas["turnOver_" + e.STORE_ID_];
                            if(amountData == null){
                                amountData = {};
                                statsDatas["amount_" + e.STORE_ID_] = amountData;
                            }
                            if(turnOverData == null){
                                turnOverData = [];
                                statsDatas["turnOver_" + e.STORE_ID_] = turnOverData;
                            }
                            amountData[e.STATS_TIME_]= parseInt(e.TOTAL_AMOUNT_||0)/100;
                            turnOverData[e.STATS_TIME_]= parseInt(e.TOTAL_TURNOVER_||0);
                        })
                    });
                    //
                    vm.renderCharts('salesAmountCharts',statsDatas);
                    //默认加载第一个门店的商品明细
                    vm.loadDetails(storeIdList[0]);
                    vm.loadGoodsSaleStatistic(storeIdList[0])
                    vm.storeId = storeIdList[0]
                //}
            },
            loadDetails : function(storeId){
                eap.call('shop@query',{
                    dataModelName: "V_SHOP_ORDER_DETAIL_ST",
                    ORDER_CREATE_TIME_: vm.params.start_time.time + "," + vm.params.end_time.time + "@between",
                    accessToken: sessionStorage.getItem('AccessToken'),
                    STORE_ID_: storeId,
                    ORDER_ID_: '@notNull',
                    ORDER_STATUS_: '1',
                    ORDER_PAY_STATUS_: '2',
                    groupBy: "GOODS_CODE_",
                    sum: "GOODS_TOTAL_PRICE_@PAY_AMOUNT_SUM_#COUNT_@TOTAL_COUNT_",
                    selectColumns: "GOODS_NAME_"
                },function (data) {
                    var datas = eap.parseJson(data);
                    //if(sessionStorage.getItem('STORE_ID_') != 'null'){
                        vm.renderPies("salesAmountPie",storeNameMap[storeId],datas.data);
                        vm.renderPies("salesTurnoverPie",storeNameMap[storeId],datas.data);
                        // vm.$on('show',function () {
                        //
                        // })
                        $('.highcharts-subtitle').click(function () {
                            $('#goodsSaleStatisticId').modal('toggle')
                        })
                    //}
                });
            },
            loadStatic:function () {
                //if(sessionStorage.getItem('STORE_ID_') != null){
                    var startTime = eap.dateFormat(new Date(curTime - aDayTimeRange), 'yyyy-MM-dd').replace(/\-/g, "")
                    var endTime = eap.dateFormat(new Date(curTime), 'yyyy-MM-dd').replace(/\-/g, "")
                    var statsTime = startTime+','+endTime+'@between'
                    //昨日统计
                    eap.call('stats@query',{
                        dataModelName:'T_STATS_SHOP_SALE',
                        ignoreData:true,
                        STATS_TIME_: statsTime,
                        STORE_ID_:storeIdList.join() + '@in',
                        sum:'TOTAL_AMOUNT_@GOODS_AMOUNT_SUM_#TOTAL_TURNOVER_@GOODS_TOTAL_COUNT_'
                    },function (data) {
                        var datas = eap.parseJson(data)
                        if(datas.head){
                            $('#yesterdaySalesCount').attr('data-value',datas.head.GOODS_TOTAL_COUNT_ || 0);
                            $('#yesterdayAmount').attr('data-value',parseInt(datas.head.GOODS_AMOUNT_SUM_ || 0)*0.01);
                        }
                    })
                    //累计统计
                    eap.call('stats@query',{
                        dataModelName:'T_STATS_SHOP_SALE',
                        ignoreData:true,
                        STORE_ID_:storeIdList.join() + '@in',
                        sum:'TOTAL_AMOUNT_@GOODS_AMOUNT_SUM_#TOTAL_TURNOVER_@GOODS_TOTAL_COUNT_'
                    },function (data) {
                        var datas = eap.parseJson(data)
                        if(datas.head){
                            $('#AllSalesCount').attr('data-value',datas.head.GOODS_TOTAL_COUNT_ || 0);
                            $('#allAmount').attr('data-value',parseInt(datas.head.GOODS_AMOUNT_SUM_ || 0)*0.01);
                        }
                    })
                    $("[data-counter='counterup']").counterUp();
                //}
            },
            loadGoodsSaleStatistic:function (storeId) {
                var params = {
                    dataModelName: "V_SHOP_ORDER_DETAIL_ST",
                    ORDER_CREATE_TIME_: vm.params.start_time.time + "," + vm.params.end_time.time + "@between",
                    accessToken: sessionStorage.getItem('AccessToken'),
                    STORE_ID_: storeId,
                    ORDER_ID_: '@notNull',
                    // COUNTER_SN_: vm.params.COUNTER_SN_,
                    GOODS_NAME_: vm.params.GOODS_NAME_,
                    ORDER_STATUS_: '1',
                    ORDER_PAY_STATUS_: '2',
                    groupBy: "GOODS_CODE_",
                    sum: "IF(REFUND_STATUS_=2,GOODS_TOTAL_PRICE_,NULL)@REFUND_AMOUNT_SUM_#GOODS_TOTAL_PRICE_@PAY_AMOUNT_SUM_#COUNT_@TOTAL_COUNT_",
                    selectColumns: "GOODS_NAME_,PICTURE_"
                }
                $.ajax({
                    url: '/api/shop/data/query',
                    type: 'POST', dataType: 'json', async: false, data: params,
                    success: function (datas) {
                        var totalNumber = 0, totalMoey = 0, totalCount = 0, totalRefund = 0, totalActual = 0;
                        var payAmountSum = 0, refundAmountSum = 0, actualAmountSum = 0;
                        if (datas.data) {
                            eap.each(datas.data, function (e) {
                                payAmountSum = parseInt(e.PAY_AMOUNT_SUM_ || 0);
                                refundAmountSum = parseInt(e.REFUND_AMOUNT_SUM_ || 0);
                                actualAmountSum = payAmountSum - refundAmountSum;

                                totalNumber = totalNumber + parseInt(e.TOTAL_COUNT_ || 0);
                                totalCount = totalCount + parseInt(e.COUNT_ || 0);

                                totalMoey = totalMoey + payAmountSum;
                                totalRefund = totalRefund + refundAmountSum;
                                totalActual = totalActual + actualAmountSum;

                                e['PAY_AMOUNT_SUM_'] = (payAmountSum * 0.01).toFixed(2);
                                e['REFUND_AMOUNT_SUM_'] = (refundAmountSum * 0.01).toFixed(2);
                                e['ACTUAL_AMOUNT_SUM_'] = (actualAmountSum * 0.01).toFixed(2);
                            });
                            vm.goodsSaleStatList = datas.data;
                        }
                    }
                })
            },
            searchGoodsSaleStatic:function () {
                vm.loadGoodsSaleStatistic(vm.storeId)
            },
            renderCharts:function(chartId,statsDatas){
                var chartTitle,yAxisTitle,dataPrefix;
                var series = [];
                var xAxis = vm.getTimeRange();
                if("salesAmountCharts" == chartId){
                    chartTitle = "近"+ xAxis.length +"日商品销售金额趋势图"
                    yAxisTitle = "金额"
                    dataPrefix = "amount_"
                } else {
                    chartTitle = "近" + xAxis.length + "日商品销售数量趋势图"
                    yAxisTitle = "数量"
                    dataPrefix = "turnOver_"
                }
                eap.each(storeIdList,function (storeId) {
                    var data = []
                    var statsData = statsDatas[dataPrefix+ storeId];
                    eap.each(xAxis,function(timePoint){
                        data.push((statsData && statsData[timePoint]) || 0);
                    });
                    series.push({
                        id : storeId,
                        name : storeNameMap[storeId],
                        data : data
                    })
                });
                //
                var targetChart = eval(chartId);
                if(targetChart == null){
                        targetChart = Highcharts.chart(chartId, {
                        chart:{height: 400,type:'line'},
                        title: {text: chartTitle,style: {color: '#000000', fontWeight: 'bold',fontSize:"13px"}},
                        xAxis: {categories:xAxis},
                        yAxis: {tickPixelInterval:50,allowDecimals:false,title: { text: yAxisTitle}},
                        series: series,
                        colors:['#008cff'],
                        plotOptions :{
                            line: {
                                dataLabels: {
                                    enabled: true          // 开启数据标签
                                },
                            },
                            series: {
                                cursor: 'pointer',
                                events: {
                                    click: function (event) {
                                        vm.loadDetails(this.options.id)
                                        vm.loadGoodsSaleStatistic(this.options.id)
                                        vm.storeId = this.options.id
                                    }
                                }
                            }
                        }
                    });
                } else {
                    eap.each(series,function (data) {
                        targetChart.get(data.id).update({
                            data : data.data
                        },false);
                    })
                    targetChart.xAxis[0].setCategories(xAxis,false);
                    targetChart.redraw();
                }
            },
            renderPies:function(chartId,storeName,pieDatas){var series = [];
                var xAxis = [];
                var chartTitle,yAxisTitle;
                var timeRange = vm.getTimeRange();
                if("salesAmountPie"==chartId){
                    yAxisTitle = "金额"
                    chartTitle = "近"+ timeRange.length +"日商品销售金额图"
                    eap.each(pieDatas,function (data) {
                        series.push({
                            name: data.GOODS_NAME_,
                            y: parseInt(data.PAY_AMOUNT_SUM_||0)/100
                        })
                    })
                } else {
                    yAxisTitle = "数量"
                    chartTitle = "近"+ timeRange.length +"日商品销售数量图"
                    eap.each(pieDatas,function (data) {
                        series.push({
                            name: data.GOODS_NAME_,
                            y: parseInt(data.TOTAL_COUNT_||0)
                        })
                    })
                }

                series.sort(function(a,b){
                    return b.y - a.y;
                });

                eap.each(series,function (data) {
                    xAxis.push(data.name);
                })

                var targetChart = eval(chartId);
                if(targetChart == null) {
                    targetChart = Highcharts.chart(chartId, {
                        chart:{height: 400,type:'column'},
                        title: {text: chartTitle,style: {color: '#000000', fontWeight: 'bold',fontSize:"13px"}},
                        subtitle: {
                            text: "<button class='btn btn-xs btn-default'>详情</button>",
                            floating: false,
                            align: 'right',
                            useHTML:true
                        },
                        xAxis: {categories:xAxis},
                        yAxis: {tickPixelInterval:50,allowDecimals:false,title: { text: yAxisTitle}},
                        plotOptions: {
                            column: {
                                dataLabels: {
                                    enabled: true,// 开启数据标签
                                }
                            }
                        },
                        colors:['#008cff'],
                        series: [{
                            name : storeName,
                            data : series
                        }]
                    });
                }else {
                    targetChart.series[0].update({
                        name : storeName,
                        data : series
                    },false)
                    targetChart.xAxis[0].setCategories(xAxis,false);
                    targetChart.redraw();
                }
            },
            //初始化函数
            initStoreData:function(){
                if(storeIdList.length > 0){//清空门店ID数据
                    storeIdList.splice(0,storeIdList.length);
                }
                $.ajax({
                    url: '/api/shop/data/query',
                    type: 'POST', dataType: 'json', async: false, data: {
                        dataModelName:'V_SHOP_STORE',
                        //accessToken:vm.accessToken,
                    },
                    success: function (datas) {
                        //var datas = eap.parseJson(data);
                        if(datas.head.RETCODE !='0'){
                            //layer.msg(cm.retMsg.get(datas.head.RETCODE));
                            return;
                        }
                        if(!eap.isEmpty(datas.data)){
                            eap.each(datas.data,function (e) {
                                storeNameMap[e.ID_] = e.NAME_;
                                storeIdList.push(e.ID_);
                            });
                        }}
                })
                // eap.call('shop@query',{
                //     dataModelName:'V_SHOP_STORE',
                // },function (data) {
                //     var datas = eap.parseJson(data);
                //     console.info(datas,'kkk')
                //     if(datas.head.RETCODE !='0'){
                //         layer.msg(cm.retMsg.get(datas.head.RETCODE));
                //         return;
                //     }
                //     if(!eap.isEmpty(datas.data)){
                //         eap.each(datas.data,function (e) {
                //             storeNameMap[e.ID_] = e.NAME_;
                //             storeIdList.push(e.ID_);
                //         });
                //     }
                // });
            },
            loadTenantList : function () {
                eap.post("/api/uum/data/query",{
                    dataModelName:"T_UUM_TENANT",
                    //ignoreTenant:true
                },function (data) {
                    var datas = eap.parseJson(data)
                    if(datas.data){
                        vm.tenantList = datas.data;
                    }
                })
            },
            selectTenant:function () {
                console.info(vm.params.tenantId)
                eap.postWithRequestBody('/api/uum/user/changeTenant',{
                    tenantId:vm.params.tenantId
                },function (datas){
                    console.info(datas)
                    if(datas.retcode !='0'){
                        //layer.msg(cm.retMsg.get(datas.retcode));
                        return;
                    }
                    vm.accessToken = datas.accessToken
                    merchantOverviewInit()
                })
            }

        }
    })
    //查询时间
    var aDayTimeRange = 24 * 60 * 60 * 1000;
    var nowDate = new Date();
    var curTime = nowDate.getTime();
    var yesterday = eap.dateFormat(new Date(curTime), 'yyyy-MM-dd') + ' 00:00:00'
    var oneWeekAgo = eap.dateFormat(new Date(curTime - aDayTimeRange * 7), 'yyyy-MM-dd') + ' 00:00:00'
    var fifteenAgo = eap.dateFormat(new Date(curTime - aDayTimeRange * 15), 'yyyy-MM-dd') + ' 00:00:00'
    var oneMonthAgo = eap.dateFormat(new Date(curTime - aDayTimeRange * 30), 'yyyy-MM-dd') + ' 00:00:00'
    //门店数据
    var storeNameMap = {};//门店名称
    var storeIdList = [];//门店id
    //统计图表
    var salesAmountCharts;  //商品销售金额曲线图
    var salesTurnoverCharts;//商品销售笔数曲线图
    var salesAmountPie;     //商品销售金额饼图
    var salesTurnoverPie;   //商品销售笔数饼图

    merchantOverviewInit = function () {
        console.info(sessionStorage.getItem('STORE_ID_'))
        $('.btn').removeClass('default')
        $('#storeOverviewWeekClick').addClass('default')
        vm.$refs.start_time.init()
        vm.$refs.end_time.init()
        vm.params.start_time.time = oneWeekAgo;
        vm.params.end_time.time = yesterday;

        vm.initStoreData();
        vm.loadTenantList();
        vm.loadRecords();
        vm.loadStatic();

    }
});
