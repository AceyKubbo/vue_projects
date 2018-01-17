/**
 * Created by 贤凌 on 2017-5-24.
 */
var MenuInit;
require(['jquery','vue','eap','layout'],function ($,Vue,eap) {
    var vm = new Vue({
        el:'#slider',
        data:{
            menuList:null,
            origin:{},
            storeList:{},
            tenant:{}
        },
        methods:{
            toMod:function (modName) {
                if(modName){
                    eap.toModView(modName);
                    eval(modName+"Init();");
                }
            }
        }
    });
    //目录信息
    vm.origin.MenuList = [
        { menu_name_:'首页',menu_icon_class_:'icon-home',menu_href_:'storeOverview',menu_code_:'1',
            son_menu:[]
        },
        { menu_name_:"基础设置",menu_icon_class_:"icon-layers",menu_href_:"",menu_code_:"2",
            son_menu:[
                // { menu_name_:"站点设置",menu_icon_class_:"",menu_href_:"stationSet",menu_code_:"21"},
                { menu_name_:"门店设置",menu_icon_class_:"",menu_href_:"storeManage",menu_code_:"22"},
                { menu_name_:"商品设置",menu_icon_class_:"",menu_href_:"goodsSet",menu_code_:"23"},
                { menu_name_:"货道设置",menu_icon_class_:"",menu_href_:"cupboardAdmin",menu_code_:"25"},
                { menu_name_:"线上商城",menu_icon_class_:"",menu_href_:"shopManage",menu_code_:"26"},
                { menu_name_:"购物码管理",menu_icon_class_:"",menu_href_:"qrcodeManage",menu_code_:"27"}
            ]
        },
        { menu_name_:"交易管理",menu_icon_class_:"icon-wallet",menu_href_:"",menu_code_:"3",
            son_menu:[
                { menu_name_:"销售记录",menu_icon_class_:"",menu_href_:"salesRecord",menu_code_:"30"},
                // { menu_name_:"交易记录统计",menu_icon_class_:"",menu_href_:"transactionStatistic",menu_code_:"31"},
                { menu_name_:"销售商品统计",menu_icon_class_:"",menu_href_:"goodsSaleStatistic",menu_code_:"32"},
                { menu_name_:"销售商品明细",menu_icon_class_:"",menu_href_:"goodsSalesDetail",menu_code_:"33"}
                // { menu_name_:"送货单",menu_icon_class_:"",menu_href_:"deliveryRecord",menu_code_:"32"},

            ]
        },
        { menu_name_:"运营管理",menu_icon_class_:"icon-support",menu_href_:"",menu_code_:"4",
            son_menu:[
                // { menu_name_:"设备实时监控",menu_icon_class_:"",menu_href_:"equipmentMonitor",menu_code_:"40"},
                { menu_name_:"补换货记录",menu_icon_class_:"",menu_href_:"operationRecord",menu_code_:"41"},
                { menu_name_:"送货记录",menu_icon_class_:"",menu_href_:"deliveryRecord",menu_code_:"42"},
                { menu_name_:"库存查询",menu_icon_class_:"",menu_href_:"stockManage",menu_code_:"43"},
                { menu_name_:"出入库管理",menu_icon_class_:"",menu_href_:"stockOrder",menu_code_:"44"},
            ]
        }
    ]
    var MenuList = function () {
        vm.tenant = eap.getTenantInfo();
        vm.menuList=vm.origin.MenuList.filter(function (e) {
            return vm.tenant.tenantId=="t00000001"?true:e.menu_code_!="5"
        });
    }
    MenuInit = function () {
        MenuList();
    }
})