/**
 * Created by 贤凌 on 2017-12-19.
 */
define(['jquery','utils','eap','vue'],function ($, utils,eap,Vue) {
    Vue.config.productionTip = false;
    Vue.config.devtools = true;//是否启用devtools
    /**
     * 分页加载控件
     * page:{id:控件ID}
     * loader:加载函数,在父组件中定义函数内容
     */
    Vue.component("page",{
        props:['page'],
        template:'<div class="vm_dataTables_bottom"><div class="row">' +
        '<div class="col-md-5 col-sm-5">'+
        '<div class="vm_dataTables_length">每页显示'+
        '<select class="form-control input-sm input-xsmall input-inline" v-model.number="config.pageSize" @change="selectPageSize(config)">'+
        '<option>10</option>'+
        '<option>20</option>'+
        '<option>50</option>'+
        '条</select>'+
        '共计<b>{{config.totalCounts}}</b> 条'+
        '</div>'+
        '</div>'+
        '<div class="col-md-7 col-sm-7">'+
        '<div :id="id" class="vm_dataTables_pagenonstop">'+'</div>'+
        '</div>'+
        '</div>'+
        '</div>',
        data:function(){
            this.id = 'page-'+eap.uuid();
            this.$set(this.page,"pageSize",this.page.pageSize||20)
            this.$set(this.page,"totalCounts",this.page.totalCounts||0)
            return {
                config:this.page
            };
        },
        methods:{
            selectPageSize:function (config) {
                eap.pageOption("#"+this.id,{
                    pageSize:config.pageSize
                })
                this.$emit('loader')
            },
            init:function () {
                if(this.config.exist)return;
                this.$nextTick(function () {
                    var _this = this;
                    eap.postPage(this.id,function(index,op,type) {
                        _this.config.currentPage = index
                        _this.config.index =index>0?_this.config.pageSize*(index-1):0
                        if(type!="init")_this.$emit('loader');
                    },this.config)
                    this.config.changeOption = function () {
                        eap.pageOption("#"+_this.id,_this.config)
                    }
                    this.config.exist = true;
                })
            }
        }
    });
    /**
     * 时间控件
     * date-value:获取时间值
     * format:时间格式
     * refresh:回调函数,在父组件中定义函数内容
     */
    Vue.component("picker",{
        props:["date","format"],
        template:'<input type="text" :id="id" class="form-control form_datetime" v-model="picker.time">',
        data:function () {
            this.id = 'picker-'+eap.uuid()
            this.$set(this.date,"time",this.date.time||"")
            return {
                picker:this.date,
            }
        },
        methods:{
            init:function () {
                if(this.exist)return;
                var _this = this;
                this.$nextTick(function () {
                    eap.datetimepicker("#"+this.id,function(e) {
                        _this.picker.time = e.target.value+(_this.format?"":" 00:00:00")
                        _this.$emit('refresh');
                    });
                    _this.exist = true;
                })
            }
        }
    })
    /**
     * 选择商品
     */
    // Vue.component("goodselect",{
    //     props:[],
    //     data:function () {
    //
    //     },
    //     methods:{
    //         init:function () {
    //
    //         }
    //     }
    // })
})
