define(['utils'],function (utils) {
    /**
     * value: 请求类型@接口地址/
     * 请求类型:json/string
     */
    var api = utils.Map();
    api.put("shop@query","json#/api/shop/data/query");
    api.put("stats@query","json#/api/stats/data/query");
    api.put("shop@refund","json#/api/shop/oper/refund");
    api.put("uum@vcode","string#/api/uum/security/vcode");
    api.put("uum@authTenant","string#/api/uum/security/authTenant");
    api.put("shop@excel","download#/api/shop/data/excel");
    api.put("shop@getOrderDetail","json#/api/shop/order/PARAMS/getOrderDetail");
    api.put("stock@query","json#/api/stock/data/query");
    api.put("stock@access","string#/api/stock/operator/access");
    api.put("delivery@query","json#/api/delivery/query");

    return api;
});