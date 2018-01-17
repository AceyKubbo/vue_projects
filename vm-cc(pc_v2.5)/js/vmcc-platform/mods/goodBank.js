/**
 * Created by apple on 17/11/7.
 */
var goodBankInit;
require(['jquery','eap','vue','aliyun-oss','fileinput'],function($,eap,Vue,OSS){
    //阿里OSS js客户端
    var OssClient;
    var vm = new Vue({
        el:'#section-goodBank',
        data:{
            TotalCount:0,
            RecordCount:50,
            params:{limit:50},
            goodLibList:null,
            origin:{},
            goodDetail:{
                GOODS_PICTURE_:''
            },
            selectOptions:{},
            goodParams:{}
        },
        methods:{
            loadMore:function () {
                vm.RecordCount+=50;
                vm.search();
            },
            search:function () {
                var conditions = eap.copyApply({},vm.params);
                vm.RecordCount = vm.RecordCount>vm.TotalCount?vm.TotalCount:vm.RecordCount;
                vm.goodLibList= vm.origin.goodLibList.filter(function (e) {
                    var flag = true;
                    if(conditions.NAME_) flag=flag&&e['NAME_'].indexOf(conditions.NAME_)>=0;
                    if(conditions.CODE_) flag=flag&&e['CODE_'].indexOf(conditions.CODE_)>=0;
                    return flag;
                }).slice(0,Number(vm.RecordCount));
            },
            newGood:function () {
                vm.goodDetail = null
                vm.goodDetail=eap.copyApply(vm.goodDetail,{title:'新建商品'})
                $('#catalogueSet').modal('toggle')
            },
            editGood:function (good) {
                good.CASH_PRICE_LABEL = good.CASH_PRICE_ * 0.01
                good.WX_PRICE_LABEL = good.WX_PRICE_ * 0.01
                good.ALI_PRICE_LABEL = good.ALI_PRICE_ * 0.01
                vm.goodDetail = eap.copyApply({title:'编辑商品'},good);
            },
            removeImg:function () {
                vm.goodDetail['GOODS_PICTURE_']='';
                vm.goodDetail['updateImgFlag'] = false;
            },
            getImg:function (e) {
                console.info(e,'kkkkkk')
                var files = e.target.files === undefined ? (e.target && e.target.value ? [{ name: e.target.value.replace(/^.+\\/, '')}] : []) : e.target.files;
                if(files.length==1){
                    var reader = new FileReader();
                    var file = files[0];
                    reader.readAsDataURL(file)
                    reader.onload=function (ee) {
                        vm.goodDetail['GOODS_PICTURE_']=ee.target.result;
                        vm.goodDetail['GOODS_PICTURE_FILE'] = file;
                    }
                }
            },
            delGood:function (good) {
                layer.confirm("是否确认删除此商品?",function () {
                    $.ajax({
                        url:'/api/shop/data/crud',
                        type:'POST',
                        dataType:'json',
                        async :false,
                        data:{
                            dataModelName:'T_SHOP_GOODS_LIB',
                            deleteKey:good.ID_,
                            accessToken:sessionStorage.getItem('AccessToken')
                        },
                        success:function (datas) {
                            layer.alert(datas.head.RETMSG);
                            GoodList();
                        }
                    })
                })
            },
            submitGood:function () {
                vm.goodDetail.CASH_PRICE_ = vm.goodDetail.CASH_PRICE_LABEL * 100
                vm.goodDetail.WX_PRICE_ = vm.goodDetail.WX_PRICE_LABEL * 100
                vm.goodDetail.ALI_PRICE_ = vm.goodDetail.ALI_PRICE_LABEL * 100
                var params = eap.copyApply({
                    dataModelName:'T_SHOP_GOODS_LIB',
                    accessToken: sessionStorage.getItem('AccessToken')
                },vm.goodDetail)
                if(params['GOODS_PICTURE_FILE']&&params.GOODS_PICTURE_.indexOf("http://itopvm.oss")<=-1){
                    var dir = 'goodsImg/pro/'+userInfo.TENANT_ID_+"/"+eap.uuid();
                    OssClient.multipartUpload(dir,params['GOODS_PICTURE_FILE']).then(function (result) {
                        params.PICTURE_ = result.url;
                        params.GOODS_PICTURE_FILE = ""
                        $.ajax({
                            url:'/api/shop/data/crud',
                            type:'POST',
                            dataType:'json',
                            async :false,
                            data:params,
                            success:function (datas) {
                                layer.msg(datas.head.RETMSG);
                                $('#catalogueSet').modal('hide');
                                GoodList(vm.params);
                            }
                        })
                    }).catch(function (err) {
                        layer.alert('图片上传失败,请更换图片重试!')
                        console.error('图片上传失败[ERRMSG]!'.replace("ERRMSG",err));
                        return;
                    });
                }else {
                    $.ajax({
                        url:'/api/shop/data/crud',
                        type:'POST',
                        dataType:'json',
                        async :false,
                        data:params,
                        success:function (datas) {
                            layer.msg(datas.head.RETMSG);
                            $('#catalogueSet').modal('hide');
                            GoodList(vm.params);
                        }
                    })
                }

            },
            searchGood:function () {
                
            },
            importGoods:function () {
                
            }
        }
    });
    var userInfo = eap.getUserInfo();
    // var goodUintModel = eap.CodeModel('C_GOODS_UNIT');
    // var goodTypeModel = eap.CodeModel('C_GOODS_TYPE');
    // vm.selectOptions.goodUnits = goodUintModel.toJsonObject();
    // vm.selectOptions.goodTypes = goodTypeModel.toJsonObject();
    var GoodList = function (params) {
        params = eap.copyApply({
            dataModelName:"T_SHOP_GOODS_LIB",
            accessToken:sessionStorage.getItem('AccessToken'),
        },params);
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
                    vm.origin.goodLibList = datas.data;
                    vm.goodLibList = vm.origin.goodLibList.slice(0,Number(vm.RecordCount)).sort(function (a,b) {
                        return a.CODE_ - b.CODE_
                    });
                }
            }
        })
    }
    goodBankInit = function () {
        OssClient =new OSS.Wrapper({
            region: 'oss-cn-hangzhou',
            accessKeyId: 'id9o2U3302dkaHyG',
            accessKeySecret: 'E9Se39NNmbXK7SaoO1jqbvbw1uaB51',
            bucket: 'itopvm'
        });
        GoodList()
    }
});