// /**
//  * Created by apple on 17/9/13.
//  */
// var saleStatisticInit
// require(['jquery','vue','eap','weui'],function ($,vue,eap,weui) {
//     var vm = new vue({
//         el:"#salesStatistics",
//         data:{
//             goodsSaleStatList:null,
//             goodsSaleTotal:{}
//         },
//         methods:{
//             returnHome:function () {
//                 $("#salesStatistics").hide()
//                 $("#homepage").show()
//             },
//             todayStatistic:function () {
//                 $("#firstDatetimePicker").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 00:00:00")
//                 $("#lastDatetimePicker").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
//                 SaleStatisticList()
//             },
//             yesterdayStatistic:function () {
//                 $("#firstDatetimePicker").val(yesterday)
//                 $("#lastDatetimePicker").val(yesterdayNight)
//                 SaleStatisticList()
//             },
//             // dateSearch:function () {
//             //     $("#firstDatetimePicker").val($("#firstDatetimePicker").val() + " 00:00:00")
//             // }
//             search:function () {
//                 SaleStatisticList()
//             }
//         }
//     })
//     var nowDate = new Date();
//     var userInfo = eap.getUserInfo()
//     var aDayTimeRange = 24*60*60*1000;
//     var curTime = nowDate.getTime();
//     var yesterday = eap.dateFormat(new Date(curTime - aDayTimeRange),'yyyy-MM-dd')+" 00:00:00"
//     var yesterdayNight = eap.dateFormat(new Date(curTime-aDayTimeRange),'yyyy-MM-dd')+" 23:59:59"
//     var SaleStatisticList = function (params) {
//         params = {
//             dataModelName:"T_VM_SALE_STAT",
//             PAY_STATE_:'200',
//             TRADE_TIME_: $("#firstDatetimePicker").val()+"@ge&&"+ $("#lastDatetimePicker").val()+"@le",
//             sum:"PRODUCT_COST_,PRODUCT_COUNT_,PAY_COUNT_",
//             TENANT_ID_:userInfo.TENANT_ID_
//         }
//         //统计数据
//         eap.post(eap.webApi('comm@query'),eap.apply({ignoreData:true},params), function (data) {
//             var datas = eap.parseJson(data);
//             vm.goodsSaleTotal = datas.head
//             vm.goodsSaleTotal.goodsSaleStatProductCount = datas.head.PRODUCT_COUNT_
//             vm.goodsSaleTotal.goodsSaleStatPayCount = (datas.head.PAY_COUNT_*0.01).toFixed(2)
//             vm.goodsSaleTotal.goodsSaleStatSaleSprofit = ((datas.head.PAY_COUNT_ - datas.head.PRODUCT_COST_)*0.01).toFixed(2)
//         })
//         eap.post(eap.webApi("comm@query"),eap.apply({groupBy:"MERCHANT_NUM_,TRADE_NAME",orderBy:"PAY_COUNT_"},params),function (data) {
//             var datas = eap.parseJson(data);
//             if(datas){
//                 var data = datas.data;
//                 eap.each(data,function (e) {
//                     e['PAY_COUNT_'] = (e.PAY_COUNT_ *0.01).toFixed(2)
//                     e['PRODUCT_COST_'] = (e.PRODUCT_COST_ *0.01).toFixed(2)
//                     e['SaleSprofit'] = (e.PAY_COUNT_-e.PRODUCT_COST_).toFixed(2)
//                     if(eap.isEmpty(e['TRADE_NAME'])){
//                         e['TRADE_NAME'] = "-"
//                     }
//                 })
//                 vm.goodsSaleStatList = data
//             }
//         })
//     }
//     saleStatisticInit = function () {
//          $("#firstDatetimePicker,#lastDatetimePicker").calendar().on('changeDate',function (e) {
//              console.info(99)
//          })
//         //$("#firstDatetimePicker,#lastDatetimePicker").datetimePicker()
//         $("#firstDatetimePicker").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 00:00:00")
//         $("#lastDatetimePicker").val(eap.dateFormat(nowDate,'yyyy-MM-dd')+" 23:59:59")
//         SaleStatisticList()
//     }
// })
