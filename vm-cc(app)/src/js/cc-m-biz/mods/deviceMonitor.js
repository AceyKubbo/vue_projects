/**
 * Created by apple on 17/9/15.
 */
var deviceMonitorInit
require(['jquery','vue','eap'],function ($,vue,eap) {
    var vm = new vue({
        el:"#section-deviceMonitor",
        data:{
            monitorData:{},
            deviceList:null,
            RecordCount:10,
            TotalCount:0,
            deviceDetail:{}
        },
        methods:{
            returnHome:function () {
                eap.toModView('menu')
            },
            showDeviceDetail:function (device) {
                eap.toModView('deviceItem');
                deviceItemInit({mid:device.COUNTER_DEVICE_CODE_})
            },
            shortageCount:function () {
                eap.toModView('shortage-count');
                shortageCountInit();
            }
        },

    })
    var deviceList = function (params) {
        eap.post('/api/shop/data/query',{
            dataModelName:"V_SHOP_COUNTER_STATUS",
            STORE_ID_:sessionStorage.getItem("STORE_ID_"),
            COUNTER_TYPE_:"net@not",
            COUNTER_DEVICE_CODE_:"notNull@notNull",
            STATUS_:1,
            selectColumns:"COUNTER_SN_,COUNTER_NAME_",
            count:"IF(SHORT_COUNT_>0,1,NULL)@SHORT_COUNT_",
            groupBy:"COUNTER_DEVICE_CODE_"
        },function (data) {
            var datas = eap.parseJson(data)
            if(datas){
                vm.monitorData = datas.head
                vm.deviceList = datas.data
            }
        })
    }
    deviceMonitorInit = function () {
        deviceList()
    }
})