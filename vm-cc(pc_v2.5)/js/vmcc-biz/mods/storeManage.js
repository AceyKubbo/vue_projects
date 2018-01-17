/**
 * Created by apple on 17/12/5.
 */
var storeManageInit
require(['jquery','vue','eap','amap'],function ($,Vue,eap,amap) {
    var store = new Vue({
        el:"#section-storeManage",
        data:{
            storeList:{},
            cityInfoList:null,
            mapInfo:{},
            storeDetail:{},
            origin:{},
            editShopStore:[{checked:true,value:'1'},{checked:false,value:'0'}],
            RecordCount:50,
            TotalCount:0,
            params:{
                limit:50,
            }
        },
        methods:{
            loadMap:function () {
                store.mapInfo = eap.copyApply({},store.storeDetail)
                //加载站点位置
                if(store.mapInfo['STATION_LON_']&&store.mapInfo['STATION_LAT_']){
                    marker.setPosition([store.mapInfo['STATION_LON_'],store.mapInfo['STATION_LAT_']]);
                    map.setCenter(marker.getPosition());
                }else{
                    geolocation.getCurrentPosition(function (state,data) {
                        store.mapInfo={
                            STATION_LON_:data.position.getLng(),
                            STATION_LAT_:data.position.getLat()
                        }
                        marker.setPosition(data.position);
                        map.setCenter(marker.getPosition());
                    })
                }
            },
            submitStation:function () {
                if(eap.isEmpty(store.storeDetail.NAME_)){
                    layer.msg('门店名称不能为空!')
                    return
                }
                if(eap.isEmpty(store.storeDetail.PAY_KEY_)){
                    layer.msg('支付key不能为空!')
                    return
                }
                 store.storeDetail.CHECK_STOCK_FLAG_ = store.storeDetail.CHECK_STOCK_FLAG_ ? '1' :'0'
                store.storeDetail.NET_FLAG_ = store.storeDetail.NET_FLAG_ ? '1' :'0'
                var stationModel = store.storeDetail
                stationModel['accessToken'] = sessionStorage.getItem('AccessToken')
                stationModel['className'] = 'shopStore'
                $.ajax({
                    url:'/api/shop/store/create',
                    type:'POST',
                    async:false,
                    dataType:'json',
                    data: stationModel,
                    success:function (data) {
                        if(data.head.RETCODE == '0'){
                            $("#addShopStore").modal('hide')
                            storeList()
                        }else{
                            layer.msg(data.head.RETMSG)
                        }
                    },
                    error:function (data) {
                        layer.msg(data)
                    }

                })
            },
            cleanSearchAMap:function () {
                $('#search_condition').val('')
                store.mapInfo.search_condition = ''
            },
            submitLonLat:function () {
                store.storeDetail['STATION_LON_'] = store.mapInfo['STATION_LON_'];
                store.storeDetail['STATION_LAT_'] = store.mapInfo['STATION_LAT_'];
                store.storeDetail['STATION_LOCATION'] = store.mapInfo['STATION_LON_']+','+store.mapInfo['STATION_LAT_'];
                $('#LonLatSelector').modal('hide')
            },
            addShopStore:function () {
                store.storeDetail={
                    STATION_LOCATION:'',//初始化经纬度
                    PROVINCE_ID_:'',//初始化行政区域绑定元素
                    CITY_ID_:'',//初始化行政区域绑定元素
                    DISTRICT_ID_:'',//初始化行政区域绑定元素
                    NET_FLAG_:false,
                    CHECK_STOCK_FLAG_:true,
                }
                $('#addShopStore').modal('toggle')
            },
            searchMapChange:function (e) {
                if(e){
                    $('#input-clear').show()
                }else{
                    $('#input-clear').hide()
                }
            },
            searchMap:function (info) {
                if(info['search_condition']){
                    placeSearch.search(info['search_condition']);
                }
            },
            editStore:function (s) {
                if(s){
                    s.NET_FLAG_ = s.NET_FLAG_ == '1' ? true :false
                    s.CHECK_STOCK_FLAG_ = s.CHECK_STOCK_FLAG_ == '1' ? true :false
                    store.editShopStore = s
                    $('#editShopStore').modal('toggle')
                }
            },
            submitEditStation:function (editShopStore) {
                editShopStore.NET_FLAG_ = editShopStore.NET_FLAG_ ? '1':'0'
                editShopStore.CHECK_STOCK_FLAG_ = editShopStore.CHECK_STOCK_FLAG_ ? '1':'0'
                var  params = eap.copyApply(editShopStore,{
                    accessToken:sessionStorage.getItem('AccessToken'),
                    dataModelName:'T_SHOP_STORE'
                },editShopStore);
                $.ajax({
                    url:'/api/shop/data/crud',
                    type:'POST',
                    async:false,
                    dataType:'json',
                    data:params,
                    success:function (data) {
                        storeList()
                        $('#editShopStore').modal('hide')
                    },
                    error:function (msg) {
                    }
                })
            },
            //删除门店
            deleteStore:function (data) {
                layer.confirm("是否停用此门店?",{btn:["确认","取消"]},function (index) {
                    layer.close(index);
                    eap.post('/api/shop/data/crud', {
                        dataModelName: 'T_SHOP_STORE',
                        STATUS_: '2',
                        ID_:data.ID_
                    },function (data) {
                        var datas = eap.parseJson(data)
                        if(datas.head.RETCODE != '0'){
                            layer.msg(datas.head.RETCODE)
                            return
                        }
                        storeList()
                    })
                })
            },
            //启用门店
            enableStore:function (data) {
                layer.confirm("是否启用此门店?",{btn:["确认","取消"]},function (index) {
                    layer.close(index);
                    eap.post('/api/shop/data/crud', {
                        dataModelName: 'T_SHOP_STORE',
                        STATUS_: '1',
                        ID_:data.ID_
                    },function (data) {
                        var datas = eap.parseJson(data)
                        if(datas.head.RETCODE != '0'){
                            layer.msg(datas.head.RETCODE)
                            return
                        }
                        storeList()
                    })
                })
            },
            searchStore:function () {
                var conditions = eap.copyApply({},store.params);
                if(store.origin.storeList){
                    var templist= store.origin.storeList.filter(function (e) {
                        if(typeof condition ==='function') flag = flag&&condition(e);
                        var flag = true;
                        if(conditions.NAME_) flag=flag&&e['NAME_'].indexOf(conditions.NAME_)>=0;
                        return flag;
                    });
                    store.TotalCount = templist.length;
                    store.RecordCount = store.RecordCount>store.TotalCount?store.TotalCount:store.RecordCount;
                    store.storeList = templist.slice(0,Number(store.RecordCount))
                }else{
                    store.TotalCount = 0;
                    store.RecordCount = 0;
                    store.storeList = []
                }
            },
            search:function () {
                store.RecordCount=50;
                store.searchStore()
            },
        }
    })
    var storeList = function (params) {
        params = eap.copyApply(params,{
            accessToken:sessionStorage.getItem('AccessToken'),
            dataModelName:'V_SHOP_STORE'
        });
        $.ajax({
            url:'/api/shop/data/query',
            type:'POST',
            async:false,
            dataType:'json',
            data:params,
            success:function (data) {
                store.TotalCount = data ? data.head.totalCount:0
                store.RecordCount = store.TotalCount<50?store.TotalCount:50;
                if(data){
                    store.origin.storeList = data.data
                    store.storeList = data.data
                }
            },
            error:function (msg) {
            }
        })
    }
    // var map = new AMap.Map('GaoDe_map',{
    //     resizeEnable: true,
    //     zoom:13,
    //     keyboardEnable: false
    // });
    // AMap.plugin(['AMap.Scale','AMap.Geolocation','AMap.PlaceSearch'],function(){
    //     placeSearch = new AMap.PlaceSearch({
    //         city:'',
    //         map:map
    //     })
    //     geolocation = new AMap.Geolocation({
    //         resizeEnable: true,
    //         timeout: 10000,
    //         buttonPosition:'RB',
    //         city:''
    //     })
    //     marker = new AMap.Marker({map:map});
    //     map.addControl(new AMap.Scale());
    //     map.addControl(geolocation);
    //
    //     geolocation.on('complete', function (data) {
    //         store.mapInfo['STATION_LON_'] = data.position.getLng();
    //         store.mapInfo['STATION_LAT_'] = data.position.getLat();
    //         marker.setPosition(data.position)
    //     });
    //     marker.on('click',function () {
    //         store.mapInfo['STATION_LON_'] = marker.getPosition().getLng();
    //         store.mapInfo['STATION_LAT_'] = marker.getPosition().getLat();
    //     });
    //     placeSearch.on('markerClick',function (e) {
    //         store.mapInfo['STATION_LON_'] = e.marker.getPosition().getLng();
    //         store.mapInfo['STATION_LAT_'] = e.marker.getPosition().getLat();
    //     })
    // });
    storeManageInit = function () {
        storeList()
    }
})
