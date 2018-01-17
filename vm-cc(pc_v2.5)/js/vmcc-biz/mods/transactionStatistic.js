/**
 * Created by apple on 17/11/15.
 */
var TransactionStatisticInit
require(['jquery','eap','vue','datetimepicker','counterup'],function($,eap,Vue){
    var vm = new Vue({
        el:'#section-transactionStatistic',
        data:{
            params:{},
            transactionList:{},

        },
        methods:{
            weekStatistics:function () {
                $("#transactionStartTime").val(oneWeekAgo)
                $("#transactionSEndTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
            },
            twoWeekStatistics:function () {
                $("#transactionStartTime").val(twoWeekAgo)
                $("#transactionSEndTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
            },
            monthStatistics:function () {
                $("#transactionStartTime").val(oneMonthAgo)
                $("#transactionSEndTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
            },
            todayStatistics:function () {
                $("#transactionStartTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 00:00:00")
                $("#transactionSEndTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
            },
            yesterdayStatistics:function () {
                $("#transactionStartTime").val(yesterday)
                $("#transactionSEndTime").val(yesterdayNight)
            },
            search:function () {
                //$("#transactionSEndTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
                var params = {
                    dataModelName:"T_SHOP_ORDER",
                    CREATE_TIME_: $("#transactionStartTime").val()+"@ge&&"+ $("#transactionSEndTime").val()+"@le",
                    accessToken:sessionStorage.getItem('AccessToken'),
                    STORE_ID_:sessionStorage.getItem('STORE_ID_'),
                    PAY_STATUS_:'2',
                    COUNTER_ID_:vm.params.COUNTER_ID_
                    }
                $.ajax({
                    url:'/api/shop/data/query',
                    type:'POST',
                    dataType:'json',
                    async :false,
                    data:params,
                    success:function (datas) {
                        var totalMoney = 0
                        var wxTotalMoney = 0
                        var wxTotalMoneyCount = 0
                        var aplipayMoney = 0
                        var aplipayMoneyCount = 0
                        var cashMoney = 0
                        var cashMoneyCount = 0
                        if(datas.data){
                            var temp = new Array()
                            eap.each(datas.data,function (e) {
                                totalMoney = totalMoney + parseInt(e.PAY_AMOUNT_)
                                if(e.PAY_CHANNEL_ == 'wx_pub'){
                                    wxTotalMoney = wxTotalMoney + parseInt(e.PAY_AMOUNT_)
                                    wxTotalMoneyCount = wxTotalMoneyCount + 1
                                }
                                if(e.PAY_CHANNEL_ == 'alipay_wap'){
                                    aplipayMoney = aplipayMoney + parseInt(e.PAY_AMOUNT_)
                                    aplipayMoneyCount = aplipayMoneyCount + 1
                                }
                                if(e.PAY_CHANNEL_ == 'cash'){
                                    cashMoney = cashMoney + parseInt(e.PAY_AMOUNT_)
                                    cashMoneyCount = cashMoneyCount + 1
                                }
                            })
                        }
                        $('#saleTotalMoney').attr('data-value',(totalMoney * 0.01).toFixed(2))
                        $('#saleTotalMoneyCount').attr('data-value',datas.data.length)
                        $('#wxTotalMoney').attr('data-value',(wxTotalMoney * 0.01).toFixed(2))
                        $('#wxTotalMoneyCount').attr('data-value',wxTotalMoneyCount)
                        $('#alipayTotalMoney').attr('data-value',(aplipayMoney * 0.01).toFixed(2))
                        $('#alipayTotalMoneyCount').attr('data-value',aplipayMoneyCount)
                        $('#cashTotalMoey').attr('data-value',(cashMoney * 0.01).toFixed(2))
                        $('#cashTotalMoeyCount').attr('data-value',cashMoneyCount)
                        $("[data-counter='counterup']").counterUp();
                    }
                })

            }
        }
    });
    $('#transactionStartTime,#transactionSEndTime').datetimepicker({
        format: "yyyy-mm-dd hh:ii:ss",
        minView: 2,
        autoclose: true,
        todayBtn: true,
        language: 'cn',
    }).on('changeDate', function (e) {
        vm.params[e.target.id] = e.target.id.indexOf("START") > -1 ? e.target.value + ' 00:00:00':e.target.value + ' 23:59:59';
    });
    var userInfo = eap.getUserInfo();
    var aDayTimeRange = 24*60*60*1000;
    var nowDate = new Date();
    var curTime = nowDate.getTime();
    var yesterday = eap.dateFormat(new Date(curTime - aDayTimeRange),'yyyy-MM-dd')+" 00:00:00"
    var yesterdayNight = eap.dateFormat(new Date(curTime-aDayTimeRange),'yyyy-MM-dd')+" 23:59:59"
    var oneWeekAgo = eap.dateFormat(new Date(curTime - 7*aDayTimeRange),'yyyy-MM-dd')+" 00:00:00";
    var twoWeekAgo = eap.dateFormat(new Date(curTime - 14*aDayTimeRange),'yyyy-MM-dd')+" 00:00:00";
    var oneMonthAgo = eap.dateFormat(new Date(curTime - 30*aDayTimeRange),'yyyy-MM-dd')+" 00:00:00";

    TransactionStatisticInit = function () {
        $("#transactionStartTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 00:00:00")
        $("#transactionSEndTime").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
    }

});