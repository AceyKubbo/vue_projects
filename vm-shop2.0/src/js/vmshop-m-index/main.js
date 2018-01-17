/**
 * Created by apple on 17/10/27.
 */
require.config({
    baseUrl : '.',
    paths : {
        'jquery' : ['https://cdn.bootcss.com/jquery/3.1.1/jquery','js/lib/jquery-1.10.2.min'],
        'bootstrap' : 'http://cdn.bootcss.com/bootstrap/3.3.0/js/bootstrap.min',
        'eap' : 'js/lib/eap',
        'layer':'js/lib/layer_mobile',
        'md5':'js/lib/md5',
        'vue':'js/lib/vue',
        'utils':'js/lib/utils',
        // 微信js-sdk
        'jweixin':'js/lib/jweixin-1.2.0'
    },
    shim : {
        'bootstrap':['jquery'],
        'layer':['jquery']
    }
});