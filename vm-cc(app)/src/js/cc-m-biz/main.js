/**
 * Created by apple on 17/9/7.
 */
require.config({
    baseUrl : '.',
    paths : {
        'jquery' : 'js/lib/jquery-1.10.2.min',
        // 'bootstrap' : 'js/lib/bootstrap.min',
        'bootstrap' : 'http://cdn.bootcss.com/bootstrap/3.0.0/js/bootstrap.min',
        'eap' : 'js/lib/eap',
        'layer':'js/lib/layer_mobile',
        'vue':'js/lib/vue',
        'utils':'js/lib/utils',
        'weui':'js/lib/jquery-weui',
        'jweixin':'js/lib/jweixin-1.2.0',
        'codeModel':'js/lib/codeModel',
    },
    shim : {
        'bootstrap':['jquery'],
        'layer':['jquery'],
        'weui':['jquery'],
    }
})