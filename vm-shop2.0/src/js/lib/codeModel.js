/**
 * Created by apple on 17/12/13.
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
    //库存类
    retMsg.put("72001","超出最大容量!");
    retMsg.put("72002","库存不足!");
    //管理类
    retMsg.put("20001","密码不正确");
    retMsg.put("20002","验证码不匹配!");
    retMsg.put("20003","发送验证码失败!");
    retMsg.put("20004","用户已存在!");
    retMsg.put("20005","用户不存在!");

    return {
        retMsg:retMsg
    };
})
