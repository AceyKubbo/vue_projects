/**
 * Created by 贤凌 on 2017-11-20.
 */
define(['utils'],function (utils) {
    /**
     * 返回消息解析
     */
    var retMsg = utils.Map();
    retMsg.put("0","成功!");
    //系统类
    retMsg.put("97","无返回值!");
    retMsg.put("98","请求超时!");
    retMsg.put("99","无可用服务!");
    retMsg.put("100","请求错误!");
    retMsg.put("101","非法访问!");
    retMsg.put("102","密钥错误!");
    retMsg.put("103","用户未登录!");
    retMsg.put("104","参数校验失败!");
    retMsg.put("105","无效token!");
    retMsg.put("106","系统异常!");
    retMsg.put("107","对象不存在!");
    retMsg.put("108","操作频繁!");
    retMsg.put("109","其他失败!");
    retMsg.put("110","对象已存在!");
    //支付类
    retMsg.put("46010","支付应用不存在!");
    retMsg.put("46011","支付渠道不存在!");
    retMsg.put("46012","支付渠道错误!");
    retMsg.put("46013","创建支付凭证失败!");
    retMsg.put("46014","凭证不存在!");
    retMsg.put("46015","订单已退款!");
    retMsg.put("46016","订单未支付!");
    retMsg.put("46099","其他错误!");
    //配送类
    retMsg.put("71001","送达人不匹配!");
    retMsg.put("71002","送达状态错误!");
    //商城类
    retMsg.put("70001","设备库存不足!");
    retMsg.put("70002","商品库存不足!");
    retMsg.put("70003","查询库存失败!");
    retMsg.put("70004","超出设备最大容量!");
    retMsg.put("70005","柜台类型错误!");
    retMsg.put("70006","柜台已存在!");
    retMsg.put("70007","柜台商品已存在!");
    retMsg.put("70008","未查询到柜台商品!");
    retMsg.put("70009","门店商品不存在!");
    retMsg.put("70010","门店商品已存在!");
    retMsg.put("70011","不支持多设备出货!");
    retMsg.put("70012","柜台商品已出货!");
    retMsg.put("70013","柜台商品不存在!");
    retMsg.put("70014","柜台商品数量已变更!");
    retMsg.put("70015","其他错误!");
    //库存类
    retMsg.put("72001","超出最大容量!");
    retMsg.put("72002","库存不足!");
    //管理类
    retMsg.put("20001","密码不正确");
    retMsg.put("20002","验证码不匹配!");
    retMsg.put("20003","发送验证码失败!");
    retMsg.put("20004","用户已存在!");
    retMsg.put("20005","用户不存在!");
    /**
     * 补换货类型
     */
    var actionType = utils.Map()
    actionType.put("batch_supply","一键补货")
    actionType.put("replenishment","补货")
    actionType.put("exchange","换货")
    /**
     * 出入库单类型
     */
    var stockOrderType= utils.Map();
    stockOrderType.put("1","入库");
    stockOrderType.put("2","出库");
    /**
     * 支付渠道
     */
    var payChannel = utils.Map();
    payChannel.put("alipay_wap","支付宝支付");
    payChannel.put("wx_pub","微信支付");
    payChannel.put("cash","现金");
    /**
     * 送货单状态
     */
    var deliveryStauts = utils.Map();
    deliveryStauts.put("1","待配送");
    deliveryStauts.put("3","配送中");
    deliveryStauts.put("4","已完成");
    /**
     * 销售记录-支付状态
     */
    var payState = utils.Map();
    payState.put('1',"未支付");
    payState.put('2',"已支付");
    payState.put('3',"有退款");
    /**
     * 销售记录-前台送货-出货状态
     */
    var deliveryState = utils.Map();
    deliveryState.put('1','待配送');
    deliveryState.put('2','待配送');
    deliveryState.put('3','配送中');
    deliveryState.put('4','已配送');
    /**
     * 销售记录-出货类型
     */
    var deliveryType = utils.Map();
    deliveryType.put("1","魔格自取");
    deliveryType.put("2","前台送货");
    /**
     * 销售记录-魔格自取-出货状态
     */
    var pickupStatus = utils.Map();
    pickupStatus.put('1','初始化')
    pickupStatus.put('2','出货中')
    pickupStatus.put('3','出货成功')
    pickupStatus.put('4','出货异常')
    pickupStatus.put('5','异常恢复')
    return{
        actionType:actionType,
        stockOrderType:stockOrderType,
        retMsg:retMsg,
        deliveryStauts:deliveryStauts,
        payState:payState,
        deliveryState:deliveryState,
        payChannel:payChannel,
        deliveryType:deliveryType,
        pickupStatus:pickupStatus,
    }
})
