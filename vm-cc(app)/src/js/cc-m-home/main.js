require.config({
    baseUrl : '.',
    paths : {
        'jquery' : 'https://cdn.bootcss.com/jquery/3.1.1/jquery',
        'bootstrap' : 'http://cdn.bootcss.com/bootstrap/3.0.0/js/bootstrap.min',
        'eap' : 'js/lib/eap',
        'vue':'js/lib/vue',
        'layer':'js/lib/layer_mobile',
        'utils':'js/lib/utils',
        'weui' : 'js/lib/jquery-weui'
    },
    shim : {
        'bootstrap':['jquery'],
        'weui':['jquery'],
    }
});