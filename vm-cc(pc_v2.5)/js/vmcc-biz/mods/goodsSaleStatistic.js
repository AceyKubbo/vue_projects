var goodsSaleStatisticInit
require(['jquery', 'eap', 'vue', 'datetimepicker', 'counterup'], function ($, eap, Vue) {

    var vm = new Vue({
        el: '#section-goodsSaleStatistic',
        data: {
            TotalCount: 0,
            goodsSaleStatList: {},
            RecordCount: 50,
            params: {limit: 50},
            goodsSaleStatList: {},
            changTable: [false, false, false, false, false]
        },
        methods: {
            showOrderDetail:function(goodsSaleStat){
                eap.toModView('salesRecord');
                //SaleList(salesRecord.CODE_);
                salesRecordInit()

            },
            weekStatistics: function () {
                $("#goodsSaleStartTime").val(oneWeekAgo)
                $("#goodsSaleEndTime").val(eap.dateFormat(nowDate, 'yyyy-MM-dd') + " 23:59:59")
                vm.saleStatQuery()
            },
            twoWeekStatistics: function () {
                $("#goodsSaleStartTime").val(twoWeekAgo)
                $("#goodsSaleEndTime").val(eap.dateFormat(nowDate, 'yyyy-MM-dd') + " 23:59:59")
                vm.saleStatQuery()
            },
            monthStatistics: function () {
                $("#goodsSaleStartTime").val(oneMonthAgo)
                $("#goodsSaleEndTime").val(eap.dateFormat(nowDate, 'yyyy-MM-dd') + " 23:59:59")
                vm.saleStatQuery()
            },
            todayStatistics: function () {
                $("#goodsSaleStartTime").val(eap.dateFormat(nowDate, 'yyyy-MM-dd') + " 00:00:00")
                $("#goodsSaleEndTime").val(eap.dateFormat(nowDate, 'yyyy-MM-dd') + " 23:59:59")
                vm.saleStatQuery()

            },
            yesterdayStatistics: function () {
                $("#goodsSaleStartTime").val(yesterday)
                $("#goodsSaleEndTime").val(yesterdayNight)
                vm.saleStatQuery()
            },
            saleStatQuery: function () {
                // $("#goodsSaleEndTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
                var params = {
                    dataModelName: "V_SHOP_ORDER_DETAIL_ST",
                    ORDER_CREATE_TIME_: $("#goodsSaleStartTime").val() + "@ge&&" + $("#goodsSaleEndTime").val() + "@le",
                    accessToken: sessionStorage.getItem('AccessToken'),
                    STORE_ID_: sessionStorage.getItem('STORE_ID_'),
                    ORDER_ID_: '@notNull',
                    COUNTER_SN_: vm.params.COUNTER_SN_,
                    GOODS_NAME_: vm.params.GOODS_NAME_,
                    ORDER_STATUS_: '1',
                    ORDER_PAY_STATUS_: '1@not',
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

                            $("#goodsSaleStatProductCount").attr('data-value', totalNumber)
                            $("#goodsSaleStateTotalCount").attr('data-value', totalCount)
                            $("#goodsSaleStatPayCount").attr('data-value', (totalMoey * 0.01).toFixed(2))
                            $("#goodsSaleStatRefundCount").attr('data-value', (totalRefund * 0.01).toFixed(2))
                            $("#goodsSaleStatActualCount").attr('data-value', (totalActual * 0.01).toFixed(2))
                            $("[data-counter='counterup']").counterUp()
                        }
                        vm.goodsSaleStatList = datas.data;
                    }
                })
            },
            changeStyle: function (e) {
                this.changTable = [false, false, false, false, false];
                this.changeTable["e.target.getAttribute(data-index)"] = true
            }
        }

    });
    $('#goodsSaleStartTime,#goodsSaleEndTime').datetimepicker({
        format: "yyyy-mm-dd hh:ii:ss",
        minView: 2,
        autoclose: true,
        todayBtn: true,
        language: 'cn',
    }).on('changeDate', function (e) {
        vm.params[e.target.id] = e.target.id.indexOf("START") > -1 ? e.target.value + ' 00:00:00' : e.target.value + ' 23:59:59';
    });
    var userInfo = eap.getUserInfo();
    var aDayTimeRange = 24 * 60 * 60 * 1000;
    var nowDate = new Date();
    var curTime = nowDate.getTime();
    var yesterday = eap.dateFormat(new Date(curTime - aDayTimeRange), 'yyyy-MM-dd') + " 00:00:00"
    var yesterdayNight = eap.dateFormat(new Date(curTime - aDayTimeRange), 'yyyy-MM-dd') + " 23:59:59"
    var oneWeekAgo = eap.dateFormat(new Date(curTime - 7 * aDayTimeRange), 'yyyy-MM-dd') + " 00:00:00";
    var twoWeekAgo = eap.dateFormat(new Date(curTime - 14 * aDayTimeRange), 'yyyy-MM-dd') + " 00:00:00";
    var oneMonthAgo = eap.dateFormat(new Date(curTime - 30 * aDayTimeRange), 'yyyy-MM-dd') + " 00:00:00";

    goodsSaleStatisticInit = function () {
        $("#goodsSaleStartTime").val(eap.dateFormat(nowDate, 'yyyy-MM-dd') + " 00:00:00")
        $("#goodsSaleEndTime").val(eap.dateFormat(nowDate, 'yyyy-MM-dd') + " 23:59:59")
        vm.saleStatQuery();
    }

});