require.config({
    baseUrl : '.',
    paths : {
        'jquery' : 'plugins/jquery.min',
        'jquery-ui':'https://cdn.bootcss.com/jqueryui/1.12.1/jquery-ui.min',
        'bootstrap' : 'plugins/bootstrap/js/bootstrap',
        'aliyun-oss':'http://gosspublic.alicdn.com/aliyun-oss-sdk-4.4.4.min',
        'eap' : 'js/lib/eap',
        'api' : 'js/lib/webapi',
        'layer':'js/lib/layer',
        'utils' : 'js/lib/utils',
        'md5':'js/lib/md5',
        // 图表插件
        'echarts':'https://cdn.bootcss.com/echarts/3.6.2/echarts.min',
        //mvvm 数据模型框架
        'vue':'https://cdn.bootcss.com/vue/2.4.2/vue',
        // 插件js
        'app':'js/lib/app',
        'layout':'js/lib/layout',
        'jquery-blockui':'plugins/jquery.blockui.min',
        'datetimepicker':'plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker',
        'slimscroll':'plugins/jquery-slimscroll/jquery.slimscroll',
        'counterup':'plugins/counterup/jquery.counterup',
        'waypoints':'plugins/counterup/jquery.waypoints.min',
        'fileinput':'plugins/bootstrap-fileinput/bootstrap-fileinput',
        'form-validation':'plugins/form-validation',
        'jstree':'https://cdn.bootcss.com/jstree/3.3.4/jstree.min',
        'amap':'http://webapi.amap.com/maps?v=1.3&key=828971ce3e8ccedca03e9fdbeb454d60',
        'codemodel':'js/lib/codeModel',
        'page':'js/lib/jqPaginator',
        'tools':'js/lib/VueTools',
        'highcharts':'js/lib/highcharts'
    },
    shim : {
        'bootstrap':['jquery'],
        'layer':['jquery'],
        'app':['jquery','jquery-ui','jquery-blockui'],
        'layout':['app','slimscroll'],
        'datetimepicker':['jquery','bootstrap'],
        'slimscroll':['jquery'],
        'counterup':['jquery','waypoints'],
        'fileinput':['jquery'],
        'form-validation':['jquery','validate','app'],
        'jstree':['jquery'],
        'page':['jquery']
    },
    waitSeconds:0
});