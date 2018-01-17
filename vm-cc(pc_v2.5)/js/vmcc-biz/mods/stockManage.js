/**
 * Created by apple on 17/11/24.
 */
var stockManageInit
require(['jquery', 'vue', 'eap', 'layer'], function ($, Vue, eap, layer) {
    var stockStatisticsGrid = new Vue({
        el: "#section-stockManage",
        data: {
            stockList: {},
            origin: {},
            TotalCount: 0,
            RecordCount: 50,
            params: {
                limit: 50,
                stockList: {}
            },
            goodInfo: {
                name_: '',
                code_: ''
            },
            DeviceInfo: {},
            param:{}
        },


        methods: {
            loadRecords : function(){
                eap.post('/api/shop/store/' + sessionStorage.getItem('STORE_ID_') + '/stats', {}, function (data) {
                    var datas = eap.parseJson(data);
                    var stockData = datas.data.sort(function (a,b) {
                        return b.stockCount - a.stockCount
                    })
                    stockStatisticsGrid.origin.stockList = stockData;
                    stockStatisticsGrid.stockList = stockData;
                })
            },
            StockSearch:function (condition) {
                var tempList = stockStatisticsGrid.origin.DeviceInfo.filter(function (e) {
                    var flag = true;
                    if(typeof condition ==='function') flag = flag&&condition(e);
                    return flag;
                })
                stockStatisticsGrid.DeviceInfo = tempList.slice(0,Number(tempList.length))
            },

            showShortDetiall: function () {
                $('#ShortDetiallHeader').addClass('active')
                $('#ShortDetiall').addClass('active')
                $('#DeviceStockHeader').removeClass('active')
                $('#DeviceStock').removeClass('active')
                stockStatisticsGrid.StockSearch(function (e) {
                    return e.SHORT_COUNT_>=1;
                })
            },
            showDeviceStock: function () {
                $('#DeviceStockHeader').addClass('active')
                $('#DeviceStock').addClass('active')
                $('#ShortDetiallHeader').removeClass('active')
                $('#ShortDetiall').removeClass('active')
                stockStatisticsGrid.StockSearch();
            },
            showShortDetial: function (Stock) {
                $('#ShortDetial').modal('toggle')
                stockStatisticsGrid.goodInfo.name_ = Stock.name;
                stockStatisticsGrid.goodInfo.code_ = Stock.code;
                DeviceInfo(Stock);
                stockStatisticsGrid.showShortDetiall();
            },
            changeTab: function (flag) {
                switch (flag) {
                    case 'warn':
                        stockStatisticsGrid.RecordCount = 50;
                        stockStatisticsGrid.search(function (e) {
                            return e.stockCount == '' || parseInt(e.stockCount) < 5
                        })
                        break;
                    case 'all':
                        stockStatisticsGrid.RecordCount = 50;
                        stockStatisticsGrid.search(function (e) {
                            return true
                        })
                }
            },
            addStockManage: function () {
                $('#addStockManage').modal('toggle')
            },
            searchGood: function () {
                stockStatisticsGrid.search()
            },
            search: function (condition) {
                var conditions = eap.copyApply({}, stockStatisticsGrid.params);
                stockStatisticsGrid.RecordCount = 50;
                if (stockStatisticsGrid.origin.stockList) {

                    var templist = stockStatisticsGrid.origin.stockList.filter(function (e) {
                        var flag = true;
                        if (typeof condition === 'function') flag = flag && condition(e);
                        if (conditions.cond)flag = flag && (e['name'].indexOf(conditions.cond) >= 0 || e['code'].indexOf(conditions.cond) >= 0)
                        return flag;
                    });
                    stockStatisticsGrid.TotalCount = templist.length;
                    stockStatisticsGrid.RecordCount = stockStatisticsGrid.TotalCount > 0 ? stockStatisticsGrid.RecordCount > stockStatisticsGrid.TotalCount ? stockStatisticsGrid.TotalCount : stockStatisticsGrid.RecordCount : 0;
                    stockStatisticsGrid.stockList = templist.slice(0, Number(stockStatisticsGrid.RecordCount))
                } else {
                    stockStatisticsGrid.TotalCount = 0;
                    stockStatisticsGrid.RecordCount = 0;
                    stockStatisticsGrid.stockList = []
                }
            }
        }
    })

    var DeviceInfo = function (e) {
        eap.post('/api/shop/data/query', {
            dataModelName: "V_SHOP_COUNTER_GOODS",
            STORE_ID_: sessionStorage.getItem("STORE_ID_"),
            CODE_: e.code,
            NAME_: e.name,
            selectColumns: "COUNT_,PLACE_NUM_,FLOOR_NUM_,COUNTER_NAME_,COUNTER_DEVICE_CODE_,COUNTER_SN_,SHORT_COUNT_,COUNTER_DEVICE_TYPE_"
        }, function (data) {
            var datas = eap.parseJson(data)
            if (datas) {
                stockStatisticsGrid.origin.DeviceInfo=datas.data;
                stockStatisticsGrid.DeviceInfo = datas.data;
            }
        })
    }
    stockManageInit = function () {
        stockStatisticsGrid.loadRecords();
    };
});
