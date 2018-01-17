/**
 * Created by axl on 2017-6-16
 */
var goodsTypeInit;
require(['jquery','eap','vue'],function($,eap,Vue){
    //实例化
    var vm = new Vue({
        el:'#section-goodsType',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            goodTypeList:null,
        },
        methods:{
            showAddBtn:function (e) {
                $('a[name="addType"]').hide()
                $(e.target).parent().find('a[name="addType"]').show();
            },
            showType:function (type) {
                return type.TYPE_LEVEL_==0;
            },
            showSonType:function (type) {
                if(type['children']){
                    if($('#icon-'+type.ID_).attr('class')=='fa fa-plus-square-o'){
                        $('#icon-'+type.ID_).attr('class','fa fa-minus-square-o');
                        $('tr[name="type-son-'+type.ID_+'"]').show();
                    }else{
                        $('#icon-'+type.ID_).attr('class','fa fa-plus-square-o');
                        $('tr[name="type-son-'+type.ID_+'"]').hide();
                    }

                }
            },
            editType:function (type) {
                if(type){
                    type.editable =true;
                }
            },
            deleteType:function (type) {
                if (type){
                    layer.confirm("是否删除此分类?",{btn:["确认","取消"]},function (index) {
                        layer.close(index);
                        $.ajax({
                            url:'/api/shop/data/crud',
                            type:'POST',
                            dataType:'json',
                            async :false,
                            data:{
                                dataModelName:'T_SHOP_GOODS_TYPE',
                                deleteKey:type.ID_,
                                accessToken:sessionStorage.getItem('AccessToken')
                            },
                            success:function (datas) {
                                layer.msg(datas.head.RETMSG);
                                GoodTypeList(vm.params)
                            }
                        })
                    })
                }
            },
            saveType:function (type) {
                if(type){
                    type['dataModelName']='T_SHOP_GOODS_TYPE';
                    type['accessToken'] = sessionStorage.getItem('AccessToken')
                    $.ajax({
                        url:'/api/shop/data/crud',
                        type:'POST',
                        dataType:'json',
                        async :false,
                        data:type,
                        success:function (datas) {
                            layer.msg(datas.head.RETMSG);
                            GoodTypeList(vm.params);
                        }
                    })
                }
            },
            cancelType:function (type) {
                if(type){
                    type.editable =false;
                }
            },
            addType:function (type) {
                if(type){
                    var newType={
                        TYPE_NAME_:"新建分类",
                        TYPE_LEVEL_:type.TYPE_LEVEL_,
                        TYPE_STATUS_:type.TYPE_STATUS_
                    }
                    newType['dataModelName']='T_SHOP_GOODS_TYPE';
                    newType['accessToken'] = sessionStorage.getItem('AccessToken')
                    $.ajax({
                        url:'/api/shop/data/crud',
                        type:'POST',
                        dataType:'json',
                        async :false,
                        data:newType,
                        success:function (datas) {
                            GoodTypeList(vm.params)
                        }
                    })
                }
            },
            addSonType:function (type) {
                if(type){
                    var newType={
                        TYPE_NAME_:"新建分类",
                        TYPE_LEVEL_:parseInt(type.TYPE_LEVEL_)+1,
                        TYPE_STATUS_:type.TYPE_STATUS_,
                        PARENT_TYPE_ID_:type.ID_
                    }
                    newType['dataModelName']='T_SHOP_GOODS_TYPE';
                    newType['accessToken'] = sessionStorage.getItem('AccessToken')
                    $.ajax({
                        url:'/api/shop/data/crud',
                        type:'POST',
                        dataType:'json',
                        async :false,
                        data:newType,
                        success:function (datas) {
                            GoodTypeList(vm.params)
                            vm.params['addSonTypeShow']=function () {
                                $('tr[name="type-son-'+type.ID_+'"]').show();
                            }

                        }
                    })
                }
            }

        },
        updated:function () {
            if(typeof vm.params['addSonTypeShow']=='function'){
                vm.params.addSonTypeShow();
            }
        }
    });

    var GoodTypeList =function (params) {
        var treeData = new Array();
        if(eap.isEmpty(params,false)){
            params = {limit:50};
        }
        params= eap.copyApply({
            dataModelName:'T_SHOP_GOODS_TYPE',
            accessToken:sessionStorage.getItem('AccessToken'),
        },params)
        $.ajax({
            url:'/api/shop/data/query',
            type:'POST',
            dataType:'json',
            async :false,
            data:params,
            success:function (datas) {
                    if(datas){
                        vm.TotalCount = datas?datas.head.totalCount:0;
                        vm.RecordCount = Number(datas.head.totalCount)>50?50:datas.head.totalCount;
                        var data = datas.data;
                        eap.each(data,function (e) {
                            e['editable']=false;
                            if(eap.isEmpty(e.PARENT_TYPE_ID_,false)){
                                treeData.push(eap.copyApply(e,{
                                    children:new Array()
                                }))
                            }
                        })
                        eap.each(data,function (e) {
                            if(!eap.isEmpty(e.PARENT_TYPE_ID_,false)){
                                for(var k in treeData){
                                    if(treeData[k]['ID_']== e.PARENT_TYPE_ID_ ){
                                        treeData[k]['children'].push(e)
                                    }
                                }
                            }
                        })
                        vm.goodTypeList = treeData;
                    }
            }
        })
    }
    goodsTypeInit = function () {
        GoodTypeList();
    }
});