require.config({
    baseUrl : '.',
    paths : {
        'jquery' : 'plugins/jquery.min',
        'bootstrap' : 'plugins/bootstrap/js/bootstrap',
        'eap' : 'js/lib/eap',
        'layer':'js/lib/layer',
        'md5':'js/lib/md5',
        'utils' : 'js/lib/utils',
        'vue':'https://cdn.bootcss.com/vue/2.4.2/vue',
        'page':"js/lib/jqPaginator",
        'datetimepicker':'plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker'
    },
    shim : {
        'bootstrap':['jquery'],
        'layer':['jquery'],
        "page":['jquery']
    },
    waitSeconds:0
});