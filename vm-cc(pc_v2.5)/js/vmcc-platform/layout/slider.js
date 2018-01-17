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
        // { menu_name_:'商户概览',menu_icon_class_:'icon-home',menu_href_:'merchantOverview',menu_code_:'3',
        //     son_menu:[]
        // },
        { menu_name_: "运营管理", menu_icon_class_: "icon-wallet", menu_href_: "", menu_code_: "2",
            son_menu: [
                { menu_name_:"销售记录",menu_icon_class_:"",menu_href_:"salesRecord",menu_code_:"58"},
                { menu_name_:"销售商品明细",menu_icon_class_:"",menu_href_:"goodsSalesDetail",menu_code_:"58"},
            ]
        },
        { menu_name_:"基础设置",menu_icon_class_:"icon-layers",menu_href_:"",menu_code_:"1",
            son_menu:[
                { menu_name_:"商户管理",menu_icon_class_:"",menu_href_:"enterpriseAccount",menu_code_:"50"},
                { menu_name_:"商品分类",menu_icon_class_:"",menu_href_:"goodsType",menu_code_:"51"},
                { menu_name_:"商品库",menu_icon_class_:"",menu_href_:"goodBank",menu_code_:"52"},
                { menu_name_:"设备管理",menu_icon_class_:"",menu_href_:"deviceSet",menu_code_:"53"},
            ]
        },
        { menu_name_: "供应链管理", menu_icon_class_: "icon-support", menu_href_: "", menu_code_: "2",
            son_menu: [
                { menu_name_:"仓库管理",menu_icon_class_:"",menu_href_:"storeHouse",menu_code_:"54"},
                { menu_name_:"供应商管理",menu_icon_class_:"",menu_href_:"supplierManage",menu_code_:"55"},
                { menu_name_:"采购单管理",menu_icon_class_:"",menu_href_:"purchaseManage",menu_code_:"56"},
                { menu_name_:"送货单管理",menu_icon_class_:"",menu_href_:"deliveryManage",menu_code_:"57"},
                { menu_name_:"库存查询",menu_icon_class_:"",menu_href_:"stockManage",menu_code_:"59"},
                { menu_name_:"出入库查询",menu_icon_class_:"",menu_href_:"stockOrder",menu_code_:"510"}
            ]
        },

    ]
    var MenuList = function () {
        vm.menuList = vm.origin.MenuList;
    }
    MenuInit = function () {
        MenuList();
    }
})