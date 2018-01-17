/**
 * Created by apple on 17/11/18.
 */
var qrcodeManageInit
require(['jquery', 'vue', 'eap', 'layer'], function ($, Vue, eap, layer) {
    var qrcodeManage = new Vue({
        el: '#section-qrcodeManage',
        data: {
            qrCodeList: {},
            qrCodeDetail: {},
            editQrCodeDetail: {}
        },
        methods: {
            addQrCode: function () {
                qrcodeManage.qrCodeDetail = {
                    QR_NAME_: "",
                    QR_CODE_: ''
                }
                $('#addQrCodeId').modal('toggle')
            },
            submitAddQrCode: function () {
                var params = eap.copyApply({
                    accessToken: sessionStorage.getItem('AccessToken')
                }, qrcodeManage.qrCodeDetail)
                $.ajax({
                    url: '/api/shop/store/' + sessionStorage.getItem('STORE_ID_') + '/addQR',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    data: params,
                    success: function (datas) {
                        qrCodeList()
                        $('#addQrCodeId').modal('hide')
                    }
                })
            },
            // deleteQrCode:function (qrCode) {
            //     $.ajax({
            //         url:'/api/shop/data/crud',
            //         type:'POST',
            //         dataType:'json',
            //         async :false,
            //         data:{
            //             accessToken:sessionStorage.getItem('AccessToken'),
            //             dataModelName:"T_SHOP_QR",
            //             deleteKey:qrCode.ID_
            //         },
            //         success:function (datas) {
            //             qrCodeList()
            //             $('#addQrCodeId').modal('hide')
            //         }
            //     })
            // }
            editQrCode: function (qrCode) {
                $('#editQrCodeId').modal('toggle')
                qrcodeManage.editQrCodeDetail = qrCode
            },
            submitEditQrCode: function (editQrCodeDetail) {
                $.ajax({
                    url: '/api/shop/data/crud',
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    data: {
                        accessToken: sessionStorage.getItem('AccessToken'),
                        dataModelName: "T_SHOP_QR",
                        ID_: editQrCodeDetail.ID_,
                        QR_NAME_: editQrCodeDetail.QR_NAME_,
                        QR_CODE_: editQrCodeDetail.QR_CODE_
                    },
                    success: function (datas) {
                        if (datas.head.RETCODE != '0') {
                            layer.msg(datas.head.RETMSG)
                            return
                        }
                        qrCodeList()
                        $('#editQrCodeId').modal('hide')
                    }
                })
            }
        }
    })
    var qrCodeList = function (params) {
        params = {
            dataModelName: "V_SHOP_QR",
            accessToken: sessionStorage.getItem('AccessToken'),
            COUNTER_TYPE_: 'net',
            STORE_ID_: sessionStorage.getItem('STORE_ID_')
        }
        $.ajax({
            url: '/api/shop/data/query',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: params,
            success: function (datas) {
                if (datas.head.RETCODE != '0') {
                    layer.msg(datas.head.RETMSG)
                    return
                }
                qrcodeManage.qrCodeList = datas.data
            }
        })
    }
    qrcodeManageInit = function () {
        qrCodeList()
    }
})